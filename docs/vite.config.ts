import { resolve } from 'node:path';
import { build, defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { cssModuleClassName } from '../scripts/css-modules';

const root = resolve(import.meta.dirname, '..');

// A classic, self-contained bundle lets the opaque-origin sandbox load on static hosts
// that do not send CORS headers for JavaScript modules.
function sandboxBundle(): Plugin {
  return {
    name: 'playground-sandbox-bundle',
    apply: 'build',
    async buildStart() {
      const result = await build({
        configFile: false,
        root: import.meta.dirname,
        plugins: [react()],
        resolve: { alias: { '@enterprise-ui/react': resolve(root, 'src/index.ts') } },
        css: { modules: { generateScopedName: cssModuleClassName } },
        build: {
          write: false,
          lib: { entry: resolve(import.meta.dirname, 'src/playground-frame.tsx'), name: 'PlaygroundFrame', formats: ['iife'], fileName: () => 'playground-runtime.js', cssFileName: 'playground-runtime' },
          rollupOptions: { output: { inlineDynamicImports: true } },
        },
      });
      const outputs = Array.isArray(result) ? result : [result];
      for (const output of outputs) {
        if (!('output' in output)) throw new Error('Unexpected playground build watcher');
        for (const file of output.output) {
        this.emitFile({ type: 'asset', fileName: file.fileName, source: file.type === 'chunk' ? file.code : file.source });
        }
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.filename.endsWith('playground-frame.html')) return html;
        return html.replace('<script type="module" src="./src/playground-frame.tsx"></script>', '<link rel="stylesheet" href="./playground-runtime.css"><script src="./playground-runtime.js"></script>');
      },
    },
  };
}

/** Documentation site: renders the library from source with live examples. */
export default defineConfig({
  root: import.meta.dirname,
  base: './',
  plugins: [react(), sandboxBundle()],
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
