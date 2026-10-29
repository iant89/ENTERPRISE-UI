import { Info, RefreshCw } from 'lucide-react';
import { Button, IconButton, Stack, Tooltip } from '@enterprise-ui/react';

export const title = 'Tooltips';
export const description = 'Shown on hover and keyboard focus, dismissible with Escape and hoverable. Keep the text short and non-essential.';

export default function TooltipBasic() {
  return (
    <Stack direction="horizontal" gap={3} align="center">
      <Tooltip content="Refresh data (last sync 2 min ago)">
        <IconButton icon={<RefreshCw />} label="Refresh" hideTitle />
      </Tooltip>
      <Tooltip content="Net price after discounts" placement="right">
        <IconButton icon={<Info />} label="About net price" hideTitle />
      </Tooltip>
      <Tooltip content="Saves without submitting" placement="bottom">
        <Button>Save draft</Button>
      </Tooltip>
    </Stack>
  );
}
