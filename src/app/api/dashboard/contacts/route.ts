import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listContacts, importContacts, summarize, getCampaignState, setCampaignState, setContactStatus } from '@/lib/contacts/store';
import { contactImportRow } from '@/lib/contacts/types';
import { enrolContacts, runCampaigns } from '@/lib/campaigns/runner';
import { REACTIVATION_ID } from '@/lib/campaigns/reactivation';
import { mailProvider } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'kenfinch2026';

/**
 * Database + campaign controls for /ken and the import script.
 *
 *   { password, op: 'stats' }
 *   { password, op: 'import', batch, rows: ContactImportRow[] }      (<= 500 rows per call)
 *   { password, op: 'enrol', segment?: string, limit?: number }
 *   { password, op: 'pause' | 'resume' }
 *   { password, op: 'cap', hourlyCap: number }
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
      case 'run': {
        const result = await runCampaigns(new Date(), true);
        return NextResponse.json({ ok: true, result });
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
