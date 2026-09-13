/**
 * Ken's database: past clients, sphere and IDX registrants imported from the
 * legacy CRM export, plus anyone added later. Lives in the `crm_contacts`
 * collection (server-written only). Campaign state is stored on each contact
 * so the hourly job can send the next step without a separate queue.
 */

import { z } from 'zod';

export const CONTACT_SEGMENTS = ['sphere', 'idx-prospect', 'active-lead', 'past-client'] as const;
export type ContactSegment = (typeof CONTACT_SEGMENTS)[number];

export const CONTACT_STATUSES = ['active', 'unsubscribed', 'bounced', 'converted', 'excluded'] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONSENT_BASES = ['express', 'implied', 'unknown'] as const;
export type ConsentBasis = (typeof CONSENT_BASES)[number];

export const SEGMENT_LABELS: Record<ContactSegment, string> = {
  sphere: 'Sphere (personal contacts)',
  'idx-prospect': 'Search-site registrants',
  'active-lead': 'Active / new leads',
  'past-client': 'Past clients',
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  active: 'Active',
  unsubscribed: 'Unsubscribed',
  bounced: 'Bounced',
  converted: 'Converted to lead',
  excluded: 'Excluded by Ken',
};

/** One row as sent by the import script. */
export const contactImportRow = z.object({
  firstName: z.string().trim().max(80).default(''),
  lastName: z.string().trim().max(80).default(''),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  segment: z.enum(CONTACT_SEGMENTS),
  consentBasis: z.enum(CONSENT_BASES).default('unknown'),
  consentSource: z.string().trim().max(120).default(''),
  lastActivityYear: z.string().trim().max(4).default(''),
  source: z.string().trim().max(120).default(''),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  exclude: z.boolean().default(false),
  pastClient: z.boolean().default(false),
});
export type ContactImportRow = z.infer<typeof contactImportRow>;

export interface CampaignSend {
  step: string;
  at: string;
  messageId: string | null;
}

export interface ContactCampaignState {
  id: string; // campaign id, e.g. "reactivation-2026"
  enrolledAt: string;
  nextStep: string | null; // step key to send next; null = finished
  nextSendAt: string | null; // ISO
  sent: CampaignSend[];
  paused: boolean;
}

export interface ContactDoc {
  firstName: string;
  lastName: string;
  email: string; // lowercased; '' when unknown (phone-only sphere contacts)
  phone: string;
  segment: ContactSegment;
  status: ContactStatus;
  consent: { basis: ConsentBasis; source: string; reviewedByKen: boolean };
  lastActivityYear: string;
  source: string;
  tags: string[];
  token: string; // unsubscribe / link token
  campaign: ContactCampaignState | null;
  leadId: string | null; // set when the contact converts through a form
  importBatch: string;
  notes: { at: string; text: string; by: 'ken' | 'system' | 'contact' }[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactRecord extends ContactDoc {
  id: string;
}

export interface DatabaseStats {
  total: number;
  bySegment: Record<string, number>;
  byStatus: Record<string, number>;
  emailable: number; // active + has email + consent not unknown
  phoneOnly: number;
  campaign: {
    id: string;
    enrolled: number;
    finished: number;
    paused: number;
    dueNow: number;
    sentByStep: Record<string, number>;
    unsubscribed: number;
    converted: number;
  } | null;
  automation: { hourlyCap: number; paused: boolean; lastRunAt: string | null; lastRunSent: number; provider: string | null };
}
