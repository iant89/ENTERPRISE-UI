import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ApplicationHeader, BusyIndicator, VisuallyHidden, Button, IconButton, MessageStrip, SegmentedButton, Select, ThemeProvider, THEMES, ToastProvider, useToast,
  type Density, type ThemeName, type ThemePreference,
} from '@enterprise-ui/react';
import { BookOpen, Download, FilePlus2, Redo2, Sparkles, Undo2 } from 'lucide-react';
import { useDocsSettings } from '../../docs/src/settings';
import { decodePlaygroundCode, playgroundCodeParam } from '../../docs/src/playgroundLink';
import { Canvas, type DropTarget } from './Canvas';
import { Palette } from './Palette';
import { Outline } from './Outline';
import { Inspector } from './Inspector';
import type { CodeEditorHandle } from './editor/CodeEditor';
import { commit, createHistory, redo, undo, type History } from './model/history';
import {
  componentNames, duplicateNode, ensureImports, findNode, insertElement, instrument, moveNode, parentId, parseDocument, removeNode, setAttribute, setText,
  type AttrInput, type StudioNode,
} from './model/jsx';
import { acceptsChildren, defaultSnippet } from './model/catalog';
import { loadProject, saveProject } from './storage';
import { STARTER } from './template';
import styles from './Studio.module.css';

const CodeEditor = lazy(() => import('./editor/CodeEditor').then((m) => ({ default: m.CodeEditor })));

type View = 'design' | 'split' | 'code';
type Action =
  | { type: 'commit'; code: string; source?: 'visual' | 'editor' | 'load' }
  | { type: 'reset'; code: string }
  | { type: 'undo' }
  | { type: 'redo' };

function reducer(state: History, action: Action): History {
  switch (action.type) {
    case 'commit': return commit(state, action.code, action.source);
    case 'reset': return createHistory(action.code);
    case 'undo': return undo(state);
    case 'redo': return redo(state);
  }
}

const resolveTheme = (theme: ThemePreference): ThemeName =>
  theme === 'system' ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;

const indexOf = (id: string) => Number(id.slice(id.lastIndexOf('.') + 1));

interface StudioAppProps { theme: ThemePreference; setTheme: (theme: ThemePreference) => void; density: Density }

function StudioApp({ theme, setTheme, density }: StudioAppProps) {
  const toast = useToast();
  const [state, dispatch] = useReducer(reducer, undefined, () => createHistory(STARTER));
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(true);
  const [view, setView] = useState<View>('design');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ error: string | null; ready: boolean }>({ error: null, ready: false });
  const editorHandle = useRef<CodeEditorHandle | null>(null);
  const pendingLine = useRef<number | null>(null);
  const code = state.present;
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

  // Load: a page opened from the docs (#?code=…) wins over the saved project.
  useEffect(() => {
    let active = true;
    void (async () => {
      const param = playgroundCodeParam();
      const fromLink = param ? await decodePlaygroundCode(param) : null;
      const savedProject = fromLink ? undefined : await loadProject();
      if (!active) return;
      if (fromLink) {
        dispatch({ type: 'reset', code: fromLink });
        history.replaceState(null, '', window.location.pathname + window.location.search);
        toast.show({ title: 'Example opened in Studio', tone: 'success' });
      } else if (savedProject?.code) dispatch({ type: 'reset', code: savedProject.code });
      setLoaded(true);
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on start.
  }, []);

  // Autosave to IndexedDB.
  useEffect(() => {
    if (!loaded) return;
    setSaved(false);
    const timer = setTimeout(() => { void saveProject(code).then(() => setSaved(true)); }, 400);
    return () => clearTimeout(timer);
  }, [code, loaded]);

  useEffect(() => { if (selectedId && !findNode(root, selectedId)) setSelectedId(null); }, [root, selectedId]);

  const apply = useCallback((next: string, select?: string | null) => {
    if (next !== code) dispatch({ type: 'commit', code: next });
    if (select !== undefined) setSelectedId(select);
  }, [code]);

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
      if (mod && key === 's') { event.preventDefault(); void saveProject(code).then(() => { setSaved(true); toast.show({ title: 'Saved', tone: 'success' }); }); return; }
      if (event.shiftKey && event.altKey && key === 'f') { event.preventDefault(); void format(); return; }
      if (inEditor || inField) return;
      if (mod && key === 'z') { event.preventDefault(); dispatch({ type: event.shiftKey ? 'redo' : 'undo' }); }
      else if (mod && key === 'y') { event.preventDefault(); dispatch({ type: 'redo' }); }
      else if ((key === 'delete' || key === 'backspace') && selected && target.closest?.('[data-studio-outline]')) { event.preventDefault(); onAction('delete'); }
      else if (event.altKey && (key === 'arrowup' || key === 'arrowdown') && selected) { event.preventDefault(); onAction(key === 'arrowup' ? 'up' : 'down'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [code, format, onAction, selected, toast]);

  const onDropNode = (id: string, target: DropTarget) => {
    const moved = moveNode(code, id, target.parentId, target.index);
    apply(moved.code, moved.id);
  };

  const siblings = selected && parentId(selected.id) ? findNode(root, parentId(selected.id)!)?.children.length ?? 0 : 0;
  const showDesign = view !== 'code';
  const showCode = view !== 'design';

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
            <IconButton size="sm" variant="tertiary" icon={<FilePlus2 />} label="New page" onClick={() => { dispatch({ type: 'commit', code: STARTER }); setSelectedId(null); }} />
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
        <span className={styles.status} role="status" aria-live="polite">
          {doc.error ? 'Code has errors' : preview.error ? 'Preview error' : saved ? 'Saved in this browser' : 'Saving…'}
        </span>
      </section>
      <div className={styles.workspace}>
        <nav className={styles.left} aria-label="Components and outline">
          <section className={styles.pane} aria-labelledby="palette-title">
            <h2 id="palette-title" className={styles.paneTitle}>Components</h2>
            <Palette onInsert={insertAtSelection} />
          </section>
          <section className={styles.pane} aria-labelledby="outline-title" data-studio-outline>
            <h2 id="outline-title" className={styles.paneTitle}>Outline</h2>
            <div className={styles.outline}><Outline root={root} selectedId={selectedId} onSelect={setSelectedId} /></div>
          </section>
        </nav>
        <main className={styles.center} aria-label="Page">
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
                    value={code}
                    theme={resolved}
                    onChange={(next) => dispatch({ type: 'commit', code: next, source: 'editor' })}
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
            onSetAttribute={(name: string, value: AttrInput) => selected && dispatch({ type: 'commit', code: setAttribute(code, selected.id, name, value), source: typeof value === 'string' ? 'editor' : 'visual' })}
            onSetText={(text) => selected && dispatch({ type: 'commit', code: setText(code, selected.id, text), source: 'editor' })}
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
