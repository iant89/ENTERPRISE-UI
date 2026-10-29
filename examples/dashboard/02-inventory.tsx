import { useState } from 'react';
import { Button, Card, Dashboard, DashboardWidget, List, MetricCard } from '@enterprise-ui/react';
export const title = 'Inventory dashboard';
export const description = 'A mock inventory overview with an empty state and simulated refresh failure.';
const products = [{ id: 'P-101', title: 'Valve assembly', meta: '12 in stock' }, { id: 'P-102', title: 'Pressure sensor', meta: '4 in stock' }];
export default function InventoryDashboard() {
  const [showStock, setShowStock] = useState(true);
  const [error, setError] = useState(false);
  return <Dashboard title="Inventory overview" description="Mock warehouse data" actions={<><Button onClick={() => setShowStock((current) => !current)}>{showStock ? 'Show empty state' : 'Restore stock'}</Button><Button onClick={() => setError((current) => !current)}>{error ? 'Clear error' : 'Simulate refresh failure'}</Button></>}>
    {error && <DashboardWidget span="full"><p role="alert">Inventory refresh failed. Showing the last available data.</p></DashboardWidget>}
    <MetricCard title="Stocked products" value={showStock ? '2' : '0'} /><MetricCard title="Low stock" value={showStock ? '1' : '0'} />
    <DashboardWidget span={2}><Card title="Inventory" noPadding><List aria-label="Inventory items" items={showStock ? products : []} emptyState="No inventory items." /></Card></DashboardWidget>
  </Dashboard>;
}
