import { Button, Stack } from '@enterprise-ui/react';

export const title = 'Variants';
export const description = 'Use one primary action per area. Secondary for alternatives, tertiary for low-emphasis actions, destructive for irreversible ones.';

export default function ButtonVariants() {
  return (
    <Stack direction="horizontal" gap={2} wrap>
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Save as Draft</Button>
      <Button variant="tertiary">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </Stack>
  );
}
