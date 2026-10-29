import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Settings2 } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { useAnnouncer } from '../../themes/ThemeProvider';
import { Button } from '../button';
import { DropdownMenu } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import type { MenuEntry } from '../menu';
import { Pagination } from '../pagination';
import { SearchField } from '../search-field';
import { Select } from '../select';
import type { SelectOption } from '../listbox';
import { Table, getColumnText, sortRows, type SortState, type TableColumn, type TableDensity, type TableProps } from '../table';
import styles from './DataGrid.module.css';

export interface DataGridColumn<T> extends TableColumn<T> {
  /** Offer a filter for this column in the toolbar. Values are matched against the accessor. */
  filterOptions?: SelectOption[];
  /** Include this column in the quick search. @default true when it has an accessor */
  searchable?: boolean;
  /** Start hidden (users can show it from View settings). @default false */
  defaultHidden?: boolean;
  /** Prevent hiding this column. @default false */
  alwaysVisible?: boolean;
}

export interface DataGridProps<T> extends Omit<TableProps<T>, 'columns' | 'manualSorting' | 'borderless' | 'caption' | 'density'> {
  columns: DataGridColumn<T>[];
  /** Toolbar title; also the table's accessible name. */
  title: string;
  /** Show the quick search field. @default true */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Controlled search text. */
  search?: string;
  onSearchChange?: (text: string) => void;
  /** Rows per page; `0` disables pagination. @default 10 */
  pageSize?: number;
  /** @default [10, 25, 50] */
  pageSizeOptions?: number[];
  /** Extra toolbar actions (e.g. Create, Export). */
  toolbarActions?: ReactNode;
  /** Actions shown while rows are selected. Receives the selected ids. */
  selectionActions?: (ids: string[]) => ReactNode;
  /** @default 'compact' */
  defaultDensity?: TableDensity;
}

const matches = (value: unknown, text: string) => value != null && String(value).toLocaleLowerCase().includes(text);

/**
 * Feature-complete data table: quick search, column filters, sorting,
 * selection with bulk actions, pagination, column visibility and density.
 * Built from Table, SearchField, Select, Pagination and DropdownMenu.
 */
