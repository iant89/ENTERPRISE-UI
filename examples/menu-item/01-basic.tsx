import { Menu, MenuItem } from '@enterprise-ui/react';
export const title = 'Menu action';
export default function Example() {
  return (
    <Menu aria-label="Document actions">
      <MenuItem id="edit" label="Edit" />
      <MenuItem id="delete" label="Delete" destructive />
    </Menu>
  );
}
