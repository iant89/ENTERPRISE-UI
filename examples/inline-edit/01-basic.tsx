import { useState } from 'react';
import { InlineEdit } from '@enterprise-ui/react';
export default function Example() {
  const [value, setValue] = useState('Office supplies');
  return <InlineEdit label="Description" value={value} validate={(next) => next.trim() ? undefined : 'Enter a description.'} onSave={async (next) => setValue(next)} />;
}
