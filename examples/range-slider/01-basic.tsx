import { RangeSlider } from '@enterprise-ui/react';

export const title = 'Range slider';
export const description = 'Pick a start and end value; the thumbs cannot cross.';

export default function RangeSliderBasic() {
  return <RangeSlider label="Order value" min={0} max={5000} step={50} defaultValue={[500, 2500]} formatValue={(v) => `$${v}`} />;
}
