import { test, expect } from '@playwright/test';
import { open } from './helpers';

test.describe('keyboard interaction in a real browser', () => {
  test('skip link moves focus to the main content', async ({ page }) => {
    await open(page, '/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('dialog traps focus and restores it', async ({ page }) => {
    await open(page, '/components/dialog');
    const trigger = page.getByRole('button', { name: 'Create supplier' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Create supplier' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused();
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('select is operable with the keyboard', async ({ page }) => {
    await open(page, '/components/select');
    const combo = page.getByRole('combobox', { name: /Priority/ });
    await combo.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(combo).toContainText('Medium');
  });

  test('dropdown menu positions next to its trigger', async ({ page }) => {
    await open(page, '/components/dropdown-menu');
    const trigger = page.getByRole('button', { name: 'Export' }).first();
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    const t = (await trigger.boundingBox())!;
    const m = (await menu.boundingBox())!;
    expect(Math.abs(m.x - t.x)).toBeLessThan(2);
    expect(m.y).toBeGreaterThanOrEqual(t.y + t.height);
    await expect(page.getByRole('menuitem').first()).toBeFocused();
  });

  test('data grid searches, sorts and paginates', async ({ page }) => {
    await open(page, '/components/data-grid');
    const grid = page.getByRole('region', { name: /Products/ });
    await grid.getByRole('searchbox').fill('ultra');
    await expect(grid.getByRole('heading', { name: 'Products (2)' })).toBeVisible();
    await grid.getByRole('searchbox').fill('');
    await grid.getByRole('button', { name: 'Price' }).click();
    await expect(grid.getByRole('columnheader', { name: 'Price' })).toHaveAttribute('aria-sort', 'ascending');
    await grid.getByRole('button', { name: 'Next page' }).click();
    await expect(grid.getByText('9–16 of 24')).toBeVisible();
  });

  test('theme switching applies and persists', async ({ page }) => {
    await page.goto('/#/');
    await page.getByRole('button', { name: 'Change theme' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Dark', exact: true }).click();
    await expect(page.locator('#root > [data-eui-theme]')).toHaveAttribute('data-eui-theme', 'dark');
    await page.reload();
    await expect(page.locator('#root > [data-eui-theme]')).toHaveAttribute('data-eui-theme', 'dark');
  });

  test('side navigation collapses to icons', async ({ page }) => {
    await open(page, '/');
    await page.getByRole('button', { name: 'Collapse navigation' }).click();
    const nav = page.getByRole('navigation', { name: 'Documentation' });
    expect((await nav.boundingBox())!.width).toBeLessThan(80);
    await expect(nav.getByRole('link', { name: 'Overview' })).toBeVisible();
  });
});

test.describe('responsive behaviour @mobile', () => {
  test('navigation becomes a modal drawer on phones @mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone viewport only');
    await open(page, '/');
    await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeHidden();
    await page.getByRole('button', { name: 'Open navigation' }).click();
    const drawer = page.getByRole('dialog', { name: 'Navigation' });
    await expect(drawer).toBeVisible();
    await drawer.getByRole('link', { name: 'Getting started' }).click();
    await expect(drawer).toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: 'Getting started' })).toBeVisible();
  });

  test('tables stack into cards on phones @mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone viewport only');
    await open(page, '/components/table');
    await page.getByRole('switch', { name: 'Loading' }).waitFor();
    const stacked = page.locator('[data-example="table/03-states"] td').first();
    await expect(stacked).toHaveCSS('display', 'grid');
  });

  test('the demo app has no horizontal page overflow @mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone viewport only');
    await page.goto('/#/demo');
    await page.getByRole('heading', { level: 1, name: 'Products' }).waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
