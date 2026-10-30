import { Calendar } from '@enterprise-ui/react';

export const title = 'Inline calendar';
export const description = 'A standalone month grid for choosing a single date.';

export default function CalendarBasic() {
  return <Calendar defaultValue={new Date(2026, 9, 30)} />;
}
