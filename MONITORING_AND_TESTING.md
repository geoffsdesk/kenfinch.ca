
# KenFinch.ca: Website Monitoring & Testing Guide

This document provides a comprehensive guide for monitoring the health, functionality, and performance of the KenFinch.ca website. Following these checklists and schedules will help ensure the site is always working correctly and growing its authority as the #1 resource for home sellers in Oakville, Ontario.

## 1. Manual Testing Checklists

Run these manual checks weekly, and always after making significant changes to the website.

---

### ✅ Checklist 1: AI Home Valuation (Anonymous User)

**Goal:** Ensure the primary lead generation tool is working for new visitors.

1.  **Open in a private/incognito browser window.**
2.  Navigate to the homepage (`/`).
3.  Scroll down to the **"AI Home Valuator"** section.
4.  Fill out the form with valid property details for an Oakville address.
5.  Click **"Generate My Home Valuation"**.
    *   **Expected Result:** The loading spinner appears, followed by the valuation result page with a dollar value, confidence score, and reasoning.
6.  On the results page, fill out the **"Ready for an Expert Opinion?"** contact form.
    *   **Expected Result:** A "Thank You!" success message appears, and you (as the admin) receive a notification email.
7.  Verify the new lead appears in the **Admin Dashboard** under the "Contacts" tab.

---

### ✅ Checklist 2: Seller Signup & Onboarding

**Goal:** Ensure new sellers can create an account and access their dashboard.

1.  **Open in a private/incognito browser window.**
2.  Navigate to the Seller Login page (`/seller/login`).
3.  Click the **"Sign up"** link.
4.  Create a new account using an email address that does not already exist in the system.
    *   **Expected Result:** After successful signup, you are automatically redirected to the `/seller/dashboard`.
5.  Check the Seller Dashboard.
    *   **Expected Result:** The welcome message appears, and the "Pre-Listing Prep Tracker" is visible with all tasks unchecked.
6.  Log out using the button in the header or sidebar.
    *   **Expected Result:** You are redirected to the Seller Login page.
7.  Log back in with the credentials you just created.
    *   **Expected Result:** You are successfully logged in and see the Seller Dashboard.
8.  Go to the **Admin Dashboard** (`/admin/dashboard`) and verify the new user appears in the "Sellers" tab.

---

### ✅ Checklist 3: Admin Login & Access Control

**Goal:** Ensure the admin area is secure and functional.

1.  **Open in a private/incognito browser window.**
2.  Navigate directly to `/admin/dashboard`.
    *   **Expected Result:** You are redirected to the admin login page (`/admin/login`).
3.  Log in with your administrator account credentials.
    *   **Expected Result:** You are granted access and can see the Admin Dashboard with tabs for "Contacts," "Sellers," and "Chat Logs."
4.  Log out.
5.  Log in using a regular **seller** account.
    *   **Expected Result:** You are successfully logged in but are redirected to the **seller dashboard** (`/seller/dashboard`), NOT the admin dashboard.

---

## 2. Automated Testing Agent Prompt

Use this prompt with an AI agent like Project Mariner to automate the testing of critical flows.

**Prompt:**

