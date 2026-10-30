import { useState } from 'react';
import { BarcodeScannerDialog, Button } from '@enterprise-ui/react';

export const title = 'Barcode scanner';
export const description = 'Scan with the device camera using the bundled zxing decoder (set decoder="native" to prefer the browser BarcodeDetector), or type the code.';

export default function BarcodeScannerDialogBasic() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('');
  return (
    <>
      <Button onClick={() => setOpen(true)}>Scan material number</Button>
      {result && <p>Scanned: {result}</p>}
      <BarcodeScannerDialog
        open={open}
        onClose={() => setOpen(false)}
        formats={['ean_13', 'code_128', 'qr_code']}
        onScanSuccess={(text, format) => { setResult(`${text} (${format})`); setOpen(false); }}
      />
    </>
  );
}
