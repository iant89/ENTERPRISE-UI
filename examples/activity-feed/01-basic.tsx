import { useState } from 'react';
import { ActivityFeed, type ActivityEvent } from '@enterprise-ui/react';
const events: ActivityEvent[] = [
  { id: '1', type: 'comment', actor: 'Morgan Lee', timestamp: '2026-10-29T14:00:00Z', description: 'Supplier confirmed the delivery.', group: 'Purchase order 1042' },
  { id: '2', type: 'status', actor: 'Taylor Chen', timestamp: '2026-10-28T09:00:00Z', description: 'Order submitted for approval.', group: 'Purchase order 1042' },
];
export default function ActivityExample() {
  const [filter, setFilter] = useState('');
  return <ActivityFeed events={events.filter((event) => !filter || event.type === filter)} types={[{ value: 'comment', label: 'Comments' }, { value: 'status', label: 'Status changes' }]} typeFilter={filter} onTypeFilterChange={setFilter} />;
}
