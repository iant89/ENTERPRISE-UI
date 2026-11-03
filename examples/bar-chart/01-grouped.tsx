import { useState } from 'react';
import { BarChart, SegmentedButton } from '@enterprise-ui/react';

export const title = 'Grouped and stacked columns';
export const description = 'Several series are grouped side by side or, with `stacked`, summed into one column per category with the total in the tooltip and table.';

const orders = [
  { region: 'EMEA', online: 420, partner: 310, direct: 180 },
  { region: 'Americas', online: 510, partner: 260, direct: 220 },
  { region: 'APJ', online: 290, partner: 340, direct: 90 },
  { region: 'MEA', online: 120, partner: 80, direct: 40 },
];

export default function BarChartGrouped() {
  const [mode, setMode] = useState('grouped');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SegmentedButton
        aria-label="Bar layout"
        items={[{ value: 'grouped', label: 'Grouped' }, { value: 'stacked', label: 'Stacked' }]}
        value={[mode]}
        onChange={(v) => v[0] && setMode(v[0])}
      />
      <BarChart
        label="Orders by region and sales channel"
        data={orders}
        categoryKey="region"
        categoryLabel="Region"
        series={[
          { key: 'online', label: 'Online' },
          { key: 'partner', label: 'Partner' },
          { key: 'direct', label: 'Direct' },
        ]}
        stacked={mode === 'stacked'}
        referenceLines={mode === 'grouped' ? [{ value: 400, label: 'Channel target' }] : []}
      />
    </div>
  );
}
