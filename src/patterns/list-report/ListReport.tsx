import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useDataAdapter, type DataAdapter, type DataFilter, type DataRequest } from '../../data';
import { Button } from '../../components/button';
import { DataGrid, type DataGridColumn } from '../../components/data-grid';
import { FilterTokenGroup } from '../../components/filter-token';
import type { SelectionMode, SortState } from '../../components/table';
import { FilterBar } from '../filter-bar';
import { Page } from '../../layouts/page';
import { CommandToolbar, type CommandAction } from '../command-toolbar';
import { useControllableState } from '../../hooks/useControllableState';

/** View settings supported by the report. Filters are controlled separately. */
export interface ListReportView {
  search: string;
  sort: SortState | null;
  visibleColumns: string[];
  pageSize: number;
}

export interface ListReportProps<T> {
  /** Title of the page. */
  title: string;
  /** Data source that loads pages of rows for the current sort, filters and search. */
  adapter: DataAdapter<T>;
  /** Change this value to refresh after an external mutation. */
  refreshKey?: unknown;
  /** Column definitions. */
  columns: DataGridColumn<T>[];
  /** Returns a stable, unique ID for a row. */
  getRowId: (row: T, index: number) => string;
  /** Applied filters. The application owns the filter controls and their values. */
  filters: DataFilter[];
  /** Called with the new filters when the user applies or clears filters. */
  onFiltersChange: (filters: DataFilter[]) => void;
  /** Filter controls that update filters via the host. Filters apply immediately. */
  filterControls?: ReactNode;
  /** Optional saved-view selector or other page-level content. */
  header?: ReactNode;
  /** Actions shown in the table toolbar. */
  toolbarActions?: ReactNode;
  /** Wrap the report in a Page with a page heading. @default false */
  pageLayout?: boolean;
  /** Optional responsive page-level command toolbar. */
  pageActions?: CommandAction[];
  /** Renders actions for the selected row IDs. They are shown in the bulk action bar. */
  selectionActions?: (ids: string[]) => ReactNode;
  /** Initial page size in uncontrolled mode. @default 10 */
  pageSize?: number;
  /** Controlled view settings, suitable for restoring a saved view. */
  view?: ListReportView;
  /** Called with the view settings when the user changes sorting, columns or density. */
  onViewChange?: (view: ListReportView) => void;
  /** Selection may be controlled independently from the view. */
  /** Defaults to multiple when selection callbacks or actions are supplied. */
  selectionMode?: SelectionMode;
  /** IDs of the selected items. Providing it makes the selection controlled. */
  selectedIds?: string[];
  /** Called with the new selection when the user changes it. */
  onSelectionChange?: (ids: string[]) => void;
  /** Returns the display name of a filter field. */
  getFilterName?: (field: string) => string;
}

/**
 * Adapter-backed listing with applied filter tokens, search, sort and paging.
 * Column IDs and filter field names must match fields accepted by the adapter.
 * Pass a stable adapter and stable applied filter array to avoid unnecessary loads.
 */
export function ListReport<T>({ title, adapter, refreshKey, columns, getRowId, filters, onFiltersChange, filterControls, header, toolbarActions, pageLayout = false, pageActions, selectionActions, pageSize: initialPageSize = 10, view, onViewChange, selectionMode, selectedIds, onSelectionChange, getFilterName = (field) => field }: ListReportProps<T>) {
  const [currentView, setView] = useControllableState<ListReportView>(view, {
    search: '', sort: null, pageSize: initialPageSize,
    visibleColumns: columns.filter((column) => !column.defaultHidden || column.alwaysVisible).map((column) => column.id),
  }, onViewChange);
  const { search, sort, pageSize, visibleColumns } = currentView;
  // Derive the first page immediately for a changed query, before its request
  // can start. This avoids fetching an obsolete page while an effect resets it.
  const queryKey = JSON.stringify([filters, search, sort?.columnId, sort?.direction, pageSize]);
  const [pageState, setPageState] = useState({ key: queryKey, page: 1 });
  const page = pageState.key === queryKey ? pageState.page : 1;
  useEffect(() => {
    setPageState((previous) => previous.key === queryKey ? previous : { key: queryKey, page: 1 });
  }, [queryKey]);
  const setPage = (next: number) => setPageState({ key: queryKey, page: next });
  const updateView = (changes: Partial<ListReportView>) => setView((previous) => ({ ...previous, ...changes }));
  const request = useMemo<DataRequest>(() => ({
    pagination: { page: page - 1, pageSize }, search, filters,
    sort: sort ? [{ field: sort.columnId, direction: sort.direction === 'ascending' ? 'asc' : 'desc' }] : [],
  }), [page, pageSize, search, filters, sort]);
  const result = useDataAdapter(adapter, request, refreshKey);
  const columnIds = new Set(columns.filter((column) => column.filterOptions).map((column) => column.id));
  const columnFilters = Object.fromEntries(filters.filter((filter) => columnIds.has(filter.field) && filter.operator === 'equals' && typeof filter.value === 'string').map((filter) => [filter.field, String(filter.value)]));
  const tokens = filters.map((filter, index) => ({ id: String(index), name: getFilterName(filter.field), value: `${filter.operator === 'gte' ? '≥ ' : filter.operator === 'lte' ? '≤ ' : ''}${String(filter.value)}` }));
  const commandToolbar = pageActions && pageActions.length > 0 ? <CommandToolbar aria-label={`${title} actions`} actions={pageActions} /> : undefined;
  const content = <section aria-label={title}>
    {!pageLayout && commandToolbar}
    {header}
    <FilterBar title={`${title} filters`} activeCount={filters.length} liveMode onClear={() => onFiltersChange([])}>
      {filterControls}
    </FilterBar>
    <FilterTokenGroup tokens={tokens} onRemove={(id) => onFiltersChange(filters.filter((_, index) => String(index) !== id))} onClear={() => onFiltersChange([])} />
    <DataGrid title={title} data={result.data?.items ?? []} columns={columns} getRowId={getRowId}
      search={search} onSearchChange={(value) => { updateView({ search: value }); setPage(1); }}
      sort={sort} onSortChange={(value) => { updateView({ sort: value }); setPage(1); }}
      visibleColumnIds={visibleColumns} onVisibleColumnIdsChange={(value) => updateView({ visibleColumns: value })}
      selectedIds={selectedIds} onSelectionChange={onSelectionChange}
      selectionMode={selectionMode ?? (selectionActions || selectedIds || onSelectionChange ? 'multiple' : 'none')} selectionActions={selectionActions} toolbarActions={toolbarActions}
      loading={result.status === 'loading'} server={{
        page, pageSize, totalItems: result.data?.total ?? 0, onPageChange: setPage,
        onPageSizeChange: (value) => { updateView({ pageSize: value }); setPage(1); },
        filters: columnFilters,
        onFiltersChange: (next) => {
          const remaining = filters.filter((filter) => !(columnIds.has(filter.field) && filter.operator === 'equals' && typeof filter.value === 'string'));
          const selected: DataFilter[] = Object.entries(next).filter((entry): entry is [string, string] => entry[1] != null).map(([field, value]) => ({ field, operator: 'equals', value }));
          onFiltersChange([...remaining, ...selected]);
        },
        hasActiveFilters: filters.length > 0,
        stale: result.status === 'refreshing' || (result.status === 'error' && !!result.data),
        error: result.status === 'error' ? <span>Could not load data. <Button size="sm" onClick={result.retry}>Retry</Button></span> : undefined,
      }} />
  </section>;
  return pageLayout ? <Page title={title} actions={commandToolbar}>{content}</Page> : content;
}
