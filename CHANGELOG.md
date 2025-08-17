
# Project Changelog

This document tracks the recent changes and architectural decisions made for the Oakville Home Seller Success platform.

## Recent Updates (July 2024)

This series of updates focused on refining the user experience, enhancing AI capabilities, adding core features, and setting up production infrastructure.

### 1. Branding and UI Updates

*   **Favicon Updated**: The website's favicon was changed to use `kf_favicon.ico`. This change was made in `src/app/layout.tsx` to ensure brand consistency across browser tabs.
*   **Logo Removal from Header**: The image-based logo was removed from the main navigation bar in `src/components/header.tsx`. The site now uses the text "KenFinch.ca" as the primary branding in the header, simplifying the design.

### 2. AI Home Evaluator Enhancements

Several critical adjustments were made to the AI Home Valuation tool to improve its accuracy and relevance for the target market.

*   **Currency and Valuation Tuning**: The core prompt in `src/ai/flows/home-valuation.ts` was updated to explicitly instruct the AI to provide valuations in **Canadian Dollars (CAD)**. The prompt was also refined to encourage more conservative and realistic pricing, better reflecting the Oakville, Ontario real estate market.
*   **Out-of-Area Warning**: A conditional warning was added to the valuation logic. If a user provides an address outside of Oakville, the AI-generated `reasoning` now includes a disclaimer stating that the tool is optimized for the Oakville market and results for other areas may be less accurate.
*   **Automated School Lookup**: The valuation form was enhanced to use the Google Places API to automatically find and populate nearby schools when a user selects an address, improving user experience.

### 3. Seller Dashboard & Experience

Major improvements were made to the seller dashboard to make it more interactive, useful, and centralized.

*   **Valuation Review & Update**: Sellers can now view the detailed inputs and reasoning for their latest AI valuation directly from their dashboard. A dialog provides a comprehensive summary and a link to generate a new valuation.
*   **Integrated AI Chatbot**: The AI Seller Assistant was moved from a separate tab directly onto the main dashboard page for easier access and a more integrated experience.
*   **Expanded Prep Checklist**: The "Pre-Listing Prep Tracker" was updated with a more comprehensive list of tasks for sellers to follow.
*   **Bug Fixes**:
    *   Resolved a critical Firestore bug (`No document to update`) that occurred when new checklist items were added. The fix ensures that all tasks are correctly initialized for both new and existing users.

### 4. Admin Dashboard & Features

The administrator's dashboard was built out with several key features for client and lead management. The admin area is accessible via the `/login` page.

*   **Chatbot Interaction Logs**: A new page was added to the admin dashboard (`/dashboard/chat-logs`) that allows the administrator to review all conversations between sellers and the AI assistant. This is crucial for monitoring quality and understanding seller concerns. Logs are stored in Firestore with a timestamp to support a 30-day rolling history via a TTL policy.
*   **Contact Lead Management**: An interface at `/dashboard/contacts` to view all submissions from the main website contact form.
*   **Registered Seller Overview**: A page at `/dashboard/sellers` that lists all registered users and provides a way to view their latest AI home valuation details.

### 5. Seller Chatbot Assistant

A major new feature was added to the seller dashboard: an AI-powered assistant to guide users through the home preparation process.

*   **New Genkit Flow**: A dedicated chatbot flow was created in `src/ai/flows/chatbot-flow.ts`. It uses a predefined checklist to coach sellers, answer questions, and track their progress.
*   **Chat Interface**: A new page was built at `src/app/dashboard/chat/page.tsx` featuring a clean, responsive interface for users to interact with the AI assistant. This was later integrated directly into the main dashboard page.
*   **Dashboard Navigation**: A "Chat" link was added to the main dashboard navigation in `src/app/dashboard/layout.tsx` for easy access, and later removed when the chat was integrated into the main dashboard.
*   **Bug Fixes**:
    *   Resolved a Handlebars templating error (`unknown helper eq`) by pre-processing message history.
    *   Integrated the `react-markdown` library to correctly render formatted text (lists, bolding) in the chat window, fixing an issue where raw Markdown was being displayed.
    *   Corrected multiple syntax and state management errors that arose during implementation.

### 6. Seller Authentication and Onboarding

The login and account creation process for sellers was completed.

*   **Seller Login Page**: A dedicated login page was created at `src/app/seller-login/page.tsx` for returning sellers.
*   **Header Link**: A "Seller Login" link was added to the main website header (`src/components/header.tsx`) to improve accessibility for clients.

### 7. Document Management for Sellers

The "Document Hub" in the seller dashboard was enhanced to allow for client-side uploads.

*   **File Upload Functionality**: The page at `src/app/dashboard/documents/page.tsx` was updated with a new UI for file selection and uploading.
*   **Firebase Storage Integration**: The system now uses Firebase Storage to handle file uploads securely.
*   **Real-time Updates & Bug Fixes**: The document list now updates in real-time after a successful upload using Firestore's `onSnapshot` listener. Several bugs related to the upload state getting "stuck" and the list not refreshing were identified and resolved by ensuring the component state was correctly reset after an upload.

### 8. Email Notifications via SendGrid

To ensure timely communication, an email notification system was implemented using the SendGrid API.

*   **Email Sending Flow**: A robust, reusable Genkit flow was created in `src/ai/flows/send-email-flow.ts` to handle the transactional sending of emails.
*   **Contact Form Integration**: The main contact form (`src/components/contact-form.tsx`) was updated to call this flow, ensuring that every new submission sends a notification email to the administrator.
*   **Valuation Lead Integration**: The AI Home Valuation component (`src/components/home-valuation.tsx`) also leverages the email flow to send the administrator a detailed summary of the user's inputs and the AI's valuation results when a user requests an expert opinion.

### 9. Infrastructure and Deployment

Key operational tasks were completed to prepare the application for a production environment.

*   **Custom Domain**: The application was connected to its custom domain, making it publicly accessible.
*   **GitHub Integration**: The project was linked to a GitHub repository to enable version control and continuous integration workflows.
