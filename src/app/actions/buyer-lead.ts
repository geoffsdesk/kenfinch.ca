'use server';

/**
 * Buyer / mortgage lead intake.
 *
 * Runs server-side so the lead is persisted with the Admin SDK (no client
 * Firestore rules to fight), Ken is emailed, and we return the Firestore ID
 * that the client passes to Finmo as `externalId` for matching.
 */

import { z } from 'zod';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { getAdminDb, admin } from '@/lib/firebase-admin';
import { CONTACT, SERVICE_AREAS } from '@/lib/site';

const buyerLeadSchema = z.object({
  // Step 1 - plans
  goal: z.enum(['first-home', 'move-up', 'investment', 'refinance', 'not-sure']),
  timeline: z.enum(['0-3', '3-6', '6-12', 'exploring']),
  priceRange: z.enum(['under-750k', '750k-1m', '1m-1.5m', '1.5m-2.5m', 'over-2.5m', 'not-sure']),
  areas: z.array(z.enum(SERVICE_AREAS)).min(1, 'Pick at least one area.'),
  firstTimeBuyer: z.enum(['yes', 'no']),

  // Step 2 - finances (approximate, optional where sensible)
  downPayment: z.enum(['under-5', '5-10', '10-20', '20-plus', 'not-sure']),
  income: z.enum(['under-100k', '100k-150k', '150k-250k', 'over-250k', 'prefer-not']).optional(),
  employment: z.enum(['salaried', 'self-employed', 'contract', 'retired', 'other']).optional(),
  credit: z.enum(['excellent', 'good', 'fair', 'not-sure']).optional(),
  preApproved: z.enum(['yes', 'no']).optional(),

  // Step 3 - contact
  firstName: z.string().trim().min(1, 'Please enter your first name.').max(80),
  lastName: z.string().trim().min(1, 'Please enter your last name.').max(80),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().min(7, 'Please enter a phone number Ken can reach you at.').max(30),
  message: z.string().trim().max(2000).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm you would like Ken to contact you.' }) }),

  // Attribution
  source: z.string().max(80).optional(),
  page: z.string().max(200).optional(),
});

export type BuyerLeadInput = z.infer<typeof buyerLeadSchema>;

export type BuyerLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; error: string };

const LABELS: Record<string, Record<string, string>> = {
  goal: {
    'first-home': 'Buying my first home',
    'move-up': 'Moving up / relocating',
    investment: 'Investment property',
    refinance: 'Refinance or renewal',
    'not-sure': 'Not sure yet',
  },
  timeline: {
    '0-3': 'Within 3 months',
    '3-6': '3-6 months',
    '6-12': '6-12 months',
    exploring: 'Just exploring',
  },
  priceRange: {
    'under-750k': 'Under $750K',
    '750k-1m': '$750K - $1M',
    '1m-1.5m': '$1M - $1.5M',
    '1.5m-2.5m': '$1.5M - $2.5M',
    'over-2.5m': 'Over $2.5M',
    'not-sure': 'Not sure',
  },
  downPayment: {
    'under-5': 'Less than 5%',
    '5-10': '5% - 10%',
    '10-20': '10% - 20%',
    '20-plus': '20% or more',
    'not-sure': 'Not sure',
  },
  income: {
    'under-100k': 'Under $100K',
    '100k-150k': '$100K - $150K',
    '150k-250k': '$150K - $250K',
    'over-250k': 'Over $250K',
    'prefer-not': 'Prefer not to say',
  },
  employment: {
    salaried: 'Salaried / hourly',
    'self-employed': 'Self-employed',
    contract: 'Contract',
    retired: 'Retired',
    other: 'Other',
  },
  credit: {
    excellent: 'Excellent (760+)',
    good: 'Good (680-759)',
    fair: 'Fair (below 680)',
    'not-sure': 'Not sure',
  },
};

function label(field: keyof typeof LABELS, value?: string) {
  if (!value) return 'Not provided';
  return LABELS[field]?.[value] ?? value;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function submitBuyerLead(raw: unknown): Promise<BuyerLeadResult> {
  const parsed = buyerLeadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' };
  }
  const lead = parsed.data;

  // 1. Persist. If the Admin SDK is unavailable (e.g. local dev without
  //    credentials) we still email Ken so no lead is lost.
  let leadId = '';
  try {
    const db = getAdminDb();
    const ref = await db.collection('buyer_leads').add({
      ...lead,
      consent: true,
      status: 'new',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    leadId = ref.id;
  } catch (err) {
    console.error('buyer_leads write failed:', err);
  }

  // 2. Notify Ken.
  const fullName = `${lead.firstName} ${lead.lastName}`;
  const hot = lead.timeline === '0-3' ? ' [HOT - moving within 3 months]' : '';
  const html = `
    <p>New <strong>buyer / mortgage lead</strong> from kenfinch.ca${hot}</p>
    <h3>Contact</h3>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(fullName)}</li>
      <li><strong>Email:</strong> ${escapeHtml(lead.email)}</li>
      <li><strong>Phone:</strong> ${escapeHtml(lead.phone)}</li>
    </ul>
    <h3>Plans</h3>
    <ul>
      <li><strong>Goal:</strong> ${label('goal', lead.goal)}</li>
      <li><strong>Timeline:</strong> ${label('timeline', lead.timeline)}</li>
      <li><strong>Price range:</strong> ${label('priceRange', lead.priceRange)}</li>
      <li><strong>Areas:</strong> ${lead.areas.join(', ')}</li>
      <li><strong>First-time buyer:</strong> ${lead.firstTimeBuyer === 'yes' ? 'Yes' : 'No'}</li>
    </ul>
    <h3>Finances (self-reported)</h3>
    <ul>
      <li><strong>Down payment:</strong> ${label('downPayment', lead.downPayment)}</li>
      <li><strong>Household income:</strong> ${label('income', lead.income)}</li>
      <li><strong>Employment:</strong> ${label('employment', lead.employment)}</li>
      <li><strong>Credit:</strong> ${label('credit', lead.credit)}</li>
      <li><strong>Already pre-approved:</strong> ${lead.preApproved === 'yes' ? 'Yes' : lead.preApproved === 'no' ? 'No' : 'Not provided'}</li>
    </ul>
    ${lead.message ? `<h3>Message</h3><p>${escapeHtml(lead.message)}</p>` : ''}
    <hr>
    <p style="color:#666;font-size:12px">
      Lead ID: ${leadId || 'n/a (Firestore write failed)'} &middot; Source: ${escapeHtml(lead.source ?? 'site')} &middot; Page: ${escapeHtml(lead.page ?? '')}<br>
      The client was offered the Express Mortgage application link with externalId=${leadId || 'n/a'}. Look for it in Finmo.
    </p>
  `;

  try {
    await sendEmail({
      to: CONTACT.leadInbox,
      from: CONTACT.leadInbox,
      replyTo: lead.email,
      subject: `New Buyer Lead: ${fullName} - ${label('goal', lead.goal)} (${label('timeline', lead.timeline)})`,
      html,
    });
  } catch (err) {
    console.error('Lead email failed:', err);
    if (!leadId) {
      return { ok: false, error: 'We could not submit your request right now. Please call Ken directly.' };
    }
  }

  return { ok: true, leadId };
}
