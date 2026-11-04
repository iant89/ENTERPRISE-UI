/**
 * Code Studio C4 (§9.3): the module graph of a project, built from the VFS starting at the entry.
 * - Relative imports (`./`, `../`) resolve with implied extensions and `index.*` (model/project `resolveImport`).
 * - Bare imports must be on `PACKAGE_ALLOWLIST`; anything else (other npm packages, Node built-ins, URLs) is an
 *   error and is never fetched.
 * - Unresolved and cyclic imports become diagnostics.
 * - Incremental: unchanged files (same content hash) reuse their node; `invalidated` lists the edited files and
 *   their dependents. Subscribe with `graphEvents` (C6 reuses this for catalog invalidation).
 */
import { findImportSpecifiers, resolveImport, type FilePath } from '../../model/project';
import { compilerDiagnostic, type Diagnostic } from '../diagnostics';

/** Packages a preview may import. Provided by the preview runtime; nothing else is ever loaded. */
export const PACKAGE_ALLOWLIST = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', '@enterprise-ui/react', 'lucide-react'] as const;
export const isAllowedPackage = (spec: string) => (PACKAGE_ALLOWLIST as readonly string[]).includes(spec);

export type ResolvedImport =
  | { kind: 'file'; specifier: string; path: FilePath; line: number; column: number }
  | { kind: 'package'; specifier: string; line: number; column: number }
  | { kind: 'error'; specifier: string; line: number; column: number; reason: 'unresolved' | 'not-allowed' | 'network' };

export interface ModuleNode {
  path: FilePath;
  hash: string;
  imports: ResolvedImport[];
  /** The file does not parse; the compiler reports the parse error. */
  parseError: boolean;
}

export interface ModuleGraph {
  entry: FilePath;
  nodes: ReadonlyMap<FilePath, ModuleNode>;
  /** Reachable files, dependencies before dependents (evaluation and CSS order). */
  order: readonly FilePath[];
  diagnostics: readonly Diagnostic[];
  /** Files whose node changed since the previous graph, plus everything that depends on them. */
  invalidated: ReadonlySet<FilePath>;
  /** The project's file list the graph was resolved against (nodes are reused only when it is unchanged). */
  fileSet: string;
}

/** FNV-1a, hex. Cheap and stable; used to detect changed files. */
export function hashText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}

const lineCol = (text: string, offset: number) => {
  let line = 1, last = -1;
  for (let i = 0; i < offset; i++) if (text.charCodeAt(i) === 10) { line++; last = i; }
  return { line, column: offset - last };
};

const isRelative = (s: string) => s === '.' || s === '..' || s.startsWith('./') || s.startsWith('../');
const TYPE_ONLY = /(?:^|[;\s])(?:import|export)\s+type\s[^;]*?from\s*$/;

/** One file's node (hash + resolved imports). Exported for the C6 catalog cache. */
export function scan(files: Record<FilePath, string>, path: FilePath, opts?: { /** Keep type-only imports (the catalog needs them; the compiler doesn't). */ includeTypes?: boolean }): ModuleNode {
  const text = files[path] ?? '';
  const hash = hashText(text);
  if (path.endsWith('.css') || path.endsWith('.json')) return { path, hash, imports: [], parseError: false };
  const specs = findImportSpecifiers(text, path);
  if (!specs) return { path, hash, imports: [], parseError: true };
  const imports: ResolvedImport[] = [];
  for (const s of specs) {
    // Type-only imports are erased by the transform.
    if (!opts?.includeTypes && TYPE_ONLY.test(text.slice(Math.max(0, s.start - 200), s.start))) continue;
    const { line, column } = lineCol(text, s.start);
    const specifier = s.value;
    if (isRelative(specifier)) {
      const target = resolveImport(files, path, specifier) ?? (resolveCss(files, path, specifier));
      imports.push(target ? { kind: 'file', specifier, path: target, line, column } : { kind: 'error', specifier, line, column, reason: 'unresolved' });
    } else if (isAllowedPackage(specifier)) imports.push({ kind: 'package', specifier, line, column });
    else imports.push({ kind: 'error', specifier, line, column, reason: /^[a-z]+:/i.test(specifier) || specifier.startsWith('//') ? 'network' : 'not-allowed' });
  }
  return { path, hash, imports, parseError: false };
}

