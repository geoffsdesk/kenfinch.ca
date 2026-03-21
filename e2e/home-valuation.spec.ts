import { test, expect } from '@playwright/test';
import { waitForEmail, deleteTestEmail } from './utils/gmail-checker';

/**
 * Home Valuation multi-step form E2E tests.
 *
 * Flow:
 *   Step 1 – Fill property details → submit → AI generates valuation
 *   Step 2 – View results (dollar value, confidence, reasoning)
 *   Step 3 – Fill "Expert Opinion" contact form → submit → email to Ken
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
  bedroomsBelow: '1',
  bathrooms: '3',
  squareFootage: '2,000 - 2,500', // label text in the select
  yearBuilt: '16-30 years', // label text
  finishedBasement: 'Yes', // label text
  garageSpaces: '2',
  parkingSpaces: '4',
  nearbySchools: 'Oakville Trafalgar High School, Maple Grove Public School',
};

test.describe('Home Valuation Multi-Step Form', () => {
  test('valuation form is visible on homepage', async ({ page }) => {
    await page.goto('/');

    // The valuation tool should be on the homepage
    await expect(
      page.getByText(/home details|ai home valuat/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('full valuation flow: property details → AI results → expert opinion request', async ({
    page,
  }) => {
    test.setTimeout(180_000); // 3 minutes — AI valuation can take time

    const skipEmailCheck = !process.env.GMAIL_CLIENT_ID;

    await page.goto('/');

    // ── Step 1: Fill property details ──────────────────────────────

    // Scroll to the valuation form
    const valuationSection = page.locator('#valuation-tool, [id*="valuation"]').first();
    if (await valuationSection.isVisible()) {
      await valuationSection.scrollIntoViewIfNeeded();
    } else {
      const formHeading = page.getByText(/home details/i).first();
      await formHeading.scrollIntoViewIfNeeded();
    }

    // Wait for Google Maps to load (address field becomes enabled)
    await page.waitForTimeout(3000);

    // Address — use placeholder selector
    const addressInput = page.getByPlaceholder(/123 Maple Street/i);
    await addressInput.fill(TEST_PROPERTY.address);
    await page.waitForTimeout(1000);
    // Dismiss any autocomplete suggestions
    await page.keyboard.press('Escape');

    // Home Type — the combobox trigger button shows current value
    // Find the Home Type trigger by its role and current text
    const homeTypeTrigger = page.locator('button[role="combobox"]').first();
    await homeTypeTrigger.click();
    await page.getByRole('option', { name: TEST_PROPERTY.homeType, exact: true }).click();

    // Bedrooms — use the accessible name from the label text
    // The number inputs have accessible names matching their label text
    const bedroomsAbove = page.getByRole('spinbutton', { name: /bedrooms.*above/i });
    await bedroomsAbove.fill(TEST_PROPERTY.bedroomsAbove);

    const bedroomsBelow = page.getByRole('spinbutton', { name: /bedrooms.*below/i });
    await bedroomsBelow.fill(TEST_PROPERTY.bedroomsBelow);

    // Bathrooms
    const bathrooms = page.getByRole('spinbutton', { name: /bathrooms/i });
    await bathrooms.fill(TEST_PROPERTY.bathrooms);

    // Square Footage — second combobox
    const allComboboxes = page.locator('button[role="combobox"]');
    const sqftTrigger = allComboboxes.nth(1); // Square Footage is the 2nd combobox
    await sqftTrigger.click();
    await page.getByRole('option', { name: new RegExp(TEST_PROPERTY.squareFootage) }).click();

    // Age of Home — third combobox
    const ageTrigger = allComboboxes.nth(2);
    await ageTrigger.click();
    await page.getByRole('option', { name: new RegExp(TEST_PROPERTY.yearBuilt) }).click();

    // Finished Basement — fourth combobox
    const basementTrigger = allComboboxes.nth(3);
    await basementTrigger.click();
    await page.getByRole('option', { name: TEST_PROPERTY.finishedBasement }).click();

    // Garage Spaces
    const garage = page.getByRole('spinbutton', { name: /garage/i });
    await garage.fill(TEST_PROPERTY.garageSpaces);

    // Total Parking
    const parking = page.getByRole('spinbutton', { name: /total parking/i });
    await parking.fill(TEST_PROPERTY.parkingSpaces);

    // Nearby Schools — textarea by placeholder
    const schools = page.getByPlaceholder(/nearby schools/i);
    await schools.fill(TEST_PROPERTY.nearbySchools);

    // Renovated checkbox — the checkbox role with its label
    const renovatedCheckbox = page.getByRole('checkbox', { name: /recently renovated/i });
    if (await renovatedCheckbox.isVisible()) {
      await renovatedCheckbox.check();
    }

    // Submit the valuation form
    await page.getByRole('button', { name: /generate.*valuation/i }).click();

    // ── Step 2: Verify AI valuation results ─────────────────────

    // Wait for the results page to appear (AI can take up to 2 minutes)
    await expect(
      page.getByText(/estimated value|your.*valuation/i).first(),
    ).toBeVisible({ timeout: 120_000 });

    // Verify key result elements — use specific selectors to avoid strict mode violations
    await expect(page.getByText(/\$[\d,]+/).first()).toBeVisible(); // Dollar amount
    await expect(page.getByRole('heading', { name: 'Confidence Score' })).toBeVisible();
    await expect(page.getByText('Valuation Reasoning')).toBeVisible();

    // ── Step 3: Expert Opinion contact form ─────────────────────

    await expect(
      page.getByText(/expert opinion/i).first(),
    ).toBeVisible();

    const beforeSubmit = new Date();

    // The expert opinion form uses the same placeholder pattern as the contact form
    // After valuation results, there's a new form with name/email/phone fields
    await page.getByPlaceholder('John Doe').fill(TEST_CONTACT.name);
    await page.getByPlaceholder('you@example.com').fill(TEST_CONTACT.email);
    await page.getByPlaceholder('(123) 456-7890').fill(TEST_CONTACT.phone);

    // Submit — use exact text to avoid matching the nav "Contact Ken" link
    await page
      .getByRole('button', { name: 'Contact Ken Finch for an Expert Opinion' })
      .click();

    // Verify success — use exact match to avoid multiple toast element matches
    await expect(
      page.getByText('Thank You!', { exact: true }).first(),
    ).toBeVisible({ timeout: 30_000 });

    // ── Step 4: Verify email delivery ───────────────────────────

    if (!skipEmailCheck) {
      const emailResult = await waitForEmail(
        `Expert Opinion Request for`,
        beforeSubmit,
      );

      expect(
        emailResult.found,
        'Expert opinion request email was not received by Ken — leads are being LOST',
      ).toBe(true);

      expect(emailResult.subject).toContain('Expert Opinion Request');

      if (emailResult.messageId) {
        await deleteTestEmail(emailResult.messageId);
      }
    }
  });
});
