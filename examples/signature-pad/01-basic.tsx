import { useState } from 'react';
import { SignaturePad, type SignatureValue } from '@enterprise-ui/react';

export const title = 'Approval signature';
export const description = 'Draw with a mouse, pen or finger, or choose Type for a keyboard-friendly typed signature. The value is a PNG data URL.';

export default function SignaturePadBasic() {
  const [value, setValue] = useState<SignatureValue | null>(null);
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
      <SignaturePad label="Signature of the approving manager" onChange={setValue} description="By signing you approve purchase order 4500017321." />
      {value?.dataUrl && <img src={value.dataUrl} alt={`Captured signature (${value.method === 'type' ? 'typed' : 'drawn'})`} style={{ maxWidth: 240, border: '1px solid var(--eui-color-border)' }} />}
    </div>
  );
}
