/** Build and install the actual tarball in isolated React 18 and 19 Vite consumers. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dirname, '..');
const temp = mkdtempSync(join(tmpdir(), 'eui-consumer-'));
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit' });
const write = (directory, name, contents) => writeFileSync(join(directory, name), contents);
try {
  // `npm pack` uses the files/exports configuration that publishing would use.
  const packed = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', temp], { cwd: root, encoding: 'utf8' }));
  const archive = join(temp, packed[0].filename);
  for (const version of [18, 19]) {
    const app = join(temp, `react-${version}`);
    mkdirSync(app);
    const react = version === 18 ? '18.2.0' : '19.2.0';
    write(app, 'package.json', JSON.stringify({ name: `eui-consumer-react-${version}`, private: true, type: 'module', dependencies: { '@enterprise-ui/react': `file:${archive}`, react, 'react-dom': react }, devDependencies: { '@types/react': version === 18 ? '^18.2.0' : '^19.2.0', '@types/react-dom': version === 18 ? '^18.2.0' : '^19.2.0', typescript: '~6.0.2', vite: '^8.3.5' } }, null, 2));
    write(app, 'index.html', '<!doctype html><html><head><title>Consumer check</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
    write(app, 'main.tsx', `import { createRoot } from 'react-dom/client';\nimport { Button, ThemeProvider, type DataAdapter, type PaletteCommand } from '@enterprise-ui/react';\nimport '@enterprise-ui/react/styles.css';\nimport '@enterprise-ui/react/tokens.css';\nimport '@enterprise-ui/react/sap-fonts.css';\nconst command: PaletteCommand = { id: 'open', label: 'Open' };\nconst adapter: DataAdapter<{ id: string }> = { load: async () => ({ items: [], total: 0 }) };\nvoid adapter;\ncreateRoot(document.getElementById('root')!).render(<ThemeProvider><Button>{command.label}</Button></ThemeProvider>);\n`);
    write(app, 'tsconfig.json', JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: false, noUncheckedSideEffectImports: true, types: [] }, include: ['main.tsx'] }));
    write(app, 'verify.mjs', `import * as api from '@enterprise-ui/react';\nimport { readFileSync } from 'node:fs';\nimport { fileURLToPath } from 'node:url';\nfor (const key of ['Button', 'ThemeProvider', 'DataGrid', 'VirtualList', 'FileUploader']) if (typeof api[key] !== 'function' && typeof api[key] !== 'object') throw new Error('Missing runtime export: ' + key);\nfor (const path of ['@enterprise-ui/react/styles.css', '@enterprise-ui/react/tokens.css', '@enterprise-ui/react/sap-fonts.css', '@enterprise-ui/react/package.json']) { const file = fileURLToPath(import.meta.resolve(path)); if (!readFileSync(file).length) throw new Error('Empty export: ' + path); }\n`);
    console.log(`\nChecking packed consumer with React ${version}...`);
    run('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts'], app);
    run('node', ['verify.mjs'], app);
    run('npx', ['tsc', '-p', 'tsconfig.json'], app);
    run('npx', ['vite', 'build'], app);
    const assets = readdirSync(join(app, 'dist', 'assets'));
    const js = assets.filter((file) => file.endsWith('.js')).map((file) => readFileSync(join(app, 'dist', 'assets', file), 'utf8')).join('\n');
    if (!assets.some((file) => file.endsWith('.css'))) throw new Error('Consumer bundle is missing exported CSS');
    if (js.includes('Authoritative audit records')) throw new Error('Unused AuditTrail appears in the production bundle');
    console.log(`React ${version}: runtime exports, styles, declarations, Vite build and tree-shaking smoke check passed.`);
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
