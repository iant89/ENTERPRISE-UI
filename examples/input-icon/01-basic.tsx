import { Input, InputIcon, Icon } from '@enterprise-ui/react';
export const title = 'Input action';
export default function Example() { return <Input label="Search" endAdornment={<InputIcon icon={<Icon name="search" />} label="Search" onClick={() => {}} />} />; }
