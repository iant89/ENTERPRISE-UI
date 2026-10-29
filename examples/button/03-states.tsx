import { useState } from 'react';
import { Button, Stack } from '@enterprise-ui/react';

export const title = 'Disabled and loading states';
export const description = 'Loading buttons keep their size, show a spinner and set `aria-busy`; clicks are ignored until the work completes.';

export default function ButtonStates() {
  const [saving, setSaving] = useState(false);
  return (
    <Stack direction="horizontal" gap={2} wrap>
      <Button variant="primary" disabled>Disabled</Button>
      <Button disabled>Disabled</Button>
      <Button
        variant="primary"
        loading={saving}
        onClick={() => {
          setSaving(true);
          setTimeout(() => setSaving(false), 1500);
        }}
      >
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </Stack>
  );
}
