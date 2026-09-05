'use server';

/**
 * Single entry point for every lead form on the site.
 *
 *   createLead(input) ->
 *     1. validate (zod, by `type`)
 *     2. persist to Firestore `leads` (Admin SDK)
 *     3. notify Ken by email (BCC oversight inbox) and SMS when configured
 *     4. send the lead a confirmation email (+ SMS when configured)
 *     5. schedule the 48-hour "did Ken reach you?" check-in (handled by the
 *        hourly automation job in /api/cron/leads)
 *
 * Each notification is best-effort: a failure is recorded on the lead doc and
 * never blocks the visitor from seeing the success state.
 */

import { leadInput, type LeadDoc, type LeadInput, type LeadRecord, buyerLabel } from '@/lib/leads/types';
import { insertLead, patchLead, newToken, nowIso } from '@/lib/leads/store';
import {
  sendMail,
  sendSms,
  smsConfigured,
  kenMobile,
  kenSubject,
  kenNotificationHtml,
  leadConfirmationHtml,
  confirmationSmsText,
  kenSmsText,
  KEN_EMAIL,
  OVERSIGHT_EMAIL,
} from '@/lib/leads/notify';

export type CreateLeadResult = { ok: true; leadId: string } | { ok: false; error: string };

const CHECKIN_DELAY_HOURS = 48;

function buildDoc(input: LeadInput): LeadDoc {
  const createdAt = nowIso();
  const checkinDueAt = new Date(Date.now() + CHECKIN_DELAY_HOURS * 3600 * 1000).toISOString();
  const common = {
    status: 'new' as const,
    statusUpdatedAt: createdAt,
    notes: [],
    nextFollowUpAt: null,
    followUp: { token: newToken(), confirmationSentAt: null, checkinDueAt, checkinSentAt: null, checkinReply: null, checkinRepliedAt: null },
    notify: { kenEmailAt: null, kenSmsAt: null, errors: [] as string[] },
    createdAt,
    updatedAt: createdAt,
    source: input.source ?? 'site',
    page: input.page ?? '',
  };

  switch (input.type) {
    case 'buyer': {
      const { firstName, lastName, email, phone, message, source, page, consent, type, ...details } = input;
      const summary = [
        buyerLabel('goal', details.goal),
        buyerLabel('timeline', details.timeline),
        buyerLabel('priceRange', details.priceRange),
        details.areas.join('/'),
        details.firstTimeBuyer === 'yes' ? 'first-time buyer' : null,
      ]
        .filter(Boolean)
        .join(' · ');
      return {
        ...common,
        type,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        hot: details.timeline === '0-3',
        summary,
        details: { ...details, firstName, lastName, message: message ?? '', consent },
      };
    }
    case 'contact':
      return {
        ...common,
        type: input.type,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        hot: /first home|pre-approval|buying/i.test(input.intent ?? ''),
        summary: [input.intent || 'General enquiry', input.message ? `"${input.message.slice(0, 80)}${input.message.length > 80 ? '…' : ''}"` : null].filter(Boolean).join(' · '),
        details: { intent: input.intent ?? '', message: input.message ?? '' },
      };
    case 'valuation':
      return {
        ...common,
        type: input.type,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        hot: false,
        summary: `${input.address}${typeof input.estimate === 'number' ? ` · AI est. $${input.estimate.toLocaleString()}` : ''}`,
        details: { address: input.address, estimate: input.estimate ?? null, confidence: input.confidence ?? null, property: input.property ?? {}, message: input.message ?? '' },
      };
    case 'popup':
      return {
        ...common,
        type: input.type,
        name: input.name?.trim() || 'Not provided',
        email: input.email,
        phone: input.phone || null,
        hot: false,
        summary: `Requested: ${input.asset}`,
        details: { asset: input.asset },
      };
  }
}

export async function createLead(raw: unknown): Promise<CreateLeadResult> {
  const parsed = leadInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' };
  }
  const doc = buildDoc(parsed.data);

  // 1. Persist. Without a lead ID we still notify Ken so nothing is lost.
  let leadId = '';
  try {
    leadId = await insertLead(doc);
  } catch (err) {
    console.error('leads insert failed:', err);
  }
  const lead: LeadRecord = { id: leadId, ...doc };
  const errors: string[] = [];
  const patch: Record<string, unknown> = {};

  // 2. Ken email (BCC oversight).
  try {
    await sendMail({
      to: KEN_EMAIL,
      bcc: OVERSIGHT_EMAIL,
      replyTo: lead.email,
      subject: kenSubject(lead),
      html: kenNotificationHtml(lead, leadId || 'n/a'),
    });
    patch['notify.kenEmailAt'] = nowIso();
  } catch (err) {
    console.error('Ken notification email failed:', err);
    errors.push(`ken-email: ${(err as Error).message}`);
    if (!leadId) return { ok: false, error: 'We could not submit your request right now. Please call Ken directly.' };
  }

  // 3. Ken SMS (optional).
  if (smsConfigured() && kenMobile()) {
    try {
      if (await sendSms(kenMobile(), kenSmsText(lead))) patch['notify.kenSmsAt'] = nowIso();
    } catch (err) {
      errors.push(`ken-sms: ${(err as Error).message}`);
    }
  }

  // 4. Lead confirmation email (+ SMS when configured).
  try {
    await sendMail({ to: lead.email, replyTo: KEN_EMAIL, subject: 'Thanks. Ken Finch will be in touch within one business day', html: leadConfirmationHtml(lead) });
    patch['followUp.confirmationSentAt'] = nowIso();
  } catch (err) {
    errors.push(`lead-email: ${(err as Error).message}`);
  }
  if (smsConfigured() && lead.phone) {
    try {
      await sendSms(lead.phone, confirmationSmsText(lead));
    } catch (err) {
      errors.push(`lead-sms: ${(err as Error).message}`);
    }
  }

  if (leadId) {
    if (errors.length) patch['notify.errors'] = errors;
    try {
      await patchLead(leadId, patch);
    } catch (err) {
      console.error('lead patch failed:', err);
    }
  }
  return { ok: true, leadId };
}
