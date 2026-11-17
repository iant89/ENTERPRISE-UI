import { describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { CopyButton } from './CopyButton';

describe('CopyButton', () => {
  it('copies the value and writes the outcome next to the button', async () => {
    const copy = vi.fn().mockResolvedValue(undefined);
    const onCopied = vi.fn();
    const { user } = renderWithTheme(<CopyButton value="PO-1042" label="Copy order ID" copy={copy} onCopied={onCopied} className="extra" />);
    const button = screen.getByRole('button', { name: 'Copy order ID' });
    expect(button).toHaveClass('extra');
    await user.click(button);
    expect(copy).toHaveBeenCalledWith('PO-1042');
    expect(onCopied).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Copied.');
  });

  it('icon-only: a named icon button whose icon shows the outcome for two seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const copy = vi.fn().mockResolvedValue(undefined);
    const { user, container } = renderWithTheme(<CopyButton iconOnly value="JBSWY3DP" label="Copy setup key" copy={copy} size="sm" neutral className="extra" />);
    const button = screen.getByRole('button', { name: 'Copy setup key' });
    expect(button).toHaveAttribute('title', 'Copy setup key');
    expect(button).toHaveClass('extra');
    expect(button).not.toHaveTextContent('Copy');
    const icon = () => button.querySelector('svg')?.getAttribute('data-icon') ?? button.innerHTML;
    const before = icon();
    await user.click(button);
    expect(copy).toHaveBeenCalledWith('JBSWY3DP');
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Copied.');
    expect(status).toHaveClass('eui-visually-hidden');
    await vi.waitFor(() => expect(icon()).not.toBe(before));
    await act(async () => { vi.advanceTimersByTime(2100); });
    await vi.waitFor(() => expect(icon()).toBe(before));
    expect(await axeViolations(container)).toEqual([]);
    vi.useRealTimers();
  });

  it('icon-only: reports a failure through onError and the announcement', async () => {
    const error = new Error('denied');
    const onError = vi.fn();
    const onCopied = vi.fn();
    const { user } = renderWithTheme(<CopyButton iconOnly value="x" label="Copy" copy={() => Promise.reject(error)} onError={onError} onCopied={onCopied} messages={{ failed: 'Kopieren fehlgeschlagen.' }} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(onError).toHaveBeenCalledWith(error);
    expect(onCopied).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Kopieren fehlgeschlagen.');
  });
});
