import { Button, ButtonBadge, Stack } from '@enterprise-ui/react';
export const title = 'Button badges';
export default function Example() { return <Stack direction="horizontal" gap={4}><Button aria-label="Notifications, 3 new" badge={<ButtonBadge design="overlay" text="3" />}>Notifications</Button><Button aria-label="Inbox, new activity" badge={<ButtonBadge />}>Inbox</Button></Stack>; }
