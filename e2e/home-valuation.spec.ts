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
      // Fall back to scrolling to the form by looking for the heading
      const formHeading = page.getByText(/home details/i).first();
      await formHeading.scrollIntoViewIfNeeded();
    }

    // Wait for Google Maps to load (address field becomes enabled)
    await page.waitForTimeout(3000);

    // Address — type directly (Google Places autocomplete may not work in test)
    const addressInput = page.getByPlaceholder(/maple street|address/i).first();
    await addressInput.fill(TEST_PROPERTY.address);
    await page.waitForTimeout(1000);
    // If autocomplete suggestions appear, dismiss them by clicking elsewhere
    await page.keyboard.press('Escape');

    // Home Type — select from dropdown
    await page.getByRole('combobox').filter({ hasText: /detached|home type/i }).first().click();
    await page.getByRole('option', { name: TEST_PROPERTY.homeType, exact: true }).click();

    // Bedrooms
    const bedroomsAbove = page.getByLabel(/bedrooms.*above/i);
    await bedroomsAbove.clear();
    await bedroomsAbove.fill(TEST_PROPERTY.bedroomsAbove);

    const bedroomsBelow = page.getByLabel(/bedrooms.*below/i);
    await bedroomsBelow.clear();
    await bedroomsBelow.fill(TEST_PROPERTY.bedroomsBelow);

    // Bathrooms
    const bathrooms = page.getByLabel(/bathrooms/i);
    await bathrooms.clear();
    await bathrooms.fill(TEST_PROPERTY.bathrooms);

    // Square Footage — select
    const sqftSelect = page.getByRole('combobox').filter({ hasText: /square footage|sq/i });
    if (await sqftSelect.isVisible()) {
      await sqftSelect.click();
      await page.getByRole('option', { name: new RegExp(TEST_PROPERTY.squareFootage) }).click();
    }

    // Age of Home — select
    const ageSelect = page.getByRole('combobox').filter({ hasText: /age|year/i });
    if (await ageSelect.isVisible()) {
      await ageSelect.click();
      await page.getByRole('option', { name: new RegExp(TEST_PROPERTY.yearBuilt) }).click();
    }

    // Finished Basement — select
    const basementSelect = page.getByRole('combobox').filter({ hasText: /basement|finished/i });
    if (await basementSelect.isVisible()) {
      await basementSelect.click();
      await page.getByRole('option', { name: TEST_PROPERTY.finishedBasement }).click();
    }

    // Garage Spaces
    const garage = page.getByLabel(/garage/i);
    await garage.clear();
    await garage.fill(TEST_PROPERTY.garageSpaces);

    // Total Parking
    const parking = page.getByLabel(/total parking|parking spaces/i);
    await parking.clear();
    await parking.fill(TEST_PROPERTY.parkingSpaces);

    // Nearby Schools
    const schools = page.getByLabel(/nearby schools/i);
    await schools.fill(TEST_PROPERTY.nearbySchools);

    // Renovated checkbox
    const renovatedCheckbox = page.getByLabel(/recently renovated/i);
    if (await renovatedCheckbox.isVisible()) {
      await renovatedCheckbox.check();
    }

    // Submit the valuation form
    await page.getByRole('button', { name: /generate.*valuation/i }).click();

    // ── Step 2: Verify AI valuation results ─────────────────────

    // Wait for the loading spinner to appear and then the results
    await expect(
      page.getByText(/estimated value|your.*valuation/i).first(),
    ).toBeVisible({ timeout: 120_000 }); // AI can take up to 2 minutes

    // Verify key result elements
    await expect(page.getByText(/\$[\d,]+/)).toBeVisible(); // Dollar amount
    await expect(page.getByText(/confidence score/i)).toBeVisible();
    await expect(page.getByText(/valuation reasoning/i)).toBeVisible();

    // ── Step 3: Expert Opinion contact form ─────────────────────

    // The "Ready for an Expert Opinion?" section should be visible
    await expect(
      page.getByText(/expert opinion/i).first(),
    ).toBeVisible();

    const beforeSubmit = new Date();

    // Fill out the expert opinion contact form
    // These are the SECOND set of name/email/phone fields on the page
    const expertForm = page.locator('form').last();
    await expertForm.getByLabel(/full name/i).fill(TEST_CONTACT.name);
    await expertForm.getByLabel(/email/i).fill(TEST_CONTACT.email);
    await expertForm.getByLabel(/phone/i).fill(TEST_CONTACT.phone);

    // Submit
    await expertForm
      .getByRole('button', { name: /contact ken|expert opinion/i })
      .click();

    // Verify success
    await expect(
      page.getByText(/thank you/i),
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
