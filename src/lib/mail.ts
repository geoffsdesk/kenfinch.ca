/**
 * Single outbound email sender for the whole site.
 *
 * Provider is chosen at runtime:
 *   - RESEND_API_KEY set   -> Resend (free tier: 3,000/month, 100/day; Pro removes the daily cap)
 *   - else SENDGRID_API_KEY -> SendGrid (legacy)
 *
 * Transactional mail (lead alerts, confirmations, check-ins, digest) goes out
 * from MAIL_FROM (default realtor@kenfinch.ca). Database campaigns go out from
 * BULK_MAIL_FROM (default ken@kenfinch.ca) so replies land in Ken's mailbox and
 * a spam complaint on a bulk send never touches the transactional address.
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
  /** Free-form tag for the provider's logs (e.g. "reactivation-e1"). */
  tag?: string;
}

export interface MailResult {
  provider: 'resend' | 'sendgrid';
  id: string | null;
}

export function mailProvider(): MailResult['provider'] | null {
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SENDGRID_API_KEY) return 'sendgrid';
  return null;
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

export async function sendMail(msg: MailMessage): Promise<MailResult> {
  const from = msg.from || MAIL_FROM;
  const text = msg.text ?? toText(msg.html);
  const provider = mailProvider();
  if (!provider) throw new Error('No email provider configured (set RESEND_API_KEY or SENDGRID_API_KEY)');

  if (provider === 'resend') {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${from}>`,
      to: Array.isArray(msg.to) ? msg.to : [msg.to],
      cc: msg.cc ? (Array.isArray(msg.cc) ? msg.cc : [msg.cc]) : undefined,
      bcc: msg.bcc ? (Array.isArray(msg.bcc) ? msg.bcc : [msg.bcc]) : undefined,
      replyTo: msg.replyTo,
      subject: msg.subject,
      html: msg.html,
      text,
      headers: msg.headers,
      tags: msg.tag ? [{ name: 'campaign', value: msg.tag.replace(/[^a-zA-Z0-9_-]/g, '_') }] : undefined,
    });
    if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
    return { provider, id: data?.id ?? null };
  }

  const { default: sgMail } = await import('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  const [res] = await sgMail.send({
    from: { email: from, name: FROM_NAME },
    to: msg.to,
    cc: msg.cc,
    bcc: msg.bcc,
    replyTo: msg.replyTo,
    subject: msg.subject,
    html: msg.html,
    text,
    headers: msg.headers,
    categories: msg.tag ? [msg.tag] : undefined,
  });
  const id = (res?.headers as Record<string, string> | undefined)?.['x-message-id'] ?? null;
  return { provider, id };
}
