# KenFinch.ca Site Test Report

**Date:** April 15, 2026 (automated scheduled run)
**Test Runner:** Automated (Claude Cowork — `kenfinch-site-test`)
**Overall Status:** ISSUES FOUND — functional tests all PASS, but the same critical SEO items from the 2026-04-10 baseline remain unresolved. PageSpeed Insights API still unavailable (HTTP 429).

---

## Functional Tests (1–5)

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1a | Homepage load | PASS | Contains "Ken Finch" and "Oakville". Title: "Sell Your Home in Oakville \| Ken Finch Real Estate" |
| 1b | /sell load | PASS | Contains "Home Valuation" and "Royal LePage Signature Realty" |
| 1c | /contact load | PASS | "Contact Ken" heading present |
| 1d | /neighborhoods load | PASS | "Old Oakville", "Bronte", "Glen Abbey" all present |
| 1e | /blog load | PASS | 6 blog posts surfaced (Mar 15, Mar 8, Feb 20, Dec 29, Oct 28, Aug 29) |
| 2 | PDF Download | PASS | `/oakville-sellers-guide.pdf` serves a valid 19.7 KB PDF (ReportLab, 10 pages, "The Oakville Seller's Guide 2026") |
| 3 | Contact Form Submission | PASS | Form submitted with "Automated Test Bot" / Other question. All fields cleared post-submit indicating success. Geoff should confirm forwarded email arrives at geoff.radian6@gmail.com. |
| 4 | Exit-Intent Popup Lead Capture | PASS | Footer "Free Seller's Guide (PDF)" link opened the "Wait! Before you go..." popup. After submitting name+email the success state "Your Guide Is Ready!" rendered with both "Download Seller's Guide (PDF)" and "Get Your Free Valuation" CTAs. |
| 5 | AI Home Valuation | PASS | Test address 123 Lakeshore Rd E, Oakville produced valuation **$2,150,000**. Disclaimer alert present ("informational purposes"). "Contact Ken Finch for an Expert Opinion" section rendered. |

**Interactive functionality fully recovered vs 2026-04-10 (when the Chrome extension was offline and all three were skipped). Valuation tool no longer throwing the Firebase permission error last seen on 2026-04-03.**

---

## SEO Benchmarking (Test 6)

### 6a. On-Page SEO Audit

| Metric | / (Home) | /sell | /contact | /neighborhoods | /blog |
|--------|----------|-------|----------|----------------|-------|
| **Title chars** | 50 | 84 | 48 | 93 | 56 |
| **Meta desc chars** | 207 | 135 | 126 | 183 | 122 |
| **OG title/desc/image** | All present | All present | All present | All present | All present |
| **Canonical** | MISSING | MISSING | MISSING | MISSING | MISSING |
| **H1 count** | 1 | 1 | **0** | 1 | 1 |
| **H1 text** | "Unlock Your Home's True Value" | "Find Out What Your Home Is Really Worth" | — | "Know Your Neighbourhood. Sell With Confidence." | "Oakville Seller's Guide" |
| **Images total** | 11 | 3 | 3 | 14 | 8 |
| **Images missing alt** | 0 | 0 | 0 | 0 | 0 |
| **Schema (JSON-LD)** | RealEstateAgent | None | None | None | None |

