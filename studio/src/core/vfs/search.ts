/** Code Studio C2: deterministic local search across project files (UI pending mockups). */
import type { FilePath } from '../../model/project';

export interface SearchOptions { regex?: boolean; caseSensitive?: boolean; wholeWord?: boolean; maxResults?: number; include?: (path: FilePath) => boolean }
export interface SearchMatch { path: FilePath; line: number; column: number; endLine: number; endColumn: number; preview: string }
export type SearchResult = { ok: true; matches: SearchMatch[]; truncated: boolean; fileCount: number } | { ok: false; error: string };

export const DEFAULT_MAX_RESULTS = 1000;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds the matcher. Invalid regexes come back as an error message. */
export function buildMatcher(query: string, o: SearchOptions = {}): RegExp | string {
  let source = o.regex ? query : escape(query);
  if (o.wholeWord) source = `(?<![\\w$])(?:${source})(?![\\w$])`;
  try { return new RegExp(source, `g${o.caseSensitive ? '' : 'i'}m`); } catch (e) { return (e as Error).message; }
}

/** Searches every file (sorted by path) and returns 1-based line/column ranges, capped at `maxResults`. */
export function searchFiles(files: Readonly<Record<FilePath, string>>, query: string, o: SearchOptions = {}): SearchResult {
  if (!query) return { ok: true, matches: [], truncated: false, fileCount: 0 };
  const re = buildMatcher(query, o);
  if (typeof re === 'string') return { ok: false, error: re };
  const max = o.maxResults ?? DEFAULT_MAX_RESULTS;
  const matches: SearchMatch[] = [];
  const hitFiles = new Set<FilePath>();
  for (const path of Object.keys(files).sort()) {
    if (o.include && !o.include(path)) continue;
    const text = files[path];
    const starts = [0];
    for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
    const pos = (offset: number) => {
      let lo = 0, hi = starts.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= offset) lo = mid; else hi = mid - 1; }
      return { line: lo + 1, column: offset - starts[lo] + 1 };
    };
    re.lastIndex = 0;
    for (let m; (m = re.exec(text));) {
      if (m[0] === '') { re.lastIndex++; continue; }
      if (matches.length >= max) return { ok: true, matches, truncated: true, fileCount: hitFiles.size };
      const a = pos(m.index), b = pos(m.index + m[0].length);
      const lineEnd = text.indexOf('\n', starts[a.line - 1]);
      matches.push({ path, line: a.line, column: a.column, endLine: b.line, endColumn: b.column, preview: text.slice(starts[a.line - 1], lineEnd < 0 ? undefined : lineEnd) });
      hitFiles.add(path);
    }
  }
  return { ok: true, matches, truncated: false, fileCount: hitFiles.size };
}
