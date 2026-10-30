import { Calendar, SpecialCalendarDate } from '@enterprise-ui/react';
export const title = 'Labelled special day';
export default function Example() {
  return <Calendar defaultValue={new Date(2026, 9, 15)} locale="en-US"><SpecialCalendarDate value="2026-10-31" type="warning" label="Month end" /></Calendar>;
}
