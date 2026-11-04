/**
 * Code Studio C1: the workspace layout as a pure reducer, plus breakpoints and per-project
 * persistence behind a small `LayoutStore` interface (localStorage today; storage v2 later).
 */

export type Workspace = 'design' | 'code';
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
export type Activity = 'explorer' | 'search' | 'components' | 'docs';
export type BottomTab = 'problems' | 'console' | 'tests' | 'component-docs' | 'output' | 'preview-events' | 'references';
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
  /** The focused group's tabs (C2). Kept for older readers; `groups` is the source of truth since C3. */
  openTabs: string[];
  /** C3: editor groups left to right (one or two), each with its tabs in order and its active tab. */
  groups: { tabs: string[]; active: string }[];
  /** C3: index of the focused group. */
  focusedGroup: number;
  /** Recently opened files for Quick Open (C2 decision 7: persisted per project). */
  recent: string[];
  /** C4 (decision 3a): the last custom preview size and zoom for this project; null = the viewport preset, Fit. */
  previewSize: PreviewSize | null;
}

export type PreviewZoom = 'fit' | 50 | 75 | 100;
export interface PreviewSize { width: number; height: number; zoom: PreviewZoom }
/** C4 decision 2a: custom preview size limits, px. */
export const PREVIEW_SIZE_LIMITS = { width: [320, 3840], height: [320, 2160] } as const;
export const PREVIEW_ZOOMS: readonly PreviewZoom[] = ['fit', 50, 75, 100];
export const validPreviewDim = (key: 'width' | 'height', value: number) =>
  Number.isInteger(value) && value >= PREVIEW_SIZE_LIMITS[key][0] && value <= PREVIEW_SIZE_LIMITS[key][1];
export function parsePreviewSize(raw: unknown): PreviewSize | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const w = Number(r.width), h = Number(r.height);
  if (!validPreviewDim('width', w) || !validPreviewDim('height', h)) return null;
  return { width: w, height: h, zoom: PREVIEW_ZOOMS.includes(r.zoom as PreviewZoom) ? (r.zoom as PreviewZoom) : 'fit' };
}

export const ACTIVITIES: readonly Activity[] = ['explorer', 'search', 'components', 'docs'];
export const BOTTOM_TABS: readonly BottomTab[] = ['problems', 'console', 'tests', 'component-docs', 'output', 'preview-events', 'references'];

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
  groups: [],
  focusedGroup: 0,
  recent: [],
  previewSize: null,
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
  | { type: 'setRecent'; paths: readonly string[] }
  | { type: 'setPreviewSize'; size: PreviewSize | null }
  | { type: 'setGroups'; groups: readonly { tabs: readonly string[]; active: string }[]; focused: number };

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
    case 'setPreviewSize': {
      const size = action.size && parsePreviewSize(action.size);
      if (action.size && !size) return state;
      return JSON.stringify(size) === JSON.stringify(state.previewSize) ? state : { ...state, previewSize: size };
    }
    case 'setRecent': return { ...state, recent: [...action.paths] };
    case 'setGroups': {
      const groups = action.groups.map((g) => ({ tabs: [...g.tabs], active: g.active }));
      const focused = Math.min(Math.max(0, action.focused), Math.max(0, groups.length - 1));
      if (JSON.stringify(groups) === JSON.stringify(state.groups) && focused === state.focusedGroup) return state;
      return { ...state, groups, focusedGroup: focused, openTabs: [...(groups[focused]?.tabs ?? [])] };
    }
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
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((p): p is string => typeof p === 'string') : []);
  const openTabs = strings(r.openTabs);
  // C3 groups; a C1/C2 layout (openTabs only) becomes a single group.
  const groups = (Array.isArray(r.groups) ? r.groups : openTabs.length ? [{ tabs: openTabs, active: openTabs[0] }] : [])
    .slice(0, 2)
    .map((g) => {
      const o = (g && typeof g === 'object' ? g : {}) as Record<string, unknown>;
      const tabs = strings(o.tabs);
      return { tabs, active: typeof o.active === 'string' && tabs.includes(o.active) ? o.active : tabs[0] ?? '' };
    })
    .filter((g) => g.tabs.length);
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
    openTabs,
    groups,
    focusedGroup: Math.min(typeof r.focusedGroup === 'number' && r.focusedGroup >= 0 ? Math.floor(r.focusedGroup) : 0, Math.max(0, groups.length - 1)),
    recent: Array.isArray(r.recent) ? r.recent.filter((p): p is string => typeof p === 'string').slice(0, 20) : [],
    previewSize: parsePreviewSize(r.previewSize),
  };
}

type Maybe<T> = T | Promise<T>;

/**
 * Where layouts live. Per project; a project without a saved layout gets the defaults.
 * Methods may be async: since C3 layouts live on the IndexedDB project record (`recordLayoutStore`).
 */
export interface LayoutStore {
  load(projectId: string): Maybe<LayoutState | null>;
  save(projectId: string, layout: LayoutState): Maybe<void>;
  /** Removes a project's layout (project deleted, or the unsaved key after the first save). */
  remove(projectId: string): Maybe<void>;
  /** Deletes layouts whose project is not in `projectIds` (the unsaved key is kept). Returns the removed ids. */
  sweep(projectIds: Iterable<string>): Maybe<string[]>;
}

/** The localStorage store: synchronous. Since C3 it only holds the unsaved starter's layout and pre-C3 keys. */
export interface SyncLayoutStore extends LayoutStore {
  load(projectId: string): LayoutState | null;
  save(projectId: string, layout: LayoutState): void;
  remove(projectId: string): void;
  sweep(projectIds: Iterable<string>): string[];
}

/** The project record's layout field, as storage.ts exposes it. */
export interface LayoutRecord {
  get(projectId: string): Promise<unknown>;
  /** Resolves false when the project is not stored (nothing is written). */
  put(projectId: string, layout: LayoutState): Promise<boolean>;
}

/**
 * C3 (plan ambiguity 5, C2 follow-up 2): layouts live on the storage v2 project record.
 * - The unsaved starter keeps using the localStorage key until its first real save.
 * - One-time migration: a pre-C3 `eui-studio-layout:<id>` key is copied onto a record that has no
 *   layout yet, then removed.
 * - Deleting a project deletes its record, and with it the layout; leftover keys are swept on start.
 */
export function recordLayoutStore(record: LayoutRecord, local: SyncLayoutStore = localLayoutStore()): LayoutStore {
  return {
    async load(projectId) {
      if (projectId === UNSAVED_PROJECT_KEY) return local.load(projectId);
      const raw = await record.get(projectId);
      const legacy = local.load(projectId);
      if (raw) {
        if (legacy) local.remove(projectId); // the record wins; the old key is stale
        return parseLayout(raw);
      }
      if (!legacy) return null;
      if (await record.put(projectId, legacy)) local.remove(projectId);
      return legacy;
    },
    async save(projectId, layout) {
      if (projectId === UNSAVED_PROJECT_KEY) { local.save(projectId, layout); return; }
      await record.put(projectId, layout);
    },
    remove(projectId) { local.remove(projectId); },
    sweep(projectIds) { return local.sweep(projectIds); },
  };
}

export const LAYOUT_KEY_PREFIX = 'eui-studio-layout:';
/** The last layout used by a project that was never saved (the starter has a new id on every load). */
export const UNSAVED_PROJECT_KEY = '__unsaved__';

type LayoutStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

export function localLayoutStore(storage: LayoutStorage | null = typeof localStorage === 'undefined' ? null : localStorage): SyncLayoutStore {
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
