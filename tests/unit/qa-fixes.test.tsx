import { act, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useClickOutside } from '../../src/hooks/useDismiss';
import { useId } from '../../src/hooks/useId';
import { useMediaQuery } from '../../src/hooks/useMediaQuery';
import { ThemeProvider, useAnnouncer } from '../../src/themes';
import { getInitials } from '../../src/utilities/format';

describe('QA fixes', () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('useId returns ids that are safe in CSS selectors', () => {
    const { result } = renderHook(() => useId());
    expect(result.current).toMatch(/^eui-[A-Za-z0-9_-]+$/);
    expect(() => document.querySelector(`#${result.current}`)).not.toThrow();
  });

  it('getInitials does not split astral characters', () => {
    expect(getInitials('😀 Team')).toBe('😀T');
    expect(getInitials('𝒜da')).toBe('𝒜D');
  });

  it('useMediaQuery falls back to the legacy addListener API', () => {
    const listeners: Array<() => void> = [];
    let matches = false;
    vi.stubGlobal('matchMedia', (query: string) => ({
      get matches() { return matches; }, media: query,
      addListener: (fn: () => void) => listeners.push(fn), removeListener: vi.fn(),
    }));
    const { result } = renderHook(() => useMediaQuery('(min-width: 1px)'));
    expect(result.current).toBe(false);
    matches = true;
    act(() => listeners.forEach((fn) => fn()));
    expect(result.current).toBe(true);
  });

  it('useClickOutside treats clicks inside a ref element that lives in a shadow root as inside', () => {
    const onDismiss = vi.fn();
    const host = document.createElement('div');
    document.body.appendChild(host);
    const popup = document.createElement('div');
    const inner = document.createElement('button');
    popup.appendChild(inner);
    host.attachShadow({ mode: 'open' }).appendChild(popup);
    renderHook(() => useClickOutside([{ current: popup }], onDismiss));
    // The document listener sees the event retargeted to `host`, which is outside `popup`.
    inner.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    expect(onDismiss).not.toHaveBeenCalled();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    host.remove();
  });

  it('a polite announcement does not cut short an earlier assertive one', () => {
    vi.useFakeTimers();
    let announce: ReturnType<typeof useAnnouncer> = () => {};
    function Grab() { announce = useAnnouncer(); return null; }
    const { container } = render(<ThemeProvider><Grab /></ThemeProvider>);
    const text = () => container.ownerDocument.body.textContent ?? '';
    act(() => { announce('Saving failed', 'assertive'); vi.advanceTimersByTime(20); });
    expect(text()).toContain('Saving failed');
    act(() => { vi.advanceTimersByTime(5000); announce('Draft saved'); vi.advanceTimersByTime(3000); });
    expect(text()).toContain('Draft saved');
    expect(text()).not.toContain('Saving failed');
    act(() => { vi.advanceTimersByTime(5000); });
    expect(text()).not.toContain('Draft saved');
  });
});
