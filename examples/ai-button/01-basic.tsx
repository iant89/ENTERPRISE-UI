import { useState } from 'react';
import { AIButton } from '@enterprise-ui/react';

export const title = 'AI button';
export const description = 'The application drives states such as Generate, Generating and Revise.';

export default function AIButtonBasic() {
  const [state, setState] = useState('generate');
  return (
    <AIButton
      states={[{ name: 'generate', label: 'Generate summary' }, { name: 'generating', label: 'Stop generating', busy: true }, { name: 'revise', label: 'Regenerate' }]}
      state={state}
      onClick={() => {
        if (state === 'generating') return setState('revise');
        setState('generating');
        window.setTimeout(() => setState((s) => (s === 'generating' ? 'revise' : s)), 1500);
      }}
    />
  );
}
