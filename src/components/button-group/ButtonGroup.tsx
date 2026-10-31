import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './ButtonGroup.module.css';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Join buttons into a single segmented control. @default false */
  attached?: boolean;
  /** @default 'horizontal' */
  /** Layout direction. */
  orientation?: 'horizontal' | 'vertical';
  /** Stretch buttons to fill the width equally. @default false */
  fullWidth?: boolean;
  /** Accessible name for the group. */
  'aria-label'?: string;
}

/** Groups related buttons (`role="group"`). */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { attached = false, orientation = 'horizontal', fullWidth = false, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      className={cx(styles.group, attached && styles.attached, orientation === 'vertical' && styles.vertical, fullWidth && styles.fullWidth, className)}
      {...rest}
    />
  );
});
