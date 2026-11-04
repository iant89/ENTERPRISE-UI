/**
 * Code Studio C4: runs the compiler (lazy-loaded with Sucrase, outside the initial download) on VFS
 * changes, debounced, skipped while paused, and keeps the last good artifact (§9.6).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FilePath } from '../model/project';
import type { Diagnostic } from '../core/diagnostics';
import type { CompilerAdapter, PreviewArtifact } from './compiler';

export interface PreviewBuild {
  /** The artifact running in the preview: the last successful build. */
  artifact: PreviewArtifact | null;
  /** Diagnostics of the latest build (errors mean the preview is stale). */
  diagnostics: Diagnostic[];
  /** The latest build failed while a previous artifact is still shown. */
  failed: boolean;
  /** Modules transformed by the latest build. */
  transformed: FilePath[];
  recompile: () => void;
}

let compilerPromise: Promise<CompilerAdapter> | null = null;
const loadCompiler = () => (compilerPromise ??= import('./compiler').then((m) => m.createCompiler()));

export function usePreviewBuild(files: Record<FilePath, string>, entry: FilePath, { paused = false, debounceMs = 300, enabled = true, projectKey }: { paused?: boolean; debounceMs?: number; enabled?: boolean; /** C4 review: a new project resets the build, so a failed first build never shows the previous project's preview. */ projectKey?: string } = {}): PreviewBuild {
  const [state, setState] = useState<Omit<PreviewBuild, 'recompile'>>({ artifact: null, diagnostics: [], failed: false, transformed: [] });
  const [tick, setTick] = useState(0);
  const latest = useRef({ files, entry });
  latest.current = { files, entry };
  const first = useRef(true);
  const [key, setKey] = useState(projectKey);
  if (key !== projectKey) {
    // Reset during render (React's derived-state pattern) so no frame shows the old artifact.
    setKey(projectKey);
    setState({ artifact: null, diagnostics: [], failed: false, transformed: [] });
    first.current = true;
  }
  useEffect(() => {
    if (paused || !enabled) return;
    let cancelled = false;
    const run = () => void loadCompiler().then((compiler) => {
      if (cancelled) return;
      const r = compiler.compile(latest.current.files, latest.current.entry);
      setState((s) => ({
        artifact: r.artifact ?? s.artifact,
        diagnostics: r.diagnostics,
        failed: !r.artifact,
        transformed: r.transformed,
      }));
    });
    // The first build runs at once; edits are debounced.
    if (first.current) { first.current = false; run(); return () => { cancelled = true; }; }
    const t = setTimeout(run, debounceMs);
    return () => { cancelled = true; clearTimeout(t); };
  }, [files, entry, paused, enabled, debounceMs, tick, key]);
  const recompile = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, recompile };
}
