import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { IconProvider } from '../../icons';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { Button } from '../button';
import { Dialog } from '../dialog';
import { Input } from '../input';
import { Spinner } from '../spinner';
import { Tokenizer } from '../token';
import styles from './ValueHelp.module.css';

export interface ValueHelpColumn<T> {
  key: keyof T & string;
  header: string;
  /** Custom cell content. */
  render?: (item: T) => ReactNode;
}

export interface ValueHelpFilter {
  /** Filter key passed to `fetchItems`. */
  key: string;
  label: string;
  /** Choices; without them the filter is a text field. */
  options?: { value: string; label: string }[];
}

export interface ValueHelpQuery {
  /** Free-text search. */
  search: string;
  /** Filter values by key (empty filters are omitted). */
  filters: Record<string, string>;
}

export interface ValueHelpLabels {
  search: string;
  ok: string;
  cancel: string;
  selected: (count: number) => string;
  results: (count: number, total?: number) => string;
  loading: string;
  noResults: string;
  error: string;
  retry: string;
  all: string;
  select: (label: string) => string;
}

export interface ValueHelpDialogProps<T> {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog closes without a choice (Cancel, Escape, close button). */
  onClose: () => void;
  /** Called with the chosen items. Single selection confirms on the first choice. */
  onConfirm: (items: T[]) => void;
  /** Dialog title, e.g. "Select supplier". */
  title: string;
  /** Result table columns. */
  columns: ValueHelpColumn<T>[];
  /** Unique key of an item. */
  getKey: (item: T) => string;
  /** Text of an item in tokens and announcements, e.g. "Northwind (100045)". */
  getLabel: (item: T) => string;
  /** Local items, filtered in the browser (search matches every column). Use `fetchItems` for large data. */
  items?: T[];
  /** Server search; called debounced, and stale requests are aborted. May return a total for "50 of 3,200". */
  fetchItems?: (query: ValueHelpQuery, signal: AbortSignal) => Promise<T[] | { items: T[]; total?: number }>;
  /** Extra filter fields above the results. */
  filters?: ValueHelpFilter[];
  /** One item (confirms immediately) or many (with a selected list and OK). @default 'single' */
  selectionMode?: 'single' | 'multiple';
  /** Initially selected items (multiple mode). */
  defaultSelected?: T[];
  /** Text to start searching with, e.g. what the user typed in the field. */
  initialSearch?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<ValueHelpLabels>;
}

const defaultLabels: ValueHelpLabels = {
  search: 'Search',
  ok: 'OK',
  cancel: 'Cancel',
  selected: (count) => `Selected (${count})`,
  results: (count, total) => (total !== undefined && total > count ? `${count} of ${total.toLocaleString()} results` : `${count} ${count === 1 ? 'result' : 'results'}`),
  loading: 'Searching',
  noResults: 'No matching items. Change the search or filters.',
  error: 'The search failed.',
  retry: 'Retry',
  all: 'All',
  select: (label) => `Select ${label}`,
};

/**
 * Fiori value help ("F4"): search large reference data (customers, materials, cost centers) with
 * filters in a dialog and pick one or many items. Works with local items or a server search.
 */
