import { test, expect, type Page } from '@playwright/test';

/** Every page of the Northwind inventory demo, plus its main actions, at desktop and phone sizes. */
const PAGES: [string, string][] = [
  ['home', 'Overview'],
  ['products', 'Products'],
  ['categories', 'Categories'],
  ['stock', 'Stock movements'],
  ['orders', 'Purchase orders'],
  ['suppliers', 'Suppliers'],
  ['invoices', 'Invoices'],
  ['reports', 'Reports'],
  ['settings', 'Settings'],
  ['help', 'Help'],
];

const h1 = (page: Page, name: string) => page.getByRole('heading', { level: 1, name });

async function openNav(page: Page, isMobile: boolean) {
  if (!isMobile) return page.getByRole('navigation').filter({ has: page.getByRole('link', { name: 'Overview' }) }).first();
  await page.getByRole('button', { name: /navigation|menu/i }).first().click();
  return page.getByRole('dialog').filter({ has: page.getByRole('link', { name: 'Overview' }) }).first();
}

for (const tag of ['', ' @mobile']) {
  test.describe(`demo app${tag}`, () => {
    test(`every page has its own route and heading${tag}`, async ({ page }) => {
      for (const [id, title] of PAGES) {
        await page.goto(`/#/demo/${id}`);
        await expect(h1(page, title)).toBeVisible();
        await page.reload();
        await expect(h1(page, title)).toBeVisible();
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test(`side navigation reaches every page${tag}`, async ({ page, isMobile }) => {
      await page.goto('/#/demo');
      await expect(h1(page, 'Products')).toBeVisible();
      for (const [id, title] of PAGES) {
        const nav = await openNav(page, isMobile);
        if (id === 'products' || id === 'categories') {
          const link = nav.getByRole('link', { name: new RegExp(`^${title}`) });
          if (!(await link.isVisible())) await nav.getByRole('button', { name: 'Catalog' }).click();
        }
        await nav.getByRole('link', { name: new RegExp(`^${title}`) }).click();
        await expect(h1(page, title)).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`#/demo/${id}$`));
      }
    });

    test(`create, search, detail, bulk delete and export products${tag}`, async ({ page }) => {
      await page.goto('/#/demo/products');
      await expect(h1(page, 'Products')).toBeVisible();

      // Create product: validation first, then success.
      await page.getByRole('button', { name: 'Create product' }).click();
      const dialog = page.getByRole('dialog', { name: 'Create product' });
      await dialog.getByRole('button', { name: 'Create' }).click();
      await expect(dialog.getByText('Enter a product name.').first()).toBeVisible();
      await dialog.getByLabel('Product name').fill('Demo Widget');
      await dialog.getByLabel('SKU').fill('SKU-999999');
      await dialog.getByRole('combobox', { name: /Category/ }).click();
      await page.getByRole('option', { name: 'Accessories' }).click();
      await dialog.getByRole('combobox', { name: /Supplier/ }).click();
      await page.getByRole('option', { name: 'Litware' }).click();
      await dialog.getByLabel('Stock').fill('5');
      await dialog.getByLabel('Price', { exact: false }).first().fill('25');
      await dialog.getByRole('button', { name: 'Create' }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByRole('region', { name: 'Notifications' }).getByText('Created Demo Widget')).toBeVisible();
      await expect(page.getByRole('region', { name: 'Product details' }).getByText('SKU-999999')).toBeVisible();
      await page.getByRole('button', { name: 'Close details' }).click();

      // Header search filters the catalog.
      const search = page.getByRole('searchbox', { name: 'Search products', exact: true });
      if (!(await search.isVisible())) await page.getByRole('banner').getByRole('button', { name: 'Search', exact: true }).click();
      await search.fill('Dock');
      await search.press('Enter');
      await expect(page.getByText('Showing results for “Dock”.')).toBeVisible();
      await expect(page.getByRole('rowheader', { name: /ProBook/ })).toHaveCount(0);
      await page.getByRole('main').getByRole('button', { name: 'Clear search' }).click();
      await expect(search).toHaveValue('');

      // Row click opens the detail panel.
      await page.getByRole('rowheader', { name: /ProBook 14/ }).first().click();
      await expect(page.getByRole('region', { name: 'Product details' })).toBeVisible();
      await page.getByRole('button', { name: 'Close details' }).click();

      // Export downloads a CSV.
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export', exact: true }).click();
      expect((await download).suggestedFilename()).toBe('northwind-products.csv');

      // Bulk delete with confirmation.
      await page.getByRole('checkbox', { name: /Demo Widget/ }).check();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByRole('region', { name: 'Notifications' }).getByText('Deleted 1 product')).toBeVisible();
      await expect(page.getByRole('rowheader', { name: /Demo Widget/ })).toHaveCount(0);
    });

    test(`overview figures deep-link and settings switch theme${tag}`, async ({ page }) => {
      await page.goto('/#/demo/home');
      await page.getByRole('button', { name: /Stock-outs/ }).click();
      await expect(h1(page, 'Products')).toBeVisible();
      await expect(page.getByRole('rowheader', { name: /Dock Station D5/ })).toBeVisible();

      await page.goto('/#/demo/settings');
      await page.getByRole('combobox', { name: 'Theme' }).click();
      await page.getByRole('option', { name: 'Evening Horizon' }).click();
      await expect(page.locator('[data-eui-theme="sap-horizon-dark"]').first()).toBeAttached();
      await page.getByRole('radio', { name: 'Compact' }).or(page.getByRole('button', { name: 'Compact' })).first().click();
      await expect(page.locator('[data-eui-density="compact"]').first()).toBeAttached();
      await page.getByRole('combobox', { name: 'Theme' }).click();
      await page.getByRole('option', { name: 'Light', exact: true }).click();
    });
  });
}

test('header menus: notifications, help and user @desktop-only', async ({ page }) => {
  await page.goto('/#/demo/home');
  const bell = page.getByRole('button', { name: /Notifications/ });
  await expect(bell).toHaveAccessibleName(/3/);
  await bell.click();
  await page.getByRole('button', { name: 'Mark all read' }).click();
  await expect(bell).not.toHaveAccessibleName(/3/);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /Help/ }).first().click();
  await page.getByRole('menuitem', { name: 'Keyboard shortcuts' }).click();
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /Ada Lovelace/ }).click();
  await page.getByRole('menuitem', { name: 'Preferences' }).click();
  await expect(h1(page, 'Settings')).toBeVisible();
});

test('every demo page passes axe with all rules', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  const failures: string[] = [];
  for (const [id, title] of PAGES) {
    await page.goto(`/#/demo/${id}`);
    await expect(h1(page, title)).toBeVisible();
    const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    failures.push(...results.violations.map((v) => `${id} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`));
  }
  expect(failures).toEqual([]);
});
