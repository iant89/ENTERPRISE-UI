import { Menu, MenuItem, MenuSeparator } from '@enterprise-ui/react';
export const title = 'Separator';
export default function Example() {
  return (
    <Menu aria-label="Document actions">
      <MenuItem id="edit" label="Edit" />
      <MenuSeparator />
      <MenuItem id="delete" label="Delete" destructive />
    </Menu>
  );
}