export function ValueHelpDialog<T>({
  open, onClose, onConfirm, title, columns, getKey, getLabel, items, fetchItems, filters = [], selectionMode = 'single', defaultSelected = [], initialSearch = '', labels: labelOverrides,
}: ValueHelpDialogProps<T>) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const id = useId(undefined, 'value-help');
  const multiple = selectionMode === 'multiple';
  const [search, setSearch] = useState(initialSearch);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<T[]>(defaultSelected);
  const [remote, setRemote] = useState<{ items: T[]; total?: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [attempt, setAttempt] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setSearch(initialSearch);
    setFilterValues({});
    setSelected(defaultSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const query = useMemo<ValueHelpQuery>(
    () => ({ search: search.trim(), filters: Object.fromEntries(Object.entries(filterValues).filter(([, v]) => v !== '')) }),
    [search, filterValues],
  );
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    if (!open || !fetchItems) return;
    const controller = new AbortController();
    setStatus('loading');
    const timer = setTimeout(() => {
      fetchItems(JSON.parse(queryKey), controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          setRemote(Array.isArray(result) ? { items: result } : result);
          setStatus('idle');
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus('error');
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // fetchItems is usually an inline function; the query drives reloading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, queryKey, attempt]);

  const local = useMemo(() => {
    if (!items) return null;
    const text = query.search.toLowerCase();
    return items.filter((item) => {
      const rec = item as Record<string, unknown>;
      if (text && !columns.some((c) => String(rec[c.key] ?? '').toLowerCase().includes(text))) return false;
      return Object.entries(query.filters).every(([k, v]) => String(rec[k] ?? '') === v);
    });
  }, [items, query, columns]);

  const results = local ?? remote?.items ?? [];
  const total = local ? undefined : remote?.total;
  const selectedKeys = new Set(selected.map(getKey));

  const choose = (item: T) => {
    if (!multiple) {
      onConfirm([item]);
      return;
    }
    const key = getKey(item);
    setSelected((prev) => (prev.some((p) => getKey(p) === key) ? prev.filter((p) => getKey(p) !== key) : [...prev, item]));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      initialFocusRef={searchRef}
      footer={
        multiple ? (
          <>
            <Button variant="tertiary" onClick={onClose}>
              {labels.cancel}
            </Button>
            <Button variant="primary" onClick={() => onConfirm(selected)}>
              {labels.ok}
            </Button>
          </>
        ) : (
          <Button variant="tertiary" onClick={onClose}>
            {labels.cancel}
          </Button>
        )
      }
    >
      <div className={styles.body}>
        <div className={styles.filterBar} role="search">
          <Input
            ref={searchRef}
            type="search"
            label={labels.search}
            hideLabel={filters.length === 0}
            placeholder={labels.search}
            startAdornment={IconProvider.getIcon('search', { 'aria-hidden': "true" })}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              // Enter in single mode picks the only result.
              if (e.key === 'Enter' && !multiple && results.length === 1) onConfirm([results[0]]);
            }}
          />
          {filters.map((f) =>
            f.options ? (
              <label key={f.key} className={styles.filter}>
                <span className={styles.filterLabel}>{f.label}</span>
                <select className={styles.select} value={filterValues[f.key] ?? ''} onChange={(e) => setFilterValues((v) => ({ ...v, [f.key]: e.target.value }))}>
                  <option value="">{labels.all}</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <Input key={f.key} label={f.label} value={filterValues[f.key] ?? ''} onChange={(e) => setFilterValues((v) => ({ ...v, [f.key]: e.target.value }))} />
            ),
          )}
        </div>

        <div className={styles.status}>
          <span role="status">
            {status === 'loading' ? labels.loading : status === 'error' ? '' : labels.results(results.length, total)}
          </span>
          {status === 'loading' && <Spinner size="sm" />}
        </div>

        <div className={styles.results} aria-busy={status === 'loading' || undefined}>
          {status === 'error' ? (
            <div className={styles.message}>
              <p>{labels.error}</p>
              <Button size="sm" variant="secondary" onClick={() => setAttempt((a) => a + 1)}>
                {labels.retry}
              </Button>
            </div>
          ) : results.length === 0 && status !== 'loading' ? (
            <p className={styles.message}>{labels.noResults}</p>
          ) : (
            <table className={styles.table} aria-labelledby={`${id}-caption`}>
              <caption id={`${id}-caption`} className="eui-visually-hidden">
                {title}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className={styles.selectCol}>
                    <span className="eui-visually-hidden">{multiple ? labels.selected(selected.length) : labels.select('').trim()}</span>
                  </th>
                  {columns.map((c) => (
                    <th key={c.key} scope="col">
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((item) => {
                  const key = getKey(item);
                  const isSelected = selectedKeys.has(key);
                  return (
                    <tr key={key} className={cx(styles.row, isSelected && styles.selectedRow)} onClick={() => choose(item)}>
                      <td className={styles.selectCol} onClick={(e) => e.stopPropagation()}>
                        <input
                          type={multiple ? 'checkbox' : 'radio'}
                          name={`${id}-choice`}
                          checked={isSelected}
                          aria-label={labels.select(getLabel(item))}
                          onChange={() => choose(item)}
                          onKeyDown={(e) => {
                            if (!multiple && e.key === 'Enter') choose(item);
                          }}
                        />
                      </td>
                      {columns.map((c) => (
                        <td key={c.key}>{c.render ? c.render(item) : String((item as Record<string, unknown>)[c.key] ?? '')}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {multiple && (
          <div className={styles.selected}>
            <span className={styles.selectedLabel} id={`${id}-selected`}>
              {labels.selected(selected.length)}
            </span>
            <Tokenizer
              aria-label={labels.selected(selected.length)}
              tokens={selected.map((s) => ({ id: getKey(s), text: getLabel(s) }))}
              onTokenDelete={(key) => setSelected((prev) => prev.filter((p) => getKey(p) !== key))}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
