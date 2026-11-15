import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { QrCode } from './QrCode';

const URI = 'otpauth://totp/Acme:ada?secret=JBSWY3DPEHPK3PXP&issuer=Acme';

describe('QrCode', () => {
  it('renders a labelled SVG image and reports what it encoded', async () => {
    const onEncoded = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithTheme(<QrCode ref={ref} value={URI} label="QR code for your authenticator app" onEncoded={onEncoded} className="extra" data-testid="qr" />);
    const img = screen.getByRole('img', { name: 'QR code for your authenticator app' });
    expect(img.tagName.toLowerCase()).toBe('svg');
    expect(img).toHaveAttribute('width', '192');
    expect(ref.current).toBe(screen.getByTestId('qr'));
    expect(ref.current).toHaveClass('extra');
    expect(onEncoded).toHaveBeenCalledWith({ version: 4, modules: 33, errorCorrection: 'M', mask: expect.any(Number), mode: 'byte' }); // 59 bytes
    expect(await axeViolations(container)).toEqual([]);
  });

  it('applies the options: level, quiet zone, colours, size and version range', () => {
    const onEncoded = vi.fn();
    renderWithTheme(<QrCode value={URI} errorCorrection="H" margin={2} color="#123456" background="#fafafa" size={256} minVersion={10} mask={3} onEncoded={onEncoded} />);
    const img = screen.getByRole('img', { name: 'QR code' });
    expect(onEncoded).toHaveBeenCalledWith(expect.objectContaining({ version: 10, modules: 57, errorCorrection: 'H', mask: 3 }));
    expect(img).toHaveAttribute('viewBox', '0 0 61 61'); // 57 modules + 2 × 2 quiet zone
    expect(img).toHaveAttribute('width', '256');
    expect(img.querySelector('rect')).toHaveAttribute('fill', '#fafafa');
    expect(img.querySelector('path')).toHaveAttribute('fill', '#123456');
  });

  it('boosts the error-correction level when asked', () => {
    const onEncoded = vi.fn();
    renderWithTheme(<QrCode value="12345" errorCorrection="L" boostErrorCorrection onEncoded={onEncoded} />);
    expect(onEncoded).toHaveBeenCalledWith(expect.objectContaining({ version: 1, errorCorrection: 'H', mode: 'numeric' }));
  });

  it('opens a larger copy in a dialog and closes it', async () => {
    const { user, container } = renderWithTheme(<QrCode value={URI} label="Setup code" enlargeable enlargedSize={400} />);
    expect(screen.getByText('Click to enlarge')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Setup code. Show it larger' });
    expect(await axeViolations(container)).toEqual([]);
    await user.click(button);
    const dialog = screen.getByRole('dialog', { name: 'Scan the QR code' });
    expect(within(dialog).getByRole('img', { name: 'Setup code' })).toHaveAttribute('width', '400');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(button).toHaveFocus()); // focus returns to the code
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows a message and reports an error when the value is too long', () => {
    const onError = vi.fn();
    renderWithTheme(<QrCode value={'x'.repeat(200)} maxVersion={5} onError={onError} labels={{ tooLong: 'Zu lang für einen QR-Code.' }} />);
    expect(screen.getByRole('img', { name: 'Zu lang für einen QR-Code.' })).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ name: 'QrCodeTooLongError' }));
  });

  it('localizes its strings', () => {
    renderWithTheme(<QrCode value={URI} enlargeable labels={{ image: 'QR-Code', enlarge: (l) => `${l} vergrößern`, hint: 'Zum Vergrößern klicken' }} />);
    expect(screen.getByRole('button', { name: 'QR-Code vergrößern' })).toBeInTheDocument();
    expect(screen.getByText('Zum Vergrößern klicken')).toBeInTheDocument();
  });
});
