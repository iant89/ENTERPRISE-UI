import { Stack, Text } from '@enterprise-ui/react';

export const title = 'Text';
export const description = 'Body copy with tone, size and line clamping.';

export default function TextBasic() {
  return (
    <Stack gap={1}>
      <Text as="p">Standard body text for descriptions and values.</Text>
      <Text as="p" tone="secondary" size="sm">Secondary supporting text.</Text>
      <Text as="p" maxLines={2} style={{ maxWidth: 280 }}>
        A long description that is clamped to two lines. The full text remains available to assistive technology and copy and paste.
      </Text>
      <Text emptyIndicator="—">{''}</Text>
    </Stack>
  );
}
