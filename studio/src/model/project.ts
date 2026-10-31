import { parse } from '@babel/parser';

/**
 * The Studio project and its virtual file system (VFS), per docs/plans/studio-m3-design.md §2.1
 * and ide-design.md §5.1. The VFS is a flat map from normalised path to text; folders are implied
 * by paths. Every function here is pure: it returns a new `Project` (unchanged file strings are
 * shared) or, with `{ command: true }`, a reversible `{ do, undo }` command for the history.
 */

export type FilePath = string; // normalised POSIX, no leading slash: 'src/App.tsx'
export interface ProjectFile { path: FilePath; text: string }
export interface Project {
  id: string;
  name: string;
  files: Record<FilePath, string>;
  entry: FilePath;
  createdAt: number;
  updatedAt: number;
  template?: string;
}

export const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.md'] as const;
export const LIMITS = { files: 200, fileBytes: 1024 * 1024, projectBytes: 10 * 1024 * 1024 } as const;

export type ProjectErrorCode =
  | 'empty' | 'escapes-root' | 'invalid-segment' | 'invalid-extension' | 'exists' | 'case-clash'
  | 'folder-exists' | 'file-is-folder' | 'not-found' | 'entry' | 'into-itself'
  | 'too-many-files' | 'file-too-large' | 'project-too-large';

export class ProjectError extends Error {
  constructor(readonly code: ProjectErrorCode, message: string) {
    super(message);
    this.name = 'ProjectError';
  }
}

const fail = (code: ProjectErrorCode, message: string): never => { throw new ProjectError(code, message); };

// ---------------------------------------------------------------- paths

/** Normalises to POSIX without a leading slash; resolves `.` and `..`, rejecting escapes. */
export function normalize(path: string): FilePath {
  const out: string[] = [];
  for (const seg of path.replace(/\\/g, '/').split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (!out.length) fail('escapes-root', `"${path}" points outside the project`);
      out.pop();
    } else out.push(seg);
  }
  if (!out.length) fail('empty', 'Path is empty');
  return out.join('/');
}

const SEGMENT = /^[A-Za-z0-9._-]+$/;

function checkSegments(path: string): FilePath {
  if (path.replace(/\\/g, '/').split('/').includes('..')) fail('escapes-root', `"${path}" must not contain ".."`);
  const norm = normalize(path);
  for (const seg of norm.split('/')) if (!SEGMENT.test(seg) || /^\.+$/.test(seg)) fail('invalid-segment', `"${seg}" may only use letters, digits, ".", "_" and "-"`);
  return norm;
}

export const extname = (path: string) => { const base = basename(path); const i = base.lastIndexOf('.'); return i > 0 && !/^\.+$/.test(base.slice(0, i)) ? base.slice(i) : ''; };
export const basename = (path: string) => path.slice(path.lastIndexOf('/') + 1);
export const dirname = (path: string) => { const i = path.lastIndexOf('/'); return i < 0 ? '' : path.slice(0, i); };
const stripExt = (path: string) => { const ext = extname(path); return ext ? path.slice(0, -ext.length) : path; };

/** Validates a user-entered file path and returns it normalised. */
export function validatePath(path: string): FilePath {
  const norm = checkSegments(path);
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(extname(norm))) fail('invalid-extension', `Allowed file types: ${ALLOWED_EXTENSIONS.join(' ')}`);
  return norm;
}

/** Validates a folder path (same segment rules, no extension rule). */
export const validateFolder = (path: string): FilePath => checkSegments(path);

const isRelative = (spec: string) => spec === '.' || spec === '..' || spec.startsWith('./') || spec.startsWith('../');

/**
 * Joins a relative specifier onto the importing file's folder. Bare specifiers give `null`;
 * a specifier that lands on the project root (`.` from a root file, `..` from `src/x.tsx`) gives `''`.
 */
