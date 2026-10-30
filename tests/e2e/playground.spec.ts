import { expect, test } from '@playwright/test';

test('playground edits, reports errors, resets and switches examples', async ({ page }) => {
  await page.goto('/#/playground/button');
  const preview = page.frameLocator('iframe[title="Button live preview"]');
  const editor = page.getByRole('textbox', { name: 'Button playground code' });
  await expect(preview.getByRole('button', { name: 'Save changes' })).toBeVisible();
  await editor.fill("import { Button } from '@enterprise-ui/react';\n<Button>Edited label</Button>");
  await expect(preview.getByRole('button', { name: 'Edited label' })).toBeVisible();
  await editor.fill('<Button>');
  await expect(page.getByRole('alert')).toContainText('Preview error');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(preview.getByRole('button', { name: 'Save changes' })).toBeVisible();
  await page.getByLabel('Playground component').selectOption('badge');
  await expect(page.getByRole('textbox', { name: 'Badge playground code' })).toBeVisible();
  await expect(page.frameLocator('iframe[title="Badge live preview"]').locator('body')).not.toBeEmpty();
});

test('component documentation links to the playground', async ({ page }) => {
  await page.goto('/#/components/button');
  await page.getByRole('link', { name: 'Open component playground' }).click();
  await expect(page).toHaveURL(/#\/playground\/button$/);
});

test('playground stacks on mobile @mobile', async ({ page }) => {
  await page.goto('/#/playground/button');
  const preview = await page.getByRole('heading', { name: 'Preview' }).boundingBox();
  const editor = await page.getByRole('heading', { name: 'Editor' }).boundingBox();
  expect(preview && editor && editor.y > preview.y).toBeTruthy();
});

test('examples open in the playground with their code', async ({ page }) => {
  await page.goto('/#/components/button');
  const button = page.getByRole('button', { name: 'Open in Playground' }).first();
  await expect(button).toHaveText('Open in Playground');
  await button.click();
  await expect(page).toHaveURL(/#\/playground\?code=z\./);
  const editor = page.getByRole('textbox', { name: /playground code$/ });
  await expect(editor).toHaveValue(/export default function/);
  await expect(editor).toHaveValue(/@enterprise-ui\/react/);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.frameLocator('iframe[title$="live preview"]').getByRole('button').first()).toBeVisible();
});

test('pattern examples that use shared example data open in the playground', async ({ page }) => {
  await page.goto('/#/patterns');
  await page.getByRole('button', { name: 'Open in Playground' }).first().click();
  await expect(page.getByRole('textbox', { name: /playground code$/ })).toHaveValue(/export default function/);
  await expect(page.frameLocator('iframe[title$="live preview"]').locator('body')).not.toBeEmpty();
  await expect(page.getByText('Import not available')).toHaveCount(0);
});
