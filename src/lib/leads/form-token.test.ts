import { test } from 'node:test';
import assert from 'node:assert/strict';
import { issueFormToken, verifyFormToken, bindingTag, signingSecrets, FORM_IDS, TOKEN_MAX_AGE_MS, type TokenBinding } from './form-token';

const SECRET = 'test-secret';
const T0 = 1_760_000_000_000;
const PHONE: TokenBinding = { ipHash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) Safari/605.1.15' };
const SAME_PHONE_OTHER_NETWORK: TokenBinding = { ...PHONE, ipHash: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' };
const OTHER_BROWSER: TokenBinding = { ...PHONE, ua: 'python-requests/2.31' };
const NOTHING: TokenBinding = { ipHash: null, ua: null };

const ok = (ageMs: number, nonce: string) => ({ state: 'ok', ageMs, nonce, mismatch: null });
const nonceOf = (token: string) => token.split('.').slice(2, 4).join('.');

test('round trip: a fresh token verifies with age 0 and surfaces its nonce', () => {
  const token = issueFormToken('contact', PHONE, T0, SECRET);
  assert.match(token, /^v1\.contact\.\d{13}\.[0-9a-f]{12}\.[0-9a-f]{16}\.[0-9a-f]{32}$/);
  assert.deepEqual(verifyFormToken(token, 'contact', PHONE, T0, SECRET), ok(0, nonceOf(token)));
});

test('ageMs is server clock minus issue time', () => {
  const token = issueFormToken('contact', PHONE, T0, SECRET);
  assert.equal(verifyFormToken(token, 'contact', PHONE, T0 + 2_999, SECRET).ageMs, 2_999);
  assert.equal(verifyFormToken(token, 'contact', PHONE, T0 + 3_000, SECRET).ageMs, 3_000);
});

test('tampering with the signature is unsigned (review), not invalid (spam)', () => {
  const token = issueFormToken('contact', PHONE, T0, SECRET);
  const last = token.slice(-1);
  const flipped = token.slice(0, -1) + (last === 'a' ? 'b' : 'a');
  assert.equal(verifyFormToken(flipped, 'contact', PHONE, T0, SECRET).state, 'unsigned');
});

test('tampering with the timestamp or binding breaks the signature', () => {
  const token = issueFormToken('contact', PHONE, T0, SECRET);
  const parts = token.split('.');
  parts[2] = String(T0 - 60_000);
  assert.equal(verifyFormToken(parts.join('.'), 'contact', PHONE, T0, SECRET).state, 'unsigned');
  const p2 = token.split('.');
  p2[4] = bindingTag(OTHER_BROWSER);
  assert.equal(verifyFormToken(p2.join('.'), 'contact', OTHER_BROWSER, T0, SECRET).state, 'unsigned');
});

test('a token for one form is invalid for another, as is a malformed token', () => {
  const token = issueFormToken('contact', PHONE, T0, SECRET);
  assert.deepEqual(verifyFormToken(token, 'renewal', PHONE, T0, SECRET), { state: 'invalid', ageMs: null, nonce: null, mismatch: null });
  assert.deepEqual(verifyFormToken('garbage', 'contact', PHONE, T0, SECRET), { state: 'invalid', ageMs: null, nonce: null, mismatch: null });
  // The old unbound v1 shape (no binding segment) is malformed too; nothing shipped with it.
  assert.equal(verifyFormToken(`v1.contact.${T0}.0123456789ab.${'0'.repeat(32)}`, 'contact', PHONE, T0, SECRET).state, 'invalid');
});

test('missing token', () => {
  assert.equal(verifyFormToken(undefined, 'contact', PHONE, T0, SECRET).state, 'missing');
  assert.equal(verifyFormToken('', 'contact', PHONE, T0, SECRET).state, 'missing');
});

test('secret rotation: a token signed with key A verifies with [B, A] and is only "unsigned" with B alone', () => {
  const token = issueFormToken('contact', PHONE, T0, 'key-A');
  assert.equal(verifyFormToken(token, 'contact', PHONE, T0, ['key-B', 'key-A']).state, 'ok');
  assert.equal(verifyFormToken(token, 'contact', PHONE, T0, ['key-A', 'key-B']).state, 'ok');
  const alone = verifyFormToken(token, 'contact', PHONE, T0, 'key-B');
  assert.equal(alone.state, 'unsigned');
  assert.equal(alone.nonce, null);
});

test('issuing always uses the first (current) key', () => {
  const token = issueFormToken('contact', PHONE, T0, ['key-B', 'key-A']);
  assert.equal(verifyFormToken(token, 'contact', PHONE, T0, 'key-B').state, 'ok');
  assert.equal(verifyFormToken(token, 'contact', PHONE, T0, 'key-A').state, 'unsigned');
});

test('signingSecrets reads LEAD_FORM_SECRET, LEAD_FORM_SECRET_PREVIOUS, CRON_SECRET in that order, deduplicated', () => {
  assert.deepEqual(signingSecrets({ LEAD_FORM_SECRET: 'new', LEAD_FORM_SECRET_PREVIOUS: 'old', CRON_SECRET: 'cron' }), ['new', 'old', 'cron']);
  assert.deepEqual(signingSecrets({ CRON_SECRET: 'cron' }), ['cron']);
  assert.deepEqual(signingSecrets({ LEAD_FORM_SECRET: 'same', CRON_SECRET: 'same' }), ['same']);
  assert.deepEqual(signingSecrets({}), []);
});

test('no secret: issuing yields "" and verifying is disabled', () => {
  assert.equal(issueFormToken('contact', PHONE, T0, ''), '');
  assert.equal(issueFormToken('contact', PHONE, T0, []), '');
  assert.equal(verifyFormToken('anything', 'contact', PHONE, T0, '').state, 'disabled');
  assert.equal(verifyFormToken(undefined, 'contact', PHONE, T0, []).state, 'disabled');
});

test('client binding: same network and browser ok; network change is an ip mismatch; browser change is a ua mismatch', () => {
  const token = issueFormToken('contact', PHONE, T0, SECRET);
  assert.equal(verifyFormToken(token, 'contact', PHONE, T0 + 5_000, SECRET).state, 'ok');
  const ip = verifyFormToken(token, 'contact', SAME_PHONE_OTHER_NETWORK, T0 + 5_000, SECRET);
  assert.equal(ip.state, 'mismatch');
  assert.equal(ip.mismatch, 'ip');
  assert.equal(ip.ageMs, 5_000);
  assert.equal(ip.nonce, nonceOf(token));
  const ua = verifyFormToken(token, 'contact', OTHER_BROWSER, T0 + 5_000, SECRET);
  assert.equal(ua.state, 'mismatch');
  assert.equal(ua.mismatch, 'ua');
  const both = verifyFormToken(token, 'contact', { ipHash: 'cccccccccccccccccccccccccccccccc', ua: 'curl/8.0' }, T0, SECRET);
  assert.equal(both.mismatch, 'ip+ua');
});

test('a token issued with no request context binds to the empty values consistently', () => {
  const token = issueFormToken('contact', NOTHING, T0, SECRET);
  assert.equal(verifyFormToken(token, 'contact', NOTHING, T0, SECRET).state, 'ok');
  assert.equal(verifyFormToken(token, 'contact', PHONE, T0, SECRET).state, 'mismatch');
});

test('tokens older than 12 h are stale (review), not invalid; the nonce is still returned', () => {
  const token = issueFormToken('contact', PHONE, T0, SECRET);
  assert.equal(verifyFormToken(token, 'contact', PHONE, T0 + TOKEN_MAX_AGE_MS, SECRET).state, 'ok');
  const stale = verifyFormToken(token, 'contact', PHONE, T0 + TOKEN_MAX_AGE_MS + 1, SECRET);
  assert.equal(stale.state, 'stale');
  assert.equal(stale.ageMs, TOKEN_MAX_AGE_MS + 1);
  assert.equal(stale.nonce, nonceOf(token));
});

test('tokens carry a nonce so two issued in the same millisecond differ', () => {
  const a = issueFormToken('contact', PHONE, T0, SECRET);
  const b = issueFormToken('contact', PHONE, T0, SECRET);
  assert.notEqual(a, b);
  assert.notEqual(nonceOf(a), nonceOf(b));
});

test('every form id round-trips', () => {
  for (const id of FORM_IDS) {
    assert.equal(verifyFormToken(issueFormToken(id, PHONE, T0, SECRET), id, PHONE, T0 + 10, SECRET).state, 'ok');
  }
});
