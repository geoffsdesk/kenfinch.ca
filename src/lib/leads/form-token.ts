/**
 * Signed, timestamped, client-bound form tokens. A form asks the server for one
 * when it mounts and sends it back with the submission, so the server knows
 * (a) the payload came through our page, (b) how long the visitor had the form
 * open, and (c) that the submission comes from the same network and browser
 * that loaded the form.
 *
 * Signing keys: LEAD_FORM_SECRET, then LEAD_FORM_SECRET_PREVIOUS (rotation
 * grace), then CRON_SECRET. A token signed by any configured key verifies, so
 * creating or rotating a secret never quarantines a visitor who loaded the
 * form before the rollout. When no key is set tokens are disabled and no token
 * rule fires.
 *
 * Verify states and how spam.ts scores them:
 *   ok        -> only the timing rule (token:fast) can fire
 *   missing   -> token:missing  (4)   no token while tokens are enabled
 *   unsigned  -> token:unsigned (3)   well-formed, signature matches no key
 *   stale     -> token:stale    (3)   older than TOKEN_MAX_AGE_MS
 *   mismatch  -> token:mismatch (2/3) bound to another network / browser
 *   reused    -> token:invalid  (6)   nonce already consumed (set by createLead)
 *   invalid   -> token:invalid  (6)   malformed or issued for another form
 *   disabled  -> nothing
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const FORM_IDS = ['contact', 'renewal', 'buyer', 'valuation', 'popup'] as const;
export type FormId = (typeof FORM_IDS)[number];

/** A token older than this is scored as stale (review), never as spam: long-open tabs are human. */
export const TOKEN_MAX_AGE_MS = 12 * 3600 * 1000;

/** Every key a token may have been signed with, newest first, deduplicated. */
export function signingSecrets(env: Record<string, string | undefined> = process.env): string[] {
  const list = [env.LEAD_FORM_SECRET, env.LEAD_FORM_SECRET_PREVIOUS, env.CRON_SECRET].filter((s): s is string => !!s);
  return [...new Set(list)];
}

export const tokenEnabled = () => signingSecrets().length > 0;

/** What the token is bound to. Both halves are hashed before they enter the token. */
export interface TokenBinding {
  ipHash: string | null;
  ua: string | null;
}

const tag = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 8);

/** 16 hex chars: 8 for the network, 8 for the browser. */
export function bindingTag(bind: TokenBinding): string {
  return tag(`ip:${bind.ipHash ?? ''}`) + tag(`ua:${bind.ua ?? ''}`);
}

function sign(body: string, s: string) {
  return createHmac('sha256', s).update(body).digest('hex').slice(0, 32);
}

function toList(s: string | string[]): string[] {
  return (Array.isArray(s) ? s : [s]).filter(Boolean);
}

export function issueFormToken(formId: FormId, bind: TokenBinding, now = Date.now(), s: string | string[] = signingSecrets()): string {
  const [key] = toList(s);
  if (!key) return '';
  const body = `v1.${formId}.${now}.${randomBytes(6).toString('hex')}.${bindingTag(bind)}`;
  return `${body}.${sign(body, key)}`;
}

export type TokenState = 'ok' | 'missing' | 'invalid' | 'unsigned' | 'stale' | 'mismatch' | 'reused' | 'disabled';

export type TokenCheck = {
  state: TokenState;
  ageMs: number | null;
  /** Issue nonce, present whenever the token parsed and verified against a key. createLead uses it for single-use enforcement. */
  nonce: string | null;
  /** For `mismatch`: which half of the binding differed. */
  mismatch: 'ip' | 'ua' | 'ip+ua' | null;
};

const TOKEN_RE = /^v1\.([a-z]+)\.(\d{10,16})\.([0-9a-f]{12})\.([0-9a-f]{16})\.([0-9a-f]{32})$/;

const fail = (state: TokenState): TokenCheck => ({ state, ageMs: null, nonce: null, mismatch: null });

export function verifyFormToken(
  token: string | undefined,
  expected: FormId,
  bind: TokenBinding,
  now = Date.now(),
  s: string | string[] = signingSecrets(),
): TokenCheck {
  const keys = toList(s);
  if (!keys.length) return fail('disabled');
  if (!token) return fail('missing');
  const m = TOKEN_RE.exec(token);
  if (!m) return fail('invalid');
  const [, formId, ts, nonce, boundTag, sig] = m;
  if (formId !== expected) return fail('invalid');

  const body = `v1.${formId}.${ts}.${nonce}.${boundTag}`;
  const given = Buffer.from(sig);
  const signed = keys.some((k) => {
    const exp = Buffer.from(sign(body, k));
    return exp.length === given.length && timingSafeEqual(exp, given);
  });
  if (!signed) return fail('unsigned');

  const ageMs = now - Number(ts);
  const nonceKey = `${ts}.${nonce}`;

  const expectedTag = bindingTag(bind);
  if (boundTag !== expectedTag) {
    const ipSame = boundTag.slice(0, 8) === expectedTag.slice(0, 8);
    const uaSame = boundTag.slice(8) === expectedTag.slice(8);
    const mismatch = !ipSame && !uaSame ? 'ip+ua' : !ipSame ? 'ip' : 'ua';
    return { state: 'mismatch', ageMs, nonce: nonceKey, mismatch };
  }

  if (ageMs > TOKEN_MAX_AGE_MS) return { state: 'stale', ageMs, nonce: nonceKey, mismatch: null };
  return { state: 'ok', ageMs, nonce: nonceKey, mismatch: null };
}
