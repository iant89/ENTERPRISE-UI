import { Badge, DescriptionList, Link } from '@enterprise-ui/react';

export const title = 'Business object facts';
export const description = 'Read-only term and value pairs in a native `dl`. `span` widens long values; missing values show `emptyText`. Phones always use one column.';

export default function DescriptionListBasic() {
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <DescriptionList
        columns={3}
        items={[
          { term: 'Purchase order', description: '4500017321' },
          { term: 'Supplier', description: <Link href="#">Northwind Components GmbH</Link> },
          { term: 'Status', description: <Badge tone="success">Released</Badge> },
          { term: 'Net value', description: '48,210.00 EUR' },
          { term: 'Delivery date', description: '12 Dec 2026' },
          { term: 'Buyer', description: 'Avery Lindqvist' },
          { term: 'Payment terms', description: undefined },
          { term: 'Notes', description: 'Deliver to dock 4. Partial deliveries accepted; quality inspection required for lot-managed materials.', span: 'full' },
        ]}
      />
      <DescriptionList
        layout="inline"
        bordered
        columns={2}
        items={[
          { term: 'Plant', description: '1010 Hamburg' },
          { term: 'Storage location', description: '0001 Main warehouse' },
          { term: 'Weight', hint: '(kg)', description: '1,240' },
          { term: 'Incoterms', description: 'DAP' },
        ]}
      />
    </div>
  );
}
