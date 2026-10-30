import { List, ListItemGroup, ListItemStandard } from '@enterprise-ui/react';
export const title = 'Grouped rows';
export default function Example() {
  return (
    <List aria-label="Materials">
      <ListItemGroup headerText="Open">
        <ListItemStandard id="pump" text="Pump" />
      </ListItemGroup>
      <ListItemGroup headerText="Closed">
        <ListItemStandard id="valve" text="Valve" />
      </ListItemGroup>
    </List>
  );
}
