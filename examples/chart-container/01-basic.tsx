import { BarChart, ChartContainer, LineChart } from '@enterprise-ui/react';

export const title = 'Chart toolbar';
export const description = 'Switch between chart and table, hide the legend, download every chart inside as one CSV, or expand to full screen (Escape returns). The charts follow the toolbar automatically.';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const revenue = months.map((month, i) => ({ month, actual: [1.12, 1.08, 1.24, 1.31, 1.27, 1.42][i], plan: [1.1, 1.12, 1.15, 1.18, 1.2, 1.24][i] }));
const channels = [
  { region: 'EMEA', online: 420, partner: 310 },
  { region: 'Americas', online: 510, partner: 260 },
  { region: 'APJ', online: 290, partner: 340 },
];

export default function ChartContainerBasic() {
  return (
    <ChartContainer title="Sales performance" subtitle="First half year" downloadFileName="sales-performance-h1">
      <LineChart label="Revenue by month, M EUR" data={revenue} categoryKey="month" categoryLabel="Month" series={[{ key: 'actual', label: 'Actual' }, { key: 'plan', label: 'Plan' }]} includeZero={false} height={200} />
      <BarChart label="Orders by region and channel" data={channels} categoryKey="region" categoryLabel="Region" series={[{ key: 'online', label: 'Online' }, { key: 'partner', label: 'Partner' }]} height={200} />
    </ChartContainer>
  );
}
