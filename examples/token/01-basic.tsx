import { useState } from 'react';
import { Tokenizer } from '@enterprise-ui/react';

export const title = 'Tokens';
export const description = 'A keyboard-navigable list of removable values.';

export default function TokenBasic() {
  const [tokens, setTokens] = useState([
    { id: '1', text: 'Hamburg' },
    { id: '2', text: 'Walldorf' },
    { id: '3', text: 'Palo Alto', readOnly: true },
  ]);
  return <Tokenizer aria-label="Plants" tokens={tokens} onTokenDelete={(id) => setTokens((all) => all.filter((t) => t.id !== id))} />;
}
