import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { BarcodeScannerDialog } from './BarcodeScannerDialog';
import { createDefaultBarcodeDecoder, type BarcodeDecoder } from './barcodeDecoder';

const stopTrack = vi.fn();
const fakeStream = () => ({ getTracks: () => [{ stop: stopTrack }] }) as unknown as MediaStream;
let getUserMedia: ReturnType<typeof vi.fn>;

beforeEach(() => {
  stopTrack.mockReset();
  getUserMedia = vi.fn(async () => fakeStream());
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const decoderReturning = (...results: (string | null)[]) => {
  const detect = vi.fn(async () => { const r = results.length > 1 ? results.shift()! : results[0]; return r ? { text: r, format: 'qr_code' as const } : null; });
  return { detect, factory: vi.fn(async (): Promise<BarcodeDecoder> => ({ kind: 'custom', detect })) };
};

describe('BarcodeScannerDialog', () => {
  it('requests the rear camera, decodes, reports success and stops the stream', async () => {
    const onScanSuccess = vi.fn();
    const { factory } = decoderReturning(null, 'ABC-123');
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<BarcodeScannerDialog ref={ref} open onClose={() => {}} onScanSuccess={onScanSuccess} formats={['qr_code']} scanInterval={1} createDecoder={factory} />);
    expect(screen.getByRole('dialog', { name: 'Scan barcode' })).toBeInTheDocument();
    await waitFor(() => expect(onScanSuccess).toHaveBeenCalledWith('ABC-123', 'qr_code'));
    expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    expect(factory).toHaveBeenCalledWith(['qr_code']);
    expect(stopTrack).toHaveBeenCalled();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('stops the camera when closed', async () => {
    const { factory } = decoderReturning(null);
    const { rerender } = renderWithTheme(<BarcodeScannerDialog open onClose={() => {}} onScanSuccess={() => {}} createDecoder={factory} />);
    await screen.findByText('Point the camera at a barcode.');
    rerender(<BarcodeScannerDialog open={false} onClose={() => {}} onScanSuccess={() => {}} createDecoder={factory} />);
    expect(stopTrack).toHaveBeenCalled();
  });

  it('stops the camera on unmount', async () => {
    const { factory } = decoderReturning(null);
    const { unmount } = renderWithTheme(<BarcodeScannerDialog open onClose={() => {}} onScanSuccess={() => {}} createDecoder={factory} />);
    await screen.findByText('Point the camera at a barcode.');
    unmount();
    expect(stopTrack).toHaveBeenCalled();
  });

  it.each([
    ['NotAllowedError', 'permission-denied', /Camera access was denied/],
    ['NotFoundError', 'no-camera', /No camera was found/],
    ['NotReadableError', 'camera-error', /could not be started/],
  ])('maps %s to a %s error state', async (name, kind, message) => {
    getUserMedia.mockRejectedValue(Object.assign(new Error('x'), { name }));
    const onScanError = vi.fn();
    const { factory } = decoderReturning(null);
    renderWithTheme(<BarcodeScannerDialog open onClose={() => {}} onScanSuccess={() => {}} onScanError={onScanError} createDecoder={factory} />);
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(onScanError).toHaveBeenCalledWith(expect.objectContaining({ kind }));
  });

  it('reports insecure contexts without requesting the camera', async () => {
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false });
    renderWithTheme(<BarcodeScannerDialog open onClose={() => {}} onScanSuccess={() => {}} createDecoder={decoderReturning(null).factory} />);
    expect(await screen.findByText(/secure \(HTTPS\) pages/)).toBeInTheDocument();
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('reports missing camera APIs', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
    renderWithTheme(<BarcodeScannerDialog open onClose={() => {}} onScanSuccess={() => {}} createDecoder={decoderReturning(null).factory} />);
    expect(await screen.findByText(/does not support camera access/)).toBeInTheDocument();
  });

  it('retries after a permission error', async () => {
    getUserMedia.mockRejectedValueOnce(Object.assign(new Error('x'), { name: 'NotAllowedError' }));
    const { user } = renderWithTheme(<BarcodeScannerDialog open onClose={() => {}} onScanSuccess={() => {}} createDecoder={decoderReturning(null).factory} />);
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    await screen.findByText('Point the camera at a barcode.');
    expect(getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('accepts manual entry', async () => {
    const onScanSuccess = vi.fn();
    getUserMedia.mockRejectedValue(Object.assign(new Error('x'), { name: 'NotFoundError' }));
    const { user } = renderWithTheme(<BarcodeScannerDialog open onClose={() => {}} onScanSuccess={onScanSuccess} createDecoder={decoderReturning(null).factory} />);
    await user.type(screen.getByRole('textbox', { name: 'Or enter the code manually' }), ' 4006381333931 ');
    await user.click(screen.getByRole('button', { name: 'Use code' }));
    expect(onScanSuccess).toHaveBeenCalledWith('4006381333931', 'manual');
  });

  it('has no axe violations', async () => {
    const { baseElement } = renderWithTheme(<BarcodeScannerDialog open onClose={() => {}} onScanSuccess={() => {}} createDecoder={decoderReturning(null).factory} />);
    await screen.findByText('Point the camera at a barcode.');
    expect(await axeViolations(baseElement, { ignoreStructure: true })).toEqual([]);
  });
});

describe('createDefaultBarcodeDecoder', () => {
  it('uses the native BarcodeDetector when it supports the requested formats', async () => {
    const detect = vi.fn(async () => [{ rawValue: 'hello', format: 'qr_code' }]);
    class FakeDetector { static getSupportedFormats = async () => ['qr_code', 'ean_13']; detect = detect; }
    vi.stubGlobal('BarcodeDetector', FakeDetector);
    const decoder = await createDefaultBarcodeDecoder(['qr_code']);
    expect(decoder.kind).toBe('native');
    await expect(decoder.detect(document.createElement('video'))).resolves.toEqual({ text: 'hello', format: 'qr_code' });
  });

  it('falls back to the lazily loaded zxing decoder', async () => {
    vi.stubGlobal('BarcodeDetector', undefined);
    const decoder = await act(() => createDefaultBarcodeDecoder(['qr_code', 'ean_13']));
    expect(decoder.kind).toBe('zxing');
    // jsdom video has no frames yet: nothing to decode.
    await expect(decoder.detect(document.createElement('video'))).resolves.toBeNull();
  });
});
