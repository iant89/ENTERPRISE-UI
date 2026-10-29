import { RefreshCw } from 'lucide-react';
import { Button, Card, Dashboard, DashboardWidget, List, MetricCard, ProgressBar, Select, Stack, StatusIndicator } from '@enterprise-ui/react';
import { currency, orders, orderTone } from '../data';

export const title = 'Sales dashboard';
export const description = 'KPI tiles, cards and lists in a responsive grid; widgets span up to four columns and stack on phones.';

export default function DashboardBasic() {
  return (
    <Dashboard
      title="Sales performance"
      description="Company code 1000 · October 2026"
      actions={
        <>
          <div style={{ width: 160 }}>
            <Select aria-label="Period" size="sm" defaultValue="month" options={[{ value: 'week', label: 'This week' }, { value: 'month', label: 'This month' }, { value: 'quarter', label: 'This quarter' }]} />
          </div>
          <Button size="sm" icon={<RefreshCw />}>Refresh</Button>
        </>
      }
    >
      <MetricCard title="Revenue" value="1.24" unit="M USD" trend={{ direction: 'up', value: '+8.2%' }} sparkline={[8, 9, 7, 10, 11, 12]} />
      <MetricCard title="Orders" value="342" trend={{ direction: 'up', value: '+12' }} />
      <MetricCard title="Returns" value="1.8" unit="%" tone="success" trend={{ direction: 'down', value: '−0.3 pt', upIsGood: false }} />
      <MetricCard title="Overdue invoices" value="14" tone="error" trend={{ direction: 'up', value: '+4', upIsGood: false }} />
      <DashboardWidget span={2}>
        <Card title="Top customers" noPadding>
          <List items={orders.slice(0, 4).map((o) => ({ id: o.id, title: o.customer, meta: currency(o.amount), trailing: <StatusIndicator tone={orderTone[o.status]} size="sm">{o.status}</StatusIndicator> }))} />
        </Card>
      </DashboardWidget>
      <DashboardWidget span={2}>
        <Card title="Targets">
          <Stack gap={4}>
            <ProgressBar label="Revenue target" value={83} />
            <ProgressBar label="New customers" value={46} tone="warning" />
            <ProgressBar label="Margin" value={101} max={100} tone="success" />
          </Stack>
        </Card>
      </DashboardWidget>
    </Dashboard>
  );
}
