import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import { VisuallyHidden } from '../../utilities/VisuallyHidden';
import styles from './ButtonBadge.module.css';

export interface ButtonBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Inline count, overlay count, or attention dot. @default 'dot' */
  design?: 'inline' | 'overlay' | 'dot';
  /** Text for count designs, normally a number or capped count such as 99+. */
  text?: string;
  /**
   * Accessible meaning (for example "3 new"). Announced as part of the button name, so the
   * button keeps its visible label as its name instead of needing an `aria-label`.
   */
  label?: string;
}

/** Badge for the Button badge slot. The visual badge is hidden from assistive technology; pass `label` to announce its meaning. */
export const ButtonBadge = forwardRef<HTMLSpanElement, ButtonBadgeProps>(function ButtonBadge({ design = 'dot', text, label, className, ...rest }, ref) {
  const badge = <span {...rest} ref={ref} aria-hidden="true" className={cx(styles.badge, styles[design], className)}>{design !== 'dot' && text}</span>;
  return label ? <>{badge}<VisuallyHidden>{`, ${label}`}</VisuallyHidden></> : badge;
});
