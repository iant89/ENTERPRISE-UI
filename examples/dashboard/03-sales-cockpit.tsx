import { useState } from 'react';
import {
  BarChart, Dashboard, DashboardCard, DashboardFilterBar, DashboardFilterProvider, DashboardWidget, DonutChart, LineChart, MetricCard,
  RefreshControl, useDashboardFilters,
} from '@enterprise-ui/react';

export const title = 'Sales cockpit';
export const description = 'Global refresh and auto-refresh, cross-filtering (click a region or channel), chart tools on each card and standard widget states. The pipeline card simulates an outage; Retry recovers it.';

const regions = ['EMEA', 'Americas', 'APJ'];
const channels = ['Online', 'Partner', 'Direct'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

/** Deterministic mock data that shifts a little on every refresh. */
function load(seed: number) {
  const n = (i: number) => ((Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1 + 1) % 1;
  const orders = regions.flatMap((region, r) => channels.map((channel, c) => ({ region, channel, value: Math.round(80 + n(r * 3 + c) * 320) })));
  const trend = months.map((month, i) => ({ month, revenue: +(1 + i * 0.06 + n(i + 20) * 0.15).toFixed(2), plan: +(1.05 + i * 0.05).toFixed(2) }));
  return { orders, trend };
}

function Cockpit() {
  const f = useDashboardFilters();
  const [seed, setSeed] = useState(1);
  const [updated, setUpdated] = useState(() => Date.now());
  const [failed, setFailed] = useState(true);
  const { orders, trend } = load(seed);
  const region = f.valueOf('region');
  const channel = f.valueOf('channel');
  const total = (rows: typeof orders) => rows.reduce((s, o) => s + o.value, 0);
  const visible = orders.filter((o) => (!region || o.region === region) && (!channel || o.channel === channel));

  const refresh = () =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        setSeed((s) => s + 1);
        setUpdated(Date.now());
        resolve();
      }, 600),
    );

  return (
    <Dashboard
      title="Sales cockpit"
      description="Mock data · all amounts in K EUR"
      actions={<RefreshControl onRefresh={refresh} lastUpdated={updated} />}
      filters={<DashboardFilterBar emptyText="Select a region or channel in a chart to filter the whole dashboard." />}
    >
      <MetricCard title="Order value" value={total(visible).toLocaleString()} unit="K EUR" trend={{ direction: 'up', value: '+6.1%', label: 'vs. last month' }} />
      <MetricCard title="Orders" value={String(Math.round(total(visible) / 3.4))} trend={{ direction: 'up', value: '+2.4%' }} />
      <MetricCard title="Avg. order" value="3.4" unit="K EUR" trend={{ direction: 'flat', value: '±0' }} />
      <MetricCard title="Win rate" value="31" unit="%" tone="warning" trend={{ direction: 'down', value: '−1.2 pt', upIsGood: true }} />

      <DashboardWidget span={2}>
        <DashboardCard title="Orders by region" subtitle={channel ? `Channel: ${channel}` : 'All channels'} lastUpdated={updated} chartTools>
          <BarChart
            label="Orders by region, K EUR"
            data={regions.map((r) => ({ region: r, value: total(orders.filter((o) => o.region === r && (!channel || o.channel === channel))) }))}
            categoryKey="region"
            categoryLabel="Region"
            series={[{ key: 'value', label: 'Order value' }]}
            selectedCategory={region}
            onSelect={({ category }) => f.toggleFilter({ id: 'region', name: 'Region', value: category })}
            valueLabels
            height={220}
          />
        </DashboardCard>
      </DashboardWidget>
      <DashboardWidget span={2}>
        <DashboardCard title="Orders by channel" subtitle={region ? `Region: ${region}` : 'All regions'} lastUpdated={updated} chartTools>
          <DonutChart
            label="Orders by channel, K EUR"
            data={channels.map((c) => ({ label: c, value: total(orders.filter((o) => o.channel === c && (!region || o.region === region))) }))}
            selectedCategory={channel}
            onSelect={({ category }) => f.toggleFilter({ id: 'channel', name: 'Channel', value: category })}
            centerLabel="K EUR"
            height={220}
          />
        </DashboardCard>
      </DashboardWidget>
      <DashboardWidget span={2}>
        <DashboardCard title="Revenue trend" subtitle="M EUR, actual versus plan" lastUpdated={updated} staleAfter={60 * 60_000} chartTools={{ fullscreen: true, download: true, view: true, legend: false }}>
          <LineChart label="Revenue by month" data={trend} categoryKey="month" categoryLabel="Month" series={[{ key: 'revenue', label: 'Actual' }, { key: 'plan', label: 'Plan' }]} includeZero={false} height={220} />
        </DashboardCard>
      </DashboardWidget>
      <DashboardWidget span={2}>
        <DashboardCard title="Pipeline by stage" status={failed ? 'error' : 'ready'} error="The CRM service is unavailable." onRetry={() => setFailed(false)} lastUpdated={updated} chartTools>
          <BarChart label="Pipeline by stage, K EUR" data={[{ stage: 'Lead', v: 1240 }, { stage: 'Qualified', v: 890 }, { stage: 'Proposal', v: 455 }, { stage: 'Won', v: 210 }]} categoryKey="stage" categoryLabel="Stage" series={[{ key: 'v', label: 'Pipeline' }]} layout="horizontal" valueLabels height={220} />
        </DashboardCard>
      </DashboardWidget>
    </Dashboard>
  );
}

export default function SalesCockpit() {
  return (
    <DashboardFilterProvider>
      <Cockpit />
    </DashboardFilterProvider>
  );
}
