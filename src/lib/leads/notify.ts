/**
 * Outbound notifications for the lead pipeline: email via Resend, SMS via
 * Twilio (optional; silently skipped when not configured).
 */

import { CONTACT, MORTGAGE, REAL_ESTATE, SITE_URL } from '@/lib/site';
import { TYPE_LABELS, STATUS_LABELS, buyerLabel, type LeadRecord } from './types';
import { REASON_LABELS } from './spam';
import { attributionLabel } from '@/lib/attribution';
import { SELLER_NEVER_LIST } from '@/lib/never-lists';
import { waitingLabel } from './nudge';

/** Geoff is BCC'd on every lead notification so the pipeline is auditable. */
export const OVERSIGHT_EMAIL = process.env.LEAD_OVERSIGHT_EMAIL || 'geoff.radian6@gmail.com';
export const KEN_EMAIL = CONTACT.leadInbox;

export const TORONTO_TZ = 'America/Toronto';

// ─── Email ───────────────────────────────────────────────────────────────────

// The Resend sender lives in src/lib/mail.ts.
export { sendMail } from '@/lib/mail';

export function esc(s: unknown) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** RECO advertising line: brokerage name clearly and prominently. */
export const RECO_LINE = `${CONTACT.name}, ${REAL_ESTATE.title}, ${REAL_ESTATE.brokerage}. ${REAL_ESTATE.disclaimer}`;
/** FSRA (MBLAA) line: licensee name + approved title + licence, brokerage + licence. Ken is never a "mortgage broker". */
export const FSRA_LINE = `${CONTACT.name}, ${MORTGAGE.title}, Licence #${MORTGAGE.agentLicence}. Mortgage services provided through ${MORTGAGE.brokerage}, FSRA Brokerage Licence #${MORTGAGE.brokerageLicence}.`;

/** True when the lead is about a mortgage (buyer form, renewal, affordability, mortgage-flavoured lead magnets). */
export function isMortgageLead(lead: LeadRecord): boolean {
  if (lead.type === 'buyer') return true;
  if (lead.source === 'renewal-form' || lead.source === 'affordability-form') return true;
  const asset = String((lead.details as Record<string, unknown>).asset ?? '');
  return lead.type === 'popup' && /afford|mortgage|renewal/i.test(asset);
}

/**
 * Footer for emails to the sender: FSRA on mortgage, renewal and affordability
 * leads, RECO on contact, valuation and lead-magnet leads, both on buyer leads.
 */
export function complianceFooter(lead: LeadRecord): string {
  if (lead.type === 'buyer') return `${RECO_LINE} ${FSRA_LINE}`;
  return isMortgageLead(lead) ? FSRA_LINE : RECO_LINE;
}

function wrap(title: string, body: string, footer: string = `${RECO_LINE} ${FSRA_LINE}`) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <div style="border-top:4px solid #d4af37;padding:20px 0 8px">
      <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#a58a2a">KenFinch.ca</p>
      <h2 style="margin:6px 0 16px;font-size:22px">${esc(title)}</h2>
    </div>
    ${body}
    <p style="margin-top:28px;font-size:11px;color:#777;line-height:1.5">${esc(footer)}</p>
  </div>`;
}

function rows(pairs: [string, unknown][]) {
  return `<table style="border-collapse:collapse;font-size:14px">${pairs
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${esc(k)}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`)
    .join('')}</table>`;
}

export function dashboardUrl(leadId?: string) {
  return leadId ? `${SITE_URL}/ken?lead=${encodeURIComponent(leadId)}` : `${SITE_URL}/ken`;
}

