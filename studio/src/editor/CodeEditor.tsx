import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BusyIndicator, IconButton } from '@enterprise-ui/react';
import { Pin } from 'lucide-react';
import type * as Monaco from 'monaco-editor/editor/editor.api.js';
import styles from '../Studio.module.css';
import type { EditorAdapter, EditorEvents, EditorRange, FormatResult } from './EditorAdapter';
import type { ReferenceSet } from '../panels/bottom/ReferencesPanel';
import type { RenamePlan } from './navigationModel';
import type { ModelRegistry } from './monaco/models';

/** C1 name for the adapter; kept so existing callers compile. */
export type CodeEditorHandle = EditorAdapter;

/** A finished F2 rename: Studio applies `plan` as one undo step (or shows it first when `preview`). */
export interface RenameRequest { path: string; oldName: string; newName: string; plan: RenamePlan; preview: boolean }

export interface CodeEditorProps extends EditorEvents {
  /** Every VFS file: each gets a model so the TypeScript worker can navigate across files (C3). */
  files: Readonly<Record<string, string>>;
  /** The file shown in this editor. */
  path: string;
  /** The editor group (0 = left, 1 = right). */
  group?: number;
  /** The store's last rename/move, so models and view state follow it. */
  moves?: { id: number; moves: readonly (readonly [string, string])[] };
  /** Theme name, used to restyle the editor when the EUI theme changes. */
  theme: string;
  onReady?: (adapter: EditorAdapter) => void;
  /** Accessible name. Updated whenever it changes (C3: it follows the active file). */
  label?: string;
  /** F12 / peek navigation to another file: open it in this group. */
  onOpenLocation?: (path: string, line: number, column: number) => void;
  /** Pin from the references peek (C3 decision 5a). */
  onPinReferences?: (references: ReferenceSet) => void;
  /** F2 rename symbol (C3 decisions 6a/7a). Without it, F2 keeps Monaco's own rename. */
  onRenameSymbol?: (request: RenameRequest) => void;
  /** Shift+Alt+F inside the editor: Studio formats the active model with Prettier. */
  onFormat?: () => void;
}

type MonacoModule = typeof import('./monaco');
type Nav = typeof import('./monaco/navigation');

/** Editors by Monaco instance, so the global editor opener can route F12 to the right group. */
const openers = new Map<unknown, (path: string, line: number, column: number) => void>();

interface RenameBox { top: number; left: number; value: string; line: number; column: number; oldName: string; error?: string; busy?: boolean }

