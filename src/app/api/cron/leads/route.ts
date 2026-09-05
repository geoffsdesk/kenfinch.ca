import { NextRequest, NextResponse } from 'next/server';
import { listLeads, patchLead, getSystemState, setSystemState, nowIso } from '@/lib/leads/store';
import {
  sendMail,
  sendSms,
  smsConfigured,
  checkinHtml,
  checkinSmsText,
  digestHtml,
  KEN_EMAIL,
  OVERSIGHT_EMAIL,
  TORONTO_TZ,
} from '@/lib/leads/notify';
import { STATUS_LABELS, isTestSubmission, type LeadRecord } from '@/lib/leads/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Hourly lead automation (called by .github/workflows/lead-automation.yml).
 *
 *  - Sends the 48-hour "did Ken reach you?" check-in (email, plus SMS when
 *    Twilio is configured) to leads that are still new/contacted, only during
 *    polite hours in Toronto.
 *  - Once per day after 08:00 Toronto, emails the lead digest to Geoff and Ken.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` or `?key=<CRON_SECRET>`.
 */

function torontoParts(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TORONTO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: parseInt(get('hour'), 10) % 24, weekday: get('weekday') };
}

/** Business days between two instants (Mon-Fri, Toronto). */
function businessDaysSince(iso: string, now = new Date()): number {
  const start = new Date(iso);
  let days = 0;
  const cursor = new Date(start);
  while (cursor < now) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const wd = new Intl.DateTimeFormat('en-CA', { timeZone: TORONTO_TZ, weekday: 'short' }).format(cursor);
    if (wd !== 'Sat' && wd !== 'Sun' && cursor <= now) days += 1;
  }
  return days;
}

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization') ?? '';
  const key = req.nextUrl.searchParams.get('key') ?? '';
  return header === `Bearer ${secret}` || key === secret;
}

/** Quarantine any test submissions that slipped in before the filter existed. */
async function quarantineTestLeads(leads: LeadRecord[]) {
  const stale = leads.filter((l) => l.status !== 'spam' && isTestSubmission(l.name, l.email));
  for (const l of stale) {
    await patchLead(l.id, {
      status: 'spam',
      statusUpdatedAt: nowIso(),
      'followUp.checkinSentAt': l.followUp?.checkinSentAt ?? nowIso(),
      notes: [...(l.notes ?? []), { at: nowIso(), text: 'Marked spam automatically: test submission.', by: 'system' }],
    });
    l.status = 'spam';
  }
  return stale.length;
}

async function runCheckins(leads: LeadRecord[], now: Date) {
  const { hour } = torontoParts(now);
  const polite = hour >= 9 && hour < 20;
  const results: string[] = [];
  if (!polite) return { skipped: 'outside 09:00-20:00 Toronto', sent: results };

  const due = leads.filter(
    (l) =>
      l.id &&
      l.followUp?.token &&
      !l.followUp.checkinSentAt &&
      (l.status === 'new' || l.status === 'contacted') &&
      l.email &&
      new Date(l.followUp.checkinDueAt) <= now,
  );
  for (const lead of due) {
    const patch: Record<string, unknown> = {};
    try {
      await sendMail({ to: lead.email, replyTo: KEN_EMAIL, subject: 'Quick check-in from Ken Finch', html: checkinHtml(lead, lead.id) });
      patch['followUp.checkinSentAt'] = nowIso();
      if (smsConfigured() && lead.phone) {
        try {
          await sendSms(lead.phone, checkinSmsText(lead));
        } catch (err) {
          patch['notify.errors'] = [...(lead.notify?.errors ?? []), `checkin-sms: ${(err as Error).message}`];
        }
      }
      results.push(lead.id);
    } catch (err) {
      patch['notify.errors'] = [...(lead.notify?.errors ?? []), `checkin-email: ${(err as Error).message}`];
    }
    await patchLead(lead.id, patch);
  }
  return { sent: results };
}

async function runDigest(leads: LeadRecord[], now: Date, force = false) {
  const { date, hour } = torontoParts(now);
  const state = await getSystemState();
  if (!force && (hour < 8 || state.lastDigestDate === date)) return { skipped: `not due (hour ${hour}, last ${state.lastDigestDate ?? 'never'})` };

  const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
  const active = leads.filter((l) => l.status !== 'spam' && l.status !== 'won' && l.status !== 'lost');
  const newLeads = leads.filter((l) => new Date(l.createdAt) >= dayAgo);
  const stale = active.filter((l) => l.status === 'new' && businessDaysSince(l.createdAt, now) >= 1);
  const saidNo = active.filter((l) => l.followUp?.checkinReply === 'no' && l.followUp.checkinRepliedAt && new Date(l.followUp.checkinRepliedAt) >= dayAgo);
  const dueToday = active.filter((l) => l.nextFollowUpAt && l.nextFollowUpAt.slice(0, 10) <= date);
  const counts: Record<string, number> = {};
  leads.forEach((l) => {
    const k = STATUS_LABELS[l.status] ?? l.status;
    counts[k] = (counts[k] ?? 0) + 1;
  });

  const dateLabel = new Intl.DateTimeFormat('en-CA', { timeZone: TORONTO_TZ, dateStyle: 'full' }).format(now);
  const attention = stale.length + saidNo.length;
  await sendMail({
    to: [OVERSIGHT_EMAIL, KEN_EMAIL],
    subject: `Lead digest ${date}: ${newLeads.length} new, ${attention} need attention`,
    html: digestHtml({ dateLabel, newLeads, stale, saidNo, dueToday, counts }),
  });
  await setSystemState({ lastDigestDate: date, lastDigestAt: nowIso() });
  return { sent: true, newLeads: newLeads.length, stale: stale.length, saidNo: saidNo.length, dueToday: dueToday.length };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const now = new Date();
  const force = req.nextUrl.searchParams.get('digest') === 'force';
  try {
    const leads = await listLeads(500);
    const quarantined = await quarantineTestLeads(leads);
    const checkins = await runCheckins(leads, now);
    const digest = await runDigest(leads, now, force);
    await setSystemState({ lastRunAt: nowIso() });
    return NextResponse.json({ ok: true, at: now.toISOString(), leads: leads.length, quarantined, checkins, digest });
  } catch (err) {
    console.error('lead automation failed:', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

export const POST = GET;