export function DataGrid<T>({
  columns, data, title, searchable = true, searchPlaceholder = 'Search', search, onSearchChange,
  pageSize: initialPageSize = 10, pageSizeOptions = [10, 25, 50], toolbarActions, selectionActions,
  defaultDensity = 'compact', sort, defaultSort = null, onSortChange, selectedIds, defaultSelectedIds = [], onSelectionChange,
  getRowId, className, emptyState, loading, ...tableProps
}: DataGridProps<T>) {
  const titleId = useId(undefined, 'grid-title');
  const announce = useAnnouncer();
  const [query, setQuery] = useControllableState(search, '', onSearchChange);
  const [filters, setFilters] = useState<Record<string, string | null>>({});
  const [sortState, setSort] = useControllableState<SortState | null>(sort, defaultSort, onSortChange);
  const [selected, setSelected] = useControllableState<string[]>(selectedIds, defaultSelectedIds, onSelectionChange);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [density, setDensity] = useState<TableDensity>(defaultDensity);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)));

  const visibleColumns = columns.filter((c) => !hidden.has(c.id));
  const getValue = (row: T, column: DataGridColumn<T>) =>
    typeof column.accessor === 'function' ? column.accessor(row) : column.accessor ? row[column.accessor] : undefined;

  const filtered = useMemo(() => {
    const text = query.trim().toLocaleLowerCase();
    return data.filter((row) => {
      for (const [columnId, value] of Object.entries(filters)) {
        if (value == null) continue;
        const column = columns.find((c) => c.id === columnId);
        if (column && String(getValue(row, column)) !== value) return false;
      }
      if (!text) return true;
      return columns.some((c) => c.accessor && c.searchable !== false && matches(getValue(row, c), text));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, columns, filters, query]);

  const sorted = useMemo(() => sortRows(filtered, columns, sortState), [filtered, columns, sortState]);
  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount);
  const pageRows = pageSize > 0 ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;

  // Reset to the first page whenever the result set changes shape.
  useEffect(() => setPage(1), [query, filters, pageSize]);
  useEffect(() => {
    if (!loading && (query || Object.values(filters).some((v) => v != null))) announce(`${filtered.length} results`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length]);

  const filterColumns = columns.filter((c) => c.filterOptions);
  const activeFilterCount = Object.values(filters).filter((v) => v != null).length;

  const settingsItems: MenuEntry[] = [
    { type: 'label', label: 'Columns' },
    ...columns.map((c) => ({
      id: `col:${c.id}`,
      label: getColumnText(c),
      checked: !hidden.has(c.id),
      disabled: c.alwaysVisible || (!hidden.has(c.id) && visibleColumns.length === 1),
    })),
    { type: 'separator' },
    { type: 'label', label: 'Row density' },
    { id: 'density:cozy', label: 'Cozy', checked: density === 'cozy' },
    { id: 'density:compact', label: 'Compact', checked: density === 'compact' },
    { id: 'density:condensed', label: 'Condensed', checked: density === 'condensed' },
  ];

  return (
    <section className={cx(styles.grid, className)} aria-labelledby={titleId}>
      <div className={styles.toolbar}>
        <h2 id={titleId} className={styles.title}>
          {title} <span className={styles.count}>({filtered.length})</span>
        </h2>
        {searchable && (
          <div className={styles.search}>
            <SearchField size="sm" value={query} onChange={setQuery} placeholder={searchPlaceholder} aria-label={`Search ${title}`} />
          </div>
        )}
        {filterColumns.length > 0 && (
          <div className={styles.filters}>
            {filterColumns.map((column) => (
              <div key={column.id} className={styles.filter}>
                <Select
                  size="sm"
                  aria-label={`Filter by ${getColumnText(column)}`}
                  placeholder={`${getColumnText(column)}: All`}
                  value={filters[column.id] ?? null}
                  options={[{ value: '__all__', label: 'All' }, ...(column.filterOptions ?? [])]}
                  renderValue={(o) => `${getColumnText(column)}: ${o.label}`}
                  onChange={(v) => setFilters((f) => ({ ...f, [column.id]: v === '__all__' ? null : v }))}
                />
              </div>
            ))}
            {activeFilterCount > 0 && (
              <Button size="sm" variant="tertiary" onClick={() => setFilters({})}>
                Clear filters
              </Button>
            )}
          </div>
        )}
        <div className={styles.actions}>
          {toolbarActions}
          <DropdownMenu
            placement="bottom-end"
            aria-label="View settings"
            items={settingsItems}
            onAction={(id) => {
              const [kind, value] = id.split(':');
              if (kind === 'density') setDensity(value as TableDensity);
              else
                setHidden((h) => {
                  const next = new Set(h);
                  if (next.has(value)) next.delete(value);
                  else next.add(value);
                  return next;
                });
            }}
            trigger={<IconButton icon={<Settings2 />} label="View settings" size="sm" />}
          />
        </div>
      </div>
      {selected.length > 0 && tableProps.selectionMode && tableProps.selectionMode !== 'none' && (
        <div className={styles.selectionBar} role="status">
          <strong>{selected.length} selected</strong>
          {selectionActions?.(selected)}
          <Button size="sm" variant="tertiary" onClick={() => setSelected([])}>
            Clear selection
          </Button>
        </div>
      )}
      <Table<T>
        {...tableProps}
        borderless
        aria-label={title}
        columns={visibleColumns}
        data={pageRows}
        getRowId={getRowId}
        loading={loading}
        manualSorting
        sort={sortState}
        onSortChange={setSort}
        selectedIds={selected}
        onSelectionChange={setSelected}
        density={density}
        emptyState={emptyState ?? (query || activeFilterCount ? 'No results match your search or filters.' : 'No data')}
      />
      {pageSize > 0 && sorted.length > 0 && (
        <div className={styles.footer}>
          <Pagination
            page={currentPage}
            onPageChange={setPage}
            totalItems={sorted.length}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={setPageSize}
            aria-label={`${title} pagination`}
          />
        </div>
      )}
    </section>
  );
}
