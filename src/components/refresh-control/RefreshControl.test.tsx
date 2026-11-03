import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { formatRelativeTime } from '../../hooks/useRelativeTime';
import { ThemeProvider } from '../../themes';
import { RefreshControl } from './RefreshControl';

afterEach(() => vi.useRealTimers());

describe('RefreshControl', () => {
  it('shows freshness, busy state and announces a manual refresh', async () => {
    let resolve!: () => void;
    const onRefresh = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    const { user, container } = renderWithTheme(<RefreshControl onRefresh={onRefresh} lastUpdated={Date.now() - 5 * 60_000} locale="en" />);
    expect(screen.getByText('Updated 5 minutes ago').tagName).toBe('TIME');
    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(screen.getByRole('button', { name: 'Refresh' })).toHaveAttribute('aria-busy', 'true');
    await act(async () => resolve());
    expect(screen.getByRole('button', { name: 'Refresh' })).not.toHaveAttribute('aria-busy');
    expect(container).toHaveTextContent('Data refreshed');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('refreshes on the interval, silently, and skips while the tab is hidden', async () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn();
    const { container } = render(<ThemeProvider><RefreshControl onRefresh={onRefresh} defaultInterval={30_000} /></ThemeProvider>);
    await act(async () => vi.advanceTimersByTime(30_000));
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(container).not.toHaveTextContent('Data refreshed');
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    await act(async () => vi.advanceTimersByTime(60_000));
    expect(onRefresh).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    await act(async () => {
      fireEvent(document, new Event('visibilitychange'));
    });
    expect(onRefresh).toHaveBeenCalledTimes(2);
  });

  it('reports interval changes', async () => {
    const onIntervalChange = vi.fn();
    const { user } = renderWithTheme(<RefreshControl onRefresh={() => {}} onIntervalChange={onIntervalChange} />);
    await user.click(screen.getByRole('combobox', { name: /^Auto-refresh/ }));
    await user.click(screen.getByRole('option', { name: 'Refresh every 1 min' }));
    expect(onIntervalChange).toHaveBeenCalledWith(60_000);
  });

  it('formats relative time with locale support', () => {
    const now = new Date('2026-11-03T12:00:00Z');
    expect(formatRelativeTime(new Date('2026-11-03T11:59:50Z'), now, 'en')).toBe('now');
    expect(formatRelativeTime(new Date('2026-11-03T10:00:00Z'), now, 'en')).toBe('2 hours ago');
    expect(formatRelativeTime(new Date('2026-11-02T12:00:00Z'), now, 'de')).toBe('gestern');
  });
});
