import { Menu, MenuItem, MenuItemGroup } from '@enterprise-ui/react';
export const title = 'Grouped actions';
export default function Example() {
  return (
    <Menu aria-label="Document actions">
      <MenuItemGroup headerText="Edit">
        <MenuItem id="rename" label="Rename" />
        <MenuItem id="duplicate" label="Duplicate" />
      </MenuItemGroup>
    </Menu>
  );
}
