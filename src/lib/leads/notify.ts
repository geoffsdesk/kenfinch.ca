/**
 * Outbound notifications for the lead pipeline: email via SendGrid, SMS via
 * Twilio (optional; silently skipped when not configured).
 */

import sgMail from '@sendgrid/mail';
import { CONTACT, MORTGAGE, SITE_URL } from '@/lib/site';
import { TYPE_LABELS, STATUS_LABELS, buyerLabel, type LeadRecord } from './types';

/** Geoff is BCC'd on every lead notification so the pipeline is auditable. */
export const OVERSIGHT_EMAIL = process.env.LEAD_OVERSIGHT_EMAIL || 'geoff.radian6@gmail.com';
export const KEN_EMAIL = CONTACT.leadInbox;
const FROM = CONTACT.leadInbox;

export const TORONTO_TZ = 'America/Toronto';

// ─── Email ───────────────────────────────────────────────────────────────────

export async function sendMail(msg: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  bcc?: string | string[];
  cc?: string | string[];
}) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) throw new Error('SENDGRID_API_KEY is not set');
  sgMail.setApiKey(key);
  await sgMail.send({
    from: { email: FROM, name: 'Ken Finch' },
    to: msg.to,
    cc: msg.cc,
    bcc: msg.bcc,
    replyTo: msg.replyTo,
    subject: msg.subject,
    html: msg.html,
    text: msg.text ?? msg.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  });
}

export function esc(s: unknown) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(title: string, body: string) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <div style="border-top:4px solid #d4af37;padding:20px 0 8px">
      <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#a58a2a">KenFinch.ca</p>
      <h2 style="margin:6px 0 16px;font-size:22px">${esc(title)}</h2>
    </div>
    ${body}
    <p style="margin-top:28px;font-size:11px;color:#777;line-height:1.5">
      Ken Finch, Broker, Royal LePage Signature Realty, Brokerage. Ken Finch, ${esc(MORTGAGE.title)}.
      Mortgage services provided through ${esc(MORTGAGE.brokerage)}, FSRA Brokerage Licence #${esc(MORTGAGE.brokerageLicence)}.
    </p>
  </div>`;
}

function rows(pairs: [string, unknown][]) {
  return `<table style="border-collapse:collapse;font-size:14px">${pairs
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${esc(k)}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`)
    .join('')}</table>`;
}

export function dashboardUrl() {
  return `${SITE_URL}/ken`;
}

/** Subject lines are kept stable because the E2E suite searches for them. */
export function kenSubject(lead: LeadRecord): string {
  const d = lead.details as Record<string, string | undefined>;
  switch (lead.type) {
    case 'buyer':
      return `New Buyer Lead: ${lead.name} - ${buyerLabel('goal', d.goal)} (${buyerLabel('timeline', d.timeline)})`;
    case 'contact':
      return `New Contact Form Submission from ${lead.name}${d.intent ? ` — ${d.intent}` : ''}`;
    case 'valuation':
      return `Expert Opinion Request for: ${d.address ?? ''}`;
    default:
      return `New email capture: ${lead.name} (${lead.email})`;
  }
}

