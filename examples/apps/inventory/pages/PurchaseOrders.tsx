import { useState } from 'react';
import { DataGrid, FilterBar, OverflowMenu, Page, Select, StatusIndicator, useToast, type DataGridColumn } from '@enterprise-ui/react';
import { currency } from '../../../data';
import { poTone, purchaseOrders, type PoStatus, type PurchaseOrder } from '../data';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';

const statuses: PoStatus[] = ['Draft', 'Submitted', 'Approved', 'Received', 'Cancelled'];

export function PurchaseOrders() {
  const { navigate } = useInventory();
  const toast = useToast();
  const [orders, setOrders] = useState(purchaseOrders);
  const [status, setStatus] = useState<PoStatus | null>(null);
  const setOrderStatus = (o: PurchaseOrder, next: PoStatus) => {
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
    toast.show({ title: `${o.id} ${next.toLowerCase()}`, tone: 'success' });
  };
  const columns: DataGridColumn<PurchaseOrder>[] = [
    { id: 'id', header: 'Order', accessor: 'id', sortable: true, rowHeader: true, alwaysVisible: true },
    { id: 'supplier', header: 'Supplier', accessor: 'supplier', sortable: true },
    { id: 'items', header: 'Items', accessor: 'items', align: 'end' },
    { id: 'amount', header: 'Amount', accessor: 'amount', sortable: true, align: 'end', cell: (o) => currency(o.amount) },
    { id: 'expected', header: 'Expected', accessor: 'expected', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status', cell: (o) => <StatusIndicator tone={poTone[o.status]}>{o.status}</StatusIndicator> },
    {
      id: 'actions', header: 'Actions', align: 'end', alwaysVisible: true,
      cell: (o) => (
        <OverflowMenu
          label={`Actions for ${o.id}`}
          items={[
            { id: 'Approved', label: 'Approve', disabled: o.status !== 'Submitted' },
            { id: 'Received', label: 'Mark received', disabled: o.status !== 'Approved' },
            { id: 'Cancelled', label: 'Cancel order', destructive: true, disabled: o.status === 'Received' || o.status === 'Cancelled' },
          ]}
          onAction={(id) => setOrderStatus(o, id as PoStatus)}
        />
      ),
    },
  ];
  return (
    <Page
      title="Purchase orders"
      subtitle="Orders placed with suppliers."
      breadcrumbs={crumbs(navigate, ['Home', 'home'], 'Purchasing', 'Purchase orders')}
      toolbar={
        <FilterBar liveMode activeCount={status ? 1 : 0} onClear={() => setStatus(null)}>
          <Select label="Status" placeholder="All statuses" size="sm" options={statuses.map((s) => ({ value: s, label: s }))} value={status} onChange={setStatus} />
        </FilterBar>
      }
    >
      <DataGrid title="Purchase orders" columns={columns} data={status ? orders.filter((o) => o.status === status) : orders} getRowLabel={(o) => o.id} />
    </Page>
  );
}
