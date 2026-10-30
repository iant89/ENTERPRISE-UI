import { Button, ButtonBadge, Stack } from '@enterprise-ui/react';
export const title = 'Button badges';
export const description = 'Give the badge a `label` so its meaning is announced with the visible button text.';
export default function Example() {
  return (
    <Stack direction="horizontal" gap={4}>
      <Button badge={<ButtonBadge design="overlay" text="3" label="3 new" />}>Notifications</Button>
      <Button badge={<ButtonBadge label="new activity" />}>Inbox</Button>
    </Stack>
  );
}
