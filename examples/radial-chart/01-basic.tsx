import { RadialChart } from '@enterprise-ui/react';

export const title = 'Single percentages';
export const description = 'Exposed as a `meter` with a localized `aria-valuetext`. Use `tone` for status and `centerContent` for a custom number.';

export default function RadialChartBasic() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-end' }}>
      <RadialChart value={72} label="Budget used" showLabel size="lg" />
      <RadialChart value={94} label="On-time delivery" showLabel tone="success" />
      <RadialChart value={38} label="Capacity" showLabel tone="warning" />
      <RadialChart value={7} max={12} label="Audits completed" showLabel formatValue={(v, m) => `${v} of ${m}`} centerContent="7/12" />
      <RadialChart value={18} label="Defect rate" size="sm" tone="error" />
    </div>
  );
}
