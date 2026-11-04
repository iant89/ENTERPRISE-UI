import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Code Studio C7: integrated documentation (Chromium, desktop). */
test.skip(({ isMobile }) => !!isMobile, 'Desktop layout');

async function openCode(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('eui-c7-e2e')) {
      sessionStorage.setItem('eui-c7-e2e', '1');
      indexedDB.deleteDatabase('eui-studio');
      localStorage.clear();
    }
  });
  await page.goto('/studio/');
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await expect(page.getByRole('tree', { name: 'Project files' }).getByRole('treeitem', { name: 'App.tsx', exact: true })).toBeVisible();
}
const panel = (page: Page) => page.getByTestId('components-panel');
const docs = (page: Page) => page.getByTestId('docs-sidebar');
const editorLines = (page: Page) => page.locator('[data-testid="code-editor"][data-group="0"] .view-lines');
const activity = (page: Page, name: string) => page.getByRole('tab', { name, exact: true }).click();
const option = (page: Page, name: string) => panel(page).getByRole('listbox', { name: 'Project components' }).getByRole('option', { name: new RegExp(`^${name}\\b`) });
const editorFocused = (page: Page) => page.evaluate(() => !!document.activeElement?.closest('[data-testid="code-editor"]'));

async function create(page: Page, name: string, withDocs = true) {
  await activity(page, 'Components');
  await panel(page).getByRole('button', { name: 'Create component' }).click();
  const d = page.getByRole('dialog', { name: 'Create component' });
  await d.getByRole('textbox', { name: /Component name/ }).fill(name);
  if (!withDocs) await d.getByRole('checkbox', { name: /Documentation/ }).uncheck();
  await d.getByRole('button', { name: /^Create \d files$/ }).click();
  await expect(d).toBeHidden();
}
/** Paste (keyboard.insertText is typed by Monaco, so auto-close adds stray braces). */
async function replaceText(page: Page, text: string) {
  await editorLines(page).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.evaluate((t) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', t);
    document.activeElement!.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, text);
}

