import type { TreeNode as UiTreeNode } from '@enterprise-ui/react';
import { ALLOWED_EXTENSIONS, LIMITS, basename, renameFileWithReport, renameFolderWithReport, type Project, dirname, extname, findImportSpecifiers, listTree, resolveImport, type FilePath, type TreeNode } from '../model/project';

/**
 * Pure helpers for the Files pane (UX-4 / M3-08): tree nodes, validation copy, focus rules and
 * import bookkeeping. The React component in FileTree.tsx only wires these to the EUI `Tree`.
 */

export const FOLDER_PREFIX = 'dir:';
export const folderId = (path: FilePath) => FOLDER_PREFIX + path;
export const isFolderId = (id: string) => id.startsWith(FOLDER_PREFIX);
export const pathOf = (id: string) => (isFolderId(id) ? id.slice(FOLDER_PREFIX.length) : id);

export type FileIconName = 'FileCode' | 'FileCode2' | 'FlaskConical' | 'FileType' | 'FileJson' | 'FileText';

export function fileKind(path: FilePath): FileIconName {
  if (/\.test\.[jt]sx?$/.test(path)) return 'FlaskConical';
  switch (extname(path)) {
    case '.tsx': case '.jsx': return 'FileCode';
    case '.ts': case '.js': return 'FileCode2';
    case '.css': return 'FileType';
    case '.json': return 'FileJson';
    default: return 'FileText';
  }
}

export interface FileNode extends UiTreeNode { path: FilePath; folder: boolean; children?: FileNode[] }

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

/** EUI `Tree` nodes: folders first, numeric A–Z, the entry pinned first in its folder (§4.1). */
export function buildTreeNodes(files: Record<FilePath, string>, entry: FilePath): FileNode[] {
  const convert = (nodes: TreeNode[]): FileNode[] => {
    const out = nodes.map((n): FileNode => (n.kind === 'folder'
      ? { id: folderId(n.path), label: n.name, path: n.path, folder: true, children: convert(n.children) }
      : { id: n.path, label: n.name, path: n.path, folder: false }));
    return out.sort((a, b) => {
      if (a.folder !== b.folder) return a.folder ? -1 : 1;
      if (a.path === entry) return -1;
      if (b.path === entry) return 1;
      return collator.compare(a.label, b.label) || (a.label < b.label ? -1 : 1);
    });
  };
  return convert(listTree(files));
}

export function walk(nodes: FileNode[], visit: (node: FileNode, parent: FileNode | null, siblings: FileNode[]) => void, parent: FileNode | null = null) {
  for (const n of nodes) { visit(n, parent, nodes); if (n.children) walk(n.children, visit, n); }
}

// ---------------------------------------------------------------- validation (§4.4)

export const MESSAGES = {
  empty: 'Enter a file name.',
  chars: 'Use letters, numbers, dots, hyphens or underscores.',
  escape: "Paths can't go outside the project.",
  ext: `Studio supports ${ALLOWED_EXTENSIONS.slice(0, -1).join(', ')} and ${ALLOWED_EXTENSIONS.at(-1)} files.`,
  noExt: 'Add a file extension, for example .tsx.',
  root: 'Only .md and .json files can go at the root. Put other files in src/.',
  files: `Projects can have up to ${LIMITS.files} files.`,
  bytes: 'This project has reached 10 MB.',
  moveClash: 'A file with this name already exists there.',
  exists: (name: string, folder: string) => `“${name}” already exists in ${folder || 'the project root'}.`,
  caseClash: (name: string, other: string) => `“${name}” differs from “${other}” only in letter case. This breaks on macOS and Windows.`,
} as const;

export interface ValidateContext {
  files: Record<FilePath, string>;
  /** Folder the typed name is relative to ('' = root). */
  folder: FilePath;
  kind: 'file' | 'folder';
  mode: 'create' | 'rename' | 'move';
  /** The file or folder being renamed or moved (ignored when checking clashes). */
  self?: FilePath;
}

export interface Validation { path: FilePath | null; error: string | null }

const projectBytes = (files: Record<FilePath, string>) => {
  const enc = new TextEncoder();
  let total = 0;
  for (const t of Object.values(files)) total += enc.encode(t).length;
  return total;
};

