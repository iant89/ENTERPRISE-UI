import { Check, FileText, Send, Truck } from 'lucide-react';
import { Card, Timeline } from '@enterprise-ui/react';

export const title = 'Approval history';
export const description = 'A chronological list (`<ol>`) of events with tone-coloured markers.';

export default function TimelineBasic() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Timeline
        locale="en-US"
        items={[
          { id: '1', title: 'Purchase order created', timestamp: new Date(2026, 9, 20, 9, 14), description: 'by Ada Lovelace', icon: <FileText /> },
          { id: '2', title: 'Submitted for approval', timestamp: new Date(2026, 9, 20, 9, 30), icon: <Send />, tone: 'information' },
          {
            id: '3', title: 'Approved by Grace Hopper', timestamp: new Date(2026, 9, 21, 16, 2), icon: <Check />, tone: 'success',
            content: <Card flat>“Approved — please consolidate with PO 4500011 next time.”</Card>,
          },
          { id: '4', title: 'Delivery delayed', timestamp: new Date(2026, 9, 24, 11, 45), description: 'Carrier reported a 2-day delay.', icon: <Truck />, tone: 'warning' },
        ]}
      />
    </div>
  );
}