/** `./x` → `x.css` (resolveImport covers scripts and json). */
function resolveCss(files: Record<FilePath, string>, from: FilePath, spec: string): FilePath | null {
  const dir = from.includes('/') ? from.slice(0, from.lastIndexOf('/')) : '';
  const parts: string[] = dir ? dir.split('/') : [];
  for (const seg of spec.split('/')) { if (seg === '..') parts.pop(); else if (seg && seg !== '.') parts.push(seg); }
  const css = `${parts.join('/')}.css`;
  return css in files ? css : null;
}

function message(i: Extract<ResolvedImport, { kind: 'error' }>): string {
  if (i.reason === 'unresolved') return `Cannot resolve import '${i.specifier}'.`;
  if (i.reason === 'network') return `Import '${i.specifier}' is not allowed: the preview never loads code from the network.`;
  return `Package '${i.specifier}' is not available in the preview. Allowed packages: ${PACKAGE_ALLOWLIST.join(', ')}.`;
}

/** Builds (or incrementally updates, given `previous`) the graph reachable from `entry`. */
export function buildGraph(files: Record<FilePath, string>, entry: FilePath, previous?: ModuleGraph | null): ModuleGraph {
  const nodes = new Map<FilePath, ModuleNode>();
  const diagnostics: Diagnostic[] = [];
  const changed = new Set<FilePath>();
  const order: FilePath[] = [];
  const state = new Map<FilePath, 'visiting' | 'done'>();
  const fileSet = Object.keys(files).sort().join('\n');
  const reuse = previous?.fileSet === fileSet;
  if (!(entry in files)) {
    return { entry, nodes, order, diagnostics: [compilerDiagnostic(`Entry file '${entry}' does not exist.`, entry)], invalidated: new Set(), fileSet };
  }
  const nodeFor = (path: FilePath) => {
    const prev = previous?.nodes.get(path);
    const text = files[path] ?? '';
    // Reuse only when the text and the set of files (resolution inputs) are unchanged.
    if (prev && reuse && prev.hash === hashText(text)) return prev;
    const next = scan(files, path);
    if (!prev || prev.hash !== next.hash) changed.add(path);
    else if (JSON.stringify(prev.imports) !== JSON.stringify(next.imports)) changed.add(path);
    return next;
  };
  const visit = (path: FilePath, stack: FilePath[]) => {
    if (state.get(path) === 'done') return;
    state.set(path, 'visiting');
    const node = nodeFor(path);
    nodes.set(path, node);
    for (const i of node.imports) {
      if (i.kind === 'error') { diagnostics.push(compilerDiagnostic(message(i), path, i.line, i.column)); continue; }
      if (i.kind !== 'file') continue;
      if (state.get(i.path) === 'visiting') {
        const cycle = [...stack.slice(stack.indexOf(i.path)), path, i.path];
        diagnostics.push(compilerDiagnostic(`Circular import: ${cycle.join(' → ')}.`, path, i.line, i.column, 'warning'));
        continue;
      }
      visit(i.path, [...stack, path]);
    }
    state.set(path, 'done');
    order.push(path);
  };
  visit(entry, []);
  if (previous) for (const p of previous.nodes.keys()) if (!nodes.has(p)) changed.add(p);
  const graph: ModuleGraph = { entry, nodes, order, diagnostics, invalidated: withDependents(nodes, changed), fileSet };
  graphEvents.emit({ graph, invalidated: graph.invalidated });
  return graph;
}

/** `changed` plus every node that (transitively) imports one of them. */
export function withDependents(nodes: ReadonlyMap<FilePath, ModuleNode>, changed: ReadonlySet<FilePath>): Set<FilePath> {
  const dependents = new Map<FilePath, FilePath[]>();
  for (const n of nodes.values()) for (const i of n.imports) if (i.kind === 'file') dependents.set(i.path, [...(dependents.get(i.path) ?? []), n.path]);
  const out = new Set<FilePath>();
  const queue = [...changed];
  while (queue.length) {
    const p = queue.pop()!;
    if (out.has(p)) continue;
    out.add(p);
    queue.push(...(dependents.get(p) ?? []));
  }
  return out;
}

export interface GraphChange { graph: ModuleGraph; invalidated: ReadonlySet<FilePath> }
type Listener = (change: GraphChange) => void;
const listeners = new Set<Listener>();
/** Change events for every incremental graph build (C6: catalog invalidation). */
export const graphEvents = {
  subscribe(listener: Listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  emit(change: GraphChange) { for (const l of listeners) l(change); },
};
