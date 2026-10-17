import { test, expect } from '@playwright/test';

/**
 * Ken's Never List capture on /sell (lead magnet). Stores a `popup` lead with
 * asset `seller-never-list`. Uses an E2E address so the pipeline quarantines it
 * and sends nothing.
 */

test.describe('Never List capture', () => {
  test('/sell shows the seven-item list and the capture form', async ({ page }) => {
    await page.goto('/sell');
    const list = page.locator('#never-list ol li');
    await expect(list).toHaveCount(7);
    await expect(list.first()).toContainText(/overprice/i);
    await expect(page.getByTestId('never-list-email')).toBeVisible();
    await expect(page.getByTestId('never-list-submit')).toBeVisible();
  });

  test('rejects an invalid email without submitting', async ({ page }) => {
    await page.goto('/sell');
    await page.getByTestId('never-list-email').fill('not-an-email');
    await page.getByTestId('never-list-submit').click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
    await expect(page.getByTestId('never-list-success')).toHaveCount(0);
  });

  test('submits the seller list request and shows the success copy', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/sell');
    await page.getByTestId('never-list-name').fill('E2E NeverList (ignore)');
    await page.getByTestId('never-list-email').fill('e2e-neverlist@kenfinch.ca');
    await page.getByTestId('never-list-submit').click();

    const success = page.getByTestId('never-list-success');
    await expect(success).toBeVisible({ timeout: 30_000 });
    await expect(success).toContainText(/check your inbox/i);
    await expect(success).toContainText(/on its way/i);
    // The WhatsApp alternative stays available after success.
    await expect(success.getByRole('link', { name: /message ken/i })).toHaveAttribute('href', /wa\.me/);
  });
});
