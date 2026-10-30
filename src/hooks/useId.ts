import { useId as useReactId } from 'react';

/**
 * Returns a stable, unique id, or `provided` when given. React emits ids such as `:r1:` (React 18) or `«r1»` (React 19);
 * every character outside `[A-Za-z0-9_-]` is removed so the id is also safe to use in CSS selectors.
 */
export function useId(provided?: string, prefix = 'eui'): string {
  const generated = useReactId().replace(/[^A-Za-z0-9_-]/g, '');
  return provided ?? `${prefix}-${generated}`;
}