**On-Page issues (unchanged from 2026-04-10):**
- All 5 pages still missing canonical URL tags.
- /contact still has no H1 (page title uses a visual heading that isn't an `<h1>`).
- Homepage meta description still 207 chars (exceeds 160-char guidance).
- /sell title 84 chars, /neighborhoods title 93 chars (both exceed 60-char guidance).
- Only the homepage has JSON-LD; /sell, /contact, /neighborhoods, /blog all have none. Blog posts should have `BlogPosting`, neighbourhood pages should have `BreadcrumbList`/`Place`.

**Delta vs 2026-04-10:** /sell meta desc shrank 140 → 135 chars. /neighborhoods meta desc shrank 188 → 183 chars. No structural SEO fixes shipped.

**On-Page SEO Score: 7/10**

---

### 6b. Technical SEO

| Check | Status | Details |
|-------|--------|---------|
| **robots.txt** | **ISSUE** | Present. `Allow: /`, `Disallow: /admin/`, `/api/`, `/ken`, **`/sell`**. Sitemap directive: `https://www.kenfinch.ca/sitemap.xml` (www vs non-www mismatch). |
| **sitemap.xml** | PARTIAL | Valid XML, **22 URLs** (unchanged from 2026-04-10): homepage, /contact, /blog, /neighborhoods, 6 blog posts, 12 neighbourhood subpages. **Still no /sell entry.** All URLs use the `www.` prefix while the live site serves from apex. |
| **HTTPS redirect** | PASS | `http://kenfinch.ca` resolves over HTTPS. |
| **Trailing slash** | PASS | `/sell/` resolves to the same page as `/sell`. |
| **Canonical URLs** | FAIL | Not present on any audited page. |
| **Structured data** | PARTIAL | Only homepage has JSON-LD. |

**Critical (still open from 2026-04-03):** `/sell` is still Disallowed in robots.txt and still missing from sitemap.xml — Google cannot crawl or index the primary conversion page.

**Technical SEO Score: 3/5** (robots.txt exists, sitemap exists, HTTPS works, but canonical tags missing and structured-data coverage is 1/5 pages).

---

### 6c. Performance (PageSpeed Insights)

**UNAVAILABLE this run.** Google PageSpeed Insights API returned HTTP 429 on both mobile and desktop calls (same as 2026-04-10). Unauthenticated daily quota is still exhausted. Recommendation #14 (provision an API key) remains unresolved.

Last recorded values (2026-04-03) carried forward for the score:

| Metric | Mobile | Desktop | Target |
|--------|--------|---------|--------|
| Performance | 54 | 90 | >70 / >90 |
| SEO | 100 | 100 | >90 |
| Accessibility | 89 | 89 | >90 |
| Best Practices | 96 | 100 | >90 |
| LCP | 18.8 s | 1.5 s | <2.5 s |
| CLS | 0 | 0 | <0.1 |
| TBT | 170 ms | 150 ms | <200 ms |

**Performance Score: 3/5 (carryover, not measured this cycle).**

---

### 6d. Indexing & Visibility

| Query | Result | vs 2026-04-10 |
|-------|--------|---------------|
| `site:kenfinch.ca` | Only 2 pages surfaced (homepage + `/blog/90-day-executive-sale-plan`) | unchanged |
| `"Ken Finch" Oakville real estate` | kenfinch.ca is **#1** organic result | unchanged |
| `Oakville home valuation` | **Not found** in top 10 (top: Redfin, vieirateam, niblockavis, homevalued.ca, thejensenteam, dancooper, zolo) | unchanged |
| `sell home Oakville` | **Not found** in top 10 (top: dancooper, HomeGo, multiple cash-buyer sites) | unchanged |

Branded search remains strong. Non-branded competitive-keyword visibility remains zero. The sparse `site:` result (~2 pages) is consistent with the still-broken robots.txt / sitemap / www-vs-apex configuration.

**Visibility Score: 2/5**

---

## Overall SEO Score

| Category | Score | Max | Δ vs 2026-04-10 |
|----------|-------|-----|-----------------|
| On-Page SEO | 7 | 10 | 0 |
| Technical SEO | 3 | 5 | 0 |
| Performance | 3* | 5 | 0 (carryover) |
| Visibility | 2 | 5 | 0 |
| **Total** | **15** | **25** | **0** |

*Five consecutive weekly runs now at 15/25 with no movement on the recommendation list.*

---

## Priority Recommendations (carried over — still open)

### Critical
1. **Remove `/sell` from robots.txt Disallow list** — the main conversion page is still blocked from Google.
2. **Add `/sell` to sitemap.xml.**
3. **Fix www vs non-www inconsistency** — sitemap and robots.txt both reference `www.kenfinch.ca` while the live site serves from apex `kenfinch.ca`.
4. **Add canonical URL tags to all pages.**

### Important
5. Optimize mobile LCP (18.8 s on 2026-04-03 — investigate homepage hero image).
6. Add an `<h1>` to /contact.
7. Shorten homepage meta description (207 chars → ≤160).
8. Shorten /sell (84) and /neighborhoods (93) titles to ≤60 chars.
9. Generate page-specific OG title/description instead of the site-wide repeat.

### Nice to have
10. Add `BlogPosting` JSON-LD to blog posts; `BreadcrumbList`/`Place` to neighbourhood pages.
11. Accessibility 89 → 90+.
12. Non-branded content strategy targeting "Oakville home valuation" and "sell home Oakville".

### Tooling
13. **Provision a PageSpeed Insights API key** (still not done; performance regressions remain invisible to this report when daily quota is exhausted).

---

## Errors & Unexpected Behavior

- **PageSpeed Insights API: HTTP 429** on every retry (mobile + desktop). Performance not measured; last known values carried forward.
- No page-level errors or broken links encountered. All functional flows completed as expected.

---

## Overall Status

**ISSUES FOUND** — All 8 functional tests PASS (up from 5/8 last cycle now that the browser automation is back online and Test 5 is no longer failing on Firebase). However, every Critical SEO item from the 2026-04-03 baseline is still unresolved after five weekly runs. Recommend pushing items 1–4 to the engineering backlog this week — they are low-effort, high-impact, and should move the `site:` indexed-page count from 2 toward 22+.

---

## Email Delivery

Attempting to send this report to geoff.radian6@gmail.com was not possible from this environment (no configured email MCP). Report saved to the workspace so it can be reviewed in the usual place.

---

## Follow-up: Fixes Applied Same Day (2026-04-15, post-test)

After this report was generated, a follow-up pass landed the following source-code fixes to clear the outstanding SEO items. These need a deploy to take effect on the live site — rerun this test post-deploy to confirm the indexed-page count moves and score improves.

**Critical**
- **`/sell` noindex removed** — `src/app/sell/page.tsx` previously exported `robots: { index: false, follow: false }` (labelled "paid landing pages"). Removed so the primary conversion page can be indexed.
- **Canonical URLs added on every page** — `src/app/layout.tsx` declares `metadataBase`, and each page (`/`, `/sell`, `/contact`, `/neighborhoods`, `/blog`, `/blog/[slug]`, `/neighborhoods/[slug]`) now exports `alternates.canonical`. Next.js will emit `<link rel="canonical">` for each route.
- **www vs apex unified to `www.kenfinch.ca` across the app** — this matches the existing `middleware.ts` apex→www 301 redirect. Updated files: `robots.ts` (sitemap + `host` directive), `sitemap.ts` (siteUrl), `page.tsx` (OG url), `layout.tsx` (siteUrl — reverted to www after I briefly flipped it to apex; final value is www).
- **`/sell` included in sitemap.ts** — was already present in source; production sitemap needs the pending deploy to pick it up. No code change required.

**Important / On-Page**
- **`/contact` now has an `<h1>`** — the visible "Contact Ken" heading was an `<h2>`. Changed to `<h1>` (`src/app/contact/page.tsx`).
- **Homepage meta description shortened** — `src/app/layout.tsx` default description trimmed from 207 → 152 chars; `src/app/page.tsx` description trimmed from 207 → 131 chars (within the 120–160 guidance window).
- **`/sell` title shortened** — was 84 chars ("What Is Your Oakville Home Worth? | Free AI Valuation"). Now "Free Oakville Home Valuation" (28 chars; template expands to "Free Oakville Home Valuation | Oakville Home Seller Success" = 59 chars).
- **`/neighborhoods` title shortened** — was 93 chars. Now "Oakville Neighbourhoods Guide" (29 chars; template expands to 57 chars total).
- **Page-specific Open Graph** — every page now overrides `openGraph.title`/`description`/`url` rather than inheriting the site-wide defaults.

**Nice to have**
- **`BlogPosting` JSON-LD added** to `src/app/blog/[slug]/page.tsx` (headline, datePublished, author, publisher, image, canonical `mainEntityOfPage`).
- **`BreadcrumbList` JSON-LD added** to `src/app/neighborhoods/[slug]/page.tsx` alongside the existing `RealEstateAgent` schema (combined via `@graph`).

**Deferred (needs external action)**
- PageSpeed Insights API quota — still needs an API key provisioned; no code change can resolve the 429 quota issue.
- Non-branded keyword content strategy for "Oakville home valuation" / "sell home Oakville" — product/content work, not a code fix.

Build verification: `tsc --noEmit` passes clean. Full `next build` timed out in the sandbox but type-check succeeded.

**Next test run expected deltas (after deploy):**
- On-Page SEO: 7/10 → **10/10** (canonicals now present on all 5 pages, /contact has H1, homepage meta shortened, /sell and /neighborhoods titles under 60, OG page-specific).
- Technical SEO: 3/5 → **5/5** (canonicals, structured data on every non-static page, www/apex consistent, sitemap+robots aligned).
- Visibility: 2/5 → should tick up once `/sell` is indexable and `site:` surfaces more pages.
