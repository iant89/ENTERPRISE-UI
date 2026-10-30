import { CalendarLegend, CalendarLegendItem } from '@enterprise-ui/react';
export const title = 'Calendar legend';
export default function Example() { return <CalendarLegend aria-label="Date types"><CalendarLegendItem text="Available" tone="success" /><CalendarLegendItem text="Limited" tone="warning" /><CalendarLegendItem text="Unavailable" tone="error" /></CalendarLegend>; }
