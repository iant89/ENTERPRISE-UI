import { useState } from 'react';
import { AmountInput, QuantityInput, Stack } from '@enterprise-ui/react';

export const title = 'Amounts and quantities';
export const description = 'Type in your locale: German input accepts 1.234,56. Amounts round to the currency (JPY has no decimals, KWD three); quantities use the unit’s decimals. Ambiguous input such as “1.5” in German is rejected instead of guessed.';

export default function AmountInputBasic() {
  const [amount, setAmount] = useState<number | null>(1234.5);
  const [currency, setCurrency] = useState('EUR');
  const [qty, setQty] = useState<number | null>(12);
  return (
    <Stack gap={4} style={{ maxWidth: 360 }}>
      <AmountInput label="Net amount (German format)" locale="de-DE" value={amount} onChange={setAmount} currency={currency} onCurrencyChange={setCurrency} currencies={['EUR', 'USD', 'JPY', 'KWD']} description={`Stored value: ${amount ?? '—'} ${currency}`} />
      <AmountInput label="Credit limit" locale="en-US" defaultValue={250000} defaultCurrency="USD" min={0} max={1000000} />
      <QuantityInput label="Order quantity" locale="en-US" value={qty} onChange={setQty} units={[{ code: 'PC', label: 'Piece', decimals: 0 }, { code: 'KG', label: 'Kilogram', decimals: 3 }, { code: 'M', label: 'Meter', decimals: 2 }]} />
    </Stack>
  );
}
