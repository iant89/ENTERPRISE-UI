import { List, SplitView } from '@enterprise-ui/react';
import { orders } from '../data';

export const title = 'Resizable split view';
export const description = 'Drag the handle or focus it and use the arrow keys (Shift for bigger steps). Panes stack on phones.';

export default function SplitViewBasic() {
  return (
    <div style={{ height: 320 }}>
      <SplitView
        bordered
        resizable
        startSize={280}
        startLabel="Orders"
        endLabel="Order details"
        start={<List aria-label="Orders" items={orders.map((o) => ({ id: o.id, title: o.customer, description: o.id }))} />}
        end={<div style={{ padding: 24 }}>Select an order to see its details.</div>}
      />
    </div>
  );
}