/** Short human label for where a lead came from, e.g. "valuation-gated" vs "expert opinion". */
export function sourceLabel(lead: LeadRecord): string {
  switch (lead.source) {
    case 'valuation-gated':
      return 'valuation gate';
    case 'valuation-expert-opinion':
      return 'expert opinion';
    case 'affordability-form':
      return 'affordability';
    case 'renewal-form':
      return 'renewal';
    case 'never-list':
      return 'never list';
    default:
      return lead.source || 'site';
  }
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
      return lead.source === 'valuation-gated' ? `Valuation lead (gated estimate): ${d.address ?? ''}` : `Expert Opinion Request for: ${d.address ?? ''}`;
    default:
      return d.asset === 'seller-never-list' ? `Never List request: ${lead.name} (${lead.email})` : `New email capture: ${lead.name} (${lead.email})`;
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
    const gated = lead.source === 'valuation-gated';
    body = `
      <p style="background:${gated ? '#eef2ff' : '#f0fdf4'};border:1px solid ${gated ? '#c7d2fe' : '#bbf7d0'};padding:8px 12px;border-radius:6px;font-size:14px">
        ${gated
          ? '<strong>Gate lead.</strong> They unlocked the exact AI figure with their contact details. Reply with the three most recent comparable sales and whether the AI looks high or low (KEN-PLAYBOOK, "Gate lead comps template"). Target: within 1 hour, 9:00 to 20:00.'
          : '<strong>Expert opinion requested.</strong> They want a full comparative market analysis.'}
      </p>
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
  const review =
    lead.spam?.verdict === 'review' && !lead.spam.releasedAt
      ? `<p style="background:#fef3c7;border:1px solid #fcd34d;padding:10px 12px;border-radius:6px;font-size:14px"><strong>Possible spam (score ${lead.spam.score}).</strong> Signals: ${esc(
          lead.spam.reasons.map((r) => REASON_LABELS[r.rule] ?? r.rule).join(', '),
        )}. This sender has NOT been sent a confirmation email and will not get the 48-hour check-in. If this is a real person, open the dashboard and click "Not spam".</p>`
      : '';
  const request = lead.request
    ? `<br>Request: ${esc(lead.request.ip ?? 'unknown IP')} &middot; ${esc((lead.request.ua ?? 'no UA').slice(0, 80))} &middot; ${esc(lead.request.lang ?? 'no language')}`
    : '';
  return wrap(`${TYPE_LABELS[lead.type]} lead: ${lead.name}`, `
    ${review}
    ${hot}
    <h3>Contact</h3>${contact}
    ${body}
    <p style="margin-top:20px"><a href="${dashboardUrl()}" style="background:#d4af37;color:#111;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Open in dashboard</a></p>
    <p style="font-size:12px;color:#777">Lead ID ${esc(leadId)} &middot; Form ${esc(lead.source)} &middot; Page ${esc(lead.page)}<br>
    Marketing source: <strong>${esc(attributionLabel(lead.attribution))}</strong>${lead.attribution?.utm_term ? ` &middot; keyword: ${esc(lead.attribution.utm_term)}` : ''}${lead.attribution?.landingPage ? ` &middot; landed on ${esc(lead.attribution.landingPage)}` : ''}<br>
    This lead gets an automatic "did Ken reach you?" check-in in 2 days unless you mark it Contacted in the dashboard first.${request}</p>
  `);
}

/** Sender-facing signature. Ken's RECO title is Broker; on the mortgage side he is a Mortgage Agent Level 1, never a mortgage broker. */
function signature(lead: LeadRecord): string {
  const titles = isMortgageLead(lead)
    ? lead.type === 'buyer'
      ? `${esc(REAL_ESTATE.title)}, ${esc(REAL_ESTATE.brokerageShort)} &middot; ${esc(MORTGAGE.title)}, Licence #${esc(MORTGAGE.agentLicence)}`
      : `${esc(MORTGAGE.title)}, Licence #${esc(MORTGAGE.agentLicence)} &middot; ${esc(MORTGAGE.brokerage)}`
    : `${esc(REAL_ESTATE.title)}, ${esc(REAL_ESTATE.brokerage)}`;
  return `<p style="font-size:15px;line-height:1.6">Ken Finch<br>${titles}<br>${CONTACT.phoneDisplay}</p>`;
}

