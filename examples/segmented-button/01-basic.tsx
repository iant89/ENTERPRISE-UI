import { SegmentedButton } from '@enterprise-ui/react';

export const title = 'Segmented button';
export const description = 'Switch between closely related views or options.';

export default function SegmentedButtonBasic() {
  return (
    <SegmentedButton
      aria-label="Period"
      defaultValue={['week']}
      items={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]}
    />
  );
}
