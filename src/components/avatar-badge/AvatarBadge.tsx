import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './AvatarBadge.module.css';

export interface AvatarBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'color' | 'tabIndex'> {
  /** Decorative icon to display. Do not pass interactive elements. */
  icon: ReactNode;
  /** Semantic appearance. The accent is used only for the neutral tone. @default 'neutral' */
  tone?: 'neutral' | 'success' | 'warning' | 'error' | 'information';
  /** Accent palette index for the neutral tone. @default 8 */
  accent?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

/** Decorative, non-interactive affordance for an Avatar's badge slot. */
export const AvatarBadge = forwardRef<HTMLSpanElement, AvatarBadgeProps>(function AvatarBadge(
  { icon, tone = 'neutral', accent = 8, className, ...rest }, ref,
) {
  return <span {...rest} ref={ref} tabIndex={undefined} aria-hidden="true" className={cx(styles.badge, styles[tone], tone === 'neutral' && styles[`accent${accent}`], className)}>{icon}</span>;
});
