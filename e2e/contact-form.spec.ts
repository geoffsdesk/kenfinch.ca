import { test, expect } from '@playwright/test';
import { waitForEmail, deleteTestEmail } from './utils/gmail-checker';

const TEST_NAME = 'E2E Automated Test';
const TEST_EMAIL = 'e2e-test@kenfinch.ca';
const TEST_PHONE = '(905) 555-0199';

test.describe('Contact Form', () => {
  test('form renders with all required fields', async ({ page }) => {
    await page.goto('/contact');

    // Labels use ShadCN FormControl which doesn't properly associate for/id
    // when there's a wrapper div with an icon, so we match by placeholder
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('(123) 456-7890')).toBeVisible();
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();
  });

  test('form validates required fields', async ({ page }) => {
    await page.goto('/contact');

    // Submit empty form
    await page.getByRole('button', { name: /send message/i }).click();

    // Should show validation errors
    await expect(page.getByText(/please enter your name/i)).toBeVisible();
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
  });

  test('form submits successfully and email is delivered', async ({ page }) => {
    // Skip email verification if Gmail credentials aren't configured
    const skipEmailCheck = !process.env.GMAIL_CLIENT_ID;

    await page.goto('/contact');

    // Record timestamp before submission for email search
    const beforeSubmit = new Date();

    // Fill out the form using placeholder selectors
    await page.getByPlaceholder('John Doe').fill(TEST_NAME);
    await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('(123) 456-7890').fill(TEST_PHONE);

    // Submit
    await page.getByRole('button', { name: /send message/i }).click();

    // Wait for success toast — use exact match to avoid strict mode violation
    // (toast renders title, description, and aria-live span that all match loosely)
    await expect(
      page.getByText('Message Sent!', { exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    // Verify button is no longer in submitting state
    await expect(
      page.getByRole('button', { name: /send message/i }),
    ).toBeEnabled({ timeout: 10_000 });

    // Verify email delivery via Gmail API
    if (!skipEmailCheck) {
      const emailResult = await waitForEmail(
        `New Contact Form Submission from ${TEST_NAME}`,
        beforeSubmit,
      );

      expect(emailResult.found, 'Contact form email was not received by Ken').toBe(true);
      expect(emailResult.subject).toContain(TEST_NAME);

      // Clean up test email
      if (emailResult.messageId) {
        await deleteTestEmail(emailResult.messageId);
      }
    }
  });
});
