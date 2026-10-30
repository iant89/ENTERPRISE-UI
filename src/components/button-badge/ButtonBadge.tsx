import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './ButtonBadge.module.css';

export interface ButtonBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Inline count, overlay count, or attention dot. @default 'dot' */
  design?: 'inline' | 'overlay' | 'dot';
  /** Text for count designs, normally a number or capped count such as 99+. */
  text?: string;
}

/** Decorative badge for the Button badge slot. Describe its meaning in the button name. */
export const ButtonBadge = forwardRef<HTMLSpanElement, ButtonBadgeProps>(function ButtonBadge({ design = 'dot', text, className, ...rest }, ref) {
  return <span {...rest} ref={ref} aria-hidden="true" className={cx(styles.badge, styles[design], className)}>{design !== 'dot' && text}</span>;
});
