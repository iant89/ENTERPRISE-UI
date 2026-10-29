import { useEffect, type RefObject } from 'react';
import { useEventCallback } from './useEventCallback';

/**
 * Calls `onDismiss` on pointer-down outside every element in `refs`
 * (e.g. a trigger and its popover).
 */
export function useClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  onDismiss: (event: PointerEvent) => void,
  enabled = true,
): void {
  const handler = useEventCallback(onDismiss);
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      handler(event);
    };
    document.addEventListener('pointerdown', listener, true);
    return () => document.removeEventListener('pointerdown', listener, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, handler]);
}

/** Calls `onEscape` when Escape is pressed anywhere in the document. */
export function useEscapeKey(onEscape: (event: KeyboardEvent) => void, enabled = true): void {
  const handler = useEventCallback(onEscape);
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler(event);
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [enabled, handler]);
}
