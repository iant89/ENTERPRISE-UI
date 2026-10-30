import { Slider, Stack } from '@enterprise-ui/react';

export const title = 'Slider';
export const description = 'Choose a value from a range; show the value when precision matters.';

export default function SliderBasic() {
  return (
    <Stack gap={2}>
      <Slider label="Approval threshold" showValue defaultValue={40} formatValue={(v) => `${v}%`} />
      <Slider label="Disabled" defaultValue={60} disabled />
    </Stack>
  );
}
