import { test, expect } from '@playwright/test';

/**
 * Mobile fold guard for the paid landing pages.
 *
 * At 390x844 (iPhone 14 / Pixel class) the first interactive control of each
 * page's form must sit inside the first screen without scrolling, and the H1
 * must still be rendered. Fails the build if a landing page pushes its form
 * below the fold again.
 */

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

const FOLD = 844;

const PAGES: { path: string; wrapper: string }[] = [
  { path: '/sell', wrapper: '#valuation-tool' },
  { path: '/mortgage', wrapper: '#apply' },
  { path: '/renewal', wrapper: '#renewal-form' },
  { path: '/afford', wrapper: '#calculator' },
];

// Real controls only: the off-screen honeypot sits in the form too and must not count.
const CONTROL = [
  'input:not([name="referral_code"]):visible',
  'select:visible',
  'textarea:visible',
  'button[type="submit"]:visible',
  'button[role="radio"]:visible',
  '[role="combobox"]:visible',
].join(', ');

test.describe('Mobile fold (390x844)', () => {
  for (const p of PAGES) {
    test(`${p.path}: first form control is above the fold and the H1 renders`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const wrapper = page.locator(p.wrapper);
      await expect(wrapper).toBeVisible();
      // /sell waits for Google Maps before the valuation form mounts.
      const control = wrapper.locator(CONTROL).first();
      await expect(control).toBeVisible({ timeout: 30_000 });

      expect(await page.evaluate(() => window.scrollY), 'page must not have scrolled').toBe(0);
      const box = await control.boundingBox();
      expect(box, 'first control has a bounding box').not.toBeNull();
      expect(box!.y, 'first control starts on screen').toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height, `first control bottom edge on ${p.path}`).toBeLessThanOrEqual(FOLD);
    });
  }
});
