/**
 * Code Studio C4 (§4): one diagnostics shape for the parser, TypeScript, the preview compiler and the
 * preview runtime. Problems, the status bar and the stale preview strip all read this.
 */
import type { EditorRange } from '../../editor/EditorAdapter';

export type DiagnosticOrigin = 'parser' | 'typescript' | 'compiler' | 'runtime';
export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface QuickFix { title: string; /** Replacement text for `range`. */ text: string }

export interface Diagnostic {
  severity: DiagnosticSeverity;
  message: string;
  /** VFS path; '' when the location is unknown. */
  path: string;
  range: EditorRange | null;
  origin: DiagnosticOrigin;
  quickFix?: QuickFix;
}

const point = (line: number, column = 1): EditorRange => ({ startLine: line, startColumn: column, endLine: line, endColumn: column });

/** First `(line:col)`, `line:col` or `line N` in a message. Columns are 1-based in the result. */
function locate(message: string, zeroBasedColumn: boolean): EditorRange | null {
  const m = /\((\d+):(\d+)\)/.exec(message) ?? /:(\d+):(\d+)/.exec(message) ?? /line (\d+)(?:, column (\d+))?/i.exec(message);
  if (!m) return null;
  const line = Number(m[1]);
  const col = m[2] ? Number(m[2]) + (zeroBasedColumn ? 1 : 0) : 1;
  return line > 0 ? point(line, col) : null;
}

/** Sucrase / Babel parse errors: "Unexpected token (3:5)" (Babel columns are 0-based); Babel also sets `loc`. */
export function fromParseError(error: unknown, path: string): Diagnostic {
  const e = error as { message?: unknown; loc?: { line?: number; column?: number } };
  const raw = typeof e?.message === 'string' ? e.message : String(error);
  const range = e?.loc && typeof e.loc.line === 'number' ? point(e.loc.line, (e.loc.column ?? 0) + 1) : locate(raw, true);
  return { severity: 'error', message: raw.replace(/\s*\(\d+:\d+\)\s*$/, ''), path, range, origin: 'parser' };
}

/** Module graph / compiler errors (unresolved import, disallowed package, cycle). */
export function compilerDiagnostic(message: string, path: string, line?: number | null, column?: number | null, severity: DiagnosticSeverity = 'error'): Diagnostic {
  return { severity, message, path, range: line ? point(line, column ?? 1) : null, origin: 'compiler' };
}

/** A Monaco marker (`monaco.editor.IMarker`); severity 8 = error, 4 = warning, else info. */
export interface MarkerLike { severity: number; message: string; startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number; resource?: { path: string } }
export function fromMarker(marker: MarkerLike, path = marker.resource?.path.replace(/^\//, '') ?? ''): Diagnostic {
  return {
    severity: marker.severity >= 8 ? 'error' : marker.severity >= 4 ? 'warning' : 'info',
    message: marker.message,
    path,
    range: { startLine: marker.startLineNumber, startColumn: marker.startColumn, endLine: marker.endLineNumber, endColumn: marker.endColumn },
    origin: 'typescript',
  };
}

/** A runtime error reported by the preview frame (path/line already mapped to the module). */
export function fromRuntime(error: { message: string; path?: string | null; line?: number | null; column?: number | null }): Diagnostic {
  return { severity: 'error', message: error.message, path: error.path ?? '', range: error.line ? point(error.line, error.column ?? 1) : null, origin: 'runtime' };
}

const RANK: Record<DiagnosticSeverity, number> = { error: 0, warning: 1, info: 2 };

/** Problems tab: grouped by file (files sorted, unknown location last), errors first, then by line. */
export function groupByFile(list: readonly Diagnostic[]): { path: string; items: Diagnostic[] }[] {
  const map = new Map<string, Diagnostic[]>();
  for (const d of list) map.set(d.path, [...(map.get(d.path) ?? []), d]);
  return [...map.entries()]
    .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)))
    .map(([path, items]) => ({ path, items: items.sort((x, y) => RANK[x.severity] - RANK[y.severity] || (x.range?.startLine ?? 0) - (y.range?.startLine ?? 0)) }));
}

export const countBySeverity = (list: readonly Diagnostic[]) => ({
  errors: list.filter((d) => d.severity === 'error').length,
  warnings: list.filter((d) => d.severity === 'warning').length,
});
