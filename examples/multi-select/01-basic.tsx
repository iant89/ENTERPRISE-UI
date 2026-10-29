import { useState } from 'react';
import { MultiSelect, Stack } from '@enterprise-ui/react';
import { categoryOptions } from '../data';

export const title = 'Multiple values';
export const description = 'Selected values appear as tokens. Backspace removes the last token; tokens beyond `maxVisibleTokens` collapse.';

export default function MultiSelectBasic() {
  const [value, setValue] = useState(['Laptops', 'Monitors']);
  return (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <MultiSelect label="Categories" options={categoryOptions} value={value} onChange={setValue} />
      <MultiSelect label="Regions" options={[{ value: 'emea', label: 'EMEA' }, { value: 'amer', label: 'Americas' }, { value: 'apj', label: 'APJ' }]} disabled />
    </Stack>
  );
}
