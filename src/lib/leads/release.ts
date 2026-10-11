/**
 * Dashboard "Not spam" action: un-hold a quarantined or review lead, restore
 * the 48h check-in and send whatever notifications were withheld.
 */

import { findContactByEmail } from '@/lib/contacts/store';
import { getLead, patchLead, nowIso } from './store';
import { notifyNewLead, linkCrmContact } from './dispatch';

const CHECKIN_DELAY_MS = 48 * 3600 * 1000;

export async function releaseLead(id: string): Promise<{ ken: boolean; confirmation: boolean }> {
  const lead = await getLead(id);
  if (!lead) throw new Error('Lead not found');
  const held = lead.status === 'spam' || (lead.spam?.verdict === 'review' && !lead.spam.releasedAt);
  if (!held) throw new Error('Lead is not held');
  if (lead.spam?.reasons.some((r) => r.rule === 'test')) throw new Error('Test leads cannot be released');

  const at = nowIso();
  const hot =
    lead.type === 'contact'
      ? /first home|pre-approval|buying|renewal within 6 months/i.test(String(lead.details.intent ?? ''))
      : lead.type === 'buyer'
        ? lead.details.timeline === '0-3'
        : false;
  const patch: Record<string, unknown> = {
    status: 'new',
    statusUpdatedAt: at,
    hot,
    'followUp.checkinSentAt': null,
    'followUp.checkinDueAt': new Date(Date.now() + CHECKIN_DELAY_MS).toISOString(),
    notes: [...lead.notes, { at, by: 'ken', text: 'Released by Ken: not spam. Held notifications sent now.' }],
  };
  if (lead.spam) {
    patch['spam.verdict'] = 'clean';
    patch['spam.releasedAt'] = at;
    patch['spam.releasedBy'] = 'ken';
  } else {
    // Legacy doc marked spam by hand: give it an assessment so the inbox can show the release.
    patch.spam = { version: 1, score: 0, verdict: 'clean', reasons: [], assessedAt: at, enforced: true, releasedAt: at, releasedBy: 'ken', overriddenTo: null };
  }
  await patchLead(id, patch);

  const fresh = (await getLead(id))!;
  const ken = !fresh.notify.kenEmailAt;
  const confirmation = !fresh.followUp.confirmationSentAt;
  await notifyNewLead(fresh, { ken, confirmation, sms: true });
  const contact = await findContactByEmail(fresh.email).catch(() => null);
  await linkCrmContact(fresh, contact);
  return { ken, confirmation };
}
