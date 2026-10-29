import { Stack } from '@enterprise-ui/react';

export const title = 'Stack';
export const description = 'Vertical or horizontal stacks with consistent spacing and optional dividers.';

export default function StackBasic() {
  return (
    <Stack direction="horizontal" gap={8} wrap align="flex-start">
      <Stack gap={2}>
        <strong>gap=2</strong>
        <span>Supplier</span>
        <span>Payment terms</span>
        <span>Incoterms</span>
      </Stack>
      <Stack gap={3} dividers>
        <strong>dividers</strong>
        <span>Net 30</span>
        <span>FOB Hamburg</span>
        <span>EUR</span>
      </Stack>
    </Stack>
  );
}
