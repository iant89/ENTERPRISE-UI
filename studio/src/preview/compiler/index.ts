/**
 * Code Studio C4 (§9.2): the preview compiler behind a stable adapter interface.
 * - `resolveEntry` → `buildGraph` (core/module-graph) → `transform` (Sucrase per module, TS + JSX) → artifact.
 * - CSS imports become style entries in module order (dependencies first).
 * - The artifact is immutable (deep-frozen) and hashed; transforms are cached per file content hash, so an
 *   edit re-transforms only the edited module (dependents are re-evaluated by the runtime, not re-transformed).
 * - Bare imports outside the allowlist, Node built-ins and URLs are errors and are never fetched.
 */
import { transform as sucrase } from 'sucrase';
import type { FilePath } from '../../model/project';
import { buildGraph, hashText, type ModuleGraph } from '../../core/module-graph';
import { fromParseError, type Diagnostic } from '../../core/diagnostics';

export interface ArtifactModule {
  path: FilePath;
  /** CommonJS output; line numbers match the source (Sucrase preserves lines). */
  code: string;
  /** Specifier → resolved VFS path, or the package name for allowlisted packages. */
  deps: Readonly<Record<string, string>>;
}

export interface PreviewArtifact {
  hash: string;
  entry: FilePath;
  /** Script modules, dependencies first. */
  modules: readonly ArtifactModule[];
  /** CSS files in import order. */
  styles: readonly { path: FilePath; text: string }[];
}

export interface CompileResult {
  /** Null when the build failed (the preview keeps the last good artifact). */
  artifact: PreviewArtifact | null;
  diagnostics: Diagnostic[];
  graph: ModuleGraph;
  /** Modules transformed by this compile (the rest came from the cache). */
  transformed: FilePath[];
}

export interface CompilerAdapter {
  resolveEntry(files: Record<FilePath, string>, preferred?: FilePath): FilePath | null;
  buildGraph(files: Record<FilePath, string>, entry: FilePath): ModuleGraph;
  transform(path: FilePath, text: string): string;
  compile(files: Record<FilePath, string>, entry?: FilePath): CompileResult;
}

/** Conventional entries when the project's own is missing (§9.3). */
export const ENTRY_CANDIDATES = ['src/main.tsx', 'src/App.tsx', 'src/index.tsx', 'App.tsx', 'index.tsx', 'src/main.jsx', 'src/App.jsx'];

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
};

export const DEFAULT_DEBOUNCE_MS = 300;

export function createCompiler(): CompilerAdapter {
  const cache = new Map<FilePath, { hash: string; code: string }>();
  let lastGraph: ModuleGraph | null = null;
  const adapter: CompilerAdapter = {
    resolveEntry(files, preferred) {
      if (preferred && preferred in files) return preferred;
      return ENTRY_CANDIDATES.find((p) => p in files) ?? null;
    },
    buildGraph(files, entry) {
      lastGraph = buildGraph(files, entry, lastGraph);
      return lastGraph;
    },
    transform(path, text) {
      return sucrase(text, { transforms: path.endsWith('.ts') ? ['typescript', 'imports'] : ['typescript', 'jsx', 'imports'], jsxRuntime: 'classic', filePath: path, production: true }).code;
    },
    compile(files, preferred) {
      const entry = adapter.resolveEntry(files, preferred);
      const graph = adapter.buildGraph(files, entry ?? preferred ?? 'src/App.tsx');
      const diagnostics: Diagnostic[] = [...graph.diagnostics];
      const transformed: FilePath[] = [];
      const modules: ArtifactModule[] = [];
      const styles: { path: FilePath; text: string }[] = [];
      for (const path of graph.order) {
        const text = files[path] ?? '';
        const node = graph.nodes.get(path)!;
        if (path.endsWith('.css')) { styles.push({ path, text }); continue; }
        let code: string;
        if (path.endsWith('.json')) {
          try { code = `module.exports = ${JSON.stringify(JSON.parse(text))};`; } catch (e) { diagnostics.push(fromParseError(e, path)); continue; }
        } else {
          const hit = cache.get(path);
          if (hit && hit.hash === node.hash) code = hit.code;
          else {
            try { code = adapter.transform(path, text); } catch (e) { diagnostics.push(fromParseError(e, path)); continue; }
            cache.set(path, { hash: node.hash, code });
            transformed.push(path);
          }
        }
        const deps: Record<string, string> = {};
        for (const i of node.imports) if (i.kind === 'file') deps[i.specifier] = i.path; else if (i.kind === 'package') deps[i.specifier] = i.specifier;
        modules.push({ path, code, deps });
      }
      for (const p of cache.keys()) if (!graph.nodes.has(p)) cache.delete(p);
      if (diagnostics.some((d) => d.severity === 'error')) return { artifact: null, diagnostics, graph, transformed };
      const hash = hashText(JSON.stringify([entry, modules, styles]));
      const artifact = deepFreeze<PreviewArtifact>({ hash, entry: entry!, modules, styles });
      return { artifact, diagnostics, graph, transformed };
    },
  };
  return adapter;
}
