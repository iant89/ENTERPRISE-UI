/**
 * Code Studio C2: pure VFS path helpers. Paths are POSIX, relative to the project root, with no
 * leading slash, no `.`/`..` segments and no duplicate slashes. Built on the M3-02 rules in
 * model/project.ts so Design and Code share one definition.
 */
import { basename as base, dirname as dir, extname as ext, normalize as norm, ProjectError, relativeSpecifier, validateFolder, validatePath, type FilePath } from '../../model/project';

export type PathErrorCode = 'empty' | 'escapes-root' | 'invalid-segment' | 'invalid-extension' | 'case-clash' | 'exists';
export interface PathError { code: PathErrorCode; message: string }
export type PathResult = { ok: true; path: FilePath } | { ok: false; error: PathError };

const wrap = (fn: () => FilePath): PathResult => {
  try { return { ok: true, path: fn() }; } catch (e) {
    if (e instanceof ProjectError) return { ok: false, error: { code: e.code as PathErrorCode, message: e.message } };
    throw e;
  }
};

export const basename = base;
export const dirname = dir;
export const extname = ext;

/** Normalises a path; rejects empty paths and traversal outside the root (`../x`). */
export const normalizePath = (path: string): PathResult => wrap(() => norm(path));

/** A user-entered file path: normalised, no `..` at all, allowed characters and extension. */
export const checkFilePath = (path: string): PathResult => wrap(() => validatePath(path));
/** A user-entered folder path: the same segment rules, no extension rule. */
export const checkFolderPath = (path: string): PathResult => wrap(() => validateFolder(path));

/** Joins segments and normalises (`join('src', '../x')` escapes only if it leaves the root). */
export const join = (...parts: string[]): FilePath => norm(parts.filter(Boolean).join('/'));

/** Relative specifier from a file to a target (`./x`, `../y/z`). */
export const relative = (from: FilePath, to: FilePath): string => relativeSpecifier(from, to);

/**
 * The existing path that equals `candidate` ignoring letter case (and is not `candidate` itself or
 * in `ignore`), checked for the file and for every folder along its path.
 */
export function caseCollision(paths: Iterable<FilePath>, candidate: FilePath, ignore: ReadonlySet<FilePath> = new Set()): FilePath | null {
  const want = new Map<string, FilePath>();
  const segs = candidate.split('/');
  for (let i = 1; i <= segs.length; i++) { const p = segs.slice(0, i).join('/'); want.set(p.toLowerCase(), p); }
  for (const p of paths) {
    if (ignore.has(p)) continue;
    const ps = p.split('/');
    for (let i = 1; i <= ps.length; i++) {
      const prefix = ps.slice(0, i).join('/');
      const hit = want.get(prefix.toLowerCase());
      if (hit !== undefined && hit !== prefix) return prefix;
    }
  }
  return null;
}

/** `checkFilePath` plus exact and case-only collisions against existing paths. */
export function checkNewFile(paths: readonly FilePath[], path: string, ignore: ReadonlySet<FilePath> = new Set()): PathResult {
  const r = checkFilePath(path);
  if (!r.ok) return r;
  if (paths.includes(r.path) && !ignore.has(r.path)) return { ok: false, error: { code: 'exists', message: `"${r.path}" already exists` } };
  const clash = caseCollision(paths, r.path, ignore);
  if (clash) return { ok: false, error: { code: 'case-clash', message: `"${r.path}" differs from "${clash}" only in letter case` } };
  return r;
}
