/**
 * Selection logic for the 2-hour "lead waiting" nudge. Run with `npm run test:unit`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nudgeDue, waitingLabel, NUDGE_AFTER_MS } from './nudge';
import type { LeadRecord, SpamAssessment } from './types';

const NOW = new Date('2026-10-17T15:00:00.000Z');
const isTest = (name: string, email: string) => /^e2e-/i.test(email) || /\(ignore\)/i.test(name);

function lead(over: Partial<LeadRecord> = {}): LeadRecord {
  const createdAt = new Date(NOW.getTime() - 3 * 3600 * 1000).toISOString();
  return {
    id: 'abc123',
    type: 'contact',
    name: 'Pat Morgan',
    email: 'oakvillehome2026@gmail.com',
    emailKey: 'oakvillehome2026@gmail.com',
    phone: null,
    summary: 'General enquiry',
    hot: false,
    details: {},
    source: 'contact-form',
    page: '/contact',
    attribution: null,
    status: 'new',
    statusUpdatedAt: createdAt,
    notes: [],
    nextFollowUpAt: null,
    followUp: { token: 't', confirmationSentAt: null, checkinDueAt: createdAt, checkinSentAt: null, checkinReply: null, checkinRepliedAt: null },
    notify: { kenEmailAt: createdAt, kenSmsAt: null, kenNudgeAt: null, errors: [] },
    request: null,
    client: null,
    spam: null,
    createdAt,
    updatedAt: createdAt,
    ...over,
  };
}

const review: SpamAssessment = { version: 1, score: 4, verdict: 'review', reasons: [{ rule: 'token:missing', weight: 4 }], assessedAt: '', enforced: true, releasedAt: null, releasedBy: null, overriddenTo: null };

test('a New lead older than 2 hours with no prior nudge is due; younger ones are not', () => {
  assert.deepEqual(nudgeDue([lead()], NOW, isTest).map((l) => l.id), ['abc123']);
  const young = lead({ createdAt: new Date(NOW.getTime() - NUDGE_AFTER_MS + 60_000).toISOString() });
  assert.deepEqual(nudgeDue([young], NOW, isTest), []);
  const exact = lead({ createdAt: new Date(NOW.getTime() - NUDGE_AFTER_MS).toISOString() });
  assert.equal(nudgeDue([exact], NOW, isTest).length, 1);
});

test('only once: a lead with notify.kenNudgeAt set is never nudged again; legacy docs without the field still are', () => {
  assert.deepEqual(nudgeDue([lead({ notify: { kenEmailAt: null, kenSmsAt: null, kenNudgeAt: '2026-10-17T14:00:00.000Z', errors: [] } })], NOW, isTest), []);
  const legacy = lead();
  delete (legacy.notify as { kenNudgeAt?: string | null }).kenNudgeAt;
  assert.equal(nudgeDue([legacy], NOW, isTest).length, 1);
});

test('touched, held, quarantined and test leads are skipped', () => {
  assert.deepEqual(nudgeDue([lead({ status: 'contacted' })], NOW, isTest), []);
  assert.deepEqual(nudgeDue([lead({ status: 'spam' })], NOW, isTest), []);
  assert.deepEqual(nudgeDue([lead({ spam: review })], NOW, isTest), []);
  assert.equal(nudgeDue([lead({ spam: { ...review, releasedAt: '2026-10-17T13:00:00.000Z', releasedBy: 'ken' } })], NOW, isTest).length, 1, 'released by Ken counts as a real lead');
  assert.deepEqual(nudgeDue([lead({ email: 'e2e-contact@kenfinch.ca' })], NOW, isTest), []);
  assert.deepEqual(nudgeDue([lead({ name: 'QA (ignore)' })], NOW, isTest), []);
  assert.deepEqual(nudgeDue([lead({ id: '' })], NOW, isTest), []);
});

test('waitingLabel', () => {
  assert.equal(waitingLabel(new Date(NOW.getTime() - 125 * 60_000).toISOString(), NOW), '2 h 5 min');
  assert.equal(waitingLabel(new Date(NOW.getTime() - 120 * 60_000).toISOString(), NOW), '2 h');
  assert.equal(waitingLabel(new Date(NOW.getTime() - 40 * 60_000).toISOString(), NOW), '40 min');
});
