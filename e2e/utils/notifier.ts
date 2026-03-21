/**
 * Multi-channel failure notification system.
 *
 * Sends alerts via email (SendGrid), SMS, and WhatsApp (Twilio)
 * when E2E tests fail.
 *
 * Required env vars:
 *   SENDGRID_API_KEY           – for email alerts
 *   ALERT_EMAIL_TO             – recipient email (e.g. geoff.radian6@gmail.com)
 *   ALERT_EMAIL_FROM           – sender email (e.g. alerts@kenfinch.ca)
 *   TWILIO_ACCOUNT_SID         – Twilio account
 *   TWILIO_AUTH_TOKEN           – Twilio auth
 *   TWILIO_PHONE_FROM          – Twilio phone number (for SMS)
 *   TWILIO_WHATSAPP_FROM       – Twilio WhatsApp sender (e.g. whatsapp:+14155238886)
 *   ALERT_PHONE_TO             – recipient phone (e.g. +1234567890)
 */

import sgMail from '@sendgrid/mail';

interface TestFailure {
  testName: string;
  error: string;
  timestamp: string;
  runUrl?: string; // GitHub Actions run URL
}

/**
 * Send an HTML email alert via SendGrid.
 */
async function sendEmailAlert(failures: TestFailure[]): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;
  const from = process.env.ALERT_EMAIL_FROM || 'alerts@kenfinch.ca';

  if (!apiKey || !to) {
    console.warn('Email alert skipped: SENDGRID_API_KEY or ALERT_EMAIL_TO not set');
    return;
  }

  sgMail.setApiKey(apiKey);

  const failureRows = failures
    .map(
      (f) =>
        `<tr>
          <td style="padding:8px;border:1px solid #ddd;">${f.testName}</td>
          <td style="padding:8px;border:1px solid #ddd;color:#dc2626;">${f.error}</td>
          <td style="padding:8px;border:1px solid #ddd;">${f.timestamp}</td>
        </tr>`,
    )
    .join('');

  const runLink = failures[0]?.runUrl
    ? `<p><a href="${failures[0].runUrl}">View full run in GitHub Actions</a></p>`
    : '';

  await sgMail.send({
    to,
    from,
    subject: `[KenFinch.ca] E2E Test FAILURE - ${failures.length} test(s) failed`,
    html: `
      <h2 style="color:#dc2626;">KenFinch.ca Automated Test Failure</h2>
      <p>The scheduled E2E tests detected <strong>${failures.length} failure(s)</strong>.</p>
      <p>This means Ken's lead generation forms or website may not be working correctly.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Test</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Error</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Time</th>
          </tr>
        </thead>
        <tbody>${failureRows}</tbody>
      </table>
      ${runLink}
      <p style="color:#6b7280;font-size:12px;">Automated alert from KenFinch.ca E2E test suite</p>
    `,
  });

  console.log(`Email alert sent to ${to}`);
}

/**
 * Send SMS and/or WhatsApp via Twilio.
 */
async function sendTwilioAlert(
  failures: TestFailure[],
  channel: 'sms' | 'whatsapp',
): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneTo = process.env.ALERT_PHONE_TO;

  if (!accountSid || !authToken || !phoneTo) {
    console.warn(`${channel} alert skipped: Twilio credentials or ALERT_PHONE_TO not set`);
    return;
  }

  // Dynamic import to avoid requiring twilio when not configured
  const twilio = (await import('twilio')).default;
  const client = twilio(accountSid, authToken);

  const fromNumber =
    channel === 'whatsapp'
      ? process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'
      : process.env.TWILIO_PHONE_FROM;

  if (!fromNumber) {
    console.warn(`${channel} alert skipped: no "from" number configured`);
    return;
  }

  const to = channel === 'whatsapp' ? `whatsapp:${phoneTo}` : phoneTo;

  const failureSummary = failures
    .map((f) => `- ${f.testName}: ${f.error.slice(0, 80)}`)
    .join('\n');

  const body = `[KenFinch.ca ALERT]\n${failures.length} E2E test(s) FAILED.\n\n${failureSummary}\n\nCheck GitHub Actions for details.`;

  await client.messages.create({ body, from: fromNumber, to });
  console.log(`${channel} alert sent to ${phoneTo}`);
}

/**
 * Main entry point: send failure alerts on all configured channels.
 */
export async function sendFailureAlerts(failures: TestFailure[]): Promise<void> {
  if (failures.length === 0) return;

  const results = await Promise.allSettled([
    sendEmailAlert(failures),
    sendTwilioAlert(failures, 'sms'),
    sendTwilioAlert(failures, 'whatsapp'),
  ]);

  results.forEach((r, i) => {
    const channels = ['email', 'sms', 'whatsapp'];
    if (r.status === 'rejected') {
      console.error(`Failed to send ${channels[i]} alert:`, r.reason);
    }
  });
}

/**
 * Parse the Playwright JSON results file and extract failures.
 */
export function parsePlaywrightResults(
  resultsJson: any,
  runUrl?: string,
): TestFailure[] {
  const failures: TestFailure[] = [];

  for (const suite of resultsJson.suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          if (result.status === 'failed' || result.status === 'timedOut') {
            failures.push({
              testName: `${suite.title} > ${spec.title}`,
              error: result.error?.message?.slice(0, 200) || 'Unknown error',
              timestamp: new Date().toISOString(),
              runUrl,
            });
          }
        }
      }
    }
  }

  return failures;
}
