import { test, expect } from '@playwright/test';
import { waitForEmail, deleteTestEmail } from './utils/gmail-checker';

/**
 * Home Valuation flow E2E tests.
 *
 * Flow:
 *   Step 1 – Five core fields → submit → AI generates valuation
 *   Step 2 – Range card (+/-10%) + contact gate "See your exact estimate"
 *   Step 3 – Gate submit → exact figure, confidence, reasoning; Ken emailed
 *            (test leads are quarantined: no email, no conversion pixels)
 */

const TEST_CONTACT = {
  name: 'E2E Valuation Test',
  email: 'e2e-valuation@kenfinch.ca',
  phone: '(905) 555-0200',
};

const TEST_PROPERTY = {
  address: '1235 Lakeshore Road East, Oakville, ON',
  homeType: 'Detached',
  bedroomsAbove: '4',
  bathrooms: '3',
  squareFootage: '2,000 - 2,500', // label text in the select
};

const CONVERSION_HOSTS = /googleadservices\.com\/pagead\/conversion|google\.com\/pagead\/1p-conversion|facebook\.com\/tr|analytics\.tiktok\.com/i;

test.describe('Home Valuation Multi-Step Form', () => {
  test('valuation form is visible on the sell page with only the five core fields', async ({ page }) => {
    await page.goto('/sell');

    // The valuation tool lives on /sell (the homepage is buyer-centric)
    await expect(page.getByText(/home details|ai home valuat/i).first()).toBeVisible({ timeout: 15_000 });
    const form = page.getByTestId('valuation-form');
    await expect(form.getByPlaceholder(/123 Maple Street/i)).toBeVisible();
    await expect(form.locator('button[role="combobox"]')).toHaveCount(2); // home type, square footage
    await expect(form.getByRole('spinbutton')).toHaveCount(2); // bedrooms above grade, bathrooms
    await expect(form.getByPlaceholder(/nearby schools/i)).toHaveCount(0); // optional details come after the estimate
  });

  test('full valuation flow: core details → range → gate → exact estimate (no conversion pixels for a test lead)', async ({ page }) => {
    test.setTimeout(180_000); // 3 minutes — AI valuation can take time

    const skipEmailCheck = !process.env.GMAIL_CLIENT_ID;
    const pixelHits: string[] = [];
    page.on('request', (r) => {
      if (CONVERSION_HOSTS.test(r.url())) pixelHits.push(r.url());
    });

    await page.goto('/sell');

    // ── Step 1: five core fields ───────────────────────────────────
    const form = page.getByTestId('valuation-form');
    await expect(form).toBeVisible({ timeout: 30_000 }); // waits for Google Maps

    const addressInput = form.getByPlaceholder(/123 Maple Street/i);
    await addressInput.fill(TEST_PROPERTY.address);
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); // dismiss any autocomplete suggestions

    const comboboxes = form.locator('button[role="combobox"]');
    await comboboxes.nth(0).click(); // Home Type
    await page.getByRole('option', { name: TEST_PROPERTY.homeType, exact: true }).click();

    await form.getByRole('spinbutton', { name: /bedrooms.*above/i }).fill(TEST_PROPERTY.bedroomsAbove);
    await form.getByRole('spinbutton', { name: /bathrooms/i }).fill(TEST_PROPERTY.bathrooms);

    await comboboxes.nth(1).click(); // Square Footage
    await page.getByRole('option', { name: new RegExp(TEST_PROPERTY.squareFootage) }).click();

    await form.getByRole('button', { name: /generate.*valuation/i }).click();

    // ── Step 2: range card + gate ─────────────────────────────────
    const range = page.getByTestId('valuation-range');
    await expect(range).toBeVisible({ timeout: 120_000 });
    await expect(range).toContainText(/\$[\d,]+\s*–\s*\$[\d,]+/);
    await expect(page.getByText('See your exact estimate')).toBeVisible();
    // Nothing exact leaks before the gate.
    await expect(page.getByTestId('valuation-exact')).toHaveCount(0);
    await expect(page.getByText('Valuation Reasoning')).toHaveCount(0);

    const beforeSubmit = new Date();
    await page.getByTestId('valuation-gate-name').fill(TEST_CONTACT.name);
    await page.getByTestId('valuation-gate-email').fill(TEST_CONTACT.email);
    await page.getByTestId('valuation-gate-phone').fill(TEST_CONTACT.phone);
    await page.getByTestId('valuation-gate-submit').click();

    // ── Step 3: exact estimate revealed ───────────────────────────
    const exact = page.getByTestId('valuation-exact');
    await expect(exact).toBeVisible({ timeout: 30_000 });
    await expect(exact).toContainText(/\$[\d,]+/);
    await expect(page.getByRole('heading', { name: 'Confidence Score' })).toBeVisible();
    await expect(page.getByText('Valuation Reasoning')).toBeVisible();
    await expect(page.getByTestId('valuation-expert')).toContainText(/Ken has your request/i);
    await expect(page.getByTestId('valuation-improve-toggle')).toBeVisible();

    // Test leads are quarantined (track=false): no Ads conversion, no Meta Lead, no TikTok event.
    await page.waitForTimeout(1500);
    expect(pixelHits, 'conversion pixels must not fire for a quarantined test lead').toEqual([]);

    // ── Step 4: Verify email delivery (gated subject) ─────────────
    if (!skipEmailCheck) {
      const emailResult = await waitForEmail('Valuation lead (gated estimate)', beforeSubmit);
      expect(emailResult.found, 'Valuation gate email was not received by Ken — leads are being LOST').toBe(true);
      if (emailResult.messageId) await deleteTestEmail(emailResult.messageId);
    }
  });
});
