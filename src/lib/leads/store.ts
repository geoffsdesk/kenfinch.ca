/**
 * Firestore access for the unified `leads` collection (Admin SDK, server only).
 */

import { randomBytes } from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import type { LeadDoc, LeadRecord, LeadStatus, LeadNote } from './types';

export const LEADS_COLLECTION = 'leads';
const SYSTEM_DOC = 'system/lead_automation';

export function nowIso() {
  return new Date().toISOString();
}

export function newToken() {
  return randomBytes(16).toString('hex');
}

/** Legacy popup docs (pre-pipeline) lack most fields; normalise on read. */
export function toRecord(id: string, raw: FirebaseFirestore.DocumentData): LeadRecord {
  const created =
    typeof raw.createdAt === 'string'
      ? raw.createdAt
      : raw.createdAt?.toDate?.()?.toISOString?.() ?? raw.submittedAt?.toDate?.()?.toISOString?.() ?? nowIso();
  return {
    id,
    type: raw.type ?? 'popup',
    name: raw.name ?? 'Not provided',
    email: raw.email ?? '',
    phone: raw.phone ?? null,
    summary: raw.summary ?? (raw.asset ? `Email capture: ${raw.asset}` : ''),
    hot: !!raw.hot,
    details: raw.details ?? {},
    source: raw.source ?? '',
    page: raw.page ?? '',
    status: raw.status ?? 'new',
    statusUpdatedAt: raw.statusUpdatedAt ?? created,
    notes: raw.notes ?? [],
    nextFollowUpAt: raw.nextFollowUpAt ?? null,
    followUp: raw.followUp ?? {
      token: '',
      confirmationSentAt: null,
      checkinDueAt: created,
      checkinSentAt: null,
      checkinReply: null,
      checkinRepliedAt: null,
    },
    notify: raw.notify ?? { kenEmailAt: null, kenSmsAt: null, errors: [] },
    createdAt: created,
    updatedAt: raw.updatedAt ?? created,
  };
}

export async function insertLead(doc: LeadDoc): Promise<string> {
  const db = getAdminDb();
  const ref = await db.collection(LEADS_COLLECTION).add(doc);
  return ref.id;
}

export async function patchLead(id: string, patch: Record<string, unknown>) {
  const db = getAdminDb();
  await db.collection(LEADS_COLLECTION).doc(id).set({ ...patch, updatedAt: nowIso() }, { merge: true });
}

export async function getLead(id: string): Promise<LeadRecord | null> {
  const db = getAdminDb();
  const snap = await db.collection(LEADS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return toRecord(snap.id, snap.data()!);
}

export async function listLeads(limit = 300): Promise<LeadRecord[]> {
  const db = getAdminDb();
  // createdAt is an ISO string on new docs; legacy popup docs only have a
  // Timestamp `submittedAt`. Fetch both and merge in memory (volumes are small).
  const [modern, legacy] = await Promise.all([
    db.collection(LEADS_COLLECTION).orderBy('createdAt', 'desc').limit(limit).get(),
    db.collection(LEADS_COLLECTION).orderBy('submittedAt', 'desc').limit(limit).get().catch(() => null),
  ]);
  const seen = new Map<string, LeadRecord>();
  modern.docs.forEach((d) => seen.set(d.id, toRecord(d.id, d.data())));
  legacy?.docs.forEach((d) => {
    if (!seen.has(d.id)) seen.set(d.id, toRecord(d.id, d.data()));
  });
  return [...seen.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, limit);
}

export async function findLeadByPhone(digits: string): Promise<LeadRecord | null> {
  // Match on the last 10 digits so "+1 (416) 555-0123" and "4165550123" agree.
  const tail = digits.replace(/\D/g, '').slice(-10);
  if (tail.length < 10) return null;
  const leads = await listLeads(500);
  return leads.find((l) => (l.phone ?? '').replace(/\D/g, '').slice(-10) === tail) ?? null;
}

export async function setStatus(id: string, status: LeadStatus, by: LeadNote['by'] = 'ken') {
  const at = nowIso();
  const lead = await getLead(id);
  if (!lead) throw new Error('Lead not found');
  const note: LeadNote = { at, text: `Status changed to ${status}`, by };
  await patchLead(id, { status, statusUpdatedAt: at, notes: [...lead.notes, note] });
}

export async function addNote(id: string, text: string, by: LeadNote['by'] = 'ken') {
  const lead = await getLead(id);
  if (!lead) throw new Error('Lead not found');
  const note: LeadNote = { at: nowIso(), text, by };
  await patchLead(id, { notes: [...lead.notes, note] });
}

export async function recordCheckinReply(id: string, reply: 'yes' | 'no', via: 'sms' | 'email') {
  const lead = await getLead(id);
  if (!lead) throw new Error('Lead not found');
  const at = nowIso();
  const note: LeadNote = { at, text: `Check-in reply via ${via}: ${reply.toUpperCase()}`, by: 'lead' };
  const patch: Record<string, unknown> = {
    'followUp.checkinReply': reply,
    'followUp.checkinRepliedAt': at,
    notes: [...lead.notes, note],
  };
  // A "yes" from the lead is strong evidence of contact; promote status.
  if (reply === 'yes' && lead.status === 'new') {
    patch.status = 'contacted';
    patch.statusUpdatedAt = at;
  }
  await getAdminDb().collection(LEADS_COLLECTION).doc(id).update({ ...patch, updatedAt: at });
}

export async function getSystemState(): Promise<Record<string, unknown>> {
  const snap = await getAdminDb().doc(SYSTEM_DOC).get();
  return snap.exists ? (snap.data() as Record<string, unknown>) : {};
}

export async function setSystemState(patch: Record<string, unknown>) {
  await getAdminDb().doc(SYSTEM_DOC).set(patch, { merge: true });
}
