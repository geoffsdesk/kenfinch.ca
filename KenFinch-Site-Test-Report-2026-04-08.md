# KenFinch.ca Site Test Report

**Date:** April 8, 2026, 4:33 PM EDT  
**Overall Status:** ISSUES FOUND (5/5 functional tests PASS, SEO issues identified)

---

## Functional Test Results

### 1. Page Load Tests — ALL PASS

| Page | Status | Notes |
|------|--------|-------|
| `/` (Homepage) | PASS | Contains "Ken Finch" and "Oakville". Title: "Sell Your Home in Oakville \| Ken Finch Real Estate" |
| `/sell` | PASS | Contains "Home Valuation" and "Royal LePage Signature Realty" |
| `/contact` | PASS | Contains "Contact Ken" |
| `/neighborhoods` | PASS | Contains "Old Oakville", "Bronte", "Glen Abbey" |
| `/blog` | PASS | Contains 12 blog post links |

### 2. PDF Download Test — PASS

PDF at `/oakville-sellers-guide.pdf` loaded successfully as "The Oakville Seller's Guide 2026".

### 3. Contact Form Submission — PASS

Form submitted with test data (Name: "Automated Test Bot", Email: geoff.radian6@gmail.com, Intent: "Other question"). Form reset after submission, indicating successful processing. Check inbox for forwarded email to confirm email delivery pipeline.

### 4. Exit-Intent Popup Lead Capture — PASS

- Popup triggered via footer "Free Seller's Guide (PDF)" button
- Form submitted with Name: "Test Lead Bot", Email: geoff.radian6@gmail.com
- "Your Guide Is Ready!" success state appeared with PDF download button

### 5. AI Home Valuation Tool — PASS

- Test address: 123 Lakeshore Road East, Oakville, ON (Detached, 3+1 bed, 2 bath, 2,000-2,500 sq ft)
- **Estimated Value: $3,150,000** (88% confidence score)
- Disclaimer visible: "This is an AI-generated estimate for informational purposes only. It is not an appraisal..."
- "Ready for an Expert Opinion?" contact section appeared below results

---

## SEO Benchmark Results

### 6a. On-Page SEO Audit

| Page | Title (chars) | Meta Desc (chars) | OG Tags | Canonical | H1 | Imgs Missing Alt | Schema |
|------|--------------|-------------------|---------|-----------|-----|-----------------|--------|
| `/` | "Sell Your Home in Oakville \| Ken Finch Real Estate" (50) | 207 chars | All present | MISSING | "Unlock Your Home's True Value" (1) | 0/11 | RealEstateAgent |
| `/sell` | "What Is Your Oakville Home Worth? \| Free AI Valuation \| Oakville Home Seller Success" (84) | 135 chars | All present | MISSING | "Find Out What Your Home Is Really Worth" (1) | 0/3 | None |
| `/contact` | "Contact Ken Finch \| Oakville Home Seller Success" (48) | 126 chars | All present | MISSING | **NONE (missing H1)** | 0/3 | None |
| `/neighborhoods` | "Oakville Neighbourhoods Guide — Sell Your Home With Confidence \| Oakville Home Seller Success" (93) | 183 chars | All present | MISSING | "Know Your Neighbourhood. Sell With Confidence." (1) | 0/14 | None |
| `/blog` | "Oakville Real Estate Blog \| Oakville Home Seller Success" (56) | 122 chars | All present | MISSING | "Oakville Seller's Guide" (1) | 0/8 | None |

**Issues Found:**
- Homepage meta description is 207 chars (should be 120-160)
- `/sell` title is 84 chars (should be under 60)
- `/neighborhoods` title is 93 chars (should be under 60)
- `/neighborhoods` meta description is 183 chars (should be 120-160)
- `/contact` is missing an H1 tag
- **No canonical URLs on any page**
- Structured data (JSON-LD) only on homepage (RealEstateAgent); missing on all other pages
- All images have alt text (good!)

### 6b. Technical SEO Checks

