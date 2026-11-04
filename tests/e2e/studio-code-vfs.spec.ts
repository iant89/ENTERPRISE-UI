import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Code Studio C2: multi-file VFS in the Explorer. */
async function openStudio(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('eui-vfs-e2e')) {
      sessionStorage.setItem('eui-vfs-e2e', '1');
      indexedDB.deleteDatabase('eui-studio');
      localStorage.clear();
    }
  });
  await page.goto('/studio/');
  await expect(files(page).getByRole('treeitem', { name: 'App.tsx', exact: true })).toBeVisible();
  await expect(frame(page).getByRole('heading', { name: 'My application' })).toBeVisible();
}
const files = (page: Page) => page.getByRole('tree', { name: 'Project files' });
const item = (page: Page, name: RegExp) => files(page).getByRole('treeitem', { name });
const frame = (page: Page) => page.frameLocator('iframe[title="Page preview"]');
const lines = (page: Page) => page.locator('[data-testid="code-editor"] .view-lines');

async function toCode(page: Page) {
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await expect(page.getByRole('radio', { name: 'Code Studio' })).toHaveAttribute('aria-checked', 'true');
}

async function newFile(page: Page, name: string, at = /^App\.tsx/) {
  await item(page, at).focus();
  await page.keyboard.press('Alt+N');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type(name);
  await page.keyboard.press('Enter');
}

test('creates an empty folder, then a file in it', async ({ page }) => {
  await openStudio(page);
  await item(page, /^App\.tsx/).focus();
  await page.keyboard.press('Alt+Shift+N');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('widgets');
  await page.keyboard.press('Enter');
  await expect(item(page, /^widgets/)).toBeVisible();
  await newFile(page, 'Badge.tsx', /^widgets/);
  await expect(item(page, /^Badge\.tsx/)).toBeVisible();
  const results = await new AxeBuilder({ page: page as never }).include('[aria-label="Project files"]').analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});

test('rename updates the importer, the preview still renders, and undo restores it', async ({ page }) => {
  // The preview renders the entry file only until the C4 compiler bundles imports, so the importer here is a second file.
  await openStudio(page);
  await newFile(page, 'Hello.tsx');
  await newFile(page, 'Page.tsx');
  await item(page, /^Page\.tsx/).click();
  await lines(page).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText("import Hello from './Hello';\n\nexport default function Page() {\n  return <Hello />;\n}\n");
  await expect(lines(page)).toContainText("from './Hello'");

  await item(page, /^Hello\.tsx/).focus();
  await page.keyboard.press('F2');
  await page.keyboard.type('Greeting');
  await page.keyboard.press('Enter');
  await expect(item(page, /^Greeting\.tsx/)).toBeVisible();
  await item(page, /^Page\.tsx/).click();
  await expect(lines(page)).toContainText("from './Greeting'");
  await expect(frame(page).getByRole('heading', { name: 'My application' })).toBeVisible();

  await page.getByRole('button', { name: 'Undo' }).first().click();
  await expect(item(page, /^Hello\.tsx/)).toBeVisible();
  await item(page, /^Page\.tsx/).click();
  await expect(lines(page)).toContainText("from './Hello'");
});

test('drags a file into a folder and duplicates a file', async ({ page }) => {
  await openStudio(page);
  await newFile(page, 'parts/Box.tsx');
  await newFile(page, 'Card.tsx');
  await item(page, /^Card\.tsx/).locator('> div').dragTo(item(page, /^parts/).locator('> div').first());
  await expect(page.getByText('Moved Card.tsx to src/parts.').first()).toBeVisible();
  await item(page, /^Box\.tsx/).locator('> div').click({ button: 'right' });
  await page.getByRole('menuitem', { name: /Duplicate/ }).click();
  await expect(item(page, /^Box-copy\.tsx/)).toBeVisible();
});

