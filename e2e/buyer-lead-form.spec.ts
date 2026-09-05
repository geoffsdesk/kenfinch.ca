import { test, expect } from '@playwright/test';
import { waitForEmail, deleteTestEmail } from './utils/gmail-checker';

/**
 * Buyer / mortgage pre-approval multi-step form.
 *
 * Step 1 plans -> Step 2 finances -> Step 3 contact + consent -> success
 * screen with the Express Mortgage (Finmo) hand-off link carrying externalId.
 */

const TEST = {
  firstName: 'E2E',
  lastName: 'BuyerTest',
  email: 'e2e-buyer@kenfinch.ca',
  phone: '(905) 555-0300',
};

test.describe('Buyer Pre-Approval Form', () => {
  test('renders step 1 and validates before advancing', async ({ page }) => {
    await page.goto('/mortgage');
    const form = page.getByTestId('buyer-lead-form');
    await expect(form).toBeVisible();
    await expect(form.getByText('Step 1 of 3')).toBeVisible();

    await form.getByRole('button', { name: /continue/i }).click();
    await expect(form.getByText(/closest to your plans/i)).toBeVisible();
    await expect(form.getByText('Step 1 of 3')).toBeVisible();
  });

  test('full flow submits and offers the Express Mortgage hand-off', async ({ page }) => {
    test.setTimeout(120_000);
    const skipEmailCheck = !process.env.GMAIL_CLIENT_ID;
    const beforeSubmit = new Date();

    await page.goto('/mortgage');
    const form = page.getByTestId('buyer-lead-form');

    // Step 1
    await form.getByRole('radio', { name: 'Buying my first home' }).click();
    await form.getByRole('radio', { name: 'Within 3 months' }).click();
    await form.getByRole('radio', { name: '$750K to $1M' }).click();
    await form.getByRole('radio', { name: 'Yes, first home' }).click();
    await form.getByRole('button', { name: /continue/i }).click();
    await expect(form.getByText('Step 2 of 3')).toBeVisible();

    // Step 2
    await form.getByRole('radio', { name: '10% to 20%' }).click();
    await form.getByRole('button', { name: /continue/i }).click();
    await expect(form.getByText('Step 3 of 3')).toBeVisible();

    // Step 3
    await form.getByPlaceholder('Jordan').fill(TEST.firstName);
    await form.getByPlaceholder('Lee').fill(TEST.lastName);
    await form.getByPlaceholder('you@example.com').fill(TEST.email);
    await form.getByPlaceholder('(416) 555-0123').fill(TEST.phone);
    await form.getByRole('checkbox').click();
    await form.getByRole('button', { name: /get my pre-approval plan/i }).click();

    const success = page.getByTestId('buyer-lead-success');
    await expect(success).toBeVisible({ timeout: 30_000 });

    const handoff = success.getByRole('link', { name: /continue to secure application/i });
    await expect(handoff).toBeVisible();
    const href = await handoff.getAttribute('href');
    expect(href).toContain('cemi.mtg-app.com/signup');
    expect(href).toContain('brokerId=05293159-120d-4019-aa51-5ca60e1acc65');
    expect(href).toContain('externalId=');

    if (!skipEmailCheck) {
      const emailResult = await waitForEmail(`New Buyer Lead: ${TEST.firstName} ${TEST.lastName}`, beforeSubmit);
      expect(emailResult.found, 'Buyer lead email was not received by Ken').toBe(true);
      if (emailResult.messageId) await deleteTestEmail(emailResult.messageId);
    }
  });
});
