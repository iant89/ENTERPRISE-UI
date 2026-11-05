import { Input, InputIcon, IconProvider } from '@enterprise-ui/react';
export const title = 'Input action';
export default function Example() { return <Input label="Search" endAdornment={<InputIcon icon={IconProvider.getIcon('search')} label="Search" onClick={() => {}} />} />; }
