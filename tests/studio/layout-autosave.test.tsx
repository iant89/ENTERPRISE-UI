import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LAYOUT, layoutReducer, type LayoutState } from '../../studio/src/app/workspace/layout';
import { useLayoutAutosave } from '../../studio/src/app/workspace/useLayoutAutosave';

describe('layout autosave (C3 review note 1)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = () => {
    const store = new Map<string, LayoutState>();
    const save = vi.fn((k: string, l: LayoutState) => void store.set(k, l));
    const layoutFor = { current: { id: 'a', layout: DEFAULT_LAYOUT } as { id: string; layout: LayoutState } | null };
    const hook = renderHook(({ layout, projectId }: { layout: LayoutState; projectId: string }) =>
      useLayoutAutosave({ layout, projectId, layoutFor, keyFor: () => projectId, immediate: () => false, save, delay: 150 }),
    { initialProps: { layout: DEFAULT_LAYOUT, projectId: 'a' } });
    return { store, save, layoutFor, hook };
  };

  it('flushes the pending write when the project switches inside the debounce', () => {
    const { store, save, layoutFor, hook } = setup();
    const changed = layoutReducer(DEFAULT_LAYOUT, { type: 'toggle', panel: 'preview' });
    hook.rerender({ layout: changed, projectId: 'a' });
    expect(save).not.toHaveBeenCalled();
    hook.rerender({ layout: changed, projectId: 'b' });
    expect(store.get('a')).toBe(changed);
    expect(save).toHaveBeenCalledTimes(1);
    // Switching back: the restored layout is the changed one.
    layoutFor.current = { id: 'a', layout: store.get('a')! };
    hook.rerender({ layout: store.get('a')!, projectId: 'a' });
    act(() => { vi.advanceTimersByTime(500); });
    expect(save).toHaveBeenCalledTimes(1);
    expect(store.get('a')!.collapsed.preview).toBe(true);
  });

  it('keeps the debounce on same-project re-renders', () => {
    const { save, hook } = setup();
    const one = layoutReducer(DEFAULT_LAYOUT, { type: 'toggle', panel: 'preview' });
    const two = layoutReducer(one, { type: 'toggle', panel: 'preview' });
    hook.rerender({ layout: one, projectId: 'a' });
    hook.rerender({ layout: two, projectId: 'a' });
    expect(save).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(150); });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenLastCalledWith('a', two);
  });

  it('flushes on pagehide', () => {
    const { save, hook } = setup();
    hook.rerender({ layout: layoutReducer(DEFAULT_LAYOUT, { type: 'toggle', panel: 'preview' }), projectId: 'a' });
    window.dispatchEvent(new Event('pagehide'));
    expect(save).toHaveBeenCalledTimes(1);
  });
});
