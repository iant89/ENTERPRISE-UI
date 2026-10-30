import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const THEMES = ['light', 'dark', 'high-contrast', 'sap-horizon', 'sap-horizon-dark', 'sap-fiori-3', 'sap-fiori-3-dark'];

async function openStudio(page: Page, theme = 'light') {
  await page.addInitScript((t) => localStorage.setItem('eui-docs-theme', t), theme);
  await page.goto('/studio/');
  await expect(page.getByRole('treeitem', { name: /^Stack/ }).first()).toBeVisible();
  await expect(preview(page).getByRole('heading', { name: 'My application' })).toBeVisible();
}

const preview = (page: Page) => page.frameLocator('iframe[title="Page preview"]');
const view = (page: Page, name: 'Design' | 'Split' | 'Code') => page.getByRole('group', { name: 'Editor view' }).getByRole('button', { name, exact: true });
const outline = (page: Page) => page.getByRole('tree', { name: 'Page outline' });

/** Text of the Monaco model (the visible lines, with non-breaking spaces normalised). */
async function editorText(page: Page) {
  await view(page, 'Code').click();
  const lines = page.locator('[data-testid="code-editor"] .view-lines');
  await expect(lines).toBeVisible();
  return (await lines.innerText()).replace(/\u00a0/g, ' ');
}

test('opens an example from the docs in the Studio', async ({ page }) => {
  await page.goto('/#/components/badge');
  await page.getByRole('button', { name: 'Open in Studio' }).first().click();
  await expect(page).toHaveURL(/\/studio\/$/);
  await expect(outline(page).getByRole('treeitem', { name: /^Badge/ }).first()).toBeVisible();
  await expect(page.getByText('Example opened in Studio').first()).toBeVisible();
});

test('edits code and updates the canvas and outline', async ({ page }) => {
  await openStudio(page);
  await view(page, 'Code').click();
  const lines = page.locator('[data-testid="code-editor"] .view-lines');
  await expect(lines).toContainText('My application');
  await lines.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText("import { Badge, Stack } from '@enterprise-ui/react';\n\nexport default function App() {\n  return (\n    <Stack>\n      <h2>Edited in code</h2>\n      <Badge>Beta</Badge>\n    </Stack>\n  );\n}\n");
  // Drop the brackets Monaco auto-closed while typing.
  await page.keyboard.press('ControlOrMeta+Shift+End');
  await page.keyboard.press('Delete');
  await view(page, 'Design').click();
  await expect(preview(page).getByRole('heading', { name: 'Edited in code' })).toBeVisible();
  await expect(outline(page).getByRole('treeitem', { name: /^Badge/ })).toBeVisible();
});

test('code editor autocompletes library properties and keeps the last good preview', async ({ page }) => {
  await openStudio(page);
  await view(page, 'Split').click();
  await page.locator('.view-line', { hasText: 'variant="primary"' }).click();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.insertText('<Button var');
  await page.keyboard.press('Control+Space');
  await expect(page.locator('.suggest-widget')).toContainText('ButtonProps.variant');
  await expect(page.getByText('The page cannot be edited visually')).toBeVisible();
  await expect(preview(page).getByRole('heading', { name: 'My application' })).toBeVisible();
});

test('drags a component onto the canvas', async ({ page }) => {
  await openStudio(page);
  const overlay = page.getByTestId('canvas-overlay');
  const box = (await overlay.boundingBox())!;
  await page.locator('[data-palette="Badge"]').dragTo(overlay, { targetPosition: { x: box.width / 2, y: box.height - 40 } });
  await expect(outline(page).getByRole('treeitem', { name: /^Badge/ })).toBeVisible();
  await expect(preview(page).locator('body')).toContainText('New');
  expect(await editorText(page)).toMatch(/import \{ Button, Card, Stack, Text, Title, Badge \}[\s\S]*<Badge>New<\/Badge>/);
});

test('inserts from the palette with the keyboard', async ({ page }) => {
  await openStudio(page);
  await page.getByRole('searchbox', { name: 'Search components' }).fill('MessageStrip');
  await page.locator('[data-palette="MessageStrip"]').focus();
  await page.keyboard.press('Enter');
  await expect(outline(page).getByRole('treeitem', { name: /^MessageStrip/ })).toBeVisible();
});

test('edits a property in the inspector, then undoes and redoes it', async ({ page }) => {
  await openStudio(page);
  await outline(page).getByRole('treeitem', { name: /^Button/ }).click();
  await expect(page.getByRole('heading', { name: 'Button', level: 2 })).toBeVisible();
  await page.getByRole('textbox', { name: 'Text content' }).fill('Start now');
  await expect(preview(page).getByRole('button', { name: 'Start now' })).toBeVisible();
  await page.getByRole('combobox', { name: 'variant' }).click();
  await page.getByRole('option', { name: 'secondary', exact: true }).first().click();
  expect(await editorText(page)).toContain('<Button variant="secondary">Start now</Button>');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('[data-testid="code-editor"] .view-lines')).toContainText('variant="primary"');
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(page.locator('[data-testid="code-editor"] .view-lines')).toContainText('variant="secondary"');
});

test('keeps the page across reloads', async ({ page }) => {
  await openStudio(page);
  await outline(page).getByRole('treeitem', { name: /^Title/ }).click();
  await page.getByRole('textbox', { name: 'Text content' }).fill('Saved title');
  await expect(page.getByText('Saved in this browser')).toBeVisible();
  await page.reload();
  await expect(preview(page).getByRole('heading', { name: 'Saved title' })).toBeVisible();
});

test('docs navigation links to the Studio', async ({ page }) => {
  await page.goto('/#/components');
  await page.getByRole('link', { name: 'Studio' }).click();
  await expect(page).toHaveURL(/\/studio\/$/);
  await expect(page.getByRole('heading', { name: 'Enterprise UI Studio', level: 1 })).toBeAttached();
});

for (const theme of THEMES) {
  test(`Studio has no axe violations in ${theme}`, async ({ page }) => {
    await openStudio(page, theme);
    await outline(page).getByRole('treeitem', { name: /^Button/ }).click();
    const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).exclude('iframe').analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(', ')}`)).toEqual([]);
  });
}

test('Studio code view has no axe violations', async ({ page }) => {
  await openStudio(page);
  await view(page, 'Split').click();
  await expect(page.locator('[data-testid="code-editor"] .view-lines')).toContainText('My application');
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).exclude('iframe').analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(', ')}`)).toEqual([]);
});
