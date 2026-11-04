import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cssModuleClassName } from '../scripts/css-modules';
import { sandboxBundle } from '../scripts/sandbox-bundle';

const root = resolve(import.meta.dirname, '..');
/** Code Studio C7: api.json has no version, so the docs footer shows the package version + a short content hash. */
const apiHash = createHash('sha256').update(readFileSync(resolve(import.meta.dirname, 'generated/api.json'))).digest('hex').slice(0, 8);

/** Documentation site: renders the library from source with live examples. */
export default defineConfig({
  root: import.meta.dirname,
  base: './',
  define: { __EUI_API_HASH__: JSON.stringify(apiHash) },
  plugins: [react(), sandboxBundle({ root: import.meta.dirname, html: 'playground-frame.html', entry: './src/playground-frame.tsx' })],
  resolve: {
    alias: { '@enterprise-ui/react': resolve(root, 'src/index.ts') },
  },
  css: {
    modules: { generateScopedName: cssModuleClassName },
  },
  server: { port: 5173, host: '0.0.0.0', allowedHosts: true, cors: true, fs: { allow: [root] } },
  preview: { port: 4173, host: '0.0.0.0', allowedHosts: true, cors: true },
  build: {
    outDir: resolve(root, 'docs-dist'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: { input: { main: resolve(import.meta.dirname, 'index.html'), playgroundFrame: resolve(import.meta.dirname, 'playground-frame.html') } },
  },
});
