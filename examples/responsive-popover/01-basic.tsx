import { Button, ResponsivePopover, Switch, Stack } from '@enterprise-ui/react';

export const title = 'Responsive popover';
export const description = 'A popover on desktop and tablet, a full-screen dialog on phones.';

export default function ResponsivePopoverBasic() {
  return (
    <ResponsivePopover title="Display settings" trigger={<Button>Display settings</Button>}>
      <Stack gap={1}>
        <Switch label="Compact rows" />
        <Switch label="Show totals" defaultChecked />
      </Stack>
    </ResponsivePopover>
  );
}
