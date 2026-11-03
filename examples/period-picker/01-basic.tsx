import { useState } from 'react';
import { PeriodPicker, Stack, type Period } from '@enterprise-ui/react';

export const title = 'Months, quarters, fiscal periods and weeks';
export const description = 'Each picker reports a canonical value plus its start and end dates. The fiscal year here starts in April and is named after the year it ends in.';

const fmt = (p: Period | null) => (p ? `${p.value}: ${p.start.toLocaleDateString('en-GB')} – ${p.end.toLocaleDateString('en-GB')}` : 'none');

export default function PeriodPickerBasic() {
  const [last, setLast] = useState<Period | null>(null);
  return (
    <Stack gap={4} style={{ maxWidth: 320 }}>
      <PeriodPicker label="Posting month" defaultValue="2026-11" onChange={setLast} />
      <PeriodPicker label="Quarter" granularity="quarter" defaultValue="2026-Q4" onChange={setLast} />
      <PeriodPicker label="Fiscal period" granularity="fiscalPeriod" fiscalYearStartMonth={4} defaultValue="2027-P08" onChange={setLast} />
      <PeriodPicker label="Calendar week" granularity="week" defaultValue="2026-W45" onChange={setLast} />
      <PeriodPicker label="Year" granularity="year" defaultValue="2026" onChange={setLast} />
      <p style={{ margin: 0 }} aria-live="polite">Last chosen: {fmt(last)}</p>
    </Stack>
  );
}
