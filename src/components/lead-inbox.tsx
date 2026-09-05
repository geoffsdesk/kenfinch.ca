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
import { Loader2, Inbox, Phone, Mail, ChevronDown, ChevronUp, Flame, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { LEAD_STATUSES, STATUS_LABELS, TYPE_LABELS, buyerLabel, type LeadRecord, type LeadStatus, type LeadType } from '@/lib/leads/types';
import { cn } from '@/lib/utils';

type Automation = { lastRunAt: string | null; lastDigestAt: string | null; smsConfigured: boolean; kenMobileConfigured: boolean; cronConfigured: boolean };

const FILTERS = [
  { key: 'attention', label: 'Needs attention' },
  { key: 'new', label: 'New' },
  { key: 'open', label: 'In progress' },
  { key: 'all', label: 'All' },
  { key: 'closed', label: 'Won / lost' },
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
        return leads.filter((l) => ['won', 'lost', 'spam'].includes(l.status));
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
      closed: leads.filter((l) => ['won', 'lost', 'spam'].includes(l.status)).length,
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
              return (
                <div key={l.id} className={cn('p-4', attention && 'bg-red-50/60')}>
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', TYPE_COLORS[l.type])}>{TYPE_LABELS[l.type]}</span>
                        {l.hot && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700"><Flame className="h-3 w-3" /> HOT</span>}
                        {l.followUp?.checkinReply === 'no' && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700"><XCircle className="h-3 w-3" /> Lead says not contacted</span>}
                        {l.followUp?.checkinReply === 'yes' && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700"><CheckCircle2 className="h-3 w-3" /> Lead confirmed contact</span>}
                        {stale >= 1 && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700"><AlertTriangle className="h-3 w-3" /> {stale} business day{stale > 1 ? 's' : ''} untouched</span>}
                      </div>
                      <p className="font-semibold mt-1">{l.name}</p>
                      <p className="text-sm text-muted-foreground">{l.summary}</p>
                      <div className="flex gap-4 mt-1 text-sm flex-wrap">
                        {l.phone && <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Phone className="h-3.5 w-3.5" />{l.phone}</a>}
                        {l.email && <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Mail className="h-3.5 w-3.5" />{l.email}</a>}
                        <span className="text-muted-foreground">{ago(l.createdAt)}</span>
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

                  {isOpen && <LeadDetail lead={l} busy={busy === l.id} onNote={(t) => update(l.id, { op: 'note', text: t })} onFollowUp={(d) => update(l.id, { op: 'followup', at: d })} />}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function LeadDetail({ lead, busy, onNote, onFollowUp }: { lead: LeadRecord; busy: boolean; onNote: (t: string) => void; onFollowUp: (d: string | null) => void }) {
  const [note, setNote] = useState('');
  const [date, setDate] = useState(lead.nextFollowUpAt ?? '');
  const d = lead.details as Record<string, unknown>;

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
            <dt className="text-muted-foreground">Source</dt>
            <dd>{lead.source} {lead.page && <span className="text-muted-foreground">({lead.page})</span>}</dd>
            <dt className="text-muted-foreground">Confirmation email</dt>
            <dd>{lead.followUp?.confirmationSentAt ? 'Sent' : 'Not sent'}</dd>
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