| Check | Status | Details |
|-------|--------|---------|
| robots.txt | ISSUE | Exists, but **blocks /sell** (a key page!) and /ken. Sitemap URL references `www.kenfinch.ca` (inconsistent with non-www domain) |
| sitemap.xml | ISSUE | Exists with 22 URLs, but all URLs use `www.kenfinch.ca` instead of `kenfinch.ca` |
| HTTPS | PASS | Site loads on https://kenfinch.ca |
| Trailing slash | OK | /sell loads without trailing slash |

**Critical Issue:** robots.txt contains `Disallow: /sell` which blocks search engines from crawling the main selling/valuation page. This must be fixed immediately.

### 6c. Performance Scores (Lighthouse via PageSpeed Insights)

| Metric | Mobile | Target | Desktop | Target |
|--------|--------|--------|---------|--------|
| **Performance** | **56** | >70 | **89** | >90 |
| **Accessibility** | **89** | >90 | **89** | >90 |
| **Best Practices** | **96** | >90 | **100** | >90 |
| **SEO** | **100** | >90 | **100** | >90 |
| FCP | 4.9s | — | 0.3s | — |
| **LCP** | **18.4s** | <2.5s | 2.0s | <2.5s |
| TBT | 100ms | — | 70ms | — |
| CLS | 0 | <0.1 | 0 | <0.1 |

**Critical Issue:** Mobile LCP of 18.4s is extremely poor. This likely stems from large unoptimized images or render-blocking resources. Desktop LCP of 2.0s is acceptable.

### 6d. Indexing & Visibility

| Query | Result |
|-------|--------|
| `site:kenfinch.ca` | ~2 pages indexed (very low for 22 sitemap URLs) |
| `"Ken Finch" Oakville real estate` | **#1** — kenfinch.ca is the top result |
| `Oakville home valuation` | Not found in top 10 |
| `sell home Oakville` | Not found in top 10 |

**Note:** The very low index count (2 vs 22 sitemap URLs) is likely caused by the www/non-www domain mismatch in the sitemap and the robots.txt blocking key pages.

### SEO Score: 13/25

| Category | Score | Notes |
|----------|-------|-------|
| On-Page SEO | 6/10 | -1 homepage meta too long, -1 /sell title too long, -1 /neighborhoods title+meta too long, -1 /contact missing H1 |
| Technical SEO | 3/5 | robots.txt blocks /sell (-0.5), sitemap wrong domain (-0.5), no canonical URLs (-0.5), limited structured data (-0.5) |
| Performance | 2/5 | Mobile perf 56 (below 70), accessibility 89 on both (below 90 target) |
| Visibility | 2/5 | #1 for brand query (+2), only 2 pages indexed, no non-brand rankings (-3) |
| **TOTAL** | **13/25** | |

---

## Priority Fixes

1. **CRITICAL: Fix robots.txt** — Remove `Disallow: /sell` to allow search engines to crawl the selling page. Also fix sitemap URL to use `kenfinch.ca` (non-www) consistently.
2. **CRITICAL: Fix sitemap.xml domain** — Change all URLs from `www.kenfinch.ca` to `kenfinch.ca` to match the actual site domain.
3. **HIGH: Optimize mobile LCP (18.4s)** — Compress hero image, use next/image with priority loading, implement lazy loading for below-fold images.
4. **MEDIUM: Add canonical URLs** — Add `<link rel="canonical">` tags to all pages.
5. **MEDIUM: Fix title/meta lengths** — Shorten /sell and /neighborhoods titles to under 60 chars; fix homepage and /neighborhoods meta descriptions to 120-160 chars.
6. **MEDIUM: Add H1 to /contact page**
7. **LOW: Add structured data** — Add JSON-LD schema markup (LocalBusiness, FAQPage, BlogPosting) to /sell, /contact, /neighborhoods, and /blog pages.
8. **LOW: Improve accessibility** — Address the 11-point gap to reach 90+ on both mobile and desktop.

---

*This is the first test run. Future reports will include score comparisons against this baseline.*
*Report generated by automated scheduled task.*
