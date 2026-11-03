import { forwardRef, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { SearchField } from '../../components/search-field';
import { Skeleton } from '../../components/skeleton';
import styles from './SearchResultsPage.module.css';

export interface SearchResult {
  id: string;
  /** Object type id, matching `types`, e.g. `supplier`. */
  type: string;
  title: string;
  description?: string;
  /** Link to the object. */
  href: string;
  /** Extra facts, e.g. status or owner. */
  meta?: ReactNode;
  icon?: ReactNode;
}

export interface SearchResultsLabels {
  heading: (query: string) => string;
  emptyHeading: string;
  search: string;
  filterBy: string;
  allTypes: string;
  results: (count: number, total?: number) => string;
  noResults: (query: string) => string;
  suggestions: string;
  loading: string;
  error: string;
  retry: string;
  showMore: string;
}

export interface SearchResultsPageProps extends Omit<HTMLAttributes<HTMLElement>, 'onSearch' | 'results'> {
  /** The submitted search text. */
  query: string;
  /** Called with new search text (Enter in the field). */
  onSearch: (query: string) => void;
  /** Results for the query (and selected types). */
  results: SearchResult[];
  /** Object types for the facet list, e.g. suppliers, orders, materials. */
  types: { id: string; label: string }[];
  /** Hit counts per type from the server. Defaults to counting `results`. */
  typeCounts?: Record<string, number>;
  /** Selected type ids; empty means all. Providing it makes the filter controlled. */
  selectedTypes?: string[];
  /** Called with the selected type ids. */
  onSelectedTypesChange?: (types: string[]) => void;
  /** Total hits when results are paged. */
  total?: number;
  /** Shows placeholders while searching. @default false */
  loading?: boolean;
  /** Search failed: `true` for the default message, or your own message. Shows Retry when `onRetry` is set. */
  error?: ReactNode;
  /** Retries the search. */
  onRetry?: () => void;
  /** Loads the next page; shows "Show more" while there are more results. */
  onLoadMore?: () => void;
  /** Tips shown when nothing matches. */
  suggestions?: ReactNode;
  /** Overrides for the built-in strings. */
  labels?: Partial<SearchResultsLabels>;
}

const defaultLabels: SearchResultsLabels = {
  heading: (q) => `Search results for “${q}”`,
  emptyHeading: 'Search',
  search: 'Search',
  filterBy: 'Filter by type',
  allTypes: 'All types',
  results: (count, total) => (total !== undefined && total > count ? `Showing ${count} of ${total.toLocaleString()} results` : `${count} ${count === 1 ? 'result' : 'results'}`),
  noResults: (q) => `No results for “${q}”.`,
  suggestions: 'Check the spelling, use fewer words, or search all types.',
  loading: 'Searching…',
  error: 'Search is not available right now.',
  retry: 'Try again',
  showMore: 'Show more results',
};

/** Marks every occurrence of the query's words in a text. */
function highlight(text: string, query: string): ReactNode {
  const words = query.split(/\s+/).filter((w) => w.length > 1).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return text;
  const parts = text.split(new RegExp(`(${words.join('|')})`, 'gi'));
  return parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p));
}

/** Global search results across business object types, with type facets, highlighting and paging. */
export const SearchResultsPage = forwardRef<HTMLElement, SearchResultsPageProps>(function SearchResultsPage(
  { query, onSearch, results, types, typeCounts, selectedTypes: selectedProp, onSelectedTypesChange, total, loading = false, error, onRetry, onLoadMore, suggestions, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const id = useId(undefined, 'search-results');
  const [ownSelected, setOwnSelected] = useState<string[]>([]);
  const selected = selectedProp ?? ownSelected;
  const setSelected = (next: string[]) => {
    if (selectedProp === undefined) setOwnSelected(next);
    onSelectedTypesChange?.(next);
  };
  const counts = useMemo(() => typeCounts ?? results.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.type]: (acc[r.type] ?? 0) + 1 }), {}), [typeCounts, results]);
  // Without server-side filtering, filter here.
  const shown = selectedProp === undefined && selected.length ? results.filter((r) => selected.includes(r.type)) : results;
  const typeLabel = (t: string) => types.find((x) => x.id === t)?.label ?? t;
  const toggle = (t: string) => setSelected(selected.includes(t) ? selected.filter((s) => s !== t) : [...selected, t]);

  return (
    <section ref={ref} className={cx(styles.page, className)} aria-labelledby={`${id}-heading`} {...rest}>
      <header className={styles.header}>
        <h1 id={`${id}-heading`} className={styles.heading}>
          {query ? labels.heading(query) : labels.emptyHeading}
        </h1>
        <div role="search" className={styles.search}>
          <SearchField key={query} label={labels.search} hideLabel defaultValue={query} onSearch={(q) => onSearch(q.trim())} />
        </div>
      </header>
      <div className={styles.layout}>
        <fieldset className={styles.facets}>
          <legend className={styles.facetTitle}>{labels.filterBy}</legend>
          {types.map((t) => (
            <label key={t.id} className={styles.facet}>
              <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} />
              <span className={styles.facetLabel}>{t.label}</span>
              <span className={styles.count}>{(counts[t.id] ?? 0).toLocaleString()}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <button type="button" className={styles.clear} onClick={() => setSelected([])}>
              {labels.allTypes}
            </button>
          )}
        </fieldset>
        <div className={styles.results} aria-busy={loading || undefined}>
          <p className={styles.status} role="status">
            {loading ? labels.loading : error ? '' : query ? labels.results(shown.length, total) : ''}
          </p>
          {error ? (
            <div className={styles.message}>
              <p>{error === true ? labels.error : error}</p>
              {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                  {labels.retry}
                </Button>
              )}
            </div>
          ) : loading && !shown.length ? (
            <div className={styles.skeletons} aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} lines={2} />
              ))}
            </div>
          ) : query && !shown.length ? (
            <div className={styles.message}>
              <p className={styles.noResults}>{labels.noResults(query)}</p>
              <p>{suggestions ?? labels.suggestions}</p>
            </div>
          ) : (
            <ol className={styles.list}>
              {shown.map((r) => (
                <li key={r.id} className={styles.result}>
                  {r.icon && <span className={styles.icon} aria-hidden="true">{r.icon}</span>}
                  <div className={styles.body}>
                    <a className={styles.title} href={r.href}>
                      {highlight(r.title, query)}
                    </a>
                    <Badge className={styles.type}>{typeLabel(r.type)}</Badge>
                    {r.description && <p className={styles.description}>{highlight(r.description, query)}</p>}
                    {r.meta && <div className={styles.meta}>{r.meta}</div>}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {onLoadMore && !error && shown.length > 0 && (total === undefined || shown.length < total) && (
            <Button variant="secondary" loading={loading} onClick={onLoadMore} className={styles.more}>
              {labels.showMore}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
});
