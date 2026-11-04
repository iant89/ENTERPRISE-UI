import { useState } from 'react';
import { BarcodeScannerButton, Input, Stack } from '@enterprise-ui/react';

export const title = 'Scan into a field';
export const description = 'An icon-only button with the SAP bar-code icon. It opens the barcode scanner dialog and writes the result into the field.';

export default function BarcodeScannerButtonBasic() {
  const [material, setMaterial] = useState('');
  return (
    <Stack direction="horizontal" gap={2} align="end">
      <Input label="Material number" value={material} onChange={(e) => setMaterial(e.target.value)} />
      <BarcodeScannerButton label="Scan material number" formats={['ean_13', 'code_128', 'qr_code']} onScanSuccess={(text) => setMaterial(text)} />
    </Stack>
  );
}
