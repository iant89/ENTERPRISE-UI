import { Search } from 'lucide-react';
import { Input, InputIcon } from '@enterprise-ui/react';
export const title = 'Input action';
export default function Example() { return <Input label="Search" endAdornment={<InputIcon icon={<Search />} label="Search" onClick={() => {}} />} />; }
