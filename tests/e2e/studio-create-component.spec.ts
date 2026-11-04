import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Code Studio C5: Create Component (Chromium). */
async function openCode(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('eui-c5-e2e')) {
      sessionStorage.setItem('eui-c5-e2e', '1');
      indexedDB.deleteDatabase('eui-studio');
      localStorage.clear();
    }
  });
  await page.goto('/studio/');
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await expect(files(page).getByRole('treeitem', { name: 'App.tsx', exact: true })).toBeVisible();
}
const files = (page: Page) => page.getByRole('tree', { name: 'Project files' });
const item = (page: Page, name: RegExp) => files(page).getByRole('treeitem', { name });
const dialog = (page: Page) => page.getByRole('dialog', { name: 'Create component' });
const nameField = (page: Page) => dialog(page).getByRole('textbox', { name: /Component name/ });

test('context menu → create ExampleCard, conflict, undo removes all', async ({ page }) => {
  await openCode(page);
  await item(page, /^src/).first().click({ button: 'right', position: { x: 30, y: 10 } });
  await page.getByRole('menuitem', { name: 'Create component…' }).click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page).getByRole('combobox', { name: 'Destination folder' })).toContainText('src/');
  await expect(nameField(page)).toBeFocused();
  const create = dialog(page).getByRole('button', { name: 'Create 5 files' });
  await expect(create).toBeDisabled();
  await nameField(page).fill('ExampleCard');
  await dialog(page).getByRole('checkbox', { name: /Example \(/ }).check();
  await expect(dialog(page).getByRole('button', { name: 'Create 6 files' })).toBeVisible();
  await dialog(page).getByRole('checkbox', { name: /Example \(/ }).uncheck();
  const axe = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  await nameField(page).press('Enter');
  await expect(dialog(page)).toBeHidden();
  for (const f of ['ExampleCard.tsx', 'ExampleCard.css', 'ExampleCard.test.tsx', 'ExampleCard.docs.md', 'index.ts']) {
    await expect(files(page).getByRole('treeitem', { name: new RegExp(`^${f.replace(/\./g, '\\.')}`) })).toBeVisible();
  }
  await expect(item(page, /^ExampleCard\.tsx/)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: 'ExampleCard.tsx', exact: true })).toHaveAttribute('aria-current', 'true');

  // Conflict: the same name again shows an inline error and disables Create.
  await item(page, /^src/).first().click({ button: 'right', position: { x: 30, y: 10 } });
  await page.getByRole('menuitem', { name: 'Create component…' }).click();
  await nameField(page).fill('ExampleCard');
  await expect(dialog(page).getByText(/already exists/)).toBeVisible();
  await expect(nameField(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog(page).getByRole('button', { name: /^Create \d files$/ })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();

  await page.getByRole('button', { name: /^Undo/ }).first().click();
  await expect(item(page, /^ExampleCard\.tsx/)).toHaveCount(0);
  await expect(item(page, /^index\.ts/)).toHaveCount(0);
});

test('tab-row icon and Components "+" prefill the destination; Advanced state persists', async ({ page }) => {
  await openCode(page);
  await page.getByTestId('tab-create-component').last().click();
  await expect(dialog(page).getByRole('combobox', { name: 'Destination folder' })).toContainText('src/components/');
  const adv = dialog(page).getByRole('button', { name: 'Advanced options' });
  await expect(adv).toHaveAttribute('aria-expanded', 'true');
  await adv.click();
  await expect(adv).toHaveAttribute('aria-expanded', 'false');
  await dialog(page).getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByTestId('tab-create-component').last()).toBeFocused();

  await page.reload();
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await page.getByRole('tab', { name: 'Components', exact: true }).click();
  await page.getByTestId('components-panel').getByRole('button', { name: 'Create component' }).click();
  await expect(dialog(page).getByRole('combobox', { name: 'Destination folder' })).toContainText('src/components/');
  await expect(dialog(page).getByRole('button', { name: 'Advanced options' })).toHaveAttribute('aria-expanded', 'false');
});
