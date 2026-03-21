/**
 * Gmail API email delivery verification.
 *
 * Uses a Google Cloud service account (or OAuth2 refresh token) to check
 * Ken's inbox for emails sent by the test suite.  The checker polls for
 * up to `maxWaitMs` before giving up.
 *
 * Required env vars:
 *   GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 *   GMAIL_CHECK_EMAIL  – the inbox to search (e.g. realtor@kenfinch.ca)
 */

import { google } from 'googleapis';

interface GmailCheckerOptions {
  /** Gmail address to search */
  email?: string;
  /** Max time to wait for the email to arrive (ms) */
  maxWaitMs?: number;
  /** Polling interval (ms) */
  pollIntervalMs?: number;
}

interface EmailMatch {
  found: boolean;
  subject?: string;
  snippet?: string;
  receivedAt?: string;
  messageId?: string;
}

/**
 * Build an authenticated Gmail client using OAuth2 refresh-token flow.
 */
function getGmailClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );
  oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: 'v1', auth: oauth2 });
}

/**
 * Search Ken's inbox for an email matching `subjectQuery` that arrived
 * after `afterTimestamp`.  Retries until found or timeout.
 */
export async function waitForEmail(
  subjectQuery: string,
  afterTimestamp: Date,
  options: GmailCheckerOptions = {},
): Promise<EmailMatch> {
  const {
    email = process.env.GMAIL_CHECK_EMAIL || 'realtor@kenfinch.ca',
    maxWaitMs = 120_000, // 2 minutes
    pollIntervalMs = 10_000, // every 10 s
  } = options;

  const gmail = getGmailClient();
  const afterEpoch = Math.floor(afterTimestamp.getTime() / 1000);

  // Gmail search query: subject contains the query string, received after timestamp
  const q = `subject:(${subjectQuery}) after:${afterEpoch}`;

  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    try {
      const res = await gmail.users.messages.list({
        userId: email,
        q,
        maxResults: 5,
      });

      if (res.data.messages && res.data.messages.length > 0) {
        const msgId = res.data.messages[0].id!;
        const msg = await gmail.users.messages.get({
          userId: email,
          id: msgId,
          format: 'metadata',
          metadataHeaders: ['Subject', 'Date'],
        });

        const headers = msg.data.payload?.headers || [];
        const subject = headers.find((h) => h.name === 'Subject')?.value;
        const date = headers.find((h) => h.name === 'Date')?.value;

        return {
          found: true,
          subject: subject || '',
          snippet: msg.data.snippet || '',
          receivedAt: date || '',
          messageId: msgId,
        };
      }
    } catch (err) {
      console.warn(`Gmail poll error (will retry): ${(err as Error).message}`);
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  return { found: false };
}

/**
 * Delete a test email by message ID to keep the inbox clean.
 */
export async function deleteTestEmail(
  messageId: string,
  email?: string,
): Promise<void> {
  const gmail = getGmailClient();
  const userId = email || process.env.GMAIL_CHECK_EMAIL || 'realtor@kenfinch.ca';

  try {
    await gmail.users.messages.trash({ userId, id: messageId });
    console.log(`Trashed test email ${messageId}`);
  } catch (err) {
    console.warn(`Could not trash email ${messageId}: ${(err as Error).message}`);
  }
}
