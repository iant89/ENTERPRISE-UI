import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { axe, open, pages } from './helpers';

const registry = readFileSync(new URL('../../docs/src/registry.ts', import.meta.url), 'utf8');
const slugs = [...registry.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);

test.describe('documentation pages render without errors and pass axe', () => {
  for (const path of pages) {
    test(`page ${path}`, async ({ page }) => {
      const errors = await open(page, path);
      expect(await axe(page)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  for (const slug of slugs) {
    test(`component ${slug}`, async ({ page }) => {
      const errors = await open(page, `/components/${slug}`);
      expect(await axe(page)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});

test.describe('themes meet contrast requirements', () => {
  for (const theme of ['dark', 'high-contrast']) {
    for (const path of ['/gallery', '/components/data-grid', '/components/input', '/components/status-indicator', '/']) {
      test(`${theme} ${path}`, async ({ page }) => {
        await open(page, path, theme);
        expect(await axe(page)).toEqual([]);
      });
    }
  }
});

test('full demo application passes axe with all rules', async ({ page }) => {
  await page.goto('/#/demo');
  await page.getByRole('heading', { level: 1, name: 'Products' }).waitFor();
  const AxeBuilder = (await import('@axe-core/playwright')).default;
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});
