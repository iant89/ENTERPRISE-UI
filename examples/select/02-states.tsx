import { Select, Stack } from '@enterprise-ui/react';
import { categoryOptions } from '../data';

export const title = 'Error and disabled';
export const description = 'Validation and disabled states match the other form controls.';

export default function SelectStates() {
  return (
    <Stack gap={4} style={{ maxWidth: 320 }}>
      <Select label="Category" options={categoryOptions} required error="Select a category." />
      <Select label="Plant" options={[{ value: '1000', label: 'Berlin (1000)' }]} defaultValue="1000" disabled />
    </Stack>
  );
}
