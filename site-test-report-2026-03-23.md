# KenFinch.ca Site Test Report

**Date:** Monday, March 23, 2026, 09:10 AM EDT
**Test Runner:** Automated (Cowork Scheduled Task)
**Overall Status:** MOSTLY PASS — 4/5 tests passed, 1 inconclusive

---

## Test Results

### 1. Page Load Tests — PASS

All five pages loaded successfully with expected content:

| Page | URL | Status | Content Verified |
|------|-----|--------|-----------------|
| Homepage | kenfinch.ca | PASS | "Ken Finch", "Oakville", hero section, navigation |
| Sell | kenfinch.ca/sell | PASS | Valuation form, "Royal LePage Signature Realty" |
| Contact | kenfinch.ca/contact | PASS | "Contact Ken", form fields present |
| Neighborhoods | kenfinch.ca/neighborhoods | PASS | Old Oakville, Bronte, Glen Abbey + 7 more |
| Blog | kenfinch.ca/blog | PASS | 6 blog posts with links, dates from Aug 2025–Mar 2026 |

### 2. PDF Download Test — PASS

- **URL:** kenfinch.ca/oakville-sellers-guide.pdf
- **Result:** PDF loaded successfully in browser, 10 pages visible
- **Title:** "The Oakville Seller's Guide 2026"
- **Content:** Cover page with Ken Finch branding, Royal LePage Signature Realty

### 3. Contact Form Submission Test — PASS

- **Form filled with:** Name: "Automated Test Bot", Email: geoff.radian6@gmail.com, Phone: (000) 000-0000, Intent: "Other question", Message: Automated test with timestamp
- **Submission:** Form POST returned HTTP 200, form fields reset after submission (confirming successful submit)
- **Note:** Success toast appeared briefly (form reset confirms submission). Geoff should check inbox for the forwarded contact form email to confirm full email delivery pipeline.

### 4. Exit-Intent Popup Lead Capture Test — INCONCLUSIVE

- **ExitIntentPopup component exists** in the site's JavaScript bundle
- **Footer "Free Seller's Guide (PDF)" button** is present but currently scrolls to the valuation form section rather than opening a popup dialog
- **Exit-intent trigger:** Could not be reliably simulated in automated browser testing (requires real mouse leaving the browser viewport, which cannot be replicated via Puppeteer/automation)
- **Recommendation:** Manually verify this popup by visiting kenfinch.ca and moving the mouse toward the browser's address bar or tab area. If the popup has been intentionally removed or replaced with the footer scroll behavior, update the test plan accordingly.

### 5. AI Home Valuation Test — PASS

- **Address:** 123 Lakeshore Road East, Oakville, ON, Canada (selected via autocomplete)
- **Form fields:** All populated correctly — Detached, 3 bed above / 1 below, 2 bath, 2,000–2,500 sq ft, 16–30 years, finished basement, 2 garage / 4 total parking, schools entered, renovated checked
- **Valuation result:** $2,150,000 estimated value displayed
- **Confidence Score:** 85%
- **Disclaimer alert:** Visible — "This is an AI-generated estimate for informational purposes only. It is not an appraisal, and should not be relied upon for financial or legal decisions."
- **"Ready for an Expert Opinion?" section:** Visible below valuation with contact form for Ken Finch
- **Valuation Reasoning:** Expandable section present

---

## Summary

| Test | Result |
|------|--------|
| Page Load Tests (5 pages) | PASS |
| PDF Download | PASS |
| Contact Form Submission | PASS |
| Exit-Intent Popup | INCONCLUSIVE |
| AI Home Valuation | PASS |

**Issues Found:**
- The exit-intent popup could not be triggered via automation. The component exists in code but the footer link now scrolls to the valuation tool instead of opening a lead capture dialog. This may be intentional behavior change or a limitation of automated testing.

**No broken links, errors, or unexpected behavior** were observed across the other four tests. The site is functioning well overall.