export function kenNotificationHtml(lead: LeadRecord, leadId: string): string {
  const d = lead.details as Record<string, unknown>;
  const contact = rows([
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone', lead.phone ?? 'Not provided'],
  ]);
  let body = '';
  if (lead.type === 'buyer') {
    body = `
      <h3>Plans</h3>${rows([
        ['Goal', buyerLabel('goal', d.goal as string)],
        ['Timeline', buyerLabel('timeline', d.timeline as string)],
        ['Price range', buyerLabel('priceRange', d.priceRange as string)],
        ['Areas', Array.isArray(d.areas) ? (d.areas as string[]).join(', ') : ''],
        ['First-time buyer', d.firstTimeBuyer === 'yes' ? 'Yes' : 'No'],
      ])}
      <h3>Finances (self-reported)</h3>${rows([
        ['Down payment', buyerLabel('downPayment', d.downPayment as string)],
        ['Household income', buyerLabel('income', d.income as string)],
        ['Employment', buyerLabel('employment', d.employment as string)],
        ['Credit', buyerLabel('credit', d.credit as string)],
        ['Already pre-approved', d.preApproved === 'yes' ? 'Yes' : d.preApproved === 'no' ? 'No' : 'Not provided'],
      ])}
      ${d.message ? `<h3>Message</h3><p>${esc(d.message)}</p>` : ''}
      <p style="font-size:13px;color:#555">The client was offered the Express Mortgage application with <code>externalId=${esc(leadId)}</code>. Look for it in Finmo.</p>`;
  } else if (lead.type === 'contact') {
    body = `${rows([['Interest', (d.intent as string) || 'Not specified']])}${d.message ? `<h3>Message</h3><p>${esc(d.message)}</p>` : ''}`;
  } else if (lead.type === 'valuation') {
    const prop = (d.property as Record<string, unknown>) || {};
    body = `
      <h3>AI valuation</h3>${rows([
        ['Address', d.address],
        ['Estimated value', typeof d.estimate === 'number' ? `$${d.estimate.toLocaleString()}` : 'n/a'],
        ['Confidence', typeof d.confidence === 'number' ? `${Math.round(d.confidence * 100)}%` : 'n/a'],
      ])}
      <h3>Property details</h3>${rows(Object.entries(prop).map(([k, v]) => [k, String(v)]))}`;
  } else {
    body = rows([['Requested', (d.asset as string) || '']]);
  }
  const hot = lead.hot ? `<p style="background:#fff3cd;border:1px solid #ffe08a;padding:8px 12px;border-radius:6px;font-weight:600">HOT lead: moving within 3 months. Call today.</p>` : '';
  return wrap(`${TYPE_LABELS[lead.type]} lead: ${lead.name}`, `
    ${hot}
    <h3>Contact</h3>${contact}
    ${body}
    <p style="margin-top:20px"><a href="${dashboardUrl()}" style="background:#d4af37;color:#111;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Open in dashboard</a></p>
    <p style="font-size:12px;color:#777">Lead ID ${esc(leadId)} &middot; Source ${esc(lead.source)} &middot; Page ${esc(lead.page)}<br>
    This lead will get an automatic "did Ken reach you?" check-in in 2 days. Update the status in the dashboard to keep the digest accurate.</p>
  `);
}

export function leadConfirmationHtml(lead: LeadRecord): string {
  const first = lead.name.split(' ')[0] || 'there';
  const what =
    lead.type === 'buyer'
      ? 'your pre-approval request'
      : lead.type === 'valuation'
        ? 'your request for an expert opinion on your home value'
        : lead.type === 'popup'
          ? 'your request'
          : 'your message';
  return wrap(`Got it, ${first}. Ken will be in touch.`, `
    <p style="font-size:15px;line-height:1.6">Thanks for sending ${what} through KenFinch.ca. Ken reviews every request personally and will call or email you within one business day.</p>
    <p style="font-size:15px;line-height:1.6">If it is urgent, call or text Ken directly at <a href="${CONTACT.phoneHref}">${CONTACT.phoneDisplay}</a>, or reply to this email.</p>
    ${lead.type === 'buyer' ? `<p style="font-size:15px;line-height:1.6">Want a head start? You can complete the secure mortgage application any time from the <a href="${SITE_URL}/mortgage">mortgage page</a>.</p>` : ''}
    <p style="font-size:15px;line-height:1.6">Ken Finch<br>Real Estate Broker &middot; ${esc(MORTGAGE.title)}<br>${CONTACT.phoneDisplay}</p>
  `);
}

export function checkinLinks(leadId: string, token: string) {
  const base = `${SITE_URL}/api/leads/checkin?id=${encodeURIComponent(leadId)}&t=${encodeURIComponent(token)}`;
  return { yes: `${base}&a=yes`, no: `${base}&a=no` };
}

export function checkinHtml(lead: LeadRecord, leadId: string): string {
  const first = lead.name.split(' ')[0] || 'there';
  const links = checkinLinks(leadId, lead.followUp.token);
  return wrap(`Quick check-in, ${first}`, `
    <p style="font-size:15px;line-height:1.6">You reached out through KenFinch.ca a couple of days ago. Has Ken been in touch with you yet?</p>
    <p style="margin:20px 0">
      <a href="${links.yes}" style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;margin-right:10px">Yes, we connected</a>
      <a href="${links.no}" style="background:#dc2626;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">No, not yet</a>
    </p>
    <p style="font-size:14px;line-height:1.6;color:#555">One click is all it takes. If the answer is no, Ken will be nudged right away and you can also reach him directly at <a href="${CONTACT.phoneHref}">${CONTACT.phoneDisplay}</a>.</p>
  `);
}

