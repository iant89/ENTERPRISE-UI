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
import { Pagination, type PaginationMessages } from '../pagination';
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

/** Server mode displays data exactly as supplied. All query changes are owned by the application. */
export interface DataGridServerState {
  /** One-based page, unlike DataRequest.pagination.page which is zero-based. */
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  filters: Record<string, string | null>;
  onFiltersChange: (filters: Record<string, string | null>) => void;
  /** Announce that displayed rows belong to an earlier request. */
  stale?: boolean;
  /** Indicates filters outside the grid are applied, for the no-results message. */
  hasActiveFilters?: boolean;
  /** Render a recoverable error and retry action supplied by the application. */
  error?: ReactNode;
}

/** Localizable grid text; callbacks let hosts apply locale-specific plural and number formatting. */
export interface DataGridMessages {
  searchPlaceholder: string;
  searchLabel: (title: string) => string;
  clearSearch: string;
  filterLabel: (column: string) => string;
  filterValue: (column: string, value: string) => string;
  all: string;
  clearFilters: string;
  columns: string;
  rowDensity: string;
  cozy: string;
  compact: string;
  condensed: string;
  viewSettings: string;
  columnWidths: string;
  columnWidth: (column: string, pixels: number) => string;
  selected: (count: number) => string;
  clearSelection: string;
  stale: string;
  selectAllPage: string;
  selectAll: string;
  selectionHeader: string;
  selectRow: (label: string) => string;
  unavailable: string;
  noResults: string;
  noData: string;
  results: (count: number) => string;
}
const defaultMessages: DataGridMessages = {
  searchPlaceholder: 'Search', searchLabel: (title) => `Search ${title}`, clearSearch: 'Clear search',
  filterLabel: (column) => `Filter by ${column}`, filterValue: (column, value) => `${column}: ${value}`,
  all: 'All', clearFilters: 'Clear filters', columns: 'Columns', rowDensity: 'Row density',
  cozy: 'Cozy', compact: 'Compact', condensed: 'Condensed', viewSettings: 'View settings', columnWidths: 'Column widths',
  columnWidth: (column, pixels) => `${column} width: ${pixels}px`, selected: (count) => `${count} selected`,
  clearSelection: 'Clear selection', stale: 'Showing previous results; they may be out of date.',
  selectAllPage: 'Select all rows on this page', selectAll: 'Select all rows', selectionHeader: 'Selection',
  selectRow: (label) => `Select ${label}`, unavailable: 'Data is unavailable.', noResults: 'No results match your search or filters.',
  noData: 'No data', results: (count) => `${count} results`,
};

export interface DataGridProps<T> extends Omit<TableProps<T>, 'columns' | 'manualSorting' | 'borderless' | 'caption' | 'density'> {
  /** Column definitions. */
  columns: DataGridColumn<T>[];
  /** Opt into externally managed pagination and filtering. Supply controlled search and sort callbacks as well.
   * Provide a stable getRowId whenever rows can change or selection spans pages. */
  server?: DataGridServerState;
  /** Localized grid messages. Host-supplied columns and errors must also be translated. */
  messages?: Partial<DataGridMessages>;
  /** Valid BCP 47 locale for local search case conversion. */
  locale?: string;
  /** Direction and language, including floating menus and listboxes. */
  dir?: 'ltr' | 'rtl' | 'auto';
  /** BCP 47 language tag for the text, so screen readers pronounce it correctly. */
  lang?: string;
  /** Toolbar title; also the table's accessible name. */
  title: string;
  /** Show the quick search field. @default true */
  searchable?: boolean;
  /** Placeholder text of the search field. */
  searchPlaceholder?: string;
  /** Controlled search text. */
  search?: string;
  /** Called with the search text as the user types. */
  onSearchChange?: (text: string) => void;
  /** Rows per page; `0` disables pagination. @default 10 */
  pageSize?: number;
  /** @default [10, 25, 50] */
  /** Page sizes the user can choose from. */
  pageSizeOptions?: number[];
  /** Translates pagination labels and formats page numbers. */
  paginationMessages?: Partial<PaginationMessages>;
  /** Accessible name for pagination. Defaults to the grid title followed by “pagination”. */
  paginationLabel?: string;
  /** Extra toolbar actions (e.g. Create, Export). */
  toolbarActions?: ReactNode;
  /** Actions shown while rows are selected. Receives the selected ids. */
  selectionActions?: (ids: string[]) => ReactNode;
  /** @default 'compact' */
  /** Row density applied initially. The user can change it from the toolbar. */
  defaultDensity?: TableDensity;
  /** Controlled visible column IDs, useful when applying a saved view. Always-visible columns remain visible. */
  visibleColumnIds?: string[];
  /** Called with the IDs of the visible columns when the user shows or hides columns. */
  onVisibleColumnIdsChange?: (ids: string[]) => void;
  /** Offer keyboard-operable column width controls in the toolbar. @default false */
  resizableColumns?: boolean;
}

