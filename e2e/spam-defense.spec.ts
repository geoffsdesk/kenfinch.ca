import { test, expect } from '@playwright/test';

/**
 * Lead spam defence is silent: a flagged submission sees the identical success
 * UI. These tests check that silence and that the honeypot is wired into each
 * form without being reachable by a person.
 */

const TEST_NAME = 'E2E Spam Defense (ignore)';
const TEST_EMAIL = 'e2e-spam@kenfinch.ca';
const TEST_PHONE = '(905) 555-0199';

test.describe('Spam defence', () => {
  test('filling the honeypot still shows the normal success toast', async ({ page }) => {
    await page.goto('/contact');
    await page.getByPlaceholder('John Doe').fill(TEST_NAME);
    await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('(123) 456-7890').fill(TEST_PHONE);
    await page.locator('input[name="referral_code"]').fill('http://spam.example', { force: true });
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText('Message Sent!', { exact: true })).toBeVisible({ timeout: 30_000 });
  });

  test('a submit within a second of load never surfaces an error', async ({ page }) => {
    await page.goto('/contact');
    await page.getByPlaceholder('John Doe').fill(TEST_NAME);
    await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('(123) 456-7890').fill(TEST_PHONE);
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText('Message Sent!', { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Submission Failed')).toHaveCount(0);
  });

  for (const path of ['/renewal', '/mortgage']) {
    test(`${path} renders exactly one off-screen honeypot`, async ({ page }) => {
      await page.goto(path);
      const hp = page.locator('input[name="referral_code"]');
      await expect(hp).toHaveCount(1);
      await expect(hp).toHaveAttribute('tabindex', '-1');
      await expect(hp).toHaveAttribute('autocomplete', 'off');
      // Parked 10,000px off the left edge: present in the DOM, never in the viewport.
      await expect(hp).not.toBeInViewport();
      const box = await hp.boundingBox();
      expect(box, 'honeypot has a box').not.toBeNull();
      expect(box!.x + box!.width).toBeLessThan(0);
    });
  }

  test('/sell has no honeypot until the valuation stage-2 form mounts', async ({ page }) => {
    await page.goto('/sell');
    await expect(page.getByText(/home details|ai home valuat/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('input[name="referral_code"]')).toHaveCount(0);
  });
});
