import { IconButton, Stack, IconProvider } from '@enterprise-ui/react';

export const title = 'Icon buttons';
export const description = 'Always pass `label`: it becomes the accessible name and the native tooltip.';

export default function IconButtonBasic() {
  return (
    <Stack direction="horizontal" gap={1}>
      <IconButton icon={IconProvider.getIcon('edit')} label="Edit" />
      <IconButton icon={IconProvider.getIcon('copy')} label="Duplicate" />
      <IconButton icon={IconProvider.getIcon('share-2')} label="Share" variant="secondary" />
      <IconButton icon={IconProvider.getIcon('delete')} label="Delete" variant="destructive" />
      <IconButton icon={IconProvider.getIcon('delete')} label="Delete (disabled)" disabled />
    </Stack>
  );
}
