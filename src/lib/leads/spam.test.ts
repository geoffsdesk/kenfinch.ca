/**
 * Pure rule-engine tests. Run with `npm run test:unit`
 * (node --import tsx --test). No Firestore, no Next, no network.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessLead, normalizeEmail, gmailDotCount, pickClientIp, ipTrustedForRate, isIp, registrable, urlHosts, RULES, REASON_LABELS, REVIEW_AT, SPAM_AT, IP_RATE_AT, IP_FLOOD_AT, type AssessContext } from './spam';
import type { LeadInput, SpamAssessment, SpamRule } from './types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const NOW = Date.UTC(2026, 9, 11, 16, 23, 13);

function ctx(over: Partial<AssessContext> = {}): AssessContext {
  return {
    now: NOW,
    request: null,
    client: null,
    token: { state: 'disabled', ageMs: null },
    counters: { ip: null, email: null },
    prior: [],
    crmMatch: null,
    ...over,
  };
}

const tokenOk = (ageMs: number): AssessContext['token'] => ({ state: 'ok', ageMs });

type ContactInput = Extract<LeadInput, { type: 'contact' }>;

function contact(over: Partial<ContactInput> = {}): ContactInput {
  return { type: 'contact', name: 'Pat Morgan', email: 'oakvillehome2026@gmail.com', phone: '(905) 555-0123', intent: 'Selling my home', message: 'We are thinking of listing in the spring and would like to talk about timing.', source: 'contact-form', page: '/contact', ...over };
}

/** The three incident bots, verbatim from the Firestore dump. */
const BOTS: ContactInput[] = [
  contact({ name: 'WHxOrQceblzGOrBjqRDEe', email: 'a.s.hley.m.g.m3g.pa.rker@gmail.com', phone: '5188343927', intent: '', message: '8331529830' }),
  contact({ name: 'IriVJJrXpFfjKOKpG', email: 'u.k.o.wa.xege.b.6.43@gmail.com', phone: '7139640279', intent: '', message: '6297768780' }),
  contact({ name: 'GbfnsUxJZDWoeUCWSvSELmQ', email: 'f.os.te.r.p.t.kk.t.ps.t.ephan.i.e@gmail.com', phone: '3878117387', intent: '', message: '5340634366' }),
];

const TURBOJOT_MESSAGE =
  'Have you tried TurboJot yet? It’s a new platform that automates website form submissions across thousands or even millions of websites. Just upload your list of websites, enter your message and company information, and TurboJot finds the forms and submits it for you automatically. You only pay for successful submissions. It’s the most effective marketing channel available today. Try it out here: https://turbojot.com/register';
const TURBOJOT = contact({ name: 'Ju', email: 'julia@turbojot.com', phone: '2158218810', intent: '', message: TURBOJOT_MESSAGE });

const VA_PITCH = contact({ name: 'Chloe Parker', email: 'chloe@vas4hire.com', phone: '+17252587787', intent: 'Buying and selling', message: '+17252587787' });

const DAVID_COSTA = contact({
  name: 'David Costa',
  email: 'dcosta@costalawfirm.ca',
  phone: '4167886329',
  intent: 'Mortgage renewal',
  message: 'Renewal: May 2027 · Lender: RBC · Balance: Over $1M · Note: This is a mixed use with residential.',
  source: 'renewal-form',
  page: '/renewal',
});

const PROSE = 'Hi Ken, we are a family of four in Glen Abbey and are starting to think about moving to a bigger place next year. We would love to hear what you think our current house might sell for and what the market looks like for four bedroom homes near good schools. Thanks very much.';

