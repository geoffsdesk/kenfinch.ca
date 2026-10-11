/**
 * Request metadata captured on every lead so spam can be traced to a network
 * and a client. Raw values are kept 60 days (the cron scrubs ip/xff/fahIp/ua),
 * the salted ipHash stays for correlation.
 */

import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { pickClientIp } from './spam';
import type { LeadRequestMeta } from './types';

export async function readRequestMeta(): Promise<LeadRequestMeta | null> {
  let h: Headers;
  try {
    h = await headers();
  } catch {
    return null;
  }
  const onFirebase = !!(process.env.FIREBASE_CONFIG || process.env.K_SERVICE);
  const fah = h.get('x-fah-client-ip');
  const xff = h.get('x-forwarded-for');
  const { ip, source } = pickClientIp(fah, xff, onFirebase);
  const salt = process.env.LEAD_FORM_SECRET || process.env.CRON_SECRET || 'kf';
  return {
    ip,
    ipSource: source,
    ipHash: ip ? createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32) : null,
    xff,
    fahIp: fah,
    ua: h.get('user-agent'),
    lang: h.get('accept-language'),
    referer: h.get('referer'),
    origin: h.get('origin'),
    fetchSite: h.get('sec-fetch-site'),
    via: h.get('via'),
    capturedAt: new Date().toISOString(),
    scrubbedAt: null,
  };
}
