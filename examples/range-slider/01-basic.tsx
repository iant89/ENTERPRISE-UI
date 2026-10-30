import { RangeSlider } from '@enterprise-ui/react';
export const title = 'Numeric interval';
export default function Example() {
  return <RangeSlider label="Price" defaultValue={[20, 80]} min={0} max={100} />;
}
