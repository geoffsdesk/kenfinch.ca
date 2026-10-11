/**
 * Sliding-window counters (`rate_limits`) and single-use form-token nonces
 * (`form_nonces`) in Firestore, Admin SDK only; neither collection has a client
 * rule, so clients are denied by default. Doc ids are hashes so raw IPs,
 * emails and tokens never appear as ids. `expiresAt` is meant for a Firestore
 * TTL policy (see docs/spam-defense.md); the cron purge is the fallback until
 * that is enabled.
 */

import { createHash } from 'node:crypto';
import { getAdminDb, admin } from '@/lib/firebase-admin';

export const RATE_COLLECTION = 'rate_limits';
export const NONCE_COLLECTION = 'form_nonces';

/** Returns the count in the current window INCLUDING this call, or null when Firestore is unavailable (fail open). */
export async function bumpCounter(scope: 'ip' | 'email', key: string, windowMs: number): Promise<number | null> {
  try {
    const db = getAdminDb();
    const id = createHash('sha256').update(`${scope}:${key}`).digest('hex').slice(0, 40);
    const ref = db.collection(RATE_COLLECTION).doc(id);
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const now = Date.now();
      const d = snap.exists ? snap.data()! : null;
      const fresh = !d || now - new Date(d.windowStart as string).getTime() > windowMs;
      const count = fresh ? 1 : (d!.count as number) + 1;
      tx.set(ref, {
        scope,
        count,
        windowStart: fresh ? new Date(now).toISOString() : d!.windowStart,
        expiresAt: admin.firestore.Timestamp.fromMillis(now + windowMs * 2),
      });
      return count;
    });
  } catch (err) {
    console.error('rate counter failed:', err);
    return null;
  }
}

/**
 * Marks a form-token nonce as used. Returns `true` the first time, `false` when
 * the same nonce was already consumed (a replayed token), `null` when Firestore
 * is unavailable (fail open, like the counters).
 */
export async function claimNonce(nonce: string, ttlMs: number): Promise<boolean | null> {
  try {
    const db = getAdminDb();
    const id = createHash('sha256').update(`nonce:${nonce}`).digest('hex').slice(0, 40);
    const ref = db.collection(NONCE_COLLECTION).doc(id);
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists) return false;
      const now = Date.now();
      tx.set(ref, { usedAt: new Date(now).toISOString(), expiresAt: admin.firestore.Timestamp.fromMillis(now + ttlMs) });
      return true;
    });
  } catch (err) {
    console.error('nonce claim failed:', err);
    return null;
  }
}

async function purgeExpired(collection: string, limit: number, label: string): Promise<number> {
  try {
    const db = getAdminDb();
    const snap = await db.collection(collection).where('expiresAt', '<', admin.firestore.Timestamp.now()).limit(limit).get();
    if (snap.empty) return 0;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return snap.size;
  } catch (err) {
    console.error(`${label} purge failed:`, err);
    return 0;
  }
}

/** Deletes up to `limit` expired counter docs; returns how many went. Errors -> 0. */
export const purgeExpiredCounters = (limit = 100) => purgeExpired(RATE_COLLECTION, limit, 'rate counter');

/** Deletes up to `limit` expired nonce docs; returns how many went. Errors -> 0. */
export const purgeExpiredNonces = (limit = 100) => purgeExpired(NONCE_COLLECTION, limit, 'form nonce');
