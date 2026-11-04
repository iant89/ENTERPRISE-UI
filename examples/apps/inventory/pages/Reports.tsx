import { BarChart, Dashboard, DashboardWidget, DonutChart, LineChart, Page } from '@enterprise-ui/react';
import { categoryOptions, currency, supplierOptions } from '../../../data';
import { stockMovements } from '../data';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';

export function Reports() {
  const { products, navigate } = useInventory();
  const byCategory = categoryOptions.map(({ value }) => {
    const list = products.filter((p) => p.category === value);
    return { category: value, units: list.reduce((s, p) => s + p.stock, 0), value: list.reduce((s, p) => s + p.stock * p.price, 0) };
  });
  const statuses = ['In stock', 'Low stock', 'Out of stock', 'Discontinued'];
  const byStatus = statuses.map((s) => ({ label: s, value: products.filter((p) => p.status === s).length })).filter((d) => d.value > 0);
  const bySupplier = supplierOptions.map(({ value }) => ({ supplier: value, products: products.filter((p) => p.supplier === value).length }));
  const days = [...new Set(stockMovements.map((m) => m.date))].sort();
  const flow = days.map((d) => ({
    day: d.slice(5),
    receipts: stockMovements.filter((m) => m.date === d && m.quantity > 0).reduce((s, m) => s + m.quantity, 0),
    issues: -stockMovements.filter((m) => m.date === d && m.quantity < 0).reduce((s, m) => s + m.quantity, 0),
  }));
  return (
    <Page title="Reports" subtitle="Stock value, status and movement trends from live catalog data." breadcrumbs={crumbs(navigate, ['Home', 'home'], 'Reports')}>
      <Dashboard title="Inventory reports">
        <DashboardWidget span={2}>
          <BarChart label="Stock value by category" categoryKey="category" data={byCategory} series={[{ key: 'value', label: 'Stock value' }]} formatValue={currency} />
        </DashboardWidget>
        <DashboardWidget span={2}>
          <DonutChart label="Products by status" data={byStatus} centerValue={String(products.length)} centerLabel="products" />
        </DashboardWidget>
        <DashboardWidget span={2}>
          <LineChart label="Daily stock flow" categoryKey="day" data={flow} series={[{ key: 'receipts', label: 'Receipts' }, { key: 'issues', label: 'Issues' }]} markers />
        </DashboardWidget>
        <DashboardWidget span={2}>
          <BarChart label="Products per supplier" categoryKey="supplier" layout="horizontal" data={bySupplier} series={[{ key: 'products', label: 'Products' }]} />
        </DashboardWidget>
      </Dashboard>
    </Page>
  );
}
