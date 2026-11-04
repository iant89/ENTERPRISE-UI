/**
 * Code Studio C1: the workspace layout as a pure reducer, plus breakpoints and per-project
 * persistence behind a small `LayoutStore` interface (localStorage today; storage v2 later).
 */

export type Workspace = 'design' | 'code';
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
export type Activity = 'explorer' | 'search' | 'components' | 'docs';
export type BottomTab = 'problems' | 'console' | 'tests' | 'component-docs' | 'output' | 'preview-events';
export type TabletLayout = 'split' | 'editor' | 'preview';
export type MobileTab = 'files' | 'code' | 'preview' | 'panel';
export type Panel = 'sidebar' | 'preview' | 'bottom';
export type SizeKey = 'sidebar' | 'preview' | 'docs' | 'bottom';

export interface LayoutState {
  version: 1;
  workspace: Workspace;
  sizes: Record<SizeKey, number>;
  collapsed: Record<Panel, boolean>;
  activity: Activity;
  bottomTab: BottomTab;
  docsPinned: boolean;
  tabletLayout: TabletLayout;
  mobileTab: MobileTab;
  /** Tablet: the bottom panel summary strip is expanded. */
  bottomExpanded: boolean;
  openTabs: string[];
  /** Recently opened files for Quick Open (C2 decision 7: persisted per project). */
  recent: string[];
}

export const ACTIVITIES: readonly Activity[] = ['explorer', 'search', 'components', 'docs'];
export const BOTTOM_TABS: readonly BottomTab[] = ['problems', 'console', 'tests', 'component-docs', 'output', 'preview-events'];

/** Min / max for each resizable size, in px. */
export const SIZE_LIMITS: Record<SizeKey, readonly [number, number]> = {
  sidebar: [160, 480],
  preview: [240, 960],
  docs: [240, 560],
  bottom: [80, 480],
};

export const DEFAULT_LAYOUT: LayoutState = {
  version: 1,
  workspace: 'design',
  sizes: { sidebar: 304, preview: 520, docs: 320, bottom: 160 },
  collapsed: { sidebar: false, preview: false, bottom: false },
  activity: 'explorer',
  bottomTab: 'console',
  docsPinned: false,
  tabletLayout: 'split',
  mobileTab: 'code',
  bottomExpanded: false,
  openTabs: [],
  recent: [],
};

export const TABLET_MIN = 768;
export const DESKTOP_MIN = 1280;
/** Media queries for the two boundaries (C2 follow-up 3: matchMedia instead of resize events). */
export const TABLET_QUERY = `(min-width: ${TABLET_MIN}px)`;
export const DESKTOP_QUERY = `(min-width: ${DESKTOP_MIN}px)`;

export function breakpointFor(width: number): Breakpoint {
  if (width < TABLET_MIN) return 'mobile';
  if (width < DESKTOP_MIN) return 'tablet';
  return 'desktop';
}

export const clampSize = (key: SizeKey, value: number) => {
  const [min, max] = SIZE_LIMITS[key];
  return Math.round(Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)));
};

export type LayoutAction =
  | { type: 'load'; layout: LayoutState }
  | { type: 'setWorkspace'; workspace: Workspace }
  | { type: 'resize'; key: SizeKey; size: number }
  | { type: 'toggle'; panel: Panel; collapsed?: boolean }
  | { type: 'setActivity'; activity: Activity }
  | { type: 'setBottomTab'; tab: BottomTab }
  | { type: 'pinDocs'; pinned: boolean }
  | { type: 'setTabletLayout'; layout: TabletLayout }
  | { type: 'setMobileTab'; tab: MobileTab }
  | { type: 'setBottomExpanded'; expanded: boolean }
  | { type: 'openTab'; path: string }
  | { type: 'closeTab'; path: string }
  | { type: 'syncTabs'; paths: readonly string[] }
  | { type: 'setTabs'; paths: readonly string[] }
  | { type: 'setRecent'; paths: readonly string[] };

export function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'load': return action.layout;
    case 'setWorkspace': return state.workspace === action.workspace ? state : { ...state, workspace: action.workspace };
    case 'resize': {
      const size = clampSize(action.key, action.size);
      return size === state.sizes[action.key] ? state : { ...state, sizes: { ...state.sizes, [action.key]: size } };
    }
    case 'toggle': {
      const next = action.collapsed ?? !state.collapsed[action.panel];
      return next === state.collapsed[action.panel] ? state : { ...state, collapsed: { ...state.collapsed, [action.panel]: next } };
    }
    case 'setActivity': return { ...state, activity: action.activity, collapsed: { ...state.collapsed, sidebar: false } };
    case 'setBottomTab': return { ...state, bottomTab: action.tab, collapsed: { ...state.collapsed, bottom: false } };
    case 'pinDocs': return { ...state, docsPinned: action.pinned, activity: action.pinned ? state.activity : 'docs' };
    case 'setTabletLayout': return { ...state, tabletLayout: action.layout };
    case 'setMobileTab': return { ...state, mobileTab: action.tab };
    case 'setBottomExpanded': return { ...state, bottomExpanded: action.expanded };
    case 'openTab': return state.openTabs.includes(action.path) ? state : { ...state, openTabs: [...state.openTabs, action.path] };
    case 'closeTab': return { ...state, openTabs: state.openTabs.filter((p) => p !== action.path) };
    case 'setTabs': return { ...state, openTabs: [...action.paths] };
    case 'setRecent': return { ...state, recent: [...action.paths] };
    case 'syncTabs': {
      const keep = state.openTabs.filter((p) => action.paths.includes(p));
      return keep.length === state.openTabs.length ? state : { ...state, openTabs: keep };
    }
  }
}

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(value as T) ? (value as T) : fallback);
const bool = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);

