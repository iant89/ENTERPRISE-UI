import { useState } from 'react';
import { NumberInput, Stack } from '@enterprise-ui/react';

export const title = 'Quantities and amounts';
export const description = 'Arrow keys step by `step`, Page Up/Down by ten steps; values are clamped to `min`/`max` and rounded to `precision`.';

export default function NumberInputBasic() {
  const [qty, setQty] = useState<number | null>(5);
  return (
    <Stack gap={4} style={{ maxWidth: 280 }}>
      <NumberInput label="Quantity" value={qty} onChange={setQty} min={1} max={99} unit="pcs" />
      <NumberInput label="Unit price" defaultValue={129.5} step={0.5} precision={2} unit="USD" showStepper={false} />
      <NumberInput label="Weight" defaultValue={0} min={0} unit="kg" disabled />
    </Stack>
  );
}
