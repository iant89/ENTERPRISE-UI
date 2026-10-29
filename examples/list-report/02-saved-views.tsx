import { useState } from 'react';
import { ListReport, SavedViews, createInMemoryAdapter, type DataFilter, type ListReportView, type SavedView, type SavedViewConfiguration } from '@enterprise-ui/react';

const adapter = createInMemoryAdapter([
  { id: '1', name: 'Valve', status: 'Open' },
  { id: '2', name: 'Pump', status: 'Closed' },
  { id: '3', name: 'Pipe', status: 'Open' },
], { fields: { name: (row) => row.name, status: (row) => row.status } });
const columns = [
  { id: 'name', header: 'Name', accessor: 'name' as const, sortable: true },
  { id: 'status', header: 'Status', accessor: 'status' as const, sortable: true },
];
const initialView: ListReportView = { search: '', sort: null, visibleColumns: ['name', 'status'], pageSize: 10 };
const initial: SavedView[] = [{ id: 'all', name: 'All products', scope: 'personal', isDefault: true,
  configuration: { filters: [], search: '', sort: [], visibleColumns: ['name', 'status'], pageSize: 10 } }];

/** Demonstrates view application; real applications should persist and authorize on the backend. */
export default function SavedListReportExample() {
  const [views, setViews] = useState(initial);
  const [selected, setSelected] = useState<string | null>('all');
  const [view, setView] = useState(initialView);
  const [filters, setFilters] = useState<DataFilter[]>([]);
  const configuration: SavedViewConfiguration = {
    filters, search: view.search, pageSize: view.pageSize, visibleColumns: view.visibleColumns,
    sort: view.sort ? [{ field: view.sort.columnId, direction: view.sort.direction === 'ascending' ? 'asc' : 'desc' }] : [],
  };
  const apply = (id: string) => {
    const item = views.find((candidate) => candidate.id === id);
    if (!item) return;
    const config = item.configuration;
    setSelected(id); setFilters(config.filters);
    setView({ search: config.search ?? '', visibleColumns: config.visibleColumns, pageSize: config.pageSize,
      sort: config.sort[0] ? { columnId: config.sort[0].field, direction: config.sort[0].direction === 'asc' ? 'ascending' : 'descending' } : null });
  };
  return <ListReport title="Products" adapter={adapter} columns={columns} getRowId={(row) => row.id}
    filters={filters} onFiltersChange={setFilters} view={view} onViewChange={setView}
    header={<SavedViews views={views} selectedId={selected} onSelect={apply}
      onSave={(name, scope) => {
        const id = crypto.randomUUID();
        setViews((previous) => [...previous, { id, name, scope, configuration: structuredClone(configuration) }]);
        setSelected(id);
      }}
      onRename={(id, name) => setViews((previous) => previous.map((item) => item.id === id ? { ...item, name } : item))}
      onDelete={(id) => { setViews((previous) => previous.filter((item) => item.id !== id)); setSelected(null); }} />}
    filterControls={<label>Status <select value={String(filters.find((filter) => filter.field === 'status')?.value ?? '')}
      onChange={(event) => setFilters(event.target.value ? [{ field: 'status', operator: 'equals', value: event.target.value }] : [])}>
      <option value="">All</option><option value="Open">Open</option><option value="Closed">Closed</option>
    </select></label>} />;
}
