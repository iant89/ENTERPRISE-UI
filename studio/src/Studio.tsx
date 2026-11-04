import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ApplicationHeader, BusyIndicator, VisuallyHidden, Button, IconButton, MessageStrip, SegmentedButton, Select, ThemeProvider, THEMES, ToastProvider, useAnnouncer, useToast,
  type Density, type ThemeName, type ThemePreference,
} from '@enterprise-ui/react';
import { cx } from '../../src/utilities/cx';
import { BookOpen, Boxes, ChevronDown, ChevronRight, Download, FilePlus2, Redo2, Sparkles, Undo2 } from 'lucide-react';
import { useDocsSettings } from '../../docs/src/settings';
import { decodePlaygroundCode, playgroundCodeParam } from '../../docs/src/playgroundLink';
import { Canvas, type DropTarget } from './Canvas';
import { Palette } from './Palette';
import { Outline } from './Outline';
import { Inspector } from './Inspector';
import type { CodeEditorHandle, RenameRequest } from './editor/CodeEditor';
import { editorLabel } from './editor/EditorAdapter';
import { fileNamedAfter } from './editor/navigationModel';
import type { ReferenceSet } from './panels/bottom/ReferencesPanel';
import { EditorTabs } from './app/workspace/EditorTabs';
import { RenameSymbolFeedback, type SymbolRename } from './app/workspace/RenameSymbolFeedback';
import { createStore, groupsOf, storeReducer, type StoreAction, type StoreState } from './model/store';
import { createProject, type Project } from './model/project';
import { FileTree } from './files/FileTree';
import {
  componentNames, duplicateNode, ensureImports, findNode, insertElement, instrument, moveNode, parentId, parseDocument, removeNode, setAttribute, setText,
  type AttrInput, type StudioNode,
} from './model/jsx';
import { acceptsChildren, defaultSnippet } from './model/catalog';
import { getProjectLayout, listProjects, loadProject, putProjectLayout, saveProject, StorageBlockedError } from './storage';
import { defaultPersistenceDeps, useProjectPersistence } from './persistence';
import { STARTER } from './template';
import styles from './Studio.module.css';
import workspaceStyles from './app/workspace/CodeWorkspace.module.css';
import { CodeWorkspace } from './app/workspace/CodeWorkspace';
import { CreateComponentDialog } from './components/generator/CreateComponentDialog';
import { applyComponent, createAction, destinationFromActive } from './components/generator/generate';
import { MenuBar, type MenuItems } from './app/workspace/MenuBar';
import { WorkspaceSwitch } from './app/workspace/WorkspaceSwitch';
import { useBreakpoint } from './app/workspace/useBreakpoint';
import { useLayoutAutosave } from './app/workspace/useLayoutAutosave';
import { SearchPanel } from './app/workspace/SearchPanel';
import { QuickOpen } from './app/workspace/QuickOpen';
import { RewriteFeedback } from './app/workspace/RewriteFeedback';
import { PreviewPane, type StaleInfo } from './preview/PreviewPane';
import { CodePreviewFrame } from './preview/CodePreviewFrame';
import { usePreviewBuild } from './preview/usePreviewBuild';
import { consoleReducer, createConsoleBatcher, EMPTY_CONSOLE } from './preview/console';
import { fromMarker, fromRuntime, type Diagnostic } from './core/diagnostics';
import type { Problem } from './panels/bottom/BottomPanel';
import {
  DEFAULT_LAYOUT, UNSAVED_PROJECT_KEY, errorLine, layoutReducer, recordLayoutStore, type LayoutState, type ViewportId, type Workspace,
} from './app/workspace/layout';

const CodeEditor = lazy(() => import('./editor/CodeEditor').then((m) => ({ default: m.CodeEditor })));

type View = 'design' | 'split' | 'code';

/** Store errors (invalid paths etc.) are validated in the UI first; a throw here keeps the state. */
function reducer(state: StoreState, action: StoreAction): StoreState {
  try { return storeReducer(state, action); } catch { return state; }
}

const starterProject = (code = STARTER, name = 'My application') => createProject({ 'src/App.tsx': code }, 'src/App.tsx', name);

type PaneId = 'files' | 'components' | 'outline';
const PANES_KEY = 'eui-studio-panes';
const loadCollapsed = (): Record<PaneId, boolean> => {
  try { return { files: false, components: false, outline: false, ...JSON.parse(localStorage.getItem(PANES_KEY) ?? '{}') }; } catch { return { files: false, components: false, outline: false }; }
};

const resolveTheme = (theme: ThemePreference): ThemeName =>
  theme === 'system' ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;

const PREVIEW_THEME_KEY = 'eui-studio-preview-theme';
const PREVIEW_DENSITY_KEY = 'eui-studio-preview-density';
const readKey = <T extends string>(key: string, allowed: readonly string[], fallback: T): T => {
  try { const v = localStorage.getItem(key); return v && allowed.includes(v) ? (v as T) : fallback; } catch { return fallback; }
};
const writeKey = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } };
/** C3: layouts live on the project record (the unsaved starter keeps the localStorage key until its first save). */
const layoutStore = recordLayoutStore({ get: getProjectLayout, put: putProjectLayout });
/** Layout writes to IndexedDB are batched (resizing fires many changes). */
const LAYOUT_SAVE_MS = 150;
let renameId = 0;


const indexOf = (id: string) => Number(id.slice(id.lastIndexOf('.') + 1));

interface StudioAppProps { theme: ThemePreference; setTheme: (theme: ThemePreference) => void; density: Density }

