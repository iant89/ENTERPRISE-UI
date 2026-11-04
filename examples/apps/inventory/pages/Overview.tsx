import { List, MetricCard, Dashboard, DashboardWidget, Page, StatusIndicator } from '@enterprise-ui/react';
import { currency } from '../../../data';
import { poTone, purchaseOrders } from '../data';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';

/** Key figures computed from the live product state. */
export function computeMetrics(products: { price: number; stock: number; status: string }[]) {
  const value = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  return {
    value,
    lowStock: products.filter((p) => p.status === 'Low stock').length,
    stockOuts: products.filter((p) => p.status === 'Out of stock').length,
    active: products.filter((p) => p.status !== 'Discontinued').length,
  };
}

export function Overview() {
  const { products, navigate, showProducts } = useInventory();
  const m = computeMetrics(products);
  const openPos = purchaseOrders.filter((p) => p.status === 'Submitted' || p.status === 'Approved');
  return (
    <Page title="Overview" subtitle="Inventory health across all plants" breadcrumbs={crumbs(navigate, 'Home')}>
      <Dashboard title="Key figures">
        <MetricCard title="Inventory value" value={(m.value / 1_000_000).toFixed(2)} unit="M USD" onClick={() => navigate('reports')} />
        <MetricCard title="Low-stock items" value={String(m.lowStock)} tone={m.lowStock ? 'warning' : 'success'} onClick={() => showProducts({ status: 'Low stock' })} />
        <MetricCard title="Stock-outs" value={String(m.stockOuts)} tone={m.stockOuts ? 'error' : 'success'} onClick={() => showProducts({ status: 'Out of stock' })} />
        <MetricCard title="Active products" value={String(m.active)} onClick={() => showProducts({})} />
        <DashboardWidget span={4}>
          <List
            header="Open purchase orders"
            onItemClick={() => navigate('orders')}
            items={openPos.map((o) => ({
              id: o.id, title: o.supplier, description: o.id, meta: currency(o.amount),
              trailing: <StatusIndicator tone={poTone[o.status]} size="sm">{o.status}</StatusIndicator>,
            }))}
          />
        </DashboardWidget>
      </Dashboard>
    </Page>
  );
}
