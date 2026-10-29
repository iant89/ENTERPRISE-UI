import { Stack, Switch } from '@enterprise-ui/react';

export const title = 'Switches';
export const description = 'Use a switch for settings that take effect immediately.';

export default function SwitchBasic() {
  return (
    <Stack gap={1}>
      <Switch label="Email notifications" defaultChecked />
      <Switch label="Auto-approve orders under $500" description="Applies to your cost center only." />
      <Switch label="Show state text" showStateText defaultChecked />
      <Switch label="Two-factor authentication (managed by IT)" defaultChecked disabled />
    </Stack>
  );
}
