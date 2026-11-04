import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Code Studio C3: Monaco multi-tab, split editing and navigation (Chromium, desktop). */
test.skip(({ isMobile }) => !!isMobile, 'Split editing is desktop only');

async function openCode(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('eui-c3-e2e')) {
      sessionStorage.setItem('eui-c3-e2e', '1');
      indexedDB.deleteDatabase('eui-studio');
      localStorage.clear();
    }
  });
  await page.goto('/studio/');
  await expect(files(page).getByRole('treeitem', { name: 'App.tsx', exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await expect(page.getByRole('radio', { name: 'Code Studio' })).toHaveAttribute('aria-checked', 'true');
  await expect(editorLines(page, 0)).toContainText('export default');
}
const files = (page: Page) => page.getByRole('tree', { name: 'Project files' });
const item = (page: Page, name: RegExp) => files(page).getByRole('treeitem', { name });
const editorLines = (page: Page, group: number) => page.locator(`[data-testid="code-editor"][data-group="${group}"] .view-lines`);
const strip = (page: Page, group?: number) => page.getByRole('list', { name: group === undefined ? 'Open files' : `Open files, group ${group + 1}` });
const tabNames = async (page: Page, group?: number) => (await strip(page, group).getByRole('listitem').allInnerTexts()).map((t) => t.trim());


async function newFile(page: Page, name: string, text: string) {
  await item(page, /^App\.tsx/).focus();
  await page.keyboard.press('Alt+N');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type(name);
  await page.keyboard.press('Enter');
  await expect(item(page, new RegExp(`^${name.replace('.', '\\.')}`))).toBeVisible();
  await editorLines(page, 0).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(text);
}

const CARD = 'export function Card() {\n  return null;\n}\n';
const PAGE = "import { Card } from './Card';\n\nexport default function Page() {\n  return <Card />;\n}\n";

/** Puts the cursor on the first occurrence of `word` in group `group`'s editor. */
async function cursorOn(page: Page, group: number, word: string) {
  await editorLines(page, group).getByText(word, { exact: true }).first().click();
}

test('tabs reorder by drag and by keyboard', async ({ page }) => {
  await openCode(page);
  await newFile(page, 'Card.tsx', CARD);
  await newFile(page, 'Page.tsx', PAGE);
  await expect.poll(() => tabNames(page)).toEqual(['App.tsx', 'Card.tsx', 'Page.tsx']);

  await strip(page).getByRole('button', { name: 'Page.tsx', exact: true }).dragTo(strip(page).getByRole('button', { name: 'App.tsx', exact: true }), { targetPosition: { x: 2, y: 8 } });
  await expect.poll(() => tabNames(page)).toEqual(['Page.tsx', 'App.tsx', 'Card.tsx']);

  await strip(page).getByRole('button', { name: 'Page.tsx', exact: true }).focus();
  await page.keyboard.press('ControlOrMeta+Shift+PageDown');
  await expect.poll(() => tabNames(page)).toEqual(['App.tsx', 'Page.tsx', 'Card.tsx']);
  await expect(page.getByText('Page.tsx moved to position 2.')).toBeAttached();

  // Middle-click closes.
  await strip(page).getByRole('button', { name: 'Card.tsx', exact: true }).click({ button: 'middle' });
  await expect.poll(() => tabNames(page)).toEqual(['App.tsx', 'Page.tsx']);
});

test('split with Ctrl+\\ and Ctrl+Enter from Quick Open, drag a tab across, and reload restores it', async ({ page }) => {
  await openCode(page);
  await newFile(page, 'Card.tsx', CARD);
  await newFile(page, 'Page.tsx', PAGE);
  await editorLines(page, 0).click();
  await page.keyboard.press('ControlOrMeta+\\');
  await expect(strip(page, 1)).toBeVisible();
  await expect.poll(() => tabNames(page, 1)).toEqual(['Page.tsx']);
  await expect(page.getByRole('textbox', { name: 'Code editor, src/Page.tsx, group 2', exact: true })).toBeAttached();

  // Quick Open in group 1 (focus it first), Ctrl+Enter opens App.tsx in the other group (2).
  await editorLines(page, 0).click();
  await page.keyboard.press('ControlOrMeta+P');
  await page.keyboard.type('App');
  await page.keyboard.press('ControlOrMeta+Enter');
  await expect.poll(() => tabNames(page, 1)).toEqual(['Page.tsx', 'App.tsx']);

  // Drag Card.tsx from group 1 onto group 2.
  const target = (await strip(page, 1).boundingBox())!;
  await strip(page, 0).getByRole('button', { name: 'Card.tsx', exact: true }).dragTo(strip(page, 1), { targetPosition: { x: target.width - 2, y: target.height / 2 } });
  await expect.poll(() => tabNames(page, 1)).toEqual(['Page.tsx', 'App.tsx', 'Card.tsx']);
  await expect.poll(() => tabNames(page, 0)).not.toContain('Card.tsx');

  const results = await new AxeBuilder({ page: page as never }).include('[aria-label="Editor"]').analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);

  await expect(page.getByText('Saved', { exact: true }).first()).toBeVisible();
  await page.waitForTimeout(400); // the layout write is batched (150 ms)
  const before = [await tabNames(page, 0), await tabNames(page, 1)];
  await page.reload();
  await expect(strip(page, 1)).toBeVisible();
  await expect.poll(async () => [await tabNames(page, 0), await tabNames(page, 1)]).toEqual(before);
  const keys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('eui-studio-layout:')));
  expect(keys).toEqual([]);

  // Closing a group's last tab collapses the split.
  for (const name of before[0]) {
    await strip(page, 0).getByRole('button', { name, exact: true }).focus();
    await page.keyboard.press('Delete');
  }
  await expect(strip(page, 1)).toHaveCount(0);
  await expect.poll(() => tabNames(page)).toEqual(before[1]);
});

