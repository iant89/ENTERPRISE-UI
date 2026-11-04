import { expect, test, type Page } from '@playwright/test';
test.skip(({ isMobile }) => !!isMobile, 'Desktop layout');
const files = (page: Page) => page.getByRole('tree', { name: 'Project files' });
const editorLines = (page: Page) => page.locator('[data-testid="code-editor"][data-group="0"] .view-lines');
const frame = (page: Page) => page.frameLocator('iframe[title="Page preview"]');

const PROBE = `
const r: Record<string, string> = {};
const t = (k: string, f: () => unknown) => { try { r[k] = 'ALLOWED:' + String(f()); } catch (e) { r[k] = 'blocked:' + (e as Error).name; } };
t('origin', () => window.origin);
t('parentDoc', () => window.parent.document.title);
t('topDoc', () => window.top!.document.body.innerHTML.length);
t('parentWrite', () => { (window.parent as any).document.body.dataset.pwned = '1'; return 'wrote'; });
t('parentFn', () => (window.parent as any).alert.call(window.parent, 'x'));
t('parentGlobalSet', () => { (window.parent as any).__pwned = 1; return 'set'; });
t('topHref', () => window.top!.location.href);
t('localStorage', () => localStorage.getItem('qa-secret'));
t('sessionStorage', () => sessionStorage.length);
t('cookie', () => document.cookie);
t('indexedDB', () => { const q = indexedDB.open('eui-studio'); return typeof q; });
t('topNav', () => { window.top!.location.href = 'https://example.com/pwned'; return 'assigned'; });
t('forgeConsole', () => { window.parent.postMessage({ source: 'eui-preview', v: 1, type: 'console', payload: { level: 'error', args: ['FORGED-FROM-USER-CODE'], path: 'src/App.tsx', line: 1, column: 1 } }, '*'); return 'sent'; });
t('forgeError', () => { window.parent.postMessage({ source: 'eui-preview', v: 1, type: 'runtime-error', payload: { message: 'FORGED-ERROR', path: 'src/App.tsx', line: 1, column: 1 } }, '*'); return 'sent'; });
t('forgeBad', () => { window.parent.postMessage({ source: 'eui-preview', v: 1, type: 'evil', payload: {} }, '*'); window.parent.postMessage({ source: 'eui-preview', v: 1, type: 'console', payload: { level: 'error', args: [1] } }, '*'); return 'sent'; });
export default function App() { return <pre id="probe">{JSON.stringify(r)}</pre>; }
`;

test('QA: preview iframe isolation probe', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('qa-iso')) { sessionStorage.setItem('qa-iso', '1'); indexedDB.deleteDatabase('eui-studio'); localStorage.clear(); }
    localStorage.setItem('qa-secret', 'TOPSECRET');
    document.cookie = 'qa=cookie';
  });
  page.on('dialog', (d) => { console.log('DIALOG', d.message()); void d.dismiss(); });
  await page.goto('/studio/');
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await expect(editorLines(page)).toContainText('export default');
  const url0 = page.url();
  await editorLines(page).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(PROBE);
  const pre = frame(page).locator('#probe');
  await expect(pre).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(2000);
  const res = JSON.parse(await pre.innerText());
  console.log('PROBE', JSON.stringify(res, null, 1));
  const iframe = page.locator('iframe[title="Page preview"]');
  console.log('SANDBOX', await iframe.getAttribute('sandbox'), 'SRC', await iframe.getAttribute('src'), 'ALLOW', await iframe.getAttribute('allow'));
  console.log('PARENT url after', page.url(), 'same', page.url() === url0);
  console.log('PARENT pwned', await page.evaluate(() => [document.body.dataset.pwned ?? null, (window as any).__pwned ?? null]));
  const body = await page.locator('body').innerText();
  console.log('FORGED console shown in parent:', body.includes('FORGED-FROM-USER-CODE'), 'FORGED error shown:', body.includes('FORGED-ERROR'));
  await page.getByRole('tablist', { name: 'Panel' }).getByRole('tab', { name: /Console/ }).click().catch(() => {});
  await page.waitForTimeout(500);
  const body2 = await page.locator('body').innerText();
  console.log('after Console tab, FORGED console shown:', body2.includes('FORGED-FROM-USER-CODE'), 'FORGED error:', body2.includes('FORGED-ERROR'));
  await page.screenshot({ path: 'test-results/qa-isolation.png' });
  expect(page.url()).toBe(url0);
  for (const k of ['parentDoc', 'topDoc', 'parentWrite', 'parentFn', 'parentGlobalSet', 'topHref', 'localStorage', 'cookie', 'indexedDB']) expect(res[k], k).toMatch(/^blocked/);
});
