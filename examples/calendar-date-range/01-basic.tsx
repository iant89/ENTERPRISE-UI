import { Calendar, CalendarDateRange } from '@enterprise-ui/react';
export const title = 'Inclusive range';
export default function Example() {
  return <Calendar defaultValue={new Date(2026, 9, 15)} locale="en-US"><CalendarDateRange startValue="2026-10-01" endValue="2026-10-03" /></Calendar>;
}
