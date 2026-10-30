import { useState } from 'react';
import { PromptInput } from '@enterprise-ui/react';

export const title = 'Prompt input';
export const description = 'Enter sends, Shift+Enter adds a line; the application handles generation.';

export default function PromptInputBasic() {
  const [last, setLast] = useState('');
  return (
    <>
      <PromptInput
        label="Ask the assistant"
        placeholder="Describe what you need…"
        suggestions={['Summarize open invoices', 'Draft a supplier reminder']}
        footnote="AI-generated content may be inaccurate. Review before use."
        onSubmit={setLast}
      />
      {last && <p>Last prompt: {last}</p>}
    </>
  );
}
