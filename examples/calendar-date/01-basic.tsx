import { Calendar, CalendarDate } from '@enterprise-ui/react';
export const title = 'Selected day';
export default function Example() {
  return <Calendar defaultValue={new Date(2026, 9, 15)} locale="en-US"><CalendarDate value="2026-10-20" /></Calendar>;
}
