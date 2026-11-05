import { useState } from 'react';
import { SmartFilterBar, filterRecords, type FilterValues } from '@enterprise-ui/react';
import { productRecords, productSchema } from '../metadata';

export const title = 'Filters from metadata';
export const description = 'Each field gets a condition control that fits its type: any-of lists for enums, Any/Yes/No for booleans, from–to ranges for numbers and amounts, and date ranges. `liveMode` applies changes immediately instead of on Go.';

export default function SmartFilterBarBasic() {
  const [filters, setFilters] = useState<FilterValues>({ category: ['Laptops'] });
  const [search, setSearch] = useState('');
  const count = filterRecords(productSchema, productRecords, filters, { search }).length;
  return (
    <>
      <SmartFilterBar schema={productSchema} liveMode value={filters} onChange={setFilters} search={search} onSearchChange={setSearch} />
      <p style={{ color: 'var(--eui-color-text-secondary)' }}>
        {count} of {productRecords.length} products match.
      </p>
    </>
  );
}