test('F12 opens the definition in another file; Shift+F12 pins references to the References tab', async ({ page }) => {
  await openCode(page);
  await newFile(page, 'Card.tsx', CARD);
  await newFile(page, 'Page.tsx', PAGE);
  await cursorOn(page, 0, 'Card');
  await page.keyboard.press('F12');
  await expect(page.getByText('src › Card.tsx', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Code editor, src/Card.tsx', exact: true })).toBeAttached();

  // Alt+F12: the peek without leaving the file.
  await item(page, /^Page\.tsx/).click();
  await cursorOn(page, 0, 'Card');
  await page.keyboard.press('Alt+F12');
  await expect(page.locator('.peekview-widget')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.peekview-widget')).toHaveCount(0);

  await cursorOn(page, 0, 'Card');
  await page.keyboard.press('Shift+F12');
  const pin = page.getByRole('button', { name: 'Pin references to the References panel' });
  await expect(pin).toBeVisible();
  await pin.click();
  await expect(page.getByRole('tab', { name: /^References/ })).toHaveAttribute('aria-selected', 'true');
  const list = page.getByRole('list', { name: 'References to Card' });
  await expect(list).toBeVisible();
  await expect(page.getByText(/3 references to Card in 2 files/)).toBeVisible();
  await list.getByRole('button').first().focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByText('src › Page.tsx', { exact: true })).toBeVisible();
});

test('F2 renames a symbol across two files as one undo step, and can rename the file too', async ({ page }) => {
  await openCode(page);
  await newFile(page, 'Card.tsx', CARD);
  await newFile(page, 'Page.tsx', PAGE);
  await cursorOn(page, 0, 'Card');
  await page.keyboard.press('F2');
  const input = page.getByRole('textbox', { name: 'Rename Card' });
  await expect(input).toBeVisible();
  await input.fill('Tile');
  await page.keyboard.press('Enter');
  const done = page.getByRole('region', { name: 'Rename symbol' });
  await expect(done.getByText('Renamed Card to Tile')).toBeVisible();
  await expect(done.getByRole('link', { name: 'src/Card.tsx' })).toBeVisible();
  await expect(done.getByRole('link', { name: 'src/Page.tsx' })).toBeVisible();
  await expect(editorLines(page, 0)).toContainText('import { Tile }');

  await done.getByRole('button', { name: 'Undo' }).click();
  await expect(editorLines(page, 0)).toContainText('import { Card }');
  await item(page, /^Card\.tsx/).click();
  await expect(editorLines(page, 0)).toContainText('export function Card()');

  // Again, then "Also rename the file?" (C2 rename with import rewriting).
  await cursorOn(page, 0, 'Card');
  await page.keyboard.press('F2');
  await page.getByRole('textbox', { name: 'Rename Card' }).fill('Tile');
  await page.keyboard.press('Enter');
  await done.getByRole('link', { name: 'Also rename the file?' }).click();
  await expect(item(page, /^Tile\.tsx/)).toBeVisible();
  await item(page, /^Page\.tsx/).click();
  await expect(editorLines(page, 0)).toContainText("import { Tile } from './Tile'");
});

test('deleting a project leaves no layout anywhere', async ({ page }) => {
  await openCode(page);
  await newFile(page, 'Card.tsx', CARD);
  await expect(page.getByText('Saved', { exact: true }).first()).toBeVisible();
  await page.waitForTimeout(400);
  const read = () => page.evaluate(() => new Promise<{ ids: string[]; withLayout: string[] }>((resolve) => {
    const req = indexedDB.open('eui-studio');
    req.onsuccess = () => {
      const db = req.result;
      const all = db.transaction('projects').objectStore('projects').getAll();
      all.onsuccess = () => {
        const rows = (all.result as { id?: string; layout?: unknown }[]).filter((r) => typeof r.id === 'string' && r.id !== 'current');
        db.close();
        resolve({ ids: rows.map((r) => r.id!), withLayout: rows.filter((r) => r.layout).map((r) => r.id!) });
      };
    };
  }));
  const before = await read();
  expect(before.withLayout).toEqual(before.ids);
  expect(before.ids).toHaveLength(1);
  // Delete it the way storage.deleteProject does (the record carries the layout).
  await page.evaluate((id) => new Promise<void>((resolve) => {
    const req = indexedDB.open('eui-studio');
    req.onsuccess = () => { const db = req.result; const tx = db.transaction('projects', 'readwrite'); tx.objectStore('projects').delete(id); tx.oncomplete = () => { db.close(); resolve(); }; };
  }), before.ids[0]);
  expect((await read()).ids).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('eui-studio-layout:') && k !== 'eui-studio-layout:__unsaved__'))).toEqual([]);
});
