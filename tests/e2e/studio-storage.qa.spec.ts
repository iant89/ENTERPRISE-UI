// QA (PR #26): storage data-loss regressions and file-tree gaps.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

type Rec = Record<string, unknown>;
const MINE = { id: 'mine-1', name: 'Mine', files: { 'src/App.tsx': "import { Title } from '@enterprise-ui/react';\nexport default function App() { return <Title>MY WORK</Title>; }\n" }, entry: 'src/App.tsx', createdAt: 1, updatedAt: 1 };

async function seed(page: Page, records: Rec[], lastOpened = 'mine-1') {
  await page.goto('/');
  await page.evaluate(async ({ records, lastOpened }) => {
    await new Promise<void>((res) => { const d = indexedDB.deleteDatabase('eui-studio'); d.onsuccess = d.onerror = d.onblocked = () => res(); });
    await new Promise<void>((res, rej) => {
      const q = indexedDB.open('eui-studio', 2);
      q.onupgradeneeded = () => { q.result.createObjectStore('projects'); q.result.createObjectStore('meta'); };
      q.onerror = () => rej(q.error);
      q.onsuccess = () => {
        const tx = q.result.transaction(['projects', 'meta'], 'readwrite');
        for (const r of records) tx.objectStore('projects').put(r, r.id as string);
        tx.objectStore('meta').put(lastOpened, 'lastOpened');
        tx.oncomplete = () => { q.result.close(); res(); };
      };
    });
  }, { records, lastOpened });
}
const stored = (page: Page, id: string) => page.evaluate((id) => new Promise<Rec | undefined>((res) => {
  const q = indexedDB.open('eui-studio');
  q.onsuccess = () => { const g = q.result.transaction('projects').objectStore('projects').get(id); g.onsuccess = () => { q.result.close(); res(g.result); }; };
}), id);
const settle = (page: Page) => page.waitForTimeout(1500); // > 400 ms autosave debounce

test.describe('REGRESSION data-loss risk 1: autosave after a failed/unreadable load', () => {
  test('a saved record Studio cannot read is not overwritten by the starter page', async ({ page }) => {
    const unreadable = { ...MINE, files: { 'src/Page.tsx': 'MY WORK' }, entry: 'src/App.tsx' };
    await seed(page, [unreadable]);
    await page.goto('/studio/');
    await expect(page.frameLocator('iframe[title="Page preview"]').locator('body')).toBeVisible();
    await settle(page);
    expect((await stored(page, 'mine-1'))?.files).toEqual({ 'src/Page.tsx': 'MY WORK' });
  });
  test('a load that throws does not let autosave replace the stored project', async ({ page }) => {
    await seed(page, [MINE]);
    await page.addInitScript(() => {
      const open = indexedDB.open.bind(indexedDB);
      let calls = 0;
      // First open (the initial load) fails; later opens (autosave) work.
      indexedDB.open = ((...a: Parameters<IDBFactory['open']>) => { if (++calls === 1) throw new Error('simulated read failure'); return open(...a); }) as IDBFactory['open'];
    });
    await page.goto('/studio/');
    await settle(page);
    expect((await stored(page, 'mine-1'))?.files).toEqual(MINE.files);
  });
  test('EXPLORATORY: opening a docs example ("Open in Studio") does not silently replace the saved project', async ({ page }) => {
    await seed(page, [MINE]);
    await page.goto('/#/components/badge');
    await page.getByRole('button', { name: 'Open in Studio' }).first().click();
    await expect(page).toHaveURL(/\/studio\/$/);
    await settle(page);
    const all = await page.evaluate(() => new Promise<unknown[]>((res) => { const q = indexedDB.open('eui-studio'); q.onsuccess = () => { const g = q.result.transaction('projects').objectStore('projects').getAll(); g.onsuccess = () => { q.result.close(); res(g.result); }; }; }));
    expect(JSON.stringify(all)).toContain('MY WORK');
  });
  test('control: a healthy saved project loads and survives autosave', async ({ page }) => {
    await seed(page, [MINE]);
    await page.goto('/studio/');
    await expect(page.frameLocator('iframe[title="Page preview"]').getByRole('heading', { name: 'MY WORK' })).toBeVisible();
    await settle(page);
    expect((await stored(page, 'mine-1'))?.files).toEqual(MINE.files);
  });
});

test.describe('file tree QA gaps', () => {
  const files = (page: Page) => page.getByRole('tree', { name: 'Project files' });
  test('select: clicking a file opens it; multi-file project and active file survive reload', async ({ page }) => {
    await seed(page, [{ ...MINE, files: { ...MINE.files, 'src/Header.tsx': 'export const HEADER_MARK = 1;\n' } }]);
    await page.goto('/studio/');
    const header = files(page).getByRole('treeitem', { name: /^Header\.tsx/ });
    await header.click();
    await expect(header).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-testid="code-editor"] .view-lines')).toContainText('HEADER_MARK');
    await settle(page);
    await page.reload();
    await expect(files(page).getByRole('treeitem', { name: /^Header\.tsx/ })).toBeVisible();
    expect(Object.keys((await stored(page, 'mine-1'))?.files as Rec).sort()).toEqual(['src/App.tsx', 'src/Header.tsx']);
  });
  test('axe: no violations with the rename field and context menu open', async ({ page }) => {
    await seed(page, [MINE]);
    await page.goto('/studio/');
    const app = files(page).getByRole('treeitem', { name: /^App\.tsx/ });
    await app.focus();
    await page.keyboard.press('Shift+F10');
    await expect(page.getByRole('menu')).toBeVisible();
    let r = await new AxeBuilder({ page }).include('[role="tree"]').include('[role="menu"]').analyze();
    expect(r.violations.map((v) => v.id)).toEqual([]);
    await page.keyboard.press('Escape');
    await app.focus();
    await page.keyboard.press('F2');
    await expect(page.getByRole('textbox').first()).toBeFocused();
    r = await new AxeBuilder({ page }).include('[role="tree"]').analyze();
    expect(r.violations.map((v) => v.id)).toEqual([]);
  });
});
