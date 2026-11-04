/**
 * Code Studio C2: rewrites relative module specifiers after files move. Scripts are parsed with
 * Babel (import/export/`import()`/`require`); CSS uses a small `@import` scanner. Only the
 * specifier text is spliced, the extension style is kept, bare imports are left alone, and a
 * file nothing changed in is returned as the very same string.
 */
import { basename, dirname, extname, findImportSpecifiers, relativeSpecifier, resolveImport, resolveRelative, type FilePath, type ImportSpecifier } from '../../model/project';

export type UnresolvedReason = 'unresolved' | 'dynamic' | 'alias';
export interface Unresolved { file: FilePath; specifier: string; /** 1-based line (C2 feedback UI). */ line?: number; reason?: UnresolvedReason }
export interface RewriteResult {
  files: Record<FilePath, string>;
  /** Files (at their new paths) whose text changed. */
  rewritten: FilePath[];
  /** Relative specifiers in affected files that did not resolve before the move, left as they were. */
  unresolved: Unresolved[];
  /** Script files that do not parse, so their specifiers could not be checked. */
  skipped: FilePath[];
  /** Rewritten specifiers per file (new paths). */
  counts: Record<FilePath, number>;
}

const lineAt = (text: string, offset: number) => text.slice(0, offset).split('\n').length;
const stripTs = (p: string) => p.replace(/\.(tsx?|jsx?)$/, '');

/**
 * Imports Studio can't rewrite safely that may point at a moved file: dynamic `import()` built from
 * a relative prefix (template or `+`) whose folder holds a moved file, and `@/` / `~/` aliases
 * whose tail names a moved file.
 */
export function findUnsafeImports(files: Readonly<Record<FilePath, string>>, moves: ReadonlyMap<FilePath, FilePath>): Unresolved[] {
  const moved = [...moves.keys()];
  const out: Unresolved[] = [];
  for (const [path, text] of Object.entries(files)) {
    if (!/\.(tsx?|jsx?)$/.test(path)) continue;
    const dyn = /import\(\s*(?:`([^`$]*)\$\{[^)]*|(['"])([^'"]*)\2\s*\+[^)]*)\)/g;
    for (let m; (m = dyn.exec(text));) {
      const prefix = m[1] ?? m[3];
      if (!isRelative(prefix)) continue;
      let dir: FilePath | null;
      try { dir = resolveRelative(path, prefix.endsWith('/') ? prefix.slice(0, -1) || '.' : prefix); } catch { dir = null; }
      if (dir === null) continue;
      if (moved.some((p) => p.startsWith(dir ? `${dir}/` : '') && p !== path)) out.push({ file: moves.get(path) ?? path, specifier: m[0], line: lineAt(text, m.index), reason: 'dynamic' });
    }
    const alias = /(?:from\s+|import\(\s*)(['"])([@~]\/[^'"]+)\1/g;
    for (let m; (m = alias.exec(text));) {
      const tail = stripTs(m[2].slice(2));
      if (moved.some((p) => stripTs(p).endsWith(`/${tail}`) || stripTs(p) === tail)) out.push({ file: moves.get(path) ?? path, specifier: m[2], line: lineAt(text, m.index), reason: 'alias' });
    }
  }
  return out;
}

const join = (d: FilePath, n: string) => (d ? `${d}/${n}` : n);
const stripExt = (p: string) => { const e = extname(p); return e ? p.slice(0, -e.length) : p; };
const isRelative = (s: string) => s === '.' || s === '..' || s.startsWith('./') || s.startsWith('../');

/** `@import "x.css";` / `@import url(x.css);` specifiers in CSS, ignoring comments. Offsets include quotes when present. */
export function findCssImports(text: string): ImportSpecifier[] {
  const blanked = text.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
  const out: ImportSpecifier[] = [];
  const re = /@import\s+(?:url\(\s*)?(["']?)([^"')\s;]+)\1/g;
  for (let m; (m = re.exec(blanked));) {
    const q = m[1].length;
    const valueStart = m.index + m[0].length - q - m[2].length;
    out.push({ value: m[2], start: valueStart - q, end: valueStart + m[2].length + q });
  }
  return out;
}

const specifiersOf = (text: string, path: FilePath): ImportSpecifier[] | null => (extname(path) === '.css' ? findCssImports(text) : findImportSpecifiers(text, path));

/** Applies `moves` (old path → new path) to `files` and rewrites the specifiers that need it. */
export function rewriteImports(files: Record<FilePath, string>, moves: ReadonlyMap<FilePath, FilePath>): RewriteResult {
  const next: Record<FilePath, string> = {};
  const rewritten: FilePath[] = [];
  const unresolved: Unresolved[] = [];
  const skipped: FilePath[] = [];
  const counts: Record<FilePath, number> = {};
  const movedKeys: Record<FilePath, string> = {};
  for (const p of Object.keys(files)) movedKeys[moves.get(p) ?? p] = '';
  for (const [oldPath, text] of Object.entries(files)) {
    const importer = moves.get(oldPath) ?? oldPath;
    const specs = specifiersOf(text, oldPath);
    let out = text;
    if (!specs) skipped.push(importer);
    for (const s of specs ? [...specs].reverse() : []) {
      if (!isRelative(s.value)) continue;
      const target = resolveImport(files, oldPath, s.value);
      if (!target) {
        if (importer !== oldPath) unresolved.push({ file: importer, specifier: s.value, line: lineAt(text, s.start), reason: 'unresolved' });
        continue;
      }
      const newTarget = moves.get(target) ?? target;
      if (newTarget === target && importer === oldPath) continue;
      if (resolveImport(movedKeys, importer, s.value) === newTarget) continue; // still resolves: keep it
      const base = resolveRelative(oldPath, s.value)!;
      let spec: string;
      if (base === target) spec = relativeSpecifier(importer, newTarget);
      else if (target.startsWith(join(base, 'index.')) && basename(newTarget) === basename(target)) spec = relativeSpecifier(importer, dirname(newTarget));
      else spec = relativeSpecifier(importer, stripExt(newTarget));
      const q = text[s.start] === '"' || text[s.start] === "'" ? 1 : 0;
      if (spec !== s.value) { out = out.slice(0, s.start + q) + spec + out.slice(s.end - q); counts[importer] = (counts[importer] ?? 0) + 1; }
    }
    next[importer] = out;
    if (out !== text) rewritten.push(importer);
  }
  return { files: next, rewritten: rewritten.sort(), unresolved: [...unresolved.reverse(), ...findUnsafeImports(files, moves)], skipped: skipped.sort(), counts };
}
