import { SlidersHorizontal } from 'lucide-react';
import { Button, Checkbox, Popover, Stack } from '@enterprise-ui/react';

export const title = 'Popover';
export const description = 'A non-modal dialog anchored to its trigger: focus moves in, and Escape or clicking outside returns focus.';

export default function PopoverBasic() {
  return (
    <Popover
      title="Table settings"
      trigger={<Button icon={<SlidersHorizontal />}>Settings</Button>}
      width="18rem"
    >
      {(close) => (
        <Stack gap={2}>
          <Checkbox label="Show totals" defaultChecked />
          <Checkbox label="Group by supplier" />
          <Checkbox label="Wrap long text" />
          <Stack direction="horizontal" justify="flex-end" gap={2}>
            <Button size="sm" variant="primary" onClick={close}>Apply</Button>
          </Stack>
        </Stack>
      )}
    </Popover>
  );
}
