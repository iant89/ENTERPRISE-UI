import { useEffect, type RefObject } from 'react';
import { focusElement, getFocusableElements } from '../utilities/focus';

export interface FocusTrapOptions {
  /** Element to focus on activation. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Return focus to the previously focused element on deactivation. @default true */
  restoreFocus?: boolean;
}

/**
 * Keeps keyboard focus inside `containerRef` while `active`, and restores it
 * to the previously focused element afterwards (WCAG 2.4.3).
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  { initialFocusRef, restoreFocus = true }: FocusTrapOptions = {},
): void {
  useEffect(() => {
    if (!active) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    let container: HTMLElement | null = null;
    let frame = 0;
    let tries = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !container) return;
      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        event.preventDefault();
        focusElement(container);
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault();
        focusElement(last);
      } else if (!event.shiftKey && (current === last || !container.contains(current))) {
        event.preventDefault();
        focusElement(first);
      }
    };

    // The container may be portaled and appear a frame after activation.
    const setup = () => {
      container = containerRef.current;
      if (!container) {
        if (tries++ < 10) frame = requestAnimationFrame(setup);
        return;
      }
      container.addEventListener('keydown', onKeyDown);
      if (!container.contains(document.activeElement)) {
        focusElement(initialFocusRef?.current ?? getFocusableElements(container)[0] ?? container);
      }
    };
    frame = requestAnimationFrame(setup);

    return () => {
      cancelAnimationFrame(frame);
      container?.removeEventListener('keydown', onKeyDown);
      if (restoreFocus && previouslyFocused && document.contains(previouslyFocused)) {
        focusElement(previouslyFocused);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
