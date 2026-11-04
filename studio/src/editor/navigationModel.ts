/**
 * Code Studio C3: pure helpers behind go to definition, find references and rename symbol. The
 * TypeScript worker returns offsets into files; these turn them into Studio's shapes. No Monaco here,
 * so they are unit-tested directly.
 */
import type { ReferenceSet } from '../panels/bottom/ReferencesPanel';

/** A span in a VFS file, as the TS worker reports it (`fileName` already mapped to a VFS path). */
export interface Span { path: string; start: number; length: number; prefixText?: string; suffixText?: string }

/** 1-based line and column of `offset` in `text`. */
export function positionAt(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < offset && i < text.length; i++) if (text.charCodeAt(i) === 10) { line++; lineStart = i + 1; }
  return { line, column: offset - lineStart + 1 };
}

/** Offset of a 1-based line/column in `text`. */
export function offsetAt(text: string, line: number, column: number): number {
  let offset = 0;
  for (let l = 1; l < line; l++) {
    const nl = text.indexOf('\n', offset);
    if (nl < 0) return text.length;
    offset = nl + 1;
  }
  return Math.min(text.length, offset + column - 1);
}

const lineText = (text: string, line: number) => text.split('\n')[line - 1] ?? '';

/** Groups reference spans by file (files in path order, references in text order), skipping unknown files. */
export function groupReferences(files: Readonly<Record<string, string>>, symbol: string, spans: readonly Span[]): ReferenceSet {
  const byFile = new Map<string, ReferenceSet['groups'][number]['items']>();
  const seen = new Set<string>();
  for (const s of spans) {
    const text = files[s.path];
    if (text === undefined) continue;
    const key = `${s.path}:${s.start}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const a = positionAt(text, s.start);
    const b = positionAt(text, s.start + s.length);
    const items = byFile.get(s.path) ?? [];
    items.push({ line: a.line, column: a.column, endColumn: b.line === a.line ? b.column : a.column + s.length, preview: lineText(text, a.line) });
    byFile.set(s.path, items);
  }
  const groups = [...byFile].sort(([a], [b]) => (a < b ? -1 : 1)).map(([path, items]) => ({ path, items: items.sort((x, y) => x.line - y.line || x.column - y.column) }));
  return { symbol, groups };
}

/** True when `name` is a valid JavaScript identifier (rename input validation). */
export const isIdentifier = (name: string) => /^[A-Za-z_$][\w$]*$/.test(name) && !RESERVED.has(name);
const RESERVED = new Set('break case catch class const continue debugger default delete do else enum export extends false finally for function if import in instanceof new null return super switch this throw true try typeof var void while with yield let static implements interface package private protected public await'.split(' '));

export interface RenamePlan {
  /** New text of every file that changes. */
  files: Record<string, string>;
  /** Edits per file, in path order (the result strip lists them). */
  edits: { path: string; count: number }[];
}

/**
 * Applies rename locations to the files: each span is replaced with prefix + newName + suffix (TS
 * uses prefix/suffix for shorthand properties and import aliases). Overlapping or out-of-range
 * spans are ignored, so a stale location can never corrupt a file.
 */
export function planRename(files: Readonly<Record<string, string>>, spans: readonly Span[], newName: string): RenamePlan {
  const byFile = new Map<string, Span[]>();
  for (const s of spans) if (files[s.path] !== undefined) byFile.set(s.path, [...(byFile.get(s.path) ?? []), s]);
  const out: Record<string, string> = {};
  const edits: RenamePlan['edits'] = [];
  for (const [path, list] of [...byFile].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const original = files[path];
    // Keep spans in range and not overlapping an earlier one, then apply them from the end.
    const kept: Span[] = [];
    let end = 0;
    for (const s of [...list].sort((a, b) => a.start - b.start || b.length - a.length)) {
      if (s.start < 0 || s.length < 0 || s.start + s.length > original.length || s.start < end) continue;
      kept.push(s);
      end = s.start + s.length;
    }
    let text = original;
    for (const s of kept.reverse()) text = text.slice(0, s.start) + (s.prefixText ?? '') + newName + (s.suffixText ?? '') + text.slice(s.start + s.length);
    const count = kept.length;
    if (count && text !== files[path]) { out[path] = text; edits.push({ path, count }); }
  }
  return { files: out, edits };
}

/** The file to offer in "Also rename the file?": a renamed file whose base name is the old symbol. */
export function fileNamedAfter(paths: readonly string[], symbol: string): string | null {
  return paths.find((p) => { const base = p.slice(p.lastIndexOf('/') + 1); return base.slice(0, base.lastIndexOf('.')) === symbol; }) ?? null;
}
