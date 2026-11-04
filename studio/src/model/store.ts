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
  /** Every path that moved (C3: editor models follow these, keeping view state). */
  moves: [FilePath, FilePath][];
}

/** One editor group: its tabs in order and the active one (C3). */
export interface EditorGroup { tabs: FilePath[]; active: FilePath }
/** C3 decision 8a: at most 15 tabs across both groups; the least recently used tab is closed first. */
export const MAX_TABS = 15;
/** C3 decision 1a: at most two groups, side by side. */
export const MAX_GROUPS = 2;

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
  /**
   * C3 split editing. `openTabs`/`activePath` always describe the focused group, so everything
   * built before C3 keeps working; `side` is the other group, and `focusedGroup` says which side
   * (0 = left, 1 = right) the focused group is on.
   */
  side?: EditorGroup;
  focusedGroup: 0 | 1;
}

export type StoreAction =
  | { type: 'loadProject'; project: Project }
  | { type: 'openFile'; path: FilePath; /** C3: open in the other group, creating the split if needed. */ toSide?: boolean }
  | { type: 'focusGroup'; group: number }
  | { type: 'splitEditor' }
  | { type: 'closeGroup'; group: number }
  | { type: 'moveTab'; path: FilePath; from: number; to: number; index: number }
  | { type: 'setGroups'; groups: EditorGroup[]; focused: number }
  | { type: 'applyEdits'; files: Record<FilePath, string>; label: string; touched: FilePath; /** C5: create paths that don't exist (else they are skipped). Any failure throws, so nothing is written. */ create?: boolean; /** C5: open `touched` in the focused group. */ open?: boolean }
  | { type: 'editFile'; path: FilePath; text: string; source?: 'visual' | 'editor'; now?: number }
  | { type: 'createFile'; path: FilePath; text: string }
  | { type: 'renameFile'; from: FilePath; to: FilePath }
  | { type: 'renameFolder'; from: FilePath; to: FilePath }
  | { type: 'deleteFile'; path: FilePath }
  | { type: 'deleteFolder'; path: FilePath }
  | { type: 'setEntry'; path: FilePath }
  | { type: 'duplicateFile'; path: FilePath }
  | { type: 'moveTo'; from: FilePath; folder: FilePath }
  | { type: 'closeTab'; path: FilePath; group?: number }
  | { type: 'setTabs'; paths: FilePath[] }
  | { type: 'setRecent'; paths: FilePath[] }
  | { type: 'removeRecent'; path: FilePath }
  | { type: 'undo' }
  | { type: 'redo' };

export const HISTORY_LIMIT = 200;
const GROUP_MS = 1000;

export const createStore = (project: Project): StoreState => ({ project, activePath: project.entry, past: [], future: [], openTabs: [project.entry], recent: [project.entry], focusedGroup: 0 });

/** The editor groups left to right (one or two). */
export const groupsOf = (s: Pick<StoreState, 'openTabs' | 'activePath' | 'side' | 'focusedGroup'>): EditorGroup[] => {
  const focused = { tabs: s.openTabs, active: s.activePath };
  if (!s.side) return [focused];
  return s.focusedGroup === 0 ? [focused, s.side] : [s.side, focused];
};

/** Rebuilds the state from groups (empty ones dropped) and the focused index. */
function fromGroups(state: StoreState, groups: EditorGroup[], focused: number): StoreState {
  const live = groups.filter((g) => g.tabs.length).slice(0, MAX_GROUPS);
  if (!live.length) return { ...state, openTabs: [state.project.entry], activePath: state.project.entry, side: undefined, focusedGroup: 0 };
  const removedBefore = groups.slice(0, focused).filter((g) => !g.tabs.length).length;
  const f = Math.min(Math.max(0, groups[focused]?.tabs.length ? focused - removedBefore : 0), live.length - 1);
  const g = live[f];
  const active = g.tabs.includes(g.active) ? g.active : g.tabs[0];
  const other = live.length === 2 ? live[1 - f] : undefined;
  const changed = active !== state.activePath;
  return {
    ...state,
    openTabs: [...g.tabs],
    activePath: active,
    side: other && { tabs: [...other.tabs], active: other.tabs.includes(other.active) ? other.active : other.tabs[0] },
    focusedGroup: other ? (f as 0 | 1) : 0,
    lastEdit: changed ? undefined : state.lastEdit,
  };
}

