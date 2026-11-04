import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import type { BarcodeDecoder } from '../barcode-scanner-dialog';
import { BarcodeScannerButton } from './BarcodeScannerButton';

beforeEach(() => {
  const stream = { getTracks: () => [{ stop: vi.fn() }] } as unknown as MediaStream;
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn(async () => stream) } });
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
});

const decoder = (text: string | null) => vi.fn(async (): Promise<BarcodeDecoder> => ({ kind: 'custom', detect: async () => (text ? { text, format: 'ean_13' as const } : null) }));

describe('BarcodeScannerButton', () => {
  it('renders an icon-only button with the bar-code icon and forwards the ref', () => {
    const ref = createRef<HTMLButtonElement>();
    renderWithTheme(<BarcodeScannerButton ref={ref} onScanSuccess={() => {}} />);
    const button = screen.getByRole('button', { name: 'Scan barcode' });
    expect(ref.current).toBe(button);
    expect(button.querySelector('svg[data-icon="bar-code"]')).not.toBeNull();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the scanner dialog, reports the result and closes', async () => {
    const onScanSuccess = vi.fn();
    const onOpenChange = vi.fn();
    const { user } = renderWithTheme(<BarcodeScannerButton onScanSuccess={onScanSuccess} onOpenChange={onOpenChange} scanInterval={1} createDecoder={decoder('4006381333931')} />);
    await user.click(screen.getByRole('button', { name: 'Scan barcode' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await waitFor(() => expect(onScanSuccess).toHaveBeenCalledWith('4006381333931', 'ean_13'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps the dialog open when closeOnScan is false', async () => {
    const onScanSuccess = vi.fn();
    const { user } = renderWithTheme(<BarcodeScannerButton onScanSuccess={onScanSuccess} closeOnScan={false} scanInterval={1} createDecoder={decoder('A1')} />);
    await user.click(screen.getByRole('button', { name: 'Scan barcode' }));
    await waitFor(() => expect(onScanSuccess).toHaveBeenCalled());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not open when onClick prevents default, and supports a custom label', async () => {
    const { user } = renderWithTheme(<BarcodeScannerButton label="Scan serial number" onScanSuccess={() => {}} onClick={(e) => e.preventDefault()} />);
    await user.click(screen.getByRole('button', { name: 'Scan serial number' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<BarcodeScannerButton onScanSuccess={() => {}} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
