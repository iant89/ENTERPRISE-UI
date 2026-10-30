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
  await page.getByRole('link', { name: 'open the full playground' }).click();
  await expect(page).toHaveURL(/#\/playground\/button$/);
});

test('playground stacks on mobile @mobile', async ({ page }) => {
  await page.goto('/#/playground/button');
  const preview = await page.getByRole('heading', { name: 'Preview' }).boundingBox();
  const editor = await page.getByRole('heading', { name: 'Editor' }).boundingBox();
  expect(preview && editor && editor.y > preview.y).toBeTruthy();
});
