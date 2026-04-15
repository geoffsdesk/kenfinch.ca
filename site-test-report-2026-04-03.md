# KenFinch.ca Site Test Report

**Date:** April 3, 2026, ~9:30 PM EDT
**Test Runner:** Automated (Claude Cowork — manual trigger with SEO benchmarking)
**Overall Status:** ISSUES FOUND

---

## Functional Tests (1–5)

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1a | Homepage | PASS | Contains "Ken Finch", "Oakville", hero, stats, nav |
| 1b | /sell | PASS | Contains "Home Valuation", "Royal LePage Signature Realty" |
| 1c | /contact | PASS | Contains "Contact Ken" heading and form |
| 1d | /neighborhoods | PASS | All 10 neighbourhoods present |
| 1e | /blog | PASS | 6 blog posts with links |
| 2 | PDF Download | PASS | Seller's Guide PDF loads (10 pages) |
| 3 | Contact Form | PASS | Submitted test data, form cleared on success |
| 4 | Lead Capture Popup | PASS | Popup appeared, submitted, success state with PDF download button |
| 5 | AI Home Valuation | FAIL | Form filled and submitted, but **Firebase permissions error** prevented valuation result from displaying. Error: "Failed to save lead: FirebaseError: Missing or insufficient permissions" |

> **Action Required (Test 5):** Investigate Firebase security rules — the lead-save operation is being rejected, which blocks the valuation result from rendering.

---

## SEO Benchmarking (Test 6)

### 6a. On-Page SEO Audit

| Metric | / (Home) | /sell | /contact | /neighborhoods | /blog |
|--------|----------|-------|----------|----------------|-------|
| **Title** | Sell Your Home in Oakville \| Ken Finch Real Estate | What Is Your Oakville Home Worth? \| Free AI Valuation \| Oakville Home Seller Success | Contact Ken Finch \| Oakville Home Seller Success | Oakville Neighborhoods Guide — Sell Your Home With Confidence \| Oakville Home Seller Success | Oakville Real Estate Blog \| Oakville Home Seller Success |
| **Title Length** | 50 | 84 | 48 | 92 | 56 |
| **Meta Desc Length** | 207 | 135 | 126 | 181 | 122 |
| **OG Title** | Generic | Generic | Generic | Generic | Generic |
| **OG Desc** | Generic | Generic | Generic | Generic | Generic |
| **OG Image** | Present | Present | Present | Present | Present |
| **Canonical** | MISSING | MISSING | MISSING | MISSING | MISSING |
| **H1 Count** | 1 | 1 | **0** | 1 | 1 |
| **Images Missing Alt** | 0/11 | 0/3 | 0/3 | 0/12 | 0/8 |
| **Schema Types** | RealEstateAgent | None | None | None | None |

**On-Page Issues Found:**

- All 5 pages missing canonical URL tags
- /contact page has no H1 tag
- Homepage meta description is 207 chars (exceeds 160-char recommended limit)
- /sell title is 84 chars and /neighborhoods is 92 chars (both exceed 60-char limit)
- All pages share identical generic OG title/description (not page-specific)
- Only homepage has structured data (RealEstateAgent); other pages have none
- /blog has 0 H2 tags

**On-Page SEO Score: 7/10**

---

### 6b. Technical SEO

| Check | Status | Details |
|-------|--------|---------|
| **robots.txt** | ISSUE | Exists, references sitemap. **BUT `/sell` is in the Disallow list** — this critical page is blocked from crawlers. `/ken` also blocked (unclear purpose). Sitemap URL uses `www.kenfinch.ca` but site runs on `kenfinch.ca`. |
| **sitemap.xml** | PASS | Exists with 20 URLs. Includes homepage, blog posts, neighborhoods. **Missing: /sell page.** Uses `www.kenfinch.ca` prefix. |
| **HTTPS Redirect** | PASS | http://kenfinch.ca correctly redirects to https://kenfinch.ca |
| **Trailing Slash** | PASS | /sell/ redirects to /sell (consistent behavior) |

**Critical:** `/sell` is blocked in robots.txt AND missing from sitemap. This is the main conversion page (AI Home Valuation) and Google cannot crawl or index it.

**Technical SEO Score: 3/5**

---

### 6c. Performance (PageSpeed Insights)

| Metric | Mobile | Desktop | Target |
|--------|--------|---------|--------|
| **Performance** | **54** | 90 | >70 / >90 |
| **SEO** | 100 | 100 | >90 |
| **Accessibility** | 89 | 89 | >90 |
| **Best Practices** | 96 | 100 | >90 |
| **LCP** | **18.8s** | 1.5s | <2.5s |
| **CLS** | 0 | 0 | <0.1 |
| **TBT** | 170ms | 150ms | <200ms |

**Key Issue:** Mobile performance score is 54 with an LCP of 18.8 seconds — far above the 2.5-second target. Desktop performance is excellent at 90. The massive mobile/desktop gap suggests unoptimized images or heavy resources that especially impact mobile loading.

**Performance Score: 3/5** (desktop excellent, mobile significantly below target)

---

### 6d. Indexing & Visibility

| Query | Result |
|-------|--------|
| `site:kenfinch.ca` | ~1-2 pages indexed |
| `"Ken Finch" Oakville real estate` | **#1** (top result) |
| `Oakville home valuation` | Not found in top 20 |
| `sell home Oakville` | Not found in top 20 |

Branded search is strong (#1 for "Ken Finch" Oakville real estate), but non-branded competitive keywords show no visibility. Very few pages appear indexed — likely related to robots.txt blocking `/sell` and www/non-www inconsistency.

**Visibility Score: 2/5**

---

## Overall SEO Score

| Category | Score | Max |
|----------|-------|-----|
| On-Page SEO | 7 | 10 |
| Technical SEO | 3 | 5 |
| Performance | 3 | 5 |
| Visibility | 2 | 5 |
| **Total** | **15** | **25** |

---

## Priority Recommendations

### Critical (Fix Immediately)

1. **Remove `/sell` from robots.txt Disallow list** — Your main conversion page is blocked from Google
2. **Add `/sell` to sitemap.xml** — It's missing entirely
3. **Fix www vs non-www inconsistency** — Sitemap references `www.kenfinch.ca` but site runs on `kenfinch.ca`
4. **Investigate Firebase permissions error** — Valuation tool failing to save leads, blocking results display
5. **Add canonical URL tags to all pages** — Prevents duplicate content issues

### Important (This Week)

6. **Optimize mobile LCP** — 18.8s is extremely slow; investigate image optimization, lazy loading, and resource prioritization
7. **Add H1 tag to /contact page**
8. **Shorten meta descriptions** — Homepage at 207 chars will be truncated in search results
9. **Shorten title tags** — /sell (84 chars) and /neighborhoods (92 chars) exceed 60-char limit
10. **Create page-specific OG tags** — All pages share generic OG metadata

### Nice to Have (This Month)

11. Add structured data (LocalBusiness, BlogPosting, BreadcrumbList) to non-homepage pages
12. Improve accessibility score from 89 to 90+
13. Build content strategy targeting non-branded keywords ("Oakville home valuation", "sell home Oakville")

---

*This is the first SEO benchmark run. Future reports will compare against these baseline values.*
