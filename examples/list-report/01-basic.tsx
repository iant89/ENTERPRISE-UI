import { useState } from 'react';
import { ListReport, createInMemoryAdapter, type DataFilter } from '@enterprise-ui/react';

const adapter = createInMemoryAdapter([
  { id: 'p1', name: 'Valve', status: 'Open' },
  { id: 'p2', name: 'Pump', status: 'Closed' },
  { id: 'p3', name: 'Pipe', status: 'Open' },
], { fields: { name: row => row.name, status: row => row.status } });
const columns = [
  { id: 'name', header: 'Name', accessor: 'name' as const, sortable: true },
  { id: 'status', header: 'Status', accessor: 'status' as const, sortable: true },
];

export default function ListReportExample() {
  const [filters, setFilters] = useState<DataFilter[]>([]);
  const status = filters.find((filter) => filter.field === 'status' && filter.operator === 'equals')?.value ?? '';
  return <ListReport title="Products" adapter={adapter} columns={columns} getRowId={(row) => row.id}
    filters={filters} onFiltersChange={setFilters} pageSize={2}
    filterControls={<label>Status <select value={String(status)} onChange={(event) => setFilters(event.target.value ? [{ field: 'status', operator: 'equals', value: event.target.value }] : [])}>
      <option value="">All</option><option value="Open">Open</option><option value="Closed">Closed</option>
    </select></label>} />;
}
