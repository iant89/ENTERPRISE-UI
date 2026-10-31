import { useEffect, useRef, useState } from 'react';
import { BusyIndicator } from '@enterprise-ui/react';
import type * as Monaco from 'monaco-editor/editor/editor.api.js';
import styles from '../Studio.module.css';

/** The editor surface used by the Studio. Monaco sits behind this small adapter. */
export interface CodeEditorHandle {
  revealLine(line: number): void;
  focus(): void;
}

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Theme name, used to restyle the editor when the EUI theme changes. */
  theme: string;
  onReady?: (handle: CodeEditorHandle) => void;
  /** Accessible label for the editor's text area. */
  label?: string;
}

export function CodeEditor({ value, onChange, theme, onReady, label = 'Page code' }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const api = useRef<typeof import('./monaco') | null>(null);
  const latest = useRef({ onChange, value });
  latest.current = { onChange, value };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;
    void import('./monaco').then((mod) => {
      if (disposed || !host.current) return;
      api.current = mod;
      const { monaco } = mod;
      const uri = monaco.Uri.parse('file:///src/App.tsx');
      const model = monaco.editor.getModel(uri) ?? monaco.editor.createModel(latest.current.value, 'typescript', uri);
      model.setValue(latest.current.value);
      editor.current = monaco.editor.create(host.current, {
        model,
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
      editor.current.onDidChangeModelContent((event: Monaco.editor.IModelContentChangedEvent) => {
        if (!event.isFlush) latest.current.onChange(model.getValue());
      });
      mod.applyTheme(host.current, /dark/.test(document.documentElement.dataset.euiTheme ?? theme), theme === 'high-contrast');
      setLoading(false);
      onReady?.({
        revealLine: (line) => { editor.current?.revealLineInCenter(line); editor.current?.setPosition({ lineNumber: line, column: 1 }); editor.current?.focus(); },
        focus: () => editor.current?.focus(),
      });
    });
    return () => { disposed = true; editor.current?.dispose(); editor.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the editor is created once.
  }, []);

  // External changes (visual edits, undo/redo) are applied as edits so cursor and Monaco undo survive.
  useEffect(() => {
    const model = editor.current?.getModel();
    if (!model || model.getValue() === value) return;
    editor.current!.pushUndoStop();
    editor.current!.executeEdits('studio', [{ range: model.getFullModelRange(), text: value }]);
    editor.current!.pushUndoStop();
  }, [value]);

  useEffect(() => {
    if (api.current && host.current) api.current.applyTheme(host.current, theme.includes('dark'), theme === 'high-contrast');
  }, [theme]);

  return (
    <div className={styles.editorHost}>
      {loading && <div className={styles.editorLoading}><BusyIndicator active text="Loading code editor" /></div>}
      <div ref={host} className={styles.editor} data-testid="code-editor" />
    </div>
  );
}
