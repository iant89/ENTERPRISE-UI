import { BarChart } from '@enterprise-ui/react';

export const title = 'Horizontal ranking with values';
export const description = 'Horizontal bars suit long names and rankings. Sort the data by value; `valueLabels` prints each value at the bar end.';

const suppliers = [
  { name: 'Northwind Components GmbH', spend: 1840 },
  { name: 'Contoso Industrial', spend: 1520 },
  { name: 'Fabrikam Metals', spend: 1210 },
  { name: 'Adventure Works Logistics', spend: 860 },
  { name: 'Tailspin Packaging', spend: 540 },
  { name: 'Litware Electronics', spend: 310 },
];

export default function BarChartRanking() {
  return (
    <BarChart
      label="Top suppliers by spend, year to date"
      data={suppliers}
      categoryKey="name"
      categoryLabel="Supplier"
      series={[{ key: 'spend', label: 'Spend (K EUR)' }]}
      layout="horizontal"
      valueLabels
      formatValue={(v) => `${v.toLocaleString()} K EUR`}
    />
  );
}
