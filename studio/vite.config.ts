import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cssModuleClassName } from '../scripts/css-modules';
import { sandboxBundle } from '../scripts/sandbox-bundle';
import { studioTypes } from './build/studio-types';

const root = resolve(import.meta.dirname, '..');
/** Code Studio C7: api.json has no version, so the docs footer shows the package version + a short content hash. */
const apiHash = createHash('sha256').update(readFileSync(resolve(root, 'docs/generated/api.json'))).digest('hex').slice(0, 8);

/** Enterprise UI Studio: a static app published inside the docs at `docs-dist/studio/`. */
export default defineConfig({
  root: import.meta.dirname,
  base: './',
  define: { __EUI_API_HASH__: JSON.stringify(apiHash) },
  plugins: [react(), studioTypes(), sandboxBundle({ root: import.meta.dirname, html: 'preview.html', entry: './src/preview.tsx', bundleEntry: resolve(root, 'docs/src/playground-frame.tsx') })],
  resolve: {
    alias: [
      { find: '@enterprise-ui/react', replacement: resolve(root, 'src/index.ts') },
      // Monaco's package exports cover JavaScript only; its stylesheets are imported by path.
      { find: /^monaco-editor\/(.*\.css)$/, replacement: `${resolve(root, 'node_modules/monaco-editor/esm/vs')}/$1` },
    ],
  },
  css: { modules: { generateScopedName: cssModuleClassName } },
  worker: { format: 'es' },
  server: { port: 5174, host: '0.0.0.0', allowedHosts: true, fs: { allow: [root] } },
  build: {
    outDir: resolve(root, 'docs-dist/studio'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 8000,
    rollupOptions: { input: { main: resolve(import.meta.dirname, 'index.html'), preview: resolve(import.meta.dirname, 'preview.html') } },
  },
});
