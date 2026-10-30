import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Icon.module.css';
export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** SVG or other non-interactive icon. */
  children: ReactNode;
  /** Accessible name; omit when the icon is decorative. */
  label?: string;
}
/** An accessible or decorative icon wrapper. Use IconButton for actions. */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon({ children, label, className, ...rest }, ref) {
  return <span {...rest} ref={ref} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cx(styles.icon, className)}>{children}</span>;
});
