import { useMemo, useState } from 'react';
import { SmartChart, SmartFilterBar, SmartTable, filterRecords, type FilterValues } from '@enterprise-ui/react';
import { productRecords, productSchema } from '../metadata';

export const title = 'One schema, a whole list report';
export const description = 'The filter bar, chart and table are generated from the same `productSchema`. Filters are typed by field (any-of lists for enums, ranges for amounts and dates); `filterRecords` applies them on the client, or send the conditions to your backend.';

export default function MetadataListReport() {
  const [applied, setApplied] = useState<{ filters: FilterValues; search: string }>({ filters: {}, search: '' });
  const rows = useMemo(() => filterRecords(productSchema, productRecords, applied.filters, { search: applied.search }), [applied]);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <SmartFilterBar schema={productSchema} fields={['category', 'supplier', 'price', 'active', 'released']} onGo={(filters, search) => setApplied({ filters, search })} onClear={() => setApplied({ filters: {}, search: '' })} />
      <SmartChart schema={productSchema} data={rows} dimension="category" measures={['stock']} height={220} />
      <SmartTable schema={productSchema} data={rows} fields={['name', 'category', 'supplier', 'price', 'stock', 'active']} caption={`Products (${rows.length})`} defaultSort={{ columnId: 'name', direction: 'ascending' }} maxHeight={360} stickyHeader />
    </div>
  );
}
