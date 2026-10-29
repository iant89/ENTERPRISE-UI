import { useState } from 'react';
import { SearchField, Stack } from '@enterprise-ui/react';

export const title = 'Search';
export const description = 'Enter triggers `onSearch`; Escape or the clear button empties the field.';

export default function SearchFieldBasic() {
  const [last, setLast] = useState('');
  return (
    <Stack gap={2} style={{ maxWidth: 360 }}>
      <SearchField placeholder="Search products" aria-label="Search products" onSearch={setLast} />
      <span style={{ color: 'var(--eui-color-text-secondary)' }}>Last search: {last || '—'}</span>
      <SearchField label="Search suppliers" defaultValue="North" loading />
    </Stack>
  );
}
