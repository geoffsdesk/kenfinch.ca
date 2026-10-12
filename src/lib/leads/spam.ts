/**
 * Lead spam scoring. Pure: no I/O, no environment, only `import type` from
 * ./types so the unit tests can run under `node --import tsx --test` without
 * dragging in `@/lib/site`.
 *
 * Every rule that fires is recorded with its weight; the score is the plain
 * sum. Verdicts: clean (< REVIEW_AT), review (>= REVIEW_AT), spam (>= SPAM_AT).
 * Tune weights in RULES only.
 */

import type { LeadInput, LeadStatus, LeadRequestMeta, LeadClientSignals, SpamAssessment, SpamReason, SpamRule, SpamVerdict } from './types';

export type { SpamRule } from './types';

export const REVIEW_AT = 3;
export const SPAM_AT = 6;

/** rate:ip fires at RULES['rate:ip'] past this many leads from one network in 60 min ... */
export const IP_RATE_AT = 5;
/** ... and at RATE_IP_FLOOD past this many: a flood is quarantined (stored, nothing sent), never silently dropped. */
export const IP_FLOOD_AT = 30;
export const RATE_IP_FLOOD = 6;

/** Single tunable weight table. A weight of 0 records the signal without scoring it. */
export const RULES: Record<SpamRule, number> = {
  test: 10,
  honeypot: 10,
  // 6 only when Ken himself marked the prior lead spam (spam.overriddenTo) or the prior automatic
  // quarantine came from the same network (ipHash). An automatic verdict alone is worth 3: a bot
  // that posts junk under a real person's address must never be able to blackhole that person.
  'email:prior-spam': 6,
  // Review, not spam, until the /api/health probe has shown which header carries the client IP
  // and how many Google hops trail it (docs/spam-defense.md "After deploy"). Then restore 6.
  'rate:ip': 3,
  // 3 for > 2 in 24h; 6 for > 4 only when another positive rule also fired (same blackhole concern:
  // the counter includes quarantined junk sent under the victim's address).
  'rate:email': 6,
  'token:invalid': 6, // malformed, wrong form, or nonce already used
  // 4, not 3: with tokens enabled a payload without one never came through the page (the client
  // waits for the token before submitting, see form-guard.ts), and 3 was exactly REVIEW_AT, so any
  // -1 trust rule the sender could influence would have made a direct post clean.
  'token:missing': 4,
  'token:unsigned': 3, // well-formed, signed by a key we no longer hold (rotation) or never held
  'token:stale': 3, // older than 12 h
  'token:mismatch': 3, // 2 when only the network changed (mobile Wi-Fi -> LTE), 3 when the browser did
  'token:fast': 3, // 2 when 1500 <= ageMs < 3000
  'client:webdriver': 3,
  'client:no-interaction': 2,
  'renewal:forged': 4,
  'name:random': 4,
  'name:short': 1,
  'email:gmail-dots': 4,
  'email:vendor-domain': 2,
  'message:digits': 3,
  // Recorded, not scored: a message that repeats the phone is a human "call me" tell (the incident
  // bots' message digits never matched their phone). It also suppresses token:fast, see below.
  'message:equals-phone': 0,
  'message:url-self': 4,
  'message:url': 1,
  'intent:empty': 1,
  // Stays 0 until the /api/health probe proves the User-Agent survives the CDN; then raise to 5.
  'ua:automation': 0,
  // Trust rules only score when the token is 'ok' or 'disabled'. When a token rule fired they are
  // recorded at 0 so Ken still sees them: a trust signal must never pull a tokenless or forged
  // post below review.
  'trust:contact-token': -6,
  'trust:crm-email': -4,
  // Sender-controlled (they pick both the name and the address), so it is only applied when no
  // positive rule fired at all: it can label a clean lead, never rescue a suspicious one.
  'trust:name-in-email': -1,
};

