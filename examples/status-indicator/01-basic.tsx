import { Stack, StatusIndicator } from '@enterprise-ui/react';

export const title = 'Object status';
export const description = 'Status is always shown as text plus icon and colour, so it never relies on colour alone (WCAG 1.4.1).';

export default function StatusIndicatorBasic() {
  return (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={5} wrap>
        <StatusIndicator tone="success">Approved</StatusIndicator>
        <StatusIndicator tone="warning">Pending approval</StatusIndicator>
        <StatusIndicator tone="error">Rejected</StatusIndicator>
        <StatusIndicator tone="information">In process</StatusIndicator>
        <StatusIndicator>Draft</StatusIndicator>
      </Stack>
      <Stack direction="horizontal" gap={5} wrap>
        <StatusIndicator tone="success" indicator="dot">Online</StatusIndicator>
        <StatusIndicator tone="error" indicator="dot">Offline</StatusIndicator>
      </Stack>
      <Stack direction="horizontal" gap={2} wrap>
        <StatusIndicator tone="success" inverted>Released</StatusIndicator>
        <StatusIndicator tone="warning" inverted>Expiring</StatusIndicator>
        <StatusIndicator tone="error" inverted>Blocked</StatusIndicator>
        <StatusIndicator tone="information" inverted>New</StatusIndicator>
      </Stack>
    </Stack>
  );
}
