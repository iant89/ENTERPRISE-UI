import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import * as UI from '@enterprise-ui/react';
import * as Icons from 'lucide-react';
import { transform } from 'sucrase';
import * as ExampleData from '../../examples/data';
import * as InventoryViews from '../../examples/phase2/internal/InventoryViews';
import * as InventoryApp from '../../examples/apps/InventoryApp';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as JsxRuntime from 'react/jsx-runtime';
import {
  consoleArgs, envelope, hostValidators, locationFromStack, MAX_FRAME_MESSAGE_BYTES, MAX_HOST_MESSAGE_BYTES, SOURCE_URL_PREFIX, validate, TRUNCATED,
  type ConsoleLevel, type FrameMessages, type HostMessages,
} from '../../studio/src/preview/bridge';
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
// Typed, versioned messages (studio/src/preview/bridge); oversized payloads are trimmed before sending.
function post<K extends keyof FrameMessages>(type: K, payload: FrameMessages[K]) {
  let body = payload as Record<string, unknown>;
  if (typeof body.message === 'string' && body.message.length > MAX_FRAME_MESSAGE_BYTES / 2) body = { ...body, message: body.message.slice(0, MAX_FRAME_MESSAGE_BYTES / 2) + TRUNCATED };
  window.parent.postMessage(envelope<FrameMessages, K>(type, body as FrameMessages[K]), '*');
}
const send = (type: 'ready' | 'success' | 'error', message = '') => (type === 'error' ? post('error', { message }) : post(type, {}));

class PreviewBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (artifactMode) post('runtime-error', { message: error.message, ...locationFromStack(error.stack) });
    else send('error', error.message);
  }
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

// Design mode (Enterprise UI Studio): report the boxes of elements tagged with `data-studio-id`
// so the host can draw selection outlines and resolve drops without reaching into this frame.
let design = false;
let layoutFrame = 0;
function reportLayout() {
  layoutFrame = 0;
  if (!design) return;
  const nodes = [...document.querySelectorAll<HTMLElement>('[data-studio-id]')].map((element) => {
    const rect = element.getBoundingClientRect();
    return { id: element.dataset.studioId!, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  post('layout', { nodes });
}
const scheduleLayout = () => { if (design && !layoutFrame) layoutFrame = requestAnimationFrame(reportLayout); };
new ResizeObserver(scheduleLayout).observe(document.documentElement);
new MutationObserver(scheduleLayout).observe(document.body, { subtree: true, childList: true, attributes: true });
window.addEventListener('scroll', scheduleLayout, true);

// Code Studio C4: a compiled multi-file artifact. Each module runs once per artifact with a `require`
// that resolves its own imports to other modules or to the allowlisted packages; CSS goes in style tags.
const packages: Record<string, unknown> = {
  react: React, 'react-dom': ReactDOM, 'react-dom/client': ReactDOMClient, 'react/jsx-runtime': JsxRuntime, '@enterprise-ui/react': UI, 'lucide-react': Icons,
};
let artifactMode = false;
let styleHost: HTMLElement | null = null;
function runArtifact({ artifact, theme, density }: HostMessages['run']) {
  artifactMode = true;
  styleHost?.remove();
  styleHost = document.createElement('div');
  styleHost.hidden = true;
  for (const s of artifact.styles) {
    const tag = document.createElement('style');
    tag.dataset.path = s.path;
    tag.textContent = s.text;
    styleHost.append(tag);
  }
  document.head.append(styleHost);
  const byPath = new Map(artifact.modules.map((m) => [m.path, m]));
  const cache = new Map<string, { exports: Record<string, unknown> }>();
  const load = (path: string): Record<string, unknown> => {
    const hit = cache.get(path);
    if (hit) return hit.exports;
    const mod = byPath.get(path);
    // CSS (already injected) and anything else without code.
    if (!mod) return {};
    const module = { exports: {} as Record<string, unknown> };
    cache.set(path, module);
    const require = (spec: string) => {
      const target = mod.deps[spec];
      if (target === undefined) throw new Error(`Import not available in the preview: ${spec}`);
      if (Object.hasOwn(packages, target)) {
        const pkg = packages[target] as Record<string, unknown>;
        return { ...pkg, default: pkg.default ?? pkg, __esModule: true };
      }
      return load(target);
    };
    // Indirect eval keeps line numbers equal to the source; the sourceURL maps stacks back to the file.
    const fn = (0, eval)(`(function (require, module, exports, React) {${mod.code}\n})\n//# sourceURL=${SOURCE_URL_PREFIX}${mod.path}`) as (...a: unknown[]) => void;
    fn(require, module, module.exports, React);
    return module.exports;
  };
  try {
    const entry = load(artifact.entry);
    const App = entry.default;
    if (typeof App !== 'function') throw Object.assign(new Error(`${artifact.entry} must default-export a React component.`), { studioPath: artifact.entry });
    root.render(<UI.ThemeProvider theme={theme as UI.ThemePreference} density={density as UI.Density} style={{ minHeight: '100vh' }}><UI.ToastProvider><PreviewBoundary key={artifact.hash}>{React.createElement(App as React.ComponentType)}</PreviewBoundary></UI.ToastProvider></UI.ThemeProvider>);
    post('success', { hash: artifact.hash });
  } catch (error) {
    const e = error as Error & { studioPath?: string };
    const at = locationFromStack(e?.stack);
    post('runtime-error', { message: e?.message ?? String(error), path: at.path ?? e?.studioPath ?? artifact.entry, line: at.line, column: at.column });
  }
}

// Console capture (artifact mode): forwarded with the calling module's location.
for (const level of ['log', 'info', 'warn', 'error'] as ConsoleLevel[]) {
  const original = console[level].bind(console);
  console[level] = (...args: unknown[]) => {
    original(...args);
    if (artifactMode) post('console', { level, args: consoleArgs(args), ...locationFromStack(new Error().stack) });
  };
}
window.addEventListener('error', (event) => {
  if (!artifactMode) return;
  const err = event.error as Error | undefined;
  const at = locationFromStack(err?.stack);
  post('runtime-error', { message: err?.message ?? event.message, ...at });
});
window.addEventListener('unhandledrejection', (event) => {
  if (!artifactMode) return;
  const r = event.reason as Error | undefined;
  post('runtime-error', { message: `Unhandled promise rejection: ${r?.message ?? String(event.reason)}`, ...locationFromStack(r?.stack) });
});

window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  const r = validate(event.data, hostValidators, MAX_HOST_MESSAGE_BYTES);
  if (!r.ok) return;
  const m = r.message;
  if (m.type === 'init') { send('ready'); return; }
  if (m.type === 'scroll') { window.scrollBy(0, (m.payload as HostMessages['scroll']).deltaY); return; }
  if (m.type === 'run') {
    const p = m.payload as HostMessages['run'];
    if (!validTheme(p.theme, p.density)) return;
    design = false;
    runArtifact(p);
    return;
  }
  const { code, theme, density, design: d } = m.payload as HostMessages['render'];
  if (!validTheme(theme, density)) return;
  artifactMode = false;
  design = d === true;
  run(code, theme as UI.ThemePreference, density as UI.Density);
  scheduleLayout();
});
function validTheme(theme: string, density: string) {
  return [...UI.THEMES.map((t) => t.name as string), 'system'].includes(theme) && ['cozy', 'compact'].includes(density);
}
send('ready');
