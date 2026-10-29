import { useState } from 'react';
import { Button, EmptyState, Stack, Switch, Table } from '@enterprise-ui/react';
import { products } from '../data';

export const title = 'Loading, empty and density';
export const description = 'Skeleton rows while loading (`aria-busy`), an EmptyState when there is no data, and three row densities.';

const columns = [
  { id: 'name', header: 'Product', accessor: 'name' as const },
  { id: 'supplier', header: 'Supplier', accessor: 'supplier' as const },
  { id: 'stock', header: 'Stock', accessor: 'stock' as const, align: 'end' as const },
];

export default function TableStates() {
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [condensed, setCondensed] = useState(false);
  return (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={4} wrap>
        <Switch label="Loading" checked={loading} onChange={setLoading} />
        <Switch label="Empty" checked={empty} onChange={setEmpty} />
        <Switch label="Condensed" checked={condensed} onChange={setCondensed} />
      </Stack>
      <Table
        caption="Inventory"
        columns={columns}
        data={empty ? [] : products.slice(0, 5)}
        loading={loading}
        density={condensed ? 'condensed' : undefined}
        responsive="stack"
        emptyState={<EmptyState size="sm" headingLevel={3} title="No products" description="Adjust your filters or add a product." actions={<Button size="sm">Add product</Button>} />}
      />
    </Stack>
  );
}
