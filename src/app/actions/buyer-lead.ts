'use server';

/**
 * Buyer / mortgage pre-approval intake. Thin wrapper over the unified lead
 * pipeline (see ./leads.ts) kept for the BuyerLeadForm's existing contract.
 */

import { createLead } from './leads';

export type BuyerLeadResult = { ok: true; leadId: string } | { ok: false; error: string };

export async function submitBuyerLead(raw: unknown): Promise<BuyerLeadResult> {
  const input = typeof raw === 'object' && raw !== null ? { ...(raw as Record<string, unknown>), type: 'buyer' } : raw;
  return createLead(input);
}
