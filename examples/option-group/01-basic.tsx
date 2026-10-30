import { Option, OptionGroup, Select } from '@enterprise-ui/react';
export const title = 'Grouped options';
export default function Example() {
  return (
    <Select label="Country">
      <OptionGroup headerText="Europe" headerAccessibleName="European countries">
        <Option label="Germany" value="DE" />
        <Option label="France" value="FR" />
      </OptionGroup>
    </Select>
  );
}
