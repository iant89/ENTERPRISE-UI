import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cssModuleClassName } from '../scripts/css-modules';
import { sandboxBundle } from '../scripts/sandbox-bundle';

const root = resolve(import.meta.dirname, '..');

/** Documentation site: renders the library from source with live examples. */
export default defineConfig({
  root: import.meta.dirname,
  base: './',
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
