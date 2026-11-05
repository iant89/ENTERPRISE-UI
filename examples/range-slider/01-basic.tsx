import { RangeSlider, Stack } from '@enterprise-ui/react';

export const title = 'Range slider';
export const description = 'Two handles on one track; the selected range is highlighted and the handles cannot cross. Add tick marks and labels to show the scale.';

export default function RangeSliderBasic() {
  return (
    <Stack gap={5} style={{ maxWidth: 420 }}>
      <RangeSlider label="Completion (%)" defaultValue={[25, 75]} tickInterval={25} showTickLabels />
      <RangeSlider label="Order value" min={0} max={5000} step={50} defaultValue={[1000, 3800]} formatValue={(v) => `$${v}`} />
    </Stack>
  );
}
