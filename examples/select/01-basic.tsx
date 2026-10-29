import { useState } from 'react';
import { Select, Stack } from '@enterprise-ui/react';
import { countries } from '../data';

export const title = 'Select';
export const description = 'Open with Enter, Space or the arrow keys; type to jump to an option. Options can be grouped.';

export default function SelectBasic() {
  const [country, setCountry] = useState<string | null>('de');
  return (
    <Stack gap={4} style={{ maxWidth: 320 }}>
      <Select label="Country" options={countries} value={country} onChange={setCountry} />
      <Select
        label="Priority"
        placeholder="Choose priority"
        options={[
          { value: 'high', label: 'High', description: 'Respond within 4 hours' },
          { value: 'medium', label: 'Medium', description: 'Respond within 1 day' },
          { value: 'low', label: 'Low', description: 'Respond within 1 week' },
        ]}
      />
    </Stack>
  );
}
