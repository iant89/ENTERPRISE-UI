import { useEffect } from 'react';

/** Prevents the page from scrolling behind a modal while `active`. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const body = document.body;
    const count = Number(body.dataset.euiScrollLock ?? 0);
    if (count === 0) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      body.dataset.euiPrevOverflow = body.style.overflow;
      body.dataset.euiPrevPadding = body.style.paddingRight;
      body.style.overflow = 'hidden';
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }
    body.dataset.euiScrollLock = String(count + 1);
    return () => {
      const next = Number(body.dataset.euiScrollLock ?? 1) - 1;
      if (next <= 0) {
        body.style.overflow = body.dataset.euiPrevOverflow ?? '';
        body.style.paddingRight = body.dataset.euiPrevPadding ?? '';
        delete body.dataset.euiScrollLock;
        delete body.dataset.euiPrevOverflow;
        delete body.dataset.euiPrevPadding;
      } else {
        body.dataset.euiScrollLock = String(next);
      }
    };
  }, [active]);
}
