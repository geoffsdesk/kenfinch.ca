/**
 * Database reactivation campaign: "Ken is now a mortgage broker" + renewal check.
 *
 * Four emails over 30 days. Every email is short, plain, sent from Ken's own
 * address with replies going to his mailbox, and carries a one-click
 * unsubscribe (CASL + Gmail/Yahoo bulk-sender rules). Links carry UTM
 * parameters and the contact token so a renewal form submission is tied back
 * to the contact and shows "database" as the marketing source on the lead.
 *
 * Copy is approved by Ken in the marketing repo (content/drafts). Edit here
 * only after the approved text changes.
 */

import { SITE_URL, CONTACT, MORTGAGE } from '@/lib/site';
import { esc } from '@/lib/leads/notify';
import type { ContactRecord } from '@/lib/contacts/types';

export const REACTIVATION_ID = 'reactivation-2026';

export interface CampaignStep {
  key: string;
  dayOffset: number; // days after enrolment
  subject: (c: ContactRecord) => string;
  html: (c: ContactRecord, links: StepLinks) => string;
  /** Skip this step for a contact (e.g. they already converted). */
  skipIf?: (c: ContactRecord) => boolean;
}

export interface StepLinks {
  renewal: string;
  mortgage: string;
  sell: string;
  afford: string;
  unsubscribe: string;
}

