import { useState } from 'react';
import { Avatar, List, MasterDetail, ObjectPage, StatusIndicator } from '@enterprise-ui/react';
import { currency, orders, orderTone } from '../data';

export const title = 'Orders master–detail';
export const description = 'Side by side on wide screens; below 1024px one pane at a time with a back button.';

export default function MasterDetailBasic() {
  const [selected, setSelected] = useState(orders[0].id);
  const [showDetail, setShowDetail] = useState(false);
  const order = orders.find((o) => o.id === selected)!;
  return (
    <div style={{ height: 460 }}>
      <MasterDetail
        showDetail={showDetail}
        onBack={() => setShowDetail(false)}
        masterLabel="Sales orders"
        detailLabel={`Order ${order.id}`}
        master={
          <List
            aria-label="Sales orders"
            selectionMode="single"
            selectedIds={[selected]}
            onSelectionChange={(ids) => ids[0] && setSelected(ids[0])}
            onItemClick={() => setShowDetail(true)}
            items={orders.map((o) => ({
              id: o.id,
              title: o.customer,
              textValue: o.customer,
              description: o.id,
              leading: <Avatar name={o.customer} size="sm" shape="square" decorative />,
              meta: currency(o.amount),
            }))}
          />
        }
        detail={
          <ObjectPage
            title={order.customer}
            subtitle={`Sales order ${order.id}`}
            status={<StatusIndicator tone={orderTone[order.status]}>{order.status}</StatusIndicator>}
            attributes={[{ label: 'Amount', value: currency(order.amount) }, { label: 'Order date', value: order.date }]}
            navigation="tabs"
            sections={[
              { id: 'items', title: 'Items', content: 'Line items of the order.' },
              { id: 'delivery', title: 'Delivery', content: 'Ship-to address and schedule.' },
            ]}
          />
        }
      />
    </div>
  );
}
