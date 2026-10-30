import { Slider } from '@enterprise-ui/react';
export const title = 'Numeric slider';
export default function Example() {
  return <Slider label="Volume" defaultValue={40} min={0} max={100} />;
}
