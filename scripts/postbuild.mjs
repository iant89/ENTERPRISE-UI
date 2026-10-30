// Post-processes the library build:
// - dist/tokens.css: tokens + themes only, for apps that want the design tokens without component styles
// - type stubs so `import '@enterprise-ui/react/styles.css'` type-checks without CSS module declarations
// - removes the stylesheet side-effect import from the public declarations
import { cpSync, readFileSync, writeFileSync } from 'node:fs';

const src = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
const dist = (f) => new URL(`../dist/${f}`, import.meta.url);

// SAP 72 font (opt-in): dist/sap-fonts.css with the woff2 files next to it so its relative url()s resolve.
cpSync(new URL('../src/themes/fonts', import.meta.url), dist('fonts'), { recursive: true });
writeFileSync(dist('sap-fonts.css'), src('themes/sap-fonts.css'));
const tokens = ['tokens/tokens.css', 'themes/light.css', 'themes/dark.css', 'themes/high-contrast.css', 'themes/sap-horizon.css', 'themes/sap-horizon-dark.css', 'themes/sap-fiori-3.css', 'themes/sap-fiori-3-dark.css'].map(src).join('\n');
writeFileSync(dist('tokens.css'), tokens);

const stub = '// Stylesheet entry point. Import for its side effects.\nexport {};\n';
writeFileSync(dist('styles.css.d.ts'), stub);
writeFileSync(dist('tokens.css.d.ts'), stub);
writeFileSync(dist('sap-fonts.css.d.ts'), stub);

const indexTypes = dist('types/index.d.ts');
writeFileSync(indexTypes, readFileSync(indexTypes, 'utf8').replace(/^import '\.\/styles\/index\.css';\n/m, ''));

console.log('postbuild: tokens.css, stylesheet type stubs, declarations cleaned');
