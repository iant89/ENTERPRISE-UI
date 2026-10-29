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

test('localized notifications support mixed-direction labels and actions in compact RTL', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('eui-docs-density', 'compact'));
  await page.goto('/#/components/notification-center');
  const example = page.locator('[data-example="notification-center/02-localized"]');
  const region = example.getByRole('region', { name: 'الإشعارات' });
  await expect(region).toHaveAttribute('dir', 'rtl');
  await expect(region.getByText('الموافقة على الطلب PO-1042')).toBeVisible();
  expect(await region.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  const results = await new AxeBuilder({ page: page as never }).include('[data-example="notification-center/02-localized"]').disableRules(['region', 'heading-order']).analyze();
  expect(results.violations).toEqual([]);
  await region.getByRole('button', { name: 'وضع علامة مقروء: الموافقة على الطلب PO-1042' }).click();
  const zero = await page.evaluate(() => new Intl.NumberFormat('ar').format(0));
  await expect(region.getByText(`غير مقروء: ${zero}`)).toBeVisible();
  await region.getByRole('button', { name: 'إزالة: الموافقة على الطلب PO-1042' }).click();
  await expect(region.getByText('لا توجد إشعارات.')).toBeVisible();
});

test('loading indicators stop motion for system and explicit reduced-motion preferences', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#/components/spinner');
  const indicator = page.locator('[data-example="spinner/01-basic"] svg').first();
  await expect(indicator).toBeVisible();
  await expect(indicator).not.toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(indicator).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await indicator.evaluate((el) => el.parentElement?.setAttribute('data-eui-motion', 'reduced'));
  await expect(indicator).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#/components/progress-bar');
  const fill = page.locator('[data-example="progress-bar/01-basic"]').getByRole('progressbar', { name: 'Synchronising' }).locator(':scope > div');
  await expect(fill).not.toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(fill).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fill.evaluate((el) => el.parentElement?.parentElement?.parentElement?.setAttribute('data-eui-motion', 'reduced'));
  await expect(fill).toHaveCSS('animation-name', 'none');
  await expect(fill).toBeVisible();
});

test('button keyboard focus remains visible in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/#/components/button');
  const button = page.locator('[data-example="button/01-variants"]').getByRole('button', { name: 'Save', exact: true });
  await button.focus();
  await expect(button).toBeFocused();
  const outline = await button.evaluate((element) => {
    const style = getComputedStyle(element);
    let parent = element.parentElement;
    let background = 'rgba(0, 0, 0, 0)';
    while (parent && background === 'rgba(0, 0, 0, 0)') {
      background = getComputedStyle(parent).backgroundColor;
      parent = parent.parentElement;
    }
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), color: style.outlineColor, background };
  });
  expect(outline.style).not.toBe('none');
  expect(outline.width).toBeGreaterThan(0);
  expect(outline.color).not.toBe(outline.background);
});

test('localized inline editor supports RTL keyboard editing and validation', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('eui-docs-density', 'compact'));
  await page.goto('/#/components/inline-edit');
  const example = page.locator('[data-example="inline-edit/02-localized"]');
  const trigger = example.getByRole('button', { name: 'تعديل وصف الطلب' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const input = example.getByLabel('وصف الطلب');
  await expect(input).toBeFocused();
  await input.fill('');
  await example.getByRole('button', { name: 'حفظ' }).click();
  await expect(example.getByRole('alert')).toHaveText('أدخل الوصف.');
  await input.fill('شركة جديدة PO-123');
  await example.getByRole('button', { name: 'حفظ' }).click();
  await expect(trigger).toBeFocused();
  await expect(example.getByText('شركة جديدة PO-123')).toBeVisible();
  const violations = await new AxeBuilder({ page: page as never }).include('[data-example="inline-edit/02-localized"]').disableRules(['region', 'heading-order']).analyze();
  expect(violations.violations).toEqual([]);
});

test('localized file uploader validates and uploads mixed-direction filenames', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('eui-docs-density', 'compact'));
  await page.goto('/#/components/file-uploader');
  const root = page.locator('[data-example="file-uploader/02-localized"]');
  const region = root.getByRole('region', { name: 'رفع الملفات' });
  await expect(region).toHaveAttribute('dir', 'rtl');
  await region.getByLabel('رفع الملفات').setInputFiles([
    { name: 'طلب-PO-42.txt', mimeType: 'text/plain', buffer: Buffer.from('ok') },
    { name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('x') },
  ]);
  await expect(region.getByText('نوع الملف غير مقبول.')).toBeVisible();
  await expect(region.getByText('طلب-PO-42.txt')).toBeVisible();
  await expect(region.getByText('تم الرفع', { exact: false })).toBeVisible();
  const result = await new AxeBuilder({ page: page as never }).include('[data-example="file-uploader/02-localized"]').disableRules(['region', 'heading-order']).analyze();
  expect(result.violations).toEqual([]);
});

test('localized bulk action confirms and warns about unknown outcomes', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('eui-docs-density', 'compact'));
  await page.goto('/#/components/bulk-action-bar');
  const root = page.locator('[data-example="bulk-action-bar/02-localized"]');
  await root.getByRole('button', { name: 'الأرشفة' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'تأكيد الأرشفة' });
  await expect(dialog.locator('xpath=..')).toHaveAttribute('dir', 'rtl');
  await expect(dialog.getByRole('button', { name: 'إلغاء' })).toBeFocused();
  await dialog.getByRole('button', { name: 'تأكيد' }).click();
  await expect(root.getByText('تحقق من النتائج غير المؤكدة قبل إعادة المحاولة.')).toBeVisible();
  await expect(root.getByText('لم ترد نتيجة لهذا السجل.')).toBeVisible();
  await expect(root.getByRole('button', { name: 'إعادة محاولة الفاشل' })).toHaveCount(0);
  const result = await new AxeBuilder({ page: page as never }).include('[data-example="bulk-action-bar/02-localized"]').disableRules(['region', 'heading-order']).analyze();
  expect(result.violations).toEqual([]);
});
