import { describe, expect, it, vi } from 'vitest';
import { buildGraph, graphEvents, hashText, PACKAGE_ALLOWLIST } from '../../studio/src/core/module-graph';
import { createCompiler } from '../../studio/src/preview/compiler';
import { compilerDiagnostic, countBySeverity, fromMarker, fromParseError, fromRuntime, groupByFile } from '../../studio/src/core/diagnostics';
import {
  consoleArgs, envelope, formatConsoleArg, frameValidators, hostValidators, locationFromStack, MAX_FRAME_MESSAGE_BYTES, TRUNCATED, validate,
  type FrameMessages, type HostMessages,
} from '../../studio/src/preview/bridge';

const fe = <K extends keyof FrameMessages>(t: K, p: FrameMessages[K]) => envelope<FrameMessages, K>(t, p);
const he = <K extends keyof HostMessages>(t: K, p: HostMessages[K]) => envelope<HostMessages, K>(t, p);
import { CONSOLE_CAP, consoleReducer, EMPTY_CONSOLE, filterConsole } from '../../studio/src/preview/console';
import { DEFAULT_LAYOUT, layoutReducer, parseLayout } from '../../studio/src/app/workspace/layout';
import { draftErrors, draftFrom, draftToSize, sizeDraftReducer, zoomScale } from '../../studio/src/preview/previewSize';

const project = {
  'src/App.tsx': "import { Button } from '@enterprise-ui/react';\nimport Header from './components/Header';\nimport { rows } from '../data/rows';\nimport './styles.css';\nexport default function App() { return <><Header />{rows.length}<Button>Go</Button></>; }\n",
  'src/components/Header.tsx': "import './Header.css';\nimport { Title } from './ui';\nexport default function Header() { return <Title>Hi</Title>; }\n",
  'src/components/Header.css': '.h { color: red; }',
  'src/components/ui/index.tsx': "import type { ReactNode } from 'react';\nexport const Title = ({ children }: { children: ReactNode }) => <h1>{children}</h1>;\n",
  'data/rows.ts': 'export const rows: number[] = [1, 2];\n',
  'src/styles.css': 'body { margin: 0; }',
  'src/unused.tsx': 'export const x = 1;',
};

describe('module graph', () => {
  it('resolves relative imports with extensions, index files and CSS, dependencies first', () => {
    const g = buildGraph(project, 'src/App.tsx');
    expect(g.diagnostics).toEqual([]);
    expect(g.order).toEqual(['src/components/Header.css', 'src/components/ui/index.tsx', 'src/components/Header.tsx', 'data/rows.ts', 'src/styles.css', 'src/App.tsx']);
    expect(g.nodes.has('src/unused.tsx')).toBe(false);
    expect(g.nodes.get('src/App.tsx')!.hash).toBe(hashText(project['src/App.tsx']));
    // `import type` is erased; allowlisted packages are package edges.
    expect(g.nodes.get('src/components/ui/index.tsx')!.imports).toEqual([]);
    expect(g.nodes.get('src/App.tsx')!.imports[0]).toMatchObject({ kind: 'package', specifier: '@enterprise-ui/react' });
  });

  it('reports unresolved imports, disallowed packages, network and Node built-ins', () => {
    const g = buildGraph({ 'src/App.tsx': "import a from './missing';\nimport l from 'lodash';\nimport fs from 'node:fs';\nimport x from 'https://cdn.example/x.js';\nexport default () => null;" }, 'src/App.tsx');
    expect(g.diagnostics.map((d) => [d.range?.startLine, d.message.split(':')[0]])).toEqual([
      [1, "Cannot resolve import './missing'."], [2, "Package 'lodash' is not available in the preview. Allowed packages"],
      [3, "Import 'node"], [4, "Import 'https"],
    ]);
    expect(g.diagnostics.every((d) => d.origin === 'compiler' && d.severity === 'error' && d.path === 'src/App.tsx')).toBe(true);
    expect(PACKAGE_ALLOWLIST).toContain('react');
  });

  it('reports cycles as warnings and still orders the modules', () => {
    const g = buildGraph({ 'a.tsx': "import './b';\nexport default () => null;", 'b.tsx': "import './a';" }, 'a.tsx');
    expect(g.diagnostics).toHaveLength(1);
    expect(g.diagnostics[0]).toMatchObject({ severity: 'warning', path: 'b.tsx' });
    expect(g.diagnostics[0].message).toContain('a.tsx → b.tsx → a.tsx');
    expect(g.order).toEqual(['b.tsx', 'a.tsx']);
  });

  it('missing entry is a diagnostic', () => {
    expect(buildGraph({}, 'src/App.tsx').diagnostics[0].message).toContain("Entry file 'src/App.tsx'");
  });

  it('incremental: an edit invalidates only the node and its dependents, and emits a change event', () => {
    const first = buildGraph(project, 'src/App.tsx');
    const seen = vi.fn();
    const off = graphEvents.subscribe(seen);
    const edited = { ...project, 'src/components/ui/index.tsx': project['src/components/ui/index.tsx'] + '\n// edit' };
    const next = buildGraph(edited, 'src/App.tsx', first);
    off();
    expect([...next.invalidated].sort()).toEqual(['src/App.tsx', 'src/components/Header.tsx', 'src/components/ui/index.tsx']);
    expect(next.nodes.get('data/rows.ts')).toBe(first.nodes.get('data/rows.ts'));
    expect(seen).toHaveBeenCalledWith(expect.objectContaining({ invalidated: next.invalidated }));
    expect(buildGraph(edited, 'src/App.tsx', next).invalidated.size).toBe(0);
  });
});

