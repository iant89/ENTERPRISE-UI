import { useEffect, useState } from 'react';
import { DESKTOP_QUERY, TABLET_QUERY, type Breakpoint } from './layout';

const read = (): Breakpoint => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'desktop';
  if (window.matchMedia(DESKTOP_QUERY).matches) return 'desktop';
  return window.matchMedia(TABLET_QUERY).matches ? 'tablet' : 'mobile';
};

/** The layout breakpoint, updated only when a 768 px or 1280 px boundary is crossed (matchMedia). */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(read);
  useEffect(() => {
    if (!window.matchMedia) return;
    const lists = [window.matchMedia(TABLET_QUERY), window.matchMedia(DESKTOP_QUERY)];
    const on = () => setBp(read());
    for (const l of lists) l.addEventListener('change', on);
    on();
    return () => { for (const l of lists) l.removeEventListener('change', on); };
  }, []);
  return bp;
}
