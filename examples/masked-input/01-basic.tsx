import { useState } from 'react';
import { MaskedInput, Stack } from '@enterprise-ui/react';

export const title = 'Formatted identifiers';
export const description = 'Separators appear as you type, and pasted values with other separators are accepted. `9` is a digit, `A` a letter and `*` either.';

export default function MaskedInputBasic() {
  const [iban, setIban] = useState({ raw: '', complete: false });
  return (
    <Stack gap={4} style={{ maxWidth: 360 }}>
      <MaskedInput label="IBAN (Germany)" mask="AA99 9999 9999 9999 9999 99" onChange={(raw, info) => setIban({ raw, complete: info.complete })} description={iban.raw ? `Raw value: ${iban.raw}${iban.complete ? ' (complete)' : ''}` : 'For example DE89 3704 0044 0532 0130 00'} />
      <MaskedInput label="Phone" mask="+99 999 9999999" inputMode="tel" />
      <MaskedInput label="VAT number" mask="AA999999999" />
    </Stack>
  );
}
