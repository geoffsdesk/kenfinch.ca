/**
 * Unified lead model. Every form on the site (buyer pre-approval, contact,
 * valuation expert-opinion, exit popup) becomes one document in the `leads`
 * Firestore collection with the same shape, so the dashboard, notifications,
 * check-ins and digest all work off a single pipeline.
 */

import { z } from 'zod';
import { SERVICE_AREAS } from '@/lib/site';

export const LEAD_TYPES = ['buyer', 'contact', 'valuation', 'popup'] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'application_started', 'won', 'lost', 'spam'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  application_started: 'Application started',
  won: 'Won',
  lost: 'Lost',
  spam: 'Spam',
};

export const TYPE_LABELS: Record<LeadType, string> = {
  buyer: 'Mortgage / buyer',
  contact: 'Contact form',
  valuation: 'Valuation request',
  popup: 'Email capture',
};

// ─── Input schemas (what the forms send) ─────────────────────────────────────

const base = {
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.string().max(80).optional(),
  page: z.string().max(200).optional(),
};

export const buyerLeadInput = z.object({
  type: z.literal('buyer'),
  firstName: z.string().trim().min(1, 'Please enter your first name.').max(80),
  lastName: z.string().trim().min(1, 'Please enter your last name.').max(80),
  phone: z.string().trim().min(7, 'Please enter a phone number Ken can reach you at.').max(30),
  goal: z.enum(['first-home', 'move-up', 'investment', 'refinance', 'not-sure']),
  timeline: z.enum(['0-3', '3-6', '6-12', 'exploring']),
  priceRange: z.enum(['under-750k', '750k-1m', '1m-1.5m', '1.5m-2.5m', 'over-2.5m', 'not-sure']),
  areas: z.array(z.enum(SERVICE_AREAS)).min(1, 'Pick at least one area.'),
  firstTimeBuyer: z.enum(['yes', 'no']),
  downPayment: z.enum(['under-5', '5-10', '10-20', '20-plus', 'not-sure']),
  income: z.enum(['under-100k', '100k-150k', '150k-250k', 'over-250k', 'prefer-not']).optional(),
  employment: z.enum(['salaried', 'self-employed', 'contract', 'retired', 'other']).optional(),
  credit: z.enum(['excellent', 'good', 'fair', 'not-sure']).optional(),
  preApproved: z.enum(['yes', 'no']).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm you would like Ken to contact you.' }) }),
  email: base.email,
  message: base.message,
  source: base.source,
  page: base.page,
});

export const contactLeadInput = z.object({
  type: z.literal('contact'),
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  intent: z.string().trim().max(120).optional(),
  ...base,
});

export const valuationLeadInput = z.object({
  type: z.literal('valuation'),
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  address: z.string().trim().min(1).max(300),
  estimate: z.number().nonnegative().optional(),
  confidence: z.number().min(0).max(1).optional(),
  property: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  ...base,
});

export const popupLeadInput = z.object({
  type: z.literal('popup'),
  name: z.string().trim().max(120).optional(),
  asset: z.string().trim().max(80),
  ...base,
});

export const leadInput = z.discriminatedUnion('type', [buyerLeadInput, contactLeadInput, valuationLeadInput, popupLeadInput]);
export type LeadInput = z.infer<typeof leadInput>;

// ─── Stored document ─────────────────────────────────────────────────────────

export interface LeadNote {
  at: string; // ISO
  text: string;
  by: 'ken' | 'system' | 'lead';
}

export interface LeadDoc {
  type: LeadType;
  name: string;
  email: string;
  phone: string | null;
  summary: string;
  hot: boolean;
  details: Record<string, unknown>;
  source: string;
  page: string;
  status: LeadStatus;
  statusUpdatedAt: string;
  notes: LeadNote[];
  nextFollowUpAt: string | null;
  followUp: {
    token: string;
    confirmationSentAt: string | null;
    checkinDueAt: string;
    checkinSentAt: string | null;
    checkinReply: 'yes' | 'no' | null;
    checkinRepliedAt: string | null;
  };
  notify: {
    kenEmailAt: string | null;
    kenSmsAt: string | null;
    errors: string[];
  };
  createdAt: string;
  updatedAt: string;
}

/** Shape returned to the dashboard (doc + id). */
export interface LeadRecord extends LeadDoc {
  id: string;
}

// ─── Labels shared by emails and dashboard ───────────────────────────────────

export const BUYER_LABELS: Record<string, Record<string, string>> = {
  goal: {
    'first-home': 'Buying my first home',
    'move-up': 'Moving up / relocating',
    investment: 'Investment property',
    refinance: 'Refinance or renewal',
    'not-sure': 'Not sure yet',
  },
  timeline: { '0-3': 'Within 3 months', '3-6': '3-6 months', '6-12': '6-12 months', exploring: 'Just exploring' },
  priceRange: {
    'under-750k': 'Under $750K',
    '750k-1m': '$750K-$1M',
    '1m-1.5m': '$1M-$1.5M',
    '1.5m-2.5m': '$1.5M-$2.5M',
    'over-2.5m': 'Over $2.5M',
    'not-sure': 'Not sure',
  },
  downPayment: { 'under-5': 'Less than 5%', '5-10': '5-10%', '10-20': '10-20%', '20-plus': '20%+', 'not-sure': 'Not sure' },
  income: { 'under-100k': 'Under $100K', '100k-150k': '$100K-$150K', '150k-250k': '$150K-$250K', 'over-250k': 'Over $250K', 'prefer-not': 'Prefer not to say' },
  employment: { salaried: 'Salaried / hourly', 'self-employed': 'Self-employed', contract: 'Contract', retired: 'Retired', other: 'Other' },
  credit: { excellent: 'Excellent (760+)', good: 'Good (680-759)', fair: 'Fair (below 680)', 'not-sure': 'Not sure' },
};

export function buyerLabel(field: string, value?: string | null) {
  if (!value) return 'Not provided';
  return BUYER_LABELS[field]?.[value] ?? value;
}
