// Quick WCAG contrast checker for theme token pairs: node scripts/contrast.mjs
import { readFileSync } from 'node:fs';

const themes = ['light', 'dark', 'high-contrast'];
const pairs = [
  ['text', 'background', 4.5], ['text', 'surface', 4.5],
  ['text-secondary', 'surface', 4.5], ['text-secondary', 'background', 4.5],
  ['text-secondary', 'surface-hover', 4.5],
  ['on-primary', 'primary', 4.5], ['on-primary', 'primary-hover', 4.5],
  ['link', 'surface', 4.5], ['primary', 'surface-selected', 3],
  ['success-text', 'surface', 4.5], ['warning-text', 'surface', 4.5], ['error-text', 'surface', 4.5],
  ['info-text', 'surface', 4.5], ['neutral-text', 'surface', 4.5],
  ['success-text', 'success-subtle', 4.5], ['warning-text', 'warning-subtle', 4.5],
  ['error-text', 'error-subtle', 4.5], ['info-text', 'info-subtle', 4.5], ['neutral-text', 'neutral-subtle', 4.5],
  ['text', 'success-subtle', 4.5], ['text', 'warning-subtle', 4.5], ['text', 'error-subtle', 4.5], ['text', 'info-subtle', 4.5],
  ['on-success', 'success', 4.5], ['on-warning', 'warning', 4.5], ['on-error', 'error', 4.5],
  ['border-strong', 'surface', 3], ['focus', 'surface', 3], ['focus', 'background', 3],
  ['on-tooltip', 'tooltip', 4.5], ['text', 'surface-selected', 4.5], ['text', 'surface-alt', 4.5],
  ['primary', 'surface', 3], ['selected-text', 'surface-selected', 4.5], ['selected-text', 'primary-subtle', 4.5], ['selected-text', 'surface', 4.5], ['icon', 'surface', 3], ['text-placeholder', 'surface', 4.5],
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => [`accent-${n}`, 'surface', 3]),
];

const lum = (hex) => {
  const v = hex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

let failed = 0;
for (const theme of themes) {
  const css = readFileSync(new URL(`../src/themes/${theme}.css`, import.meta.url), 'utf8');
  const vars = Object.fromEntries([...css.matchAll(/--eui-color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
  for (const [fg, bg, min] of pairs) {
    if (!vars[fg] || !vars[bg]) continue;
    const r = ratio(vars[fg], vars[bg]);
    if (r < min) { failed++; console.log(`${theme}: ${fg} on ${bg} = ${r.toFixed(2)} (< ${min})`); }
  }
}
console.log(failed ? `${failed} failing pairs` : 'All contrast pairs pass');
process.exit(failed ? 1 : 0);
