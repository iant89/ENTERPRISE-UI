import { Icon, Stack } from '@enterprise-ui/react';

export const title = 'Icons';
export const description = 'Icon renders a bare svg. The name is autocompleted and type-checked. Give informative icons a label; decorative icons (no label) are hidden from screen readers.';

export default function Example() {
  return (
    <Stack direction="horizontal" gap={3} align="center">
      <Icon name="bar-code" label="Barcode" />
      <Icon name="bell" label="Notifications" size={32} />
      <Icon name="settings" label="Settings" color="var(--eui-color-primary)" />
      <Icon name="accept" color="var(--eui-color-success)" />
    </Stack>
  );
}
