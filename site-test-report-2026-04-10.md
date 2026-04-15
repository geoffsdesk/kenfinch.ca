# KenFinch.ca Site Test Report

**Date:** April 10, 2026 (automated scheduled run)
**Test Runner:** Automated (Claude Cowork — `kenfinch-site-test`)
**Overall Status:** ISSUES FOUND — same critical SEO items as 2026-04-03 baseline still unresolved. Browser-based interactive tests (Tests 3, 4, 5) were **skipped** because the Claude-in-Chrome extension was not reachable during this run. PageSpeed Insights was **unavailable** (daily API quota exhausted).

---

## Functional Tests (1–5)

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1a | Homepage load | PASS | 200 OK, 109 KB. Contains "Ken Finch" and "Oakville". Title: "Sell Your Home in Oakville \| Ken Finch Real Estate" |
| 1b | /sell load | PASS | 200 OK, 54 KB. Contains "Home Valuation" and "Royal LePage Signature Realty" |
| 1c | /contact load | PASS | 200 OK, 37 KB. Contains "Contact Ken" heading |
| 1d | /neighborhoods load | PASS | 200 OK, 121 KB. All three required names present ("Old Oakville", "Bronte", "Glen Abbey") |
| 1e | /blog load | PASS | 200 OK, 55 KB. 6 blog posts present, including the Oct 2026 market report and 90-day executive sale plan |
| 2 | PDF Download | PASS | `/oakville-sellers-guide.pdf` returns 200, 19.7 KB PDF binary served successfully |
| 3 | Contact Form Submission | SKIPPED | Chrome extension unreachable — interactive browser test could not run this cycle |
| 4 | Exit-Intent Popup Lead Capture | SKIPPED | Chrome extension unreachable |
| 5 | AI Home Valuation | SKIPPED | Chrome extension unreachable. Note: on 2026-04-03 this test FAILED due to a Firebase permissions error; status remains unverified this run |

> **Action Required:** Re-run the three browser-based tests when the Chrome automation extension is reconnected. Test 5's Firebase permissions fix from 2026-04-03 is still unverified.

---

## SEO Benchmarking (Test 6)

### 6a. On-Page SEO Audit

| Metric | / (Home) | /sell | /contact | /neighborhoods | /blog |
|--------|----------|-------|----------|----------------|-------|
| **Title chars** | 50 | 84 | 48 | 93 | 56 |
| **Meta desc chars** | 207 | 140 | 126 | 188 | 122 |
| **OG title** | Present (site-wide) | Present (site-wide) | Present (site-wide) | Present (site-wide) | Present (site-wide) |
| **OG description** | Present (site-wide) | Present (site-wide) | Present (site-wide) | Present (site-wide) | Present (site-wide) |
| **OG image** | Yes | Yes | Yes | Yes | Yes |
| **Canonical** | MISSING | MISSING | MISSING | MISSING | MISSING |
| **H1 count** | 1 | 1 | **0** | 1 | 1 |
| **H2 count** | 5 | 3 | 1 | 2 | **0** |
| **Images missing alt** | 0/12 | 0/4 | 0/4 | 0/15 | 0/9 |
| **Schema types** | RealEstateAgent, PostalAddress, Place, Organization | None | None | None | None |

**On-Page Issues (unchanged from 2026-04-03 baseline):**
- All 5 pages still missing canonical URL tags.
- /contact still has no H1.
- Homepage meta description still 207 chars (exceeds 160-char limit).
- /sell title 84 chars, /neighborhoods title 93 chars (both exceed 60-char limit).
- OG title/description are the same site-wide string on every page — still not page-specific.
- Only homepage has JSON-LD structured data. Blog pages in particular should have `BlogPosting`/`Article` schema.
- /blog has 0 H2 tags (only the page H1 plus H3s for individual posts).

**Delta vs 2026-04-03:** No net changes. /sell meta description grew from 135 → 140 chars. /neighborhoods title grew from 92 → 93 chars. Otherwise identical.

**On-Page SEO Score: 7/10**

---

### 6b. Technical SEO

| Check | Status | Details |
|-------|--------|---------|
| **robots.txt** | **ISSUE** | Exists. Allows `/`, disallows `/admin/`, `/api/`, `/ken`, **`/sell`**. Sitemap line points to `https://www.kenfinch.ca/sitemap.xml` (www vs non-www mismatch). |
| **sitemap.xml** | PARTIAL | Valid XML, 22 URLs (up from 20 on 2026-04-03). Homepage, /contact, /blog, /neighborhoods, 6 blog posts, 11 neighbourhood detail pages. **Still missing /sell.** URLs still use `www.kenfinch.ca` prefix while site serves from `kenfinch.ca`. |
| **HTTPS redirect** | PASS | `http://kenfinch.ca` → `https://kenfinch.ca` (301) |
| **Trailing slash consistency** | PASS | `/sell/` → `/sell` via 308 redirect |