export function resolveRelative(from: FilePath, spec: string): FilePath | null {
  if (!isRelative(spec)) return null;
  try {
    return normalize(`${dirname(from)}/${spec}`);
  } catch (err) {
    if (err instanceof ProjectError && err.code === 'empty') return '';
    throw err;
  }
}

const join = (dir: FilePath, name: string) => (dir ? `${dir}/${name}` : name);

const IMPLICIT_EXT = ['.tsx', '.ts', '.jsx', '.js', '.json'];
const INDEX_EXT = ['.tsx', '.ts', '.jsx', '.js'];

/** Resolves a relative import to a VFS file: exact, then implied extension, then `index.*`. */
export function resolveImport(files: Record<FilePath, string>, from: FilePath, spec: string): FilePath | null {
  let base: FilePath | null;
  try { base = resolveRelative(from, spec); } catch { return null; }
  if (base === null) return null;
  if (base && base in files) return base;
  if (base) for (const ext of IMPLICIT_EXT) if (base + ext in files) return base + ext;
  for (const ext of INDEX_EXT) if (join(base, `index${ext}`) in files) return join(base, `index${ext}`);
  return null;
}

/**
 * The shortest relative specifier from a file to a target path (`./x`, `../x`). A target that is
 * the file's own folder gives `.`, an ancestor folder gives `..`, `../..`, and `''` is the root.
 */
export function relativeSpecifier(from: FilePath, to: FilePath): string {
  const a = dirname(from) ? dirname(from).split('/') : [];
  const b = to ? to.split('/') : [];
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const up = a.length - i;
  const rest = b.slice(i).join('/');
  if (!rest) return up ? Array(up).fill('..').join('/') : '.';
  return up ? `${'../'.repeat(up)}${rest}` : `./${rest}`;
}

// ---------------------------------------------------------------- imports

export interface ImportSpecifier { value: string; start: number; end: number } // offsets include quotes

const SCRIPT_EXT = ['.tsx', '.ts', '.jsx', '.js'];

/** String-literal module specifiers in a script file. `[]` for non-scripts, `null` if it does not parse. */
export function findImportSpecifiers(text: string, path: FilePath): ImportSpecifier[] | null {
  const ext = extname(path);
  if (!SCRIPT_EXT.includes(ext)) return [];
  let ast;
  try {
    ast = parse(text, { sourceType: 'module', plugins: ext === '.ts' ? ['typescript'] : ['typescript', 'jsx'] });
  } catch { return null; }
  const out: ImportSpecifier[] = [];
  const add = (n: { type: string; value?: unknown; start?: number | null; end?: number | null } | null | undefined) => {
    if (n && n.type === 'StringLiteral' && typeof n.value === 'string' && n.start != null && n.end != null) out.push({ value: n.value, start: n.start, end: n.end });
  };
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    const n = node as Record<string, unknown> & { type?: string };
    if (n.type === 'ImportDeclaration' || n.type === 'ExportNamedDeclaration' || n.type === 'ExportAllDeclaration') add(n.source as never);
    if (n.type === 'CallExpression') {
      const callee = n.callee as { type: string; name?: string };
      if (callee.type === 'Import' || (callee.type === 'Identifier' && callee.name === 'require')) add((n.arguments as never[])[0]);
    }
    if (n.type === 'ImportExpression') add(n.source as never);
    // `typeof import('./x')` / `import('./x').T`: Babel 8 uses `source`; older shapes use `argument` (maybe a TSLiteralType).
    if (n.type === 'TSImportType') {
      const arg = (n.source ?? n.argument) as { type: string; literal?: unknown } | undefined;
      add((arg?.type === 'TSLiteralType' ? arg.literal : arg) as never);
    }
    // `import z = require('./x')`
    if (n.type === 'TSExternalModuleReference') add(n.expression as never);
    // Template literals (`import(\`./x\`)`) are intentionally not treated as specifiers.
    for (const key of Object.keys(n)) {
      if (key === 'loc' || key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments' || key === 'extra') continue;
      walk(n[key]);
    }
  };
  walk(ast.program);
  return out.sort((x, y) => x.start - y.start);
}