/** Closes least recently used tabs (never a group's active tab) until the total is within MAX_TABS. */
export function capTabs(groups: EditorGroup[], recent: readonly FilePath[], max = MAX_TABS): EditorGroup[] {
  const out = groups.map((g) => ({ tabs: [...g.tabs], active: g.active }));
  const rank = (p: FilePath) => { const i = recent.indexOf(p); return i < 0 ? Number.MAX_SAFE_INTEGER : i; };
  let total = out.reduce((n, g) => n + g.tabs.length, 0);
  while (total > max) {
    let pick: { g: number; p: FilePath; r: number } | null = null;
    out.forEach((g, gi) => g.tabs.forEach((p) => {
      if (p === g.active) return;
      const r = rank(p);
      // Ties (same file in both groups, or never touched): close it from the right-most group first.
      if (!pick || r > pick.r || (r === pick.r && gi > pick.g)) pick = { g: gi, p, r };
    }));
    if (!pick) break;
    const { g, p } = pick as { g: number; p: FilePath };
    out[g].tabs = out[g].tabs.filter((t) => t !== p);
    total--;
  }
  return out;
}

const capped = (state: StoreState): StoreState => {
  const groups = groupsOf(state);
  const total = groups.reduce((n, g) => n + g.tabs.length, 0);
  return total <= MAX_TABS ? state : fromGroups(state, capTabs(groups, state.recent), groups.length === 2 ? state.focusedGroup : 0);
};

/** Maps the unfocused group through moves and drops deleted files; an emptied group collapses the split. */
function mapSide(state: StoreState, project: Project, moves?: ReadonlyMap<FilePath, FilePath>): Pick<StoreState, 'side' | 'focusedGroup'> {
  const side = state.side;
  if (!side) return { side: undefined, focusedGroup: 0 };
  const tabs = [...new Set(side.tabs.map((p) => moves?.get(p) ?? p))].filter((p) => has(project, p));
  if (!tabs.length) return { side: undefined, focusedGroup: 0 };
  const a = moves?.get(side.active) ?? side.active;
  return { side: { tabs, active: tabs.includes(a) ? a : tabs[0] }, focusedGroup: state.focusedGroup };
}

const has = (project: Project, path: FilePath) => Object.hasOwn(project.files, path);
const fix = (project: Project, path: FilePath) => (has(project, path) ? path : project.entry);

const withTab = (tabs: readonly FilePath[], path: FilePath) => (tabs.includes(path) ? [...tabs] : [...tabs, path]);

