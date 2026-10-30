import { SegmentedButton, SegmentedButtonItem } from '@enterprise-ui/react';
export const title = 'Single selection';
export default function Example() {
  return (
    <SegmentedButton accessibleName="Period" defaultValue="month">
      <SegmentedButtonItem id="day">Day</SegmentedButtonItem>
      <SegmentedButtonItem id="month">Month</SegmentedButtonItem>
      <SegmentedButtonItem id="year">Year</SegmentedButtonItem>
    </SegmentedButton>
  );
}
