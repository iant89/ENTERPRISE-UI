import { expect, test, type Page } from '@playwright/test';
test.skip(({ isMobile }) => !!isMobile, 'Desktop layout');
const editorLines = (page: Page) => page.locator('[data-testid="code-editor"][data-group="0"] .view-lines');
const frame = (page: Page) => page.frameLocator('iframe[title="Page preview"]');
// Marker text is assembled at runtime so the editor source never contains it.
const PROBE = `
const M = ['STO', 'LEN', '-NONCE'].join('');
const real = window.parent;
let stolen: unknown = 'none';
try {
  (window as any).parent = { postMessage: (m: any, o: string) => { if (m && m.nonce) stolen = m.nonce; real.postMessage(m, o); } };
  console.log('trigger');
} catch (e) { stolen = 'err:' + (e as Error).message; }
(window as any).parent = real;
real.postMessage({ source: 'eui-preview', v: 1, type: 'console', nonce: stolen, payload: { level: 'error', args: [M], path: 'src/App.tsx', line: 1, column: 1 } }, '*');
real.postMessage({ source: 'eui-preview', v: 1, type: 'runtime-error', nonce: stolen, payload: { message: M + '-ERR', path: 'src/App.tsx', line: 1, column: 1 } }, '*');
export default function App() { return <pre id="probe">{typeof stolen === 'string' && stolen.length > 8 ? 'GOT-NONCE' : 'no-nonce:' + String(stolen)}</pre>; }
`;
test('QA: user code steals the bridge nonce by replacing window.parent', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('qa-n')) { sessionStorage.setItem('qa-n', '1'); indexedDB.deleteDatabase('eui-studio'); localStorage.clear(); } });
  await page.goto('/studio/');
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await expect(editorLines(page)).toContainText('export default');
  await editorLines(page).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(PROBE);
  await expect(frame(page).locator('#probe')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(1500);
  console.log('FRAME', await frame(page).locator('#probe').innerText());
  await page.getByRole('tablist', { name: 'Panel' }).getByRole('tab', { name: /Console/ }).click();
  const c = await page.getByRole('tabpanel', { name: /Console/ }).innerText();
  await page.getByRole('tab', { name: /^Problems/ }).click();
  const p = await page.getByRole('tabpanel', { name: /Problems/ }).innerText();
  console.log('CONSOLE has forged:', c.includes('STOLEN-NONCE'), '| PROBLEMS has forged:', p.includes('STOLEN-NONCE-ERR'));
  await page.screenshot({ path: 'test-results/qa-nonce-steal.png' });
  expect(c).not.toContain('STOLEN-NONCE');
  expect(p).not.toContain('STOLEN-NONCE-ERR');
});
