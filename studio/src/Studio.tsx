import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ApplicationHeader, BusyIndicator, VisuallyHidden, Button, IconButton, MessageStrip, SegmentedButton, Select, ThemeProvider, THEMES, ToastProvider, useAnnouncer, useToast,
  type Density, type ThemeName, type ThemePreference,
} from '@enterprise-ui/react';
import { cx } from '../../src/utilities/cx';
import { BookOpen, ChevronDown, ChevronRight, Download, FilePlus2, Redo2, Sparkles, Undo2 } from 'lucide-react';
import { useDocsSettings } from '../../docs/src/settings';
import { decodePlaygroundCode, playgroundCodeParam } from '../../docs/src/playgroundLink';
import { Canvas, type DropTarget } from './Canvas';
import { Palette } from './Palette';
import { Outline } from './Outline';
import { Inspector } from './Inspector';
import type { CodeEditorHandle } from './editor/CodeEditor';
import { createStore, storeReducer, type StoreAction, type StoreState } from './model/store';
import { createProject, type Project } from './model/project';
import { FileTree } from './files/FileTree';
import {
  componentNames, duplicateNode, ensureImports, findNode, insertElement, instrument, moveNode, parentId, parseDocument, removeNode, setAttribute, setText,
  type AttrInput, type StudioNode,
} from './model/jsx';
import { acceptsChildren, defaultSnippet } from './model/catalog';
import { listProjects, loadProject, saveProject, StorageBlockedError } from './storage';
import { defaultPersistenceDeps, useProjectPersistence } from './persistence';
import { STARTER } from './template';
import styles from './Studio.module.css';
import { CodeWorkspace } from './app/workspace/CodeWorkspace';
import { MenuBar, type MenuItems } from './app/workspace/MenuBar';
import { WorkspaceSwitch } from './app/workspace/WorkspaceSwitch';
import { useBreakpoint } from './app/workspace/useBreakpoint';
import { SearchPanel } from './app/workspace/SearchPanel';
import { QuickOpen } from './app/workspace/QuickOpen';
import { RewriteFeedback } from './app/workspace/RewriteFeedback';
import { PreviewPane, type StaleInfo } from './preview/PreviewPane';
import type { Problem } from './panels/bottom/BottomPanel';
import {
  DEFAULT_LAYOUT, UNSAVED_PROJECT_KEY, errorLine, layoutReducer, localLayoutStore, type LayoutState, type ViewportId, type Workspace,
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
const layoutStore = localLayoutStore();


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
  const pendingLine = useRef<number | null>(null);
  const { project, activePath } = state;
  const entry = project.entry;
  const code = project.files[entry] ?? '';
  const activeCode = project.files[activePath] ?? '';
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
    const stored = freshStart.current ? layoutStore.load(UNSAVED_PROJECT_KEY) : layoutStore.load(project.id);
    const next = stored ?? layout;
    layoutFor.current = { id: project.id, layout: next };
    firstSaved.current = persistence.savedProject;
    if (stored) {
      dispatchLayout({ type: 'load', layout: stored });
      if (stored.openTabs.length) dispatch({ type: 'setTabs', paths: stored.openTabs });
      if (stored.recent.length) dispatch({ type: 'setRecent', paths: stored.recent });
    }
    // Sweep layouts whose project is gone (C2 follow-up 2).
    void listProjects().then((list) => layoutStore.sweep(list.map((p) => p.id))).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the project changes.
  }, [loaded, project.id]);
  const keyFor = () => (freshStart.current ? UNSAVED_PROJECT_KEY : project.id);
  useEffect(() => {
    const at = layoutFor.current;
    if (!at || at.id !== project.id || at.layout === layout) return;
    at.layout = layout;
    layoutStore.save(keyFor(), layout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyFor reads refs.
  }, [layout, project.id]);
  // First real save of a fresh starter: move its layout from the unsaved key to the project's id.
  const firstSaved = useRef<Project | null>(null);
  useEffect(() => {
    const sp = persistence.savedProject;
    if (!freshStart.current || !sp || sp === firstSaved.current || sp.id !== project.id || !layoutFor.current) return;
    freshStart.current = false;
    layoutStore.save(project.id, layoutFor.current.layout);
    layoutStore.remove(UNSAVED_PROJECT_KEY);
  }, [persistence.savedProject, project.id]);
  // Open tabs live in the store (they follow renames and undo); the layout persists them.
  const tabs = state.openTabs;
  useEffect(() => { if (layout.openTabs.join('\n') !== tabs.join('\n')) dispatchLayout({ type: 'setTabs', paths: tabs }); }, [tabs, layout.openTabs]);
  useEffect(() => { if (layout.recent.join('\n') !== state.recent.join('\n')) dispatchLayout({ type: 'setRecent', paths: state.recent }); }, [state.recent, layout.recent]);
  const [quickOpen, setQuickOpen] = useState(false);
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

  // Decision 6: the preview is stale while the last build failed (parse error now; C4 wires the compiler).
  const staleMessage = doc.error ?? preview.error;
  const stale: StaleInfo | null = useMemo(() => (staleMessage ? { message: staleMessage, file: entry, line: errorLine(staleMessage) } : null), [staleMessage, entry]);
  const problems: Problem[] = useMemo(() => [
    ...(stale ? [{ file: stale.file, line: stale.line, message: stale.message.split('\n')[0], severity: 'error' as const }] : []),
    ...(freshChange?.unresolved ?? []).map((u) => ({ file: u.file, line: u.line ?? null, message: `Import ${u.specifier} could not be updated after the ${freshChange!.verb === 'Moved' ? 'move' : 'rename'} (${u.reason ?? 'unresolved'}).`, severity: 'warning' as const })),
  ], [stale, freshChange]);
  const wasStale = useRef(false);
  useEffect(() => {
    if (stale && !wasStale.current && workspace === 'code') dispatchLayout({ type: 'setBottomTab', tab: 'problems' });
    wasStale.current = !!stale;
  }, [stale, workspace]);
  const frozen = useRef(previewCode);
  if (!paused) frozen.current = previewCode;

  const goToLine = useCallback((path: string, line: number | null) => {
    if (path !== activePath) dispatch({ type: 'openFile', path });
    if (breakpoint === 'mobile') dispatchLayout({ type: 'setMobileTab', tab: 'code' });
    if (breakpoint === 'tablet' && layout.tabletLayout === 'preview') dispatchLayout({ type: 'setTabletLayout', layout: 'split' });
    const target = line ?? 1;
    if (editorHandle.current && path === activePath) editorHandle.current.revealLine(target);
    else pendingLine.current = target;
  }, [activePath, breakpoint, layout.tabletLayout]);
  useEffect(() => {
    if (pendingLine.current && editorHandle.current && workspace === 'code') { editorHandle.current.revealLine(pendingLine.current); pendingLine.current = null; }
  }, [activePath, workspace]);
  const openTabFile = (path: string) => dispatch({ type: 'openFile', path });
  const closeTab = (path: string) => dispatch({ type: 'closeTab', path });
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
    try {
      const { formatCode } = await import('./editor/format');
      apply(await formatCode(code));
      toast.show({ title: 'Code formatted', tone: 'success' });
    } catch (error) {
      toast.show({ title: 'Could not format', description: error instanceof Error ? error.message.split('\n')[0] : String(error), tone: 'error' });
    }
  }, [apply, code, toast]);

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
  }, [persistence, format, onAction, selected, toast, announce, workspace]);

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
        case 'refresh': setPreviewKey((k) => k + 1); break;
        case 'pause': setPaused((p) => !p); break;
        case 'settings': toast.show({ title: 'Settings', description: 'Studio settings arrive with C7. Use the theme menu for now.', tone: 'neutral' }); break;
      }
    };
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
            errorPaths={stale ? [stale.file] : undefined} onOpen={openTabFile} />
        )}
        search={<SearchPanel files={project.files} onOpen={(path, line) => goToLine(path, line)} />}
        overlays={(
          <>
            {quickOpen && (
              <QuickOpen paths={fileList} recent={state.recent} current={activePath}
                onOpen={(path, line) => { if (line) goToLine(path, line); else openTabFile(path); }}
                onRemoveRecent={(path) => dispatch({ type: 'removeRecent', path })}
                onClose={() => setQuickOpen(false)} />
            )}
            <RewriteFeedback report={freshChange} onUndo={() => dispatch({ type: 'undo' })}
              onOpen={(path, line) => goToLine(path, line ?? 1)}
              onOpenProblems={() => dispatchLayout({ type: 'setBottomTab', tab: 'problems' })} />
          </>
        )}
        editor={(
          <Suspense fallback={<BusyIndicator active text="Loading code editor" />}>
            <CodeEditor
              value={activeCode}
              theme={resolved}
              label={`Code of ${activePath}`}
              onCursor={setCursor}
              onChange={(next) => dispatch({ type: 'editFile', path: activePath, text: next, source: 'editor' })}
              onReady={(handle) => {
                editorHandle.current = handle;
                if (pendingLine.current) { handle.revealLine(pendingLine.current); pendingLine.current = null; }
              }}
            />
          </Suspense>
        )}
        preview={(
          <PreviewPane
            theme={previewTheme} onTheme={setPreviewTheme} density={previewDensity} onDensity={setPreviewDensity}
            viewport={viewport} onViewport={setViewport} paused={paused} onPause={() => setPaused((p) => !p)}
            onRefresh={() => setPreviewKey((k) => k + 1)}
            stale={stale}
            onGoToError={() => stale && goToLine(stale.file, stale.line)}
            onRetry={() => { if (doc.error) announce('The code still has errors. Fix them to refresh the preview.'); else setPreviewKey((k) => k + 1); }}
            compact={breakpoint !== 'desktop'}
          >
            <Canvas key={previewKey} code={frozen.current} root={root} theme={previewTheme} density={previewDensity} design={false}
              selectedId={null} onSelect={() => undefined} onDropComponent={() => undefined} onDropNode={() => undefined} onStatus={setPreview} />
          </PreviewPane>
        )}
        tabs={tabs}
        activePath={activePath}
        dirty={dirty}
        onSelectTab={openTabFile}
        onCloseTab={closeTab}
        problems={problems}
        onGoToProblem={(p) => goToLine(p.file, p.line)}
        status={{ file: activePath, line: cursor.line, column: cursor.column, saveState, theme: themeLabel, errors: problems.length, warnings: 0, previewState: stale ? 'stale' : paused ? 'paused' : 'live' }}
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
                    value={activeCode}
                    theme={resolved}
                    onChange={(next) => dispatch({ type: 'editFile', path: activePath, text: next, source: 'editor' })}
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
