import { Avatar, Badge, List, StatusIndicator } from '@enterprise-ui/react';
import { currency, orders, orderTone } from '../data';

export const title = 'Navigation list';
export const description = 'Items with leading avatars, descriptions and trailing status. With `onItemClick`, items become buttons with a chevron.';

export default function ListBasic() {
  return (
    <div style={{ maxWidth: 520, border: '1px solid var(--eui-color-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
      <List
        header={<>Recent orders <Badge count={orders.length} tone="information" /></>}
        items={orders.map((o) => ({
          id: o.id,
          title: o.customer,
          description: `${o.id} · ${o.date}`,
          leading: <Avatar name={o.customer} size="sm" shape="square" decorative />,
          trailing: <StatusIndicator tone={orderTone[o.status]} size="sm">{o.status}</StatusIndicator>,
          meta: currency(o.amount),
        }))}
        onItemClick={() => {}}
      />
    </div>
  );
}
