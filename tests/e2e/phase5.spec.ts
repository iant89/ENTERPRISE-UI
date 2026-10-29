import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('cookbook supports a mock approval failure and recovery', async ({ page }) => {
  await page.goto('/#/patterns');
  const inbox = page.locator('[data-example="approval-workflow/02-inbox"]');
  await inbox.getByLabel('Simulate service failure').check();
  await inbox.getByRole('button', { name: 'Approve' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Confirm Approve' });
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Confirm' }).click();
  await expect(inbox.getByRole('alert')).toContainText('service unavailable');
  await inbox.getByLabel('Simulate service failure').uncheck();
  for (let i = 0; i < 2; i++) {
    await inbox.getByRole('button', { name: 'Approve' }).click();
    await page.getByRole('alertdialog', { name: 'Confirm Approve' }).getByRole('button', { name: 'Confirm' }).click();
  }
  await expect(inbox.getByText('No approvals waiting.')).toBeVisible();
});

test('keyboard dialog focus trap and restoration with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/components/command-palette');
  const trigger = page.locator('[data-example="command-palette/01-basic"]').getByRole('button', { name: 'Open command palette' });
  await trigger.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Command palette' });
  const search = dialog.getByRole('combobox', { name: 'Search commands' });
  await expect(search).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(search).toBeFocused();
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
});

for (const theme of ['light', 'dark', 'high-contrast']) {
  test(`cookbook examples have no axe violations in ${theme}`, async ({ page }) => {
    await page.addInitScript((name) => localStorage.setItem('eui-docs-theme', name), theme);
    await page.goto('/#/patterns');
    const selector = '[data-example="dashboard/02-inventory"], [data-example="wizard/02-purchase-order"], [data-example="approval-workflow/02-inbox"], [data-example="data-grid/03-assets"]';
    await expect(page.locator('[data-example="wizard/02-purchase-order"]')).toBeVisible();
    const results = await new AxeBuilder({ page: page as never }).include(selector).disableRules(['region', 'heading-order', 'landmark-unique', 'landmark-no-duplicate-main']).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('mobile customer selection opens details and back returns to list', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile-specific pane switching');
  await page.goto('/#/components/master-detail');
  const root = page.locator('[data-example="master-detail/02-customers"]');
  await root.getByRole('option', { name: /Northstar Supply/ }).click();
  await expect(root.getByText('C-102', { exact: true })).toBeVisible();
  await expect(root.getByRole('button', { name: 'Back to list' })).toBeFocused();
  await root.getByRole('button', { name: 'Back to list' }).click();
  await expect(root.getByRole('option', { name: /Northstar Supply/ })).toBeFocused();
});

test('a localized input retains mixed-direction text in a compact RTL layout', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('eui-docs-density', 'compact'); });
  await page.goto('/#/components/input');
  const root = page.locator('[data-example="input/02-localized"]');
  const input = root.getByLabel('اسم العميل كما يظهر في سجلات الشركة');
  await expect(input).toHaveValue('شركة الأفق — ACME 42');
  await expect(root.locator('[lang="ar"]')).toHaveAttribute('dir', 'rtl');
  await input.fill('الشركة الجديدة — PO-123');
  await expect(input).toHaveValue('الشركة الجديدة — PO-123');
  const results = await new AxeBuilder({ page: page as never }).include('[data-example="input/02-localized"]').disableRules(['region', 'heading-order']).analyze();
  expect(results.violations).toEqual([]);
});

test('localized command palette supports compact RTL, long labels and mixed-direction commands', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('eui-docs-density', 'compact'));
  await page.goto('/#/components/command-palette');
  const example = page.locator('[data-example="command-palette/02-localized"]');
  const trigger = example.getByRole('button', { name: 'فتح قائمة الأوامر' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'قائمة الأوامر' });
  await expect(dialog.locator('xpath=..')).toHaveAttribute('dir', 'rtl');
  await expect(dialog.getByRole('group', { name: 'الأخيرة' })).toContainText('PO-123');
  const box = dialog.getByRole('listbox', { name: 'نتائج الأوامر' });
  expect(await box.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  const input = dialog.getByRole('combobox', { name: 'البحث عن الأوامر' });
  await input.fill('لا توجد نتيجة');
  await expect(dialog.getByRole('status')).toHaveText('لم يتم العثور على أوامر.');
  const results = await new AxeBuilder({ page: page as never }).include('[role="dialog"]').disableRules(['region', 'heading-order']).analyze();
  expect(results.violations).toEqual([]);
  await dialog.getByRole('button', { name: 'إغلاق القائمة' }).click();
  await expect(trigger).toBeFocused();
});
