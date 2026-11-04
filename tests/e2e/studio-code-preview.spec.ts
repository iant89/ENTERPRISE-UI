import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Code Studio C4: multi-file preview, diagnostics, console and custom size (Chromium, desktop). */
test.skip(({ isMobile }) => !!isMobile, 'Desktop layout');

async function openCode(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('eui-c4-e2e')) {
      sessionStorage.setItem('eui-c4-e2e', '1');
      indexedDB.deleteDatabase('eui-studio');
      localStorage.clear();
    }
  });
  await page.goto('/studio/');
  await expect(files(page).getByRole('treeitem', { name: 'App.tsx', exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await expect(editorLines(page)).toContainText('export default');
}
const files = (page: Page) => page.getByRole('tree', { name: 'Project files' });
const item = (page: Page, name: RegExp) => files(page).getByRole('treeitem', { name });
const editorLines = (page: Page) => page.locator('[data-testid="code-editor"][data-group="0"] .view-lines');
const frame = (page: Page) => page.frameLocator('iframe[title="Page preview"]');
const preview = (page: Page) => page.getByRole('region', { name: 'Preview' });
const bottomTab = (page: Page, name: RegExp) => page.getByRole('tablist', { name: 'Panel' }).getByRole('tab', { name });

async function replaceText(page: Page, text: string) {
  await editorLines(page).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(text);
}
async function newFile(page: Page, name: string, text: string) {
  await item(page, /^App\.tsx/).focus();
  await page.keyboard.press('Alt+N');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type(name);
  await page.keyboard.press('Enter');
  await expect(item(page, new RegExp(`^${name.replace('.', '\\.')}`))).toBeVisible();
  await replaceText(page, text);
}
const openTab = (page: Page, name: string) => page.getByRole('list', { name: 'Open files' }).getByRole('button', { name, exact: true }).click();

const GREETING = (word: string) => `import './greeting.css';\nexport function Greeting() {\n  console.log('greeting rendered');\n  return <p className="greeting">${word} from Greeting</p>;\n}\n`;
const APP = "import { Greeting } from './Greeting';\n\nexport default function App() {\n  return <main><h1>Multi-file</h1><Greeting /></main>;\n}\n";

test('multi-file project renders, edits update, syntax errors go stale and console links open the file', async ({ page }) => {
  await openCode(page);
  await newFile(page, 'greeting.css', '.greeting { color: rgb(200, 0, 0); }\n');
  await newFile(page, 'Greeting.tsx', GREETING('Hello'));
  await openTab(page, 'App.tsx');
  await replaceText(page, APP);

  const greeting = frame(page).locator('.greeting');
  await expect(greeting).toHaveText('Hello from Greeting');
  await expect(greeting).toHaveCSS('color', 'rgb(200, 0, 0)');
  await expect(preview(page)).toHaveAttribute('data-state', 'live');

  // Editing the imported file updates the preview.
  await openTab(page, 'Greeting.tsx');
  await replaceText(page, GREETING('Howdy'));
  await expect(greeting).toHaveText('Howdy from Greeting');

  // Console output with a source link.
  await bottomTab(page, /^Console/).click();
  const entry = page.getByTestId('console-entry').filter({ hasText: 'greeting rendered' }).first();
  await expect(entry).toBeVisible();
  await expect(bottomTab(page, /^Console/)).toHaveText(/Console \(\d+\)/);
  await openTab(page, 'App.tsx');
  await entry.getByRole('link', { name: /Greeting\.tsx:3/ }).click();
  await expect(page.getByRole('list', { name: 'Open files' }).getByRole('button', { name: 'Greeting.tsx', exact: true })).toHaveAttribute('aria-current', /.+/);

  // Syntax error: the last good preview stays, stale, Problems lists it, Go to error lands on it.
  await replaceText(page, GREETING('Broken').replace('</p>;', '</p'));
  await expect(preview(page)).toHaveAttribute('data-state', 'stale');
  await expect(page.getByTestId('preview-frame-box')).toHaveClass(/staleFrame/);
  await expect(greeting).toHaveText('Howdy from Greeting');
  await expect(bottomTab(page, /^Problems/)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('problem').first()).toContainText('Greeting.tsx');
  await openTab(page, 'App.tsx');
  await preview(page).getByRole('button', { name: 'Go to error' }).click();
  await expect(editorLines(page)).toContainText('Broken from Greeting');

  // Unresolved import shows a clear diagnostic.
  await replaceText(page, "import './missing';\n" + GREETING('Fixed'));
  await expect(page.getByTestId('problem').first()).toContainText("Cannot resolve import './missing'");
  // Fixing returns to Live.
  await replaceText(page, GREETING('Fixed'));
  await expect(preview(page)).toHaveAttribute('data-state', 'live');
  await expect(greeting).toHaveText('Fixed from Greeting');

  const results = await new AxeBuilder({ page: page as never }).include('[aria-label="Preview"]').include('#bottom-panel').analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});

test('custom preview size: Enter applies, Esc cancels, limits enforced, persists across reload', async ({ page }) => {
  await openCode(page);
  const label = page.getByTestId('preview-size');
  await expect(label).toContainText('1280 × 800');

  await label.click();
  const dialog = page.getByRole('dialog', { name: 'Custom size' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Width').fill('100');
  await dialog.getByLabel('Height').click();
  await expect(dialog.getByText('Width must be 320–3840 px.')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Apply' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(label).toBeFocused();
  await expect(label).toContainText('1280 × 800');

  await label.click();
  await dialog.getByLabel('Width').fill('800');
  await dialog.getByLabel('Height').fill('600');
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(label).toContainText('800 × 600');
  await expect(label).toBeFocused();

  // Persisted per project in the layout (the unsaved starter's layout key here; saved projects use the record).
  await page.waitForTimeout(500);
  await page.reload();
  await page.getByRole('radio', { name: 'Code Studio' }).click().catch(() => undefined);
  await expect(page.getByTestId('preview-size')).toContainText('800 × 600');
});

test('custom size popover shows the current Width and Height unclipped at a 1024 px window', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 640 });
  await openCode(page);
  await page.getByTestId('preview-size').click();
  const dialog = page.getByRole('dialog', { name: 'Custom size' });
  for (const [name, value] of [['Width', '1280'], ['Height', '800']] as const) {
    const input = dialog.getByLabel(name);
    await expect(input).toHaveValue(value);
    // The digits must fit: the field used to collapse to 0 px of content beside the steppers.
    const fits = await input.evaluate((e: HTMLInputElement) => e.clientWidth >= 30 && e.scrollWidth <= e.clientWidth);
    expect(fits).toBe(true);
  }
});
