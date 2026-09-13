/**
 * Firestore access for `crm_contacts` (Admin SDK, server only).
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { newToken, nowIso } from '@/lib/leads/store';
import type { ContactDoc, ContactImportRow, ContactRecord, ContactStatus, DatabaseStats } from './types';

export const CONTACTS_COLLECTION = 'crm_contacts';
const SYSTEM_DOC = 'system/database_campaign';

export function toContact(id: string, raw: FirebaseFirestore.DocumentData): ContactRecord {
  return { id, ...(raw as ContactDoc) };
}

export async function listContacts(limit = 5000): Promise<ContactRecord[]> {
  const snap = await getAdminDb().collection(CONTACTS_COLLECTION).limit(limit).get();
  return snap.docs.map((d) => toContact(d.id, d.data()));
}

export async function getContact(id: string): Promise<ContactRecord | null> {
  const snap = await getAdminDb().collection(CONTACTS_COLLECTION).doc(id).get();
  return snap.exists ? toContact(snap.id, snap.data()!) : null;
}

export async function findContactByToken(token: string): Promise<ContactRecord | null> {
  if (!/^[a-f0-9]{32}$/i.test(token)) return null;
  const snap = await getAdminDb().collection(CONTACTS_COLLECTION).where('token', '==', token).limit(1).get();
  return snap.empty ? null : toContact(snap.docs[0].id, snap.docs[0].data());
}

export async function findContactByEmail(email: string): Promise<ContactRecord | null> {
  const e = email.trim().toLowerCase();
  if (!e) return null;
  const snap = await getAdminDb().collection(CONTACTS_COLLECTION).where('email', '==', e).limit(1).get();
  return snap.empty ? null : toContact(snap.docs[0].id, snap.docs[0].data());
}

export async function patchContact(id: string, patch: Record<string, unknown>) {
  await getAdminDb().collection(CONTACTS_COLLECTION).doc(id).update({ ...patch, updatedAt: nowIso() });
}

export async function setContactStatus(id: string, status: ContactStatus, note: string, by: 'ken' | 'system' | 'contact' = 'system') {
  const c = await getContact(id);
  if (!c) return;
  const at = nowIso();
  const patch: Record<string, unknown> = { status, notes: [...(c.notes ?? []), { at, text: note, by }] };
  if (status !== 'active' && c.campaign) patch['campaign.nextSendAt'] = null;
  await patchContact(id, patch);
}

/**
 * Upsert import rows. Existing contacts are matched by email (or phone when
 * there is no email) and only the review fields (segment, consent, exclude,
 * pastClient, tags) are refreshed, so campaign state survives re-imports.
 */
export async function importContacts(rows: ContactImportRow[], batch: string) {
  const db = getAdminDb();
  const existing = await listContacts();
  const byEmail = new Map(existing.filter((c) => c.email).map((c) => [c.email, c]));
  const byPhone = new Map(existing.filter((c) => !c.email && c.phone).map((c) => [digits(c.phone), c]));
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let writer = db.batch();
  let pending = 0;
  const flush = async () => {
    if (pending) await writer.commit();
    writer = db.batch();
    pending = 0;
  };
  for (const r of rows) {
    const email = (r.email ?? '').toLowerCase();
    const phone = (r.phone ?? '').trim();
    if (!email && digits(phone).length < 10) {
      skipped += 1;
      continue;
    }
    const segment = r.pastClient ? 'past-client' : r.segment;
    const status: ContactStatus = r.exclude ? 'excluded' : 'active';
    const match = email ? byEmail.get(email) : byPhone.get(digits(phone));
    const at = nowIso();
    if (match) {
      const patch: Record<string, unknown> = {
        segment,
        'consent.basis': r.consentBasis,
        'consent.source': r.consentSource,
        tags: r.tags,
        lastActivityYear: r.lastActivityYear || match.lastActivityYear,
        updatedAt: at,
      };
      if (r.exclude && match.status === 'active') patch.status = 'excluded';
      if (!r.exclude && match.status === 'excluded') patch.status = 'active';
      if (phone && !match.phone) patch.phone = phone;
      writer.update(db.collection(CONTACTS_COLLECTION).doc(match.id), patch as FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>);
      updated += 1;
    } else {
      const doc: ContactDoc = {
        firstName: r.firstName,
        lastName: r.lastName,
        email,
        phone,
        segment,
        status,
        consent: { basis: r.consentBasis, source: r.consentSource, reviewedByKen: false },
        lastActivityYear: r.lastActivityYear,
        source: r.source,
        tags: r.tags,
        token: newToken(),
        campaign: null,
        leadId: null,
        importBatch: batch,
        notes: [],
        createdAt: at,
        updatedAt: at,
      };
      const ref = db.collection(CONTACTS_COLLECTION).doc();
      writer.set(ref, doc);
      if (email) byEmail.set(email, { id: ref.id, ...doc });
      else byPhone.set(digits(phone), { id: ref.id, ...doc });
      created += 1;
    }
    pending += 1;
    if (pending >= 400) await flush();
  }
  await flush();
  return { created, updated, skipped };
}

