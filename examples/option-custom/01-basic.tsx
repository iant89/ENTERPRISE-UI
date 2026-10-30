import { OptionCustom, Select } from '@enterprise-ui/react';
export const title = 'Custom option content';
export default function Example() {
  return (
    <Select label="Country">
      <OptionCustom label="Germany" value="DE"><strong>Germany</strong></OptionCustom>
    </Select>
  );
}