/** Reads a stored layout. Anything missing or invalid (or no layout at all) falls back to the defaults. */
export function parseLayout(raw: unknown): LayoutState {
  if (!raw || typeof raw !== 'object') return DEFAULT_LAYOUT;
  const r = raw as Record<string, unknown>;
  const sizes = (r.sizes && typeof r.sizes === 'object' ? r.sizes : {}) as Record<string, unknown>;
  const collapsed = (r.collapsed && typeof r.collapsed === 'object' ? r.collapsed : {}) as Record<string, unknown>;
  const d = DEFAULT_LAYOUT;
  return {
    version: 1,
    workspace: pick(r.workspace, ['design', 'code'] as const, d.workspace),
    sizes: {
      sidebar: typeof sizes.sidebar === 'number' ? clampSize('sidebar', sizes.sidebar) : d.sizes.sidebar,
      preview: typeof sizes.preview === 'number' ? clampSize('preview', sizes.preview) : d.sizes.preview,
      docs: typeof sizes.docs === 'number' ? clampSize('docs', sizes.docs) : d.sizes.docs,
      bottom: typeof sizes.bottom === 'number' ? clampSize('bottom', sizes.bottom) : d.sizes.bottom,
    },
    collapsed: { sidebar: bool(collapsed.sidebar, false), preview: bool(collapsed.preview, false), bottom: bool(collapsed.bottom, false) },
    activity: pick(r.activity, ACTIVITIES, d.activity),
    bottomTab: pick(r.bottomTab, BOTTOM_TABS, d.bottomTab),
    docsPinned: bool(r.docsPinned, false),
    tabletLayout: pick(r.tabletLayout, ['split', 'editor', 'preview'] as const, d.tabletLayout),
    mobileTab: pick(r.mobileTab, ['files', 'code', 'preview', 'panel'] as const, d.mobileTab),
    bottomExpanded: bool(r.bottomExpanded, false),
    openTabs: Array.isArray(r.openTabs) ? r.openTabs.filter((p): p is string => typeof p === 'string') : [],
    recent: Array.isArray(r.recent) ? r.recent.filter((p): p is string => typeof p === 'string').slice(0, 20) : [],
  };
}

/** Where layouts live. Per project; a project without a saved layout gets the defaults. */
export interface LayoutStore {
  load(projectId: string): LayoutState | null;
  save(projectId: string, layout: LayoutState): void;
  /** Removes a project's layout (project deleted, or the unsaved key after the first save). */
  remove(projectId: string): void;
  /** Deletes layouts whose project is not in `projectIds` (the unsaved key is kept). Returns the removed ids. */
  sweep(projectIds: Iterable<string>): string[];
}

export const LAYOUT_KEY_PREFIX = 'eui-studio-layout:';
/** The last layout used by a project that was never saved (the starter has a new id on every load). */
export const UNSAVED_PROJECT_KEY = '__unsaved__';

type LayoutStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

export function localLayoutStore(storage: LayoutStorage | null = typeof localStorage === 'undefined' ? null : localStorage): LayoutStore {
  return {
    load(projectId) {
      try {
        const raw = storage?.getItem(LAYOUT_KEY_PREFIX + projectId);
        return raw ? parseLayout(JSON.parse(raw)) : null;
      } catch { return null; }
    },
    save(projectId, layout) {
      try { storage?.setItem(LAYOUT_KEY_PREFIX + projectId, JSON.stringify(layout)); } catch { /* private mode / quota */ }
    },
    remove(projectId) {
      try { storage?.removeItem(LAYOUT_KEY_PREFIX + projectId); } catch { /* private mode */ }
    },
    sweep(projectIds) {
      if (!storage) return [];
      const keep = new Set([...projectIds, UNSAVED_PROJECT_KEY]);
      const removed: string[] = [];
      try {
        const keys: string[] = [];
        for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (k?.startsWith(LAYOUT_KEY_PREFIX)) keys.push(k); }
        for (const k of keys) {
          const id = k.slice(LAYOUT_KEY_PREFIX.length);
          if (!keep.has(id)) { storage.removeItem(k); removed.push(id); }
        }
      } catch { /* private mode */ }
      return removed;
    },
  };
}

/** Viewport presets for the preview toolbar. */
export const VIEWPORTS = {
  desktop: { label: 'Desktop', width: 1280, height: 800 },
  tablet: { label: 'Tablet', width: 768, height: 1024 },
  mobile: { label: 'Mobile', width: 390, height: 844 },
} as const;
export type ViewportId = keyof typeof VIEWPORTS;

/** Fit scale for a viewport inside the available box (never upscales). */
export const fitScale = (vw: number, vh: number, boxW: number, boxH: number) =>
  boxW <= 0 || boxH <= 0 ? 1 : Math.min(1, boxW / vw, boxH / vh);

/** First `line:col` or `(line:col)` in an error message, for the Problems link. */
export function errorLine(message: string | null | undefined): number | null {
  const m = message?.match(/\((\d+):\d+\)|line (\d+)|:(\d+):\d+/i);
  const n = m ? Number(m[1] ?? m[2] ?? m[3]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}
