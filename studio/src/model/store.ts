import { createFile, writeFile, type FilePath, type Project } from './project';
import * as vfs from '../core/vfs/ops';
import { pruneRecent, renameRecent, touchRecent } from '../core/vfs/recent';

/**
 * Minimal M3-04 slice: the project-wide store with snapshot undo, as far as the file tree (UX-4)
 * needs it. Each step stores the project before and after plus the path it touched, so undo can
 * switch `activePath` to that file (UX-8). History lives only in memory; it is never
 * persisted, so nothing survives a reload (decision T4). Tabs (UX-10) build on `openFile`/`activePath` later.
 */

/**
 * One history step. `project`/`activePath` are the state on the other side of the step;
 * `before`/`after` are the file the step touched on each side, so undo and redo can switch to it (§6, UX-8).
 */
export interface Step { project: Project; activePath: FilePath; label: string; before?: FilePath; after?: FilePath; /** Open tabs on that side of the step (C2). */ openTabs?: FilePath[] }

export interface ChangeReport {
  id: number;
  verb: 'Renamed' | 'Moved';
  from: FilePath;
  to: FilePath;
  /** Importers whose specifiers were rewritten, with how many. */
  files: { path: FilePath; count: number }[];
  unresolved: vfs.VfsChange['unresolved'];
}

let changeId = 0;

export interface StoreState {
  project: Project;
  activePath: FilePath;
  past: Step[];
  future: Step[];
  /** Open editor tabs (C2: follow renames/moves, close on delete, restored by undo/redo). */
  openTabs: FilePath[];
  /** Recently opened files, most recent first, capped at 20. Not part of undo. */
  recent: FilePath[];
  /** The last rename/move and its import rewrites, for the Code workspace feedback strips (C2). */
  lastChange?: ChangeReport;
  lastEdit?: { path: FilePath; time: number };
}

export type StoreAction =
  | { type: 'loadProject'; project: Project }
  | { type: 'openFile'; path: FilePath }
  | { type: 'editFile'; path: FilePath; text: string; source?: 'visual' | 'editor'; now?: number }
  | { type: 'createFile'; path: FilePath; text: string }
  | { type: 'renameFile'; from: FilePath; to: FilePath }
  | { type: 'renameFolder'; from: FilePath; to: FilePath }
  | { type: 'deleteFile'; path: FilePath }
  | { type: 'deleteFolder'; path: FilePath }
  | { type: 'setEntry'; path: FilePath }
  | { type: 'duplicateFile'; path: FilePath }
  | { type: 'moveTo'; from: FilePath; folder: FilePath }
  | { type: 'closeTab'; path: FilePath }
  | { type: 'setTabs'; paths: FilePath[] }
  | { type: 'setRecent'; paths: FilePath[] }
  | { type: 'removeRecent'; path: FilePath }
  | { type: 'undo' }
  | { type: 'redo' };

export const HISTORY_LIMIT = 200;
const GROUP_MS = 1000;

export const createStore = (project: Project): StoreState => ({ project, activePath: project.entry, past: [], future: [], openTabs: [project.entry], recent: [project.entry] });

const has = (project: Project, path: FilePath) => Object.hasOwn(project.files, path);
const fix = (project: Project, path: FilePath) => (has(project, path) ? path : project.entry);

const withTab = (tabs: readonly FilePath[], path: FilePath) => (tabs.includes(path) ? [...tabs] : [...tabs, path]);

function record(state: StoreState, project: Project, touched: FilePath, label: string, activePath = touched, lastEdit?: StoreState['lastEdit'], before: FilePath = touched, moves?: ReadonlyMap<FilePath, FilePath>): StoreState {
  if (project === state.project) return state;
  const past = [...state.past, { project: state.project, activePath: state.activePath, label, before, after: touched, openTabs: state.openTabs }].slice(-HISTORY_LIMIT);
  const active = fix(project, activePath);
  const tabs = withTab(state.openTabs.map((p) => moves?.get(p) ?? p).filter((p) => has(project, p)), active);
  const recent = pruneRecent(renameRecent(state.recent, moves ?? new Map()), project.files);
  return { ...state, project, activePath: active, past, future: [], lastEdit, openTabs: tabs, recent };
}

