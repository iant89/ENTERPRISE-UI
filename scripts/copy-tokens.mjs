// Emits dist/tokens.css: tokens + themes only, for apps that want the
// design tokens without component styles.
import { readFileSync, writeFileSync } from 'node:fs';

const files = ['tokens/tokens.css', 'themes/light.css', 'themes/dark.css', 'themes/high-contrast.css'];
const out = files.map((f) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8')).join('\n');
writeFileSync(new URL('../dist/tokens.css', import.meta.url), out);
console.log('dist/tokens.css written');
