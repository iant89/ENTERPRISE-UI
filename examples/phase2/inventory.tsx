import { useMemo, useState } from 'react';
import { DataGrid, DateRangePicker, FilterBar, FilterTokenGroup, isDateRangeValid, createInMemoryAdapter, useDataAdapter, type DataFilter, type DataRequest, type DateRange, type SortState, type SavedViewConfiguration } from '@enterprise-ui/react';
import { InventoryViews } from './internal/InventoryViews';

const adapter = createInMemoryAdapter([
  { id: '1', name: 'Bolt', received: '2026-10-20' },
  { id: '2', name: 'Nut', received: '2026-10-28' },
  { id: '3', name: 'Washer', received: '2026-10-29' },
], { fields: { name: item => item.name, received: item => item.received } });
const empty: DateRange = { start: '', end: '' };
const columns = [{ id: 'name', header: 'Name', accessor: 'name' as const, sortable: true }, { id: 'received', header: 'Received', accessor: 'received' as const, sortable: true }];

/** Demonstrates adapter-backed paging and draft-versus-applied date filtering. */
export default function InventoryExample() {
  const [draft, setDraft] = useState<DateRange>(empty);
  const [applied, setApplied] = useState<DateRange>(empty);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [filters, setFilters] = useState<Record<string, string | null>>({});
  const [visibleColumns, setVisibleColumns] = useState(['name', 'received']);
  const valid = isDateRangeValid(draft);
  const request = useMemo<DataRequest>(() => {
    const rules: DataFilter[] = [];
    if (applied.start) rules.push({ field: 'received', operator: 'gte', value: applied.start });
    if (applied.end) rules.push({ field: 'received', operator: 'lte', value: applied.end });
    Object.entries(filters).forEach(([field, value]) => { if (value != null) rules.push({ field, operator: 'equals', value }); });
    return { pagination: { page: page - 1, pageSize }, search, filters: rules, sort: sort ? [{ field: sort.columnId, direction: sort.direction === 'ascending' ? 'asc' : 'desc' }] : [] };
  }, [applied, filters, page, pageSize, search, sort]);
  const result = useDataAdapter(adapter, request);
  const configuration: SavedViewConfiguration = { filters: request.filters ?? [], search, sort: request.sort ?? [], visibleColumns, pageSize };
  const applyView = (view: SavedViewConfiguration) => {
    const start = view.filters.find((filter) => filter.field === 'received' && filter.operator === 'gte');
    const end = view.filters.find((filter) => filter.field === 'received' && filter.operator === 'lte');
    const range = { start: typeof start?.value === 'string' ? start.value : '', end: typeof end?.value === 'string' ? end.value : '' };
    setDraft(range); setApplied(range);
    setFilters(Object.fromEntries(view.filters.filter((filter) => filter.operator === 'equals' && typeof filter.value === 'string').map((filter) => [filter.field, String(filter.value)])));
    setSearch(view.search ?? '');
    setSort(view.sort[0] ? { columnId: view.sort[0].field, direction: view.sort[0].direction === 'asc' ? 'ascending' : 'descending' } : null);
    setVisibleColumns(view.visibleColumns); setPageSize(view.pageSize); setPage(1);
  };
  const clear = () => { setDraft(empty); setApplied(empty); setPage(1); };
  return <>
    <InventoryViews current={configuration} onApply={applyView} />
    <FilterBar title="Inventory filters" activeCount={Number(!!draft.start || !!draft.end || !!applied.start || !!applied.end)} onGo={() => { if (valid) { setApplied(draft); setPage(1); } }} onClear={clear}>
      <DateRangePicker label="Received" value={draft} onChange={setDraft} />
    </FilterBar>
    <FilterTokenGroup tokens={applied.start || applied.end ? [{ id: 'received', name: 'Received', value: `${applied.start || 'Any'} – ${applied.end || 'Any'}` }] : []} onRemove={clear} onClear={clear} />
    <DataGrid title="Inventory" columns={columns} data={result.data?.items ?? []} getRowId={item => item.id}
      visibleColumnIds={visibleColumns} onVisibleColumnIdsChange={setVisibleColumns} resizableColumns
      loading={result.status === 'loading'} search={search} onSearchChange={text => { setSearch(text); setPage(1); }}
      sort={sort} onSortChange={next => { setSort(next); setPage(1); }}
      server={{ page, pageSize, totalItems: result.data?.total ?? 0, onPageChange: setPage, onPageSizeChange: size => { setPageSize(size); setPage(1); }, filters, hasActiveFilters: !!(applied.start || applied.end), onFiltersChange: next => { setFilters(next); setPage(1); }, stale: result.status === 'refreshing' || (result.status === 'error' && !!result.data), error: result.status === 'error' ? <span>Could not load inventory. <button type="button" onClick={result.retry}>Retry</button></span> : undefined }} />
  </>;
}
