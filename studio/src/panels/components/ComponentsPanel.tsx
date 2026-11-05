import { useMemo, useState, type KeyboardEvent } from 'react';
import { Badge, Button, IconButton, Input, IconProvider } from '@enterprise-ui/react';
import { cx } from '../../../../src/utilities/cx';
import { signature } from '../../components/catalog/discover';
import { CATEGORY_ORDER, LIBRARY_VERSION } from '../../components/catalog/library';
import type { CatalogItem } from '../../components/catalog/types';
import styles from './ComponentsPanel.module.css';

export interface ComponentsPanelProps {
  project: readonly CatalogItem[];
  library: readonly CatalogItem[];
  onCreate?: () => void;
  onDocs: (item: CatalogItem) => void;
  onSource: (item: CatalogItem) => void;
  onInsert: (item: CatalogItem) => void;
  /** Insert needs an editor on a .tsx/.jsx file. */
  canInsert: boolean;
}

const LIBRARY_OPEN_KEY = 'eui-studio:components-library-open';
const base = (p?: string) => p?.slice(p.lastIndexOf('/') + 1) ?? '';
const optionId = (id: string) => `catalog-opt-${id.replace(/[^\w-]/g, '_')}`;

/** Filter by component name or prop name (case-insensitive). */
export const matches = (item: CatalogItem, q: string) => {
  const s = q.trim().toLowerCase();
  return !s || item.name.toLowerCase().includes(s) || item.props.some((p) => p.name.toLowerCase().includes(s));
};

/** C6 mockup 01: the Components activity. */
export function ComponentsPanel({ project, library, onCreate, onDocs, onSource, onInsert, canInsert }: ComponentsPanelProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [libOpen, setLibOpen] = useState(() => { try { return localStorage.getItem(LIBRARY_OPEN_KEY) === 'open'; } catch { return false; } });
  const shownProject = useMemo(() => project.filter((i) => matches(i, query)), [project, query]);
  const shownLibrary = useMemo(() => library.filter((i) => matches(i, query)), [library, query]);
  const groups = useMemo(() => CATEGORY_ORDER.map((c) => ({ c, items: shownLibrary.filter((i) => i.category === c) })).filter((g) => g.items.length), [shownLibrary]);
  const toggleLib = () => { const next = !libOpen; setLibOpen(next); try { localStorage.setItem(LIBRARY_OPEN_KEY, next ? 'open' : 'closed'); } catch { /* private mode */ } };

  const actions = (item: CatalogItem) => (
    <div role="toolbar" aria-label={`Actions for ${item.name}`} className={styles.actions}>
      <Button size="sm" variant="tertiary" icon={IconProvider.getIcon('course-book')} onClick={() => onDocs(item)}>Docs</Button>
      {item.origin === 'project' && <Button size="sm" variant="tertiary" icon={IconProvider.getIcon('source-code')} onClick={() => onSource(item)}>Source</Button>}
      <Button size="sm" variant="tertiary" icon={IconProvider.getIcon('sys-add')} disabled={!canInsert} title={canInsert ? undefined : 'Open a .tsx or .jsx file in the editor to insert'} onClick={() => onInsert(item)}>Insert</Button>
    </div>
  );

  const list = (label: string, items: readonly CatalogItem[], grouped?: { c: string; items: CatalogItem[] }[]) => {
    const flat = grouped ? grouped.flatMap((g) => g.items) : items;
    const active = flat.find((i) => i.id === selected) ?? null;
    const onKey = (e: KeyboardEvent) => {
      const i = active ? flat.indexOf(active) : -1;
      let next = -1;
      if (e.key === 'ArrowDown') next = Math.min(flat.length - 1, i + 1);
      else if (e.key === 'ArrowUp') next = Math.max(0, i - 1);
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = flat.length - 1;
      else if (e.key === 'Enter' && active) { e.preventDefault(); onDocs(active); return; }
      if (next < 0 || !flat.length) return;
      e.preventDefault();
      setSelected(flat[next].id);
      document.getElementById(optionId(flat[next].id))?.scrollIntoView?.({ block: 'nearest' });
    };
    const row = (item: CatalogItem) => (
      <div key={item.id} id={optionId(item.id)} role="option" aria-selected={item.id === selected} className={cx(styles.option, item.id === selected && styles.selected)}
        onClick={() => setSelected(item.id)} onDoubleClick={() => onDocs(item)} data-testid="catalog-item">
        <span className={styles.line1}>
          {IconProvider.getIcon('product', { 'aria-hidden': "true", className: styles.icon })}<span className={styles.name}>{item.name}</span>
          {item.origin === 'project' && !item.docs && <Badge tone="warning">No docs</Badge>}
          <span className={styles.meta}>{item.origin === 'project' ? base(item.source) : `v${LIBRARY_VERSION}`}</span>
        </span>
        <span className={styles.sig} data-testid="catalog-signature">{signature(item) || 'No props'}</span>
      </div>
    );
    return (
      <>
        <div role="listbox" aria-label={label} tabIndex={flat.length ? 0 : -1} className={styles.listbox} onKeyDown={onKey}
          aria-activedescendant={active ? optionId(active.id) : undefined}
          onFocus={() => { if (!active && flat[0]) setSelected(flat[0].id); }}>
          {grouped
            ? grouped.map((g) => (
              <div key={g.c} role="group" aria-labelledby={`catalog-cat-${g.c.replace(/\W/g, '_')}`}>
                <div role="presentation" id={`catalog-cat-${g.c.replace(/\W/g, '_')}`} className={styles.category}>{g.c}</div>
                {g.items.map(row)}
              </div>
            ))
            : items.map(row)}
        </div>
        {active && actions(active)}
      </>
    );
  };

  return (
    <div className={styles.panel} data-testid="components-panel">
      <div className={styles.head}>
        <h2 className={styles.title}>Components</h2>
        {onCreate && <IconButton size="sm" variant="tertiary" icon={IconProvider.getIcon('add')} label="Create component" onClick={onCreate} />}
      </div>
      <div className={styles.filter}>
        <Input size="sm" label="Filter by name or prop" hideLabel placeholder="Filter by name or prop" startAdornment={IconProvider.getIcon('search', { 'aria-hidden': "true" })} value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
      </div>
      <h3 className={styles.group} id="catalog-project-title">Project <Badge count={project.length} /></h3>
      {project.length === 0
        ? <p className={styles.empty}>No components in this project yet. Use + to create one.</p>
        : shownProject.length ? list('Project components', shownProject) : <p className={styles.empty}>No project components match.</p>}
      <h3 className={styles.group}>
        <button type="button" className={styles.disclosure} aria-expanded={libOpen} aria-controls="catalog-library" onClick={toggleLib}>
          {libOpen ? IconProvider.getIcon('slim-arrow-down', { 'aria-hidden': "true" }) : IconProvider.getIcon('slim-arrow-right', { 'aria-hidden': "true" })}Enterprise UI library
        </button>
        <Badge count={library.length} max={99} />
        <span className={styles.readonly} title={`Read-only · v${LIBRARY_VERSION}`}>{IconProvider.getIcon('locked', { 'aria-hidden': "true" })}<span className={styles.sr}>Read-only, version {LIBRARY_VERSION}</span></span>
      </h3>
      <div id="catalog-library" hidden={!libOpen}>
        {libOpen && (groups.length ? list('Library components', shownLibrary, groups) : <p className={styles.empty}>No library components match.</p>)}
      </div>
    </div>
  );
}
