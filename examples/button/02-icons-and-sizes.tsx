import { Button, Stack, Icon } from '@enterprise-ui/react';

export const title = 'Icons and sizes';
export const description = 'Icons sit before or after the label. Use `sm` in dense toolbars and `lg` for touch-first screens.';

export default function ButtonIconsAndSizes() {
  return (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={2} wrap>
        <Button variant="primary" icon={<Icon name="add" />}>Create</Button>
        <Button icon={<Icon name="download" />}>Export</Button>
        <Button variant="tertiary" iconEnd={<Icon name="paper-plane" />}>Submit for approval</Button>
      </Stack>
      <Stack direction="horizontal" gap={2} wrap align="center">
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
        <Button size="lg">Large</Button>
      </Stack>
    </Stack>
  );
}
