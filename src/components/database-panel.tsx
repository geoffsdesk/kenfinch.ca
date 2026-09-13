"use client";

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Users, Mail, Pause, Play, Send } from 'lucide-react';
import type { DatabaseStats } from '@/lib/contacts/types';
import { SEGMENT_LABELS, CONTACT_STATUS_LABELS } from '@/lib/contacts/types';

const STEP_LABELS: Record<string, string> = { e1: '1. Renewal wave', e2: '2. 120-day window', e3: '3. Oakville market', e4: '4. Keep you on the list?' };

export function DatabasePanel({ password }: { password: string }) {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [segment, setSegment] = useState<string>('all');
  const [limit, setLimit] = useState<string>('');
  const [cap, setCap] = useState<string>('');
  const [testTo, setTestTo] = useState<string>('');
  const [testStep, setTestStep] = useState<string>('e1');
  const [testSegment, setTestSegment] = useState<string>('idx-prospect');

  const call = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch('/api/dashboard/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ...body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      return json;
    },
    [password],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const json = await call({ op: 'stats' });
      setStats(json.stats);
      setCap(String(json.stats.automation.hourlyCap));
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function act(label: string, body: Record<string, unknown>, describe: (r: Record<string, unknown>) => string) {
    setBusy(label);
    setMsg(null);
    try {
      const r = await call(body);
      setMsg(describe(r));
      await refresh();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const s = stats;
  const camp = s?.campaign;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Database &amp; reactivation campaign
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {!s ? (
          <p className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No data yet.'}</p>
        ) : s.total === 0 ? (
          <p className="text-sm text-muted-foreground">No contacts imported yet. Run <code>scripts/import-contacts.py</code> to load the CRM export.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Stat label="Contacts" value={s.total} />
              <Stat label="Emailable" value={s.emailable} hint="active, has email, consent known" />
              <Stat label="Phone only" value={s.phoneOnly} hint="Ken texts these" />
              <Stat label="Unsubscribed" value={s.byStatus.unsubscribed ?? 0} />
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">By segment</p>
                {Object.entries(s.bySegment).map(([k, v]) => (
                  <p key={k} className="flex justify-between text-muted-foreground">
                    <span>{SEGMENT_LABELS[k as keyof typeof SEGMENT_LABELS] ?? k}</span>
                    <span className="font-medium text-foreground">{v}</span>
                  </p>
                ))}
              </div>
              <div>
                <p className="font-semibold mb-1">By status</p>
                {Object.entries(s.byStatus).map(([k, v]) => (
                  <p key={k} className="flex justify-between text-muted-foreground">
                    <span>{CONTACT_STATUS_LABELS[k as keyof typeof CONTACT_STATUS_LABELS] ?? k}</span>
                    <span className="font-medium text-foreground">{v}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <p className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" /> Reactivation sequence
                {s.automation.paused && <span className="text-xs rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">Paused</span>}
              </p>
              {camp ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <Stat label="Enrolled" value={camp.enrolled} />
                  <Stat label="Due now" value={camp.dueNow} />
                  <Stat label="Finished" value={camp.finished} />
                  <Stat label="Converted" value={camp.converted} hint="filled a form" />
                  {Object.entries(STEP_LABELS).map(([k, label]) => (
                    <Stat key={k} label={label} value={camp.sentByStep[k] ?? 0} hint="sent" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nobody enrolled yet.</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-xs text-muted-foreground">Approved to send:</span>
                {Object.entries(STEP_LABELS).map(([k, label]) => {
                  const on = s.automation.enabledSteps?.includes(k);
                  return (
                    <label key={k} className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!on}
                        disabled={!!busy}
                        onChange={() => {
                          const next = on ? s.automation.enabledSteps.filter((x) => x !== k) : [...s.automation.enabledSteps, k];
                          act('steps', { op: 'steps', steps: next }, (r) => `Approved steps: ${(r.enabledSteps as string[]).join(', ') || 'none'}.`);
                        }}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Provider: <strong>{s.automation.provider ?? 'none configured'}</strong> &middot; cap {s.automation.hourlyCap}/hour, Mon-Fri 9-18 Toronto
                {s.automation.lastRunAt ? ` · last run ${new Date(s.automation.lastRunAt).toLocaleString('en-CA')} sent ${s.automation.lastRunSent}` : ''}
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Enrol segment</p>
                  <Select value={segment} onValueChange={setSegment}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All emailable contacts</SelectItem>
                      {Object.entries(SEGMENT_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Limit (blank = all)</p>
                  <Input className="w-[120px]" placeholder="e.g. 100" value={limit} onChange={(e) => setLimit(e.target.value)} />
                </div>
                <Button
                  size="sm"
                  disabled={!!busy}
                  onClick={() =>
                    act('enrol', { op: 'enrol', segment: segment === 'all' ? undefined : segment, limit: limit ? parseInt(limit, 10) : undefined }, (r) => `Enrolled ${r.enrolled} contacts.`)
                  }
                >
                  {busy === 'enrol' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Enrol
                </Button>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Emails per hour</p>
                  <Input className="w-[90px]" value={cap} onChange={(e) => setCap(e.target.value)} />
                </div>
                <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act('cap', { op: 'cap', hourlyCap: parseInt(cap, 10) }, (r) => `Cap set to ${r.hourlyCap}/hour.`)}>
                  Save cap
                </Button>
                {s.automation.paused ? (
                  <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act('resume', { op: 'resume' }, () => 'Resumed.')}>
                    <Play className="mr-2 h-4 w-4" /> Resume
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act('pause', { op: 'pause' }, () => 'Paused.')}>
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!!busy}
                  onClick={() => act('run', { op: 'run' }, (r) => `Sent ${(r.result as { sent?: number })?.sent ?? 0} now.`)}
                >
                  {busy === 'run' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send a batch now
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <p className="font-semibold text-sm">Send a test to yourself</p>
              <p className="text-xs text-muted-foreground">Renders the chosen email for a sample contact and sends it through the same path as the real campaign. Subject is prefixed with [TEST].</p>
              <div className="flex flex-wrap items-end gap-2">
                <Input className="w-[260px]" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                <Select value={testStep} onValueChange={setTestStep}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STEP_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={testSegment} onValueChange={setTestSegment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idx-prospect">Search-site opener</SelectItem>
                    <SelectItem value="sphere">Sphere opener</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" disabled={!!busy || !testTo} onClick={() => act('test', { op: 'test', to: testTo, step: testStep, segment: testSegment }, () => `Test sent to ${testTo}.`)}>
                  {busy === 'test' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send test
                </Button>
              </div>
            </div>
          </>
        )}
        {msg && <p className="text-sm">{msg}</p>}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-md bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