/** Validates a typed name against §4.4 and returns the full path or the exact message. */
export function validateEntry(input: string, ctx: ValidateContext): Validation {
  const name = input.trim();
  const bad = (error: string): Validation => ({ path: null, error });
  if (!name) return bad(MESSAGES.empty);
  const segs = name.split('/');
  if (name.startsWith('/') || segs.some((s) => s === '' || s === '..' || s === '.')) return bad(MESSAGES.escape);
  if (segs.some((s) => !/^[A-Za-z0-9._-]+$/.test(s))) return bad(MESSAGES.chars);
  const path = ctx.folder ? `${ctx.folder}/${name}` : name;
  if (ctx.kind === 'file') {
    const ext = extname(path);
    if (!ext) return bad(MESSAGES.noExt);
    if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) return bad(MESSAGES.ext);
    if (ctx.mode === 'create' && !path.startsWith('src/') && !['.md', '.json'].includes(ext)) return bad(MESSAGES.root);
  }
  if (ctx.mode === 'create') {
    if (Object.keys(ctx.files).length >= LIMITS.files) return bad(MESSAGES.files);
    if (projectBytes(ctx.files) >= LIMITS.projectBytes) return bad(MESSAGES.bytes);
  }
  const self = ctx.self;
  const inSelf = (p: FilePath) => !!self && (p === self || p.startsWith(`${self}/`));
  const others = Object.keys(ctx.files).filter((p) => !inSelf(p));
  const taken = new Map<string, FilePath>();
  for (const f of others) {
    taken.set(f.toLowerCase(), f);
    for (let d = dirname(f); d; d = dirname(d)) taken.set(d.toLowerCase(), d);
  }
  const parts = path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const prefix = parts.slice(0, i).join('/');
    const hit = taken.get(prefix.toLowerCase());
    if (!hit) continue;
    const last = i === parts.length;
    const isFile = others.includes(hit);
    if (hit === prefix) {
      if (!last && !isFile) continue; // walking through an existing folder is fine
      if (ctx.mode === 'move') return bad(MESSAGES.moveClash);
      return bad(MESSAGES.exists(basename(prefix), dirname(prefix)));
    }
    return bad(MESSAGES.caseClash(basename(prefix), basename(hit)));
  }
  return { path, error: null };
}

// ---------------------------------------------------------------- create

/** Target folder for New file / New folder: the focused folder, a focused file's parent (may be the root), or src (§4.3). */
export function targetFolder(focusedId: string | null): FilePath {
  if (!focusedId) return 'src';
  if (isFolderId(focusedId)) return pathOf(focusedId);
  return dirname(focusedId); // a root-level file targets the root ('' — only .md/.json are allowed there)
}

export const newFilePrefill = () => ({ value: 'Component.tsx', select: [0, 9] as [number, number] });
export const newFolderPrefill = () => ({ value: 'components/Component.tsx', select: [0, 10] as [number, number] });

export function pascalCase(path: FilePath): string {
  const stem = basename(path).replace(/\..*$/, '');
  const name = stem.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  return /^[A-Za-z]/.test(name) ? name : `Component${name}`;
}

/** Default text for a new file: a starter component for `.tsx`, empty otherwise (§4.3). */
export function starterContent(path: FilePath): string {
  if (extname(path) !== '.tsx') return '';
  const name = pascalCase(path);
  return `import { Text } from '@enterprise-ui/react';\n\nexport default function ${name}() {\n  return <Text>${name}</Text>;\n}\n`;
}

/**
 * "Header-copy.tsx", then "Header-copy-2.tsx" … without stacking suffixes. The spec's
 * "Header copy.tsx" has a space, which the path rules (PR #17 §2.1) reject, so a hyphen is used.
 */
export function copyName(path: FilePath, files: Record<FilePath, string>): FilePath {
  const dir = dirname(path);
  const ext = extname(path);
  const stem = basename(path).slice(0, ext ? -ext.length : undefined).replace(/-copy(-\d+)?$/, '');
  const at = (s: string) => (dir ? `${dir}/${s}${ext}` : `${s}${ext}`);
  if (!(at(`${stem}-copy`) in files)) return at(`${stem}-copy`);
  for (let n = 2; ; n++) if (!(at(`${stem}-copy-${n}`) in files)) return at(`${stem}-copy-${n}`);
}

