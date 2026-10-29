// Post-processes the library build:
// - dist/tokens.css: tokens + themes only, for apps that want the design tokens without component styles
// - type stubs so `import '@enterprise-ui/react/styles.css'` type-checks without CSS module declarations
// - removes the stylesheet side-effect import from the public declarations
import { readFileSync, writeFileSync } from 'node:fs';

const src = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
const dist = (f) => new URL(`../dist/${f}`, import.meta.url);

const tokens = ['tokens/tokens.css', 'themes/light.css', 'themes/dark.css', 'themes/high-contrast.css'].map(src).join('\n');
writeFileSync(dist('tokens.css'), tokens);

const stub = '// Stylesheet entry point. Import for its side effects.\nexport {};\n';
writeFileSync(dist('styles.css.d.ts'), stub);
writeFileSync(dist('tokens.css.d.ts'), stub);

const indexTypes = dist('types/index.d.ts');
writeFileSync(indexTypes, readFileSync(indexTypes, 'utf8').replace(/^import '\.\/styles\/index\.css';\n/m, ''));

console.log('postbuild: tokens.css, stylesheet type stubs, declarations cleaned');
