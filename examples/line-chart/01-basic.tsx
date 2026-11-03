import { LineChart } from '@enterprise-ui/react';

export const title = 'Revenue trend';
export const description = 'Two series with direct end labels, a dashed target line and a crosshair tooltip. Focus the chart and use the arrow keys to step through months; “Show table” reveals the data.';

const revenue = [
  { month: 'Jan', actual: 1.12, plan: 1.1 },
  { month: 'Feb', actual: 1.08, plan: 1.12 },
  { month: 'Mar', actual: 1.24, plan: 1.15 },
  { month: 'Apr', actual: 1.31, plan: 1.18 },
  { month: 'May', actual: 1.27, plan: 1.2 },
  { month: 'Jun', actual: 1.42, plan: 1.24 },
  { month: 'Jul', actual: 1.38, plan: 1.26 },
  { month: 'Aug', actual: 1.51, plan: 1.3 },
  { month: 'Sep', actual: null, plan: 1.32 },
];

export default function LineChartBasic() {
  return (
    <LineChart
      label="Revenue by month, actual versus plan"
      description="Revenue has beaten plan for six consecutive months. September actuals are not yet closed."
      data={revenue}
      categoryKey="month"
      categoryLabel="Month"
      series={[
        { key: 'actual', label: 'Actual' },
        { key: 'plan', label: 'Plan' },
      ]}
      referenceLines={[{ value: 1.4, label: 'Stretch target', tone: 'success' }]}
      formatValue={(v) => `${v.toFixed(2)} M EUR`}
      includeZero={false}
    />
  );
}
