/// <reference types="vitest/config" />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cssModuleClassName } from './scripts/css-modules';

const root = import.meta.dirname;

/**
 * Library build. Produces tree-shakeable ESM (one module per source file),
 * a single extracted stylesheet (dist/styles.css) and externalised React.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@enterprise-ui/react': resolve(root, 'src/index.ts') },
  },
  css: {
    modules: { generateScopedName: cssModuleClassName },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(root, 'src/index.ts'),
      formats: ['es'],
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^lucide-react($|\/)/],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/unit/**/*.test.{ts,tsx}'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
