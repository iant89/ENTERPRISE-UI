import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react';
import { Spinner, type SpinnerProps } from '../spinner';
import { cx } from '../../utilities/cx';
import styles from './BusyIndicator.module.css';

export interface BusyIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the operation is in progress. @default false */
  active?: boolean;
  /** Delay before showing the indicator, in milliseconds. @default 1000 */
  delay?: number;
  /** @default 'md' */
  size?: SpinnerProps['size'];
  /** Localized operation description. @default 'Loading' */
  text?: string;
  /** Show the text above or below the spinner. @default 'bottom' */
  textPlacement?: 'top' | 'bottom';
}

/** Non-blocking indication of an operation, optionally overlaying content. */
export const BusyIndicator = forwardRef<HTMLDivElement, BusyIndicatorProps>(function BusyIndicator(
  { active = false, delay = 1000, size = 'md', text = 'Loading', textPlacement = 'bottom', children, className, ...rest }, ref,
) {
  const [visible, setVisible] = useState(active && delay <= 0);
  useEffect(() => {
    if (!active) { setVisible(false); return; }
    if (delay <= 0) { setVisible(true); return; }
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [active, delay]);
  return <div {...rest} ref={ref} className={cx(styles.root, className)}>
    {children != null && <div aria-busy={active || undefined}>{children}</div>}
    {active && visible && <div className={cx(styles.indicator, children != null && styles.overlay)} role="status">
      {textPlacement === 'top' && <span>{text}</span>}
      <Spinner size={size} decorative />
      {textPlacement === 'bottom' && <span>{text}</span>}
    </div>}
  </div>;
});
