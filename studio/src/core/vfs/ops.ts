/**
 * Code Studio C2: pure, all-or-nothing operations on the path → text map. Each returns a new map
 * (plus the moves it made, for tabs/recent/undo) or a typed error, never a partial result.
 * Folders are implicit; `createFolder` only validates a path that the UI holds until a file exists.
 */
import { copyName } from '../../files/fileTreeModel';
import { ProjectError, type FilePath } from '../../model/project';
import { basename, caseCollision, checkFilePath, checkFolderPath, checkNewFile, type PathErrorCode } from './paths';
import { rewriteImports, type Unresolved } from './rewriteImports';

export type Files = Readonly<Record<FilePath, string>>;
export type VfsErrorCode = PathErrorCode | 'not-found' | 'entry' | 'into-itself' | 'folder-exists';
export interface VfsError { code: VfsErrorCode; message: string }
export interface VfsChange {
  ok: true;
  files: Record<FilePath, string>;
  /** Old path → new path for every moved file. */
  moves: Map<FilePath, FilePath>;
  rewritten: FilePath[];
  unresolved: Unresolved[];
  skipped: FilePath[];
  /** For undo labels: 'Create file', 'Rename folder', 'Move file'… */
  label: string;
}
export type VfsResult = VfsChange | { ok: false; error: VfsError };

const err = (code: VfsErrorCode, message: string): VfsResult => ({ ok: false, error: { code, message } });
const change = (files: Record<FilePath, string>, label: string, extra: Partial<VfsChange> = {}): VfsChange => ({ ok: true, files, moves: new Map(), rewritten: [], unresolved: [], skipped: [], label, ...extra });
const under = (folder: FilePath) => (p: FilePath) => p.startsWith(`${folder}/`);
export const isFolder = (files: Files, path: FilePath) => Object.keys(files).some(under(path));

export function createFile(files: Files, path: string, text = ''): VfsResult {
  const r = checkNewFile(Object.keys(files), path);
  if (!r.ok) return { ok: false, error: r.error };
  if (isFolder(files, r.path)) return err('folder-exists', `"${r.path}" is a folder`);
  return change({ ...files, [r.path]: text }, 'Create file');
}

/** Validates a new (empty) folder. Returns its path for UI state; the file map is unchanged. */
export function createFolder(files: Files, path: string, pending: readonly FilePath[] = []): { ok: true; path: FilePath } | { ok: false; error: VfsError } {
  const r = checkFolderPath(path);
  if (!r.ok) return r;
  if (r.path in files) return { ok: false, error: { code: 'exists', message: `"${r.path}" is a file` } };
  if (isFolder(files, r.path) || pending.includes(r.path)) return { ok: false, error: { code: 'folder-exists', message: `Folder "${r.path}" already exists` } };
  const clash = caseCollision([...Object.keys(files), ...pending], r.path);
  if (clash) return { ok: false, error: { code: 'case-clash', message: `"${r.path}" differs from "${clash}" only in letter case` } };
  return { ok: true, path: r.path };
}

/** Renames (or moves, if the folder changes) a file or a folder subtree, rewriting imports. */
export function rename(files: Files, from: FilePath, to: string): VfsResult {
  const folder = !(from in files);
  if (folder && !isFolder(files, from)) return err('not-found', `"${from}" does not exist`);
  const r = folder ? checkFolderPath(to) : checkFilePath(to);
  if (!r.ok) return { ok: false, error: r.error };
  const dest = r.path;
  if (dest === from) return change({ ...files }, folder ? 'Rename folder' : 'Rename file');
  if (folder && dest.startsWith(`${from}/`)) return err('into-itself', 'A folder cannot move into itself');
  const members = folder ? Object.keys(files).filter(under(from)) : [from];
  const moves = new Map(members.map((m) => [m, folder ? dest + m.slice(from.length) : dest] as const));
  const rest = Object.keys(files).filter((p) => !moves.has(p));
  const moving = new Set(moves.keys());
  for (const target of moves.values()) {
    if (rest.includes(target)) return err('exists', `"${target}" already exists`);
    if (isFolder(Object.fromEntries(rest.map((p) => [p, ''])), target)) return err('folder-exists', `"${target}" is a folder`);
    const clash = caseCollision(rest, target, moving);
    if (clash) return err('case-clash', `"${target}" differs from "${clash}" only in letter case`);
  }
  if (folder && rest.some(under(dest))) return err('folder-exists', `Folder "${dest}" already exists`);
  const moved = (a: FilePath, b: FilePath) => a.slice(0, a.lastIndexOf('/') + 1) !== b.slice(0, b.lastIndexOf('/') + 1);
  const label = `${moved(from, dest) ? 'Move' : 'Rename'} ${folder ? 'folder' : 'file'}`;
  const out = rewriteImports(files, moves);
  return change(out.files, label, { moves, rewritten: out.rewritten.filter((p) => ![...moves.values()].includes(p)), unresolved: out.unresolved, skipped: out.skipped });
}

/** Moves a file or folder into `toFolder` ('' is the root). */
export function move(files: Files, from: FilePath, toFolder: FilePath): VfsResult {
  const name = basename(from);
  return rename(files, from, toFolder ? `${toFolder}/${name}` : name);
}

/** Copies a file next to itself: `Name-copy.tsx`, then `Name-copy-2.tsx`. */
export function duplicate(files: Files, path: FilePath): VfsResult {
  if (!(path in files)) return err('not-found', `"${path}" does not exist`);
  const to = copyName(path, files as Record<FilePath, string>);
  return change({ ...files, [to]: files[path] }, 'Duplicate file', { moves: new Map([[path, to]]) });
}

/** Deletes a file or a folder subtree. The entry file (or a folder holding it) is refused. */
export function remove(files: Files, path: FilePath, entry?: FilePath): VfsResult {
  const folder = !(path in files);
  const victims = folder ? Object.keys(files).filter(under(path)) : [path];
  if (!victims.length) return err('not-found', `"${path}" does not exist`);
  if (entry && victims.includes(entry)) return err('entry', folder ? 'The folder holds the entry file' : 'The entry file cannot be deleted');
  const next = { ...files };
  for (const v of victims) delete next[v];
  return change(next, folder ? 'Delete folder' : 'Delete file');
}

/** Converts a VFS error into the ProjectError the store throws (callers validate first). */
export const toProjectError = (e: VfsError) => new ProjectError(e.code === 'folder-exists' ? 'folder-exists' : (e.code as never), e.message);
