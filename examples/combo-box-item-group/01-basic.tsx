import { ComboBox, ComboBoxItem, ComboBoxItemGroup } from '@enterprise-ui/react';
export const title = 'Grouped items';
export default function Example() {
  return (
    <ComboBox label="Country">
      <ComboBoxItemGroup headerText="Europe">
        <ComboBoxItem label="Germany" value="DE" />
        <ComboBoxItem label="France" value="FR" />
      </ComboBoxItemGroup>
    </ComboBox>
  );
}
