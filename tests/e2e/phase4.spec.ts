import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('windowed DataGrid preserves row geometry, selection and keyboard navigation', async ({ page }) => {
  await page.goto('/#/components/data-grid');
  const root = page.locator('[data-example="data-grid/02-virtualized"]');
  const region = root.getByRole('region', { name: 'Inventory', exact: true });
  await expect(region.getByText('Item 1', { exact: true })).toBeVisible();
  expect(await region.locator('tbody tr[data-virtual-index]').count()).toBeLessThan(20);
  const first = region.locator('tr[data-virtual-index="0"]');
  const second = region.locator('tr[data-virtual-index="1"]');
  const firstBox = await first.boundingBox(); const secondBox = await second.boundingBox();
  expect(firstBox).not.toBeNull(); expect(secondBox).not.toBeNull();
  expect(Math.abs(secondBox!.y - firstBox!.y - 40)).toBeLessThan(1);
  await region.getByRole('checkbox', { name: 'Select Item 1', exact: true }).check();
  await region.focus();
  await region.evaluate((element) => { element.scrollTop = 40000; });
  await expect(region.getByText('Item 1001', { exact: true })).toBeVisible();
  expect(await region.locator('tbody tr[data-virtual-index]').count()).toBeLessThan(20);
  await region.evaluate((element) => { element.scrollTop = 0; });
  await expect(region.getByRole('checkbox', { name: 'Select Item 1', exact: true })).toBeChecked();
  await first.focus(); await page.keyboard.press('ArrowDown');
  await expect(second).toBeFocused();
  const checkbox = region.getByRole('checkbox', { name: 'Select Item 1', exact: true });
  await checkbox.focus();
  await region.evaluate((element) => { element.scrollTop = 40000; });
  await expect(region.getByText('Item 1001', { exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(second).toBeFocused();
  await region.evaluate((element) => { element.scrollTop = 40000; });
  await expect(region.getByText('Item 1001', { exact: true })).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expect(checkbox).toBeFocused();
  const results = await new AxeBuilder({ page: page as never }).include('[data-example="data-grid/02-virtualized"]').disableRules(['region', 'heading-order', 'landmark-unique', 'landmark-no-duplicate-main']).analyze();
  expect(results.violations).toEqual([]);
});

test('virtual tree supports keyboard navigation across windows', async ({ page }) => {
  await page.goto('/#/components/virtual-tree');
  const tree = page.locator('[data-example="virtual-tree/01-basic"]').getByRole('tree');
  await tree.focus(); await page.keyboard.press('End');
  await expect(tree.getByRole('treeitem', { name: 'Item 5000' })).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(tree.getByRole('treeitem', { name: 'Inventory' })).toBeVisible();
});
