import { Option, Select } from '@enterprise-ui/react';
export const title = 'Select option';
export default function Example() {
  return (
    <Select label="Country">
      <Option label="Germany" value="DE" additionalText="EUR" />
      <Option label="France" value="FR" disabled />
    </Select>
  );
}
