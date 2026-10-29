import type { CSSProperties } from 'react';

/** Steps of the spacing scale (`--eui-space-N`). */
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

export const space = (value: Space | undefined): string | undefined => (value === undefined ? undefined : value === 0 ? '0' : `var(--eui-space-${value})`);

export type Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T };

/** Expands a responsive value into CSS custom properties `--{name}-base|sm|md|lg|xl`. */
export function responsiveVars<T>(name: string, value: Responsive<T> | undefined, map: (v: T) => string | undefined): CSSProperties {
  if (value === undefined) return {};
  const vars: Record<string, string | undefined> = {};
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const v = value as { base?: T; sm?: T; md?: T; lg?: T };
    if (v.base !== undefined) vars[`--${name}-base`] = map(v.base);
    if (v.sm !== undefined) vars[`--${name}-sm`] = map(v.sm);
    if (v.md !== undefined) vars[`--${name}-md`] = map(v.md);
    if (v.lg !== undefined) vars[`--${name}-lg`] = map(v.lg);
  } else {
    vars[`--${name}-base`] = map(value as T);
  }
  return vars as CSSProperties;
}
