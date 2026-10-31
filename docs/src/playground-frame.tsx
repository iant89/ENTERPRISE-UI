import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import * as UI from '@enterprise-ui/react';
import * as Icons from 'lucide-react';
import { transform } from 'sucrase';
import * as ExampleData from '../../examples/data';
import * as InventoryViews from '../../examples/phase2/internal/InventoryViews';
import * as InventoryApp from '../../examples/apps/InventoryApp';
import '../../src/styles/index.css';
// SAP 72 font for the SAP themes (the package exposes it as sap-fonts.css).
import '../../src/themes/sap-fonts.css';

// Runs in a sandboxed, opaque-origin iframe. Never execute editor code in the docs page.
const root = createRoot(document.getElementById('root')!);
// Shared example helpers are available so documentation examples open unchanged.
const modules: Record<string, unknown> = {
  react: React, '@enterprise-ui/react': UI, 'lucide-react': Icons,
  '../data': ExampleData, './internal/InventoryViews': InventoryViews, '../apps/InventoryApp': InventoryApp,
};
const send = (type: string, message = '') => window.parent.postMessage({ source: 'eui-playground', type, message }, '*');

class PreviewBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  componentDidCatch(error: Error, _info: ErrorInfo) { send('error', error.message); }
  render() { return this.state.error ? <p role="alert">{this.state.error}</p> : this.props.children; }
}

function run(code: string, theme: UI.ThemePreference, density: UI.Density) {
  try {
    const load = (name: string) => {
      if (!(name in modules)) throw new Error(`Import not available in the playground: ${name}`);
      const mod = modules[name] as Record<string, unknown>;
      // Mark namespaces as ES modules so default imports resolve the same way they do in the docs build.
      return { ...mod, default: mod.default ?? mod, __esModule: true };
    };
    // Documentation examples are modules with a default-exported component.
    if (/\bexport\s+default\b/.test(code)) {
      const compiled = transform(code, { transforms: ['typescript', 'jsx', 'imports'], jsxRuntime: 'classic' }).code;
      const exports: { default?: unknown } = {};
      new Function('require', 'exports', 'React', compiled)(load, exports, React);
      const Example = exports.default;
      if (typeof Example !== 'function') throw new Error('The default export must be a React component.');
      root.render(<UI.ThemeProvider theme={theme} density={density} style={{ minHeight: '100vh' }}><UI.ToastProvider><PreviewBoundary key={code}><div style={{ minHeight: '100vh', padding: '2rem', boxSizing: 'border-box' }}>{React.createElement(Example as React.ComponentType)}</div></PreviewBoundary></UI.ToastProvider></UI.ThemeProvider>);
      send('success');
      return;
    }
    // Otherwise the editor accepts import statements followed by one JSX expression.
    const imports = /^(?:\s*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"]\s*;\s*)*/.exec(code)?.[0] ?? '';
    const expression = code.slice(imports.length).trim().replace(/;\s*$/, '');
    if (!expression) throw new Error('Enter a JSX expression after the imports.');
    const source = `${imports}\nconst __preview = (${expression});`;
    const compiled = transform(source, { transforms: ['typescript', 'jsx', 'imports'], jsxRuntime: 'classic' }).code;
    const result = new Function('require', 'React', `${compiled}\nreturn __preview;`)(load, React) as ReactNode;
    root.render(<UI.ThemeProvider theme={theme} density={density} style={{ minHeight: '100vh' }}><UI.ToastProvider><PreviewBoundary key={code}><div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', boxSizing: 'border-box' }}>{result}</div></PreviewBoundary></UI.ToastProvider></UI.ThemeProvider>);
    send('success');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    root.render(<p role="alert" style={{ padding: '1rem', fontFamily: 'sans-serif' }}>Preview unavailable. Check the editor for details.</p>);
    send('error', message);
  }
}

window.addEventListener('message', (event) => {
  if (event.source !== window.parent || event.data?.source !== 'eui-docs') return;
  if (event.data.type === 'init') { send('ready'); return; }
  if (event.data.type !== 'render') return;
  const { code, theme, density } = event.data;
  if (typeof code !== 'string' || ![...UI.THEMES.map((t) => t.name as string), 'system'].includes(theme) || !['cozy', 'compact'].includes(density)) return;
  run(code, theme, density);
});
send('ready');
