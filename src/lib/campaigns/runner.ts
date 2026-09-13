/**
 * Sends due campaign steps. Called from the hourly job.
 *
 * Guard rails:
 *  - only Monday-Friday, 09:00-18:00 Toronto
 *  - at most `hourlyCap` emails per run (default 8 = ~70/day, inside Resend's
 *    free tier; raise from the /ken Database panel once on Resend Pro)
 *  - global pause switch
 *  - contact must be active, have an email and a consent basis other than
 *    "unknown"; anyone who converted stops receiving the sequence
 */

import { sendMail, BULK_MAIL_FROM, mailProvider } from '@/lib/mail';
import { KEN_EMAIL, TORONTO_TZ } from '@/lib/leads/notify';
import { listContacts, patchContact, getCampaignState, setCampaignState } from '@/lib/contacts/store';
import { nowIso } from '@/lib/leads/store';
import type { ContactRecord } from '@/lib/contacts/types';
import { REACTIVATION_ID, REACTIVATION_STEPS, stepByKey, nextStepAfter, stepLinks } from './reactivation';

function torontoNow(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TORONTO_TZ, hour: '2-digit', hour12: false, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { hour: parseInt(get('hour'), 10) % 24, weekday: get('weekday'), date: `${get('year')}-${get('month')}-${get('day')}` };
}

export function isSendWindow(d = new Date()) {
  const { hour, weekday } = torontoNow(d);
  return !['Sat', 'Sun'].includes(weekday) && hour >= 9 && hour < 18;
}

/** Enrol active, emailable contacts in a segment (or all). Returns count. */
export async function enrolContacts(opts: { segment?: string; limit?: number; startAt?: Date }) {
  const contacts = await listContacts();
  const at = opts.startAt ?? new Date();
  let n = 0;
  for (const c of contacts) {
    if (opts.limit && n >= opts.limit) break;
    if (c.status !== 'active' || !c.email || c.consent.basis === 'unknown') continue;
    if (opts.segment && c.segment !== opts.segment) continue;
    if (c.campaign?.id === REACTIVATION_ID) continue;
    await patchContact(c.id, {
      campaign: { id: REACTIVATION_ID, enrolledAt: nowIso(), nextStep: REACTIVATION_STEPS[0].key, nextSendAt: at.toISOString(), sent: [], paused: false },
    });
    n += 1;
  }
  return n;
}

export async function setCampaignPaused(paused: boolean) {
  await setCampaignState({ paused });
}

export async function runCampaigns(now = new Date(), force = false) {
  const state = await getCampaignState();
  const { date } = torontoNow(now);
  if (state.paused) return { skipped: 'paused' };
  if (!force && !isSendWindow(now)) return { skipped: 'outside Mon-Fri 09:00-18:00 Toronto' };
  if (!mailProvider()) return { skipped: 'no email provider configured' };

  const contacts = await listContacts();
  const due = contacts
    .filter(
      (c) =>
        c.status === 'active' &&
        c.email &&
        c.consent.basis !== 'unknown' &&
        c.campaign?.id === REACTIVATION_ID &&
        !c.campaign.paused &&
        c.campaign.nextStep &&
        c.campaign.nextSendAt &&
        new Date(c.campaign.nextSendAt) <= now,
    )
    // most recently active contacts first: better early engagement signals for the new sending domain
    .sort((a, b) => (b.lastActivityYear || '').localeCompare(a.lastActivityYear || ''));

  const cap = Math.max(0, state.hourlyCap);
  const enabled = new Set(state.enabledSteps ?? ['e1']);
  const sent: string[] = [];
  const errors: string[] = [];
  let skippedSteps = 0;
  let waitingApproval = 0;
  for (const c of due) {
    if (sent.length >= cap) break;
    const step = stepByKey(c.campaign!.nextStep!);
    if (!step) continue;
    if (!enabled.has(step.key)) {
      waitingApproval += 1; // Ken has not approved this email yet; it sends once enabled
      continue;
    }
    const next = nextStepAfter(step.key);
    const scheduleNext = (from: Date) =>
      next ? new Date(from.getTime() + (next.dayOffset - step.dayOffset) * 86400000).toISOString() : null;

    if (step.skipIf?.(c)) {
      await patchContact(c.id, { 'campaign.nextStep': next?.key ?? null, 'campaign.nextSendAt': scheduleNext(now) });
      skippedSteps += 1;
      continue;
    }
    try {
      const links = stepLinks(c, step.key);
      const res = await sendMail({
        from: BULK_MAIL_FROM,
        to: c.email,
        replyTo: KEN_EMAIL,
        subject: step.subject(c),
        html: step.html(c, links),
        headers: {
          'List-Unsubscribe': `<${links.unsubscribe}>, <mailto:${KEN_EMAIL}?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tag: `${REACTIVATION_ID}-${step.key}`,
      });
      await patchContact(c.id, {
        'campaign.sent': [...c.campaign!.sent, { step: step.key, at: nowIso(), messageId: res.id }],
        'campaign.nextStep': next?.key ?? null,
        'campaign.nextSendAt': scheduleNext(now),
      });
      sent.push(c.id);
    } catch (err) {
      const msg = (err as Error).message;
      errors.push(`${c.id}: ${msg}`);
      // Hard bounces / invalid addresses: stop trying.
      if (/invalid|not a valid|bounce/i.test(msg)) {
        await patchContact(c.id, { status: 'bounced', 'campaign.nextSendAt': null, notes: [...(c.notes ?? []), { at: nowIso(), text: `Send failed: ${msg}`, by: 'system' }] });
      }
      if (errors.length >= 5) break; // provider problem; try again next hour
    }
  }
  const sentToday = (state.sentTodayDate === date ? state.sentToday : 0) + sent.length;
  await setCampaignState({ lastRunAt: nowIso(), lastRunSent: sent.length, sentToday, sentTodayDate: date });
  return { due: due.length, sent: sent.length, skippedSteps, waitingApproval, errors, cap };
}

/** Mark a contact converted when a form submission carries its token. */
export async function markContactConverted(contact: ContactRecord, leadId: string, what: string) {
  await patchContact(contact.id, {
    status: 'converted',
    leadId,
    'campaign.nextSendAt': null,
    notes: [...(contact.notes ?? []), { at: nowIso(), text: `Converted: ${what} (lead ${leadId})`, by: 'contact' }],
  });
}
