import { ProportionBar } from '@enterprise-ui/react';

export const title = 'Part of a whole';
export const description = 'A single 100% bar with a legend that lists value and share. Use `tone` when segments represent states, the default categorical order when they are categories.';

export default function ProportionBarBasic() {
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 520 }}>
      <ProportionBar
        label="Purchase orders by delivery status"
        segments={[
          { label: 'Delivered', value: 412, tone: 'success' },
          { label: 'In transit', value: 136, tone: 'information' },
          { label: 'Delayed', value: 38, tone: 'warning' },
          { label: 'Cancelled', value: 9, tone: 'error' },
        ]}
      />
      <ProportionBar
        label="Storage used, 2 TB quota"
        segments={[
          { label: 'Documents', value: 640 },
          { label: 'Images', value: 410 },
          { label: 'Backups', value: 300 },
        ]}
        total={2048}
        formatValue={(v) => `${v} GB`}
        size="sm"
      />
    </div>
  );
}
