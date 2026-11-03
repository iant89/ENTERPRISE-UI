import { useState } from 'react';
import { RichTextEditor } from '@enterprise-ui/react';

export const title = 'Notes with formatting';
export const description = 'Bold, italic, underline, lists and links (Ctrl+K). Output is sanitized HTML; pasted content from Word or web pages is cleaned to the same allowlist.';

export default function RichTextEditorBasic() {
  const [html, setHtml] = useState('<p>Inspection found <strong>two worn seals</strong> on line 3.</p><ul><li>Replace seals</li><li>Re-test pressure</li></ul>');
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      <RichTextEditor label="Maintenance notes" value={html} onChange={setHtml} maxLength={500} placeholder="Describe what you found" />
      <details>
        <summary>Stored HTML</summary>
        <code style={{ whiteSpace: 'pre-wrap' }}>{html}</code>
      </details>
    </div>
  );
}