// ---------------------------------------------------------------- imports bookkeeping

/** Files (other than moved ones) whose text changed because of a move. */
export function rewrittenFiles(before: Record<FilePath, string>, after: Record<FilePath, string>, moves: Map<FilePath, FilePath>): FilePath[] {
  const out: FilePath[] = [];
  for (const [p, text] of Object.entries(before)) {
    const next = moves.get(p) ?? p;
    if (after[next] !== undefined && after[next] !== text) out.push(next);
  }
  return out;
}

/**
 * What a rename/move of a tree item (file path or `dir:` folder id) will do, from the M3-02
 * `renameFileWithReport` / `renameFolderWithReport`: files whose imports were rewritten, and the
 * `skipped` files the store couldn't check because they don't parse (§4.5).
 */
export function moveReport(project: Project, id: string, to: FilePath): { rewritten: FilePath[]; skipped: FilePath[] } {
  const from = pathOf(id);
  const folder = isFolderId(id);
  const report = folder ? renameFolderWithReport(project, from, to) : renameFileWithReport(project, from, to);
  const moved = Object.keys(project.files).filter((p) => (folder ? p.startsWith(`${from}/`) : p === from));
  const moves = new Map(moved.map((p) => [p, folder ? to + p.slice(from.length) : to] as const));
  const targets = new Set(moves.values());
  return { rewritten: rewrittenFiles(project.files, report.project.files, moves).filter((p) => !targets.has(p)), skipped: report.skipped };
}

/** Toast title for skipped files: "Renamed to X. Couldn't check imports in 2 files:". */
export const skippedMessage = (head: string, skipped: FilePath[]) =>
  `${head} Couldn't check imports in ${skipped.length} ${skipped.length === 1 ? 'file' : 'files'}:`;

/** Files with a relative import that resolves to `target`. */
export function importersOf(files: Record<FilePath, string>, target: FilePath): FilePath[] {
  return Object.keys(files).filter((p) => p !== target && (findImportSpecifiers(files[p], p) ?? []).some((s) => resolveImport(files, p, s.value) === target));
}

const folderSet = (files: Record<FilePath, string>) => {
  const s = new Set<FilePath>();
  for (const f of Object.keys(files)) for (let d = dirname(f); d; d = dirname(d)) s.add(d);
  return s;
};

/** Folders present before but not after (they lost their last file). */
export function removedFolders(before: Record<FilePath, string>, after: Record<FilePath, string>): FilePath[] {
  const now = folderSet(after);
  const gone = [...folderSet(before)].filter((d) => !now.has(d));
  return gone.filter((d) => !gone.includes(dirname(d)) || !dirname(d)).sort();
}

// ---------------------------------------------------------------- focus

/** After a delete: next sibling, else previous sibling, else parent (§4.7). */
export function deleteFocusTarget(nodes: FileNode[], id: string): string | null {
  let result: string | null = null;
  walk(nodes, (n, parent, siblings) => {
    if (n.id !== id) return;
    const i = siblings.indexOf(n);
    result = siblings[i + 1]?.id ?? siblings[i - 1]?.id ?? (parent ? `^${parent.id}` : null);
  });
  // An only child takes its folder with it, so focus moves as if the folder were deleted.
  const found = result as string | null;
  if (found?.startsWith('^')) return deleteFocusTarget(nodes, found.slice(1)) ?? found.slice(1);
  return found;
}

/** Files reachable from the entry through relative imports (UX-2 "not used by the entry page"). */
export function reachableFrom(files: Record<FilePath, string>, entry: FilePath): Set<FilePath> {
  const seen = new Set<FilePath>();
  const stack = [entry];
  while (stack.length) {
    const p = stack.pop()!;
    if (seen.has(p) || !(p in files)) continue;
    seen.add(p);
    for (const s of findImportSpecifiers(files[p], p) ?? []) {
      const t = resolveImport(files, p, s.value);
      if (t) stack.push(t);
    }
    // CSS imported by path ('./styles.css') resolves exactly; nothing else to follow.
  }
  return seen;
}
