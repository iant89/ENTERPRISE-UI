import { useRef, type KeyboardEvent } from 'react';
import { Badge, IconButton, IconProvider } from '@enterprise-ui/react';
import styles from '../../app/workspace/CodeWorkspace.module.css';

/** One reference: 1-based line and columns, with the line's text for the preview. */
export interface ReferenceItem { line: number; column: number; endColumn: number; preview: string }
/** References for one symbol, grouped by file (C3 decision 5a: pinned from the peek). */
export interface ReferenceSet { symbol: string; groups: { path: string; items: ReferenceItem[] }[] }

export interface ReferencesPanelProps {
  references: ReferenceSet | null;
  onOpen: (path: string, line: number, column: number) => void;
  onClear: () => void;
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/**
 * The bottom-panel References tab. Arrow keys move between references, Home/End jump to the
 * first/last, Enter (or click) opens the location.
 */
export function ReferencesPanel({ references, onOpen, onClear }: ReferencesPanelProps) {
  const listRef = useRef<HTMLUListElement>(null);
  if (!references) return <p className={styles.empty}>No pinned references. Press Shift+F12 on a symbol, then pin the list from the peek.</p>;
  const total = references.groups.reduce((n, g) => n + g.items.length, 0);
  const onKey = (event: KeyboardEvent) => {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('button[data-ref]') ?? [])];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'ArrowDown' ? i + 1 : event.key === 'ArrowUp' ? i - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    buttons[Math.max(0, Math.min(buttons.length - 1, next))]?.focus();
  };
  return (
    <div className={styles.references}>
      <div className={styles.referencesHead}>
        <span role="status">{plural(total, 'reference')} to <code>{references.symbol}</code> in {plural(references.groups.length, 'file')}</span>
        <IconButton size="sm" variant="tertiary" icon={IconProvider.getIcon('decline')} label="Clear references" onClick={onClear} />
      </div>
      <ul ref={listRef} className={styles.referenceList} aria-label={`References to ${references.symbol}`} onKeyDown={onKey}>
        {references.groups.map((g, gi) => (
          <li key={g.path}>
            <div className={styles.referenceFile}><strong>{g.path.slice(g.path.lastIndexOf('/') + 1)}</strong> <span className={styles.dim}>{g.path}</span> <Badge tone="neutral">{g.items.length}</Badge></div>
            <ul className={styles.resultList}>
              {g.items.map((r, i) => {
                const text = r.preview;
                const lead = text.length - text.trimStart().length;
                const a = Math.max(0, r.column - 1 - lead);
                const body = text.trim();
                const b = Math.min(body.length, a + (r.endColumn - r.column));
                return (
                  <li key={`${r.line}:${r.column}`}>
                    <button type="button" data-ref className={styles.resultLine} tabIndex={gi === 0 && i === 0 ? 0 : -1}
                      title={`${g.path}:${r.line}:${r.column}`} onClick={() => onOpen(g.path, r.line, r.column)}>
                      <span className={styles.lineNo}>{r.line}</span>
                      <span className={styles.matchPreview}>{body.slice(0, a)}<mark className={styles.hit}>{body.slice(a, b)}</mark>{body.slice(b)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
