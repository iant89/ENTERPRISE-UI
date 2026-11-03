import { KpiStrip } from '@enterprise-ui/react';

export const title = 'Fulfilment KPIs';
export const description = 'A compact row of headline indicators that wraps on narrow screens. Trend direction is read as text, and `upIsGood: false` colors a rising backlog as bad. `tone` is backed by the target text, so status does not rely on color.';

export default function FulfilmentKpis() {
  return (
    <KpiStrip
      label="Fulfilment KPIs"
      items={[
        { id: 'otd', label: 'On-time delivery', value: '94.1', unit: '%', tone: 'warning', target: 'Target 96%', trend: { direction: 'down', value: '−1.2 pts', label: 'vs Sep' } },
        { id: 'open', label: 'Open orders', value: '1,284', sparkline: [980, 1020, 1100, 1180, 1240, 1284], trend: { direction: 'up', value: '+8%', upIsGood: false } },
        { id: 'cycle', label: 'Order cycle time', value: '2.4', unit: 'days', trend: { direction: 'down', value: '−0.3 d', upIsGood: false } },
        { id: 'fill', label: 'Fill rate', value: '98.7', unit: '%', tone: 'success', target: 'Target 98%' },
        { id: 'returns', label: 'Returns', value: '0.8', unit: '%', trend: { direction: 'flat', value: '0.0 pts' }, onClick: () => window.alert('Open the returns report') },
      ]}
    />
  );
}
