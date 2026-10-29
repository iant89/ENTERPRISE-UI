import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cssModuleClassName } from '../scripts/css-modules';

const root = resolve(import.meta.dirname, '..');

/** Documentation site: renders the library from source with live examples. */
export default defineConfig({
  root: import.meta.dirname,
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@enterprise-ui/react': resolve(root, 'src/index.ts') },
  },
  css: {
    modules: { generateScopedName: cssModuleClassName },
  },
  server: { port: 5173, fs: { allow: [root] } },
  preview: { port: 4173 },
  build: {
    outDir: resolve(root, 'docs-dist'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
});