const matches = (value: unknown, text: string, locale?: string) => value != null && String(value).toLocaleLowerCase(locale).includes(text);

/**
 * Feature-complete data table: quick search, column filters, sorting,
 * selection with bulk actions, pagination, column visibility and density.
 * Built from Table, SearchField, Select, Pagination and DropdownMenu.
 */
export function DataGrid<T>({
  columns, data, title, searchable = true, searchPlaceholder, search, onSearchChange, messages, locale, dir, lang,
  pageSize: initialPageSize = 10, pageSizeOptions = [10, 25, 50], paginationMessages, paginationLabel, toolbarActions, selectionActions,
  defaultDensity = 'compact', visibleColumnIds, onVisibleColumnIdsChange, resizableColumns = false, sort, defaultSort = null, onSortChange, selectedIds, defaultSelectedIds = [], onSelectionChange,
  getRowId, className, emptyState, loading, server, ...tableProps
}: DataGridProps<T>) {
  const text = { ...defaultMessages, ...messages };
  const titleId = useId(undefined, 'grid-title');
  const announce = useAnnouncer();
  const [query, setQuery] = useControllableState(search, '', onSearchChange);
  const [localFilters, setLocalFilters] = useState<Record<string, string | null>>({});
  const filters = server ? server.filters : localFilters;
  const setFilters = (next: Record<string, string | null>) => {
    if (server) server.onFiltersChange(next);
    else setLocalFilters(next);
  };
  const [sortState, setSort] = useControllableState<SortState | null>(sort, defaultSort, onSortChange);
  const [selected, setSelected] = useControllableState<string[]>(selectedIds, defaultSelectedIds, onSelectionChange);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [density, setDensity] = useState<TableDensity>(defaultDensity);
  const [localHidden, setLocalHidden] = useState<string[]>(() => columns.filter((c) => c.defaultHidden && !c.alwaysVisible).map((c) => c.id));
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [showWidths, setShowWidths] = useState(false);
  const requestedVisible = columns.filter((c) => c.alwaysVisible || (visibleColumnIds ? visibleColumnIds.includes(c.id) : !localHidden.includes(c.id)));
  const visibleColumns = (requestedVisible.length || !columns.length ? requestedVisible : [columns[0]]).map((c) => widths[c.id] == null ? c : { ...c, width: widths[c.id], minWidth: widths[c.id] });
  const hidden = new Set(columns.filter((c) => !visibleColumns.some((v) => v.id === c.id)).map((c) => c.id));
  const getValue = (row: T, column: DataGridColumn<T>) =>
    typeof column.accessor === 'function' ? column.accessor(row) : column.accessor ? row[column.accessor] : undefined;

  const filtered = useMemo(() => {
    if (server) return data;
    const text = query.trim().toLocaleLowerCase(locale);
    return data.filter((row) => {
      for (const [columnId, value] of Object.entries(filters)) {
        if (value == null) continue;
        const column = columns.find((c) => c.id === columnId);
        if (column && String(getValue(row, column)) !== value) return false;
      }
      if (!text) return true;
      return columns.some((c) => c.accessor && c.searchable !== false && matches(getValue(row, c), text, locale));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, columns, filters, query, locale, !!server]);

  const sorted = useMemo(() => server ? filtered : sortRows(filtered, columns, sortState), [filtered, columns, sortState, server]);
  const totalItems = server ? server.totalItems : sorted.length;
  const effectivePageSize = server ? server.pageSize : pageSize;
  const pageCount = effectivePageSize > 0 ? Math.max(1, Math.ceil(totalItems / effectivePageSize)) : 1;
  const currentPage = Math.min(server ? server.page : page, pageCount);
  const pageRows = server ? data : pageSize > 0 ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;

  // Reset to the first page whenever the result set changes shape.
  useEffect(() => setPage(1), [query, filters, pageSize]);
  useEffect(() => {
    if (!loading && (query || Object.values(filters).some((v) => v != null))) announce(text.results(totalItems));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems]);

  const filterColumns = columns.filter((c) => c.filterOptions);
  const activeFilterCount = Object.values(filters).filter((v) => v != null).length;

  const settingsItems: MenuEntry[] = [
    { type: 'label', label: text.columns },
    ...columns.map((c) => ({
      id: `col:${c.id}`,
      label: getColumnText(c),
      checked: !hidden.has(c.id),
      disabled: c.alwaysVisible || (!hidden.has(c.id) && visibleColumns.length === 1),
    })),
    { type: 'separator' },
    { type: 'label', label: text.rowDensity },
    { id: 'density:cozy', label: text.cozy, checked: density === 'cozy' },
    { id: 'density:compact', label: text.compact, checked: density === 'compact' },
    { id: 'density:condensed', label: text.condensed, checked: density === 'condensed' },
  ];

  return (
    <section className={cx(styles.grid, className)} aria-labelledby={titleId} dir={dir} lang={lang}>
      <div className={styles.toolbar}>
        <h2 id={titleId} className={styles.title}>
          {title} <span className={styles.count}>({totalItems})</span>
        </h2>
        {searchable && (
          <div className={styles.search}>
            <SearchField size="sm" value={query} onChange={setQuery} placeholder={searchPlaceholder ?? text.searchPlaceholder} aria-label={text.searchLabel(title)} clearLabel={text.clearSearch} />
          </div>
        )}
        {filterColumns.length > 0 && (
          <div className={styles.filters}>
            {filterColumns.map((column) => (
              <div key={column.id} className={styles.filter}>
                <Select
                  size="sm"
                  aria-label={text.filterLabel(getColumnText(column))}
                  dir={dir}
                  lang={lang}
                  placeholder={text.filterValue(getColumnText(column), text.all)}
                  value={filters[column.id] ?? null}
                  options={[{ value: '__all__', label: text.all }, ...(column.filterOptions ?? [])]}
                  renderValue={(o) => text.filterValue(getColumnText(column), o.label)}
                  onChange={(v) => setFilters({ ...filters, [column.id]: v === '__all__' ? null : v })}
                />
              </div>
            ))}
            {activeFilterCount > 0 && (
              <Button size="sm" variant="tertiary" onClick={() => setFilters({})}>
                {text.clearFilters}
              </Button>
            )}
          </div>
        )}
        <div className={styles.actions}>
          {toolbarActions}
          {resizableColumns && <Button size="sm" aria-expanded={showWidths} onClick={() => setShowWidths((open) => !open)}>{text.columnWidths}</Button>}
          <DropdownMenu
            placement="bottom-end"
            aria-label={text.viewSettings}
            dir={dir}
            lang={lang}
            items={settingsItems}
            onAction={(id) => {
              const [kind, value] = id.split(':');
              if (kind === 'density') setDensity(value as TableDensity);
              else
                {
                  const next = columns.filter((column) => column.alwaysVisible || (column.id === value ? hidden.has(value) : !hidden.has(column.id))).map((column) => column.id);
                  if (visibleColumnIds === undefined) setLocalHidden(columns.filter((column) => !next.includes(column.id)).map((column) => column.id));
                  onVisibleColumnIdsChange?.(next);
                }
            }}
            trigger={<IconButton icon={<Settings2 />} label={text.viewSettings} size="sm" />}
          />
        </div>
      </div>
      {resizableColumns && showWidths && <div className={styles.widthControls} aria-label={text.columnWidths}>
        {visibleColumns.map((column) => <label key={column.id}>
          {text.columnWidth(getColumnText(column), widths[column.id] ?? (typeof column.width === 'number' ? column.width : 160))}
          <input type="range" min="80" max="600" step="10" value={widths[column.id] ?? (typeof column.width === 'number' ? column.width : 160)} onChange={(event) => setWidths((current) => ({ ...current, [column.id]: Number(event.target.value) }))} />
        </label>)}
      </div>}
      {selected.length > 0 && tableProps.selectionMode && tableProps.selectionMode !== 'none' && (
        <div className={styles.selectionBar} role="status">
          <strong>{text.selected(selected.length)}</strong>
          {selectionActions?.(selected)}
          <Button size="sm" variant="tertiary" neutral onClick={() => setSelected([])}>
            {text.clearSelection}
          </Button>
        </div>
      )}
      {server?.stale && <div role="status">{text.stale}</div>}
      {server?.error && <div role="alert">{server.error}</div>}
      <Table<T>
        {...tableProps}
        borderless
        aria-label={title}
        columns={visibleColumns}
        data={pageRows}
        getRowId={getRowId}
        loading={loading}
        manualSorting
        selectAllLabel={tableProps.selectAllLabel ?? (effectivePageSize > 0 ? text.selectAllPage : text.selectAll)}
        selectionHeaderLabel={tableProps.selectionHeaderLabel ?? text.selectionHeader}
        selectRowLabel={tableProps.selectRowLabel ?? text.selectRow}
        sort={sortState}
        onSortChange={setSort}
        selectedIds={selected}
        onSelectionChange={setSelected}
        density={density}
        emptyState={emptyState ?? (server?.error ? text.unavailable : query || activeFilterCount || server?.hasActiveFilters ? text.noResults : text.noData)}
      />
      {effectivePageSize > 0 && totalItems > 0 && (
        <div className={styles.footer}>
          <Pagination
            page={currentPage}
            messages={paginationMessages}
            dir={dir}
            lang={lang}
            onPageChange={server ? server.onPageChange : setPage}
            totalItems={totalItems}
            pageSize={effectivePageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={server ? server.onPageSizeChange : setPageSize}
            aria-label={paginationLabel ?? `${title} pagination`}
          />
        </div>
      )}
    </section>
  );
}
