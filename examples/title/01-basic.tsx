import { Stack, Title } from '@enterprise-ui/react';

export const title = 'Titles';
export const description = 'Pick the level for document structure and the size for visual hierarchy.';

export default function TitleBasic() {
  return (
    <Stack gap={1}>
      <Title level={2}>Purchase orders</Title>
      <Title level={3}>Line items</Title>
      <Title level={4} size="xs">Compact section heading</Title>
    </Stack>
  );
}
