import { Button, Page } from '@enterprise-ui/react';
import { useInventory } from '../store';

export function NotFound() {
  const { navigate } = useInventory();
  return (
    <Page title="Page not found" subtitle="This page doesn't exist in Northwind Inventory.">
      <Button variant="primary" onClick={() => navigate('home')}>Go to Overview</Button>
    </Page>
  );
}
