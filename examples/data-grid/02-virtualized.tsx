import { DataGrid } from '@enterprise-ui/react';
const rows = Array.from({ length: 10000 }, (_, index) => ({ id: `item-${index}`, name: `Item ${index + 1}`, status: index % 2 ? 'Available' : 'Pending' }));
export default function Example() {
  return <DataGrid title="Inventory" data={rows} columns={[{ id: 'name', header: 'Item', accessor: 'name' }, { id: 'status', header: 'Status', accessor: 'status' }]} getRowId={(row) => row.id} selectionMode="multiple" getRowLabel={(row) => row.name} pageSize={0} virtualization={{ rowHeight: 40, height: 320 }} />;
}
