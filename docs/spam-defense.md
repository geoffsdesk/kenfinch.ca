# Lead spam defence

One-page runbook for the scoring layer in front of every lead form (contact, renewal, buyer, valuation expert-opinion, exit popup). Code: `src/lib/leads/spam.ts` (rules), `src/lib/leads/form-token.ts` (signed tokens), `src/app/actions/leads.ts` (createLead), `src/lib/leads/release.ts` (dashboard release).

## What it does

Every submission is scored server-side. The visitor always sees the normal success state; the only client-visible difference is that flagged leads do not fire conversion pixels.

| Verdict | Score | Stored as | Ken emailed | Confirmation email / SMS / 48h check-in | Conversion pixels, CRM link |
|---|---|---|---|---|---|
| clean | < 3 | `new` | yes | yes | yes |
| review | 3 to 5 | `new` with a "Possible spam" banner in Ken's email and an amber chip in /ken | yes | held | no |
| spam | >= 6 | `spam` | no | no | no |

Thresholds: `REVIEW_AT = 3`, `SPAM_AT = 6` in `spam.ts`. Weights live in the single `RULES` table there; `REASON_LABELS` is the plain-English label shown in email and the inbox. Test submissions (E2E names, `(ignore)`, `e2e-*@kenfinch.ca`) are quarantined before scoring with the single rule `test` and can never be released.

## Rules (weight)

Hard: `honeypot` 10 (hidden field filled) · `email:prior-spam` 6 when Ken himself marked a prior lead from the mailbox spam (`spam.overriddenTo`) or an automatic quarantine on it came from the same network (`request.ipHash`); 3 when the only prior spam is an automatic verdict or a hand-marked legacy lead, so a bot posting junk under a real person's address can never blackhole that person (review: Ken is still emailed) · `rate:ip` 3 for more than 5 leads from one network in 60 min, 6 past 200 (a flood is quarantined, stored with nothing sent, never silently dropped; `rate:ip` stays at 3 and the counter only runs on a load-balancer-vouched IP until the probe below shows which header carries the client, then restore 6) · `rate:email` 3 for more than 2 from one mailbox in 24 h, 6 for more than 4 only when another positive rule also fired (the counter includes quarantined junk sent under the address) · `token:invalid` 6 (malformed token, token for another form, or a token whose nonce was already used) · `renewal:forged` 4 (renewal-form payload the form could not have built).

Token (review-level): `token:missing` 4 (no token while tokens are enabled; the client waits up to 8 s for a token still in flight before submitting, so this is a direct post or a token fetch that failed twice) · `token:unsigned` 3 (well-formed, signed by a key we do not hold: a rotation in progress or a forgery) · `token:stale` 3 (older than 12 h) · `token:mismatch` 3 when the browser differs from the one that loaded the form, 2 when only the network does (phone moving Wi-Fi to LTE). None of these can quarantine on its own, and none can be pulled below review by a trust rule (see Trust).

Timing: `token:fast` 3 under 1.5 s from token issue to submit, 2 under 3 s. Suppressed when the message repeats the sender's phone number (a human "call me", see below). The client-side `firstSeenAt` is deliberately not scored (forgeable).

Client: `client:webdriver` 3 · `client:no-interaction` 2 (no pointer/key event inside the form before submit).

