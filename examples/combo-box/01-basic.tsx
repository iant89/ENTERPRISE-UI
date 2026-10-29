import { ComboBox, Stack } from '@enterprise-ui/react';
import { countries, supplierOptions } from '../data';

export const title = 'Type to filter';
export const description = 'Typing filters the list and highlights the match. `allowCustomValue` accepts entries that are not in the list.';

export default function ComboBoxBasic() {
  return (
    <Stack gap={4} style={{ maxWidth: 320 }}>
      <ComboBox label="Ship-to country" options={countries} placeholder="Start typing…" />
      <ComboBox label="Supplier" options={supplierOptions} allowCustomValue description="Enter a new supplier name if it is not listed." />
      <ComboBox label="Country (error)" options={countries} error="Country is required." />
    </Stack>
  );
}