/** Shared by Ken's email and the /ken inbox. */
export const REASON_LABELS: Record<SpamRule, string> = {
  test: 'Automated test submission',
  honeypot: 'Hidden field was filled',
  'email:prior-spam': 'Address previously marked spam',
  'rate:ip': 'Too many submissions from this network',
  'rate:email': 'Repeated submissions from this address',
  'token:invalid': 'Forged or reused form token',
  'token:missing': 'No form token (direct post)',
  'token:unsigned': 'Form token signed with an unknown key',
  'token:stale': 'Form token older than 12 hours',
  'token:mismatch': 'Form loaded from a different network or browser',
  'token:fast': 'Submitted within seconds of page load',
  'client:webdriver': 'Automated browser',
  'client:no-interaction': 'No typing or clicks before submit',
  'renewal:forged': 'Renewal payload does not match the form',
  'name:random': 'Random-letter name',
  'name:short': 'Very short name',
  'email:gmail-dots': 'Gmail dot-trick address',
  'email:vendor-domain': 'Vendor-style email domain',
  'message:digits': 'Message is only digits',
  'message:equals-phone': 'Message repeats the phone number',
  'message:url-self': "Links to sender's own domain",
  'message:url': 'Contains a link',
  'intent:empty': "Skipped 'How can Ken help?'",
  'ua:automation': 'Automation user agent',
  'trust:contact-token': "Came from Ken's campaign email",
  'trust:crm-email': 'Known database contact',
  'trust:name-in-email': 'Name matches email',
};

// ─── Email helpers ───────────────────────────────────────────────────────────

/**
 * Canonical key for "same mailbox": lowercase, +tag stripped for every domain,
 * dots stripped only for Gmail (which ignores them), googlemail -> gmail.
 */
export function normalizeEmail(raw: string): string {
  const e = raw.trim().toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 0) return e;
  let local = e.slice(0, at);
  let domain = e.slice(at + 1);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  local = local.split('+')[0];
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

/** Dots in the local part when the domain is Gmail; 0 for every other domain. */
export function gmailDotCount(raw: string): number {
  const e = raw.trim().toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 0) return 0;
  const domain = e.slice(at + 1);
  if (domain !== 'gmail.com' && domain !== 'googlemail.com') return 0;
  return (e.slice(0, at).match(/\./g) ?? []).length;
}

// ─── Request helpers ─────────────────────────────────────────────────────────

const isIp4 = (s: string) => /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split('.').every((g) => Number(g) <= 255);

/** Hex groups separated by ':' (3 to 8 of them, each at most 4 chars), so a bare word like "cafe" is not an address. */
const isIp6 = (s: string) => {
  if (!/^[0-9a-f:]+$/i.test(s)) return false;
  const groups = s.split(':');
  return groups.length >= 3 && groups.length <= 8 && groups.every((g) => g.length <= 4);
};

export const isIp = (s: string) => isIp4(s) || isIp6(s);

/**
 * Pick the real client IP. On Firebase App Hosting the Google load balancer
 * sets x-fah-client-ip and appends `<client>, <lb>` to x-forwarded-for, so the
 * penultimate XFF entry is the client; anything before it is spoofable.
 *
 * Trust rules: x-fah-client-ip is used only when the same address also appears
 * in x-forwarded-for (a client-supplied copy the LB failed to strip would not).
 * A lone XFF hop on Firebase is not trusted at all: until the /api/health probe
 * shows what the chain looks like it may be the CDN's own address, shared by
 * every visitor, and the rate rules key on this value.
 */
