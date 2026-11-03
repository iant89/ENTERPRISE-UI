import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../themes';
import { SessionTimeoutDialog } from './SessionTimeoutDialog';

afterEach(() => vi.useRealTimers());

describe('SessionTimeoutDialog', () => {
  it('warns after inactivity, counts down and signs out', async () => {
    vi.useFakeTimers();
    const onSignOut = vi.fn();
    render(<ThemeProvider><SessionTimeoutDialog idleTimeout={60_000} countdown={30} onSignOut={onSignOut} /></ThemeProvider>);
    await act(async () => vi.advanceTimersByTime(30_000));
    fireEvent.keyDown(window, { key: 'a' });
    await act(async () => vi.advanceTimersByTime(59_000));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    await act(async () => vi.advanceTimersByTime(2_000));
    expect(screen.getByRole('alertdialog', { name: 'Your session is about to end' })).toHaveTextContent('0:30');
    expect(screen.getByText('30 seconds left before sign-out')).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(30_000));
    expect(onSignOut).toHaveBeenCalledWith('timeout');
  });

  it('extends the session', async () => {
    vi.useFakeTimers();
    const onStay = vi.fn();
    render(<ThemeProvider><SessionTimeoutDialog idleTimeout={1000} onStay={onStay} onSignOut={vi.fn()} /></ThemeProvider>);
    await act(async () => vi.advanceTimersByTime(1001));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Stay signed in' }));
    });
    expect(onStay).toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
