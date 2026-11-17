import { StatusHistory, Text, type StatusHistorySegment } from '@enterprise-ui/react';

export const title = 'Last 24 hours';
export const description = 'One segment per hour, oldest first, coloured by the worst status seen in it. Hover a segment for its period and status; hours without checks are dashed.';

const STATUSES: (StatusHistorySegment['status'])[] = [
  'success', 'success', 'success', 'success', 'success', 'warning', 'success', 'success', 'success', 'success', 'success', 'success',
  'success', 'error', 'error', 'warning', 'success', 'success', null, null, 'success', 'success', 'success', 'success',
];
const NAMES = { success: 'Healthy', warning: 'Degraded', error: 'Offline', information: 'Information', neutral: 'Unknown', disabled: 'Disabled' } as const;

const segments: StatusHistorySegment[] = STATUSES.map((status, hour) => ({
  id: hour,
  status,
  label: `${String(hour).padStart(2, '0')}:00–${String(hour + 1).padStart(2, '0')}:00: ${status ? NAMES[status] : 'no checks'}`,
}));

export default function StatusHistoryExample() {
  return (
    <div style={{ display: 'grid', gap: 8, maxWidth: '36rem' }}>
      <Text as="strong">Payments API</Text>
      <StatusHistory segments={segments} aria-label="Payments API, last 24 hours, oldest first" />
      <Text size="sm" tone="secondary">99.1% available · 3 changes · 2 hours without checks</Text>
    </div>
  );
}