export function pickClientIp(fah: string | null, xff: string | null, onFirebase: boolean): { ip: string | null; source: LeadRequestMeta['ipSource'] } {
  const parts = (xff ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(isIp);
  const fahIp = fah?.trim() ?? '';
  if (onFirebase && fahIp && isIp(fahIp) && parts.includes(fahIp)) return { ip: fahIp, source: 'x-fah-client-ip' };
  // Probe of 2026-10-12 (docs/spam-defense.md): on App Hosting the chain is
  // "<client>, <google hop>, <google hop>", so the client is the third-last entry.
  if (onFirebase && parts.length >= 3) return { ip: parts[parts.length - 3], source: 'xff-client-hop' };
  if (onFirebase) return { ip: null, source: null };
  if (parts[0]) return { ip: parts[0], source: 'xff-first' };
  return { ip: null, source: null };
}

/** Only these sources are good enough to key rate limits on; `xff-first` is the local-dev / unknown-proxy fallback. */
export function ipTrustedForRate(source: LeadRequestMeta['ipSource']): boolean {
  return source === 'x-fah-client-ip' || source === 'xff-client-hop';
}

// ─── Content helpers ─────────────────────────────────────────────────────────

const SECOND_LEVEL = new Set(['co', 'com', 'net', 'org', 'gov', 'edu', 'ac']);

/** Registrable domain: last two labels, or three when the second-last is a public second level (bbc.co.uk). */
export function registrable(host: string): string {
  const labels = host.toLowerCase().replace(/\.$/, '').split('.').filter(Boolean);
  if (labels.length <= 2) return labels.join('.');
  const n = SECOND_LEVEL.has(labels[labels.length - 2]) ? 3 : 2;
  return labels.slice(-n).join('.');
}

const FREEMAIL = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'yahoo.com', 'yahoo.ca',
  'icloud.com', 'me.com', 'aol.com', 'protonmail.com', 'proton.me',
]);
const VENDOR_WORDS = ['hire', 'seo', 'leads', 'marketing', 'agency', 'outsourc', 'assist', 'promo', 'growth', 'ranking'];

const AUTOMATION_UA =
  /HeadlessChrome|PhantomJS|Puppeteer|Playwright|python-requests|python-urllib|Go-http-client|curl\/|Wget|libwww|Scrapy|okhttp|axios\/|node-fetch|undici|Java\/|Apache-HttpClient/i;

