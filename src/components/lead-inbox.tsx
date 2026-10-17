"use client";

/**
 * Lead inbox for /ken: every lead from every form, with status, notes and
 * follow-up dates Ken can update from his phone, plus the automatic 48-hour
 * check-in replies so Geoff can see whether follow-up actually happened.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Inbox, Phone, Mail, ChevronDown, ChevronUp, Flame, AlertTriangle, CheckCircle2, XCircle, RefreshCw, ShieldAlert } from 'lucide-react';
import { LEAD_STATUSES, STATUS_LABELS, TYPE_LABELS, buyerLabel, type LeadRecord, type LeadStatus, type LeadType } from '@/lib/leads/types';
import { REASON_LABELS } from '@/lib/leads/spam';
import { cn } from '@/lib/utils';
import { attributionLabel } from '@/lib/attribution';

type Automation = { lastRunAt: string | null; lastDigestAt: string | null; smsConfigured: boolean; kenMobileConfigured: boolean; cronConfigured: boolean };

const FILTERS = [
  { key: 'attention', label: 'Needs attention' },
  { key: 'new', label: 'New' },
  { key: 'open', label: 'In progress' },
  { key: 'all', label: 'All' },
  { key: 'closed', label: 'Won / lost' },
  { key: 'spam', label: 'Spam' },
] as const;
type FilterKey = (typeof FILTERS)[number]['key'];

function businessDaysSince(iso: string) {
  const start = new Date(iso);
  const now = new Date();
  let days = 0;
  const c = new Date(start);
  while (c < now) {
    c.setDate(c.getDate() + 1);
    const wd = c.getDay();
    if (wd !== 0 && wd !== 6 && c <= now) days += 1;
  }
  return days;
}

function ago(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** "42m" / "3h 10m" / "2d": how long the lead waited before Ken first moved it out of New. */
function responseTime(l: LeadRecord): string | null {
  if (l.status === 'new' || l.status === 'spam' || !l.statusUpdatedAt || !l.createdAt) return null;
  const ms = new Date(l.statusUpdatedAt).getTime() - new Date(l.createdAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d`;
}

/** Where a lead came from, shown next to its type: a gated valuation reads differently from an expert request. */
function sourceTag(l: LeadRecord): string | null {
  switch (l.source) {
    case 'valuation-gated':
      return 'gated estimate';
    case 'valuation-expert-opinion':
      return 'expert opinion';
    case 'affordability-form':
      return 'affordability';
    case 'renewal-form':
      return 'renewal';
    case 'never-list':
      return 'never list';
    default:
      return l.type === 'valuation' ? l.source : null;
  }
}

/**
 * Google Ads attributes a conversion to a click id, so the G1 count reconciliation compares Ads
 * "Lead form submitted" conversions per day with accepted leads that carry one of these.
 */
function hasGoogleClick(l: LeadRecord) {
  const a = l.attribution;
  return Boolean(a?.gclid || a?.gbraid || a?.wbraid);
}

function needsAttention(l: LeadRecord) {
  if (l.status === 'won' || l.status === 'lost' || l.status === 'spam') return false;
  if (l.followUp?.checkinReply === 'no') return true;
  if (l.status === 'new' && businessDaysSince(l.createdAt) >= 1) return true;
  if (l.nextFollowUpAt && l.nextFollowUpAt <= new Date().toISOString().slice(0, 10)) return true;
  return false;
}

const TYPE_COLORS: Record<LeadType, string> = {
  buyer: 'bg-amber-100 text-amber-900',
  contact: 'bg-sky-100 text-sky-900',
  valuation: 'bg-violet-100 text-violet-900',
  popup: 'bg-slate-100 text-slate-700',
};

/** Held for review: scored as possible spam and not yet released by Ken. */
function isReviewHeld(l: LeadRecord) {
  return l.spam?.verdict === 'review' && !l.spam.releasedAt;
}

function isTestLead(l: LeadRecord) {
  return !!l.spam?.reasons.some((r) => r.rule === 'test');
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-red-100 text-red-800',
  contacted: 'bg-blue-100 text-blue-800',
  qualified: 'bg-indigo-100 text-indigo-800',
  application_started: 'bg-purple-100 text-purple-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-slate-200 text-slate-700',
  spam: 'bg-slate-200 text-slate-500',
};

export function LeadInbox({ password }: { password: string }) {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('attention');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const call = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await fetch('/api/dashboard/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ...payload }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return res.json();
    },
    [password],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await call({ op: 'list' });
      setLeads(json.leads);
      setAutomation(json.automation);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    void load();
  }, [load]);

  // Deep link from Ken's SMS / nudge email: /ken?lead=<id> opens that lead.
  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get('lead');
      if (id) {
        setFilter('all');
        setOpen(id);
      }
    } catch {
      /* no window */
    }
  }, []);

  async function update(id: string, payload: Record<string, unknown>) {
    setBusy(id);
    try {
      await call({ id, ...payload });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const visible = useMemo(() => {
    switch (filter) {
      case 'attention':
        return leads.filter(needsAttention);
      case 'new':
        return leads.filter((l) => l.status === 'new');
      case 'open':
        return leads.filter((l) => ['contacted', 'qualified', 'application_started'].includes(l.status));
      case 'closed':
        return leads.filter((l) => ['won', 'lost'].includes(l.status));
      case 'spam':
        return leads.filter((l) => l.status === 'spam');
      default:
        return leads;
    }
  }, [leads, filter]);

  const counts = useMemo(
    () => ({
      attention: leads.filter(needsAttention).length,
      new: leads.filter((l) => l.status === 'new').length,
      open: leads.filter((l) => ['contacted', 'qualified', 'application_started'].includes(l.status)).length,
      all: leads.length,
      closed: leads.filter((l) => ['won', 'lost'].includes(l.status)).length,
      spam: leads.filter((l) => l.status === 'spam').length,
      // Accepted (not spam, not held) leads with a Google click id: the figure Ads conversions must match.
      googleClick: leads.filter((l) => l.status !== 'spam' && !isReviewHeld(l) && hasGoogleClick(l)).length,
    }),
    [leads],
  );

  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          <h2 className="font-headline text-xl font-bold">Lead Inbox</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {automation && (
            <span className="hidden md:inline">
              Automation: {automation.cronConfigured ? 'on' : 'not configured'}
              {automation.lastRunAt ? ` · last run ${ago(automation.lastRunAt)}` : ''}
              {automation.lastDigestAt ? ` · digest ${ago(automation.lastDigestAt)}` : ''}
              {' · SMS '}
              {automation.smsConfigured && automation.kenMobileConfigured ? 'on' : 'off'}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              filter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted',
            )}
          >
            {f.label} <span className="opacity-70">({counts[f.key]})</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mb-4" title="Google Ads reports conversions per day, never per transaction_id; the weekly reconciliation compares its Lead form submitted count with this figure by day">
        Google click leads: <span className="font-semibold text-foreground">{counts.googleClick}</span> accepted leads carry a gclid, gbraid or wbraid (the Ads conversion reconciliation figure).
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <Card className="border-0 shadow-md">
        <CardContent className="p-0 divide-y">
          {loading && leads.length === 0 ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : visible.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground text-center">
              {filter === 'attention' ? 'Nothing needs attention. Every lead has been touched.' : 'No leads in this view.'}
            </p>
          ) : (
            visible.map((l) => {
              const attention = needsAttention(l);
              const isOpen = open === l.id;
              const stale = l.status === 'new' ? businessDaysSince(l.createdAt) : 0;
              const source = sourceTag(l);
              const responded = responseTime(l);
              return (
                <div key={l.id} className={cn('p-4', attention && 'bg-red-50/60')} id={`lead-${l.id}`}>
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', TYPE_COLORS[l.type])}>
                          {TYPE_LABELS[l.type]}
                          {source && <span className="ml-1 font-normal normal-case tracking-normal opacity-80">· {source}</span>}
                        </span>
                        {responded && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800" title="Time from submission to the first status change">
                            first response {responded}
                          </span>
                        )}
                        {l.hot && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700"><Flame className="h-3 w-3" /> HOT</span>}
                        {l.followUp?.checkinReply === 'no' && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700"><XCircle className="h-3 w-3" /> Lead says not contacted</span>}
                        {l.followUp?.checkinReply === 'yes' && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700"><CheckCircle2 className="h-3 w-3" /> Lead confirmed contact</span>}
                        {stale >= 1 && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700"><AlertTriangle className="h-3 w-3" /> {stale} business day{stale > 1 ? 's' : ''} untouched</span>}
                        {isReviewHeld(l) && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700"><ShieldAlert className="h-3 w-3" /> Possible spam · score {l.spam!.score}</span>}
                        {l.status === 'spam' && l.spam && (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {isTestLead(l) ? 'Test submission' : `Spam · score ${l.spam.score}`}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold mt-1">{l.name}</p>
                      {l.spam && l.spam.reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {l.spam.reasons.slice(0, 4).map((r) => (
                            <span key={r.rule} className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono" title={r.detail}>{REASON_LABELS[r.rule] ?? r.rule}</span>
                          ))}
                          {l.spam.reasons.length > 4 && <span className="text-[11px] text-muted-foreground">+{l.spam.reasons.length - 4} more</span>}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">{l.summary}</p>
                      <div className="flex gap-4 mt-1 text-sm flex-wrap">
                        {l.phone && <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Phone className="h-3.5 w-3.5" />{l.phone}</a>}
                        {l.email && <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Mail className="h-3.5 w-3.5" />{l.email}</a>}
                        <span className="text-muted-foreground">{ago(l.createdAt)}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{attributionLabel(l.attribution)}</span>
                        {hasGoogleClick(l) && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-800" title="Carries a gclid, gbraid or wbraid: Google Ads can attribute a conversion to this lead">
                            Google click
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={l.status}
                        disabled={busy === l.id}
                        onChange={(e) => update(l.id, { op: 'status', status: e.target.value })}
                        className={cn('rounded-md border px-2 py-1.5 text-sm font-medium', STATUS_COLORS[l.status])}
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <Button variant="ghost" size="sm" onClick={() => setOpen(isOpen ? null : l.id)} aria-label="Details">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <LeadDetail
                      lead={l}
                      busy={busy === l.id}
                      onNote={(t) => update(l.id, { op: 'note', text: t })}
                      onFollowUp={(d) => update(l.id, { op: 'followup', at: d })}
                      onRelease={() => update(l.id, { op: 'release' })}
                    />
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function LeadDetail({
  lead,
  busy,
  onNote,
  onFollowUp,
  onRelease,
}: {
  lead: LeadRecord;
  busy: boolean;
  onNote: (t: string) => void;
  onFollowUp: (d: string | null) => void;
  onRelease: () => void;
}) {
  const [note, setNote] = useState('');
  const [date, setDate] = useState(lead.nextFollowUpAt ?? '');
  const d = lead.details as Record<string, unknown>;
  const spam = lead.spam;
  const held = lead.status === 'spam' || isReviewHeld(lead);
  const releasable = held && !isTestLead(lead);
  const confirmationState = lead.followUp?.confirmationSentAt
    ? 'Sent'
    : isReviewHeld(lead)
      ? 'Held (possible spam)'
      : lead.status === 'spam'
        ? 'Not sent (spam)'
        : 'Not sent';

  const detailRows: [string, string][] =
    lead.type === 'buyer'
      ? [
          ['Goal', buyerLabel('goal', d.goal as string)],
          ['Timeline', buyerLabel('timeline', d.timeline as string)],
          ['Price range', buyerLabel('priceRange', d.priceRange as string)],
          ['Areas', Array.isArray(d.areas) ? (d.areas as string[]).join(', ') : ''],
          ['First-time buyer', d.firstTimeBuyer === 'yes' ? 'Yes' : 'No'],
          ['Down payment', buyerLabel('downPayment', d.downPayment as string)],
          ['Income', buyerLabel('income', d.income as string)],
          ['Employment', buyerLabel('employment', d.employment as string)],
          ['Credit', buyerLabel('credit', d.credit as string)],
          ['Pre-approved already', d.preApproved === 'yes' ? 'Yes' : d.preApproved === 'no' ? 'No' : 'Not provided'],
          ['Message', (d.message as string) || ''],
          ['Finmo externalId', lead.id],
        ]
      : lead.type === 'valuation'
        ? [
            ['Address', String(d.address ?? '')],
            ['AI estimate', typeof d.estimate === 'number' ? `$${d.estimate.toLocaleString()}` : 'n/a'],
            ['Confidence', typeof d.confidence === 'number' ? `${Math.round(d.confidence * 100)}%` : 'n/a'],
            ...Object.entries((d.property as Record<string, unknown>) || {}).map(([k, v]) => [k, String(v)] as [string, string]),
          ]
        : lead.type === 'contact'
          ? [
              ['Interest', (d.intent as string) || 'Not specified'],
              ['Message', (d.message as string) || ''],
            ]
          : [['Requested', String(d.asset ?? '')]];

  return (
    <div className="mt-4 grid gap-6 md:grid-cols-2 border-t pt-4">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Details</p>
          <dl className="grid grid-cols-[140px_1fr] gap-y-1 text-sm">
            {detailRows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="break-words">{v}</dd>
              </div>
            ))}
            <dt className="text-muted-foreground">Form</dt>
            <dd>{lead.source} {lead.page && <span className="text-muted-foreground">({lead.page})</span>}</dd>
            <dt className="text-muted-foreground">Marketing</dt>
            <dd>
              {attributionLabel(lead.attribution)}
              {lead.attribution?.utm_term && <span className="text-muted-foreground"> (keyword: {lead.attribution.utm_term})</span>}
              {lead.attribution?.landingPage && <span className="text-muted-foreground"> landed on {lead.attribution.landingPage}</span>}
            </dd>
            <dt className="text-muted-foreground">Google click id</dt>
            <dd>
              {hasGoogleClick(lead)
                ? [lead.attribution?.gclid && 'gclid', lead.attribution?.gbraid && 'gbraid', lead.attribution?.wbraid && 'wbraid'].filter(Boolean).join(', ') + ' (counts toward the Ads reconciliation)'
                : 'none'}
            </dd>
            <dt className="text-muted-foreground">Spam check</dt>
            <dd>{spam ? `${spam.verdict} · score ${spam.score}${spam.releasedAt ? ' · released by Ken' : ''}` : 'not assessed'}</dd>
            {spam && spam.reasons.length > 0 && (
              <>
                <dt className="text-muted-foreground">Signals</dt>
                <dd className="break-words">
                  {spam.reasons.map((r) => `${REASON_LABELS[r.rule] ?? r.rule} (${r.weight > 0 ? '+' : ''}${r.weight})${r.detail ? ': ' + r.detail : ''}`).join('; ')}
                </dd>
              </>
            )}
            {lead.request && (
              <>
                <dt className="text-muted-foreground">IP</dt>
                <dd>{`${lead.request.ip ?? 'unknown'}${lead.request.ipSource ? ` (${lead.request.ipSource})` : ''}${lead.request.scrubbedAt ? ' · scrubbed' : ''}`}</dd>
                <dt className="text-muted-foreground">User agent</dt>
                <dd className="break-all text-xs">{(lead.request.ua ?? '').slice(0, 120)}</dd>
                <dt className="text-muted-foreground">Language</dt>
                <dd>{lead.request.lang ?? ''}</dd>
              </>
            )}
            {lead.client && (
              <>
                <dt className="text-muted-foreground">Client</dt>
                <dd>{`webdriver ${lead.client.webdriver} · ${lead.client.interactions} interactions · ${lead.client.msSinceMount} ms on page`}</dd>
              </>
            )}
            <dt className="text-muted-foreground">Confirmation email</dt>
            <dd>{confirmationState}</dd>
            <dt className="text-muted-foreground">48h check-in</dt>
            <dd>
              {lead.followUp?.checkinSentAt ? `Sent ${ago(lead.followUp.checkinSentAt)}` : `Due ${new Date(lead.followUp?.checkinDueAt ?? lead.createdAt).toLocaleString()}`}
              {lead.followUp?.checkinReply ? ` · replied ${lead.followUp.checkinReply.toUpperCase()}` : ''}
            </dd>
            {lead.notify?.errors?.length > 0 && (
              <>
                <dt className="text-red-600">Delivery errors</dt>
                <dd className="text-red-600 text-xs">{lead.notify.errors.join('; ')}</dd>
              </>
            )}
          </dl>
        </div>
        {releasable && (
          <div>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`This will ${lead.status === 'spam' ? 'email Ken and ' : ''}send the confirmation email to ${lead.email}. Continue?`)) onRelease();
              }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
              {lead.status === 'spam' ? 'Not spam: release and notify' : 'Not spam: send confirmation'}
            </Button>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Next follow-up</p>
          <div className="flex gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-[180px]" />
            <Button size="sm" variant="outline" disabled={busy || !date} onClick={() => onFollowUp(date)}>Save</Button>
            {lead.nextFollowUpAt && <Button size="sm" variant="ghost" disabled={busy} onClick={() => { setDate(''); onFollowUp(null); }}>Clear</Button>}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity &amp; notes</p>
        <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {[...(lead.notes ?? [])].reverse().map((n, i) => (
            <li key={i} className="text-sm rounded-md bg-muted/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">{new Date(n.at).toLocaleString()} · {n.by}</span>
              <p>{n.text}</p>
            </li>
          ))}
          {(lead.notes ?? []).length === 0 && <li className="text-sm text-muted-foreground">No notes yet.</li>}
        </ul>
        <div className="flex gap-2">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Called, left voicemail…" className="min-h-[60px]" />
          <Button size="sm" disabled={busy || !note.trim()} onClick={() => { onNote(note.trim()); setNote(''); }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}
