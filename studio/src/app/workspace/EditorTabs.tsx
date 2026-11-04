import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { cx } from '../../../../src/utilities/cx';
import styles from './CodeWorkspace.module.css';

export interface EditorTabsProps {
  tabs: readonly string[];
  active: string;
  dirty: ReadonlySet<string>;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  /** Visible tabs before the rest collapse into a "+N" menu (tablet). Unlimited when omitted. */
  maxVisible?: number;
}

const base = (p: string) => p.slice(p.lastIndexOf('/') + 1);

/**
 * Decision 5: an unsaved tab shows a dot in place of its close button; hover or focus shows the
 * close button. Clean tabs show close on hover/focus and always on the active tab (VS Code).
 */
export function EditorTabs({ tabs, active, dirty, onSelect, onClose, maxVisible }: EditorTabsProps) {
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);
  let visible = [...tabs];
  let hidden: string[] = [];
  if (maxVisible !== undefined && tabs.length > maxVisible) {
    visible = tabs.slice(0, maxVisible);
    hidden = tabs.slice(maxVisible);
    // Keep the active tab visible.
    if (hidden.includes(active)) { hidden = [...hidden.filter((t) => t !== active), visible.at(-1)!]; visible = [...visible.slice(0, -1), active]; }
  }
  useEffect(() => {
    if (!overflowOpen) return;
    const down = (e: MouseEvent) => { if (!overflowRef.current?.contains(e.target as Node)) setOverflowOpen(false); };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [overflowOpen]);

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const i = visible.indexOf(active);
    const next = visible[(i + (event.key === 'ArrowRight' ? 1 : -1) + visible.length) % visible.length];
    if (!next) return;
    event.preventDefault();
    onSelect(next);
    requestAnimationFrame(() => event.currentTarget?.querySelector<HTMLElement>(`[data-path="${CSS.escape(next)}"] button`)?.focus());
  };

  return (
    <div className={styles.editorTabs}>
      <div role="list" aria-label="Open files" className={styles.editorTabList} onKeyDown={onKey}>
        {visible.map((path) => {
          const isDirty = dirty.has(path);
          const isActive = path === active;
          const name = base(path);
          return (
            <div key={path} role="listitem" data-path={path} className={cx(styles.editorTab, isActive && styles.activeTab, isDirty && styles.dirtyTab)}>
              <button
                type="button"
                aria-current={isActive ? 'true' : undefined}
                tabIndex={isActive ? 0 : -1}
                title={path}
                aria-label={isDirty ? `${name}, unsaved` : name}
                className={styles.editorTabLabel}
                onClick={() => onSelect(path)}
                onKeyDown={(e) => { if ((e.key === 'Delete') || (e.key.toLowerCase() === 'w' && (e.ctrlKey || e.metaKey) && e.altKey)) { e.preventDefault(); onClose(path); } }}
              >
                {name}
              </button>
              {isDirty && <span className={styles.tabDot} data-testid="dirty-dot" aria-hidden="true" />}
              <button type="button" className={styles.tabClose} aria-label={`Close ${name}`} title={`Close ${name}`} onClick={() => onClose(path)}>
                <X aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      {hidden.length > 0 && (
        <div className={styles.overflow} ref={overflowRef}>
          <button
            type="button"
            className={styles.overflowButton}
            aria-haspopup="menu"
            aria-expanded={overflowOpen}
            aria-label={`${hidden.length} more open ${hidden.length === 1 ? 'file' : 'files'}`}
            onClick={() => setOverflowOpen((o) => !o)}
          >
            <MoreHorizontal aria-hidden="true" />+{hidden.length}
          </button>
          {overflowOpen && (
            <div role="menu" aria-label="More open files" className={styles.overflowMenu}
              onKeyDown={(e) => { if (e.key === 'Escape') setOverflowOpen(false); }}>
              {hidden.map((path) => (
                <button key={path} type="button" role="menuitem" className={styles.overflowItem}
                  ref={(el) => { if (el && path === hidden[0]) el.focus(); }}
                  onClick={() => { setOverflowOpen(false); onSelect(path); }}>
                  {base(path)}{dirty.has(path) && <span className={styles.tabDot} aria-label="unsaved" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
