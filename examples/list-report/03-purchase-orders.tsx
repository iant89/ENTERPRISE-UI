import { useMemo, useState } from 'react';
import { BulkActionBar, ListReport, SavedViews, createInMemoryAdapter, type DataFilter, type ListReportView, type SavedView } from '@enterprise-ui/react';

type Order = { id: string; supplier: string; status: string };
const initial: Order[] = [
  { id: 'PO-1001', supplier: 'Acme', status: 'Open' },
  { id: 'PO-1002', supplier: 'Nordic Supply', status: 'Locked' },
  { id: 'PO-1003', supplier: 'Atlas', status: 'Open' },
];
const columns = [
  { id: 'id', header: 'Order', accessor: 'id' as const, sortable: true },
  { id: 'supplier', header: 'Supplier', accessor: 'supplier' as const, sortable: true },
  { id: 'status', header: 'Status', accessor: 'status' as const, sortable: true },
];
const initialView: ListReportView = { search: '', sort: null, visibleColumns: ['id', 'supplier', 'status'], pageSize: 10 };
const initialViews: SavedView[] = [{ id: 'all', name: 'All orders', scope: 'personal', isDefault: true,
  configuration: { filters: [], search: '', sort: [], visibleColumns: initialView.visibleColumns, pageSize: 10 } }];

/** In-memory demo; replace mock operations with an authorized, durable backend. */
export default function PurchaseOrderList() {
  const [orders, setOrders] = useState(initial);
  const [filters, setFilters] = useState<DataFilter[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [view, setView] = useState(initialView);
  const [views, setViews] = useState(initialViews);
  const [selectedView, setSelectedView] = useState<string | null>('all');
  const adapter = useMemo(() => createInMemoryAdapter(orders, { fields: { id: (row) => row.id, supplier: (row) => row.supplier, status: (row) => row.status } }), [orders]);
  const status = filters.find((filter) => filter.field === 'status' && filter.operator === 'equals');
  return <ListReport pageLayout title="Purchase orders" columns={columns} adapter={adapter} getRowId={(row) => row.id}
    filters={filters} onFiltersChange={setFilters} view={view} onViewChange={setView} selectionMode="multiple"
    selectedIds={selected} onSelectionChange={setSelected}
    pageActions={[{ id: 'create', label: 'Add sample order', onClick: () => setOrders((current) => [...current, { id: `PO-${crypto.randomUUID().slice(0, 8)}`, supplier: 'New supplier', status: 'Open' }]) }]}
    header={<>
      <SavedViews views={views} selectedId={selectedView} onSelect={(id) => {
        const item = views.find((candidate) => candidate.id === id); if (!item) return;
        setSelectedView(id); setFilters(item.configuration.filters);
        const sort = item.configuration.sort[0];
        setView({ search: item.configuration.search ?? '', sort: sort ? { columnId: sort.field, direction: sort.direction === 'asc' ? 'ascending' : 'descending' } : null, visibleColumns: item.configuration.visibleColumns, pageSize: item.configuration.pageSize });
      }} onSave={(name, scope) => {
        const id = crypto.randomUUID();
        setViews((current) => [...current, { id, name, scope, configuration: structuredClone({ filters, search: view.search, sort: view.sort ? [{ field: view.sort.columnId, direction: view.sort.direction === 'ascending' ? 'asc' : 'desc' }] : [], visibleColumns: view.visibleColumns, pageSize: view.pageSize }) }]);
        setSelectedView(id);
      }} onRename={(id, name) => setViews((current) => current.map((item) => item.id === id ? { ...item, name } : item))}
      onDelete={(id) => { setViews((current) => current.filter((item) => item.id !== id)); setSelectedView(null); }} />
      <BulkActionBar selectedIds={selected} onClearSelection={() => setSelected([])} onResult={(_id, result) => setSelected((current) => current.filter((id) => !result.succeeded.includes(id)))} actions={[
        { id: 'archive', label: 'Archive', destructive: true, execute: async (ids, signal) => {
          signal.throwIfAborted();
          const locked = ids.filter((id) => orders.find((order) => order.id === id)?.status === 'Locked');
          const succeeded = ids.filter((id) => orders.some((order) => order.id === id) && !locked.includes(id));
          const missing = ids.filter((id) => !orders.some((order) => order.id === id));
          setOrders((current) => current.filter((order) => !succeeded.includes(order.id)));
          return { succeeded, failed: [...locked.map((id) => ({ id, message: 'Order is locked' })), ...missing.map((id) => ({ id, message: 'Order not found' }))] };
        } },
      ]} />
    </>}
    filterControls={<label>Status <select value={String(status?.value ?? '')} onChange={(event) => setFilters(event.target.value ? [{ field: 'status', operator: 'equals', value: event.target.value }] : [])}>
      <option value="">All</option><option value="Open">Open</option><option value="Locked">Locked</option>
    </select></label>} />;
}
