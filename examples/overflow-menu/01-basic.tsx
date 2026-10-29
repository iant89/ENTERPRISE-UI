import { useState } from 'react';
import { OverflowMenu } from '@enterprise-ui/react';
export default function Example() {
  const [action, setAction] = useState('None');
  return <><OverflowMenu items={[{ id: 'duplicate', label: 'Duplicate' }, { id: 'archive', label: 'Archive' }]} onAction={setAction} /><p>Last action: {action}</p></>;
}
