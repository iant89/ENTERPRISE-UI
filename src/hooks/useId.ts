import { useId as useReactId } from 'react';

/** Stable unique id. Returns `provided` when given. */
export function useId(provided?: string, prefix = 'eui'): string {
  const generated = useReactId().replace(/:/g, '');
  return provided ?? `${prefix}-${generated}`;
}
