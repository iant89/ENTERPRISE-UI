import { Bell } from 'lucide-react';
import { Badge, Stack } from '@enterprise-ui/react';

export const title = 'Badges and counters';
export const description = 'Badges label status or categories; `count` renders a counter that caps at `max`.';

export default function BadgeBasic() {
  return (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={2} wrap>
        <Badge>Draft</Badge>
        <Badge tone="information">New</Badge>
        <Badge tone="success">Paid</Badge>
        <Badge tone="warning">Overdue</Badge>
        <Badge tone="error">Blocked</Badge>
      </Stack>
      <Stack direction="horizontal" gap={2} wrap>
        <Badge solid tone="information" icon={<Bell />}>3 alerts</Badge>
        <Badge solid tone="success">Released</Badge>
        <Badge solid tone="error">Critical</Badge>
        <Badge count={7} tone="information" aria-label="7 new" />
        <Badge count={250} tone="error" aria-label="250 errors" />
      </Stack>
    </Stack>
  );
}