const BUYER: LeadInput = {
  type: 'buyer',
  firstName: 'Jordan',
  lastName: 'Lee',
  email: 'buyer2026@outlook.com',
  phone: '(416) 555-0123',
  goal: 'first-home',
  timeline: '0-3',
  priceRange: '750k-1m',
  areas: ['Oakville'],
  firstTimeBuyer: 'yes',
  downPayment: '10-20',
  consent: true,
  source: 'mortgage-page',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rulesOf(a: SpamAssessment): SpamRule[] {
  return [...a.reasons.map((r) => r.rule)].sort();
}

function expectScore(a: SpamAssessment, score: number, verdict: SpamAssessment['verdict'], rules: SpamRule[]) {
  assert.deepEqual(rulesOf(a), [...rules].sort(), `rules for score ${a.score}: ${JSON.stringify(a.reasons)}`);
  assert.equal(a.score, score);
  assert.equal(a.verdict, verdict);
}

// ─── normalizeEmail / gmailDotCount ─────────────────────────────────────────

test('normalizeEmail collapses Gmail dots, +tags and googlemail', () => {
  assert.equal(normalizeEmail('a.s.hley.m.g.m3g.pa.rker@gmail.com'), 'ashleymgm3gparker@gmail.com');
  assert.equal(normalizeEmail('u.k.o.wa.xege.b.6.43@gmail.com'), 'ukowaxegeb643@gmail.com');
  assert.equal(normalizeEmail('f.os.te.r.p.t.kk.t.ps.t.ephan.i.e@gmail.com'), 'fosterptkktpstephanie@gmail.com');
  assert.equal(normalizeEmail('Geoff+x@GoogleMail.com'), 'geoff@gmail.com');
  assert.equal(normalizeEmail('d.costa@costalawfirm.ca'), 'd.costa@costalawfirm.ca');
  assert.equal(normalizeEmail('someone+tag@fastmail.com'), 'someone@fastmail.com');
  assert.equal(normalizeEmail('  First.Last+news@FastMail.com '), 'first.last@fastmail.com');
});

test('gmailDotCount counts dots only for Gmail', () => {
  assert.equal(gmailDotCount('a.s.hley.m.g.m3g.pa.rker@gmail.com'), 7);
  assert.equal(gmailDotCount('j.r.smith@gmail.com'), 2);
  assert.equal(gmailDotCount('jane.smith@GoogleMail.com'), 1);
  assert.equal(gmailDotCount('a.b.c.d@outlook.com'), 0);
  assert.equal(gmailDotCount('nope'), 0);
});

// ─── pickClientIp / registrable / urlHosts ──────────────────────────────────

test('pickClientIp: x-fah-client-ip only when XFF corroborates it, then the third-last XFF hop (client, google, google), on Firebase', () => {
  assert.deepEqual(pickClientIp('203.0.113.9', 'spoofed, 203.0.113.9, 35.1.1.1, 192.178.13.1', true), { ip: '203.0.113.9', source: 'x-fah-client-ip' });
  assert.deepEqual(pickClientIp('203.0.113.9', '203.0.113.9, 35.1.1.1, 192.178.13.1', true), { ip: '203.0.113.9', source: 'x-fah-client-ip' });
  // Probe layout of 2026-10-12: "<client>, <google>, <google>" and no usable x-fah-client-ip.
  assert.deepEqual(pickClientIp('198.51.100.7', '203.0.113.9, 35.1.1.1, 192.178.13.1', true), { ip: '203.0.113.9', source: 'xff-client-hop' });
  assert.deepEqual(pickClientIp(null, 'spoofed, 203.0.113.9, 35.1.1.1, 192.178.13.1', true), { ip: '203.0.113.9', source: 'xff-client-hop' });
  assert.deepEqual(pickClientIp(null, '2001:db8::1, 35.1.1.1, 192.178.13.1', true), { ip: '2001:db8::1', source: 'xff-client-hop' });
  // Too short to locate the client hop: no IP rather than a guess.
  assert.deepEqual(pickClientIp('198.51.100.7', 'a, b', true), { ip: null, source: null });
  assert.deepEqual(pickClientIp(null, '203.0.113.9, 35.1.1.1', true), { ip: null, source: null });
  assert.deepEqual(pickClientIp(null, '203.0.113.9', true), { ip: null, source: null });
  assert.deepEqual(pickClientIp(null, null, true), { ip: null, source: null });
  // Off Firebase (local dev): first hop.
  assert.deepEqual(pickClientIp(null, '203.0.113.9', false), { ip: '203.0.113.9', source: 'xff-first' });
  assert.equal(ipTrustedForRate('x-fah-client-ip'), true);
  assert.equal(ipTrustedForRate('xff-client-hop'), true);
  assert.equal(ipTrustedForRate('xff-first'), false);
  assert.equal(ipTrustedForRate(null), false);
});

test('isIp accepts dotted quads and real IPv6, rejects bare hex words', () => {
  assert.equal(isIp('203.0.113.9'), true);
  assert.equal(isIp('2001:db8::1'), true);
  assert.equal(isIp('::1'), true);
  assert.equal(isIp('fe80:0000:0000:0000:0202:b3ff:fe1e:8329'), true);
  assert.equal(isIp('cafe'), false);
  assert.equal(isIp('dead:beef'), false);
  assert.equal(isIp('999.0.0.1'), false);
  assert.equal(isIp('unknown'), false);
  assert.equal(isIp('12345:1:2'), false);
});

test('registrable keeps public second-level suffixes', () => {
  assert.equal(registrable('turbojot.com'), 'turbojot.com');
  assert.equal(registrable('www.bbc.co.uk'), 'bbc.co.uk');
  assert.equal(registrable('mail.costalawfirm.ca'), 'costalawfirm.ca');
  assert.equal(registrable('GMAIL.COM'), 'gmail.com');
});

test('urlHosts finds bare and schemed URLs', () => {
  assert.deepEqual(urlHosts(TURBOJOT_MESSAGE), ['turbojot.com']);
  assert.deepEqual(urlHosts('see realtor.ca/real-estate/123 for the listing'), ['realtor.ca']);
  assert.deepEqual(urlHosts('no links here, just 905-555-0123'), []);
});

// ─── Bots from the incident ─────────────────────────────────────────────────

test('incident bots score 12 (spam) with tokens disabled', () => {
  for (const bot of BOTS) {
    expectScore(assessLead(bot, ctx()), 12, 'spam', ['name:random', 'email:gmail-dots', 'message:digits', 'intent:empty']);
  }
});

test('incident bot scores 15 with a 450 ms token and 25 with the honeypot filled', () => {
  expectScore(assessLead(BOTS[0], ctx({ token: tokenOk(450) })), 15, 'spam', ['name:random', 'email:gmail-dots', 'message:digits', 'intent:empty', 'token:fast']);
  expectScore(assessLead({ ...BOTS[0], hp: 'x' }, ctx({ token: tokenOk(450) })), 25, 'spam', ['honeypot', 'name:random', 'email:gmail-dots', 'message:digits', 'intent:empty', 'token:fast']);
});

test('name:random details and ordering by |weight|', () => {
  const a = assessLead(BOTS[0], ctx({ token: tokenOk(450) }));
  assert.equal(a.reasons[0].weight, 4);
  assert.equal(a.reasons[a.reasons.length - 1].rule, 'intent:empty');
  const nameReason = a.reasons.find((r) => r.rule === 'name:random')!;
  assert.equal(nameReason.detail, '21 letters, 9 caps');
  assert.equal(a.reasons.find((r) => r.rule === 'email:gmail-dots')!.detail, '7 dots');
  assert.equal(a.reasons.find((r) => r.rule === 'token:fast')!.detail, '450 ms');
});

// ─── Earlier spam ───────────────────────────────────────────────────────────

test('TurboJot pitch: own-domain link + empty intent + 2-letter name = 6 (spam)', () => {
  const a = assessLead(TURBOJOT, ctx({ token: tokenOk(68_000) }));
  expectScore(a, 6, 'spam', ['message:url-self', 'intent:empty', 'name:short']);
  assert.equal(a.reasons.find((r) => r.rule === 'message:url-self')!.detail, 'turbojot.com');
});

test('no reason detail ever contains the message body', () => {
  const a = assessLead(TURBOJOT, ctx({ token: tokenOk(68_000) }));
  for (const r of a.reasons) {
    assert.ok(!r.detail || !TURBOJOT_MESSAGE.includes(r.detail) || r.detail.length <= 20, `detail leaks message: ${r.detail}`);
    assert.ok(!r.detail || r.detail.length <= 80);
    assert.ok(!r.detail || !r.detail.includes('TurboJot'));
  }
});

test('VA pitch: digits-only message from a vendor domain = 5 (review; equals-phone is recorded at 0)', () => {
  const a = assessLead(VA_PITCH, ctx());
  expectScore(a, 5, 'review', ['message:digits', 'message:equals-phone', 'email:vendor-domain']);
  assert.equal(a.reasons.find((r) => r.rule === 'email:vendor-domain')!.detail, 'vas4hire.com');
  assert.equal(a.reasons.find((r) => r.rule === 'message:equals-phone')!.weight, 0);
  assert.equal(RULES['message:equals-phone'], 0);
});

// ─── Real people ────────────────────────────────────────────────────────────

test('David Costa (campaign token, renewal form) is deeply negative and not forged', () => {
  expectScore(assessLead(DAVID_COSTA, ctx({ token: tokenOk(1_200_000), crmMatch: 'token' })), -7, 'clean', ['trust:contact-token', 'trust:name-in-email']);
});

test('renewal:forged fires when a renewal-form payload does not look like the form built it', () => {
  // The name match is not applied once a positive rule fired (sender-controlled, see below).
  expectScore(assessLead({ ...DAVID_COSTA, intent: 'Other question' }, ctx()), 4, 'review', ['renewal:forged']);
  expectScore(assessLead({ ...DAVID_COSTA, message: 'hello' }, ctx()), 4, 'review', ['renewal:forged']);
  expectScore(assessLead({ ...DAVID_COSTA, intent: 'Mortgage renewal within 6 months' }, ctx()), -1, 'clean', ['trust:name-in-email']);
});

test('Jane Smith with prose: skipping the select is worth +1; her name in the email only labels an otherwise clean lead', () => {
  const jane = contact({ name: 'Jane Smith', email: 'jane.smith@gmail.com', phone: '(905) 555-0123', intent: '', message: PROSE });
  expectScore(assessLead(jane, ctx({ token: tokenOk(40_000) })), 1, 'clean', ['intent:empty']);
  expectScore(assessLead({ ...jane, intent: 'Selling my home' }, ctx({ token: tokenOk(40_000) })), -1, 'clean', ['trust:name-in-email']);
  // The same person from an address that does not carry her name: exactly the spec's +1 / 0.
  const anon = { ...jane, email: 'oakvillemover@gmail.com' };
  expectScore(assessLead(anon, ctx({ token: tokenOk(40_000) })), 1, 'clean', ['intent:empty']);
  expectScore(assessLead({ ...anon, intent: 'Selling my home' }, ctx({ token: tokenOk(40_000) })), 0, 'clean', []);
});

test('autofill human: a fast submit alone is never spam', () => {
  const fast = contact({ name: 'Jane Smith', email: 'oakvillemover@gmail.com', phone: '(905) 555-0123', intent: '', message: '' });
  expectScore(assessLead(fast, ctx({ token: tokenOk(2_400) })), 2, 'clean', ['token:fast']);
  expectScore(assessLead(fast, ctx({ token: tokenOk(1_200) })), 3, 'review', ['token:fast']);
  expectScore(assessLead({ ...fast, message: 'Call me at 905-555-0123' }, ctx({ token: tokenOk(1_200) })), 4, 'review', ['token:fast', 'intent:empty']);
  // Her name in the address does not buy a fast submit out of review: the match is sender-controlled.
  const named = { ...fast, email: 'jane.smith@gmail.com' };
  expectScore(assessLead(named, ctx({ token: tokenOk(1_200) })), 3, 'review', ['token:fast']);
});

// ─── Sender-controlled trust cannot rescue a tokenless or instant post (review findings) ─────────

/** A bot that learned to pair a plausible name with the mailbox it uses. Message is prose with a number, not digits-only. */
const ASHLEY = contact({ name: 'Ashley Parker', email: 'ashleymgm3gparker@gmail.com', phone: '5188343927', intent: 'Selling my home', message: 'Call me 8331529830' });

test('case G: direct server-action post with no token and no client object is review, never clean', () => {
  assert.equal(RULES['token:missing'], 4, 'token:missing must exceed REVIEW_AT so no -1 rule can cancel it');
  expectScore(assessLead(ASHLEY, ctx({ token: { state: 'missing', ageMs: null }, client: null })), 4, 'review', ['token:missing']);
  // Same post without the select: still review, the extra point changes nothing.
  expectScore(assessLead({ ...ASHLEY, intent: '' }, ctx({ token: { state: 'missing', ageMs: null } })), 5, 'review', ['token:missing', 'intent:empty']);
});

test('case E/D: a 450 ms browser submit with a matching name is review, with or without the select', () => {
  expectScore(assessLead(ASHLEY, ctx({ token: tokenOk(450) })), 3, 'review', ['token:fast']);
  expectScore(assessLead({ ...ASHLEY, intent: '' }, ctx({ token: tokenOk(450) })), 4, 'review', ['token:fast', 'intent:empty']);
});

test('every review-level token state stays at review for a name-matching sender', () => {
  for (const token of [
    { state: 'unsigned', ageMs: null },
    { state: 'stale', ageMs: 13 * 3600_000 },
    { state: 'mismatch', ageMs: 9_000, mismatch: 'ua' },
    { state: 'mismatch', ageMs: 9_000, mismatch: 'ip+ua' },
  ] as AssessContext['token'][]) {
    const a = assessLead(ASHLEY, ctx({ token }));
    assert.equal(a.verdict, 'review', `${token.state} ${token.mismatch ?? ''}: ${JSON.stringify(a.reasons)}`);
    assert.ok(!a.reasons.some((r) => r.rule === 'trust:name-in-email'));
  }
});

test('CRM trust is recorded at 0, not applied, when the token is not ok', () => {
  const missing = assessLead(ASHLEY, ctx({ token: { state: 'missing', ageMs: null }, crmMatch: 'email' }));
  expectScore(missing, 4, 'review', ['token:missing', 'trust:crm-email']);
  const crm = missing.reasons.find((r) => r.rule === 'trust:crm-email')!;
  assert.equal(crm.weight, 0);
  assert.equal(crm.detail, 'not applied: token missing');
  expectScore(assessLead(DAVID_COSTA, ctx({ token: { state: 'missing', ageMs: null }, crmMatch: 'token' })), 4, 'review', ['token:missing', 'trust:contact-token']);
  // With a good token (or tokens off) the CRM match counts in full.
  expectScore(assessLead(ASHLEY, ctx({ token: tokenOk(45_000), crmMatch: 'email' })), -5, 'clean', ['trust:crm-email', 'trust:name-in-email']);
  expectScore(assessLead(ASHLEY, ctx({ crmMatch: 'email' })), -5, 'clean', ['trust:crm-email', 'trust:name-in-email']);
});

test('a real person whose address a bot used before is reviewed, never quarantined', () => {
  const auto: SpamAssessment = { version: 1, score: 10, verdict: 'spam', reasons: [{ rule: 'honeypot', weight: 10 }], assessedAt: '', enforced: true, releasedAt: null, releasedBy: null, overriddenTo: null };
  const real = contact({ name: 'Ashley Parker', email: 'ashleymgm3gparker@gmail.com', phone: '5188343927', intent: 'Selling my home', message: PROSE });
  const prior = [{ status: 'spam' as const, spam: auto, isTest: false, ipHash: 'bot-network' }];
  const request = { ip: '203.0.113.9', ipSource: 'x-fah-client-ip' as const, ipHash: 'her-network', xff: null, fahIp: null, ua: 'Mozilla/5.0', lang: 'en-CA', referer: null, origin: null, fetchSite: null, via: null, capturedAt: '', scrubbedAt: null };
  expectScore(assessLead(real, ctx({ token: tokenOk(45_000), prior, request })), 3, 'review', ['email:prior-spam']);
  // Without the name match it is the same: 3, review, Ken emailed.
  expectScore(assessLead({ ...real, email: 'sunnyoakville@gmail.com' }, ctx({ token: tokenOk(45_000), prior, request })), 3, 'review', ['email:prior-spam']);
  // Five junk leads under her address in 24 h (counter 6) also stop at review on their own.
  expectScore(assessLead(real, ctx({ token: tokenOk(45_000), counters: { ip: null, email: 6 } })), 3, 'review', ['rate:email']);
  // The bot itself, same network as its earlier quarantined post: full weight.
  const bot = { ...BOTS[0], email: 'ashleymgm3gparker@gmail.com' };
  const a = assessLead(bot, ctx({ token: tokenOk(450), prior, request: { ...request, ipHash: 'bot-network' } }));
  assert.equal(a.verdict, 'spam');
  assert.equal(a.reasons.find((r) => r.rule === 'email:prior-spam')!.weight, 6);
});

test('human who pastes only their phone number into the message is reviewed, not quarantined, at any speed', () => {
  const h = contact({ name: 'Sam Patel', email: 'oakvillemover@gmail.com', phone: '(905) 555-0123', intent: '', message: '905-555-0123' });
  const rules: SpamRule[] = ['message:digits', 'message:equals-phone', 'intent:empty'];
  expectScore(assessLead(h, ctx({ token: tokenOk(20_000) })), 4, 'review', rules);
  // Autofill + paste within seconds of a cold-start token: the timing rule is suppressed when the
  // message repeats the phone, so this never reaches SPAM_AT.
  expectScore(assessLead(h, ctx({ token: tokenOk(2_400) })), 4, 'review', rules);
  expectScore(assessLead(h, ctx({ token: tokenOk(1_200) })), 4, 'review', rules);
  // A digits-only message that is NOT the phone keeps the timing rule (the incident bots).
  const notPhone = { ...h, message: '8331529830' };
  expectScore(assessLead(notPhone, ctx({ token: tokenOk(1_200) })), 7, 'spam', ['message:digits', 'intent:empty', 'token:fast']);
});

test('unusual real names never trip name rules', () => {
  const t = tokenOk(30_000);
  expectScore(assessLead(contact({ name: 'Krzysztof Szczepanski', email: 'oakvillemover@gmail.com', message: PROSE }), ctx({ token: t })), 0, 'clean', []);
  expectScore(assessLead(contact({ name: 'Angus MacGillivray', email: 'oakvillemover@gmail.com', message: PROSE }), ctx({ token: t })), 0, 'clean', []);
  expectScore(assessLead(contact({ name: 'Al Wong', email: 'oakvillemover@gmail.com', message: PROSE }), ctx({ token: t })), 0, 'clean', []);
  expectScore(assessLead(contact({ name: 'Jo', email: 'oakvillemover@gmail.com', message: PROSE }), ctx({ token: t })), 1, 'clean', ['name:short']);
  expectScore(assessLead(contact({ name: 'Szczepanski', email: 'oakvillemover@gmail.com', message: PROSE }), ctx({ token: t })), 0, 'clean', []);
});

test('two Gmail dots and foreign +tags are not signals', () => {
  expectScore(assessLead(contact({ name: 'J R Smith', email: 'j.r.smith@gmail.com', message: PROSE }), ctx()), -1, 'clean', ['trust:name-in-email']);
  expectScore(assessLead(contact({ name: 'Pat Morgan', email: 'someone+tag@fastmail.com', message: PROSE }), ctx()), 0, 'clean', []);
});

test('buyer fixture: realistic enums, token 500 ms -> review (Ken emailed, Finmo hand-off still shown)', () => {
  expectScore(assessLead(BUYER, ctx({ token: tokenOk(500) })), 3, 'review', ['token:fast']);
  expectScore(assessLead(BUYER, ctx({ token: tokenOk(45_000) })), 0, 'clean', []);
  expectScore(assessLead({ ...BUYER, firstName: 'QwRtYpSdFgHjKl', lastName: 'Lee' }, ctx()), 4, 'review', ['name:random']);
  expectScore(assessLead({ ...BUYER, message: 'Looking at realtor.ca/real-estate/123 this weekend' }, ctx()), 1, 'clean', ['message:url']);
});

// ─── Hard signals in isolation ──────────────────────────────────────────────

test('honeypot alone quarantines', () => {
  expectScore(assessLead(contact({ hp: 'http://spam.example' }), ctx()), 10, 'spam', ['honeypot']);
  expectScore(assessLead(contact({ hp: '   ' }), ctx()), 0, 'clean', []);
});

test('prior spam from the same mailbox: Ken-marked or same-network = 6, automatic verdict or legacy mark = 3', () => {
  const assessed: SpamAssessment = { version: 1, score: 12, verdict: 'spam', reasons: [], assessedAt: '', enforced: true, releasedAt: null, releasedBy: null, overriddenTo: null };
  const auto = assessLead(contact(), ctx({ prior: [{ status: 'spam', spam: assessed, isTest: false }] }));
  expectScore(auto, 3, 'review', ['email:prior-spam']);
  assert.equal(auto.reasons[0].detail, 'prior spam lead');
  expectScore(assessLead(contact(), ctx({ prior: [{ status: 'spam', spam: null, isTest: false }] })), 3, 'review', ['email:prior-spam']);
  const overridden: SpamAssessment = { ...assessed, score: 0, verdict: 'clean', overriddenTo: 'spam' };
  const byKen = assessLead(contact(), ctx({ prior: [{ status: 'spam', spam: overridden, isTest: false }] }));
  expectScore(byKen, 6, 'spam', ['email:prior-spam']);
  assert.equal(byKen.reasons[0].detail, 'marked spam by Ken');
  // Same network as the automatic quarantine: full weight. A different network, or no IP on either side: 3.
  const request = { ip: '203.0.113.9', ipSource: 'x-fah-client-ip' as const, ipHash: 'h1', xff: null, fahIp: null, ua: null, lang: null, referer: null, origin: null, fetchSite: null, via: null, capturedAt: '', scrubbedAt: null };
  const sameNet = assessLead(contact(), ctx({ request, prior: [{ status: 'spam', spam: assessed, isTest: false, ipHash: 'h1' }] }));
  expectScore(sameNet, 6, 'spam', ['email:prior-spam']);
  assert.equal(sameNet.reasons[0].detail, 'prior spam, same network');
  expectScore(assessLead(contact(), ctx({ request, prior: [{ status: 'spam', spam: assessed, isTest: false, ipHash: 'h2' }] })), 3, 'review', ['email:prior-spam']);
  expectScore(assessLead(contact(), ctx({ request: { ...request, ipHash: null }, prior: [{ status: 'spam', spam: assessed, isTest: false, ipHash: null }] })), 3, 'review', ['email:prior-spam']);
  // Test leads and non-spam priors do not count.
  expectScore(assessLead(contact(), ctx({ prior: [{ status: 'spam', spam: null, isTest: true }, { status: 'contacted', spam: null, isTest: false }] })), 0, 'clean', []);
});

test('rate counters: ip > 5 reviews, > 30 in an hour quarantines as a flood; email > 2 reviews and > 4 quarantines', () => {
  assert.equal(IP_RATE_AT, 5);
  assert.equal(IP_FLOOD_AT, 30);
  assert.equal(RULES['rate:ip'], 3, 'a busy shared network (office NAT, carrier NAT) is reviewed, not quarantined');
  const sixth = assessLead(contact(), ctx({ counters: { ip: 6, email: null } }));
  expectScore(sixth, 3, 'review', ['rate:ip']);
  assert.equal(sixth.reasons[0].detail, '6 in 60m');
  expectScore(assessLead(contact(), ctx({ counters: { ip: 5, email: null } })), 0, 'clean', []);
  expectScore(assessLead(contact(), ctx({ counters: { ip: 30, email: null } })), 3, 'review', ['rate:ip']);
  // Past the flood mark the lead is quarantined (stored, nothing sent) rather than dropped.
  const flood = assessLead(contact(), ctx({ counters: { ip: 31, email: null } }));
  expectScore(flood, 6, 'spam', ['rate:ip']);
  assert.equal(flood.reasons[0].detail, '31 in 60m (flood)');
  expectScore(assessLead(contact(), ctx({ counters: { ip: null, email: 3 } })), 3, 'review', ['rate:email']);
  // > 4 from one mailbox is 6 only with corroboration: alone it is review, so junk sent under a
  // real address cannot blackhole its owner.
  expectScore(assessLead(contact(), ctx({ counters: { ip: null, email: 5 } })), 3, 'review', ['rate:email']);
  const corroborated = assessLead(contact({ intent: '', message: '905-555-0199' }), ctx({ counters: { ip: null, email: 5 } }));
  expectScore(corroborated, 10, 'spam', ['rate:email', 'message:digits', 'intent:empty']);
  assert.equal(corroborated.reasons.find((r) => r.rule === 'rate:email')!.weight, 6);
  expectScore(assessLead(contact({ intent: '' , message: PROSE }), ctx({ counters: { ip: null, email: 5 } })), 7, 'spam', ['rate:email', 'intent:empty']);
  expectScore(assessLead(contact(), ctx({ counters: { ip: null, email: 2 } })), 0, 'clean', []);
});

test('token states are scored as specified', () => {
  expectScore(assessLead(contact(), ctx({ token: { state: 'invalid', ageMs: null } })), 6, 'spam', ['token:invalid']);
  const reused = assessLead(contact(), ctx({ token: { state: 'reused', ageMs: 4_000 } }));
  expectScore(reused, 6, 'spam', ['token:invalid']);
  assert.equal(reused.reasons[0].detail, 'token already used');
  expectScore(assessLead(contact(), ctx({ token: { state: 'missing', ageMs: null } })), 4, 'review', ['token:missing']);
  // Signed with a key we no longer hold (rotation): review, never spam.
  expectScore(assessLead(contact(), ctx({ token: { state: 'unsigned', ageMs: null } })), 3, 'review', ['token:unsigned']);
  const stale = assessLead(contact(), ctx({ token: { state: 'stale', ageMs: 13 * 3600_000 } }));
  expectScore(stale, 3, 'review', ['token:stale']);
  assert.equal(stale.reasons[0].detail, '13 h');
  // Binding: a network change (mobile) is 2, a browser change 3.
  expectScore(assessLead(contact(), ctx({ token: { state: 'mismatch', ageMs: 9_000, mismatch: 'ip' } })), 2, 'clean', ['token:mismatch']);
  expectScore(assessLead(contact(), ctx({ token: { state: 'mismatch', ageMs: 9_000, mismatch: 'ua' } })), 3, 'review', ['token:mismatch']);
  expectScore(assessLead(contact(), ctx({ token: { state: 'mismatch', ageMs: 9_000, mismatch: 'ip+ua' } })), 3, 'review', ['token:mismatch']);
  // Unsigned/stale/mismatch tokens carry no timing information for token:fast.
  expectScore(assessLead(contact(), ctx({ token: { state: 'mismatch', ageMs: 400, mismatch: 'ip' } })), 2, 'clean', ['token:mismatch']);
  expectScore(assessLead(contact(), ctx({ token: tokenOk(3_000) })), 0, 'clean', []);
  expectScore(assessLead(contact(), ctx({ token: tokenOk(2_999) })), 2, 'clean', ['token:fast']);
  expectScore(assessLead(contact(), ctx({ token: tokenOk(1_499) })), 3, 'review', ['token:fast']);
  expectScore(assessLead(contact(), ctx({ token: tokenOk(86_400_000) })), 0, 'clean', []);
});

test('a secret rotation mid-session can never quarantine a real person on its own', () => {
  const jane = contact({ name: 'Jane Smith', email: 'oakvillemover@gmail.com', phone: '(905) 555-0123', intent: '', message: PROSE });
  const a = assessLead(jane, ctx({ token: { state: 'unsigned', ageMs: null } }));
  assert.equal(a.verdict, 'review');
  assert.ok(a.score < SPAM_AT);
});

test('client signals: webdriver 3, zero interactions 2, null client nothing', () => {
  expectScore(assessLead(contact(), ctx({ client: { webdriver: true, interactions: 12, msSinceMount: 9000 } })), 3, 'review', ['client:webdriver']);
  expectScore(assessLead(contact(), ctx({ client: { webdriver: false, interactions: 0, msSinceMount: 9000 } })), 2, 'clean', ['client:no-interaction']);
  expectScore(assessLead(contact(), ctx({ client: { webdriver: null, interactions: null, msSinceMount: null } })), 0, 'clean', []);
});

test('ua:automation is recorded at weight 0 until the CDN probe proves the UA survives', () => {
  const request = { ip: '203.0.113.9', ipSource: 'x-fah-client-ip' as const, ipHash: 'x', xff: null, fahIp: '203.0.113.9', ua: 'python-requests/2.31', lang: null, referer: null, origin: null, fetchSite: null, via: null, capturedAt: '', scrubbedAt: null };
  const a = assessLead(contact(), ctx({ request }));
  expectScore(a, 0, 'clean', ['ua:automation']);
  assert.equal(RULES['ua:automation'], 0);
  assert.equal(a.reasons[0].detail, 'python-requests/2.31');
});

test('trust rules: CRM email match -4, name tokens shorter than 3 letters ignored', () => {
  expectScore(assessLead(contact({ name: 'Pat Morgan', email: 'morgan.p@bell.net', message: PROSE }), ctx({ crmMatch: 'email' })), -5, 'clean', ['trust:crm-email', 'trust:name-in-email']);
  expectScore(assessLead(contact({ name: 'Al Wong', email: 'al@bell.net', message: PROSE }), ctx()), 0, 'clean', []);
});

test('thresholds, labels and the weight table stay in sync', () => {
  assert.equal(REVIEW_AT, 3);
  assert.equal(SPAM_AT, 6);
  for (const rule of Object.keys(RULES) as SpamRule[]) assert.ok(REASON_LABELS[rule], `label missing for ${rule}`);
  assert.equal(Object.keys(RULES).length, Object.keys(REASON_LABELS).length);
});

test('assessment envelope', () => {
  const a = assessLead(contact(), ctx());
  assert.equal(a.version, 1);
  assert.equal(a.assessedAt, new Date(NOW).toISOString());
  assert.equal(a.enforced, true);
  assert.equal(a.releasedAt, null);
  assert.equal(a.releasedBy, null);
  assert.equal(a.overriddenTo, null);
});
