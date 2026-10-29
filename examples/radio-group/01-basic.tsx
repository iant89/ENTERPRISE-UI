import { RadioGroup, Stack } from '@enterprise-ui/react';

export const title = 'Radio group';
export const description = 'Arrow keys move between options. Use `orientation="horizontal"` for short option lists.';

export default function RadioGroupBasic() {
  return (
    <Stack gap={6}>
      <RadioGroup
        label="Shipping method"
        defaultValue="standard"
        options={[
          { value: 'standard', label: 'Standard', description: '3–5 business days' },
          { value: 'express', label: 'Express', description: 'Next business day' },
          { value: 'pickup', label: 'Pickup at warehouse', disabled: true },
        ]}
      />
      <RadioGroup label="Invoice format" orientation="horizontal" required error="Choose an invoice format." options={[{ value: 'pdf', label: 'PDF' }, { value: 'xml', label: 'XRechnung' }, { value: 'edi', label: 'EDI' }]} />
    </Stack>
  );
}
