import { NextRequest, NextResponse } from 'next/server';
import { listLeads, setStatus, addNote, patchLead, getSystemState } from '@/lib/leads/store';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/leads/types';
import { smsConfigured, kenMobile } from '@/lib/leads/notify';

export const dynamic = 'force-dynamic';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'kenfinch2026';

/**
 * Lead inbox API for /ken. Same password gate as /api/dashboard.
 *
 *   { password, op: 'list' }
 *   { password, op: 'status', id, status }
 *   { password, op: 'note', id, text }
 *   { password, op: 'followup', id, at: 'YYYY-MM-DD' | null }
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
    const id = typeof body.id === 'string' ? body.id : '';
    switch (body.op) {
      case 'list': {
        const [leads, state] = await Promise.all([listLeads(300), getSystemState()]);
        return NextResponse.json({
          leads,
          automation: {
            lastRunAt: state.lastRunAt ?? null,
            lastDigestAt: state.lastDigestAt ?? null,
            smsConfigured: smsConfigured(),
            kenMobileConfigured: !!kenMobile(),
            cronConfigured: !!process.env.CRON_SECRET,
          },
        });
      }
      case 'status': {
        const status = body.status as LeadStatus;
        if (!id || !LEAD_STATUSES.includes(status)) return NextResponse.json({ error: 'Bad status' }, { status: 400 });
        await setStatus(id, status);
        return NextResponse.json({ ok: true });
      }
      case 'note': {
        const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : '';
        if (!id || !text) return NextResponse.json({ error: 'Bad note' }, { status: 400 });
        await addNote(id, text);
        return NextResponse.json({ ok: true });
      }
      case 'followup': {
        const at = body.at === null ? null : typeof body.at === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.at) ? body.at : undefined;
        if (!id || at === undefined) return NextResponse.json({ error: 'Bad date' }, { status: 400 });
        await patchLead(id, { nextFollowUpAt: at });
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: 'Unknown op' }, { status: 400 });
    }
  } catch (err) {
    console.error('leads api error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
