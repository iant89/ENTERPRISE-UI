import { useState } from 'react';
import { Button, DataGrid } from '@enterprise-ui/react';
export const title = 'Asset management';
const assets = [{ id: 'A-101', name: 'Forklift 7', location: 'Warehouse A', status: 'In service' }, { id: 'A-102', name: 'Conveyor 2', location: 'Warehouse B', status: 'Maintenance' }];
const columns = [{ id: 'id', header: 'Asset', accessor: 'id' as const }, { id: 'name', header: 'Description', accessor: 'name' as const }, { id: 'location', header: 'Location', accessor: 'location' as const }, { id: 'status', header: 'Status', accessor: 'status' as const }];
export default function AssetsExample() {
  const [visible, setVisible] = useState(true);
  return <><Button onClick={() => setVisible((value) => !value)}>{visible ? 'Show empty assets' : 'Restore assets'}</Button><DataGrid title="Assets" data={visible ? assets : []} columns={columns} getRowId={(asset) => asset.id} emptyState="No assets registered." /></>;
}
