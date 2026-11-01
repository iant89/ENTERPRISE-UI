// Review #26 round 4: editing a docs example must never hide the user's own project.
import { expect, test, type Page } from '@playwright/test';

const MINE = { id: 'mine-1', name: 'My application', files: { 'src/App.tsx': "import { Title } from '@enterprise-ui/react';\nexport default function App() { return <Title>MY WORK</Title>; }\n" }, entry: 'src/App.tsx', createdAt: 1, updatedAt: 1 };

async function seed(page: Page) {
  await page.goto('/');
  await page.evaluate(async (mine) => {
    await new Promise<void>((res) => { const d = indexedDB.deleteDatabase('eui-studio'); d.onsuccess = d.onerror = d.onblocked = () => res(); });
    await new Promise<void>((res, rej) => {
      const q = indexedDB.open('eui-studio', 2);
      q.onupgradeneeded = () => { q.result.createObjectStore('projects'); q.result.createObjectStore('meta'); };
      q.onerror = () => rej(q.error);
      q.onsuccess = () => {
        const tx = q.result.transaction(['projects', 'meta'], 'readwrite');
        tx.objectStore('projects').put(mine, mine.id);
        tx.objectStore('meta').put(mine.id, 'lastOpened');
        tx.oncomplete = () => { q.result.close(); res(); };
      };
    });
  }, MINE);
}
const preview = (page: Page) => page.frameLocator('iframe[title="Page preview"]');

test('editing a docs example, then reloading, brings back the user project', async ({ page }) => {
  await seed(page);
  await page.goto('/#/components/badge');
  await page.getByRole('button', { name: 'Open in Studio' }).first().click();
  await expect(page).toHaveURL(/\/studio\/$/);
  await expect(page.getByText('Example from the docs').first()).toBeVisible();
  // Edit the example (Code view, replace the page) and let autosave run.
  await page.getByRole('group', { name: 'Editor view' }).getByRole('button', { name: 'Code', exact: true }).click();
  const lines = page.locator('[data-testid="code-editor"] .view-lines');
  await lines.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText("export default function App() { return <h2>EXAMPLE EDIT</h2>; }\n");
  await page.waitForTimeout(1500);
  await page.reload();
  await expect(preview(page).getByRole('heading', { name: 'MY WORK' })).toBeVisible();
  // The edited example was kept as its own project.
  const all = await page.evaluate(() => new Promise<{ name: string }[]>((res) => { const q = indexedDB.open('eui-studio'); q.onsuccess = () => { const g = q.result.transaction('projects').objectStore('projects').getAll(); g.onsuccess = () => { q.result.close(); res(g.result); }; }; }));
  expect(all.map((p) => p.name).sort()).toEqual(['Example from the docs', 'My application']);
});

test('"Back to my project" leaves the example without a reload', async ({ page }) => {
  await seed(page);
  await page.goto('/#/components/badge');
  await page.getByRole('button', { name: 'Open in Studio' }).first().click();
  await page.getByRole('button', { name: 'Back to my project' }).click();
  await expect(preview(page).getByRole('heading', { name: 'MY WORK' })).toBeVisible();
  await expect(page.getByText('This example is a separate project')).toHaveCount(0);
});
