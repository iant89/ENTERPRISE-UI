import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Code Studio C1: IDE shell and panel layout. */

const frame = (page: Page) => page.frameLocator('iframe[title="Page preview"]');
const lines = (page: Page) => page.locator('[data-testid="code-editor"] .view-lines');

async function openStudio(page: Page, theme = 'dark') {
  await page.addInitScript((t) => { try { localStorage.setItem('eui-docs-theme', t); } catch { /* sandboxed preview frame */ } }, theme);
  await page.goto('/studio/');
  await expect(frame(page).getByRole('heading', { name: 'My application' })).toBeVisible();
}

async function openCode(page: Page, theme = 'dark') {
  await openStudio(page, theme);
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await expect(page.getByRole('radio', { name: 'Code Studio' })).toHaveAttribute('aria-checked', 'true');
}

async function replaceCode(page: Page, text: string) {
  await expect(lines(page)).toContainText('export default');
  await lines(page).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(text);
}

const PAGE = (title: string) => `import { Stack, Title } from '@enterprise-ui/react';\n\nexport default function App() {\n  return (\n    <Stack>\n      <Title level={1}>${title}</Title>\n    </Stack>\n  );\n}\n`;

test('switches Design and Code with the edit preserved, without serious axe violations', async ({ page }) => {
  await openCode(page);
  for (const name of ['Explorer', 'Search', 'Components', 'Docs']) await expect(page.getByRole('tab', { name, exact: true })).toBeVisible();
  for (const name of ['Problems', 'Console', 'Tests', 'Component Docs', 'Output', 'Preview Events']) await expect(page.getByRole('tab', { name, exact: true })).toBeVisible();
  const results = await new AxeBuilder({ page: page as never }).exclude('iframe').exclude('.monaco-editor').analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);

  await replaceCode(page, PAGE('Edited in Code'));
  await expect(frame(page).getByRole('heading', { name: 'Edited in Code' })).toBeVisible();
  // Keyboard switch (radiogroup, arrow keys).
  await page.getByRole('radio', { name: 'Code Studio' }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('group', { name: 'Editor view' })).toBeVisible();
  await expect(frame(page).getByRole('heading', { name: 'Edited in Code' })).toBeVisible();
});