/**
 * Applies a move map (old path -> new path) to the VFS and rewrites every relative specifier
 * whose importer or target moved, keeping the specifier's style (extension, `index`) and quotes.
 */
function moveFiles(files: Record<FilePath, string>, moves: Map<FilePath, FilePath>): { files: Record<FilePath, string>; skipped: FilePath[] } {
  const next: Record<FilePath, string> = {};
  const skipped: FilePath[] = [];
  const movedKeys: Record<FilePath, string> = {};
  for (const p of Object.keys(files)) movedKeys[moves.get(p) ?? p] = '';
  for (const [oldPath, text] of Object.entries(files)) {
    const importer = moves.get(oldPath) ?? oldPath;
    const specs = findImportSpecifiers(text, oldPath);
    let out = text;
    if (!specs) skipped.push(importer);
    if (specs) {
      for (const s of [...specs].reverse()) {
        const target = resolveImport(files, oldPath, s.value);
        if (!target) continue;
        const newTarget = moves.get(target) ?? target;
        if (newTarget === target && importer === oldPath) continue;
        if (resolveImport(movedKeys, importer, s.value) === newTarget) continue; // still resolves: keep it
        const base = resolveRelative(oldPath, s.value)!;
        let spec: string;
        if (base === target) spec = relativeSpecifier(importer, newTarget);
        else if (target.startsWith(join(base, 'index.')) && basename(newTarget) === basename(target)) spec = relativeSpecifier(importer, dirname(newTarget));
        else spec = relativeSpecifier(importer, stripExt(newTarget));
        if (spec !== s.value) out = out.slice(0, s.start + 1) + spec + out.slice(s.end - 1);
      }
    }
    next[importer] = out;
  }
  return { files: next, skipped: skipped.sort() };
}

// ---------------------------------------------------------------- commands

/** A reversible change, per ide-design.md §5.1. `touched` lists every path that changed. */
export interface ProjectCommand {
  label: string;
  touched: FilePath[];
  /** Importers that did not parse, so their specifiers could not be updated (rename only). */
  skipped: FilePath[];
  do: (project: Project) => Project;
  undo: (project: Project) => Project;
}

export const applyCommand = (project: Project, command: ProjectCommand) => command.do(project);
export const revertCommand = (project: Project, command: ProjectCommand) => command.undo(project);

function toCommand(label: string, before: Project, after: Project, skipped: FilePath[] = []): ProjectCommand {
  const touched = [...new Set([...Object.keys(before.files), ...Object.keys(after.files)])].filter((p) => before.files[p] !== after.files[p]);
  const patch = (from: Project, to: Project) => (project: Project): Project => {
    const files = { ...project.files };
    for (const p of touched) { if (p in to.files) files[p] = to.files[p]; else delete files[p]; }
    return { ...project, files, entry: project.entry === from.entry ? to.entry : project.entry, updatedAt: Date.now() };
  };
  return { label, touched, skipped, do: patch(before, after), undo: patch(after, before) };
}

export interface CommandOption { command: true }
type Result<O> = O extends CommandOption ? ProjectCommand : Project;

function finish<O extends CommandOption | undefined>(label: string, before: Project, after: Project, opts?: O, skipped: FilePath[] = []): Result<O> {
  return (opts?.command ? toCommand(label, before, after, skipped) : after) as Result<O>;
}

/** A rename result with the importers whose specifiers could not be rewritten because they do not parse. */
export interface RenameReport { project: Project; skipped: FilePath[] }

// ---------------------------------------------------------------- operations

export function createProject(files: Record<FilePath, string> = {}, entry: FilePath = 'src/App.tsx', name = 'Untitled'): Project {
  const now = Date.now();
  return { id: globalThis.crypto.randomUUID(), name, files: { ...files }, entry, createdAt: now, updatedAt: now };
}