function withReport(prev: StoreState, r: vfs.VfsResult, from: FilePath, next: StoreState): StoreState {
  if (!r.ok || next === prev) return next;
  const lastChange: ChangeReport = {
    id: ++changeId,
    verb: r.label.startsWith('Move') ? 'Moved' : 'Renamed',
    from,
    to: r.moves.get(from) ?? folderDest(r.moves, from),
    files: Object.entries(r.counts ?? {}).map(([path, count]) => ({ path, count })).sort((a, b) => (a.path < b.path ? -1 : 1)),
    unresolved: r.unresolved,
  };
  return { ...next, lastChange };
}

const folderDest = (moves: ReadonlyMap<FilePath, FilePath>, from: FilePath) => {
  const [a, b] = [...moves][0] ?? [from, from];
  return b.slice(0, b.length - (a.length - from.length));
};

/** Applies a VFS change as one labelled undo step (its import rewrites included). Errors throw. */
function applyVfs(state: StoreState, r: vfs.VfsResult, touched: (c: vfs.VfsChange) => FilePath, active: (c: vfs.VfsChange) => FilePath, before: FilePath): StoreState {
  if (!r.ok) throw vfs.toProjectError(r.error);
  const files = r.files;
  const unchanged = Object.keys(files).length === Object.keys(state.project.files).length && Object.entries(files).every(([p, t]) => state.project.files[p] === t);
  if (unchanged) return state;
  const entry = r.moves.get(state.project.entry) ?? state.project.entry;
  const project = { ...state.project, files, entry: Object.hasOwn(files, entry) ? entry : state.project.entry, updatedAt: Date.now() };
  return record(state, project, touched(r), r.label, active(r), undefined, before, r.label.startsWith('Duplicate') ? undefined : r.moves);
}

const under = (folder: FilePath, p: FilePath) => p.startsWith(`${folder}/`);

