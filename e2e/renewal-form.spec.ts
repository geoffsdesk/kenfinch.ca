import { test, expect } from '@playwright/test';

/**
 * Mortgage renewal check form (/renewal), the landing page for the database
 * reactivation emails. Submits as a `contact` lead with intent "Mortgage renewal".
 * Uses an E2E name so the pipeline quarantines it and sends no notifications.
 */

test.describe('Renewal Form', () => {
  test('page renders with the form and disclosure', async ({ page }) => {
    await page.goto('/renewal');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/mortgage renew/i);
    await expect(page.getByTestId('renewal-form')).toBeVisible();
    await expect(page.getByText(/FSRA/i).first()).toBeVisible();
  });

  test('validates before submitting', async ({ page }) => {
    await page.goto('/renewal');
    const form = page.getByTestId('renewal-form');
    await form.getByRole('button', { name: /renewal calendar/i }).click();
    await expect(form.getByText(/pick a month/i).first()).toBeVisible();
    await expect(form.getByText(/enter your name/i)).toBeVisible();
  });

  test('submits and shows the success state', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/renewal?c=0123456789abcdef0123456789abcdef');
    const form = page.getByTestId('renewal-form');

    await form.getByTestId('renewal-month').click();
    await page.getByRole('option', { name: /not sure/i }).click();
    await form.getByPlaceholder(/TD, RBC/i).fill('E2E Bank');
    await form.getByPlaceholder('Jane Smith').fill('E2E RenewalTest (ignore)');
    await form.getByPlaceholder('you@example.com').fill('e2e-renewal@kenfinch.ca');
    await form.getByPlaceholder('(416) 555-0123').fill('(905) 555-0400');
    await form.getByRole('button', { name: /renewal calendar/i }).click();

    const success = page.getByTestId('renewal-success');
    await expect(success).toBeVisible({ timeout: 30_000 });
    await expect(success).toContainText(/Not sure/i);
    await expect(success.getByRole('link', { name: /mortgage side/i })).toHaveAttribute('href', '/mortgage');
  });
});
