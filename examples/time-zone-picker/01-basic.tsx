import { TimeZonePicker } from '@enterprise-ui/react';

export const title = 'Time zone';
export const description = 'Zones are listed by their current UTC offset (daylight saving time included) and found by city, region or offset.';

export default function TimeZonePickerBasic() {
  return (
    <div style={{ maxWidth: 420 }}>
      <TimeZonePicker label="Plant time zone" defaultValue="Europe/Berlin" />
    </div>
  );
}