const bytes = (text: string) => new TextEncoder().encode(text).length;

function checkLimits(files: Record<FilePath, string>, changed: FilePath) {
  if (Object.keys(files).length > LIMITS.files) fail('too-many-files', `A project can hold at most ${LIMITS.files} files`);
  if (bytes(files[changed]) > LIMITS.fileBytes) fail('file-too-large', 'A file can be at most 1 MB');
  let total = 0;
  for (const text of Object.values(files)) total += bytes(text);
  if (total > LIMITS.projectBytes) fail('project-too-large', 'A project can be at most 10 MB');
}

function folders(files: Iterable<FilePath>): Set<FilePath> {
  const out = new Set<FilePath>();
  for (const f of files) for (let d = dirname(f); d; d = dirname(d)) out.add(d);
  return out;
}

/** Checks a new file path against the existing files (which must not include the file being moved). */
function checkFree(existing: FilePath[], path: FilePath) {
  const dirs = folders(existing);
  const fileSet = new Set(existing);
  const lower = new Map<string, FilePath>();
  for (const p of [...existing, ...dirs]) lower.set(p.toLowerCase(), p);
  const segs = path.split('/');
  for (let i = 1; i <= segs.length; i++) {
    const prefix = segs.slice(0, i).join('/');
    const last = i === segs.length;
    if (fileSet.has(prefix)) fail(last ? 'exists' : 'file-is-folder', last ? `"${path}" already exists` : `"${prefix}" is a file`);
    if (dirs.has(prefix)) { if (last) fail('folder-exists', `"${path}" is a folder`); continue; }
    const clash = lower.get(prefix.toLowerCase());
    if (clash) fail('case-clash', `"${prefix}" differs from "${clash}" only in letter case`);
  }
}

export function createFile<O extends CommandOption | undefined = undefined>(project: Project, path: string, text = '', opts?: O): Result<O> {
  const p = validatePath(path);
  checkFree(Object.keys(project.files), p);
  const files = { ...project.files, [p]: text };
  checkLimits(files, p);
  return finish(`Create ${p}`, project, { ...project, files, updatedAt: Date.now() }, opts);
}

export function writeFile<O extends CommandOption | undefined = undefined>(project: Project, path: string, text: string, opts?: O): Result<O> {
  const p = normalize(path);
  if (!(p in project.files)) fail('not-found', `"${p}" does not exist`);
  if (project.files[p] === text) return finish(`Edit ${p}`, project, project, opts);
  const files = { ...project.files, [p]: text };
  checkLimits(files, p);
  return finish(`Edit ${p}`, project, { ...project, files, updatedAt: Date.now() }, opts);
}

export function deleteFile<O extends CommandOption | undefined = undefined>(project: Project, path: string, opts?: O): Result<O> {
  const p = normalize(path);
  if (!(p in project.files)) fail('not-found', `"${p}" does not exist`);
  if (p === project.entry) fail('entry', 'The entry file cannot be deleted');
  const files = { ...project.files };
  delete files[p];
  return finish(`Delete ${p}`, project, { ...project, files, updatedAt: Date.now() }, opts);
}

const inFolder = (folder: FilePath) => (p: FilePath) => p.startsWith(`${folder}/`);

export function deleteFolder<O extends CommandOption | undefined = undefined>(project: Project, path: string, opts?: O): Result<O> {
  const dir = normalize(path);
  const victims = Object.keys(project.files).filter(inFolder(dir));
  if (!victims.length) fail('not-found', `Folder "${dir}" does not exist`);
  if (victims.includes(project.entry)) fail('entry', 'The folder holds the entry file');
  const files = { ...project.files };
  for (const v of victims) delete files[v];
  return finish(`Delete ${dir}/`, project, { ...project, files, updatedAt: Date.now() }, opts);
}