/** The reducer. Invalid operations throw a `ProjectError`; callers validate first (fileTreeModel). */
export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  const { project } = state;
  switch (action.type) {
    case 'loadProject': return createStore(action.project);
    case 'openFile': return has(project, action.path) && action.path !== state.activePath ? { ...state, activePath: action.path, lastEdit: undefined, openTabs: withTab(state.openTabs, action.path), recent: touchRecent(state.recent, action.path) } : state;
    case 'editFile': {
      // An unchanged text is a no-op. This makes the editor's onChange echo after undo/redo harmless,
      // so redo survives. Note: Ctrl+Z *inside Monaco* uses Monaco's per-model undo; the resulting
      // text change arrives here as a normal edit, so it records a new project step and clears redo (§6).
      const next = writeFile(project, action.path, action.text);
      if (next === project) return state;
      const now = action.now ?? Date.now();
      const keep = state.activePath;
      if (action.source === 'editor' && state.lastEdit?.path === action.path && now - state.lastEdit.time < GROUP_MS && state.past.length) {
        return { ...state, project: next, future: [], lastEdit: { path: action.path, time: now } };
      }
      return record(state, next, action.path, `Edit ${action.path}`, keep, action.source === 'editor' ? { path: action.path, time: now } : undefined);
    }
    case 'createFile': {
      const next = createFile(project, action.path, action.text);
      const r = record(state, next, action.path, 'Create file');
      return r === state ? r : { ...r, recent: touchRecent(r.recent, action.path) };
    }
    case 'renameFile':
    case 'renameFolder': {
      const folder = action.type === 'renameFolder';
      const mapped = (c: vfs.VfsChange) => c.moves.get(state.activePath) ?? state.activePath;
      const r = vfs.rename(project.files, action.from, action.to);
      return withReport(state, r, action.from, applyVfs(state, r, folder ? mapped : (c) => c.moves.get(action.from) ?? action.to, mapped, folder ? state.activePath : action.from));
    }
    case 'moveTo': {
      const mapped = (c: vfs.VfsChange) => c.moves.get(state.activePath) ?? state.activePath;
      const isFile = has(project, action.from);
      const r = vfs.move(project.files, action.from, action.folder);
      return withReport(state, r, action.from, applyVfs(state, r, isFile ? (c) => c.moves.get(action.from)! : mapped, mapped, isFile ? action.from : state.activePath));
    }
    case 'duplicateFile': {
      const r = vfs.duplicate(project.files, action.path);
      const next = applyVfs(state, r, (c) => c.moves.get(action.path)!, (c) => c.moves.get(action.path)!, action.path);
      return r.ok && next !== state ? { ...next, recent: touchRecent(next.recent, r.moves.get(action.path)!) } : next;
    }
    case 'deleteFile': return applyVfs(state, vfs.remove(project.files, action.path, project.entry), () => state.activePath, () => state.activePath, action.path);
    case 'deleteFolder': {
      // Undo switches into the restored folder: the active file if it was inside, else its first file.
      const inside = Object.keys(project.files).filter((p) => under(action.path, p)).sort();
      const before = under(action.path, state.activePath) ? state.activePath : state.openTabs.find((p) => under(action.path, p)) ?? inside[0];
      return applyVfs(state, vfs.remove(project.files, action.path, project.entry), () => state.activePath, () => state.activePath, before);
    }
    case 'closeTab': {
      if (!state.openTabs.includes(action.path)) return state;
      const i = state.openTabs.indexOf(action.path);
      const tabs = state.openTabs.filter((p) => p !== action.path);
      if (action.path !== state.activePath) return { ...state, openTabs: tabs };
      const next = tabs[i] ?? tabs[i - 1] ?? project.entry;
      return { ...state, openTabs: withTab(tabs, next), activePath: next, lastEdit: undefined };
    }
    case 'setRecent': return { ...state, recent: pruneRecent(action.paths, project.files).slice(0, 20) };
    case 'removeRecent': return { ...state, recent: state.recent.filter((p) => p !== action.path) };
    case 'setTabs': return { ...state, openTabs: withTab(action.paths.filter((p) => has(project, p)), state.activePath) };
    case 'setEntry': {
      if (!has(project, action.path) || project.entry === action.path) return state;
      return record(state, { ...project, entry: action.path, updatedAt: Date.now() }, action.path, 'Set entry', state.activePath);
    }
    case 'undo': {
      const step = state.past.at(-1);
      if (!step) return state;
      const to = step.before && step.before in step.project.files ? step.before : fix(step.project, step.activePath);
      const tabs = withTab((step.openTabs ?? state.openTabs).filter((p) => has(step.project, p)), to);
      return { ...state, lastEdit: undefined, project: step.project, activePath: to, openTabs: tabs, recent: pruneRecent(state.recent, step.project.files), past: state.past.slice(0, -1), future: [{ ...step, project, activePath: state.activePath, openTabs: state.openTabs }, ...state.future] };
    }
    case 'redo': {
      const step = state.future[0];
      if (!step) return state;
      const to = step.after && step.after in step.project.files ? step.after : fix(step.project, step.activePath);
      const tabs = withTab((step.openTabs ?? state.openTabs).filter((p) => has(step.project, p)), to);
      return { ...state, lastEdit: undefined, project: step.project, activePath: to, openTabs: tabs, recent: pruneRecent(state.recent, step.project.files), past: [...state.past, { ...step, project, activePath: state.activePath, openTabs: state.openTabs }], future: state.future.slice(1) };
    }
  }
}
