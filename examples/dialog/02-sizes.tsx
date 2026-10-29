import { useState } from 'react';
import { Button, Dialog, Stack } from '@enterprise-ui/react';

export const title = 'Sizes';
export const description = 'Dialogs take the full screen on phones. Choose `sm` for short messages and `lg`/`xl` for complex content.';

export default function DialogSizes() {
  const [size, setSize] = useState<'sm' | 'lg' | 'xl' | null>(null);
  return (
    <Stack direction="horizontal" gap={2}>
      {(['sm', 'lg', 'xl'] as const).map((s) => (
        <Button key={s} onClick={() => setSize(s)}>Open {s}</Button>
      ))}
      <Dialog open={size !== null} size={size ?? 'md'} onClose={() => setSize(null)} title={`${size?.toUpperCase()} dialog`} footer={<Button variant="primary" onClick={() => setSize(null)}>Close</Button>}>
        <p style={{ margin: 0 }}>Dialog content adapts to the chosen width; long content scrolls inside the body.</p>
      </Dialog>
    </Stack>
  );
}
