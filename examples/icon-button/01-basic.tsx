import { IconButton, Stack, Icon } from '@enterprise-ui/react';

export const title = 'Icon buttons';
export const description = 'Always pass `label`: it becomes the accessible name and the native tooltip.';

export default function IconButtonBasic() {
  return (
    <Stack direction="horizontal" gap={1}>
      <IconButton icon={<Icon name="edit" />} label="Edit" />
      <IconButton icon={<Icon name="copy" />} label="Duplicate" />
      <IconButton icon={<Icon name="share-2" />} label="Share" variant="secondary" />
      <IconButton icon={<Icon name="delete" />} label="Delete" variant="destructive" />
      <IconButton icon={<Icon name="delete" />} label="Delete (disabled)" disabled />
    </Stack>
  );
}
