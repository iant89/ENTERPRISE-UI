import { LineChart } from '@enterprise-ui/react';

export const title = 'Area and loading state';
export const description = 'A single series with `area` keeps zero on the axis. `loading` shows a placeholder and an announced status.';

const tickets = Array.from({ length: 14 }, (_, i) => ({ day: `Nov ${i + 1}`, open: [42, 45, 51, 48, 56, 61, 58, 54, 49, 47, 52, 44, 41, 38][i] }));

export default function LineChartArea() {
  return (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      <LineChart label="Open service tickets, last 14 days" data={tickets} categoryKey="day" categoryLabel="Day" series={[{ key: 'open', label: 'Open tickets' }]} area height={200} />
      <LineChart label="Backlog" data={[]} categoryKey="day" series={[{ key: 'open', label: 'Open tickets' }]} loading height={200} />
    </div>
  );
}