test('resizing and collapsing survive a reload', async ({ page }) => {
  await openCode(page);
  const sidebar = page.getByRole('separator', { name: 'Resize sidebar' });
  const before = Number(await sidebar.getAttribute('aria-valuenow'));
  await sidebar.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(sidebar).toHaveAttribute('aria-valuenow', String(before + 32));
  const box = await page.getByRole('separator', { name: 'Resize bottom panel' }).boundingBox();
  await page.mouse.move(box!.x + 50, box!.y);
  await page.mouse.down();
  await page.mouse.move(box!.x + 50, box!.y - 40);
  await page.mouse.up();
  await page.getByRole('button', { name: 'Hide preview' }).click();
  await expect(page.getByRole('button', { name: 'Show preview' })).toBeVisible();
  const bottom = await page.getByRole('separator', { name: 'Resize bottom panel' }).getAttribute('aria-valuenow');

  await page.reload();
  await expect(page.getByRole('radio', { name: 'Code Studio' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('separator', { name: 'Resize sidebar' })).toHaveAttribute('aria-valuenow', String(before + 32));
  await expect(page.getByRole('separator', { name: 'Resize bottom panel' })).toHaveAttribute('aria-valuenow', bottom!);
  await expect(page.getByRole('button', { name: 'Show preview' })).toBeVisible();
  await page.keyboard.press('ControlOrMeta+B');
  await expect(page.getByRole('separator', { name: 'Resize sidebar' })).toHaveCount(0);
});

test('a dirty dot appears on edit and clears after autosave', async ({ page }) => {
  await openCode(page);
  await expect(lines(page)).toContainText('export default');
  await lines(page).click();
  await page.keyboard.type('// x');
  await expect(page.getByRole('list', { name: 'Open files' }).getByRole('button', { name: 'App.tsx, unsaved' })).toBeVisible();
  await expect(page.getByTestId('dirty-dot')).toHaveCount(1);
  await expect(page.getByTestId('dirty-dot')).toHaveCount(0);
  await expect(page.getByRole('list', { name: 'Open files' }).getByRole('button', { name: 'App.tsx', exact: true })).toBeVisible();
});

test('opening and pinning Docs keeps focus in the editor', async ({ page }) => {
  await openCode(page);
  await expect(lines(page)).toContainText('export default');
  await lines(page).click();
  const inEditor = () => page.evaluate(() => !!document.activeElement?.closest('.monaco-editor'));
  await page.getByRole('tab', { name: 'Docs', exact: true }).click();
  expect(await inEditor()).toBe(true);
  await page.getByRole('button', { name: 'Pin Docs beside the editor' }).click();
  await expect(page.getByTestId('docs-pinned')).toBeVisible();
  expect(await inEditor()).toBe(true);
  await page.reload();
  await expect(page.getByTestId('docs-pinned')).toBeVisible();
  await page.getByRole('button', { name: 'Unpin Docs' }).first().click();
  await expect(page.getByTestId('docs-sidebar')).toBeVisible();
});

test('the preview theme is independent of the Studio theme', async ({ page }) => {
  await openCode(page, 'dark');
  await page.getByRole('combobox', { name: /Preview theme/ }).click();
  await page.getByRole('option', { name: 'Evening Horizon' }).click();
  await expect(frame(page).locator('[data-eui-theme="sap-horizon-dark"]').first()).toBeAttached();
  await expect(page.locator('[data-eui-theme="dark"]').first()).toBeAttached();
  await page.getByRole('combobox', { name: /Studio theme/ }).click();
  await page.getByRole('option', { name: 'Light', exact: true }).click();
  await expect(page.locator('[data-eui-theme="light"]').first()).toBeAttached();
  await expect(frame(page).locator('[data-eui-theme="sap-horizon-dark"]').first()).toBeAttached();
  await page.reload();
  await expect(frame(page).locator('[data-eui-theme="sap-horizon-dark"]').first()).toBeAttached();
});

test('a stale preview keeps the last frame and shows the banner', async ({ page }) => {
  await openCode(page);
  await replaceCode(page, 'export default function App() {\n  return (<div>\n}\n');
  await expect(page.getByText('Preview is stale')).toBeVisible();
  await expect(page.getByRole('toolbar', { name: 'Preview tools' }).getByText('Stale')).toBeVisible();
  await expect(page.locator('iframe[title="Page preview"]')).toHaveCount(1);
  await expect(frame(page).getByRole('heading', { name: 'My application' })).toBeVisible();
  await expect(page.getByRole('tab', { name: /^Problems/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Go to error' }).click();
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('.monaco-editor'))).toBe(true);
});

test.describe('tablet 1024×768', () => {
  test.use({ viewport: { width: 1024, height: 768 } });
  test('Split, Editor and Preview layouts persist', async ({ page }) => {
    await openCode(page, 'sap-horizon');
    const layout = page.getByRole('radiogroup', { name: 'Layout' });
    await expect(layout.getByRole('radio', { name: 'Split' })).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('region', { name: 'Preview' })).toBeVisible();
    await expect(page.getByRole('main', { name: 'Editor' })).toBeVisible();
    await layout.getByRole('radio', { name: 'Editor' }).click();
    await expect(page.getByRole('region', { name: 'Preview' })).toBeHidden();
    await layout.getByRole('radio', { name: 'Preview' }).click();
    await expect(page.getByRole('main', { name: 'Editor' })).toBeHidden();
    await expect(page.getByRole('region', { name: 'Preview' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Problems/ })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('radiogroup', { name: 'Layout' }).getByRole('radio', { name: 'Preview' })).toHaveAttribute('aria-checked', 'true');
    // Explorer opens as an overlay from the icon-only activity tabs.
    await page.getByRole('tab', { name: 'Explorer' }).click();
    await expect(page.getByRole('tree').first()).toBeVisible();
  });
});

test.describe('mobile 390×844', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('four full-screen tabs with a dirty dot on Code and no horizontal scroll', async ({ page }) => {
    await openCode(page);
    const views = page.getByRole('tablist', { name: 'Code Studio views' });
    for (const name of ['Files', 'Code', 'Preview', 'Panel']) await expect(views.getByRole('tab', { name: new RegExp(`^${name}`) })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Code Studio' })).toHaveText('Code');
    await lines(page).click();
    await page.keyboard.type('// x');
    await expect(page.getByTestId('mobile-dirty-dot')).toBeVisible();
    await views.getByRole('tab', { name: 'Preview' }).click();
    await expect(page.getByRole('region', { name: 'Preview' })).toBeVisible();
    await expect(page.getByRole('main', { name: 'Editor' })).toBeHidden();
    await views.getByRole('tab', { name: 'Files' }).click();
    await expect(page.getByRole('tree').first()).toBeVisible();
    await views.getByRole('tab', { name: 'Panel' }).click();
    await expect(page.getByRole('region', { name: 'Bottom panel' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Save' })).toBeVisible();
  });
});
