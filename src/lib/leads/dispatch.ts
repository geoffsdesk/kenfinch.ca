/**
 * Outbound side effects for a lead, separated from createLead so the dashboard
 * can replay them when Ken releases a held lead. Server-only (imports the Admin
 * SDK through the store), but deliberately NOT a 'use server' module: these are
 * not callable from the client.
 */

import type { ContactRecord } from '@/lib/contacts/types';
import { markContactConverted } from '@/lib/campaigns/runner';
import { patchLead, nowIso } from './store';
import type { LeadRecord } from './types';
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
} from './notify';

export interface NotifyOptions {
  ken: boolean;
  confirmation: boolean;
  sms: boolean;
}

/**
 * Ken email (BCC oversight) + Ken SMS + submitter confirmation email/SMS, each
 * best-effort. Records timestamps and errors on the lead doc when it has an id.
 * When the Ken email fails and the lead was never stored, nothing else is sent
 * (the caller tells the visitor to call Ken directly).
 */
export async function notifyNewLead(lead: LeadRecord, opts: NotifyOptions): Promise<{ kenEmailFailed: boolean }> {
  const errors: string[] = [];
  const patch: Record<string, unknown> = {};
  let kenEmailFailed = false;

  if (opts.ken) {
    try {
      await sendMail({
        to: KEN_EMAIL,
        bcc: OVERSIGHT_EMAIL,
        replyTo: lead.email,
        subject: kenSubject(lead),
        html: kenNotificationHtml(lead, lead.id || 'n/a'),
      });
      patch['notify.kenEmailAt'] = nowIso();
    } catch (err) {
      console.error('Ken notification email failed:', err);
      errors.push(`ken-email: ${(err as Error).message}`);
      kenEmailFailed = true;
      if (!lead.id) return { kenEmailFailed };
    }
  }

  if (opts.ken && opts.sms && smsConfigured() && kenMobile()) {
    try {
      if (await sendSms(kenMobile(), kenSmsText(lead))) patch['notify.kenSmsAt'] = nowIso();
    } catch (err) {
      errors.push(`ken-sms: ${(err as Error).message}`);
    }
  }

  if (opts.confirmation) {
    try {
      await sendMail({
        to: lead.email,
        replyTo: KEN_EMAIL,
        subject: 'Thanks. Ken Finch will be in touch within one business day',
        html: leadConfirmationHtml(lead),
        headers: { 'Auto-Submitted': 'auto-replied' }, // RFC 3834: auto-responders should not reply to this
      });
      patch['followUp.confirmationSentAt'] = nowIso();
    } catch (err) {
      errors.push(`lead-email: ${(err as Error).message}`);
    }
    if (opts.sms && smsConfigured() && lead.phone) {
      try {
        await sendSms(lead.phone, confirmationSmsText(lead));
      } catch (err) {
        errors.push(`lead-sms: ${(err as Error).message}`);
      }
    }
  }

  if (lead.id) {
    if (errors.length) patch['notify.errors'] = [...(lead.notify?.errors ?? []), ...errors];
    try {
      if (Object.keys(patch).length) await patchLead(lead.id, patch);
    } catch (err) {
      console.error('lead patch failed:', err);
    }
  }
  return { kenEmailFailed };
}

/** Database contact? Stop the campaign sequence and link the two records. */
export async function linkCrmContact(lead: LeadRecord, contact: ContactRecord | null) {
  if (!lead.id || !contact || contact.status === 'converted') return;
  try {
    await markContactConverted(contact, lead.id, `${lead.type} form: ${lead.summary}`.slice(0, 200));
    await patchLead(lead.id, { 'details.contactId': contact.id, 'details.contactSegment': contact.segment });
  } catch (err) {
    console.error('contact link failed:', err);
  }
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

/** True when any prior lead from the same mailbox got a confirmation email in the last 7 days. */
export function confirmationSentRecently(prior: LeadRecord[], now = Date.now()): boolean {
  return prior.some((l) => {
    const at = l.followUp?.confirmationSentAt;
    return !!at && now - new Date(at).getTime() < WEEK_MS;
  });
}
