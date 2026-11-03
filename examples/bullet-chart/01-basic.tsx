import { BulletChart } from '@enterprise-ui/react';

export const title = 'Actual versus target';
export const description = 'Qualitative `ranges` give context; the bar takes the status of the range its value falls in. The marker is the target and the lighter bar the forecast.';

const ranges = [
  { to: 60, tone: 'error' as const, label: 'Below plan' },
  { to: 90, tone: 'warning' as const, label: 'Near plan' },
  { to: 120, tone: 'success' as const, label: 'On plan' },
];

export default function BulletChartBasic() {
  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 420 }}>
      <BulletChart label="Revenue (M EUR)" value={97} target={100} forecast={108} max={120} ranges={ranges} />
      <BulletChart label="Order intake (M EUR)" value={72} target={100} forecast={85} max={120} ranges={ranges} />
      <BulletChart label="Gross margin (%)" value={41} target={38} max={50} formatValue={(v) => `${v}%`} />
      <BulletChart label="Utilization" value={54} target={75} max={100} ranges={ranges.map((r) => ({ ...r, to: (r.to / 120) * 100 }))} size="sm" />
    </div>
  );
}
