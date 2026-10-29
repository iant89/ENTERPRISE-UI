import { describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { Button } from '../button';
import { ToastProvider, useToast } from './Toast';

function Trigger() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ title: 'Order saved', tone: 'success', duration: 1000 })}>Save</Button>;
}

describe('Toast', () => {
  it('shows, announces and auto-dismisses a toast', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { user } = renderWithTheme(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('region', { name: 'Notifications' })).toHaveTextContent('Order saved');
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent('Order saved');
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });
    expect(screen.queryByText('Order saved', { selector: 'span' })).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('can be dismissed', async () => {
    const { user } = renderWithTheme(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByRole('region', { name: 'Notifications' })).not.toBeInTheDocument();
  });

  it('throws outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderWithTheme(<Trigger />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
