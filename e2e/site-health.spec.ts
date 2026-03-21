import { test, expect } from '@playwright/test';

test.describe('Site Health Checks', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);

    // Verify key content is present
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page).toHaveTitle(/Ken Finch|Oakville|Home/i);
  });

  test('contact page loads', async ({ page }) => {
    const response = await page.goto('/contact');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('form')).toBeVisible();
  });

  test('seller login page loads', async ({ page }) => {
    const response = await page.goto('/seller/login');
    expect(response?.status()).toBeLessThan(400);
  });

  test('blog page loads', async ({ page }) => {
    const response = await page.goto('/blog');
    expect(response?.status()).toBeLessThan(400);
  });

  test('no critical console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known non-critical errors (third-party scripts, etc.)
        if (
          !text.includes('favicon') &&
          !text.includes('fbevents') &&
          !text.includes('third-party')
        ) {
          errors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000); // Let scripts settle

    // Allow up to 2 minor console errors (third-party scripts can be noisy)
    expect(
      errors.length,
      `Critical console errors found:\n${errors.join('\n')}`,
    ).toBeLessThanOrEqual(2);
  });

  test('SSL certificate is valid', async ({ page }) => {
    // If the page loads over HTTPS without error, SSL is valid
    const response = await page.goto('https://www.kenfinch.ca');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toMatch(/^https:\/\//);
  });

  test('key meta tags are present for SEO', async ({ page }) => {
    await page.goto('/');

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(20);

    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });
});