export function checkinSmsText(lead: LeadRecord): string {
  const first = lead.name.split(' ')[0] || 'there';
  return `Hi ${first}, it's Ken Finch's office (KenFinch.ca). Has Ken reached you about your request yet? Reply YES or NO. Reply STOP to opt out.`;
}

export function confirmationSmsText(lead: LeadRecord): string {
  const first = lead.name.split(' ')[0] || 'there';
  return `Hi ${first}, thanks for reaching out via KenFinch.ca. Ken will call you within 1 business day. Urgent? Call/text ${CONTACT.phoneDisplay}. Reply STOP to opt out.`;
}

export function kenSmsText(lead: LeadRecord): string {
  const d = lead.details as Record<string, string | undefined>;
  const bits = [lead.hot ? 'HOT' : null, TYPE_LABELS[lead.type], lead.name, lead.phone ?? lead.email, lead.summary].filter(Boolean);
  const extra = lead.type === 'buyer' && d.timeline ? '' : '';
  return `New lead (KenFinch.ca): ${bits.join(' | ')}${extra}. Dashboard: ${dashboardUrl()}`.slice(0, 320);
}

export function fmtToronto(iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TORONTO_TZ, ...opts }).format(new Date(iso));
}

export function digestHtml(args: {
  dateLabel: string;
  newLeads: LeadRecord[];
  stale: LeadRecord[];
  saidNo: LeadRecord[];
  dueToday: LeadRecord[];
  counts: Record<string, number>;
}): string {
  const line = (l: LeadRecord) =>
    `<li style="margin:6px 0"><strong>${esc(l.name)}</strong> &middot; ${esc(TYPE_LABELS[l.type])}${l.hot ? ' &middot; <span style="color:#b45309;font-weight:600">HOT</span>' : ''}<br>
      <span style="color:#555;font-size:13px">${esc(l.summary)}</span><br>
      <span style="font-size:13px">${esc(l.phone ?? '')} ${esc(l.email)} &middot; ${esc(fmtToronto(l.createdAt))} &middot; status: ${esc(STATUS_LABELS[l.status])}</span></li>`;
  const section = (title: string, items: LeadRecord[], empty: string, color = '#111') =>
    `<h3 style="color:${color};margin:22px 0 6px">${esc(title)} (${items.length})</h3>${items.length ? `<ul style="padding-left:18px;margin:0">${items.map(line).join('')}</ul>` : `<p style="color:#777;font-size:14px;margin:0">${esc(empty)}</p>`}`;
  const pipeline = Object.entries(args.counts)
    .map(([k, v]) => `<span style="display:inline-block;margin:0 10px 6px 0;font-size:13px"><strong>${v}</strong> ${esc(k)}</span>`)
    .join('');
  return wrap(`Lead digest for ${args.dateLabel}`, `
    <div style="margin-bottom:8px">${pipeline}</div>
    ${section('Needs attention: no contact after 1 business day', args.stale, 'Nothing overdue. Nice.', '#b91c1c')}
    ${section('Leads who said Ken has NOT reached them', args.saidNo, 'No "no" replies in the last day.', '#b91c1c')}
    ${section('Follow-ups scheduled for today', args.dueToday, 'None scheduled.')}
    ${section('New leads in the last 24 hours', args.newLeads, 'No new leads yesterday.')}
    <p style="margin-top:20px"><a href="${dashboardUrl()}" style="background:#d4af37;color:#111;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Open the lead inbox</a></p>
  `);
}

// ─── SMS (Twilio, optional) ──────────────────────────────────────────────────

export function smsConfigured() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_FROM);
}

export function kenMobile() {
  return process.env.KEN_MOBILE_NUMBER || '';
}

export function toE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone.trim().startsWith('+') && digits.length > 10) return `+${digits}`;
  return null;
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!smsConfigured()) return false;
  const e164 = toE164(to);
  if (!e164) return false;
  const { default: twilio } = await import('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({ to: e164, from: process.env.TWILIO_PHONE_FROM, body });
  return true;
}