export function leadConfirmationHtml(lead: LeadRecord): string {
  const first = lead.name.split(' ')[0] || 'there';
  const d = lead.details as Record<string, unknown>;
  const footer = complianceFooter(lead);

  // Lead magnet: deliver the list in the email itself.
  if (lead.type === 'popup' && d.asset === 'seller-never-list') {
    return wrap(`Ken's Never List for Oakville sellers`, `
      <p style="font-size:15px;line-height:1.6">Hi ${esc(first)}, here is the complete list from the video: the seven things I would never do selling my own house.</p>
      <ol style="font-size:15px;line-height:1.7;padding-left:22px">${SELLER_NEVER_LIST.map((item) => `<li style="margin:6px 0">${esc(item)}</li>`).join('')}</ol>
      <p style="font-size:15px;line-height:1.6">If you want to know what your own house would list for, the <a href="${SITE_URL}/sell#valuation-tool">free valuation tool</a> takes a minute, or reply to this email and I will tell you what I see on your street.</p>
      ${signature(lead)}
    `, footer);
  }

  const what =
    lead.type === 'buyer'
      ? 'your pre-approval request'
      : lead.type === 'valuation'
        ? lead.source === 'valuation-gated'
          ? 'your home valuation request'
          : 'your request for an expert opinion on your home value'
        : lead.source === 'affordability-form'
          ? 'your affordability report request'
          : lead.source === 'renewal-form'
            ? 'your renewal details'
            : lead.type === 'popup'
              ? 'your request'
              : 'your message';
  const gated = lead.type === 'valuation' && lead.source === 'valuation-gated';
  return wrap(`Got it, ${first}. Ken will be in touch.`, `
    <p style="font-size:15px;line-height:1.6">Thanks for sending ${what} through KenFinch.ca. Ken reviews every request personally and will ${gated ? 'send you the three most recent comparable sales near you, with his read on whether the AI estimate is high or low,' : 'call or email you'} within one business day.</p>
    <p style="font-size:15px;line-height:1.6">If it is urgent, call or text Ken directly at <a href="${CONTACT.phoneHref}">${CONTACT.phoneDisplay}</a>, or reply to this email.</p>
    ${lead.type === 'buyer' ? `<p style="font-size:15px;line-height:1.6">Want a head start? You can complete the secure mortgage application any time from the <a href="${SITE_URL}/mortgage">mortgage page</a>.</p>` : ''}
    ${signature(lead)}
  `, footer);
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

/** Ken's new-lead SMS: type and source (so a gate lead reads differently from an expert request) plus the /ken deep link. */
export function kenSmsText(lead: LeadRecord): string {
  const bits = [lead.hot ? 'HOT' : null, `${TYPE_LABELS[lead.type]} (${sourceLabel(lead)})`, lead.name, lead.phone ?? lead.email, lead.summary].filter(Boolean);
  const link = ` Open: ${dashboardUrl(lead.id)}`;
  const head = `New lead (KenFinch.ca): ${bits.join(' | ')}.`;
  return `${head.slice(0, Math.max(40, 320 - link.length))}${link}`;
}

/** One-time nudge when a lead has sat in New for 2 hours (email body). */
export function nudgeHtml(lead: LeadRecord, now = new Date()): string {
  return wrap(`Lead waiting ${waitingLabel(lead.createdAt, now)}: ${TYPE_LABELS[lead.type]} / ${sourceLabel(lead)}`, `
    <p style="font-size:15px;line-height:1.6">${esc(lead.name)} (${esc(lead.phone ?? lead.email)}) came in ${esc(fmtToronto(lead.createdAt))} and is still marked New.</p>
    ${rows([
      ['Type', `${TYPE_LABELS[lead.type]} (${sourceLabel(lead)})`],
      ['Summary', lead.summary],
      ['Phone', lead.phone ?? 'Not provided'],
      ['Email', lead.email],
    ])}
    <p style="margin-top:20px"><a href="${dashboardUrl(lead.id)}" style="background:#d4af37;color:#111;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Open in /ken</a></p>
    <p style="font-size:12px;color:#777">Target: first call or text within one hour between 9:00 and 20:00, otherwise by 9:30 the next morning (KEN-PLAYBOOK.md). Marking the lead Contacted stops the 48-hour check-in. This nudge is sent once per lead.</p>
  `);
}

/** One-time nudge SMS to Ken. */
export function nudgeSmsText(lead: LeadRecord, now = new Date()): string {
  const head = `Lead waiting ${waitingLabel(lead.createdAt, now)}: ${TYPE_LABELS[lead.type]}/${sourceLabel(lead)} | ${lead.name} | ${lead.phone ?? lead.email}.`;
  const link = ` Open /ken: ${dashboardUrl(lead.id)}`;
  return `${head.slice(0, Math.max(40, 320 - link.length))}${link}`;
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
  /** Auto-quarantined in the last 24h (test submissions excluded) so a real name can be spotted and released. */
  quarantined: LeadRecord[];
  counts: Record<string, number>;
}): string {
  const line = (l: LeadRecord) => {
    const rules = l.spam?.reasons.map((r) => r.rule) ?? [];
    return `<li style="margin:6px 0"><strong>${esc(l.name)}</strong> &middot; ${esc(TYPE_LABELS[l.type])}${l.hot ? ' &middot; <span style="color:#b45309;font-weight:600">HOT</span>' : ''}<br>
      <span style="color:#555;font-size:13px">${esc(l.summary)}</span><br>
      <span style="font-size:13px">${esc(l.phone ?? '')} ${esc(l.email)} &middot; ${esc(fmtToronto(l.createdAt))} &middot; status: ${esc(STATUS_LABELS[l.status])} &middot; via ${esc(attributionLabel(l.attribution))}${
        l.status === 'spam' && rules.length ? ` &middot; ${esc(rules.join(', '))}` : ''
      }</span></li>`;
  };
  const section = (title: string, items: LeadRecord[], empty: string, color = '#111') =>
    `<h3 style="color:${color};margin:22px 0 6px">${esc(title)} (${items.length})</h3>${items.length ? `<ul style="padding-left:18px;margin:0">${items.map(line).join('')}</ul>` : `<p style="color:#777;font-size:14px;margin:0">${esc(empty)}</p>`}`;
  const bySource: Record<string, number> = {};
  args.newLeads.forEach((l) => {
    const k = attributionLabel(l.attribution);
    bySource[k] = (bySource[k] ?? 0) + 1;
  });
  const sources = Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `<span style="display:inline-block;margin:0 10px 6px 0;font-size:13px"><strong>${v}</strong> ${esc(k)}</span>`)
    .join('');
  const pipeline = Object.entries(args.counts)
    .map(([k, v]) => `<span style="display:inline-block;margin:0 10px 6px 0;font-size:13px"><strong>${v}</strong> ${esc(k)}</span>`)
    .join('');
  return wrap(`Lead digest for ${args.dateLabel}`, `
    <div style="margin-bottom:8px">${pipeline}</div>
    ${sources ? `<p style="margin:0 0 4px;font-size:12px;color:#777;text-transform:uppercase;letter-spacing:.08em">New leads by marketing source</p><div style="margin-bottom:8px">${sources}</div>` : ''}
    ${section('Needs attention: no contact after 1 business day', args.stale, 'Nothing overdue. Nice.', '#b91c1c')}
    ${section('Leads who said Ken has NOT reached them', args.saidNo, 'No "no" replies in the last day.', '#b91c1c')}
    ${section('Follow-ups scheduled for today', args.dueToday, 'None scheduled.')}
    ${section('New leads in the last 24 hours', args.newLeads, 'No new leads yesterday.')}
    ${section('Quarantined as spam in the last 24 hours', args.quarantined, 'Nothing quarantined.', '#6b7280')}
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