export function CodeEditor({
  files, path, group = 0, moves, theme, onReady, label = 'Page code', onCursor, onChange, onFocus, onOpenLocation, onPinReferences, onRenameSymbol, onFormat,
}: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const api = useRef<MonacoModule | null>(null);
  const nav = useRef<Nav | null>(null);
  const registry = useRef<ModelRegistry | null>(null);
  const shown = useRef<string | null>(null);
  const latest = useRef({ files, path, group, moves, onChange, onCursor, onFocus, onOpenLocation, onPinReferences, onRenameSymbol, onFormat });
  latest.current = { files, path, group, moves, onChange, onCursor, onFocus, onOpenLocation, onPinReferences, onRenameSymbol, onFormat };
  const [loading, setLoading] = useState(true);
  /** A slot inside the open references peek's header, for the Pin button. */
  const [peekSlot, setPeekSlot] = useState<HTMLElement | null>(null);
  const refPosition = useRef<{ path: string; line: number; column: number } | null>(null);
  const [rename, setRename] = useState<RenameBox | null>(null);

  /** Shows `next`'s model, saving the current view state and restoring the next one's. */
  const show = (next: string) => {
    const ed = editor.current;
    const reg = registry.current;
    if (!ed || !reg) return;
    const text = latest.current.files[next];
    if (text === undefined) return;
    const prev = shown.current;
    const current = ed.getModel();
    if (prev === next && current && !current.isDisposed()) return;
    if (prev && current && !current.isDisposed()) reg.saveViewState(latest.current.group, prev, ed.saveViewState());
    const model = reg.ensure(next, text) as unknown as Monaco.editor.ITextModel;
    ed.setModel(model);
    shown.current = next;
    const view = reg.viewState(latest.current.group, next) as Monaco.editor.ICodeEditorViewState | undefined;
    if (view) ed.restoreViewState(view);
  };

  const adapter = (ed: Monaco.editor.IStandaloneCodeEditor): EditorAdapter => {
    const toRange = (r: EditorRange) => ({ startLineNumber: r.startLine, startColumn: r.startColumn, endLineNumber: r.endLine, endColumn: r.endColumn });
    return {
      get group() { return latest.current.group; },
      activePath: () => shown.current,
      open: (p) => show(p),
      getSelection: () => {
        const s = ed.getSelection();
        return s ? { startLine: s.startLineNumber, startColumn: s.startColumn, endLine: s.endLineNumber, endColumn: s.endColumn } : null;
      },
      setSelection: (r) => ed.setSelection(toRange(r)),
      reveal: (r) => {
        const range = 'line' in r ? { startLine: r.line, startColumn: r.column ?? 1, endLine: r.line, endColumn: r.column ?? 1 } : r;
        ed.revealRangeInCenter(toRange(range));
        ed.setPosition({ lineNumber: range.startLine, column: range.startColumn });
        ed.focus();
      },
      revealLine: (line) => { ed.revealLineInCenter(line); ed.setPosition({ lineNumber: line, column: 1 }); ed.focus(); },
      focus: () => ed.focus(),
      format: async (): Promise<FormatResult> => {
        const model = ed.getModel();
        const p = shown.current;
        if (!model || !p) return { ok: false, message: 'No file is open.' };
        if (!/\.(tsx?|jsx?)$/.test(p)) return { ok: false, message: 'Formatting is available for TypeScript and JavaScript files.' };
        const before = model.getValue();
        let after: string;
        try {
          const { formatCode } = await import('./format');
          after = await formatCode(before);
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message.split('\n')[0] : String(error) };
        }
        // The file may have changed while Prettier ran: never apply a stale result.
        if (model.isDisposed() || model.getValue() !== before) return { ok: false, message: 'The file changed while formatting. Try again.' };
        if (after === before) return { ok: true, changed: false };
        ed.pushUndoStop();
        ed.executeEdits('format', [{ range: model.getFullModelRange(), text: after }]);
        ed.pushUndoStop();
        return { ok: true, changed: true };
      },
      setLabel: (l) => ed.updateOptions({ ariaLabel: l }),
      dispose: () => ed.dispose(),
    };
  };

  useEffect(() => {
    let disposed = false;
    void Promise.all([import('./monaco'), import('./monaco/navigation'), import('./monaco/models')]).then(([mod, navigation, models]) => {
      if (disposed || !host.current) return;
      api.current = mod;
      nav.current = navigation;
      const { monaco } = mod;
      registry.current = models.sharedRegistry(monaco as unknown as Parameters<typeof models.sharedRegistry>[0]);
      registry.current.sync(latest.current.files, latest.current.moves);
      const ed = monaco.editor.create(host.current, {
        model: null,
        automaticLayout: true,
        lineNumbers: 'on',
        minimap: { enabled: false },
        fontSize: 13,
        tabSize: 2,
        scrollBeyondLastLine: false,
        ariaLabel: label,
        accessibilitySupport: 'auto',
        fixedOverflowWidgets: true,
      });
      editor.current = ed;
      show(latest.current.path);
      openers.set(ed, (p, line, column) => latest.current.onOpenLocation?.(p, line, column));
      navigation.setOpenHandler((p, line, column, source) => {
        const open = openers.get(source) ?? [...openers.values()].at(-1);
        open?.(p, line, column);
      });
      ed.onDidChangeModelContent(() => {
        const model = ed.getModel();
        const p = shown.current;
        if (!model || !p || registry.current?.isApplying()) return;
        latest.current.onChange?.(model.getValue(), p);
      });
      ed.onDidChangeCursorPosition((event: Monaco.editor.ICursorPositionChangedEvent) => {
        latest.current.onCursor?.({ line: event.position.lineNumber, column: event.position.column });
      });
      ed.onDidFocusEditorText(() => latest.current.onFocus?.());
      const { KeyCode, KeyMod } = monaco;
      // Shift+F12 is Monaco's own references peek (decision 5a); the position is kept for "Pin".
      ed.onKeyDown((event) => {
        if (event.keyCode !== KeyCode.F12 || !(event.shiftKey || event.altKey)) return;
        const pos = ed.getPosition();
        if (pos && shown.current) refPosition.current = { path: shown.current, line: pos.lineNumber, column: pos.column };
      });
      ed.addAction({ id: 'studio.formatDocument', label: 'Format Document (Prettier)', keybindings: [KeyMod.Shift | KeyMod.Alt | KeyCode.KeyF], run: () => latest.current.onFormat?.() });
      ed.addAction({
        id: 'studio.renameSymbol', label: 'Rename Symbol', keybindings: [KeyCode.F2],
        run: async (e) => {
          const pos = e.getPosition();
          const p = shown.current;
          if (!pos || !p) return;
          if (!latest.current.onRenameSymbol) { e.trigger('studio', 'editor.action.rename', null); return; }
          const target = await navigation.renameTarget(latest.current.files, p, pos.lineNumber, pos.column);
          const at = e.getScrolledVisiblePosition(pos);
          const word = e.getModel()?.getWordAtPosition(pos);
          const name = target.ok ? target.name : word?.word ?? '';
          setRename({ top: (at?.top ?? 0) + (at?.height ?? 18), left: Math.max(0, at?.left ?? 0), value: name, oldName: name, line: pos.lineNumber, column: word?.startColumn ?? pos.column, error: target.ok ? undefined : target.message });
        },
      });
      // The references peek is Monaco's own widget; a Pin button is laid over its header.
      const watch = new MutationObserver(() => {
        const actions = host.current?.querySelector<HTMLElement>('.peekview-widget.reference-zone-widget .peekview-actions');
        if (!actions) { setPeekSlot(null); return; }
        let slot = actions.querySelector<HTMLElement>(':scope > [data-studio-pin]');
        if (!slot) {
          slot = document.createElement('div');
          slot.dataset.studioPin = '';
          slot.className = styles.peekPin;
          actions.prepend(slot);
        }
        setPeekSlot((prev) => (prev === slot ? prev : slot));
      });
      watch.observe(host.current, { childList: true, subtree: true });
      ed.onDidDispose(() => watch.disconnect());
      mod.applyTheme(host.current, /dark/.test(document.documentElement.dataset.euiTheme ?? theme), theme === 'high-contrast');
      setLoading(false);
      onReady?.(adapter(ed));
    });
    return () => {
      disposed = true;
      if (editor.current) {
        const p = shown.current;
        if (p) registry.current?.saveViewState(latest.current.group, p, editor.current.saveViewState());
        openers.delete(editor.current);
        editor.current.dispose();
      }
      editor.current = null;
      shown.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the editor is created once.
  }, []);

  // Store → models (all files), then show the active file. Child effects run before the parent's,
  // so the editor keeps its own models current rather than waiting for Studio.
  useEffect(() => {
    if (!registry.current) return;
    registry.current.sync(files, moves);
    show(path);
  }, [files, path, moves]);

  useEffect(() => { editor.current?.updateOptions({ ariaLabel: label }); }, [label]);

  useEffect(() => {
    if (api.current && host.current) api.current.applyTheme(host.current, theme.includes('dark'), theme === 'high-contrast');
  }, [theme]);

  const pin = async () => {
    const at = refPosition.current;
    if (!at || !nav.current) return;
    const refs = await nav.current.findReferences(latest.current.files, at.path, at.line, at.column);
    if (refs) {
      latest.current.onPinReferences?.(refs);
      editor.current?.trigger('studio', 'closeReferenceSearch', null);
    }
  };

  const submitRename = async (preview: boolean) => {
    const box = rename;
    const p = shown.current;
    if (!box || !p || !nav.current) return;
    if (box.value === box.oldName) { setRename(null); editor.current?.focus(); return; }
    setRename({ ...box, busy: true, error: undefined });
    const result = await nav.current.computeRename(latest.current.files, p, box.line, box.column, box.value);
    if (!result.ok) { setRename({ ...box, busy: false, error: result.message }); return; }
    setRename(null);
    latest.current.onRenameSymbol?.({ path: p, oldName: result.oldName, newName: box.value, plan: result.plan, preview });
    editor.current?.focus();
  };

  return (
    <div className={styles.editorHost}>
      {loading && <div className={styles.editorLoading}><BusyIndicator active text="Loading code editor" /></div>}
      <div ref={host} className={styles.editor} data-testid="code-editor" data-group={group} />
      {peekSlot && onPinReferences && createPortal(
        <IconButton size="sm" variant="tertiary" icon={<Pin />} label="Pin references to the References panel" onClick={() => { void pin(); }} />,
        peekSlot,
      )}
      {rename && (
        <div className={styles.renameBox} style={{ top: rename.top, left: rename.left }}>
          <input
            autoFocus
            aria-label={`Rename ${rename.oldName}`}
            aria-describedby={`rename-help-${group}`}
            aria-invalid={rename.error ? true : undefined}
            className={styles.renameInput}
            value={rename.value}
            disabled={rename.busy}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setRename({ ...rename, value: e.target.value, error: undefined })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); void submitRename(e.shiftKey); }
              else if (e.key === 'Escape') { e.preventDefault(); setRename(null); editor.current?.focus(); }
            }}
            onBlur={() => { if (!rename.busy) setRename(null); }}
          />
          <span id={`rename-help-${group}`} className={rename.error ? styles.renameError : styles.renameHelp} role={rename.error ? 'alert' : undefined}>
            {rename.error ?? 'Enter to rename, Shift+Enter to preview'}
          </span>
        </div>
      )}
    </div>
  );
}