**Critical (still open from 2026-04-03):** `/sell` — the primary conversion page — is still disallowed in robots.txt and still absent from sitemap.xml. Google cannot crawl or index it.

**Technical SEO Score: 3/5**

---

### 6c. Performance (PageSpeed Insights)

**UNAVAILABLE this run.** Google PageSpeed Insights API returned HTTP 429 on every retry with the error: *"Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com'."* The unauthenticated daily quota has been exhausted (likely from repeated test runs). An API key would fix this.

Last recorded values (2026-04-03) for reference:

| Metric | Mobile (2026-04-03) | Desktop (2026-04-03) | Target |
|--------|---------------------|----------------------|--------|
| Performance | 54 | 90 | >70 / >90 |
| SEO | 100 | 100 | >90 |
| Accessibility | 89 | 89 | >90 |
| Best Practices | 96 | 100 | >90 |
| LCP | 18.8 s | 1.5 s | <2.5 s |
| CLS | 0 | 0 | <0.1 |
| TBT | 170 ms | 150 ms | <200 ms |

**Performance Score: not scored this cycle (carryover 3/5 from 2026-04-03 used in totals below).**

---

### 6d. Indexing & Visibility

| Query | Result | vs 2026-04-03 |
|-------|--------|---------------|
| `site:kenfinch.ca` | ~2 pages surfaced (homepage + 90-day executive sale plan blog post) | unchanged |
| `"Ken Finch" Oakville real estate` | kenfinch.ca is **#1** organic result; Royal LePage profile and Facebook page follow | unchanged |
| `Oakville home valuation` | **Not found** in top 10 results (top results: Redfin, vieirateam, niblockavis, thejensenteam, homevalued.ca, dancooper.com, buyingoakville) | unchanged |
| `sell home Oakville` | **Not found** in top 10 results (top results: dancooper.com, HomeGo, cash-buyer sites, Zillow) | unchanged |

Branded search remains strong (#1 for "Ken Finch" Oakville real estate). Non-branded competitive-keyword visibility remains zero. Only ~2 pages surfaced via `site:` operator — consistent with the robots.txt/sitemap issues and www/non-www inconsistency.

**Visibility Score: 2/5**

---

## Overall SEO Score

| Category | Score | Max | Δ vs 2026-04-03 |
|----------|-------|-----|-----------------|
| On-Page SEO | 7 | 10 | 0 |
| Technical SEO | 3 | 5 | 0 |
| Performance | 3* | 5 | (*carryover, not measured this run) |
| Visibility | 2 | 5 | 0 |
| **Total** | **15** | **25** | **0** |

*No recommendation items from the 2026-04-03 report have been resolved in the last 7 days.*

---

## Priority Recommendations (unchanged from 2026-04-03)

### Critical (still open)

1. **Remove `/sell` from robots.txt Disallow list** — the main conversion page is still blocked.
2. **Add `/sell` to sitemap.xml** — still missing.
3. **Fix www vs non-www inconsistency** — sitemap and robots.txt both reference `www.kenfinch.ca` while the live site serves from apex `kenfinch.ca`.
4. **Verify Firebase permissions fix for the valuation tool** — last confirmed failure 2026-04-03; not re-tested this run due to browser automation outage.
5. **Add canonical URL tags to all pages.**

### Important

6. Optimize mobile LCP (18.8 s on 2026-04-03 — investigate image/LCP element on homepage).
7. Add an H1 to /contact.
8. Shorten homepage meta description (currently 207 chars).
9. Shorten /sell (84 c) and /neighborhoods (93 c) title tags.
10. Create page-specific OG title/description (currently site-wide strings repeat on every page).

### Nice to have

11. Add `BlogPosting`/`Article` JSON-LD to blog posts; add `BreadcrumbList` to neighbourhood pages.
12. Accessibility score 89 → 90+.
13. Non-branded keyword content strategy for "Oakville home valuation" and "sell home Oakville".

### New action item for this run

14. **Provision a PageSpeed Insights API key** and use it in the scheduled task so daily quota is not exhausted — performance regressions are currently invisible to this report when quota runs out.
15. **Restore Claude-in-Chrome connection** for the test runner so Tests 3/4/5 can execute on schedule.

---

## Errors & Unexpected Behavior This Run

- **Claude-in-Chrome extension: not connected.** All `mcp__Claude_in_Chrome__*` calls returned *"Claude in Chrome is not connected"*. Tests 3, 4, and 5 could not be executed and are marked SKIPPED (not FAIL).
- **PageSpeed Insights API: HTTP 429 (daily quota exceeded).** Mobile and desktop performance not measured this run.
- No unexpected errors from the pages themselves — all 5 key pages returned HTTP 200 and served the expected content.

---

## Overall Status

**ISSUES FOUND** — 5 critical SEO/functional items from the 2026-04-03 report are still open. This run could not verify interactive functionality (contact form, lead capture popup, AI valuation) or current Lighthouse scores due to tooling outages. Functional page-load and PDF download checks all PASS.
