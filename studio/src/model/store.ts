import { createFile, deleteFile, deleteFolder, renameFile, renameFolder, writeFile, type FilePath, type Project } from './project';

/**
 * Minimal M3-04 slice: the project-wide store with snapshot undo, as far as the file tree (UX-4)
 * needs it. Each step stores the project before and after plus the path it touched, so undo can
 * restore `activePath` to that file (UX-8). Tabs (UX-10) build on `openFile`/`activePath` later.
 */

export interface Step { project: Project; activePath: FilePath; label: string }

export interface StoreState {
  project: Project;
  activePath: FilePath;
  past: Step[];
  future: Step[];
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
  | { type: 'undo' }
  | { type: 'redo' };

export const HISTORY_LIMIT = 200;
const GROUP_MS = 1000;

export const createStore = (project: Project): StoreState => ({ project, activePath: project.entry, past: [], future: [] });

const fix = (project: Project, path: FilePath) => (path in project.files ? path : project.entry);

function record(state: StoreState, project: Project, touched: FilePath, label: string, activePath = touched, lastEdit?: StoreState['lastEdit']): StoreState {
  if (project === state.project) return state;
  const past = [...state.past, { project: state.project, activePath: state.activePath, label }].slice(-HISTORY_LIMIT);
  return { project, activePath: fix(project, activePath), past, future: [], lastEdit };
}

const under = (folder: FilePath, p: FilePath) => p.startsWith(`${folder}/`);

/** The reducer. Invalid operations throw a `ProjectError`; callers validate first (fileTreeModel). */
export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  const { project } = state;
  switch (action.type) {
    case 'loadProject': return createStore(action.project);
    case 'openFile': return action.path in project.files && action.path !== state.activePath ? { ...state, activePath: action.path, lastEdit: undefined } : state;
    case 'editFile': {
      const next = writeFile(project, action.path, action.text);
      if (next === project) return state;
      const now = action.now ?? Date.now();
      const keep = state.activePath;
      if (action.source === 'editor' && state.lastEdit?.path === action.path && now - state.lastEdit.time < GROUP_MS && state.past.length) {
        return { ...state, project: next, future: [], lastEdit: { path: action.path, time: now } };
      }
      return record(state, next, action.path, `Edit ${action.path}`, keep, action.source === 'editor' ? { path: action.path, time: now } : undefined);
    }
    case 'createFile': return record(state, createFile(project, action.path, action.text), action.path, `Create ${action.path}`);
    case 'renameFile': {
      const next = renameFile(project, action.from, action.to);
      const active = state.activePath === action.from ? action.to : state.activePath;
      return record(state, next, action.to, `Rename ${action.from}`, active);
    }
    case 'renameFolder': {
      const next = renameFolder(project, action.from, action.to);
      const active = under(action.from, state.activePath) ? action.to + state.activePath.slice(action.from.length) : state.activePath;
      return record(state, next, active, `Rename ${action.from}/`, active);
    }
    case 'deleteFile': return record(state, deleteFile(project, action.path), state.activePath, `Delete ${action.path}`);
    case 'deleteFolder': return record(state, deleteFolder(project, action.path), state.activePath, `Delete ${action.path}/`);
    case 'setEntry': {
      if (!(action.path in project.files) || project.entry === action.path) return state;
      return record(state, { ...project, entry: action.path, updatedAt: Date.now() }, action.path, 'Set entry', state.activePath);
    }
    case 'undo': {
      const step = state.past.at(-1);
      if (!step) return state;
      return { project: step.project, activePath: fix(step.project, step.activePath), past: state.past.slice(0, -1), future: [{ project, activePath: state.activePath, label: step.label }, ...state.future] };
    }
    case 'redo': {
      const step = state.future[0];
      if (!step) return state;
      return { project: step.project, activePath: fix(step.project, step.activePath), past: [...state.past, { project, activePath: state.activePath, label: step.label }], future: state.future.slice(1) };
    }
  }
}
