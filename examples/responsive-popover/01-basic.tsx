import { Button, ResponsivePopover } from '@enterprise-ui/react';
export const title = 'Popover or dialog';
export const description = 'Narrow viewports present the same content in a modal dialog.';
export default function Example() {
  return (
    <ResponsivePopover trigger={<Button>Order details</Button>} title="Order">
      <p>Purchase order 4500001234.</p>
    </ResponsivePopover>
  );
}
