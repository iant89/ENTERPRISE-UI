import { StatusHistory, type StatusHistoryItem } from '@enterprise-ui/react';

export const title = 'Service uptime, last 30 days';
export const description = 'Tab to the strip, then use the arrow keys, Home and End; hover or tap on touch screens. Each block is read as "date: status", and outages are taller blocks so status does not depend on color alone.';

const day = (offset: number) => new Date(Date.UTC(2026, 9, 5 + offset)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const incidents: Record<number, Pick<StatusHistoryItem, 'status' | 'description'>> = {
  6: { status: 'warning', description: 'Slow responses for 25 min' },
  13: { status: 'error', description: 'Down 42 min, database failover' },
  14: { status: 'warning', description: 'Elevated error rate for 10 min' },
  21: { status: 'information', description: 'Planned maintenance 02:00–02:30 UTC' },
};

const items: StatusHistoryItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i),
  label: day(i),
  ...(incidents[i] ?? { status: 'success', description: 'No incidents' }),
}));

export default function Uptime() {
  return <StatusHistory label="Order API uptime, last 30 days" title="Order API" summary="99.89% uptime" items={items} />;
}
