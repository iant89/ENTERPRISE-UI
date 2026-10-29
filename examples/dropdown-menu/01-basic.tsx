import { ChevronDown, MoreVertical } from 'lucide-react';
import { Button, DropdownMenu, IconButton, Stack, useToast } from '@enterprise-ui/react';

export const title = 'Dropdown menus';
export const description = 'Open with click, Enter, Space or ↓ (↑ focuses the last item). Escape closes and returns focus to the trigger.';

export default function DropdownMenuBasic() {
  const toast = useToast();
  return (
    <Stack direction="horizontal" gap={2}>
      <DropdownMenu
        trigger={<Button iconEnd={<ChevronDown />}>Export</Button>}
        onAction={(id) => toast.show({ title: `Exporting as ${id.toUpperCase()}` })}
        items={[{ id: 'xlsx', label: 'Spreadsheet (.xlsx)' }, { id: 'csv', label: 'CSV' }, { id: 'pdf', label: 'PDF' }]}
      />
      <DropdownMenu
        placement="bottom-end"
        trigger={<IconButton icon={<MoreVertical />} label="More actions" />}
        items={[{ id: 'pin', label: 'Pin to dashboard' }, { id: 'subscribe', label: 'Subscribe' }, { type: 'separator' }, { id: 'remove', label: 'Remove', destructive: true }]}
      />
    </Stack>
  );
}
