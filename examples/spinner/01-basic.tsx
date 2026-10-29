import { Spinner, Stack } from '@enterprise-ui/react';

export const title = 'Spinners';
export const description = 'Spinners are `role="status"` with an accessible label. Prefer skeletons for content placeholders.';

export default function SpinnerBasic() {
  return (
    <Stack direction="horizontal" gap={6} align="center">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <Spinner label="Loading orders…" showLabel />
    </Stack>
  );
}
