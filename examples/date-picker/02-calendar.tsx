import { Calendar } from '@enterprise-ui/react';

export const title = 'Calendar';
export const description = 'The calendar grid on its own. Arrow keys move by day/week, Page Up/Down by month, Shift + Page Up/Down by year.';

export default function CalendarExample() {
  return <Calendar defaultValue={new Date(2026, 9, 29)} locale="en-US" />;
}
