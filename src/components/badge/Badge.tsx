import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import styles from './Badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge text. Omit and set `count` for a numeric counter. */
  children?: ReactNode;
  /** @default 'neutral' */
  tone?: Tone;
  /** Filled background for higher emphasis. @default false */
  solid?: boolean;
  /** Numeric counter, rendered as a pill. Values above `max` show `max+`. */
  count?: number;
  /** @default 99 */
  max?: number;
  /** Render only a small dot (requires `aria-label` for meaning). @default false */
  dot?: boolean;
  icon?: ReactNode;
}

/** Compact label or counter for status, categories and notification counts. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, tone = 'neutral', solid = false, count, max = 99, dot = false, icon, className, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  const isCount = count !== undefined;
  return (
    <span
      ref={ref}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      className={cx(styles.badge, styles[tone], (solid || isCount || dot) && styles.solid, isCount && styles.count, dot && styles.dot, className)}
      {...rest}
    >
      {!dot && icon && <span aria-hidden="true">{icon}</span>}
      {!dot && (isCount ? (count > max ? `${max}+` : count) : <span className={styles.label}>{children}</span>)}
    </span>
  );
});