describe('compiler adapter', () => {
  it('compiles a multi-file project into a frozen, hashed artifact with CSS in module order', () => {
    const c = createCompiler();
    const r = c.compile(project, 'src/App.tsx');
    expect(r.diagnostics).toEqual([]);
    const a = r.artifact!;
    expect(Object.isFrozen(a) && Object.isFrozen(a.modules) && Object.isFrozen(a.modules[0])).toBe(true);
    expect(a.styles.map((s) => s.path)).toEqual(['src/components/Header.css', 'src/styles.css']);
    expect(a.modules.map((m) => m.path).at(-1)).toBe('src/App.tsx');
    expect(a.modules.find((m) => m.path === 'src/App.tsx')!.deps).toMatchObject({ './components/Header': 'src/components/Header.tsx', '@enterprise-ui/react': '@enterprise-ui/react' });
    expect(a.modules[0].code).not.toContain('ReactNode }'); // TS erased
    expect(c.compile(project, 'src/App.tsx').artifact!.hash).toBe(a.hash);
  });

  it('re-transforms only edited modules', () => {
    const c = createCompiler();
    expect(c.compile(project).transformed).toHaveLength(4);
    const r = c.compile({ ...project, 'data/rows.ts': 'export const rows = [1];' });
    expect(r.transformed).toEqual(['data/rows.ts']);
  });

  it('a syntax error fails the build with a parser diagnostic at the line', () => {
    const r = createCompiler().compile({ ...project, 'src/components/Header.tsx': 'export default function Header() {\n  return <h1>;\n}\n' });
    expect(r.artifact).toBeNull();
    expect(r.diagnostics[0]).toMatchObject({ origin: 'parser', path: 'src/components/Header.tsx', severity: 'error' });
    expect(r.diagnostics[0].range?.startLine).toBe(2);
  });

  it('disallowed packages fail the build; entry falls back to a conventional file', () => {
    const c = createCompiler();
    expect(c.compile({ 'src/App.tsx': "import _ from 'lodash';\nexport default () => null;" }).artifact).toBeNull();
    expect(c.resolveEntry({ 'src/main.tsx': '' }, 'src/missing.tsx')).toBe('src/main.tsx');
  });
});

