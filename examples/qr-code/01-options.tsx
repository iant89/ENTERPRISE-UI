import { useState } from 'react';
import { QrCode, SegmentedButton, Text, type QrCodeInfo, type QrErrorCorrection } from '@enterprise-ui/react';

export const title = 'QR code options';
export const description = 'Error correction trades size for robustness: H survives about 30% damage but needs more modules than L. The code is drawn in the browser, so it can carry secrets such as an authenticator setup link. Click a code to enlarge it.';

const SETUP = 'otpauth://totp/Acme:ada@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Acme';
const LEVELS: QrErrorCorrection[] = ['L', 'M', 'Q', 'H'];

export default function QrCodeOptions() {
  const [level, setLevel] = useState<QrErrorCorrection>('M');
  const [info, setInfo] = useState<QrCodeInfo | null>(null);
  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
        <SegmentedButton
          aria-label="Error correction"
          value={[level]}
          onChange={(v) => v[0] && setLevel(v[0] as QrErrorCorrection)}
          items={LEVELS.map((l) => ({ value: l, label: l, title: `Level ${l}` }))}
        />
        <QrCode value={SETUP} label="QR code for your authenticator app" errorCorrection={level} enlargeable onEncoded={setInfo} />
        {info && (
          <Text size="sm" tone="secondary">
            Version {info.version} · {info.modules}×{info.modules} modules · level {info.errorCorrection} · mask {info.mask} · {info.mode} mode
          </Text>
        )}
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'end' }}>
        <QrCode value="https://example.com/orders/4711" label="Order 4711" size={128} />
        <QrCode value="HTTPS://EXAMPLE.COM/A-1" label="Asset A-1, alphanumeric mode" size={128} margin={2} />
        <QrCode value="0123456789012" label="Serial number" size={128} color="#0a3d62" background="#eef6ff" />
      </div>
    </div>
  );
}
