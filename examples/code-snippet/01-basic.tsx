import { CodeSnippet } from '@enterprise-ui/react';

export const title = 'Integration settings';
export const description = 'Blocks get a copy button, optional line numbers and “Show more” for long content; the inline variant suits keys and commands. No syntax highlighting is applied.';

const payload = `{
  "purchaseOrder": "4500017321",
  "supplier": "100045",
  "items": [
    { "material": "MAT-1001", "quantity": 4, "unit": "PC" },
    { "material": "MAT-2040", "quantity": 10, "unit": "PC" }
  ],
  "currency": "EUR",
  "requestedDelivery": "2026-12-12"
}`;

export default function CodeSnippetBasic() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <CodeSnippet code={payload} language="JSON" lineNumbers maxLines={6} label="Example request body" />
      <p style={{ margin: 0 }}>
        Client ID: <CodeSnippet variant="inline" code="eui-procurement-prod" />
      </p>
    </div>
  );
}
