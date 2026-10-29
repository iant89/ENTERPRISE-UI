import { Stack, TimePicker } from '@enterprise-ui/react';

export const title = 'Time picker';
export const description = 'Pick a suggested time or type freely: "9", "930", "9:30 pm" are normalised to HH:mm.';

export default function TimePickerBasic() {
  return (
    <Stack gap={4} style={{ maxWidth: 240 }}>
      <TimePicker label="Pickup time" defaultValue="09:30" step={15} minTime="07:00" maxTime="18:00" />
      <TimePicker label="Meeting (12-hour)" hour12 defaultValue="14:00" />
    </Stack>
  );
}
