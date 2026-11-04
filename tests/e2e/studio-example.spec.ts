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

// C4 review follow-ups (3): layout persistence for saved projects and across a project switch.
async function toCode(page: Page) {
  const radio = page.getByRole('radio', { name: 'Code Studio' });
  if ((await radio.getAttribute('aria-checked')) !== 'true') await radio.click();
  await expect(page.getByTestId('preview-size')).toBeVisible();
}
async function setSize(page: Page, w: string, h: string) {
  await page.getByTestId('preview-size').click();
  const dialog = page.getByRole('dialog', { name: 'Custom size' });
  await dialog.getByLabel('Width').fill(w);
  await dialog.getByLabel('Height').fill(h);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('preview-size')).toContainText(`${w} × ${h}`);
}
const storedLayout = (page: Page, id: string) => page.evaluate((key) => new Promise<unknown>((res) => {
  const q = indexedDB.open('eui-studio'); q.onsuccess = () => { const g = q.result.transaction('projects').objectStore('projects').get(key); g.onsuccess = () => { q.result.close(); res((g.result as { layout?: unknown } | undefined)?.layout); }; };
}), id);

test('a saved project keeps its custom preview size across a reload', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'Desktop layout');
  await seed(page);
  await page.goto('/studio/');
  await toCode(page);
  await setSize(page, '800', '600');
  await expect.poll(async () => JSON.stringify(await storedLayout(page, 'mine-1'))).toContain('800');
  await page.reload();
  await toCode(page);
  await expect(page.getByTestId('preview-size')).toContainText('800 × 600');
});

test('switching projects while a layout save is pending keeps each project its own layout', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'Desktop layout');
  await seed(page);
  await page.goto('/studio/');
  await toCode(page);
  await setSize(page, '800', '600');
  await expect.poll(async () => JSON.stringify(await storedLayout(page, 'mine-1'))).toContain('800');
  await page.goto('/#/components/badge');
  await page.getByRole('button', { name: 'Open in Studio' }).first().click();
  await toCode(page);
  await setSize(page, '900', '700');
  // Switch at once, inside the 150 ms layout-save window.
  await page.getByRole('button', { name: 'Back to my project' }).click();
  await expect(preview(page).getByRole('heading', { name: 'MY WORK' })).toBeVisible();
  await toCode(page);
  await expect(page.getByTestId('preview-size')).toContainText('800 × 600');
  await page.waitForTimeout(400);
  expect(JSON.stringify(await storedLayout(page, 'mine-1'))).not.toContain('900');
  await page.reload();
  await toCode(page);
  await expect(page.getByTestId('preview-size')).toContainText('800 × 600');
});
