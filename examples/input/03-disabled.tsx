import { Input, Stack } from '@enterprise-ui/react';

export const title = 'Disabled, read-only and horizontal labels';
export const description = 'Read-only fields stay focusable and copyable; disabled fields are skipped. `labelPosition="horizontal"` places labels beside fields on wide screens.';

export default function InputDisabled() {
  return (
    <Stack gap={4} style={{ maxWidth: 520 }}>
      <Input label="Company code" defaultValue="1000" disabled labelPosition="horizontal" />
      <Input label="Created by" defaultValue="Ada Lovelace" readOnly labelPosition="horizontal" />
      <Input label="Reference" placeholder="Optional" labelPosition="horizontal" size="sm" />
    </Stack>
  );
}
