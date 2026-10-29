import { Badge, Button, Flex } from '@enterprise-ui/react';

export const title = 'Flex';
export const description = 'A thin flexbox wrapper with token-based gaps.';

export default function FlexBasic() {
  return (
    <Flex justify="space-between" align="center" gap={3} wrap style={{ padding: 12, border: '1px solid var(--eui-color-border)', borderRadius: 6 }}>
      <Flex gap={2} align="center">
        <strong>Purchase order 4500012</strong>
        <Badge tone="warning">Pending</Badge>
      </Flex>
      <Flex gap={2}>
        <Button>Reject</Button>
        <Button variant="primary">Approve</Button>
      </Flex>
    </Flex>
  );
}
