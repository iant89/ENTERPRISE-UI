import { IconButton, Stack, CopyIcon, DeleteIcon, EditIcon, Share2Icon } from '@enterprise-ui/react';

export const title = 'Icon buttons';
export const description = 'Always pass `label`: it becomes the accessible name and the native tooltip.';

export default function IconButtonBasic() {
  return (
    <Stack direction="horizontal" gap={1}>
      <IconButton icon={<EditIcon />} label="Edit" />
      <IconButton icon={<CopyIcon />} label="Duplicate" />
      <IconButton icon={<Share2Icon />} label="Share" variant="secondary" />
      <IconButton icon={<DeleteIcon />} label="Delete" variant="destructive" />
      <IconButton icon={<DeleteIcon />} label="Delete (disabled)" disabled />
    </Stack>
  );
}
