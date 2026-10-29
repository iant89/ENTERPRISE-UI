import { Bell } from 'lucide-react';
import { Badge, Button, Checkbox, IconButton, Input, MessageStrip, Select, Stack, StatusIndicator, Switch, Tab, TabList, Tabs } from '@enterprise-ui/react';

/** A compact UI sample used to compare themes and densities. */
export function ThemeSample() {
  return (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={2} justify="space-between" align="center">
        <strong>Purchase order</strong>
        <Stack direction="horizontal" gap={1} align="center">
          <Badge tone="warning">Pending</Badge>
          <IconButton icon={<Bell />} label="Notifications" size="sm" />
        </Stack>
      </Stack>
      <Tabs defaultValue="general">
        <TabList aria-label="Sections">
          <Tab value="general">General</Tab>
          <Tab value="items" count={4}>Items</Tab>
        </TabList>
      </Tabs>
      <Input label="Supplier" defaultValue="Contoso Ltd" />
      <Select label="Priority" options={[{ value: 'h', label: 'High' }, { value: 'm', label: 'Medium' }]} defaultValue="h" />
      <Input label="Amount" defaultValue="-12" error="Amount must be positive." />
      <Stack direction="horizontal" gap={4} wrap>
        <Checkbox label="Urgent" defaultChecked />
        <Switch label="Notify" defaultChecked />
      </Stack>
      <Stack direction="horizontal" gap={3} wrap>
        <StatusIndicator tone="success">Approved</StatusIndicator>
        <StatusIndicator tone="error">Blocked</StatusIndicator>
      </Stack>
      <MessageStrip tone="information">Delivery expected Nov 14.</MessageStrip>
      <Stack direction="horizontal" gap={2} justify="flex-end">
        <Button variant="tertiary">Cancel</Button>
        <Button>Save draft</Button>
        <Button variant="primary">Submit</Button>
      </Stack>
    </Stack>
  );
}