test('docs from Components: markdown, live example (source unchanged), search, back/forward, pin persists', async ({ page }) => {
  await openCode(page);
  await create(page, 'ExampleCard');
  const source = await editorLines(page).innerText();
  await activity(page, 'Components');
  await option(page, 'ExampleCard').click();
  await panel(page).getByRole('toolbar', { name: 'Actions for ExampleCard' }).getByRole('button', { name: 'Docs' }).click();
  await expect(docs(page).getByTestId('docs-page-title')).toHaveText('ExampleCard');
  await expect(docs(page).getByTestId('docs-breadcrumb')).toContainText('Project › components › ExampleCard');
  await expect(docs(page).getByTestId('markdown').getByRole('table')).toBeVisible();
  await expect(docs(page).getByTestId('docs-build-id')).toContainText(/@enterprise-ui\/react \d+\.\d+\.\d+ · api [0-9a-f]{8}/);

  // Live example: preview-only controls.
  const ex = page.frameLocator('iframe[title="ExampleCard example"]');
  await expect(ex.getByRole('heading', { name: 'Sample title' })).toBeVisible();
  await docs(page).getByRole('textbox', { name: 'title' }).fill('Q3 summary');
  await expect(ex.getByRole('heading', { name: 'Q3 summary' })).toBeVisible();
  await docs(page).getByRole('button', { name: 'Reset' }).click();
  await expect(ex.getByRole('heading', { name: 'Sample title' })).toBeVisible();
  expect(await editorLines(page).innerText()).toBe(source);

  // Search → library page; back/forward.
  await docs(page).getByRole('textbox', { name: 'Search docs' }).fill('button');
  await docs(page).getByTestId('docs-hit').filter({ hasText: /^Button/ }).first().click();
  await expect(docs(page).getByTestId('docs-page-title')).toHaveText('Button');
  await expect(docs(page).getByText('Triggers an action.')).toBeVisible();
  await expect(page.frameLocator('iframe[title="Button example"]').getByRole('button', { name: 'Button' })).toBeVisible();
  await docs(page).getByRole('button', { name: 'Back (Alt+Left)' }).click();
  await expect(docs(page).getByTestId('docs-page-title')).toHaveText('ExampleCard');
  await docs(page).getByRole('button', { name: 'Forward (Alt+Right)' }).focus();
  await page.keyboard.press('Alt+ArrowRight');
  await expect(docs(page).getByTestId('docs-page-title')).toHaveText('Button');

  const axe = await new AxeBuilder({ page: page as never }).include('[data-testid="docs-sidebar"]').analyze();
  expect(axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

  await docs(page).getByRole('button', { name: 'Pin Docs beside the editor' }).click();
  await expect(page.getByTestId('docs-pinned')).toBeVisible();
  await page.waitForTimeout(500);
  await page.reload();
  await page.getByRole('radio', { name: 'Code Studio' }).click().catch(() => undefined);
  await expect(page.getByTestId('docs-pinned')).toBeVisible();
  await page.getByTestId('docs-pinned').getByRole('button', { name: 'Unpin Docs' }).click();
  await expect(page.getByTestId('docs-pinned')).toHaveCount(0);
});

test('bottom tab follows the cursor with focus kept; Add documentation is one undo step; palette opens docs', async ({ page }) => {
  await openCode(page);
  await create(page, 'Bare', false);
  await activity(page, 'Explorer');
  await page.getByRole('tree', { name: 'Project files' }).getByRole('treeitem', { name: 'App.tsx', exact: true }).click();
  await replaceText(page, "import { Bare } from './components/Bare';\nimport { Button } from '@enterprise-ui/react';\n\nexport default function App() {\n  return (\n    <main>\n      <Bare title=\"Hi\" />\n      <Button>Go</Button>\n    </main>\n  );\n}\n");
  await page.getByRole('tab', { name: /^Component Docs/ }).click();
  await editorLines(page).click();
  await page.keyboard.press('ControlOrMeta+Home');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Home');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  const tab = page.getByTestId('component-docs-tab');
  await expect(tab.getByTestId('docs-page-title')).toHaveText('Bare');
  await expect(tab.getByTestId('docs-not-documented')).toBeVisible();
  expect(await editorFocused(page)).toBe(true);
  await page.keyboard.press('ArrowDown');
  await expect(tab.getByTestId('docs-page-title')).toHaveText('Button');
  expect(await editorFocused(page)).toBe(true);
  await tab.getByRole('button', { name: 'Pin component docs' }).click();
  await page.keyboard.press('ArrowUp');
  await expect(tab.getByTestId('docs-page-title')).toHaveText('Button');
  await tab.getByRole('button', { name: 'Unpin component docs' }).click();
  await editorLines(page).click();
  await page.keyboard.press('ControlOrMeta+Home');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect(tab.getByTestId('docs-page-title')).toHaveText('Bare');

  await tab.getByRole('button', { name: 'Add documentation' }).click();
  const d = page.getByRole('dialog', { name: 'Add documentation for Bare' });
  await expect(d.getByText('1 usage in App.tsx as Usage example')).toBeVisible();
  await d.getByRole('button', { name: 'Create and open' }).click();
  await expect(page.getByRole('button', { name: 'Bare.docs.md', exact: true })).toHaveAttribute('aria-current', 'true');
  await expect(editorLines(page)).toContainText('<!-- generated -->');
  await page.getByRole('button', { name: /^Undo/ }).first().click();
  await expect(page.getByRole('button', { name: 'Bare.docs.md', exact: true })).toHaveCount(0);

  // Design Studio palette → Code Studio Docs.
  await page.getByRole('radio', { name: 'Design Studio' }).click();
  await page.locator('[data-palette="Button"]').hover();
  await page.getByRole('button', { name: 'Button docs', exact: true }).click();
  await expect(page.getByTestId('docs-sidebar').getByTestId('docs-page-title')).toHaveText('Button');

  // Inspector → Docs for the selected element.
  await page.getByRole('radio', { name: 'Design Studio' }).click();
  await page.getByRole('tree', { name: 'Page outline' }).getByRole('treeitem', { name: /^Button/ }).first().click();
  await page.getByRole('group', { name: 'Element actions' }).getByRole('button', { name: 'Docs', exact: true }).click();
  await expect(page.getByTestId('docs-sidebar').getByTestId('docs-page-title')).toHaveText('Button');
});