function applyMoves(project: Project, moves: Map<FilePath, FilePath>): RenameReport {
  const rest = Object.keys(project.files).filter((p) => !moves.has(p));
  for (const to of moves.values()) checkFree(rest, to);
  const { files, skipped } = moveFiles(project.files, moves);
  return { project: { ...project, files, entry: moves.get(project.entry) ?? project.entry, updatedAt: Date.now() }, skipped };
}

function planFileRename(project: Project, from: string, to: string): [string, RenameReport] {
  const a = normalize(from);
  if (!(a in project.files)) fail('not-found', `"${a}" does not exist`);
  const b = validatePath(to);
  if (a === b) return [`Rename ${a}`, { project, skipped: [] }];
  return [`Rename ${a} to ${b}`, applyMoves(project, new Map([[a, b]]))];
}

/** Renames or moves a file and rewrites relative imports that point at it (and its own). */
export function renameFile<O extends CommandOption | undefined = undefined>(project: Project, from: string, to: string, opts?: O): Result<O> {
  const [label, r] = planFileRename(project, from, to);
  return finish(label, project, r.project, opts, r.skipped);
}

/** `renameFile` that also reports importers it could not update (they failed to parse). */
export function renameFileWithReport(project: Project, from: string, to: string): RenameReport {
  return planFileRename(project, from, to)[1];
}

/** Renames or moves a folder with everything in it, rewriting imports inside and outside. */
export function renameFolder<O extends CommandOption | undefined = undefined>(project: Project, from: string, to: string, opts?: O): Result<O> {
  const [label, r] = planFolderRename(project, from, to);
  return finish(label, project, r.project, opts, r.skipped);
}

/** `renameFolder` that also reports importers it could not update (they failed to parse). */
export function renameFolderWithReport(project: Project, from: string, to: string): RenameReport {
  return planFolderRename(project, from, to)[1];
}

function planFolderRename(project: Project, from: string, to: string): [string, RenameReport] {
  const a = normalize(from);
  const members = Object.keys(project.files).filter(inFolder(a));
  if (!members.length) fail('not-found', `Folder "${a}" does not exist`);
  const b = validateFolder(to);
  if (a === b) return [`Rename ${a}/`, { project, skipped: [] }];
  if (b.startsWith(`${a}/`)) fail('into-itself', 'A folder cannot move into itself');
  const rest = Object.keys(project.files).filter((p) => !inFolder(a)(p));
  if (rest.some(inFolder(b))) fail('exists', `Folder "${b}" already exists`);
  const moves = new Map(members.map((m) => [m, b + m.slice(a.length)] as const));
  return [`Rename ${a}/ to ${b}/`, applyMoves(project, moves)];
}

// ---------------------------------------------------------------- tree

export type TreeNode =
  | { kind: 'folder'; name: string; path: FilePath; children: TreeNode[] }
  | { kind: 'file'; name: string; path: FilePath };

/** Folder-first, case-insensitively sorted tree of the VFS (for the M3-08 explorer). */
export function listTree(files: Record<FilePath, string>): TreeNode[] {
  const root: TreeNode[] = [];
  const dirs = new Map<FilePath, TreeNode[]>([['', root]]);
  const ensure = (dir: FilePath): TreeNode[] => {
    let kids = dirs.get(dir);
    if (!kids) {
      kids = [];
      dirs.set(dir, kids);
      ensure(dirname(dir)).push({ kind: 'folder', name: basename(dir), path: dir, children: kids });
    }
    return kids;
  };
  for (const p of Object.keys(files)) ensure(dirname(p)).push({ kind: 'file', name: basename(p), path: p });
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((x, y) => (x.kind === y.kind ? x.name.localeCompare(y.name, 'en', { sensitivity: 'base' }) || (x.name < y.name ? -1 : 1) : x.kind === 'folder' ? -1 : 1));
    for (const n of nodes) if (n.kind === 'folder') sort(n.children);
  };
  sort(root);
  return root;
}
