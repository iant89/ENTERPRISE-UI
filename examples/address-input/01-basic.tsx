import { useState } from 'react';
import { AddressInput, type Address } from '@enterprise-ui/react';

export const title = 'Delivery address';
export const description = 'Field order, labels and the postal-code check follow the country (try United States or United Kingdom). Type “Jung” in the street field for a simulated lookup.';

const lookup = [
  { label: 'Jungfernstieg 1, 20095 Hamburg', address: { line1: 'Jungfernstieg 1', postalCode: '20095', city: 'Hamburg' } },
  { label: 'Jungfernstieg 7, 20354 Hamburg', address: { line1: 'Jungfernstieg 7', postalCode: '20354', city: 'Hamburg' } },
];

export default function AddressInputBasic() {
  const [address, setAddress] = useState<Address>({ country: 'DE', line1: '', line2: '', postalCode: '', city: '', region: '' });
  return (
    <div style={{ maxWidth: 560 }}>
      <AddressInput
        label="Delivery address"
        value={address}
        onChange={setAddress}
        required
        autoCompleteSection="shipping"
        locale="en"
        fetchSuggestions={async (text, country) => (country === 'DE' ? lookup.filter((s) => s.label.toLowerCase().startsWith(text.toLowerCase())) : [])}
      />
    </div>
  );
}
