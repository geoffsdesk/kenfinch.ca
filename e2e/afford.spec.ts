import { test, expect } from '@playwright/test';

/**
 * Affordability calculator (/afford): live estimate, then the report form.
 * Modelled on renewal-form.spec.ts. The report submits as a `buyer` lead when
 * the full name, phone and first-home answer are present, otherwise as a
 * `contact` lead with intent "Affordability estimate". Uses an E2E name and
 * address so the pipeline quarantines it and sends no notifications.
 */

test.describe('Affordability calculator', () => {
  test('page renders with the H1, calculator, Never List, FAQ and disclosure', async ({ page }) => {
    await page.goto('/afford');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/how much home can you/i);
    await expect(page.getByTestId('afford-calculator')).toBeVisible();
    await expect(page.getByTestId('afford-income')).toBeVisible();
    await expect(page.locator('#never-list ol li')).toHaveCount(6);
    await expect(page.getByText(/What are GDS and TDS/i)).toBeVisible();
    await expect(page.getByText(/FSRA Brokerage Licence/i).first()).toBeVisible();
    // Never a rate quote: the qualifying rate is labelled as an assumption.
    await expect(page.getByText(/Not an offer, not a rate quote/i)).toBeVisible();
  });

  test('shows a result that changes with income and never quotes a mortgage rate', async ({ page }) => {
    await page.goto('/afford');
    const result = page.getByTestId('afford-result');
    await expect(result).toContainText(/enter your income/i);

    await page.getByTestId('afford-income').fill('150000');
    await page.getByTestId('afford-down').fill('200000');
    const price = page.getByTestId('afford-price');
    await expect(price).toBeVisible();
    await expect(price).toContainText(/\$\d{1,3}(,\d{3})+ to \$\d{1,3}(,\d{3})+/);
    const before = (await price.textContent()) ?? '';

    await page.getByTestId('afford-income').fill('250000');
    await expect(price).not.toHaveText(before);
    await expect(result).toContainText(/Mortgage amount/i);
    await expect(result).toContainText(/not a pre-approval and not a rate quote/i);

    // A larger debt load lowers the ceiling.
    const higher = (await price.textContent()) ?? '';
    await page.getByTestId('afford-debts').fill('2500');
    await expect(price).not.toHaveText(higher);

    // Three Oakville examples recompute under the same assumptions.
    await expect(page.getByText(/Three Oakville examples/i)).toBeVisible();
    await expect(page.getByText(/Glen Abbey/)).toBeVisible();
  });

  test('validates the report form before submitting', async ({ page }) => {
    await page.goto('/afford');
    await page.getByTestId('afford-submit').click();
    await expect(page.getByText(/enter your name/i)).toBeVisible();
    await expect(page.getByText(/valid email/i)).toBeVisible();
    await expect(page.getByText(/when are you hoping to buy/i).last()).toBeVisible();
    await expect(page.getByText(/confirm Ken may contact you/i)).toBeVisible();
    await expect(page.getByTestId('afford-success')).toHaveCount(0);
  });

  test('submits the report request and offers the Express Mortgage hand-off', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/afford');
    await page.getByTestId('afford-income').fill('150000');
    await page.getByTestId('afford-down').fill('120000');
    await expect(page.getByTestId('afford-price')).toBeVisible();

    const form = page.getByTestId('afford-form');
    await form.getByTestId('afford-name').fill('E2E AffordTest (ignore)');
    await form.getByTestId('afford-email').fill('e2e-afford@kenfinch.ca');
    await form.getByTestId('afford-phone').fill('(905) 555-0500');
    await form.getByRole('radio', { name: 'Yes, first home' }).click();
    await form.getByRole('radio', { name: '3 to 6 months' }).click();
    await form.getByTestId('afford-consent').click();
    await form.getByTestId('afford-submit').click();

    const success = page.getByTestId('afford-success');
    await expect(success).toBeVisible({ timeout: 30_000 });
    await expect(success).toContainText(/Ken has your numbers/i);
    const handoff = success.getByRole('link', { name: /continue to secure application/i });
    const href = await handoff.getAttribute('href');
    expect(href).toContain('cemi.mtg-app.com/signup');
    expect(href).toContain('brokerId=05293159-120d-4019-aa51-5ca60e1acc65');
    // The Firestore id rides along as externalId. A local dev server without Admin credentials
    // stores nothing (lead id ""), so the link is checked against whatever id the page received.
    const leadId = (await success.getAttribute('data-lead-id')) ?? '';
    if (leadId) expect(href).toContain(`externalId=${leadId}`);
    else expect(href).not.toContain('externalId=');
    await expect(success).toContainText(/Mortgage Agent Level 1/);
  });

  test('a name-and-email-only request still succeeds (stored as a contact lead)', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/afford');
    const form = page.getByTestId('afford-form');
    await form.getByTestId('afford-name').fill('E2E (ignore)');
    await form.getByTestId('afford-email').fill('e2e-afford-contact@kenfinch.ca');
    await form.getByRole('radio', { name: 'Just exploring' }).click();
    await form.getByTestId('afford-consent').click();
    await form.getByTestId('afford-submit').click();
    await expect(page.getByTestId('afford-success')).toBeVisible({ timeout: 30_000 });
  });
});
