import { PackageSearch, Plus } from 'lucide-react';
import { Button, Card, EmptyState, Grid } from '@enterprise-ui/react';

export const title = 'Empty states';
export const description = 'Explain why there is no content and offer the next step.';

export default function EmptyStateBasic() {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={4}>
      <Card>
        <EmptyState title="No purchase orders yet" description="Create your first purchase order to start tracking deliveries." actions={<Button variant="primary" icon={<Plus />}>Create order</Button>} headingLevel={3} />
      </Card>
      <Card>
        <EmptyState size="sm" icon={<PackageSearch />} title="No results" description="No products match “usb-d hub”. Check the spelling or clear filters." actions={<Button size="sm">Clear filters</Button>} headingLevel={3} />
      </Card>
    </Grid>
  );
}
