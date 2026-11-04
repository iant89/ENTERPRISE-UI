/** Code Studio C2: recent files, most recent first (UI pending mockups). */
import type { FilePath } from '../../model/project';

export const RECENT_LIMIT = 20;

export const touchRecent = (recent: readonly FilePath[], path: FilePath): FilePath[] =>
  recent[0] === path ? [...recent] : [path, ...recent.filter((p) => p !== path)].slice(0, RECENT_LIMIT);

/** Follows renames and moves. */
export const renameRecent = (recent: readonly FilePath[], moves: ReadonlyMap<FilePath, FilePath>): FilePath[] =>
  moves.size ? recent.map((p) => moves.get(p) ?? p) : [...recent];

/** Drops files that no longer exist. */
export const pruneRecent = (recent: readonly FilePath[], files: Readonly<Record<FilePath, string>>): FilePath[] =>
  recent.filter((p) => Object.hasOwn(files, p));
