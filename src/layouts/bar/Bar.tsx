import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Bar.module.css';

export interface BarProps extends HTMLAttributes<HTMLDivElement> {
  /** Content at the logical start of the bar. */
  startContent?: ReactNode;
  /** Content centered in the space between start and end. */
  children?: ReactNode;
  /** Content at the logical end of the bar. */
  endContent?: ReactNode;
  /** @default 'header' */
  design?: 'header' | 'subheader' | 'footer' | 'floating-footer';
}

/** Structural page bar; unlike a toolbar it does not implement arrow-key navigation. */
export const Bar = forwardRef<HTMLDivElement, BarProps>(function Bar({ startContent, children, endContent, design = 'header', className, ...rest }, ref) {
  return <div {...rest} ref={ref} className={cx(styles.bar, styles[design], className)}>
    <div className={styles.side}>{startContent}</div>
    <div className={styles.middle}>{children}</div>
    <div className={cx(styles.side, styles.end)}>{endContent}</div>
  </div>;
});