export function digits(s: string) {
  return (s || '').replace(/\D/g, '').slice(-10);
}

// ─── Campaign automation state ───────────────────────────────────────────────

export interface CampaignSystemState {
  hourlyCap: number;
  paused: boolean;
  /** Step keys Ken has approved for sending; unapproved steps wait (nextSendAt untouched). */
  enabledSteps: string[];
  lastRunAt: string | null;
  lastRunSent: number;
  sentToday: number;
  sentTodayDate: string;
}

const DEFAULT_STATE: CampaignSystemState = { hourlyCap: 8, paused: false, enabledSteps: ['e1'], lastRunAt: null, lastRunSent: 0, sentToday: 0, sentTodayDate: '' };

export async function getCampaignState(): Promise<CampaignSystemState> {
  const snap = await getAdminDb().doc(SYSTEM_DOC).get();
  return { ...DEFAULT_STATE, ...(snap.exists ? (snap.data() as Partial<CampaignSystemState>) : {}) };
}

export async function setCampaignState(patch: Partial<CampaignSystemState>) {
  await getAdminDb().doc(SYSTEM_DOC).set(patch, { merge: true });
}

export function summarize(contacts: ContactRecord[], campaignId: string, state: CampaignSystemState, provider: string | null): DatabaseStats {
  const bySegment: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let emailable = 0;
  let phoneOnly = 0;
  const now = Date.now();
  const camp = { id: campaignId, enrolled: 0, finished: 0, paused: 0, dueNow: 0, sentByStep: {} as Record<string, number>, unsubscribed: 0, converted: 0 };
  for (const c of contacts) {
    bySegment[c.segment] = (bySegment[c.segment] ?? 0) + 1;
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    if (c.status === 'active' && c.email && c.consent.basis !== 'unknown') emailable += 1;
    if (!c.email && c.phone) phoneOnly += 1;
    if (c.campaign?.id === campaignId) {
      camp.enrolled += 1;
      if (!c.campaign.nextStep) camp.finished += 1;
      if (c.campaign.paused) camp.paused += 1;
      if (c.status === 'active' && c.campaign.nextSendAt && new Date(c.campaign.nextSendAt).getTime() <= now && !c.campaign.paused) camp.dueNow += 1;
      for (const s of c.campaign.sent) camp.sentByStep[s.step] = (camp.sentByStep[s.step] ?? 0) + 1;
      if (c.status === 'unsubscribed') camp.unsubscribed += 1;
      if (c.status === 'converted' || c.leadId) camp.converted += 1;
    }
  }
  return {
    total: contacts.length,
    bySegment,
    byStatus,
    emailable,
    phoneOnly,
    campaign: camp.enrolled ? camp : null,
    automation: { hourlyCap: state.hourlyCap, paused: state.paused, enabledSteps: state.enabledSteps, lastRunAt: state.lastRunAt, lastRunSent: state.lastRunSent, provider },
  };
}