Content: `name:random` 4 (12+ letters, 3+ interior capitals or under 25% vowels) · `name:short` 1 · `email:gmail-dots` 4 (3+ dots in a Gmail local part) · `email:vendor-domain` 2 (hire/seo/leads/marketing/agency/... in the domain) · `message:digits` 3 (message is 7+ digits only) · `message:equals-phone` 0 (recorded only: the incident bots never repeated their phone, a person who pastes their number as the message does; it also switches off `token:fast` so that person peaks at 4, review) · `message:url-self` 4 (link to the sender's own domain) · `message:url` 1 · `intent:empty` 1 (contact form, select skipped, phone and message filled) · `ua:automation` 0 (recorded, not scored, until the probe below proves the UA reaches the app; then set it to 5).

## Form tokens

Every form asks the server for a token when it mounts (and again after each submit, since tokens are single-use). The form pages are static, so that request is usually the first hit on a scaled-to-zero instance; a submit made before the token has arrived waits for it (up to 8 s, `TOKEN_WAIT_MS` in `form-guard.ts`) rather than posting without one. The token is `v1.<form>.<issued ms>.<nonce>.<binding>.<hmac>`: signed, timestamped, and bound to hashes of the caller's IP and user agent. On submit the server checks the signature against every configured key, the form id, the binding, the age, and claims the nonce in the `form_nonces` collection (Admin SDK only, TTL `expiresAt`); a second submission with the same token is `token:invalid`. Firestore being unavailable fails open, like the counters. What this proves: the submission came through our page, from the same network and browser, once, within 12 h. What it does not prove: that a person was present (that is what the timing, client and content rules are for).

Trust (negative): `trust:contact-token` -6 (came from a campaign link) · `trust:crm-email` -4 (email is in Ken's database) · `trust:name-in-email` -1 (a name token appears in the mailbox name; not applied on vendor domains). Trust only scores when the token is `ok` or tokens are disabled; when any token rule fired the CRM matches are recorded at 0 (visible to Ken, not applied) so a direct post can never be rescued by them. `trust:name-in-email` is sender-controlled (they pick both the name and the address), so it is applied only when no positive rule fired at all: it can label a clean lead, never lower a suspicious one.

Mailbox identity uses `normalizeEmail`: lowercase, `+tag` removed, dots removed for Gmail, googlemail = gmail. The three October bots (`a.s.hley.m.g.m3g.pa.rker@gmail.com` and friends) scored 12 under these rules: random name 4 + Gmail dots 4 + digits-only message 3 + skipped select 1.

## Releasing a real person

In /ken, open the lead (Spam filter for quarantined, Needs attention / New for review-held). The detail panel shows the score, every signal with its weight, the IP, user agent, language and client signals. Click **Not spam: release and notify** (status spam) or **Not spam: send confirmation** (review). The lead becomes `new`, the 48h check-in is re-armed, Ken gets the email if he never did, the sender gets the confirmation, and the CRM link runs. Changing the status select from Spam to New does the same thing. Test leads cannot be released.

Marking a lead Spam from the select cancels its check-in and records `spam.overriddenTo = 'spam'`, which makes the next lead from that mailbox start at +6 (quarantined). An automatic quarantine alone only makes the next lead from that mailbox start at +3 (review), unless it comes from the same network.

## Data

Each lead now carries `emailKey`, `request` (ip, ipSource, ipHash, xff, fahIp, ua, lang, referer, origin, fetchSite, via), `client` (webdriver, interactions, msSinceMount) and `spam` (version, score, verdict, reasons, assessedAt, enforced, releasedAt, releasedBy, overriddenTo). The hourly cron (`/api/cron/leads`) scrubs `request.ip/xff/fahIp/ua` after 60 days (the salted `ipHash` stays), backfills `emailKey` on legacy docs, quarantines stray test leads and purges expired rate counters. The daily digest gains a "Quarantined as spam in the last 24 hours" section: scan it for a real name once a day for the first week.

Rate counters live in the `rate_limits` collection and used token nonces in `form_nonces` (Admin SDK only; no client rule). Enable the TTLs once so Firestore deletes expired docs itself:

```
gcloud firestore fields ttls update expiresAt --collection-group=rate_limits --enable-ttl --project oakville-home-seller-success
gcloud firestore fields ttls update expiresAt --collection-group=form_nonces --enable-ttl --project oakville-home-seller-success
```

The client IP is taken from `x-fah-client-ip` only when the same address also appears in `x-forwarded-for`, otherwise from the penultimate `x-forwarded-for` entry; a lone entry on App Hosting is not trusted (it may be the CDN itself) and leads then carry no IP and no `rate:ip`. Raw `xff` and `fahIp` are stored for 60 days so history can be re-keyed once the probe below settles the layout.

## Configuration

- `LEAD_FORM_SECRET` (falls back to `CRON_SECRET`): signs form tokens. Without either, tokens are disabled and the token rules never fire. Create with `firebase apphosting:secrets:set LEAD_FORM_SECRET` (32+ random chars) and uncomment the block in `apphosting.yaml`.
- Rotation without false positives: tokens signed by any of `LEAD_FORM_SECRET`, `LEAD_FORM_SECRET_PREVIOUS` and `CRON_SECRET` verify. When introducing `LEAD_FORM_SECRET` (today's tokens are signed with `CRON_SECRET`) or rotating it, nothing extra is needed as long as `CRON_SECRET` stays; when rotating `CRON_SECRET` itself, put the old value in `LEAD_FORM_SECRET_PREVIOUS` for a day. A token signed by a key we no longer hold scores `token:unsigned` 3 (review: Ken is still emailed), never spam.
- `SPAM_ENFORCE=false`: kill switch. Scores are still computed and stored (`spam.enforced = false`, a system note on the lead) but every lead is treated as clean. Use it if false positives appear; fix the weight in `RULES`, then remove the variable.

## After deploy

1. `curl -s -A "kf-probe/1.0" -H "Accept-Language: xx-TEST" https://www.kenfinch.ca/api/health` from a known IP. If `callerUa` is `kf-probe/1.0`, the User-Agent survives the CDN: raise `RULES['ua:automation']` to 5. Read `callerFahIp` and `callerXff`: if your IP is `callerFahIp` and also appears in `callerXff` with exactly one Google hop after it, the IP code path is confirmed and `RULES['rate:ip']` can go back to 6; if there are two trailing hops, change `pickClientIp` to take the third-last entry and add that layout to `spam.test.ts`; if your IP appears nowhere, leave `rate:ip` at 3 (it then never fires, since a lone hop is not trusted) and rely on the per-mailbox counter.
2. Submit one real-looking lead from a phone (not a test name) and confirm the /ken detail shows `clean · score 0`, an IP and a user agent. Then mark it spam.
3. Watch the digest's quarantined section for a week.
4. Enable the TTL (above).
5. `npm run test:unit` runs the rule and token tests; `e2e/spam-defense.spec.ts` covers the silent success path and the honeypot wiring.

## Not in this change

Cloudflare Turnstile (only if these rules prove insufficient; it adds a third-party script and a privacy-policy sentence), removing the cron `?key=` query auth, dashboard password hardening, rate limiting `getHomeValuation`, deleting the dormant send-email/chatbot flows, the Firestore `contacts` create rule, manually excluding the three Google Ads conversions (2026-10-09 19:36, 21:10 and 2026-10-11 12:23 Toronto), and attributing the three sessions from the external load-balancer logs (`resource.type=http_load_balancer`).