/** Hosts of every URL in the text (lowercased, no port). */
export function urlHosts(text: string): string[] {
  const hosts = new Set<string>();
  for (const m of text.matchAll(/https?:\/\/([^\s)\/?#]+)[^\s)]*/gi)) hosts.add(m[1].toLowerCase().replace(/:\d+$/, ''));
  for (const m of text.matchAll(/\b([a-z0-9-]+\.[a-z]{2,})\/[^\s)]*/gi)) hosts.add(m[1].toLowerCase());
  return [...hosts];
}

function interiorCaps(t: string): number {
  return (t.slice(1).match(/[A-Z]/g) ?? []).length;
}

function vowelRatio(t: string): number {
  return t.length ? (t.match(/[aeiouy]/gi) ?? []).length / t.length : 0;
}

/** A single whitespace-free token that looks keyboard-mashed. */
function randomToken(t: string): { caps: number } | null {
  if (!/^[A-Za-z]+$/.test(t) || t.length < 12) return null;
  const caps = interiorCaps(t);
  if (caps >= 3 || vowelRatio(t) < 0.25) return { caps };
  return null;
}

// ─── Rule engine ─────────────────────────────────────────────────────────────

export type TokenSignal = {
  state: 'ok' | 'missing' | 'invalid' | 'unsigned' | 'stale' | 'mismatch' | 'reused' | 'disabled';
  ageMs: number | null;
  mismatch?: 'ip' | 'ua' | 'ip+ua' | null;
};

export interface AssessContext {
  now: number;
  request: LeadRequestMeta | null;
  client: LeadClientSignals | null;
  token: TokenSignal;
  /** Counts INCLUDING this submission; null = unknown/skipped. */
  counters: { ip: number | null; email: number | null };
  /** Same emailKey, excluding this lead. `ipHash` is the prior lead's request.ipHash when it has one. */
  prior: Array<{ status: LeadStatus; spam: SpamAssessment | null; isTest: boolean; ipHash?: string | null }>;
  crmMatch: 'token' | 'email' | null;
}

/** Token states under which the trust rules may lower the score. Anything else is a payload that did not come through our page as issued. */
const TRUST_TOKEN_STATES: ReadonlySet<TokenSignal['state']> = new Set(['ok', 'disabled']);

const RENEWAL_INTENTS = ['Mortgage renewal', 'Mortgage renewal within 6 months'];

export function assessLead(input: LeadInput, ctx: AssessContext): SpamAssessment {
  const reasons: SpamReason[] = [];
  const fired = new Set<SpamRule>();
  const fire = (rule: SpamRule, weight = RULES[rule], detail?: string) => {
    if (fired.has(rule)) return;
    fired.add(rule);
    reasons.push(detail ? { rule, weight, detail: detail.slice(0, 80) } : { rule, weight });
  };

  const name = input.type === 'buyer' ? `${input.firstName} ${input.lastName}` : input.name ?? '';
  const message = input.message ?? '';
  const phoneDigits = (input.phone ?? '').replace(/\D/g, '');
  const messageDigits = message.replace(/[\s\-().+]/g, '');
  const email = input.email.trim().toLowerCase();
  const emailLocal = email.slice(0, Math.max(0, email.lastIndexOf('@')));
  const emailDomain = email.slice(email.lastIndexOf('@') + 1);

  // Hard signals
  if ((input.hp ?? '').trim() !== '') fire('honeypot', RULES.honeypot, `${(input.hp ?? '').length} chars`);

  // Prior spam from the same mailbox. Full weight needs Ken's own judgement (overriddenTo) or the
  // same network behind the automatic quarantine; an automatic verdict alone is review-level so a
  // bot cannot blackhole a real address by posting junk under it first.
  const priorSpam = ctx.prior.filter((p) => p.status === 'spam' && !p.isTest);
  if (priorSpam.length) {
    const ipHash = ctx.request?.ipHash ?? null;
    const byKen = priorSpam.some((p) => p.spam?.overriddenTo === 'spam');
    const sameNetwork = !!ipHash && priorSpam.some((p) => p.spam?.verdict === 'spam' && p.ipHash === ipHash);
    const strong = byKen || sameNetwork;
    fire('email:prior-spam', strong ? RULES['email:prior-spam'] : 3, byKen ? 'marked spam by Ken' : sameNetwork ? 'prior spam, same network' : 'prior spam lead');
  }

  if (ctx.counters.ip !== null) {
    if (ctx.counters.ip > IP_FLOOD_AT) fire('rate:ip', RATE_IP_FLOOD, `${ctx.counters.ip} in 60m (flood)`);
    else if (ctx.counters.ip > IP_RATE_AT) fire('rate:ip', RULES['rate:ip'], `${ctx.counters.ip} in 60m`);
  }
  // rate:email is scored after the content rules (see below): > 4 is worth 6 only with corroboration.

  switch (ctx.token.state) {
    case 'invalid':
      fire('token:invalid');
      break;
    case 'reused':
      fire('token:invalid', RULES['token:invalid'], 'token already used');
      break;
    case 'missing':
      fire('token:missing');
      break;
    case 'unsigned':
      fire('token:unsigned');
      break;
    case 'stale':
      fire('token:stale', RULES['token:stale'], ctx.token.ageMs !== null ? `${Math.round(ctx.token.ageMs / 3600_000)} h` : undefined);
      break;
    case 'mismatch': {
      const what = ctx.token.mismatch ?? 'ip+ua';
      fire('token:mismatch', what === 'ip' ? 2 : RULES['token:mismatch'], what);
      break;
    }
  }
  // Timing is deferred until the content rules have run: see message:equals-phone below.
  const fastWeight = ctx.token.state === 'ok' && ctx.token.ageMs !== null ? (ctx.token.ageMs < 1500 ? 3 : ctx.token.ageMs < 3000 ? 2 : 0) : 0;

  if (input.type === 'contact' && input.source === 'renewal-form') {
    if (!RENEWAL_INTENTS.includes(input.intent ?? '') || !message.startsWith('Renewal: ')) fire('renewal:forged');
  }

  // Client signals
  if (ctx.client) {
    if (ctx.client.webdriver === true) fire('client:webdriver');
    if (ctx.client.interactions === 0) fire('client:no-interaction');
  }

  // Content
  const nameTokens = input.type === 'buyer' ? [input.firstName, input.lastName] : [name];
  for (const t of nameTokens) {
    const r = randomToken(t.trim());
    if (r) {
      fire('name:random', RULES['name:random'], `${t.trim().length} letters, ${r.caps} caps`);
      break;
    }
  }
  if (/^[A-Za-z]{1,3}$/.test(name.trim())) fire('name:short');

  const dots = gmailDotCount(input.email);
  if (dots >= 3) fire('email:gmail-dots', RULES['email:gmail-dots'], `${dots} dots`);

  const reg = registrable(emailDomain);
  const vendorDomain = !FREEMAIL.has(emailDomain) && VENDOR_WORDS.some((w) => reg.split('.')[0].includes(w));
  if (vendorDomain) fire('email:vendor-domain', RULES['email:vendor-domain'], emailDomain);

  let equalsPhone = false;
  if (/^\d{7,}$/.test(messageDigits)) {
    fire('message:digits', RULES['message:digits'], `${messageDigits.length} digits`);
    equalsPhone = phoneDigits.length >= 10 && messageDigits.slice(-10) === phoneDigits.slice(-10);
    if (equalsPhone) fire('message:equals-phone');
  }
  // A person who pastes only their own number as the message ("call me") already carries
  // message:digits 3 + intent:empty 1; adding the timing rule would make a 5-8 s autofill
  // submit spam. Bots never repeat their phone, so timing is only suppressed in that case.
  if (fastWeight && !equalsPhone) fire('token:fast', fastWeight, `${ctx.token.ageMs} ms`);

  const hosts = urlHosts(message);
  if (hosts.length) {
    const self = hosts.find((h) => registrable(h) === reg);
    if (self) fire('message:url-self', RULES['message:url-self'], self);
    else fire('message:url', RULES['message:url'], hosts[0]);
  }

  if (input.type === 'contact' && input.source === 'contact-form' && (input.intent ?? '') === '' && phoneDigits.length >= 7 && message.trim().length > 0) {
    fire('intent:empty');
  }

  const ua = ctx.request?.ua ?? '';
  if (ua && AUTOMATION_UA.test(ua)) fire('ua:automation', RULES['ua:automation'], ua.slice(0, 40));

  // Repeated submissions from one mailbox. The counter includes quarantined junk, so a real person
  // whose address a bot has used stays at review (Ken emailed) unless something else is off too.
  if (ctx.counters.email !== null && ctx.counters.email > 2) {
    const otherPositive = reasons.some((r) => r.weight > 0);
    const heavy = ctx.counters.email > 4 && otherPositive;
    fire('rate:email', heavy ? RULES['rate:email'] : 3, `${ctx.counters.email} in 24h`);
  }

  // Trust. Only a payload that came through our page as issued (or with tokens off) may be
  // pulled down by what we know about the sender; otherwise the match is recorded at 0.
  const trustApplies = TRUST_TOKEN_STATES.has(ctx.token.state);
  const trustNote = trustApplies ? undefined : `not applied: token ${ctx.token.state}`;
  if (ctx.crmMatch === 'token') fire('trust:contact-token', trustApplies ? RULES['trust:contact-token'] : 0, trustNote);
  else if (ctx.crmMatch === 'email') fire('trust:crm-email', trustApplies ? RULES['trust:crm-email'] : 0, trustNote);

  // The sender chooses both the name and the address, so this match can only label a lead that
  // nothing else flagged. A vendor mailbox named after its sender (chloe@vas4hire.com) is a pitch.
  if (!vendorDomain && trustApplies && !reasons.some((r) => r.weight > 0)) {
    const token = name
      .split(/\s+/)
      .map((t) => t.replace(/[^A-Za-z]/g, '').toLowerCase())
      .find((t) => t.length >= 3 && emailLocal.includes(t));
    if (token) fire('trust:name-in-email', RULES['trust:name-in-email'], token);
  }

  reasons.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  const score = reasons.reduce((s, r) => s + r.weight, 0);
  const verdict: SpamVerdict = score >= SPAM_AT ? 'spam' : score >= REVIEW_AT ? 'review' : 'clean';
  return {
    version: 1,
    score,
    verdict,
    reasons,
    assessedAt: new Date(ctx.now).toISOString(),
    enforced: true,
    releasedAt: null,
    releasedBy: null,
    overriddenTo: null,
  };
}
