import { useState } from 'react';
import { DurationInput, Stack } from '@enterprise-ui/react';

export const title = 'Effort and durations';
export const description = 'Type naturally: “2h 30m”, “1.5h”, “1:45”, “90” (minutes) or “1d 2h”. With `hoursPerDay={8}` a day is a working day.';

export default function DurationInputBasic() {
  const [minutes, setMinutes] = useState<number | null>(150);
  return (
    <Stack gap={4} style={{ maxWidth: 320 }}>
      <DurationInput label="Planned effort" value={minutes} onChange={setMinutes} description={`Stored: ${minutes ?? '—'} minutes`} />
      <DurationInput label="Project estimate (working days)" hoursPerDay={8} defaultValue={8 * 60 * 3} />
    </Stack>
  );
}
