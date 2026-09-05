/**
 * Marketing attribution captured in the browser and attached to every lead.
 *
 * Rules:
 *  - A visit carrying UTM params or an ad click id (gclid / fbclid / msclkid)
 *    overwrites whatever was stored ("last paid touch wins").
 *  - An organic visit never overwrites a stored paid touch, but is recorded
 *    if nothing is stored yet (so organic leads still show a landing page
 *    and referrer).
 *  - Stored for 30 days in localStorage; falls back gracefully when storage
 *    is unavailable.
 */

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  landingPage?: string;
  referrer?: string;
  firstSeenAt?: string;
}

const KEY = 'kf_attribution';
const TTL_MS = 30 * 24 * 3600 * 1000;
const PARAMS: (keyof Attribution)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid'];

function read(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    if (parsed.firstSeenAt && Date.now() - new Date(parsed.firstSeenAt).getTime() > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(a: Attribution) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* storage unavailable */
  }
}

/** Call on every page load (client). Idempotent. */
export function captureAttribution() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const fromUrl: Attribution = {};
  PARAMS.forEach((k) => {
    const v = url.searchParams.get(k);
    if (v) fromUrl[k] = v.slice(0, 200);
  });
  const isPaidTouch = Object.keys(fromUrl).length > 0;
  const existing = read();

  if (isPaidTouch || !existing) {
    // Infer source/medium from click ids when UTMs are absent.
    if (fromUrl.gclid && !fromUrl.utm_source) {
      fromUrl.utm_source = 'google';
      fromUrl.utm_medium = 'cpc';
    }
    if (fromUrl.fbclid && !fromUrl.utm_source) {
      fromUrl.utm_source = 'facebook';
      fromUrl.utm_medium = 'paid-social';
    }
    write({
      ...fromUrl,
      landingPage: url.pathname + (url.search ? url.search : ''),
      referrer: document.referrer ? document.referrer.slice(0, 300) : undefined,
      firstSeenAt: new Date().toISOString(),
    });
  }
}

/** Attribution to attach to a lead (client). */
export function getAttribution(): Attribution | undefined {
  if (typeof window === 'undefined') return undefined;
  return read() ?? undefined;
}

/** Short human label, e.g. "google / cpc / oakville-buyers". */
export function attributionLabel(a?: Attribution | null): string {
  if (!a) return 'direct';
  const parts = [a.utm_source, a.utm_medium, a.utm_campaign].filter(Boolean);
  if (parts.length) return parts.join(' / ');
  if (a.referrer) {
    try {
      return `referral: ${new URL(a.referrer).hostname}`;
    } catch {
      return 'referral';
    }
  }
  return 'direct / organic';
}
