# KenFinch.ca: Buyer-First Real Estate & Mortgage Platform

KenFinch.ca is the website for Ken Finch, an Oakville, Ontario real estate broker (Royal LePage Signature Realty) who is also a licensed mortgage broker (Canadian Express-Mortgage Inc., FSRA #13241). As of September 2026 the site is buyer-centric: its job is to turn GTA home buyers into mortgage pre-approval leads that Ken works personally and hands into his Express Mortgage (Finmo) portal.

## Key Features

### For Home Buyers

*   **Two-minute pre-approval check:** A multi-step form (`BuyerLeadForm`) on the home page, `/buy`, `/mortgage`, every neighbourhood page and every buyer blog post. No credit check; captures plans, rough finances and contact details.
*   **Server-side lead pipeline:** The `submitBuyerLead` server action validates the lead, stores it in the `buyer_leads` Firestore collection via the Admin SDK, emails Ken via SendGrid, and fires GA4 / Meta / TikTok / Google Ads conversion events.
*   **Express Mortgage hand-off:** On success the buyer is offered a "Continue to secure application" button that opens Ken's Finmo signup URL with `brokerId`, `brokerName`, and `externalId=<Firestore lead id>` so Ken can match the application to the site lead. The URL is built in `src/lib/site.ts`.
*   **Buyer landing pages:** `/buy` (buyer representation) and `/mortgage` (pre-approval, 2026 rules, FAQ).
*   **Neighbourhood buyer guides:** Twelve Oakville neighbourhoods with price ranges, schools, commute, "best for", and Ken's buying tip.
*   **Buyer & mortgage guides:** Categorised blog (`buying`, `mortgage`, `market`, `selling`) with first-time buyer, pre-approval, closing cost and city-comparison guides.

### For Home Sellers

*   **Instant AI home valuation** at `/sell` (Gemini via Genkit) with an expert-opinion request that emails Ken.
*   **Seller's Guide PDF** gated behind email capture on seller pages.

### For Ken

*   **Analytics dashboard** at `/ken` (password protected): GA4 traffic, contact-form, valuation and mortgage-lead counts, and a merged recent-leads table.

## Compliance notes

Every mortgage-related page renders `MortgageDisclosure` (brokerage authorized name + FSRA licence number + Ken's approved title) per FSRA/MBLAA advertising rules. All licensing strings live in `src/lib/site.ts`; confirm the approved title there against the FSRA public registry before launch.

## Technology Stack

This project leverages a modern, robust tech stack for a high-performance, scalable, and feature-rich user experience:

*   **Framework:** [Next.js](https://nextjs.org/) with React & TypeScript (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) for a beautiful and consistent component library.
*   **Backend & Database:** [Firebase](https://firebase.google.com/) for Authentication and Firestore DB.
*   **Generative AI:** [Google's Gemini models](https://deepmind.google.com/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit) for the AI home valuation feature.
*   **Hosting:** Deployed on [Firebase App Hosting](https://firebase.google.com/docs/hosting).
