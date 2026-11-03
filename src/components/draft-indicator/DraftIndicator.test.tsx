import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { DraftIndicator, useAutosave } from './DraftIndicator';

afterEach(() => vi.useRealTimers());

describe('DraftIndicator', () => {
  it('shows each state and a retry for errors', async () => {
    const onRetry = vi.fn();
    const { rerender, user } = renderWithTheme(<DraftIndicator status="saving" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saving…');
    rerender(<DraftIndicator status="saved" lastSaved={Date.now() - 120_000} locale="en" />);
    expect(screen.getByRole('status')).toHaveTextContent('Draft saved 2 minutes ago');
    rerender(<DraftIndicator status="error" onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('useAutosave', () => {
  it('debounces, saves the latest value and reports status', async () => {
    vi.useFakeTimers();
    const save = vi.fn(() => Promise.resolve());
    const { result, rerender } = renderHook(({ v }) => useAutosave(v, { save, delay: 500 }), { initialProps: { v: 'a' } });
    expect(result.current.status).toBe('idle');
    rerender({ v: 'ab' });
    rerender({ v: 'abc' });
    expect(result.current.status).toBe('unsaved');
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('abc');
    expect(result.current.status).toBe('saved');
    expect(result.current.lastSaved).toBeInstanceOf(Date);
  });

  it('reports failures', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useAutosave(v, { save: () => Promise.reject(new Error('offline')), delay: 100 }), { initialProps: { v: 1 } });
    rerender({ v: 2 });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.status).toBe('error');
  });
});
