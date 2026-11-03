import { DonutChart } from '@enterprise-ui/react';

export const title = 'Share of spend';
export const description = 'Legend entries carry the value and share, so identity never depends on color. Beyond `maxSegments` the smallest segments fold into “Other”.';

export default function DonutChartBasic() {
  return (
    <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      <DonutChart
        label="Indirect spend by category"
        data={[
          { label: 'IT services', value: 412 },
          { label: 'Facilities', value: 286 },
          { label: 'Travel', value: 174 },
          { label: 'Marketing', value: 133 },
          { label: 'Consulting', value: 98 },
          { label: 'Training', value: 41 },
          { label: 'Office supplies', value: 22 },
          { label: 'Other services', value: 15 },
        ]}
        centerLabel="Total spend"
        formatValue={(v) => `€${v}K`}
      />
      <DonutChart
        label="Invoices by payment status"
        variant="pie"
        data={[
          { label: 'Paid', value: 182, color: 'var(--eui-color-success)' },
          { label: 'Due', value: 46, color: 'var(--eui-color-warning)' },
          { label: 'Overdue', value: 12, color: 'var(--eui-color-error)' },
        ]}
        categoryLabel="Status"
        valueLabel="Invoices"
      />
    </div>
  );
}
