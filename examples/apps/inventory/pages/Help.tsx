import { Button, List, Page } from '@enterprise-ui/react';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';

export interface HelpProps {
  onShowShortcuts: () => void;
  onContactSupport: () => void;
}

export function Help({ onShowShortcuts, onContactSupport }: HelpProps) {
  const { navigate } = useInventory();
  return (
    <Page
      title="Help"
      subtitle="Guides and support for Northwind Inventory."
      breadcrumbs={crumbs(navigate, ['Home', 'home'], 'Help')}
      actions={
        <>
          <Button onClick={onShowShortcuts}>Keyboard shortcuts</Button>
          <Button variant="primary" onClick={onContactSupport}>Contact support</Button>
        </>
      }
    >
      <List
        header="Guides"
        dividers
        items={[
          { id: 'docs', title: 'Enterprise UI documentation', description: 'Components used to build this app', href: '#/' },
          { id: 'products', title: 'Managing products', description: 'Create, edit, export and bulk-update the catalog', href: '#/demo/products' },
          { id: 'orders', title: 'Purchasing', description: 'Approve and receive purchase orders', href: '#/demo/orders' },
          { id: 'reports', title: 'Reports', description: 'Stock value and movement charts', href: '#/demo/reports' },
        ]}
      />
    </Page>
  );
}
