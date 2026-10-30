import { useState } from 'react';
import { FilterTokenGroup } from '@enterprise-ui/react';

export const title = 'Applied filters';
export const description = 'Remove filters one at a time or all at once.';

const initial = [
  { id: 'status', name: 'Status', value: 'Open' },
  { id: 'plant', name: 'Plant', value: 'Hamburg' },
];

export default function FilterTokenBasic() {
  const [tokens, setTokens] = useState(initial);
  return <FilterTokenGroup tokens={tokens} onRemove={(id) => setTokens((all) => all.filter((t) => t.id !== id))} onClear={() => setTokens([])} />;
}
