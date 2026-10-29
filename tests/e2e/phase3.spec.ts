import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const example = (id: string) => `[data-example="${id}"]`;

test('purchase orders: selection, destructive confirmation and partial success', async ({ page }) => {
  await page.goto('/#/components/list-report');
  const report = page.locator(example('list-report/03-purchase-orders'));
  await expect(report.getByText('PO-1001')).toBeVisible();
  await report.getByRole('checkbox', { name: 'Select all rows on this page' }).check();
  const archive = report.getByRole('button', { name: 'Archive' });
  await archive.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('alertdialog', { name: 'Confirm Archive' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Confirm' }).click();
  await expect(report.getByText('PO-1002: Order is locked')).toBeVisible();
  await expect(report.getByText('2 succeeded; 1 failed.')).toBeVisible();
  await expect(report.getByText('PO-1001')).toHaveCount(0);
});

test('editor: keyboard focus, unsaved confirmation and validation', async ({ page }) => {
  await page.goto('/#/components/object-editor');
  const editor = page.locator(example('object-editor/01-object-page'));
  await editor.getByRole('button', { name: 'Edit' }).click();
  const name = editor.getByLabel('Name', { exact: true });
  await name.fill('');
  await editor.getByRole('button', { name: 'Save' }).click();
  await expect(editor.getByText('Name is required.')).toBeVisible();
  await name.fill('Updated valve');
  await editor.getByRole('button', { name: 'Cancel' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Discard unsaved changes?' });
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(name).toHaveValue('Updated valve');
});

test('approval: requires reason and submits only after confirmation', async ({ page }) => {
  await page.goto('/#/components/approval-workflow');
  const workflow = page.locator(example('approval-workflow/01-purchase-order'));
  await workflow.getByRole('button', { name: 'Reject' }).click();
  await expect(workflow.getByRole('alert')).toContainText('Enter a reason');
  await workflow.getByLabel('Comment or rejection reason').fill('Missing information');
  await workflow.getByRole('button', { name: 'Reject' }).click();
  await page.getByRole('alertdialog', { name: 'Confirm Reject' }).getByRole('button', { name: 'Confirm' }).click();
  await expect(workflow.getByText('rejected', { exact: true })).toBeVisible();
});

test('audit example passes automated accessibility checks', async ({ page }) => {
  await page.goto('/#/components/audit-trail');
  const root = example('audit-trail/01-basic');
  await expect(page.locator(root).getByRole('table')).toBeVisible();
  const results = await new AxeBuilder({ page: page as never }).include(root).disableRules(['region', 'heading-order', 'landmark-unique', 'landmark-no-duplicate-main']).analyze();
  expect(results.violations).toEqual([]);
});
