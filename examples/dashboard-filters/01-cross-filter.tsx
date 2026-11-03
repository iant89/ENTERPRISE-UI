import { BarChart, DashboardFilterBar, DashboardFilterProvider, DonutChart, Grid, useDashboardFilters } from '@enterprise-ui/react';

export const title = 'Cross-filter and drill down';
export const description = 'Click a bar (or focus the chart, arrow to a bar and press Enter) to filter the other widget; click it again to clear. Selecting a donut segment drills from regions into countries. The bar shows tokens, the path back up and announces each change.';

const orders = [
  { region: 'EMEA', country: 'Germany', channel: 'Online', value: 220 },
  { region: 'EMEA', country: 'Germany', channel: 'Partner', value: 140 },
  { region: 'EMEA', country: 'France', channel: 'Online', value: 120 },
  { region: 'EMEA', country: 'France', channel: 'Partner', value: 170 },
  { region: 'Americas', country: 'USA', channel: 'Online', value: 410 },
  { region: 'Americas', country: 'USA', channel: 'Partner', value: 160 },
  { region: 'Americas', country: 'Brazil', channel: 'Online', value: 100 },
  { region: 'APJ', country: 'India', channel: 'Partner', value: 240 },
  { region: 'APJ', country: 'Japan', channel: 'Online', value: 190 },
];

const sum = (rows: typeof orders, key: 'region' | 'country' | 'channel') =>
  Object.entries(rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r[key]]: (acc[r[key]] ?? 0) + r.value }), {})).map(([label, value]) => ({ label, value }));

function Widgets() {
  const f = useDashboardFilters();
  const region = f.drillPath[0]?.value;
  const channel = f.valueOf('channel');
  // Each widget applies every filter except its own, so its own selection stays visible.
  const byChannel = orders.filter((o) => !region || o.region === region);
  const byGeo = orders.filter((o) => (!region || o.region === region) && (!channel || o.channel === channel));
  const geoKey = region ? 'country' : 'region';
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={4}>
      <BarChart
        label="Orders by channel, K EUR"
        data={sum(byChannel, 'channel').map((d) => ({ channel: d.label, value: d.value }))}
        categoryKey="channel"
        categoryLabel="Channel"
        series={[{ key: 'value', label: 'Orders' }]}
        selectedCategory={channel}
        onSelect={({ category }) => f.toggleFilter({ id: 'channel', name: 'Channel', value: category })}
        height={200}
      />
      <DonutChart
        label={region ? `Orders by country in ${region}` : 'Orders by region'}
        data={sum(byGeo, geoKey)}
        centerLabel={region ?? 'All regions'}
        onSelect={({ category }) => !region && f.drillDown({ level: 'region', name: 'Region', value: category })}
        height={200}
      />
    </Grid>
  );
}

export default function DashboardFiltersCrossFilter() {
  return (
    <DashboardFilterProvider>
      <div style={{ display: 'grid', gap: 16 }}>
        <DashboardFilterBar rootLabel="All regions" emptyText="No filters. Select a bar or a donut segment." />
        <Widgets />
      </div>
    </DashboardFilterProvider>
  );
}
