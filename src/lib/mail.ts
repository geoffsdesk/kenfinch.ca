/**
 * Single outbound email sender for the whole site, via Resend.
 *
 * Transactional mail (lead alerts, confirmations, check-ins, digest) goes out
 * from MAIL_FROM (default realtor@kenfinch.ca). Database campaigns go out from
 * BULK_MAIL_FROM (default ken@kenfinch.ca) so replies land in Ken's mailbox and
 * a spam complaint on a bulk send never touches the transactional address.
 *
 * Resend free tier: 3,000 emails/month, 100/day. Pro removes the daily cap.
 */

import { CONTACT } from '@/lib/site';

export const MAIL_FROM = process.env.MAIL_FROM || CONTACT.leadInbox;
export const BULK_MAIL_FROM = process.env.BULK_MAIL_FROM || CONTACT.email;
const FROM_NAME = 'Ken Finch';

export interface MailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string; // bare address; display name is always "Ken Finch"
  replyTo?: string;
  bcc?: string | string[];
  cc?: string | string[];
  headers?: Record<string, string>;
  /** Free-form tag for Resend's logs (e.g. "reactivation-e1"). */
  tag?: string;
}

export interface MailResult {
  provider: 'resend';
  id: string | null;
}

export function mailProvider(): MailResult['provider'] | null {
  return process.env.RESEND_API_KEY ? 'resend' : null;
}

function toText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h\d|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

const list = (v?: string | string[]) => (v ? (Array.isArray(v) ? v : [v]) : undefined);

export async function sendMail(msg: MailMessage): Promise<MailResult> {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${msg.from || MAIL_FROM}>`,
    to: list(msg.to)!,
    cc: list(msg.cc),
    bcc: list(msg.bcc),
    replyTo: msg.replyTo,
    subject: msg.subject,
    html: msg.html,
    text: msg.text ?? toText(msg.html),
    headers: msg.headers,
    tags: msg.tag ? [{ name: 'campaign', value: msg.tag.replace(/[^a-zA-Z0-9_-]/g, '_') }] : undefined,
  });
  if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
  return { provider: 'resend', id: data?.id ?? null };
}
