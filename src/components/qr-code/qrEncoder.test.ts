import { describe, expect, it } from 'vitest';
// zxing's reader (vendored for the barcode scanner) is the independent check that
// every code we draw is valid: format, version, error correction and data.
import BitMatrix from '../../../vendor/zxing-library/esm/core/common/BitMatrix.js';
import Decoder from '../../../vendor/zxing-library/esm/core/qrcode/decoder/Decoder.js';
import { encodeQrCode, qrDataCodewords, QrCodeTooLongError, type QrCodeMatrix, type QrErrorCorrection } from './qrEncoder';

function decode(qr: QrCodeMatrix): { text: string; level: string } {
  const matrix = new BitMatrix(qr.size, qr.size);
  qr.modules.forEach((row, y) => row.forEach((dark, x) => { if (dark) matrix.set(x, y); }));
  const result = new Decoder().decodeBitMatrix(matrix);
  return { text: result.getText(), level: result.getECLevel() };
}

const LEVELS: QrErrorCorrection[] = ['L', 'M', 'Q', 'H'];
/** Lower-case text (byte mode) that fills most of a version's capacity at a level. */
const fill = (version: number, level: QrErrorCorrection) => {
  const bytes = Math.max(1, qrDataCodewords(version, level) - 3);
  return Array.from({ length: bytes }, (_, i) => 'abcdefghijklmnopqrstuvwxyz'[i % 26]).join('');
};

describe('encodeQrCode', () => {
  it('encodes every version (1–40) at every error-correction level', () => {
    for (const level of LEVELS) {
      for (let version = 1; version <= 40; version++) {
        const text = fill(version, level);
        const qr = encodeQrCode(text, { errorCorrection: level, minVersion: version, maxVersion: version });
        expect(qr.version).toBe(version);
        expect(qr.size).toBe(17 + 4 * version);
        expect(decode(qr)).toEqual({ text, level });
      }
    }
  });

  it('picks numeric, alphanumeric or byte mode from the text', () => {
    for (const [text, mode] of [['0123456789012', 'numeric'], ['HTTPS://EXAMPLE.COM/A-1', 'alphanumeric'], ['otpauth://totp/x?secret=ABC', 'byte'], ['', 'numeric']] as const) {
      const qr = encodeQrCode(text);
      expect(qr.mode).toBe(mode);
      expect(decode(qr).text).toBe(text);
    }
    // Numeric packs 41 digits into version 1-L; byte mode would need version 2.
    expect(encodeQrCode('1'.repeat(41), { errorCorrection: 'L' }).version).toBe(1);
  });

  it('decodes with every mask pattern', () => {
    for (let mask = 0; mask < 8; mask++) {
      const qr = encodeQrCode('otpauth://totp/Acme:ada?secret=JBSWY3DPEHPK3PXP&issuer=Acme', { mask });
      expect(qr.mask).toBe(mask);
      expect(decode(qr).text).toBe('otpauth://totp/Acme:ada?secret=JBSWY3DPEHPK3PXP&issuer=Acme');
    }
  });

  it('uses the smallest version that fits, and more modules for higher levels', () => {
    expect(encodeQrCode('a'.repeat(14), { errorCorrection: 'M' }).version).toBe(1);
    expect(encodeQrCode('a'.repeat(15), { errorCorrection: 'M' }).version).toBe(2);
    const uri = 'otpauth://totp/Acme:ada?secret=JBSWY3DPEHPK3PXP&issuer=Acme';
    const versions = LEVELS.map((errorCorrection) => encodeQrCode(uri, { errorCorrection }).version);
    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    expect(versions[3]).toBeGreaterThan(versions[0]!);
  });

  it('boosts the level when it fits in the same version', () => {
    const qr = encodeQrCode('12345', { errorCorrection: 'L', boostErrorCorrection: true });
    expect(qr).toMatchObject({ version: 1, errorCorrection: 'H' });
    expect(decode(qr).level).toBe('H');
    expect(encodeQrCode('12345', { errorCorrection: 'L' }).errorCorrection).toBe('L');
  });

  it('respects minVersion and handles UTF-8', () => {
    expect(encodeQrCode('hi', { minVersion: 5 }).version).toBe(5);
    expect(decode(encodeQrCode('Zoë · 東京 · ✓')).text).toBe('Zoë · 東京 · ✓');
  });

  it('throws QrCodeTooLongError past maxVersion', () => {
    expect(() => encodeQrCode('a'.repeat(100), { maxVersion: 3 })).toThrow(QrCodeTooLongError);
    expect(() => encodeQrCode('a'.repeat(3000), { errorCorrection: 'H' })).toThrow(/too long/);
    expect(encodeQrCode('a'.repeat(2900), { errorCorrection: 'L' }).version).toBe(40);
  });
});
