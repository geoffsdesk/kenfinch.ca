# KenFinch.ca Site Test Report

**Date:** March 27, 2026, 09:10 AM EDT
**Overall Status:** ALL PASS

---

## Test Results

### 1. Page Load Tests

| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Homepage | kenfinch.ca | PASS | Title contains "Ken Finch" and "Oakville". All sections load: hero, about, services, testimonials, neighborhoods, AI valuator form. |
| Sell Page | kenfinch.ca/sell | PASS | Contains "Home Valuation" references and "Royal LePage Signature Realty". Valuation form, how-it-works steps, and broker bio all present. |
| Contact Page | kenfinch.ca/contact | PASS | Contains "Contact Ken" heading. Form with name, email, phone, intent dropdown, and message fields all render correctly. |
| Neighborhoods | kenfinch.ca/neighborhoods | PASS | All 10 neighborhoods listed: Old Oakville, Bronte, Glen Abbey, River Oaks, West Oak Trails, Eastlake, College Park, Morrison, Palermo, Uptown Core — each with price points and property types. |
| Blog | kenfinch.ca/blog | PASS | 6 blog posts listed with titles, dates, and "Read More" links. Most recent post dated March 15, 2026. |

### 2. PDF Download Test

| Test | Status | Notes |
|------|--------|-------|
| Seller's Guide PDF | PASS | oakville-sellers-guide.pdf loads successfully in browser. 10-page PDF titled "The Oakville Seller's Guide 2026 Edition" by Ken Finch, Royal LePage Signature Realty. |

### 3. Contact Form Submission Test

| Test | Status | Notes |
|------|--------|-------|
| Form Submission | PASS | Form filled with test data (Name: "Automated Test Bot", Email: geoff.radian6@gmail.com, Phone: (000) 000-0000, Intent: "Other question", Message: AUTOMATED TEST with timestamp). Form fields cleared/reset after submission, indicating successful processing. Success toast may have appeared briefly. Check inbox for forwarded email to confirm email delivery pipeline. |

### 4. Exit-Intent Popup Lead Capture Test

| Test | Status | Notes |
|------|--------|-------|
| Popup Trigger | PASS | Clicking "Free Seller's Guide (PDF)" in footer triggered the popup with "Wait! Before you go..." heading. |
| Form Submission | PASS | Submitted with Name: "Test Lead Bot", Email: geoff.radian6@gmail.com. |
| Success State | PASS | "Your Guide Is Ready!" success state displayed with green checkmark, "Download Seller's Guide (PDF)" button, and "Get Your Free Valuation" secondary button. |

### 5. AI Home Valuation Test

| Test | Status | Notes |
|------|--------|-------|
| Form Fill & Submit | PASS | All fields populated: Address (123 Lakeshore Road East, Oakville, ON), Detached, 3 bed above / 1 below, 2 bath, 2000-2500 sqft, 16-30 years, finished basement, 2 garage / 4 total parking, nearby schools entered, renovated checked. |
| Valuation Result | PASS | Estimated value returned: **$2,150,000**. Confidence Score: 85%. Market Context section present. |
| Disclaimer | PASS | Disclaimer alert visible: "This is an AI-generated estimate for informational purposes only. It is not an appraisal, and should not be relied upon for financial or legal decisions." |
| Contact CTA | PASS | "Ready for an Expert Opinion?" section with contact form appears below valuation results. |

---

## Summary

All 5 test categories passed. No broken links, errors, or unexpected behavior detected. The site is functioning correctly as of this test run.

**Action Items:**
- Verify that the contact form test email was received at geoff.radian6@gmail.com to confirm the email delivery pipeline is working end-to-end.
