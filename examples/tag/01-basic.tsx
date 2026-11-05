import { Stack, Tag } from '@enterprise-ui/react';

export const title = 'Color schemes';
export const description = 'Ten non-semantic color schemes in two sets: solid (set 1) and light (set 2). The shell bar uses set 2 to mark trial (7), productive (10) and non-productive (8) systems.';

export default function TagBasic() {
  const schemes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
  return (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={2} wrap>{schemes.map((s) => <Tag key={s} colorScheme={s}>Scheme {s}</Tag>)}</Stack>
      <Stack direction="horizontal" gap={2} wrap>{schemes.map((s) => <Tag key={s} colorScheme={s} set={2}>Scheme {s}</Tag>)}</Stack>
    </Stack>
  );
}
