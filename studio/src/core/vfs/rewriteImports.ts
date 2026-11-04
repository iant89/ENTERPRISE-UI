/**
 * Code Studio C2: rewrites relative module specifiers after files move. Scripts are parsed with
 * Babel (import/export/`import()`/`require`); CSS uses a small `@import` scanner. Only the
 * specifier text is spliced, the extension style is kept, bare imports are left alone, and a
 * file nothing changed in is returned as the very same string.
 */
import { basename, dirname, extname, findImportSpecifiers, relativeSpecifier, resolveImport, resolveRelative, type FilePath, type ImportSpecifier } from '../../model/project';

export interface Unresolved { file: FilePath; specifier: string }
export interface RewriteResult {
  files: Record<FilePath, string>;
  /** Files (at their new paths) whose text changed. */
  rewritten: FilePath[];
  /** Relative specifiers in affected files that did not resolve before the move, left as they were. */
  unresolved: Unresolved[];
  /** Script files that do not parse, so their specifiers could not be checked. */
  skipped: FilePath[];
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
        if (importer !== oldPath) unresolved.push({ file: importer, specifier: s.value });
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
      if (spec !== s.value) out = out.slice(0, s.start + q) + spec + out.slice(s.end - q);
    }
    next[importer] = out;
    if (out !== text) rewritten.push(importer);
  }
  return { files: next, rewritten: rewritten.sort(), unresolved: unresolved.reverse(), skipped: skipped.sort() };
}
