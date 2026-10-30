import { DynamicDateRange } from '@enterprise-ui/react';

export const title = 'Dynamic date range';
export const description = 'Relative periods resolve to concrete dates; choose Custom range for explicit dates.';

export default function DynamicDateRangeBasic() {
  return <DynamicDateRange label="Posting date" defaultValue={{ option: 'last7Days', range: { start: '2026-10-24', end: '2026-10-30' } }} />;
}
