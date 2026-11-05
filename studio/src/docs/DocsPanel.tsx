import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { IconButton, Input, IconProvider } from '@enterprise-ui/react';
import { search, type SearchEntry } from './search';
import styles from './Docs.module.css';

/** Back/forward history of docs page ids (C7). */
export interface DocsNav { stack: string[]; index: number }
export type DocsNavAction = { type: 'open'; id: string } | { type: 'back' } | { type: 'forward' };
export const EMPTY_NAV: DocsNav = { stack: [], index: -1 };
export function docsNavReducer(s: DocsNav, a: DocsNavAction): DocsNav {
  if (a.type === 'back') return s.index > 0 ? { ...s, index: s.index - 1 } : s;
  if (a.type === 'forward') return s.index < s.stack.length - 1 ? { ...s, index: s.index + 1 } : s;
  if (s.stack[s.index] === a.id) return s;
  const stack = [...s.stack.slice(0, s.index + 1), a.id].slice(-50);
  return { stack, index: stack.length - 1 };
}

export interface DocsPanelProps {
  nav: DocsNav;
  dispatchNav: (a: DocsNavAction) => void;
  index: readonly SearchEntry[];
  pinned: boolean;
  onPin: (pinned: boolean) => void;
  breadcrumb?: string;
  /** The current page (rendered by the caller with DocsPageView). */
  children?: ReactNode;
}

/** C7 mockup 01: the Docs activity / pinned column. Alt+Left/Right navigate only while the panel has focus (decision 5a). */
export function DocsPanel({ nav, dispatchNav, index, pinned, onPin, breadcrumb, children }: DocsPanelProps) {
  const [query, setQuery] = useState('');
  const hits = useMemo(() => search(index, query), [index, query]);
  const onKey = (e: KeyboardEvent) => {
    if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    e.stopPropagation();
    dispatchNav({ type: e.key === 'ArrowLeft' ? 'back' : 'forward' });
  };
  const open = (id: string) => { dispatchNav({ type: 'open', id }); setQuery(''); };
  return (
    <div className={styles.panel} data-testid={pinned ? 'docs-pinned' : 'docs-sidebar'} onKeyDown={onKey}>
      <div className={styles.head}>
        <IconButton size="sm" variant="tertiary" icon={IconProvider.getIcon('arrow-left')} label="Back (Alt+Left)" disabled={nav.index <= 0} onClick={() => dispatchNav({ type: 'back' })} />
        <IconButton size="sm" variant="tertiary" icon={IconProvider.getIcon('arrow-right')} label="Forward (Alt+Right)" disabled={nav.index >= nav.stack.length - 1} onClick={() => dispatchNav({ type: 'forward' })} />
        <h2 className={styles.headTitle}>Docs</h2>
        <IconButton size="sm" variant="tertiary" icon={pinned ? IconProvider.getIcon('pushpin-off') : IconProvider.getIcon('pushpin-on')} label={pinned ? 'Unpin Docs' : 'Pin Docs beside the editor'} aria-pressed={pinned} onMouseDown={(e) => e.preventDefault()} onClick={() => onPin(!pinned)} />
      </div>
      <div className={styles.search} role="search">
        <Input size="sm" label="Search docs" hideLabel placeholder="Search docs" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
      </div>
      {query.trim() ? (
        <div className={styles.results} aria-label="Docs search results" role="region">
          {(['Library', 'Project'] as const).map((g) => hits[g].length > 0 && (
            <div key={g} role="group" aria-label={g}>
              <h3 className={styles.resultGroup}>{g}</h3>
              {hits[g].map((h) => (
                <button key={h.id} type="button" className={styles.result} onClick={() => open(h.target)} data-testid="docs-hit">
                  <span>{h.title}</span><small>{h.snippet}</small>
                </button>
              ))}
            </div>
          ))}
          {!hits.Library.length && !hits.Project.length && <p className={styles.crumb}>No results.</p>}
        </div>
      ) : (
        <>
          {breadcrumb && <nav aria-label="Breadcrumb" className={styles.crumb} data-testid="docs-breadcrumb">{breadcrumb}</nav>}
          <div className={styles.body}>{children ?? <p className={styles.missing}>Select a component in Components, the palette or the inspector, or search the docs.</p>}</div>
        </>
      )}
    </div>
  );
}