function StudioApp({ theme, setTheme, density }: StudioAppProps) {
  const toast = useToast();
  const announce = useAnnouncer();
  const [state, dispatch] = useReducer(reducer, undefined, () => createStore(starterProject()));
  const [collapsed, setCollapsed] = useState(loadCollapsed);
  useEffect(() => { try { localStorage.setItem(PANES_KEY, JSON.stringify(collapsed)); } catch { /* private mode */ } }, [collapsed]);
  const [view, setView] = useState<View>('design');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ error: string | null; ready: boolean }>({ error: null, ready: false });
  const editorHandle = useRef<CodeEditorHandle | null>(null);
  /** C3: one adapter per editor group in the Code workspace. */
  const adapters = useRef<(CodeEditorHandle | null)[]>([]);
  const pendingLine = useRef<number | null>(null);
  /** A location to reveal once the focused group shows `path` (C3). */
  const pendingReveal = useRef<{ path: string; line: number; column: number } | null>(null);
  const [references, setReferences] = useState<ReferenceSet | null>(null);
  const [symbolRename, setSymbolRename] = useState<(SymbolRename & { request: RenameRequest }) | null>(null);
  const { project, activePath } = state;
  const entry = project.entry;
  const code = project.files[entry] ?? '';
  const commitEntry = useCallback((next: string, source: 'visual' | 'editor' = 'visual') => dispatch({ type: 'editFile', path: entry, text: next, source }), [entry]);
  const doc = useMemo(() => parseDocument(code), [code]);
  // Keep the last good tree while the code is mid-edit, so the canvas does not go blank.
  const lastGood = useRef(doc);
  if (doc.root) lastGood.current = doc;
  const root = doc.root ?? lastGood.current.root;
  // While the code does not parse, the canvas keeps showing the last page that did.
  const lastPreview = useRef(instrument(code, doc.root));
  const previewCode = useMemo(() => {
    if (doc.root) lastPreview.current = instrument(code, doc.root);
    return lastPreview.current;
  }, [code, doc.root]);
  const selected = findNode(root, selectedId ?? '');
  const resolved = resolveTheme(theme);
  const breakpoint = useBreakpoint();
  const [layout, dispatchLayout] = useReducer(layoutReducer, DEFAULT_LAYOUT);
  const workspace = layout.workspace;
  const [previewTheme, setPreviewThemeState] = useState<ThemeName>(() => readKey(PREVIEW_THEME_KEY, THEMES.map((t) => t.name), 'sap-horizon'));
  const [previewDensity, setPreviewDensityState] = useState<Density>(() => readKey(PREVIEW_DENSITY_KEY, ['cozy', 'compact'], density));
  const setPreviewTheme = (t: ThemeName) => { setPreviewThemeState(t); writeKey(PREVIEW_THEME_KEY, t); };
  const setPreviewDensity = (d: Density) => { setPreviewDensityState(d); writeKey(PREVIEW_DENSITY_KEY, d); };
  const [viewport, setViewport] = useState<ViewportId>('desktop');
  const [paused, setPaused] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });

  // Load. A page opened from the docs (#?code=…) opens as a separate, new project: it has its own
  // id, is not saved until the user edits it, and never replaces the stored project.
  // Saving it never makes it `lastOpened`, so a reload returns to the user's own project.
  const exampleId = useRef<string | null>(null);
  const [isExample, setIsExample] = useState(false);
  const persistenceDeps = useMemo(() => defaultPersistenceDeps(async () => {
    const param = playgroundCodeParam();
    const fromLink = param ? await decodePlaygroundCode(param) : null;
    if (fromLink) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      const example = starterProject(fromLink, 'Example from the docs');
      exampleId.current = example.id;
      setIsExample(true);
      toast.show({ title: 'Example opened in Studio', description: 'It opens as a separate project. Reloading brings back your own project.', tone: 'success' });
      return example;
    }
    const stored = await loadProject();
    if (!stored) return undefined;
    // Hydrate with the stored id, name and timestamps (no `code`, which is only a v1 convenience).
    const { code: _code, ...project } = stored;
    return project;
  }, (p) => saveProject(p, { remember: p.id !== exampleId.current })),
  // eslint-disable-next-line react-hooks/exhaustive-deps -- created once on start (toast is stable).
  []);
  /** No stored project: the starter gets a new id on each load, so its layout is kept under a fixed key. */
  const freshStart = useRef(false);
  const onStart = useCallback((loadedProject: Project | undefined) => {
    freshStart.current = !loadedProject;
    if (loadedProject) dispatch({ type: 'loadProject', project: loadedProject });
  }, []);
  const persistence = useProjectPersistence(project, onStart, persistenceDeps);
  const loaded = persistence.status !== 'loading';
  const storageDown = persistence.status === 'unavailable';
  const saved = persistence.saved;
  const savedFiles = persistence.savedProject?.files;
  /** Decision 5: files not yet written to IndexedDB. */
  const dirty = useMemo(() => {
    const out = new Set<string>();
    if (!savedFiles) return out;
    for (const [path, text] of Object.entries(project.files)) if (!Object.hasOwn(savedFiles, path) || savedFiles[path] !== text) out.add(path);
    return out;
  }, [project.files, savedFiles]);

  // Layout per project (C1): loaded once the project is known, saved on every change after that.
  const layoutFor = useRef<{ id: string; layout: LayoutState } | null>(null);
  useEffect(() => {
    if (!loaded) return;
    // A fresh starter (never saved) gets a new id on every load: its layout lives only under the fixed key.
    const id = project.id;
    let cancelled = false;
    firstSaved.current = persistence.savedProject;
    void Promise.resolve(layoutStore.load(freshStart.current ? UNSAVED_PROJECT_KEY : id)).catch(() => null).then((stored) => {
      if (cancelled) return;
      // A project with no stored layout inherits the current in-memory layout (e.g. the unsaved
      // starter's layout carries over to its first real save); otherwise it starts from the default.
      layoutFor.current = { id, layout: stored ?? layoutFor.current?.layout ?? DEFAULT_LAYOUT };
      if (!stored) return;
      dispatchLayout({ type: 'load', layout: stored });
      // C3: groups, tabs, active tab per group and the focused group; missing files are dropped.
      if (stored.groups.length) dispatch({ type: 'setGroups', groups: stored.groups, focused: stored.focusedGroup });
      else if (stored.openTabs.length) dispatch({ type: 'setTabs', paths: stored.openTabs });
      if (stored.recent.length) dispatch({ type: 'setRecent', paths: stored.recent });
    });
    // Sweep pre-C3 layout keys whose project is gone (C2 follow-up 2).
    void listProjects().then((list) => layoutStore.sweep(list.map((p) => p.id))).catch(() => undefined);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the project changes.
  }, [loaded, project.id]);
  const keyFor = () => (freshStart.current ? UNSAVED_PROJECT_KEY : project.id);
  // The unsaved starter's key is localStorage (synchronous); record writes are batched, and flushed on pagehide or project switch.
  useLayoutAutosave({ layout, projectId: project.id, layoutFor, keyFor, immediate: (k) => k === UNSAVED_PROJECT_KEY, save: (k, l) => layoutStore.save(k, l), delay: LAYOUT_SAVE_MS });
  // First real save of a fresh starter: move its layout from the unsaved key to the project's id.
  const firstSaved = useRef<Project | null>(null);
  useEffect(() => {
    const sp = persistence.savedProject;
    if (!freshStart.current || !sp || sp === firstSaved.current || sp.id !== project.id || !layoutFor.current) return;
    freshStart.current = false;
    // The first real save writes the layout onto the new record and retires the unsaved key.
    void Promise.resolve(layoutStore.save(project.id, layoutFor.current.layout)).then(() => layoutStore.remove(UNSAVED_PROJECT_KEY)).catch(() => undefined);
  }, [persistence.savedProject, project.id]);
  // Open tabs live in the store (they follow renames and undo); the layout persists them.
  const tabs = state.openTabs;
  const groups = useMemo(() => groupsOf(state), [state]);
  const focusedIndex = state.side ? state.focusedGroup : 0;
  useEffect(() => { dispatchLayout({ type: 'setGroups', groups, focused: focusedIndex }); }, [groups, focusedIndex]);
  // Keyboard focus follows the focused group when an editor had it (split, open to the side, moves).
  useEffect(() => {
    const at = (document.activeElement as HTMLElement | null)?.closest?.<HTMLElement>('[data-testid="code-editor"]');
    if (!at || Number(at.dataset.group) === focusedIndex) return;
    if (adapters.current[focusedIndex]) adapters.current[focusedIndex]!.focus();
    else focusOnReady.current = true;
  }, [focusedIndex, groups.length]);
  const focusOnReady = useRef(false);
  useEffect(() => { if (layout.recent.join('\n') !== state.recent.join('\n')) dispatchLayout({ type: 'setRecent', paths: state.recent }); }, [state.recent, layout.recent]);
  const [quickOpen, setQuickOpen] = useState(false);
  /** C5: the Create component dialog's prefilled destination (null = closed). */
  const [createDest, setCreateDestState] = useState<string | null>(null);
  /** Focus returns to the opener on close (tab-row clicks keep focus in the editor, so remember the button). */
  const createOpener = useRef<HTMLElement | null>(null);
  const setCreateDest = (dest: string | null, opener?: HTMLElement | null) => {
    if (dest !== null) createOpener.current = opener ?? (document.activeElement as HTMLElement | null);
    else { const el = createOpener.current; requestAnimationFrame(() => { if (el?.isConnected) el.focus(); }); }
    setCreateDestState(dest);
  };
  const fileList = useMemo(() => Object.keys(project.files).sort(), [project.files]);
  // Rename/move feedback shows only for changes made after the Code workspace opened.
  const seenChange = useRef(state.lastChange?.id ?? 0);
  const freshChange = state.lastChange && state.lastChange.id > seenChange.current ? state.lastChange : undefined;
  // TODO(UX-7, M3-04/M3-09): open `openProjectChannel` only after load resolves, keyed by the loaded
  // `project.id` (never the starter's random id), and re-key it when the id changes (docs example).

  /** Leaves the docs example and reopens the project saved as `lastOpened`. */
  const backToMyProject = useCallback(async () => {
    try {
      const stored = await loadProject();
      if (!stored) { toast.show({ title: 'No saved project yet', description: 'Edit this example to keep it, or start from it.', tone: 'neutral' }); return; }
      const { code: _code, ...mine } = stored;
      exampleId.current = null;
      setIsExample(false);
      dispatch({ type: 'loadProject', project: mine });
      announce(`Project ${mine.name} opened.`);
    } catch {
      toast.show({ title: "Couldn't open your project", description: 'Browser storage is unavailable. Reload to try again.', tone: 'error' });
    }
  }, [announce, toast]);

  useEffect(() => { if (selectedId && !findNode(root, selectedId)) setSelectedId(null); }, [root, selectedId]);

  // C4: the Code workspace previews the compiled project (module graph → compiler → bridge → sandbox).
  const build = usePreviewBuild(project.files, entry, { paused, enabled: workspace === 'code', projectKey: project.id });
  const [consoleState, dispatchConsole] = useReducer(consoleReducer, EMPTY_CONSOLE);
  const [runtimeError, setRuntimeError] = useState<Diagnostic | null>(null);
  const [tsDiagnostics, setTsDiagnostics] = useState<Diagnostic[]>([]);
  // Cleared on each reload of a new artifact (and on Refresh).
  // C4 review: console messages are batched per animation frame (a 10k-log loop is one render per frame).
  const consoleBatch = useMemo(() => createConsoleBatcher((items) => dispatchConsole({ type: 'addMany', items })), []);
  useEffect(() => { consoleBatch.reset(); dispatchConsole({ type: 'clear' }); setRuntimeError(null); }, [build.artifact, previewKey, consoleBatch]);
  const codeMode = workspace === 'code';
  const firstError = build.failed ? build.diagnostics.find((d) => d.severity === 'error') ?? null : null;
  // Decision 6: the preview is stale while the last build failed; the last good artifact keeps running (§9.6).
  const staleMessage = codeMode ? firstError?.message ?? null : doc.error ?? preview.error;
  const stale: StaleInfo | null = useMemo(() => {
    if (!staleMessage) return null;
    if (codeMode && firstError) return { message: firstError.message, file: firstError.path || entry, line: firstError.range?.startLine ?? null };
    return { message: staleMessage, file: entry, line: errorLine(staleMessage) };
  }, [staleMessage, entry, codeMode, firstError]);
  const problems: Problem[] = useMemo(() => {
    const fromDiag = (d: Diagnostic): Problem => ({ file: d.path, line: d.range?.startLine ?? null, column: d.range?.startColumn ?? null, message: d.message.split('\n')[0], severity: d.severity, origin: d.origin });
    const diags = codeMode
      ? [...build.diagnostics, ...tsDiagnostics.filter((d) => d.severity !== 'info' && !build.diagnostics.some((b) => b.path === d.path && b.range?.startLine === d.range?.startLine && b.origin === 'parser')), ...(runtimeError ? [runtimeError] : [])].map(fromDiag)
      : stale ? [{ file: stale.file, line: stale.line, message: stale.message.split('\n')[0], severity: 'error' as const }] : [];
    return [
      ...diags,
      ...(freshChange?.unresolved ?? []).map((u) => ({ file: u.file, line: u.line ?? null, message: `Import ${u.specifier} could not be updated after the ${freshChange!.verb === 'Moved' ? 'move' : 'rename'} (${u.reason ?? 'unresolved'}).`, severity: 'warning' as const })),
    ];
  }, [codeMode, build.diagnostics, tsDiagnostics, runtimeError, stale, freshChange]);
  const problemCounts = useMemo(() => ({ errors: problems.filter((p) => p.severity === 'error').length, warnings: problems.filter((p) => p.severity === 'warning').length }), [problems]);
  const wasStale = useRef(false);
  useEffect(() => {
    if (stale && !wasStale.current && workspace === 'code') dispatchLayout({ type: 'setBottomTab', tab: 'problems' });
    wasStale.current = !!stale;
  }, [stale, workspace]);

  const goToLine = useCallback((path: string, line: number | null, column = 1, toSide = false) => {
    if (path !== activePath || toSide) dispatch({ type: 'openFile', path, toSide });
    if (breakpoint === 'mobile') dispatchLayout({ type: 'setMobileTab', tab: 'code' });
    if (breakpoint === 'tablet' && layout.tabletLayout === 'preview') dispatchLayout({ type: 'setTabletLayout', layout: 'split' });
    pendingReveal.current = { path, line: line ?? 1, column };
    const focused = workspace === 'code' ? adapters.current[focusedIndex] : editorHandle.current;
    if (focused && !toSide && focused.activePath() === path) { focused.reveal({ line: line ?? 1, column }); pendingReveal.current = null; }
  }, [activePath, breakpoint, layout.tabletLayout, workspace, focusedIndex]);
  // After a group switches file (child effects run first), reveal the pending location.
  useEffect(() => {
    const want = pendingReveal.current;
    const focused = workspace === 'code' ? adapters.current[focusedIndex] : editorHandle.current;
    if (want && focused && focused.activePath() === want.path) { focused.reveal({ line: want.line, column: want.column }); pendingReveal.current = null; }
  }, [activePath, workspace, focusedIndex]);
  const openTabFile = (path: string, toSide = false) => dispatch({ type: 'openFile', path, toSide });
  const closeTab = (path: string, group?: number) => dispatch({ type: 'closeTab', path, group });
  const splitEditor = () => {
    if (breakpoint !== 'desktop') { announce('Split editing is available on wider screens.'); return; }
    dispatch({ type: 'splitEditor' });
    announce(`Opened ${activePath} in group ${state.side ? (focusedIndex === 0 ? 2 : 1) : 2}.`);
  };
  const moveTab = (path: string, from: number, to: number, index: number) => {
    dispatch({ type: 'moveTab', path, from, to, index });
    const name = path.slice(path.lastIndexOf('/') + 1);
    if (from === to) announce(`${name} moved to position ${Math.min(index, (groups[from]?.tabs.length ?? 1) - 1) + 1}.`);
    else announce(`${name} moved to group ${to + 1}.`);
  };
  const applySymbolRename = (request: RenameRequest) => {
    dispatch({ type: 'applyEdits', files: request.plan.files, label: 'Rename symbol', touched: request.path });
    setSymbolRename({
      id: ++renameId, mode: 'done', oldName: request.oldName, newName: request.newName, edits: request.plan.edits,
      fileToRename: fileNamedAfter(request.plan.edits.map((e) => e.path), request.oldName), request,
    });
    const files = request.plan.edits.length;
    announce(`Renamed ${request.oldName} to ${request.newName} in ${files} ${files === 1 ? 'file' : 'files'}.`);
  };
  const onRenameSymbol = (request: RenameRequest) => {
    if (!request.plan.edits.length) { announce('Nothing to rename.'); return; }
    if (request.preview) setSymbolRename({ id: ++renameId, mode: 'preview', oldName: request.oldName, newName: request.newName, edits: request.plan.edits, fileToRename: null, request });
    else applySymbolRename(request);
  };
  const setWorkspace = (w: Workspace) => {
    if (w === 'code' && !layoutFor.current && loaded) layoutFor.current = { id: project.id, layout };
    dispatchLayout({ type: 'setWorkspace', workspace: w });
    announce(w === 'code' ? 'Code Studio' : 'Design Studio');
  };

  const apply = useCallback((next: string, select?: string | null) => {
    if (next !== code) commitEntry(next);
    if (select !== undefined) setSelectedId(select);
  }, [code, commitEntry]);

  const insertAt = useCallback((name: string, target: { parentId: string; index: number }) => {
    const snippet = defaultSnippet(name);
    const withImports = ensureImports(code, componentNames(snippet));
    const next = insertElement(withImports, target.parentId, target.index, snippet);
    const parent = findNode(parseDocument(next).root, target.parentId);
    const index = Math.min(target.index, (parent?.children.length ?? 1) - 1);
    apply(next, `${target.parentId}.${index}`);
  }, [apply, code]);

  /** Keyboard/click insert: inside the selected container, after the selected element, or at the end of the page. */
  const insertAtSelection = useCallback((name: string) => {
    if (!root) return;
    const node = selected ?? root;
    if (acceptsChildren(node.name) || node.kind === 'fragment') insertAt(name, { parentId: node.id, index: node.children.length });
    else if (parentId(node.id)) insertAt(name, { parentId: parentId(node.id)!, index: indexOf(node.id) + 1 });
  }, [insertAt, root, selected]);

  const showInCode = useCallback((node: StudioNode | null) => {
    if (!node) return;
    if (view === 'design') setView('split');
    if (editorHandle.current) editorHandle.current.revealLine(node.line);
    else pendingLine.current = node.line;
  }, [view]);

  const onAction = useCallback((action: 'up' | 'down' | 'duplicate' | 'delete' | 'code') => {
    if (!selected) return;
    const parent = parentId(selected.id);
    if (action === 'code') return showInCode(selected);
    if (!parent) return;
    const index = indexOf(selected.id);
    if (action === 'delete') apply(removeNode(code, selected.id), null);
    else if (action === 'duplicate') apply(duplicateNode(code, selected.id), `${parent}.${index + 1}`);
    else {
      const moved = moveNode(code, selected.id, parent, action === 'up' ? index - 1 : index + 2);
      apply(moved.code, moved.id);
    }
  }, [apply, code, selected, showInCode]);

  const format = useCallback(async () => {
    const focused = workspace === 'code' ? adapters.current[focusedIndex] : null;
    if (focused) {
      // C3: Prettier on the active model of the focused group; a failure never touches the file.
      const r = await focused.format();
      if (r.ok) toast.show({ title: r.changed ? 'Code formatted' : 'Already formatted', tone: 'success' });
      else toast.show({ title: 'Could not format', description: r.message, tone: 'error' });
      return;
    }
    try {
      const { formatCode } = await import('./editor/format');
      apply(await formatCode(code));
      toast.show({ title: 'Code formatted', tone: 'success' });
    } catch (error) {
      toast.show({ title: 'Could not format', description: error instanceof Error ? error.message.split('\n')[0] : String(error), tone: 'error' });
    }
  }, [apply, code, toast, workspace, focusedIndex]);

  /** Whole-project download while storage is down: one JSON file (`{ name, entry, files }`) until ZIP export (M3-12). */
  const downloadProject = () => {
    const data = JSON.stringify({ name: project.name, entry: project.entry, files: project.files }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const safe = project.name.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
    const link = Object.assign(document.createElement('a'), { href: url, download: `${safe}.studio.json` });
    link.click();
    URL.revokeObjectURL(url);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/typescript' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: 'App.tsx' });
    link.click();
    URL.revokeObjectURL(url);
  };

  // Global shortcuts. Inside the code editor Monaco handles its own undo/redo and formatting keys.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const inEditor = !!target.closest?.('.monaco-editor');
      const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (mod && key === 's') {
        event.preventDefault();
        void persistence.saveNowResult().then((r) => {
          if (r === 'saved') toast.show({ title: 'Saved', tone: 'success' });
          else if (r === 'loading') announce('Still loading the project. Nothing to save yet.');
          else toast.show({ title: "Couldn't save", description: 'Browser storage is unavailable. Download the project files to keep your work.', tone: 'error' });
        });
        return;
      }
      if (event.shiftKey && event.altKey && key === 'f') { event.preventDefault(); void format(); return; }
      if (workspace === 'code' && mod && !event.shiftKey && key === 'p') { event.preventDefault(); setQuickOpen(true); return; }
      if (workspace === 'code' && mod && !event.shiftKey && !event.altKey && event.key === '\\') { event.preventDefault(); splitEditor(); return; }
      if (workspace === 'code' && mod && !event.shiftKey && (key === 'b' || key === 'j')) {
        event.preventDefault();
        dispatchLayout({ type: 'toggle', panel: key === 'b' ? 'sidebar' : 'bottom' });
        return;
      }
      if (inEditor || inField) return;
      if (mod && key === 'z') { event.preventDefault(); dispatch({ type: event.shiftKey ? 'redo' : 'undo' }); }
      else if (mod && key === 'y') { event.preventDefault(); dispatch({ type: 'redo' }); }
      else if ((key === 'delete' || key === 'backspace') && selected && target.closest?.('[data-studio-outline]')) { event.preventDefault(); onAction('delete'); }
      else if (event.altKey && (key === 'arrowup' || key === 'arrowdown') && selected) { event.preventDefault(); onAction(key === 'arrowup' ? 'up' : 'down'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- splitEditor reads the latest state.
  }, [persistence, format, onAction, selected, toast, announce, workspace, breakpoint, activePath, state.side, focusedIndex]);

  const onDropNode = (id: string, target: DropTarget) => {
    const moved = moveNode(code, id, target.parentId, target.index);
    apply(moved.code, moved.id);
  };

  const paneToggle = (pane: PaneId, title: string) => (
    <IconButton
      size="sm"
      variant="tertiary"
      icon={collapsed[pane] ? <ChevronRight /> : <ChevronDown />}
      label={`${collapsed[pane] ? 'Expand' : 'Collapse'} ${title}`}
      aria-expanded={!collapsed[pane]}
      aria-controls={`${pane}-body`}
      onClick={() => setCollapsed((c) => ({ ...c, [pane]: !c[pane] }))}
    />
  );

  const siblings = selected && parentId(selected.id) ? findNode(root, parentId(selected.id)!)?.children.length ?? 0 : 0;
  const showDesign = view !== 'code';
  const showCode = view !== 'design';

  const saveState = doc.error ? 'Code has errors' : storageDown ? 'Not saved' : !loaded ? 'Loading…' : saved ? 'Saved' : 'Saving…';

  /** One editor group's Monaco editor (C3). `single` is the tablet/mobile view of the focused group. */
  const renderGroup = (i: number, single: boolean) => {
    const g = groups[i] ?? groups[0];
    const isFocused = i === focusedIndex;
    return (
      <Suspense fallback={<BusyIndicator active text="Loading code editor" />}>
        <CodeEditor
          key={single ? 'single' : `group-${i}`}
          files={project.files}
          path={g.active}
          group={i}
          moves={state.lastChange && { id: state.lastChange.id, moves: state.lastChange.moves }}
          theme={resolved}
          label={editorLabel(g.active, i, single ? 1 : groups.length)}
          onCursor={isFocused ? setCursor : undefined}
          onMarkers={i === 0 ? (markers) => setTsDiagnostics(markers.map((m) => fromMarker(m, m.path))) : undefined}
          onFocus={() => { if (!isFocused) dispatch({ type: 'focusGroup', group: i }); }}
          onChange={(next, path) => dispatch({ type: 'editFile', path, text: next, source: 'editor' })}
          onOpenLocation={(path, line, column) => {
            if (!isFocused) dispatch({ type: 'focusGroup', group: i });
            pendingReveal.current = { path, line, column };
            dispatch({ type: 'openFile', path });
          }}
          onPinReferences={(refs) => { setReferences(refs); dispatchLayout({ type: 'setBottomTab', tab: 'references' }); announce(`References to ${refs.symbol} pinned to the References panel.`); }}
          onRenameSymbol={onRenameSymbol}
          onFormat={() => { void format(); }}
          onReady={(handle) => {
            adapters.current[i] = handle;
            if (focusOnReady.current && isFocused) { focusOnReady.current = false; handle.focus(); }
            const want = pendingReveal.current;
            if (want && isFocused && handle.activePath() === want.path) { handle.reveal({ line: want.line, column: want.column }); pendingReveal.current = null; }
          }}
        />
      </Suspense>
    );
  };

  if (workspace === 'code') {
    const menus: MenuItems = {
      Project: [{ id: 'new-page', label: 'New page' }, { id: 'download', label: 'Download project' }],
      File: [{ id: 'quick-open', label: 'Quick Open…', shortcut: 'Ctrl+P' }, { id: 'save', label: 'Save', shortcut: 'Ctrl+S' }, { id: 'download-entry', label: 'Download App.tsx' }],
      Edit: [{ id: 'undo', label: 'Undo', disabled: !state.past.length }, { id: 'redo', label: 'Redo', disabled: !state.future.length }, { id: 'format', label: 'Format code', shortcut: 'Shift+Alt+F' }],
      View: [
        { id: 'toggle-sidebar', label: layout.collapsed.sidebar ? 'Show sidebar' : 'Hide sidebar', shortcut: 'Ctrl+B' },
        { id: 'toggle-preview', label: layout.collapsed.preview ? 'Show preview' : 'Hide preview' },
        { id: 'toggle-bottom', label: layout.collapsed.bottom ? 'Show bottom panel' : 'Hide bottom panel', shortcut: 'Ctrl+J' },
        { id: 'toggle-docs', label: layout.docsPinned ? 'Unpin Docs' : 'Pin Docs' },
        { id: 'split', label: 'Split editor right', shortcut: 'Ctrl+\\', disabled: breakpoint !== 'desktop' },
        { id: 'show-references', label: 'Show References panel' },
      ],
      Run: [{ id: 'refresh', label: 'Refresh preview' }, { id: 'pause', label: paused ? 'Resume preview' : 'Pause preview' }],
      Tools: [{ id: 'settings', label: 'Settings' }],
    };
    const onMenu = (id: string) => {
      switch (id) {
        case 'new-page': commitEntry(STARTER); break;
        case 'quick-open': setQuickOpen(true); break;
        case 'download': downloadProject(); break;
        case 'download-entry': download(); break;
        case 'save': void persistence.saveNowResult().then((r) => { if (r === 'saved') toast.show({ title: 'Saved', tone: 'success' }); }); break;
        case 'undo': dispatch({ type: 'undo' }); break;
        case 'redo': dispatch({ type: 'redo' }); break;
        case 'format': void format(); break;
        case 'toggle-sidebar': dispatchLayout({ type: 'toggle', panel: 'sidebar' }); break;
        case 'toggle-preview': dispatchLayout({ type: 'toggle', panel: 'preview' }); break;
        case 'toggle-bottom': dispatchLayout({ type: 'toggle', panel: 'bottom' }); break;
        case 'toggle-docs': dispatchLayout({ type: 'pinDocs', pinned: !layout.docsPinned }); break;
        case 'split': splitEditor(); break;
        case 'show-references': dispatchLayout({ type: 'setBottomTab', tab: 'references' }); break;
        case 'refresh': setPreviewKey((k) => k + 1); break;
        case 'pause': setPaused((p) => !p); break;
        case 'settings': toast.show({ title: 'Settings', description: 'Studio settings arrive with C7. Use the theme menu for now.', tone: 'neutral' }); break;
      }
    };
    /** C5 decision 5a: Create component at the end of the tab row. */
    const createComponentButton = (
      <IconButton size="sm" variant="tertiary" icon={<Boxes />} label="Create component" data-testid="tab-create-component"
        onClick={(e) => setCreateDest(destinationFromActive(activePath, project.files), e.currentTarget)} />
    );
    const themeLabel = THEMES.find((t) => t.name === resolved)?.label ?? resolved;
    return (
      <CodeWorkspace
        breakpoint={breakpoint}
        layout={layout}
        dispatchLayout={dispatchLayout}
        menuBar={(
          <MenuBar breakpoint={breakpoint} workspace={workspace} onWorkspace={setWorkspace} menus={menus} onAction={onMenu}
            canUndo={!!state.past.length} canRedo={!!state.future.length} saveState={saveState} theme={theme} setTheme={setTheme} />
        )}
        strips={(
          <>
            {storageDown && (
              <MessageStrip tone="error" className={styles.strip} title="Couldn't save to browser storage" actions={<Button size="sm" onClick={downloadProject}>Download project files</Button>}>
                Your saved project was not changed, but changes made here are not saved.
              </MessageStrip>
            )}
            {isExample && (
              <MessageStrip tone="information" className={styles.strip} title="Example from the docs" actions={<Button size="sm" onClick={() => { void backToMyProject(); }}>Back to my project</Button>}>
                This example is a separate project.
              </MessageStrip>
            )}
          </>
        )}
        explorer={(
          <FileTree state={state} dispatch={dispatch} loading={!loaded} titleClassName={styles.paneTitle} dirtyPaths={dirty} moveFeedback="strip"
            errorPaths={stale ? [stale.file] : undefined} onOpen={(path) => openTabFile(path)}
            onOpenToSide={breakpoint === 'desktop' ? (path) => openTabFile(path, true) : undefined}
            onCreateComponent={(folder) => setCreateDest(`${folder}/`)} />
        )}
        search={<SearchPanel files={project.files} onOpen={(path, line) => goToLine(path, line)} />}
        overlays={(
          <>
            {createDest !== null && (
              <CreateComponentDialog files={project.files} destination={createDest} onClose={() => setCreateDest(null)}
                onCreate={(name, plan) => {
                  // Dry run first: a failure (e.g. the file limit) leaves the project and history unchanged.
                  const r = applyComponent(state, name, plan);
                  if (r.error) return r.error;
                  dispatch(createAction(name, plan));
                  setCreateDest(null);
                  announce(`Created component ${name}: ${Object.keys(plan.files).length} files.`);
                  return undefined;
                }} />
            )}
            {quickOpen && (
              <QuickOpen paths={fileList} recent={state.recent} current={activePath}
                onOpen={(path, line, toSide) => {
                  const side = !!toSide && breakpoint === 'desktop';
                  if (line) goToLine(path, line, 1, side); else openTabFile(path, side);
                }}
                onRemoveRecent={(path) => dispatch({ type: 'removeRecent', path })}
                onClose={() => setQuickOpen(false)} />
            )}
            <RewriteFeedback report={freshChange} onUndo={() => dispatch({ type: 'undo' })}
              onOpen={(path, line) => goToLine(path, line ?? 1)}
              onOpenProblems={() => dispatchLayout({ type: 'setBottomTab', tab: 'problems' })} />
            <RenameSymbolFeedback
              result={symbolRename}
              onApply={() => { if (symbolRename) applySymbolRename(symbolRename.request); }}
              onCancel={() => { setSymbolRename(null); adapters.current[focusedIndex]?.focus(); }}
              onUndo={() => { dispatch({ type: 'undo' }); setSymbolRename(null); announce('Rename undone.'); }}
              onOpen={(path) => goToLine(path, 1)}
              onRenameFile={(path) => {
                const base = path.slice(path.lastIndexOf('/') + 1);
                const to = `${path.slice(0, path.lastIndexOf('/') + 1)}${symbolRename?.newName ?? ''}${base.slice(base.lastIndexOf('.'))}`;
                setSymbolRename(null);
                if (!Object.hasOwn(project.files, to)) dispatch({ type: 'renameFile', from: path, to });
                else announce(`${to} already exists.`);
              }}
              onDismiss={() => setSymbolRename(null)}
            />
          </>
        )}
        editor={renderGroup(focusedIndex, true)}
        groupsEditor={({ leading, trailing }) => (
          <div className={workspaceStyles.groups}>
            {groups.map((g, i) => (
              <section key={i} className={workspaceStyles.group} aria-label={groups.length > 1 ? `Editor group ${i + 1}` : undefined}
                onMouseDownCapture={() => { if (i !== focusedIndex) dispatch({ type: 'focusGroup', group: i }); }}>
                <div className={workspaceStyles.groupHead}>
                  <EditorTabs
                    tabs={g.tabs} active={g.active} dirty={dirty} group={i} groupCount={groups.length} focused={i === focusedIndex}
                    onFocusGroup={() => dispatch({ type: 'focusGroup', group: i })}
                    onSelect={(path) => { dispatch({ type: 'focusGroup', group: i }); openTabFile(path); }}
                    onClose={(path) => closeTab(path, i)}
                    onMove={(path, from, to, index) => moveTab(path, from, to, index)}
                    onSplit={groups.length < 2 ? splitEditor : undefined}
                    onCloseAll={() => dispatch({ type: 'closeGroup', group: i })}
                    onCloseOthers={(path) => dispatch({ type: 'setGroups', groups: groups.map((x, j) => (j === i ? { tabs: [path], active: path } : x)), focused: i })}
                    leading={i === 0 ? leading : null}
                    trailing={i === groups.length - 1 ? <>{createComponentButton}{trailing}</> : null}
                  />
                </div>
                <span className={workspaceStyles.groupCrumb}>{g.active.split('/').join(' › ')}</span>
                <div className={workspaceStyles.groupBody}>{renderGroup(i, false)}</div>
              </section>
            ))}
          </div>
        )}
        references={references}
        onOpenReference={(path, line, column) => goToLine(path, line, column)}
        onClearReferences={() => setReferences(null)}
        preview={(
          <PreviewPane
            theme={previewTheme} onTheme={setPreviewTheme} density={previewDensity} onDensity={setPreviewDensity}
            viewport={viewport} onViewport={setViewport} paused={paused} onPause={() => setPaused((p) => !p)}
            onRefresh={() => setPreviewKey((k) => k + 1)}
            stale={stale}
            onGoToError={() => stale && goToLine(stale.file, stale.line)}
            onRetry={() => { build.recompile(); if (build.failed) announce('Recompiling. The preview updates when the errors are fixed.'); }}
            compact={breakpoint !== 'desktop'}
            customSize={layout.previewSize} onCustomSize={(size) => dispatchLayout({ type: 'setPreviewSize', size })}
            runtimeError={runtimeError && !stale ? { message: runtimeError.message, file: runtimeError.path || null, line: runtimeError.range?.startLine ?? null } : null}
            onGoToRuntimeError={() => runtimeError?.path && goToLine(runtimeError.path, runtimeError.range?.startLine ?? null, runtimeError.range?.startColumn ?? 1)}
            onDismissRuntimeError={() => setRuntimeError(null)}
          >
            <CodePreviewFrame key={previewKey} artifact={build.artifact} theme={previewTheme} density={previewDensity}
              onConsole={(level, args, location) => consoleBatch.push({ level, args, location })}
              onRuntimeError={(e) => { setRuntimeError(fromRuntime(e)); consoleBatch.push({ level: 'uncaught', args: [e.message], location: e }); }}
              onSuccess={() => setRuntimeError(null)} />
          </PreviewPane>
        )}
        tabs={tabs}
        activePath={activePath}
        dirty={dirty}
        onSelectTab={(path) => openTabFile(path)}
        onCloseTab={(path) => closeTab(path)}
        problems={problems}
        onGoToProblem={(p) => p.file && goToLine(p.file, p.line, p.column ?? 1)}
        consoleEntries={consoleState.entries}
        onClearConsole={() => { consoleBatch.reset(); dispatchConsole({ type: 'clear' }); }}
        consoleDropped={consoleState.dropped}
        onOpenSource={(path, line, column) => goToLine(path, line, column ?? 1)}
        onCreateComponent={() => setCreateDest('src/components/')}
        tabActions={createComponentButton}
        status={{ file: activePath, line: cursor.line, column: cursor.column, saveState, theme: themeLabel, errors: problemCounts.errors, warnings: problemCounts.warnings, previewState: stale ? 'stale' : paused ? 'paused' : 'live' }}
      />
    );
  }

  return (
    <div className={styles.studio}>
      <ApplicationHeader
        productName="Enterprise UI Studio"
        homeHref="./"
        actions={(
          <div className={styles.headerActions}>
            <IconButton size="sm" variant="tertiary" icon={<Undo2 />} label="Undo" disabled={!state.past.length} onClick={() => dispatch({ type: 'undo' })} />
            <IconButton size="sm" variant="tertiary" icon={<Redo2 />} label="Redo" disabled={!state.future.length} onClick={() => dispatch({ type: 'redo' })} />
            <IconButton size="sm" variant="tertiary" icon={<Sparkles />} label="Format code" onClick={() => void format()} />
            <IconButton size="sm" variant="tertiary" icon={<FilePlus2 />} label="New page" onClick={() => { commitEntry(STARTER); setSelectedId(null); }} />
            <IconButton size="sm" variant="tertiary" icon={<Download />} label="Download App.tsx" onClick={download} />
            <Select
              size="sm"
              label="Theme"
              hideLabel
              value={theme}
              onChange={(v) => v && setTheme(v as ThemePreference)}
              options={[{ value: 'system', label: 'System theme' }, ...THEMES.map((t) => ({ value: t.name, label: t.label }))]}
            />
            <Button size="sm" variant="tertiary" icon={<BookOpen />} onClick={() => { window.location.href = '../'; }}>Docs</Button>
          </div>
        )}
      />
      <section className={styles.toolbar} aria-label="Page tools">
        <VisuallyHidden><h1>Enterprise UI Studio</h1></VisuallyHidden>
        <SegmentedButton
          size="sm"
          aria-label="Editor view"
          selectionMode="single"
          value={[view]}
          onChange={(v) => v[0] && setView(v[0] as View)}
          items={[{ value: 'design', label: 'Design' }, { value: 'split', label: 'Split' }, { value: 'code', label: 'Code' }]}
        />
        <WorkspaceSwitch value={workspace} onChange={setWorkspace} short={breakpoint === 'mobile'} />
        <span className={styles.status} role="status" aria-live="polite">
          {doc.error ? 'Code has errors' : preview.error ? 'Preview error' : storageDown ? 'Not saved' : !loaded ? 'Loading…' : saved ? 'Saved in this browser' : 'Saving…'}
        </span>
      </section>
      <div className={styles.workspace}>
        <nav className={styles.left} aria-label="Files, components and outline">
          <section className={cx(styles.pane, styles.filesPane, collapsed.files && styles.collapsed)} aria-labelledby="files-title">
            <FileTree
              state={state}
              dispatch={dispatch}
              loading={!loaded}
              titleClassName={styles.paneTitle}
              collapsed={collapsed.files}
              collapseToggle={paneToggle('files', 'Files')}
              onOpen={(path) => {
                dispatch({ type: 'openFile', path });
                // TODO(UX-10): remove this switch to Split once editor tabs ship; tabs show the opened file.
                if (path !== entry && view === 'design') {
                  setView('split');
                  announce(`Switched to Split view to show ${path.slice(path.lastIndexOf('/') + 1)}.`);
                }
              }}
            />
          </section>
          <section className={cx(styles.pane, collapsed.components && styles.collapsed)} aria-labelledby="palette-title">
            <div className={styles.paneHead}>{paneToggle('components', 'Components')}<h2 id="palette-title" className={styles.paneTitle}>Components</h2></div>
            <div id="components-body" className={styles.paneBody} hidden={collapsed.components}><Palette onInsert={insertAtSelection} /></div>
          </section>
          <section className={cx(styles.pane, collapsed.outline && styles.collapsed)} aria-labelledby="outline-title" data-studio-outline>
            <div className={styles.paneHead}>{paneToggle('outline', 'Outline')}<h2 id="outline-title" className={styles.paneTitle}>Outline</h2></div>
            <div id="outline-body" className={cx(styles.paneBody, styles.outline)} hidden={collapsed.outline}><Outline root={root} selectedId={selectedId} onSelect={setSelectedId} /></div>
          </section>
        </nav>
        <main className={styles.center} aria-label="Page">
          {storageDown && (
            <MessageStrip
              tone="error"
              className={styles.strip}
              title="Couldn't save to browser storage"
              actions={<Button size="sm" onClick={downloadProject}>Download project files</Button>}
            >
              {persistence.error instanceof StorageBlockedError
                ? 'Another Studio tab is using an older version. Close other Studio tabs and reload. Your saved project was not changed; changes made here are not saved.'
                : 'Your saved project was not changed, but changes made here are not saved. Download the project files (one JSON file with every file; ZIP export comes later) to keep your work, then reload.'}
            </MessageStrip>
          )}
          {isExample && (
            <MessageStrip
              tone="information"
              className={styles.strip}
              title="Example from the docs"
              actions={<Button size="sm" onClick={() => { void backToMyProject(); }}>Back to my project</Button>}
            >
              This example is a separate project. It's saved once you edit it, but reloading the Studio opens your own project again.
            </MessageStrip>
          )}
          {persistence.notice && (
            <MessageStrip tone="warning" className={styles.strip} title="Your project was upgraded with changes" dismissible onDismiss={() => { void persistence.dismissNotice(); }}>
              {persistence.notice.message}
            </MessageStrip>
          )}
          {(doc.error || preview.error) && (
            <MessageStrip tone={doc.error ? 'warning' : 'error'} className={styles.strip} title={doc.error ? 'The page cannot be edited visually' : 'Preview error'}>
              {doc.error ?? preview.error}
            </MessageStrip>
          )}
          <div className={view === 'split' ? styles.split : styles.single}>
            {showDesign && (
              <Canvas
                code={previewCode}
                root={root}
                theme={resolved}
                density={density}
                design
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDropComponent={insertAt}
                onDropNode={onDropNode}
                onStatus={setPreview}
              />
            )}
            {showCode && (
              <section className={styles.codePane} aria-label="Code editor">
                <Suspense fallback={<BusyIndicator active text="Loading code editor" />}>
                  <CodeEditor
                    files={project.files}
                    path={activePath}
                    theme={resolved}
                    onChange={(next, path) => dispatch({ type: 'editFile', path, text: next, source: 'editor' })}
                    onReady={(handle) => {
                      editorHandle.current = handle;
                      if (pendingLine.current) { handle.revealLine(pendingLine.current); pendingLine.current = null; }
                    }}
                  />
                </Suspense>
              </section>
            )}
          </div>
        </main>
        <aside className={styles.right} aria-labelledby="inspector-title">
          <h2 id="inspector-title" className={styles.paneTitle}>Inspector</h2>
          <Inspector
            node={selected}
            isRoot={!!selected && !parentId(selected.id)}
            canMoveUp={!!selected && indexOf(selected.id) > 0}
            canMoveDown={!!selected && indexOf(selected.id) < siblings - 1}
            onSetAttribute={(name: string, value: AttrInput) => selected && commitEntry(setAttribute(code, selected.id, name, value), typeof value === 'string' ? 'editor' : 'visual')}
            onSetText={(text) => selected && commitEntry(setText(code, selected.id, text), 'editor')}
            onAction={onAction}
          />
        </aside>
      </div>
    </div>
  );
}

export function Studio() {
  const { theme, setTheme, density } = useDocsSettings();
  return (
    <ThemeProvider theme={theme} density={density} style={{ height: '100vh' }}>
      <ToastProvider>
        <StudioApp theme={theme} setTheme={setTheme} density={density} />
      </ToastProvider>
    </ThemeProvider>
  );
}