function record(state: StoreState, project: Project, touched: FilePath, label: string, activePath = touched, lastEdit?: StoreState['lastEdit'], before: FilePath = touched, moves?: ReadonlyMap<FilePath, FilePath>): StoreState {
  if (project === state.project) return state;
  const past = [...state.past, { project: state.project, activePath: state.activePath, label, before, after: touched, openTabs: state.openTabs }].slice(-HISTORY_LIMIT);
  const active = fix(project, activePath);
  const tabs = withTab(state.openTabs.map((p) => moves?.get(p) ?? p).filter((p) => has(project, p)), active);
  const recent = pruneRecent(renameRecent(state.recent, moves ?? new Map()), project.files);
  return { ...state, project, activePath: active, past, future: [], lastEdit, openTabs: tabs, recent, ...mapSide(state, project, moves) };
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
    moves: [...r.moves],
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
    case 'openFile': {
      if (!has(project, action.path)) return state;
      if (action.toSide) {
        const groups = groupsOf(state);
        const recent = touchRecent(state.recent, action.path);
        if (groups.length === 1) return capped(fromGroups({ ...state, recent }, [groups[0], { tabs: [action.path], active: action.path }], 1));
        const target = 1 - (state.focusedGroup as number);
        const next = groups.map((g, i) => (i === target ? { tabs: withTab(g.tabs, action.path), active: action.path } : g));
        return capped(fromGroups({ ...state, recent }, next, target));
      }
      if (action.path === state.activePath) return state;
      return capped({ ...state, activePath: action.path, lastEdit: undefined, openTabs: withTab(state.openTabs, action.path), recent: touchRecent(state.recent, action.path) });
    }
    case 'splitEditor': return storeReducer(state, { type: 'openFile', path: state.activePath, toSide: true });
    case 'focusGroup': {
      if (!state.side || action.group === state.focusedGroup || (action.group !== 0 && action.group !== 1)) return state;
      const groups = groupsOf(state);
      return { ...fromGroups(state, groups, action.group), recent: touchRecent(state.recent, groups[action.group].active) };
    }
    case 'closeGroup': {
      const groups = groupsOf(state);
      if (!groups[action.group]) return state;
      if (groups.length === 1) return { ...state, openTabs: [project.entry], activePath: project.entry, lastEdit: undefined };
      return fromGroups(state, groups.filter((_, i) => i !== action.group), 0);
    }
    case 'moveTab': {
      const groups = groupsOf(state).map((g) => ({ tabs: [...g.tabs], active: g.active }));
      const src = groups[action.from];
      if (!src || !src.tabs.includes(action.path)) return state;
      if (action.to === action.from) {
        const tabs = src.tabs.filter((p) => p !== action.path);
        const at = Math.max(0, Math.min(action.index, tabs.length));
        tabs.splice(at, 0, action.path);
        if (tabs.join('\n') === src.tabs.join('\n')) return state;
        groups[action.from] = { ...src, tabs };
        return fromGroups(state, groups, groups.length === 2 ? state.focusedGroup : 0);
      }
      // Into the other group (created when it does not exist yet), where it becomes active and focused.
      if (action.to !== 0 && action.to !== 1) return state;
      const i = src.tabs.indexOf(action.path);
      src.tabs = src.tabs.filter((p) => p !== action.path);
      if (src.active === action.path) src.active = src.tabs[i] ?? src.tabs[i - 1] ?? '';
      let target = groups[action.to];
      if (!target) { target = { tabs: [], active: action.path }; groups.splice(action.to, 0, target); }
      const tabs = target.tabs.filter((p) => p !== action.path);
      tabs.splice(Math.max(0, Math.min(action.index, tabs.length)), 0, action.path);
      const to = groups.indexOf(target);
      groups[to] = { tabs, active: action.path };
      return fromGroups({ ...state, recent: touchRecent(state.recent, action.path) }, groups, to);
    }
    case 'setGroups': {
      const groups = action.groups.slice(0, MAX_GROUPS).map((g) => {
        const tabs = [...new Set(g.tabs)].filter((p) => has(project, p));
        return { tabs, active: tabs.includes(g.active) ? g.active : tabs[0] };
      });
      if (!groups.some((g) => g.tabs.length)) return state;
      return capped(fromGroups(state, groups, action.focused));
    }
    case 'applyEdits': {
      let next = project;
      for (const [path, text] of Object.entries(action.files)) {
        if (has(next, path)) next = writeFile(next, path, text);
        else if (action.create) next = createFile(next, path, text);
      }
      const opened = record(state, next, action.touched, action.label, action.open ? action.touched : state.activePath);
      return action.open && action.touched in next.files ? { ...opened, recent: touchRecent(opened.recent, action.touched) } : opened;
    }
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
      if (state.side && action.group !== undefined && action.group !== state.focusedGroup) {
        const groups = groupsOf(state);
        const g = groups[action.group];
        if (!g?.tabs.includes(action.path)) return state;
        const i = g.tabs.indexOf(action.path);
        const tabs = g.tabs.filter((p) => p !== action.path);
        groups[action.group] = { tabs, active: g.active === action.path ? tabs[i] ?? tabs[i - 1] ?? '' : g.active };
        return fromGroups(state, groups, state.focusedGroup);
      }
      if (!state.openTabs.includes(action.path)) return state;
      // C3: closing the focused group's last tab collapses the split onto the other group.
      if (state.side && state.openTabs.length === 1) return fromGroups(state, [state.side], 0);
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
      return { ...state, ...mapSide(state, step.project), lastEdit: undefined, project: step.project, activePath: to, openTabs: tabs, recent: pruneRecent(state.recent, step.project.files), past: state.past.slice(0, -1), future: [{ ...step, project, activePath: state.activePath, openTabs: state.openTabs }, ...state.future] };
    }
    case 'redo': {
      const step = state.future[0];
      if (!step) return state;
      const to = step.after && step.after in step.project.files ? step.after : fix(step.project, step.activePath);
      const tabs = withTab((step.openTabs ?? state.openTabs).filter((p) => has(step.project, p)), to);
      return { ...state, ...mapSide(state, step.project), lastEdit: undefined, project: step.project, activePath: to, openTabs: tabs, recent: pruneRecent(state.recent, step.project.files), past: [...state.past, { ...step, project, activePath: state.activePath, openTabs: state.openTabs }], future: state.future.slice(1) };
    }
  }
}
