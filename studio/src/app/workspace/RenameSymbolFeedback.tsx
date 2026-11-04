import { useEffect, useState } from 'react';
import { Button, Link, MessageStrip } from '@enterprise-ui/react';
import styles from './CodeWorkspace.module.css';

/** A rename-symbol result (C3 decisions 6a/7a): previewed (Shift+Enter) or applied. */
export interface SymbolRename {
  id: number;
  mode: 'preview' | 'done';
  oldName: string;
  newName: string;
  edits: { path: string; count: number }[];
  /** A file named after the old symbol, offered as "Also rename the file?". */
  fileToRename: string | null;
}

export interface RenameSymbolFeedbackProps {
  result: SymbolRename | null;
  onApply: () => void;
  onCancel: () => void;
  onUndo: () => void;
  onOpen: (path: string) => void;
  onRenameFile: (path: string) => void;
  onDismiss: () => void;
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;
export const RENAME_SUCCESS_MS = 12000;

/** The strip shown after F2: per-file edits with links, Undo, and "Also rename the file?". */
export function RenameSymbolFeedback({ result, onApply, onCancel, onUndo, onOpen, onRenameFile, onDismiss }: RenameSymbolFeedbackProps) {
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!result || result.mode !== 'done' || hover) return;
    const t = setTimeout(onDismiss, RENAME_SUCCESS_MS);
    return () => clearTimeout(t);
  }, [result, hover, onDismiss]);
  if (!result) return null;
  const total = result.edits.reduce((n, e) => n + e.count, 0);
  const list = (
    <ul className={styles.feedbackList}>
      {result.edits.map((e) => (
        <li key={e.path}><Link href="#" onClick={(ev) => { ev.preventDefault(); onOpen(e.path); }}>{e.path}</Link> · {plural(e.count, 'edit')}</li>
      ))}
    </ul>
  );
  const fileBase = result.fileToRename?.slice(result.fileToRename.lastIndexOf('/') + 1);
  const newBase = fileBase && result.newName + fileBase.slice(fileBase.lastIndexOf('.'));
  return (
    <div className={styles.feedback} role="region" aria-label="Rename symbol" aria-live="polite" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {result.mode === 'preview' ? (
        <MessageStrip tone="information" title={`Rename ${result.oldName} to ${result.newName}?`}
          actions={<><Button size="sm" variant="primary" onClick={onApply}>Apply</Button><Button size="sm" variant="tertiary" onClick={onCancel}>Cancel</Button></>}>
          {plural(total, 'edit')} in {plural(result.edits.length, 'file')}.
          {list}
        </MessageStrip>
      ) : (
        <MessageStrip tone="success" dismissible onDismiss={onDismiss} title={`Renamed ${result.oldName} to ${result.newName}`}
          actions={<Button size="sm" variant="tertiary" onClick={onUndo}>Undo</Button>}>
          {plural(total, 'edit')} in {plural(result.edits.length, 'file')}.
          {list}
          {result.fileToRename && (
            <p className={styles.feedbackExtra}>
              <Link href="#" onClick={(ev) => { ev.preventDefault(); onRenameFile(result.fileToRename!); }}>Also rename the file?</Link> {fileBase} → {newBase}
            </p>
          )}
        </MessageStrip>
      )}
    </div>
  );
}
