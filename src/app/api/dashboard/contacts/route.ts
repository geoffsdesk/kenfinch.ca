import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listContacts, importContacts, summarize, getCampaignState, setCampaignState, setContactStatus, findContactByEmail } from '@/lib/contacts/store';
import { contactImportRow } from '@/lib/contacts/types';
import { enrolContacts, runCampaigns } from '@/lib/campaigns/runner';
import { REACTIVATION_ID, stepByKey, stepLinks } from '@/lib/campaigns/reactivation';
import { sendMail, BULK_MAIL_FROM } from '@/lib/mail';
import { KEN_EMAIL } from '@/lib/leads/notify';
import type { ContactRecord } from '@/lib/contacts/types';
import { mailProvider } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'kenfinch2026';

/**
 * Database + campaign controls for /ken and the import script.
 *
 *   { password, op: 'stats' }
 *   { password, op: 'import', batch, rows: ContactImportRow[] }      (<= 500 rows per call)
 *   { password, op: 'enrol', segment?: string, limit?: number }
 *   { password, op: 'pause' | 'resume' }
 *   { password, op: 'cap', hourlyCap: number }
 *   { password, op: 'steps', steps: string[] }                              (approved email steps, e.g. ['e1','e2'])
 *   { password, op: 'test', to: email, step: 'e1'|'e2'|'e3'|'e4', segment?: 'sphere'|'idx-prospect' }  (send a rendered sample to yourself)
 *   { password, op: 'run' }                                           (send one batch now, ignores the time window)
 *   { password, op: 'exclude' | 'reactivate', id }
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  if (body.password !== DASHBOARD_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    switch (body.op) {
      case 'stats': {
        const [contacts, state] = await Promise.all([listContacts(), getCampaignState()]);
        return NextResponse.json({ stats: summarize(contacts, REACTIVATION_ID, state, mailProvider()) });
      }
      case 'import': {
        const parsed = z.object({ batch: z.string().max(60).default('import'), rows: z.array(contactImportRow).max(500) }).safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Bad rows' }, { status: 400 });
        const result = await importContacts(parsed.data.rows, parsed.data.batch);
        return NextResponse.json({ ok: true, ...result });
      }
      case 'enrol': {
        const segment = typeof body.segment === 'string' && body.segment ? body.segment : undefined;
        const limit = typeof body.limit === 'number' && body.limit > 0 ? Math.floor(body.limit) : undefined;
        const enrolled = await enrolContacts({ segment, limit });
        return NextResponse.json({ ok: true, enrolled });
      }
      case 'pause':
      case 'resume': {
        await setCampaignState({ paused: body.op === 'pause' });
        return NextResponse.json({ ok: true });
      }
      case 'cap': {
        const cap = typeof body.hourlyCap === 'number' ? Math.max(0, Math.min(500, Math.floor(body.hourlyCap))) : NaN;
        if (Number.isNaN(cap)) return NextResponse.json({ error: 'Bad cap' }, { status: 400 });
        await setCampaignState({ hourlyCap: cap });
        return NextResponse.json({ ok: true, hourlyCap: cap });
      }
      case 'steps': {
        const steps = Array.isArray(body.steps) ? body.steps.filter((x): x is string => typeof x === 'string' && /^e[1-4]$/.test(x)) : null;
        if (!steps) return NextResponse.json({ error: 'Bad steps' }, { status: 400 });
        await setCampaignState({ enabledSteps: steps });
        return NextResponse.json({ ok: true, enabledSteps: steps });
      }
      case 'test': {
        const to = typeof body.to === 'string' ? body.to.trim() : '';
        const step = stepByKey(typeof body.step === 'string' ? body.step : 'e1');
        if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(to) || !step) return NextResponse.json({ error: 'Bad address or step' }, { status: 400 });
        const segment = body.segment === 'sphere' ? 'sphere' : 'idx-prospect';
        const now = new Date().toISOString();
        const sample: ContactRecord = {
          id: 'test', firstName: 'Geoff', lastName: 'Test', email: to, phone: '', segment, status: 'active',
          consent: { basis: 'express', source: 'test', reviewedByKen: true }, lastActivityYear: '2025', source: 'test', tags: [],
          token: '0123456789abcdef0123456789abcdef', campaign: null, leadId: null, importBatch: 'test', notes: [], createdAt: now, updatedAt: now,
        };
        const links = stepLinks(sample, step.key);
        const res = await sendMail({
          from: BULK_MAIL_FROM,
          to,
          replyTo: KEN_EMAIL,
          subject: `[TEST ${step.key} / ${segment}] ${step.subject(sample)}`,
          html: step.html(sample, links),
          headers: { 'List-Unsubscribe': `<${links.unsubscribe}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
          tag: `test-${step.key}`,
        });
        return NextResponse.json({ ok: true, id: res.id });
      }
      case 'run': {
        const result = await runCampaigns(new Date(), true);
        return NextResponse.json({ ok: true, result });
      }
      case 'unsubscribe-emails': {
        // Manual removals (people who replied asking to be removed, or no longer relevant).
        const emails = Array.isArray(body.emails) ? body.emails.filter((x): x is string => typeof x === 'string').map((e) => e.trim().toLowerCase()) : [];
        if (!emails.length) return NextResponse.json({ error: 'No emails' }, { status: 400 });
        const done: string[] = [];
        const missing: string[] = [];
        for (const e of emails) {
          const c = await findContactByEmail(e);
          if (!c) {
            missing.push(e);
            continue;
          }
          if (c.status !== 'unsubscribed') await setContactStatus(c.id, 'unsubscribed', 'Removed by Ken/Geoff (asked to be removed or no longer relevant).', 'ken');
          done.push(e);
        }
        return NextResponse.json({ ok: true, unsubscribed: done, notFound: missing });
      }
      case 'exclude':
      case 'reactivate': {
        const id = typeof body.id === 'string' ? body.id : '';
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        await setContactStatus(id, body.op === 'exclude' ? 'excluded' : 'active', body.op === 'exclude' ? 'Excluded by Ken.' : 'Reactivated by Ken.', 'ken');
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: 'Unknown op' }, { status: 400 });
    }
  } catch (err) {
    console.error('contacts api failed:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