describe('diagnostics normalisation', () => {
  it('parser: Babel loc (0-based column) or message position', () => {
    expect(fromParseError(Object.assign(new SyntaxError('Unexpected token (3:4)'), { loc: { line: 3, column: 4 } }), 'a.tsx'))
      .toEqual({ severity: 'error', message: 'Unexpected token', path: 'a.tsx', range: { startLine: 3, startColumn: 5, endLine: 3, endColumn: 5 }, origin: 'parser' });
    expect(fromParseError(new Error('Unexpected token (7:0)'), 'a.tsx').range?.startLine).toBe(7);
  });
  it('typescript markers, compiler and runtime errors', () => {
    expect(fromMarker({ severity: 8, message: 'x', startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 4, resource: { path: '/src/A.tsx' } }))
      .toMatchObject({ severity: 'error', path: 'src/A.tsx', origin: 'typescript', range: { startColumn: 2, endColumn: 4 } });
    expect(fromMarker({ severity: 4, message: 'w', startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, 'b.ts').severity).toBe('warning');
    expect(compilerDiagnostic('m', 'a.ts', 2, 3)).toMatchObject({ origin: 'compiler', range: { startLine: 2, startColumn: 3 } });
    expect(fromRuntime({ message: 'boom', path: 'a.tsx', line: 4 })).toMatchObject({ origin: 'runtime', range: { startLine: 4 } });
    expect(fromRuntime({ message: 'boom' }).range).toBeNull();
  });
  it('groups by file and counts', () => {
    const list = [fromRuntime({ message: 'r' }), compilerDiagnostic('b2', 'b.ts', 2), compilerDiagnostic('w', 'a.ts', 9, 1, 'warning'), compilerDiagnostic('a1', 'a.ts', 5)];
    expect(groupByFile(list).map((g) => [g.path, g.items.map((d) => d.message)])).toEqual([['a.ts', ['a1', 'w']], ['b.ts', ['b2']], ['', ['r']]]);
    expect(countBySeverity(list)).toEqual({ errors: 3, warnings: 1 });
  });
});

describe('preview bridge', () => {
  const ok = (data: unknown) => validate(data, frameValidators, MAX_FRAME_MESSAGE_BYTES);
  it('accepts typed, versioned messages', () => {
    expect(ok(fe('console', { level: 'log', args: ['a'], path: 'a.tsx', line: 1, column: 1 })).ok).toBe(true);
    expect(validate(he('render', { code: 'x', theme: 'light', density: 'cozy' }), hostValidators, 1e6).ok).toBe(true);
  });
  it('rejects non-bridge, wrong version, unknown type, bad payload and oversized messages', () => {
    expect(ok({ source: 'eui-playground', type: 'ready' })).toEqual({ ok: false, reason: 'not-bridge' });
    expect(ok(null)).toEqual({ ok: false, reason: 'not-bridge' });
    expect(ok({ ...fe('ready', {}), v: 2 })).toEqual({ ok: false, reason: 'version' });
    expect(ok({ ...fe('ready', {}), type: 'eval' })).toEqual({ ok: false, reason: 'unknown-type' });
    expect(ok({ ...fe('ready', {}), type: 'toString' })).toEqual({ ok: false, reason: 'unknown-type' });
    expect(ok(fe('console', { level: 'debug', args: [] } as never))).toEqual({ ok: false, reason: 'bad-payload' });
    expect(ok(fe('layout', { nodes: [{ id: 'a', x: 'no' }] } as never))).toEqual({ ok: false, reason: 'bad-payload' });
    expect(ok(fe('error', { message: 'x'.repeat(MAX_FRAME_MESSAGE_BYTES) }))).toEqual({ ok: false, reason: 'too-large' });
    expect(validate(he('run', { artifact: { hash: 'h', entry: 'a', modules: [{ path: 'a', code: 1 }], styles: [] }, theme: 't', density: 'd' } as never), hostValidators, 1e6))
      .toEqual({ ok: false, reason: 'bad-payload' });
  });
  it('maps stacks to module locations', () => {
    expect(locationFromStack('Error\n at f (eui-preview/src/App.tsx:12:5)\n at g (eui-preview/src/B.tsx:1:1)')).toEqual({ path: 'src/App.tsx', line: 12, column: 5 });
    expect(locationFromStack('Error\n at x (blob:abc:1:2)')).toEqual({ path: null, line: null, column: null });
  });
  it('truncates console args with a marker and keeps the message under the limit', () => {
    expect(formatConsoleArg('x'.repeat(5000))).toHaveLength(2000 + TRUNCATED.length);
    expect(formatConsoleArg({ a: 1 })).toBe('{"a":1}');
    const circular: Record<string, unknown> = {}; circular.self = circular;
    expect(formatConsoleArg(circular)).toBe('{"self":"[Circular]"}');
    const args = consoleArgs(Array.from({ length: 100 }, () => 'y'.repeat(3000)));
    expect(args.at(-1)).toBe(TRUNCATED);
    expect(ok(fe('console', { level: 'log', args, path: null, line: null, column: null })).ok).toBe(true);
  });
});

describe('console capture', () => {
  it('caps entries, counts the dropped ones, clears and filters', () => {
    let s = EMPTY_CONSOLE;
    for (let i = 0; i < CONSOLE_CAP + 5; i++) s = consoleReducer(s, { type: 'add', level: i % 2 ? 'warn' : 'log', args: [`m${i}`], location: { path: 'a.tsx', line: 1, column: 1 } });
    expect(s.entries).toHaveLength(CONSOLE_CAP);
    expect(s.dropped).toBe(5);
    expect(s.entries[0].text).toBe('m5');
    expect(filterConsole(s.entries, 'warn').every((e) => e.level === 'warn')).toBe(true);
    const cleared = consoleReducer(s, { type: 'clear' });
    expect(cleared.entries).toEqual([]);
    expect(consoleReducer(cleared, { type: 'clear' })).toBe(cleared);
  });
});

describe('custom preview size', () => {
  it('validates limits inline (320–3840 × 320–2160)', () => {
    expect(draftErrors(draftFrom({ width: 800, height: 600 }))).toEqual({});
    expect(draftErrors({ ...draftFrom({ width: 800, height: 600 }), width: 319, height: 2161 })).toEqual({ width: 'Width must be 320–3840 px.', height: 'Height must be 320–2160 px.' });
    expect(draftToSize({ ...draftFrom({ width: 800, height: 600 }), width: null })).toBeNull();
  });
  it('locks the aspect ratio, resets to Desktop and maps zoom to scale', () => {
    let d = sizeDraftReducer(draftFrom({ width: 800, height: 600 }), { type: 'lock', locked: true });
    d = sizeDraftReducer(d, { type: 'width', value: 1200 });
    expect(d.height).toBe(900);
    d = sizeDraftReducer(d, { type: 'reset' });
    expect([d.width, d.height, d.zoom]).toEqual([1280, 800, 'fit']);
    expect(zoomScale('fit', 0.6)).toBe(0.6);
    expect(zoomScale(75, 0.6)).toBe(0.75);
  });
  it('persists per project in the layout; invalid sizes are ignored', () => {
    const l = layoutReducer(DEFAULT_LAYOUT, { type: 'setPreviewSize', size: { width: 800, height: 600, zoom: 75 } });
    expect(parseLayout(JSON.parse(JSON.stringify(l))).previewSize).toEqual({ width: 800, height: 600, zoom: 75 });
    expect(layoutReducer(l, { type: 'setPreviewSize', size: { width: 10, height: 600, zoom: 'fit' } })).toBe(l);
    expect(layoutReducer(l, { type: 'setPreviewSize', size: null }).previewSize).toBeNull();
    expect(parseLayout({ previewSize: { width: 9999, height: 600 } }).previewSize).toBeNull();
    expect(parseLayout({}).previewSize).toBeNull();
  });
});
