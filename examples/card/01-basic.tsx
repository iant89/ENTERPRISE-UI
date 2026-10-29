import { MoreHorizontal, Truck } from 'lucide-react';
import { Avatar, Button, Card, DropdownMenu, Grid, IconButton, ProgressBar, StatusIndicator, Stack } from '@enterprise-ui/react';

export const title = 'Cards';
export const description = 'Cards group information about one subject with an optional avatar, header actions and footer.';

export default function CardBasic() {
  return (
    <Grid columns={{ base: 1, md: 3 }} gap={4}>
      <Card title="Sales Overview" subtitle="October 2026">
        <p style={{ margin: 0 }}>Total revenue: $125,430</p>
      </Card>
      <Card
        title="Northwind Traders"
        subtitle="Preferred supplier"
        avatar={<Avatar name="Northwind Traders" shape="square" decorative />}
        headerActions={
          <DropdownMenu
            placement="bottom-end"
            items={[{ id: 'edit', label: 'Edit' }, { id: 'block', label: 'Block supplier', destructive: true }]}
            trigger={<IconButton icon={<MoreHorizontal />} label="Supplier actions" size="sm" />}
          />
        }
        footer={<Button size="sm" variant="tertiary">View supplier</Button>}
      >
        <Stack gap={2}>
          <StatusIndicator tone="success">Contract active</StatusIndicator>
          <ProgressBar label="Annual volume" value={68} />
        </Stack>
      </Card>
      <Card title="Shipment 8812" subtitle="Hamburg → Rotterdam" avatar={<Avatar icon={<Truck />} shape="square" accent={6} decorative />} onClick={() => {}} >
        <StatusIndicator tone="information">In transit · ETA tomorrow</StatusIndicator>
      </Card>
    </Grid>
  );
}
