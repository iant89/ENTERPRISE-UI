import { Copy, Pencil, Share2, Trash2 } from 'lucide-react';
import { IconButton, Stack } from '@enterprise-ui/react';

export const title = 'Icon buttons';
export const description = 'Always pass `label`: it becomes the accessible name and the native tooltip.';

export default function IconButtonBasic() {
  return (
    <Stack direction="horizontal" gap={1}>
      <IconButton icon={<Pencil />} label="Edit" />
      <IconButton icon={<Copy />} label="Duplicate" />
      <IconButton icon={<Share2 />} label="Share" variant="secondary" />
      <IconButton icon={<Trash2 />} label="Delete" variant="destructive" />
      <IconButton icon={<Trash2 />} label="Delete (disabled)" disabled />
    </Stack>
  );
}
