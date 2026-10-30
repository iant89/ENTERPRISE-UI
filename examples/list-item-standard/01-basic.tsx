import { List, ListItemStandard } from '@enterprise-ui/react';
export const title = 'Standard rows';
export default function Example() {
  return (
    <List aria-label="Materials">
      <ListItemStandard id="pump" text="Pump" description="Spare part" additionalText="12" highlight="critical" />
      <ListItemStandard id="valve" text="Valve" additionalText="In stock" highlight="positive" />
    </List>
  );
}
