import { useState } from 'react';
import { Stack, StatusIndicator, Table, type TableColumn } from '@enterprise-ui/react';
import { currency, orders, orderTone, type Order } from '../data';

export const title = 'Selection, row highlights and actions';
export const description = 'Multiple selection adds checkboxes with a select-all; `getRowHighlight` adds a status bar; `onRowClick` makes rows navigable (Enter).';

const columns: TableColumn<Order>[] = [
  { id: 'id', header: 'Order', accessor: 'id', rowHeader: true },
  { id: 'customer', header: 'Customer', accessor: 'customer' },
  { id: 'date', header: 'Date', accessor: 'date' },
  { id: 'status', header: 'Status', accessor: 'status', cell: (o) => <StatusIndicator tone={orderTone[o.status]}>{o.status}</StatusIndicator> },
  { id: 'amount', header: 'Amount', accessor: 'amount', align: 'end', cell: (o) => currency(o.amount), footer: currency(orders.reduce((s, o) => s + o.amount, 0)) },
];

export default function TableSelection() {
  const [selected, setSelected] = useState<string[]>(['SO-50212']);
  const [opened, setOpened] = useState<string>();
  return (
    <Stack gap={2}>
      <Table
        caption="Sales orders"
        columns={columns}
        data={orders}
        selectionMode="multiple"
        selectedIds={selected}
        onSelectionChange={setSelected}
        getRowLabel={(o) => o.id}
        getRowHighlight={(o) => orderTone[o.status]}
        onRowClick={(o) => setOpened(o.id)}
        striped
      />
      <span style={{ color: 'var(--eui-color-text-secondary)' }}>
        {selected.length} selected{opened ? ` · opened ${opened}` : ''}
      </span>
    </Stack>
  );
}
