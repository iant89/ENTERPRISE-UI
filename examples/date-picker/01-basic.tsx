import { useState } from 'react';
import { DatePicker, Stack } from '@enterprise-ui/react';

export const title = 'Date picker';
export const description = 'Type an ISO date or open the calendar (Alt + ↓). Dates outside `min`/`max` and weekends here are disabled.';

export default function DatePickerBasic() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 10, 3));
  return (
    <Stack gap={4} style={{ maxWidth: 280 }}>
      <DatePicker
        label="Requested delivery"
        value={date}
        onChange={setDate}
        min={new Date(2026, 9, 1)}
        isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
        description="Business days only."
      />
      <DatePicker label="Posting date" error="Posting period is closed." defaultValue={new Date(2026, 8, 30)} />
      <DatePicker label="Created on" defaultValue={new Date(2026, 9, 1)} disabled />
    </Stack>
  );
}
