import { Mail } from 'lucide-react';
import { Input, Stack } from '@enterprise-ui/react';

export const title = 'Labels and helper text';
export const description = 'Pass `label` and `description`; the component wires `<label for>` and `aria-describedby` for you.';

export default function InputBasic() {
  return (
    <Stack gap={4} style={{ maxWidth: 360 }}>
      <Input label="Supplier name" placeholder="e.g. Northwind Traders" required />
      <Input label="Email" type="email" description="Used for purchase order notifications." startAdornment={<Mail />} />
      <Input label="Unit price" inputMode="decimal" endAdornment="USD" defaultValue="129.00" />
    </Stack>
  );
}
