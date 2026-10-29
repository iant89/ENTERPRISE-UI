import { useState } from 'react';
import { Button, DetailPanel, Stack, StatusIndicator, Table, Timeline } from '@enterprise-ui/react';
import { currency, orders, orderTone, type Order } from '../data';

export const title = 'Details in a side panel';
export const description = 'Open details without leaving the list. The overlay panel is modal: focus is trapped and returns to the row on close.';

export default function DetailPanelBasic() {
  const [order, setOrder] = useState<Order | null>(null);
  return (
    <>
      <Table
        caption="Orders"
        columns={[
          { id: 'id', header: 'Order', accessor: 'id', rowHeader: true },
          { id: 'customer', header: 'Customer', accessor: 'customer' },
          { id: 'amount', header: 'Amount', accessor: 'amount', align: 'end', cell: (o) => currency(o.amount) },
        ]}
        data={orders.slice(0, 4)}
        onRowClick={setOrder}
      />
      <DetailPanel
        open={order !== null}
        onClose={() => setOrder(null)}
        title={order?.customer}
        subtitle={order?.id}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setOrder(null)}>Close</Button>
            <Button variant="primary">Open order</Button>
          </>
        }
      >
        {order && (
          <Stack gap={4}>
            <StatusIndicator tone={orderTone[order.status]}>{order.status}</StatusIndicator>
            <div>Amount: <strong>{currency(order.amount)}</strong></div>
            <Timeline items={[{ id: 'a', title: 'Order received', timestamp: order.date }]} />
          </Stack>
        )}
      </DetailPanel>
    </>
  );
}
