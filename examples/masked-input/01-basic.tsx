import { useState } from 'react';
import { MaskedInput, Stack } from '@enterprise-ui/react';

export const title = 'Fixed formats';
export const description = 'The mask appears when a field gets focus. Typed characters replace the placeholder symbols, invalid characters are rejected, deleting keeps the other characters in place, and pasted text with or without separators is reformatted.';

export default function MaskedInputBasic() {
  const [iban, setIban] = useState({ raw: '', complete: false });
  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <MaskedInput label="IBAN (Germany)" mask="AA99 9999 9999 9999 9999 99" onChange={(raw, info) => setIban({ raw, complete: info.complete })} description={iban.raw ? `Raw value: ${iban.raw}${iban.complete ? ' (complete)' : ''}` : 'For example DE89 3704 0044 0532 0130 00'} />
      <MaskedInput label="Phone" mask="(999) 999 999999" inputMode="tel" description="Paste 555-333-123456 to see it reformatted." />
      <MaskedInput label="Product activation key" mask="VND-****-****-****" placeholderSymbol="#" description="The vendor prefix VND- is fixed. A custom placeholder symbol (#) marks empty positions." />
      <MaskedInput label="Batch code" mask="xxx-99" rules={{ x: /[a-e]/i }} letterCase="lower" description="A custom rule: only the letters a to e, then two digits." />
    </Stack>
  );
}
