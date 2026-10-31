import { resolve } from 'node:path';
import { build, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { cssModuleClassName } from './css-modules';

const repoRoot = resolve(import.meta.dirname, '..');

export interface SandboxBundleOptions {
  /** Directory the HTML page lives in (the Vite root of the app). */
  root: string;
  /** HTML file name of the sandbox page, relative to `root`. */
  html: string;
  /** Entry module referenced by the page, relative to `root` (for example `./src/playground-frame.tsx`). */
  entry: string;
  /** Module bundled into the runtime, when it differs from `entry` (absolute path). */
  bundleEntry?: string;
}

/**
 * Builds the preview sandbox as a classic, self-contained IIFE so the opaque-origin iframe loads
 * on static hosts that do not send CORS headers for JavaScript modules. Used by the docs and the Studio.
 */
export function sandboxBundle({ root, html, entry, bundleEntry }: SandboxBundleOptions): Plugin {
  return {
    name: 'playground-sandbox-bundle',
    apply: 'build',
    async buildStart() {
      const result = await build({
        configFile: false,
        root,
        logLevel: 'warn',
        // Library mode leaves `process.env.NODE_ENV` in place for consumers; this IIFE runs directly in the browser.
        define: { 'process.env.NODE_ENV': JSON.stringify('production') },
        plugins: [react()],
        resolve: { alias: { '@enterprise-ui/react': resolve(repoRoot, 'src/index.ts') } },
        css: { modules: { generateScopedName: cssModuleClassName } },
        build: {
          write: false,
          lib: { entry: bundleEntry ?? resolve(root, entry), name: 'PlaygroundFrame', formats: ['iife'], fileName: () => 'playground-runtime.js', cssFileName: 'playground-runtime' },
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
      handler(source, ctx) {
        if (!ctx.filename.endsWith(html)) return source;
        return source.replace(`<script type="module" src="${entry}"></script>`, '<link rel="stylesheet" href="./playground-runtime.css"><script src="./playground-runtime.js"></script>');
      },
    },
  };
}
