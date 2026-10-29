import { useState } from 'react';
import { ComboBox, DatePicker, FilterBar, MultiSelect, SearchField, Select } from '@enterprise-ui/react';
import { categoryOptions, countries, supplierOptions } from '../data';

export const title = 'List report filter bar';
export const description = 'A search form with a quick search, a collapsible grid of filters, and Go / Clear. Use `liveMode` when filters apply immediately.';

export default function FilterBarBasic() {
  const [categories, setCategories] = useState<string[]>(['Laptops']);
  const [status, setStatus] = useState<string | null>(null);
  const [applied, setApplied] = useState(0);
  return (
    <>
      <FilterBar
        search={<SearchField aria-label="Search products" size="sm" />}
        activeCount={categories.length + (status ? 1 : 0)}
        onGo={() => setApplied((n) => n + 1)}
        onClear={() => {
          setCategories([]);
          setStatus(null);
        }}
      >
        <MultiSelect label="Category" options={categoryOptions} value={categories} onChange={setCategories} size="sm" />
        <Select label="Status" placeholder="Any" options={[{ value: 'in', label: 'In stock' }, { value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }]} value={status} onChange={setStatus} size="sm" />
        <ComboBox label="Supplier" options={supplierOptions} size="sm" />
        <Select label="Country" options={countries} size="sm" placeholder="Any" />
        <DatePicker label="Changed since" size="sm" />
      </FilterBar>
      <p style={{ color: 'var(--eui-color-text-secondary)' }}>Applied {applied} time(s).</p>
    </>
  );
}
