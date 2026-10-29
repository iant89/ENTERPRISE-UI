import { useState } from 'react';
import {
  BarChart3, Boxes, FileText, Home, LifeBuoy, Package, Settings, ShoppingCart, Truck, Users, Plus, Download,
} from 'lucide-react';
import {
  AppShell, ApplicationHeader, Button, DataGrid, Dashboard, DashboardWidget, FilterBar, List, MetricCard, MultiSelect,
  NavigationGroup, NavigationItem, ObjectIdentifier, Page, SearchField, Select, SideNavigation, StatusIndicator,
  type DataGridColumn,
} from '@enterprise-ui/react';
import { categoryOptions, currency, orders, orderTone, products, statusTone, supplierOptions, type Product } from '../data';

const columns: DataGridColumn<Product>[] = [
  { id: 'name', header: 'Product', accessor: 'name', sortable: true, rowHeader: true, alwaysVisible: true, cell: (p) => <ObjectIdentifier title={p.name} text={p.sku} /> },
  { id: 'category', header: 'Category', accessor: 'category', sortable: true },
  { id: 'supplier', header: 'Supplier', accessor: 'supplier', sortable: true },
  { id: 'status', header: 'Status', accessor: 'status', cell: (p) => <StatusIndicator tone={statusTone[p.status]}>{p.status}</StatusIndicator> },
  { id: 'stock', header: 'Stock', accessor: 'stock', sortable: true, align: 'end' },
  { id: 'price', header: 'Price', accessor: 'price', sortable: true, align: 'end', cell: (p) => currency(p.price) },
];

export interface InventoryAppProps {
  /** Fill the viewport (true) or the parent element (false). */
  fullHeight?: boolean;
}

/** A complete inventory management screen built only from library components. */
export default function InventoryApp({ fullHeight = false }: InventoryAppProps) {
  const [page, setPage] = useState('products');
  const [categories, setCategories] = useState<string[]>([]);
  const [supplier, setSupplier] = useState<string | null>(null);
  const filtered = products.filter((p) => (categories.length === 0 || categories.includes(p.category)) && (!supplier || p.supplier === supplier));

  return (
    <AppShell
      fullHeight={fullHeight}
      header={
        <ApplicationHeader
          productName="Northwind"
          secondaryTitle="Inventory Management"
          logo={<Boxes color="var(--eui-color-primary)" />}
          search={<SearchField aria-label="Search everything" placeholder="Search products, orders, suppliers" size="sm" />}
          notificationCount={4}
          notifications={
            <List
              aria-label="Notifications"
              items={[
                { id: 'n1', title: 'Low stock: Dock Station D5', description: '2 minutes ago', trailing: <StatusIndicator tone="warning" size="sm">Low</StatusIndicator> },
                { id: 'n2', title: 'PO 4500012 approved', description: '1 hour ago' },
                { id: 'n3', title: 'Supplier price update', description: 'Yesterday' },
              ]}
            />
          }
          helpItems={[{ id: 'docs', label: 'Documentation' }, { id: 'shortcuts', label: 'Keyboard shortcuts' }, { type: 'separator' }, { id: 'support', label: 'Contact support' }]}
          onSettingsClick={() => {}}
          user={{ name: 'Ada Lovelace', email: 'ada@northwind.example' }}
          userMenuItems={[{ id: 'profile', label: 'My profile' }, { id: 'prefs', label: 'Preferences' }, { type: 'separator' }, { id: 'logout', label: 'Sign out' }]}
        />
      }
      navigation={
        <SideNavigation
          activeId={page}
          onNavigate={(id, event) => {
            event.preventDefault();
            setPage(id);
          }}
          footer={
            <>
              <NavigationItem id="settings" label="Settings" icon={<Settings />} />
              <NavigationItem id="help" label="Help" icon={<LifeBuoy />} />
            </>
          }
        >
          <NavigationItem id="home" label="Overview" icon={<Home />} />
          <NavigationGroup label="Inventory">
            <NavigationItem id="catalog" label="Catalog" icon={<Package />}>
              <NavigationItem id="products" label="Products" />
              <NavigationItem id="categories" label="Categories" />
            </NavigationItem>
            <NavigationItem id="stock" label="Stock movements" icon={<Truck />} badge={3} />
          </NavigationGroup>
          <NavigationGroup label="Purchasing">
            <NavigationItem id="orders" label="Purchase orders" icon={<ShoppingCart />} />
            <NavigationItem id="suppliers" label="Suppliers" icon={<Users />} />
            <NavigationItem id="invoices" label="Invoices" icon={<FileText />} />
          </NavigationGroup>
          <NavigationItem id="reports" label="Reports" icon={<BarChart3 />} />
        </SideNavigation>
      }
    >
      {page === 'home' ? (
        <Page title="Overview" subtitle="Inventory health across all plants" breadcrumbs={[{ label: 'Home' }]}>
          <Dashboard title="Key figures">
            <MetricCard title="Inventory value" value="4.82" unit="M USD" trend={{ direction: 'up', value: '+2.4%', label: 'vs. last month' }} sparkline={[4.2, 4.4, 4.3, 4.6, 4.7, 4.82]} />
            <MetricCard title="Low-stock items" value="9" tone="warning" trend={{ direction: 'up', value: '+3', upIsGood: false }} />
            <MetricCard title="Stock-outs" value="2" tone="error" />
            <MetricCard title="Turnover" value="6.1" unit="×/year" tone="success" trend={{ direction: 'up', value: '+0.4' }} />
            <DashboardWidget span={4}>
              <List
                header="Latest sales orders"
                items={orders.map((o) => ({ id: o.id, title: o.customer, description: o.id, meta: currency(o.amount), trailing: <StatusIndicator tone={orderTone[o.status]} size="sm">{o.status}</StatusIndicator> }))}
              />
            </DashboardWidget>
          </Dashboard>
        </Page>
      ) : (
        <Page
          title="Products"
          subtitle="Manage the product catalog, stock levels and prices."
          breadcrumbs={[{ label: 'Home', onClick: () => setPage('home') }, { label: 'Catalog' }, { label: 'Products' }]}
          actions={
            <>
              <Button icon={<Download />}>Export</Button>
              <Button variant="primary" icon={<Plus />}>Create product</Button>
            </>
          }
          toolbar={
            <FilterBar
              liveMode
              activeCount={categories.length + (supplier ? 1 : 0)}
              onClear={() => {
                setCategories([]);
                setSupplier(null);
              }}
            >
              <MultiSelect label="Category" options={categoryOptions} value={categories} onChange={setCategories} size="sm" />
              <Select label="Supplier" placeholder="All suppliers" options={supplierOptions} value={supplier} onChange={setSupplier} size="sm" />
            </FilterBar>
          }
        >
          <DataGrid title="Products" columns={columns} data={filtered} selectionMode="multiple" getRowLabel={(p) => p.name} pageSize={10} onRowClick={() => {}} />
        </Page>
      )}
    </AppShell>
  );
}
