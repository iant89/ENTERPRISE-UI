import { ComboBox, ComboBoxItemCustom } from '@enterprise-ui/react';
export const title = 'Custom item content';
export default function Example() {
  return (
    <ComboBox label="Country">
      <ComboBoxItemCustom label="Germany" value="DE"><strong>Germany</strong></ComboBoxItemCustom>
    </ComboBox>
  );
}
