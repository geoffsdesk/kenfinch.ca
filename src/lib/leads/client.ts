"use client";

/**
 * Client-side entry point for every form. Attaches marketing attribution and
 * the current page before calling the server action.
 */

import { createLead, type CreateLeadResult } from '@/app/actions/leads';
import { getAttribution } from '@/lib/attribution';

export async function submitLead(input: Record<string, unknown>): Promise<CreateLeadResult> {
  return createLead({
    ...input,
    page: input.page ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
    attribution: getAttribution(),
  });
}
