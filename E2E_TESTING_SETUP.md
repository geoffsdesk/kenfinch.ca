# KenFinch.ca — Automated E2E Testing Setup

Automated Playwright tests run **Mon / Wed / Fri at 9:00 AM ET** via GitHub Actions, testing the live site at kenfinch.ca. If anything fails, you get alerts via email, SMS, and WhatsApp.

## What's Tested

| Test Suite | What it checks |
|---|---|
| **Site Health** | Homepage, contact page, blog, seller login all load; SSL valid; SEO meta tags present; no critical console errors |
| **Contact Form** | Form renders, validates required fields, submits successfully, and the email arrives in Ken's inbox |
| **Home Valuation** | Full multi-step flow: property details → AI valuation results (dollar value, confidence, reasoning) → expert opinion contact form → email delivery to Ken |

## Quick Start (Local)

```bash
# 1. Install dependencies (includes Playwright)
npm install

# 2. Install Playwright browsers
npx playwright install --with-deps chromium

# 3. Copy the env template
cp .env.test.example .env.test
# Edit .env.test with your credentials

# 4. Run tests
npm run test:e2e            # headless
npm run test:e2e:headed     # see the browser
npm run test:e2e:ui         # interactive Playwright UI
```

## GitHub Actions Setup

### 1. Add Repository Secrets

Go to **Settings → Secrets and variables → Actions** in the GitHub repo and add:

#### Gmail API (email delivery verification)
| Secret | Description |
|---|---|
| `GMAIL_CLIENT_ID` | OAuth2 client ID from Google Cloud Console |
| `GMAIL_CLIENT_SECRET` | OAuth2 client secret |
| `GMAIL_REFRESH_TOKEN` | Refresh token from OAuth Playground |
| `GMAIL_CHECK_EMAIL` | Inbox to search (e.g. `realtor@kenfinch.ca`) |

#### Failure Alerts — Email
| Secret | Description |
|---|---|
| `SENDGRID_API_KEY` | Same key the site uses for sending emails |
| `ALERT_EMAIL_TO` | Where to send failure alerts (e.g. `geoff.radian6@gmail.com`) |
| `ALERT_EMAIL_FROM` | Sender address (e.g. `alerts@kenfinch.ca`) |

#### Failure Alerts — SMS & WhatsApp (Twilio)
| Secret | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_FROM` | Twilio phone number for SMS |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender (e.g. `whatsapp:+14155238886`) |
| `ALERT_PHONE_TO` | Your phone number (e.g. `+16135551234`) |

### 2. Getting Gmail API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Enable the **Gmail API**: APIs & Services → Library → search "Gmail API" → Enable
4. Create **OAuth 2.0 credentials**: APIs & Services → Credentials → Create Credentials → OAuth Client ID → Web Application
5. Add `https://developers.google.com/oauthplayground` as an authorized redirect URI
6. Go to [OAuth Playground](https://developers.google.com/oauthplayground):
   - Click the gear icon → check "Use your own OAuth credentials" → enter your client ID and secret
   - In Step 1, select `Gmail API v1` → `https://www.googleapis.com/auth/gmail.readonly` and `https://www.googleapis.com/auth/gmail.modify`
   - Authorize → Exchange authorization code for tokens → copy the **refresh token**

### 3. Setting Up Twilio

1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio) (free trial includes SMS)
2. Get your Account SID and Auth Token from the dashboard
3. Get a phone number for SMS
4. For WhatsApp, activate the [WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox) (free for testing)

### 4. Manual Trigger

You can run the tests anytime from the GitHub Actions tab → "E2E Tests — KenFinch.ca" → "Run workflow".

## File Structure

```
e2e/
├── site-health.spec.ts        # Basic site availability + SEO checks
├── contact-form.spec.ts       # Contact form validation + submission + email verify
├── home-valuation.spec.ts     # Full multi-step valuation flow + email verify
├── send-alerts.ts             # Post-test failure notification script
└── utils/
    ├── gmail-checker.ts       # Gmail API polling for email delivery verification
    └── notifier.ts            # Multi-channel alerts (email, SMS, WhatsApp)
.github/workflows/
└── e2e-tests.yml              # GitHub Actions cron: Mon/Wed/Fri 9AM ET
playwright.config.ts           # Playwright configuration
.env.test.example              # Environment variable template
```

## How Alerts Work

When tests fail, the workflow sends alerts on **all configured channels simultaneously**:

1. **Email** (SendGrid): detailed HTML report with test names, errors, and link to GitHub Actions run
2. **SMS** (Twilio): concise failure summary
3. **WhatsApp** (Twilio): same as SMS, sent to your WhatsApp number

Each channel is independent — if one isn't configured, the others still fire. If Twilio isn't set up yet, you'll still get email alerts.

## Adjusting the Schedule

Edit `.github/workflows/e2e-tests.yml` and change the cron expression:

```yaml
# Current: Mon/Wed/Fri at 9 AM ET (14:00 UTC)
- cron: "0 14 * * 1,3,5"

# Daily at 8 AM ET:
# - cron: "0 13 * * *"

# Weekdays at 7 AM ET:
# - cron: "0 12 * * 1-5"
```