```
You are an expert QA tester for a real estate website built on Next.js, Firebase, and Genkit. Your task is to perform a series of critical user flow tests for the website at https://www.kenfinch.ca.

Follow these steps precisely and report on the success or failure of each one.

**Test Flow 1: New Seller Signup and Login**
1. Navigate to https://www.kenfinch.ca/seller/login.
2. Click the "Sign up" link to go to the signup page.
3. Generate a unique, random email address for testing.
4. Fill out the signup form with the random email and a secure password (e.g., "TestPass123!").
5. Submit the form.
6. **ASSERT:** You are redirected to the `/seller/dashboard` page.
7. **ASSERT:** The dashboard contains a "Welcome" message and a "Pre-Listing Prep Tracker".
8. Find and click the "Logout" button.
9. **ASSERT:** You are redirected to the `/seller/login` page.
10. Log in using the same credentials.
11. **ASSERT:** You are successfully logged in and redirected back to the `/seller/dashboard`.

**Test Flow 2: AI Home Valuation and Lead Capture**
1. Navigate to the homepage at https://www.kenfinch.ca.
2. Scroll to the "AI Home Valuator" form (it has the ID `valuation-tool`).
3. Fill out the form fields with the following realistic data for a property in Oakville, Ontario:
    - Address: "1235 Lakeshore Road East, Oakville, ON"
    - Home Type: "Detached"
    - Bedrooms (Above Grade): 4
    - Bedrooms (Below Grade): 1
    - Bathrooms: 3
    - Square Footage: "2,000 - 2,500 sq ft"
    - Age of Home: "16-30 years"
    - Renovated: Checked
    - Finished Basement: "Yes"
    - Garage Spaces: 2
    - Total Parking: 4
    - Nearby Schools: "Oakville Trafalgar High School, Maple Grove Public School"
4. Submit the form.
5. **ASSERT:** A results page is displayed showing a dollar value, a confidence score, and reasoning text.
6. On the results page, find the contact form for an "Expert Opinion".
7. Fill it out with the name "Automated Test" and a test email address.
8. Submit the form.
9. **ASSERT:** A success message (e.g., "Thank You!") is displayed on the page.

Report on the outcome of each ASSERT statement (PASS/FAIL) and provide details for any failures.
```

---

## 3. SEO & AI Indexing Monitoring Schedule

Your goal is to become the #1 resource for home sellers in Oakville. This requires consistent monitoring and content creation.

### 📅 Weekly Tasks (15-20 minutes)

*   **Check Google Search Console:**
    *   Log in to [Google Search Console](https://search.google.com/search-console).
    *   **Performance Report:** Look at the total clicks and impressions. Are they trending up or down? What queries are bringing users to your site? Note any new, relevant queries (e.g., "best realtor oakville").
    *   **Indexing Report:** Check for any errors under the "Pages" section. If there are errors, investigate the cause. Ensure the number of indexed pages is stable or growing.
    *   **URL Inspection:** Test your homepage and one other key page (like `/contact`) to ensure Google sees it correctly.

### 📅 Bi-Weekly Tasks (30 minutes)

*   **Review Keyword Rankings:**
    *   Use Google Search Console or a third-party tool to check your ranking for core keywords:
        *   `sell home oakville`
        *   `oakville real estate agent`
        *   `home valuation oakville`
        *   `ken finch realtor`
    *   Are your rankings improving, holding steady, or declining?
*   **Incognito Google Search:**
    *   Open a private/incognito browser window.
    *   Search for "Ken Finch real estate" and "sell home in Oakville".
    *   **Observe your search snippet.** Does the title and description look compelling? Is the favicon correct? Are any rich results (like star ratings, if applicable later) showing up?
*   **Ask an AI Model:**
    *   Go to Gemini (or another LLM) and ask a question like: **"Who is a top real estate agent for selling a home in Oakville, Ontario?"** or **"How can I estimate the value of my home in Oakville?"**
    *   Note whether your website or Ken Finch is mentioned. The goal is to see this improve over time as your site gains authority.

### 📅 Monthly Tasks (1-2 hours)

*   **Content & Performance Review:**
    *   **Analyze User Behavior:** Look at the data in your Admin Dashboard. How many new contacts and registered sellers did you get this month? This is a direct measure of your website's success.
    *   **Content Planning:** Based on the search queries you're seeing in Search Console, what are people asking? This is a goldmine for new content ideas. Could you write a blog post on "Understanding the Oakville Property Tax System" or "Top 5 Renovations to Increase Home Value in Oakville"?
    *   **Review Testimonials:** Do you have new client success stories you can add to the homepage to build more trust and social proof?

By consistently following this guide, you will maintain a high-quality website and steadily build the topical authority needed to achieve your goal.