export function firstName(c: ContactRecord) {
  const f = (c.firstName || '').trim();
  if (!f || f.length < 2 || /[^a-z' -]/i.test(f)) return 'there';
  return f.charAt(0).toUpperCase() + f.slice(1).toLowerCase();
}

export function stepLinks(c: ContactRecord, stepKey: string): StepLinks {
  const q = (path: string, extra = '') =>
    `${SITE_URL}${path}?utm_source=database&utm_medium=email&utm_campaign=${REACTIVATION_ID}&utm_content=${stepKey}&c=${c.token}${extra}`;
  return {
    renewal: q('/renewal'),
    mortgage: q('/mortgage'),
    sell: q('/sell'),
    afford: q('/afford'),
    unsubscribe: `${SITE_URL}/api/unsubscribe?t=${c.token}`,
  };
}

function isSphere(c: ContactRecord) {
  return c.segment === 'sphere' || c.segment === 'past-client';
}

function layout(body: string, links: StepLinks) {
  return `
  <div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:0 auto;color:#1a1a1a;font-size:16px;line-height:1.6">
    ${body}
    <p style="margin:26px 0 0">Ken</p>
    <p style="margin:4px 0 0;font-size:14px;color:#444">Ken Finch<br>
      Realtor and Mortgage Broker<br>
      Call or text ${esc(CONTACT.phoneDisplay)} &middot; <a href="mailto:${esc(CONTACT.email)}" style="color:#444">${esc(CONTACT.email)}</a> &middot; <a href="${SITE_URL}" style="color:#444">kenfinch.ca</a></p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0 12px">
    <p style="font-size:12px;color:#777;line-height:1.5;margin:0">
      Ken Finch, Broker, Royal LePage Signature Realty, Brokerage. Ken Finch, ${esc(MORTGAGE.title)}, ${esc(MORTGAGE.brokerage)}, FSRA brokerage licence #${esc(MORTGAGE.brokerageLicence)}.
      You are receiving this because you have worked with Ken, registered on his home-search site, or asked him about Oakville real estate.
      <a href="${links.unsubscribe}" style="color:#777">Unsubscribe</a> at any time.
      Oakville, Ontario.
    </p>
  </div>`;
}

function why(c: ContactRecord) {
  return isSphere(c)
    ? `You are getting this because we know each other, and I would rather you hear it from me than from a billboard.`
    : `You signed up for Oakville listings on my search site a while back, so I wanted you to hear this from me.`;
}

export const REACTIVATION_STEPS: CampaignStep[] = [
  {
    key: 'e1',
    dayOffset: 0,
    subject: () => `A quick update from Ken`,
    html: (c, l) =>
      layout(
        `
      <p>Hi ${esc(firstName(c))},</p>
      <p>${why(c)}</p>
      <p>On top of real estate, I am now a licensed mortgage broker. In practice it means one person handles the house and the financing, and I can place a mortgage with dozens of lenders instead of one bank.</p>
      <p>The thing I am finding most useful for people right now is renewals. Most of us just sign what the bank mails us. Shopping it, 120 days out, is usually worth a call.</p>
      <p><strong>When does your mortgage come up for renewal?</strong> Reply with the month, or <a href="${l.renewal}" style="color:#1a1a1a">tap here, it takes 30 seconds</a>, and I will put a reminder in my calendar to check the market for you at the right time. No obligation.</p>
      <p>And if you are thinking about buying, selling or helping a family member get started, just reply. I am happy to talk it through.</p>`,
        l,
      ),
  },
  {
    key: 'e2',
    dayOffset: 7,
    subject: () => `The 120-day renewal window`,
    skipIf: (c) => !!c.leadId,
    html: (c, l) =>
      layout(
        `
      <p>Hi ${esc(firstName(c))},</p>
      <p>A short one, because this is the part most people miss.</p>
      <p>Your lender's renewal letter usually arrives a few weeks before the term ends, with a rate that is rarely their best. Most lenders will hold a rate for 120 days, which is the window where a broker can shop it properly, including your current lender, without you paying any penalty.</p>
      <p>Three things worth knowing:</p>
      <ul style="padding-left:20px;margin:0 0 16px">
        <li>Switching lenders at renewal generally does not need a new down payment, and many lenders cover the transfer costs.</li>
        <li>If your income or credit has changed, or you have a rental or self-employment income, the lender you choose matters more than the rate you see advertised.</li>
        <li>If you want to pull equity for a renovation, a cottage or to help your kids, renewal is the cheapest moment to do it.</li>
      </ul>
      <p><a href="${l.renewal}" style="color:#1a1a1a"><strong>Tell me your renewal month</strong></a> and I will reach out at the 120-day mark with real numbers. Or reply to this email. Either works.</p>`,
        l,
      ),
  },
  {
    key: 'e3',
    dayOffset: 16,
    subject: () => `What I am seeing in Oakville right now`,
    skipIf: (c) => !!c.leadId,
    html: (c, l) =>
      layout(
        `
      <p>Hi ${esc(firstName(c))},</p>
      <p>People ask me the same two questions at every open house: is now a good time, and what is my place worth. Here is the honest version.</p>
      <p>Oakville is a market of neighbourhoods, not one number. Detached homes in the older south-of-the-QEW pockets are behaving differently from townhomes in the north, and condos are their own story. Days on market tell you more than the average price does, and right now well-priced homes still move while over-priced ones sit.</p>
      <p>If you own here, it is worth knowing where you stand even if you are not moving. If you are thinking about buying, the pre-approval is the first step, and it is free.</p>
      <p style="margin:18px 0"><a href="${l.sell}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none">What is my home worth?</a>
      &nbsp; <a href="${l.mortgage}" style="display:inline-block;border:1px solid #1a1a1a;color:#1a1a1a;padding:10px 16px;border-radius:4px;text-decoration:none">Get pre-approved</a></p>
      <p>Or reply with "buy" or "sell" and I will call you.</p>`,
        l,
      ),
  },
  {
    key: 'e4',
    dayOffset: 30,
    subject: () => `Should I keep you on the list?`,
    skipIf: (c) => !!c.leadId,
    html: (c, l) =>
      layout(
        `
      <p>Hi ${esc(firstName(c))},</p>
      <p>I have sent a few notes over the last month and I do not want to be one more thing in your inbox.</p>
      <p>Going forward I will send one short Oakville market update a month, plus a heads-up before Bank of Canada rate decisions. If that is useful, you do not need to do anything.</p>
      <p>If it is not, <a href="${l.unsubscribe}" style="color:#1a1a1a">unsubscribe here</a> and I will not take it personally. You can always reach me directly at ${esc(CONTACT.phoneDisplay)}.</p>
      <p>And if your renewal is coming up in the next year, <a href="${l.renewal}" style="color:#1a1a1a">tell me the month</a> so I can check the market for you at the right time.</p>`,
        l,
      ),
  },
];

export function stepByKey(key: string) {
  return REACTIVATION_STEPS.find((s) => s.key === key) ?? null;
}

export function nextStepAfter(key: string | null): CampaignStep | null {
  if (!key) return REACTIVATION_STEPS[0];
  const i = REACTIVATION_STEPS.findIndex((s) => s.key === key);
  return i >= 0 && i + 1 < REACTIVATION_STEPS.length ? REACTIVATION_STEPS[i + 1] : null;
}
