import { Icon, IconProvider, Stack } from '@enterprise-ui/react';

export const title = 'Named icons';
export const description = 'Look an icon up by name, sap-icon:// URI or font code point, or pass an element from IconProvider.getIcon.';

export default function Example() {
  return (
    <Stack direction="horizontal" gap={3} align="center" style={{ fontSize: 24 }}>
      <Icon name="bar-code" label="Barcode" />
      <Icon name="sap-icon://bell" label="Notifications" />
      <Icon name="&#xe08d;" label="Barcode (code point)" />
      <Icon label="Settings">{IconProvider.getIcon('settings', { color: 'var(--eui-color-primary)' })}</Icon>
    </Stack>
  );
}
