import { useState } from 'react';
import { BulkActionBar, ListReport, createInMemoryAdapter, type DataFilter } from '@enterprise-ui/react';

const rows = [{ id: '1', name: 'Valve' }, { id: '2', name: 'Pipe' }, { id: '3', name: 'Pump' }];
const adapter = createInMemoryAdapter(rows, { fields: { name: (row) => row.name } });
const columns = [{ id: 'name', header: 'Name', accessor: 'name' as const, sortable: true }];
const filters: DataFilter[] = [];

export default function BulkListExample() {
  const [selected, setSelected] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  return <>
    <BulkActionBar selectedIds={selected} onResult={() => setRefreshKey((value) => value + 1)} onClearSelection={() => setSelected([])} actions={[
      { id: 'archive', label: 'Archive', destructive: true, execute: async (ids) => ({ succeeded: ids.filter((id) => id !== '2'), failed: ids.includes('2') ? [{ id: '2', message: 'Record is locked' }] : [] }) },
    ]} />
    <ListReport title="Assets" refreshKey={refreshKey} columns={columns} adapter={adapter} getRowId={(row) => row.id} filters={filters} onFiltersChange={() => {}}
      selectedIds={selected} onSelectionChange={setSelected} selectionMode="multiple" />
  </>;
}
