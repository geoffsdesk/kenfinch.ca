/**
 * One-time "lead waiting" nudge to Ken. Pure selection logic (imports only
 * types) so nudge.test.ts runs under `node --import tsx --test`; the hourly
 * cron (src/app/api/cron/leads/route.ts) does the sending.
 *
 * A lead is due when it is still New, not held for review or quarantined, not
 * a test submission, older than NUDGE_AFTER_MS and has never been nudged
 * (`notify.kenNudgeAt`). The nudge goes to Ken only, never to the sender.
 */

import type { LeadRecord } from './types';

export const NUDGE_AFTER_MS = 2 * 3600 * 1000;

/** Held for review (possible spam, not yet released by Ken) or quarantined: no automatic outreach. */
export function isHeld(l: Pick<LeadRecord, 'status' | 'spam'>): boolean {
  return l.status === 'spam' || (l.spam?.verdict === 'review' && !l.spam.releasedAt);
}

export function nudgeDue(leads: LeadRecord[], now: Date, isTest: (name: string, email: string) => boolean): LeadRecord[] {
  const cutoff = now.getTime() - NUDGE_AFTER_MS;
  return leads.filter(
    (l) =>
      !!l.id &&
      l.status === 'new' &&
      !isHeld(l) &&
      !isTest(l.name, l.email) &&
      !l.notify?.kenNudgeAt &&
      new Date(l.createdAt).getTime() <= cutoff,
  );
}

/** Minutes a lead has been waiting, for the nudge copy. */
export function waitingLabel(createdAt: string, now: Date): string {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(createdAt).getTime()) / 60_000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
