import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useDataAdapter, type DataAdapter, type DataFilter, type DataRequest } from '../../data';
import { Button } from '../../components/button';
import { DataGrid, type DataGridColumn } from '../../components/data-grid';
import { FilterTokenGroup } from '../../components/filter-token';
import type { SortState } from '../../components/table';
import { FilterBar } from '../filter-bar';

export interface ListReportProps<T> {
  title: string;
  adapter: DataAdapter<T>;
  columns: DataGridColumn<T>[];
  getRowId: (row: T, index: number) => string;
  /** Applied filters. The application owns the filter controls and their values. */
  filters: DataFilter[];
  onFiltersChange: (filters: DataFilter[]) => void;
  /** Filter controls that update filters via the host. Filters apply immediately. */
  filterControls?: ReactNode;
  /** Optional saved-view selector or other page-level content. */
  header?: ReactNode;
  toolbarActions?: ReactNode;
  selectionActions?: (ids: string[]) => ReactNode;
  pageSize?: number;
  getFilterName?: (field: string) => string;
}

/**
 * Adapter-backed listing with applied filter tokens, search, sort and paging.
 * Column IDs and filter field names must match fields accepted by the adapter.
 * Pass a stable adapter and stable applied filter array to avoid unnecessary loads.
 */
export function ListReport<T>({ title, adapter, columns, getRowId, filters, onFiltersChange, filterControls, header, toolbarActions, selectionActions, pageSize: initialPageSize = 10, getFilterName = (field) => field }: ListReportProps<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  useEffect(() => { setPage(1); }, [filters]);
  const request = useMemo<DataRequest>(() => ({
    pagination: { page: page - 1, pageSize }, search, filters,
    sort: sort ? [{ field: sort.columnId, direction: sort.direction === 'ascending' ? 'asc' : 'desc' }] : [],
  }), [page, pageSize, search, filters, sort]);
  const result = useDataAdapter(adapter, request);
  const columnIds = new Set(columns.filter((column) => column.filterOptions).map((column) => column.id));
  const columnFilters = Object.fromEntries(filters.filter((filter) => columnIds.has(filter.field) && filter.operator === 'equals' && typeof filter.value === 'string').map((filter) => [filter.field, String(filter.value)]));
  const tokens = filters.map((filter, index) => ({ id: String(index), name: getFilterName(filter.field), value: `${filter.operator === 'gte' ? '≥ ' : filter.operator === 'lte' ? '≤ ' : ''}${String(filter.value)}` }));
  return <section aria-label={title}>
    {header}
    <FilterBar title={`${title} filters`} activeCount={filters.length} liveMode onClear={() => onFiltersChange([])}>
      {filterControls}
    </FilterBar>
    <FilterTokenGroup tokens={tokens} onRemove={(id) => onFiltersChange(filters.filter((_, index) => String(index) !== id))} onClear={() => onFiltersChange([])} />
    <DataGrid title={title} data={result.data?.items ?? []} columns={columns} getRowId={getRowId}
      search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }}
      sort={sort} onSortChange={(value) => { setSort(value); setPage(1); }}
      selectionMode={selectionActions ? 'multiple' : 'none'} selectionActions={selectionActions} toolbarActions={toolbarActions}
      loading={result.status === 'loading'} server={{
        page, pageSize, totalItems: result.data?.total ?? 0, onPageChange: setPage,
        onPageSizeChange: (value) => { setPageSize(value); setPage(1); },
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
}
