'use server';

/**
 * Single entry point for every lead form on the site.
 *
 *   createLead(input) ->
 *     1. validate (zod, by `type`)
 *     2. gather signals: request headers, rate counters, prior leads from the
 *        same mailbox, CRM match, signed form token
 *     3. score with assessLead (src/lib/leads/spam.ts)
 *          clean  -> store, notify Ken, confirm to the sender, 48h check-in, CRM link
 *          review -> store as New, notify Ken with a "Possible spam" banner, hold
 *                    the confirmation / SMS / check-in / conversion pixels
 *          spam   -> store as Spam, send nothing
 *     4. the visitor always sees the same success state; `track` tells the form
 *        whether to fire conversion pixels
 *
 * Each notification is best-effort: a failure is recorded on the lead doc and
 * never blocks the visitor from seeing the success state.
 */

import { leadInput, isTestSubmission, type LeadDoc, type LeadInput, type LeadRecord, type LeadRequestMeta, buyerLabel } from '@/lib/leads/types';
import { insertLead, addNote, newToken, nowIso, findLeadsByEmailKey } from '@/lib/leads/store';
import { findContactByToken, findContactByEmail } from '@/lib/contacts/store';
import type { ContactRecord } from '@/lib/contacts/types';
import { assessLead, normalizeEmail, ipTrustedForRate, type TokenSignal } from '@/lib/leads/spam';
import { FORM_IDS, TOKEN_MAX_AGE_MS, issueFormToken, verifyFormToken, type FormId, type TokenBinding } from '@/lib/leads/form-token';
import { readRequestMeta } from '@/lib/leads/request-meta';
import { bumpCounter, claimNonce } from '@/lib/leads/ratelimit';
import { notifyNewLead, linkCrmContact, confirmationSentRecently } from '@/lib/leads/dispatch';

export type CreateLeadResult = { ok: true; leadId: string; track: boolean } | { ok: false; error: string };

const CHECKIN_DELAY_HOURS = 48;
/** Signal lookups never hold the visitor hostage: past this they fail open. */
const SIGNAL_TIMEOUT_MS = 4000;

function buildDoc(input: LeadInput, request: LeadRequestMeta | null, emailKey: string): LeadDoc {
  const createdAt = nowIso();
  const checkinDueAt = new Date(Date.now() + CHECKIN_DELAY_HOURS * 3600 * 1000).toISOString();
  const common = {
    emailKey,
    status: 'new' as const,
    statusUpdatedAt: createdAt,
    notes: [],
    nextFollowUpAt: null,
    followUp: { token: newToken(), confirmationSentAt: null, checkinDueAt, checkinSentAt: null, checkinReply: null, checkinRepliedAt: null },
    notify: { kenEmailAt: null, kenSmsAt: null, errors: [] as string[] },
    request,
    client: input.client
      ? { webdriver: input.client.webdriver ?? null, interactions: input.client.interactions ?? null, msSinceMount: input.client.msSinceMount ?? null }
      : null,
    spam: null,
    createdAt,
    updatedAt: createdAt,
    source: input.source ?? 'site',
    page: input.page ?? '',
    attribution: input.attribution ?? null,
  };

  switch (input.type) {
    case 'buyer': {
      const { firstName, lastName, email, phone, message, source, page, consent, type, attribution, contactToken: _ct, hp: _hp, formToken: _ft, client: _cl, ...details } = input;
      const summary = [
        buyerLabel('goal', details.goal),
        buyerLabel('timeline', details.timeline),
        buyerLabel('priceRange', details.priceRange),
        details.areas.join('/'),
        details.firstTimeBuyer === 'yes' ? 'first-time buyer' : null,
      ]
        .filter(Boolean)
        .join(' · ');
      return {
        ...common,
        type,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        hot: details.timeline === '0-3',
        summary,
        details: { ...details, firstName, lastName, message: message ?? '', consent },
      };
    }
    case 'contact':
      return {
        ...common,
        type: input.type,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        hot: /first home|pre-approval|buying|renewal within 6 months/i.test(input.intent ?? ''),
        summary: [input.intent || 'General enquiry', input.message ? `"${input.message.slice(0, 80)}${input.message.length > 80 ? '…' : ''}"` : null].filter(Boolean).join(' · '),
        details: { intent: input.intent ?? '', message: input.message ?? '' },
      };
    case 'valuation':
      return {
        ...common,
        type: input.type,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        hot: false,
        summary: `${input.address}${typeof input.estimate === 'number' ? ` · AI est. $${input.estimate.toLocaleString()}` : ''}`,
        details: { address: input.address, estimate: input.estimate ?? null, confidence: input.confidence ?? null, property: input.property ?? {}, message: input.message ?? '' },
      };
    case 'popup':
      return {
        ...common,
        type: input.type,
        name: input.name?.trim() || 'Not provided',
        email: input.email,
        phone: input.phone || null,
        hot: false,
        summary: `Requested: ${input.asset}`,
        details: { asset: input.asset },
      };
  }
}

