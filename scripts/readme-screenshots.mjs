/* global document */
// Regenerates the README screenshots in docs/screenshots/.
// Start the docs first: npm run build:docs && npm run preview -- --port 4173
// Then run: npm run docs:screenshots
import { chromium } from '@playwright/test';

const base = process.env.DOCS_URL ?? 'http://localhost:4173';
const out = new URL('../docs/screenshots/', import.meta.url).pathname;
const browser = await chromium.launch();

async function open(path, { theme = 'light', width = 1280, height = 800 } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  await page.addInitScript((t) => localStorage.setItem('eui-docs-theme', t), theme);
  await page.goto(`${base}/#${path}`);
  await page.locator('h1').first().waitFor();
  return page;
}

async function shot(name, path, options, capture = (page) => page.screenshot({ path: `${out}${name}.png` })) {
  const page = await open(path, options);
  await capture(page);
  await page.close();
  console.log(`docs/screenshots/${name}.png`);
}

await shot('demo-app', '/demo');
await shot('demo-app-dark', '/demo', { theme: 'dark' });
await shot('demo-app-mobile', '/demo', { width: 390, height: 844 });
await shot('themes', '/themes', { height: 1000 }, (page) => page.locator('#themes-compare + div').screenshot({ path: `${out}themes.png` }));
await shot('component-page', '/components/button', {}, async (page) => {
  await page.evaluate(() => {
    document.getElementById('main-content').scrollTop = document.getElementById('playground').offsetTop - 24;
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}component-page.png` });
});
await shot('object-page', '/components/object-page', { height: 1100 }, async (page) => {
  await page.locator('[data-example] > div').first().evaluate((el) => (el.style.height = '520px'));
  await page.locator('[data-example]').first().screenshot({ path: `${out}object-page.png` });
});

await browser.close();
