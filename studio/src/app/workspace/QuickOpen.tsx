import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { IconProvider } from '@enterprise-ui/react';
import { cx } from '../../../../src/utilities/cx';
import { rankPaths, type FuzzyMatch } from '../../core/vfs/fuzzy';
import styles from './CodeWorkspace.module.css';

export interface QuickOpenProps {
  paths: readonly string[];
  recent: readonly string[];
  current: string;
  /** `toSide`: Ctrl/Cmd+Enter opens the file in the other editor group (C3 decision 2a). */
  onOpen: (path: string, line?: number, toSide?: boolean) => void;
  onRemoveRecent: (path: string) => void;
  onClose: () => void;
}

export const RECENT_SHOWN = 10;

function label(m: FuzzyMatch): ReactNode {
  const slash = m.path.lastIndexOf('/');
  const hit = new Set(m.indices);
  const part = (from: number, to: number) => [...m.path.slice(from, to)].map((c, i) => (hit.has(from + i) ? <mark key={i} className={styles.hit}>{c}</mark> : c));
  return <><strong>{part(slash + 1, m.path.length)}</strong><span className={styles.dim}>{slash > 0 ? part(0, slash) : 'project root'}</span></>;
}

/** Quick Open (C2 mockups 03–04): Ctrl/Cmd+P, top-anchored combobox + listbox, recent files when empty, `:line` suffix. */
export function QuickOpen({ paths, recent, current, onOpen, onRemoveRecent, onClose }: QuickOpenProps) {
  const [value, setValue] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<Element | null>(null);
  useEffect(() => {
    returnFocus.current = document.activeElement;
    input.current?.focus();
    return () => { (returnFocus.current as HTMLElement | null)?.focus?.(); };
  }, []);
  const [, query, lineText] = /^(.*?)(?::(\d*))?$/.exec(value) ?? [value, value, undefined];
  const line = lineText ? Number(lineText) : undefined;
  const empty = !query.trim();
  const items = useMemo(() => (empty ? recent.filter((p) => paths.includes(p)).slice(0, RECENT_SHOWN).map((path) => ({ path, score: 0, indices: [] })) : rankPaths(query, paths, { limit: 50 })), [empty, query, recent, paths]);
  useEffect(() => setActive(0), [query]);
  const choose = (i: number, toSide = false) => { const m = items[i]; if (m) { onOpen(m.path, line, toSide); onClose(); } else if (empty && line) { onOpen(current, line, toSide); onClose(); } };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active, e.ctrlKey || e.metaKey); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };
  const optionId = (i: number) => `quick-open-option-${i}`;
  return (
    <div className={styles.quickBackdrop} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.quickOpen} role="dialog" aria-label="Quick Open" aria-modal="true">
        <input
          ref={input}
          className={styles.quickInput}
          role="combobox"
          aria-expanded="true"
          aria-controls="quick-open-list"
          aria-activedescendant={items.length ? optionId(active) : undefined}
          aria-autocomplete="list"
          aria-label="Search files by name"
          placeholder="Search files by name (append :line to go to a line)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
        />
        {empty && <div className={styles.quickSection}>{IconProvider.getIcon('history', { 'aria-hidden': "true" })} Recently opened</div>}
        <ul id="quick-open-list" role="listbox" aria-label={empty ? 'Recently opened' : 'Matching files'} className={styles.quickList}>
          {items.map((m, i) => (
            <li key={m.path} id={optionId(i)} role="option" aria-selected={i === active} className={cx(styles.quickItem, i === active && styles.quickActive)}
              onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)} onMouseMove={() => setActive(i)}>
              {label(m)}
              {empty && m.path === current && <span className={styles.quickTag}>current</span>}
              {empty && m.path !== current && (
                <button type="button" className={styles.quickRemove} aria-label={`Remove ${m.path} from recently opened`} tabIndex={-1}
                  onClick={(e) => { e.stopPropagation(); onRemoveRecent(m.path); }}>{IconProvider.getIcon('decline', { 'aria-hidden': "true" })}</button>
              )}
            </li>
          ))}
          {!items.length && <li className={styles.empty} role="presentation">{empty ? 'No recently opened files.' : `No files match “${query}”.`}</li>}
        </ul>
        <div className={styles.quickFooter} aria-hidden="true"><span>↑↓ navigate</span><span>↵ open</span><span>Ctrl+↵ open to the side</span><span>:line go to line</span><span>Esc close</span></div>
      </div>
    </div>
  );
}
