import { useState } from 'react';
import { RecurrencePicker } from '@enterprise-ui/react';

export const title = 'Maintenance schedule';
export const description = 'Outputs an iCalendar RRULE for the scheduler and a readable summary for people.';

export default function RecurrencePickerBasic() {
  const [rrule, setRrule] = useState('FREQ=WEEKLY;BYDAY=MO');
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      <RecurrencePicker locale="en-US" onChange={(_, d) => setRrule(d.rrule)} />
      <code>{rrule || '(no repeat)'}</code>
    </div>
  );
}