function isTestLead(input: LeadInput): boolean {
  const name = input.type === 'buyer' ? `${input.firstName} ${input.lastName}` : input.name ?? '';
  return isTestSubmission(name, input.email);
}

function formIdFor(input: LeadInput): FormId {
  switch (input.type) {
    case 'buyer':
      return 'buyer';
    case 'valuation':
      return 'valuation';
    case 'popup':
      return 'popup';
    default:
      return input.source === 'renewal-form' ? 'renewal' : 'contact';
  }
}

/** Fail-open wrapper: errors and slow lookups both become the fallback. */
async function soft<T>(p: Promise<T>, fallback: T, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), SIGNAL_TIMEOUT_MS);
  });
  try {
    return await Promise.race([p, timeout]);
  } catch (err) {
    console.error(`${label} failed:`, (err as Error).message);
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

async function tryInsert(doc: LeadDoc, label: string): Promise<string> {
  try {
    return await insertLead(doc);
  } catch (err) {
    console.error(`${label} insert failed:`, err);
    return '';
  }
}

/** The token is bound to the network and browser that asked for it; both are hashed before they enter the token. */
function tokenBinding(request: LeadRequestMeta | null): TokenBinding {
  return { ipHash: request?.ipHash ?? null, ua: request?.ua ?? null };
}

/** Forms call this on mount (and again after each submit); the token comes back with the submission. Empty when tokens are disabled. */
export async function issueFormTokenAction(formId: string): Promise<string> {
  if (!(FORM_IDS as readonly string[]).includes(formId)) return '';
  const request = await readRequestMeta();
  return issueFormToken(formId as FormId, tokenBinding(request));
}

/**
 * Verify the submitted token against every configured key and the current
 * client binding, then consume its nonce so the same token cannot be replayed.
 * The nonce store fails open (null) like the counters do.
 */
async function checkFormToken(input: LeadInput, request: LeadRequestMeta | null): Promise<TokenSignal> {
  const check = verifyFormToken(input.formToken, formIdFor(input), tokenBinding(request));
  if (check.nonce && check.state !== 'invalid') {
    const first = await soft(claimNonce(check.nonce, TOKEN_MAX_AGE_MS * 2), null, 'token nonce');
    if (first === false) return { state: 'reused', ageMs: check.ageMs, mismatch: null };
  }
  return { state: check.state, ageMs: check.ageMs, mismatch: check.mismatch };
}

export async function createLead(raw: unknown): Promise<CreateLeadResult> {
  // 1. Validate. Genuine validation errors stay visible to the visitor.
  const parsed = leadInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' };
  }
  const input = parsed.data;

  // 2. Request metadata + mailbox key.
  const request = await readRequestMeta();
  const emailKey = normalizeEmail(input.email);
  const doc = buildDoc(input, request, emailKey);

  // 3. Test submissions: quarantine, no counters, no notifications.
  if (isTestLead(input)) {
    doc.status = 'spam';
    doc.spam = { version: 1, score: 10, verdict: 'spam', reasons: [{ rule: 'test', weight: 10 }], assessedAt: doc.createdAt, enforced: true, releasedAt: null, releasedBy: null, overriddenTo: null };
    doc.notes = [{ at: doc.createdAt, text: 'Automated test submission: notifications and check-in skipped.', by: 'system' }];
    doc.followUp.checkinSentAt = doc.createdAt;
    const leadId = await tryInsert(doc, 'test lead');
    return { ok: true, leadId, track: false };
  }

  // 4. Signals, all fail-open and gathered in parallel (independent lookups).
  // The IP counter only runs on a source the load balancer vouches for; a lone or unknown hop
  // could be the CDN's own address shared by every visitor (docs/spam-defense.md "After deploy").
  const rateIp = request?.ip && ipTrustedForRate(request.ipSource) ? request.ip : null;
  const [contact, ipCount, emailCount, priorLeads, token] = await Promise.all([
    soft<ContactRecord | null>(
      (async () => {
        const byToken = input.contactToken ? await findContactByToken(input.contactToken) : null;
        if (byToken) return byToken;
        const byEmail = await findContactByEmail(input.email);
        if (byEmail) return byEmail;
        return emailKey !== input.email.toLowerCase() ? findContactByEmail(emailKey) : null;
      })(),
      null,
      'contact lookup',
    ),
    rateIp ? soft(bumpCounter('ip', rateIp, 3_600_000), null, 'ip counter') : Promise.resolve(null),
    soft(bumpCounter('email', emailKey, 86_400_000), null, 'email counter'),
    soft(findLeadsByEmailKey(emailKey, 10), [] as LeadRecord[], 'prior leads'),
    checkFormToken(input, request),
  ]);
  const crmMatch: 'token' | 'email' | null = contact ? (input.contactToken && contact.token === input.contactToken ? 'token' : 'email') : null;
  const prior = priorLeads.map((l) => ({ status: l.status, spam: l.spam, isTest: isTestSubmission(l.name, l.email), ipHash: l.request?.ipHash ?? null }));

  // 5. Score. A flood from one network (> IP_FLOOD_AT an hour) is quarantined by rate:ip inside
  // assessLead: stored with nothing sent, never silently dropped, so a mis-keyed IP can be recovered.
  const assessment = assessLead(input, { now: Date.now(), request, client: doc.client, token, counters: { ip: ipCount, email: emailCount }, prior, crmMatch });
  const enforce = process.env.SPAM_ENFORCE !== 'false';
  assessment.enforced = enforce;
  doc.spam = assessment;
  const rules = assessment.reasons.map((r) => r.rule);
  const verdict = enforce ? assessment.verdict : 'clean';
  if (!enforce && assessment.verdict !== 'clean') {
    doc.notes = [{ at: doc.createdAt, by: 'system', text: `Spam check (not enforced): ${assessment.verdict} score ${assessment.score}: ${rules.join(', ')}` }];
  }

  // 6. Branch on the verdict.
  if (verdict === 'spam') {
    doc.status = 'spam';
    doc.hot = false;
    doc.followUp.checkinSentAt = doc.createdAt;
    doc.notes = [{ at: doc.createdAt, by: 'system', text: `Quarantined automatically (score ${assessment.score}): ${rules.join(', ')}` }];
    const leadId = await tryInsert(doc, 'spam lead');
    console.warn('lead quarantined', { leadId, score: assessment.score, rules, ipHash: request?.ipHash });
    return { ok: true, leadId, track: false };
  }

  if (verdict === 'review') {
    doc.hot = false;
    doc.followUp.checkinSentAt = doc.createdAt;
    doc.notes = [{ at: doc.createdAt, by: 'system', text: `Possible spam (score ${assessment.score}): ${rules.join(', ')}. Confirmation email and 48h check-in held.` }];
    const leadId = await tryInsert(doc, 'review lead');
    const lead: LeadRecord = { id: leadId, ...doc };
    console.warn('lead held for review', { leadId, score: assessment.score, rules, ipHash: request?.ipHash });
    await notifyNewLead(lead, { ken: true, confirmation: false, sms: false });
    return { ok: true, leadId, track: false };
  }

  // Clean. Without a lead ID we still notify Ken so nothing is lost.
  const leadId = await tryInsert(doc, 'leads');
  const lead: LeadRecord = { id: leadId, ...doc };
  const confirmation = !confirmationSentRecently(priorLeads);
  const r = await notifyNewLead(lead, { ken: true, confirmation, sms: true });
  if (!leadId && r.kenEmailFailed) return { ok: false, error: 'We could not submit your request right now. Please call Ken directly.' };
  if (leadId && !confirmation) {
    try {
      await addNote(leadId, 'Confirmation email skipped: one was sent to this address in the last 7 days.', 'system');
    } catch (err) {
      console.error('lead note failed:', err);
    }
  }
  await linkCrmContact(lead, contact);
  return { ok: true, leadId, track: true };
}
