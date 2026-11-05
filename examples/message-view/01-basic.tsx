import { useState } from 'react';
import { MessageView, type AppMessage } from '@enterprise-ui/react';

export const title = 'Message list';
export const description = 'Messages are ordered by severity, then time. Filters appear when there is more than one type; technical details stay collapsed. Messages with a field target are links that move focus to the field.';

const now = Date.UTC(2026, 10, 5, 9, 30);
const initial: AppMessage[] = [
  { id: '1', type: 'error', title: 'Enter a cost center.', subtitle: 'Cost center', scope: 'field', target: 'mv-cost-center', source: 'validation', timestamp: now, read: false },
  { id: '2', type: 'warning', title: 'The order exceeds the monthly budget.', description: 'It needs approval by your manager.', scope: 'global', source: 'api', code: 'BU/014', technicalDetails: 'HTTP 409 · request 7f3a-22c1', timestamp: now - 60_000, read: false },
  { id: '3', type: 'information', title: 'Delivery dates were recalculated.', scope: 'global', source: 'background', timestamp: now - 300_000, read: true },
  { id: '4', type: 'success', title: 'Draft saved.', scope: 'global', source: 'event', timestamp: now - 600_000, read: true },
];

export default function MessageViewBasic() {
  const [messages, setMessages] = useState(initial);
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      <label style={{ display: 'grid', gap: 4 }}>
        Cost center
        <input id="mv-cost-center" />
      </label>
      <MessageView messages={messages} onDismiss={(m) => setMessages((all) => all.filter((x) => x.id !== m.id))} onClearAll={() => setMessages([])} />
    </div>
  );
}
