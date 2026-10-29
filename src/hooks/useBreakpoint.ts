import { breakpoints } from '../tokens';
import { useMediaQuery } from './useMediaQuery';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Current responsive size class: `sm` (< 600px, phone), `md` (< 1024px,
 * tablet), `lg` (< 1440px, desktop) or `xl`.
 */
export function useBreakpoint(): Breakpoint {
  const md = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);
  const lg = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const xl = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  if (xl) return 'xl';
  if (lg) return 'lg';
  if (md) return 'md';
  return 'sm';
}
