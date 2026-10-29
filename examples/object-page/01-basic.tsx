import { Pencil, Printer } from 'lucide-react';
import { Avatar, Button, Card, IconButton, MetricCard, ObjectPage, StatusIndicator, Table, Timeline } from '@enterprise-ui/react';
import { currency, products } from '../data';

export const title = 'Purchase order object page';
export const description = 'Header with title, status, key attributes and KPIs; an anchor bar tracks the visible section while scrolling.';
export const frame = true;

export default function ObjectPageBasic() {
  const items = products.slice(0, 4);
  return (
    <div style={{ height: 600, overflow: 'auto' }}>
      <ObjectPage
        breadcrumbs={[{ label: 'Purchasing', href: '#' }, { label: 'Purchase orders', href: '#' }, { label: '4500012' }]}
        title="Purchase Order 4500012"
        subtitle="Contoso Ltd · Created by Ada Lovelace"
        avatar={<Avatar name="Contoso Ltd" shape="square" size="lg" decorative />}
        status={<StatusIndicator tone="warning">Awaiting approval</StatusIndicator>}
        actions={
          <>
            <IconButton icon={<Printer />} label="Print" />
            <Button icon={<Pencil />}>Edit</Button>
            <Button variant="primary">Approve</Button>
          </>
        }
        attributes={[
          { label: 'Company code', value: '1000' },
          { label: 'Payment terms', value: 'Net 30' },
          { label: 'Delivery date', value: 'Nov 14, 2026' },
        ]}
        headerContent={<MetricCard title="Net value" value={currency(items.reduce((s, p) => s + p.price * 2, 0))} style={{ minWidth: 220 }} />}
        sections={[
          { id: 'general', title: 'General information', content: <Card>Supplier Contoso Ltd, purchasing group 001, organisation 1000.</Card> },
          {
            id: 'items', title: 'Items',
            content: <Table caption="Items" columns={[{ id: 'name', header: 'Product', accessor: 'name' }, { id: 'price', header: 'Price', accessor: 'price', align: 'end', cell: (p) => currency(p.price) }]} data={items} />,
          },
          {
            id: 'history', title: 'History',
            content: <Timeline items={[{ id: '1', title: 'Created', timestamp: 'Oct 20' }, { id: '2', title: 'Submitted for approval', timestamp: 'Oct 21', tone: 'information' }]} />,
          },
        ]}
      />
    </div>
  );
}
