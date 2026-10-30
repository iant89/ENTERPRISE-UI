import { DateRangePicker } from '@enterprise-ui/react';

export const title = 'Date range';
export const description = 'Start and end dates with quick presets.';

export default function DateRangePickerBasic() {
  return <DateRangePicker label="Posting period" defaultValue={{ start: '2026-10-01', end: '2026-10-31' }} />;
}
