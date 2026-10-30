import { ComboBox, ComboBoxItem } from '@enterprise-ui/react';
export const title = 'Item value and additional text';
export default function Example() {
  return (
    <ComboBox label="Country">
      <ComboBoxItem label="Germany" value="DE" additionalText="EUR" />
      <ComboBoxItem label="France" value="FR" additionalText="EUR" />
    </ComboBox>
  );
}