test('non-empty folder delete: cancel keeps it, confirm names the file count and deletes', async ({ page }) => {
  await openStudio(page);
  await newFile(page, 'parts/A.tsx');
  await newFile(page, 'parts/B.tsx');
  await item(page, /^parts/).focus();
  await page.keyboard.press('Delete');
  const dialog = page.getByRole('alertdialog', { name: 'Delete folder parts?' });
  await expect(dialog).toContainText('2 files');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(item(page, /^A\.tsx/)).toBeVisible();
  await item(page, /^parts/).focus();
  await page.keyboard.press('Delete');
  await dialog.getByRole('button', { name: 'Delete' }).click();
  await expect(item(page, /^parts/)).toHaveCount(0);
});

test('reload restores the files and leaves no stray layout keys', async ({ page }) => {
  await openStudio(page);
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await page.reload(); // fresh starter, never saved: only the unsaved layout key
  await expect(page.getByRole('radio', { name: 'Code Studio' })).toHaveAttribute('aria-checked', 'true');
  const keys = () => page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('eui-studio-layout:')).sort());
  expect(await keys()).toEqual(['eui-studio-layout:__unsaved__']);

  await newFile(page, 'Kept.tsx');
  await expect(page.getByText('Saved', { exact: true }).first()).toBeVisible();
  // C3: the first real save moves the layout onto the project record, so no layout key is left.
  await expect.poll(keys).toEqual([]);
  await page.reload();
  await expect(item(page, /^Kept\.tsx/)).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Code Studio' })).toHaveAttribute('aria-checked', 'true');
  expect(await keys()).toEqual([]);
});

test('search finds matches across files and opens the line', async ({ page }) => {
  await openStudio(page);
  await toCode(page);
  await newFile(page, 'Hello.tsx');
  await page.getByRole('tab', { name: 'Search', exact: true }).click();
  const box = page.getByPlaceholder('Search', { exact: true });
  await box.fill('export default');
  await expect(page.getByRole('status').filter({ hasText: /results? in \d+ files?/ })).toBeVisible();
  await page.getByRole('region', { name: 'Search results' }).getByRole('button', { name: /function Hello\(\)/ }).click();
  await expect(page.getByText('src › Hello.tsx', { exact: true })).toBeVisible();
  await expect(page.getByText(/^Ln 3, Col/)).toBeVisible();
  await page.getByRole('button', { name: 'Use regular expression' }).click();
  await box.fill('(');
  await expect(page.getByText(/invalid|unterminated|regular expression/i).first()).toBeVisible();
  const results = await new AxeBuilder({ page: page as never }).include('[aria-label="Search results"]').analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});

test('Quick Open lists recent files and opens a fuzzy match', async ({ page }) => {
  await openStudio(page);
  await toCode(page);
  await newFile(page, 'Orders.tsx');
  await item(page, /^App\.tsx/).click();
  await page.keyboard.press('ControlOrMeta+P');
  const dialog = page.getByRole('dialog', { name: 'Quick Open' });
  await expect(dialog.getByRole('listbox', { name: 'Recently opened' })).toBeVisible();
  await page.keyboard.type('ord');
  await expect(dialog.getByRole('option').first()).toContainText('Orders.tsx');
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(page.getByText('src › Orders.tsx', { exact: true })).toBeVisible();
});

test('rename shows the import feedback strip with undo', async ({ page }) => {
  await openStudio(page);
  await toCode(page);
  await newFile(page, 'Hello.tsx');
  await newFile(page, 'Page.tsx');
  await item(page, /^Page\.tsx/).click();
  await lines(page).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText("import Hello from './Hello';\nexport default function Page() { return <Hello />; }\n");
  await item(page, /^Hello\.tsx/).focus();
  await page.keyboard.press('F2');
  await page.keyboard.type('Greeting');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Renamed Hello.tsx to Greeting.tsx')).toBeVisible();
  const strip = page.getByRole('region', { name: 'File changes' });
  await strip.getByRole('button', { name: 'Show changes' }).click();
  await expect(strip.getByRole('link', { name: 'src/Page.tsx' })).toBeVisible();
  await strip.getByRole('button', { name: 'Undo' }).click();
  await expect(item(page, /^Hello\.tsx/)).toBeVisible();
});
