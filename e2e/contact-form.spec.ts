import { test, expect } from '@playwright/test';
import { waitForEmail, deleteTestEmail } from './utils/gmail-checker';

const TEST_NAME = 'E2E Automated Test';
const TEST_EMAIL = 'e2e-test@kenfinch.ca';
const TEST_PHONE = '(905) 555-0199';

test.describe('Contact Form', () => {
  test('form renders with all required fields', async ({ page }) => {
    await page.goto('/contact');

    // Check all form fields are present
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/phone/i)).toBeVisible();
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

    // Fill out the form
    await page.getByLabel(/full name/i).fill(TEST_NAME);
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/phone/i).fill(TEST_PHONE);

    // Submit
    await page.getByRole('button', { name: /send message/i }).click();

    // Wait for success toast
    await expect(
      page.getByText(/message sent|thank you/i),
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
