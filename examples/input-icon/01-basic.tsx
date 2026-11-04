import { Input, InputIcon, SearchIcon } from '@enterprise-ui/react';
export const title = 'Input action';
export default function Example() { return <Input label="Search" endAdornment={<InputIcon icon={<SearchIcon />} label="Search" onClick={() => {}} />} />; }
