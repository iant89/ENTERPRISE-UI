import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export const pages = ['/', '/getting-started', '/tokens', '/themes', '/components', '/gallery', '/layouts', '/patterns', '/accessibility', '/api'];

export async function open(page: Page, path: string, theme = 'light', density = 'cozy') {
  await page.addInitScript(
    ([t, d]) => {
      localStorage.setItem('eui-docs-theme', t);
      localStorage.setItem('eui-docs-density', d);
    },
    [theme, density],
  );
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto(`/#${path}`);
  await expect(page.locator('h1').first()).toBeVisible();
  return errors;
}

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
/** Page-structure rules that do not apply to embedded examples (which may render their own app shell). */
const STRUCTURE_RULES = ['region', 'landmark-unique', 'landmark-no-duplicate-main', 'landmark-main-is-top-level', 'landmark-one-main', 'landmark-no-duplicate-banner', 'landmark-banner-is-top-level', 'heading-order', 'page-has-heading-one'];

const format = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.slice(0, 5).map((n) => `${n.target.join(' ')} — ${n.failureSummary?.split('\n')[1] ?? ''}`).join('\n    ')}`);

/**
 * Runs axe with WCAG 2.2 A/AA rules (including color contrast).
 * The documentation page is checked with all rules; embedded examples are
 * checked with every rule except page-structure rules.
 */
export async function axe(page: Page) {
  const embeddedCount = await page.locator('[data-example], [data-embedded-app]').count();
  // Embedded examples may render their own <main> or breadcrumb landmarks; the demo route checks a real app instead.
  const docs = await new AxeBuilder({ page: page as never })
    .withTags(TAGS)
    .exclude('[data-example]')
    .exclude('[data-embedded-app]')
    .disableRules(embeddedCount ? ['landmark-unique', 'landmark-no-duplicate-main'] : [])
    .analyze();
  let embedded = new AxeBuilder({ page: page as never }).withTags(TAGS).disableRules(STRUCTURE_RULES);
  let hasEmbedded = false;
  for (const selector of ['[data-example]', '[data-embedded-app]']) {
    if ((await page.locator(selector).count()) > 0) {
      embedded = embedded.include(selector);
      hasEmbedded = true;
    }
  }
  const examples = hasEmbedded ? (await embedded.analyze()).violations : [];
  return [...format(docs.violations), ...format(examples)];
}
