import { test, expect } from '@playwright/test';
import { open } from './helpers';

/**
 * Visual regression: compares key screens against committed baselines
 * (tests/e2e/visual.spec.ts-snapshots). Update with `npm run test:e2e:update`.
 */
test.describe('visual regression', () => {
  // Baselines are platform-specific (font rendering). On CI they run only when baselines were generated in the CI image.
  test.skip(!!process.env.CI && !process.env.VISUAL_BASELINES, 'visual baselines are generated locally');

  for (const theme of ['light', 'dark', 'high-contrast']) {
    test(`gallery – ${theme}`, async ({ page }) => {
      await open(page, '/gallery', theme);
      await expect(page.getByRole('main')).toHaveScreenshot(`gallery-${theme}.png`);
    });
  }

  test('demo application', async ({ page }) => {
    await page.goto('/#/demo');
    await page.getByRole('heading', { level: 1, name: 'Products' }).waitFor();
    await expect(page).toHaveScreenshot('demo-app.png');
  });

  test('compact density', async ({ page }) => {
    await open(page, '/components/form-group', 'light', 'compact');
    await expect(page.locator('[data-example="form-group/01-basic"]')).toHaveScreenshot('form-compact.png');
  });

  test('demo application on a phone @mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone viewport only');
    await page.goto('/#/demo');
    await page.getByRole('heading', { level: 1, name: 'Products' }).waitFor();
    await expect(page).toHaveScreenshot('demo-app-mobile.png');
  });
});
