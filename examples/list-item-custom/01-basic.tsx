import { List, ListItemCustom } from '@enterprise-ui/react';
export const title = 'Custom row';
export default function Example() {
  return (
    <List aria-label="Materials">
      <ListItemCustom id="pump" text="Pump assembly"><strong>Pump assembly</strong></ListItemCustom>
    </List>
  );
}
