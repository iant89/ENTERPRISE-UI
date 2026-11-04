import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useIcon } from '../../icons/IconProvider';
import type { IconRef } from '../../icons/IconRegistry';
import styles from './Icon.module.css';

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** SVG or other non-interactive icon. Not needed when `name` is set. */
  children?: ReactNode;
  /**
   * Icon to look up in the nearest IconProvider: a name (`'bar-code'`), `'sap-icon://bar-code'`
   * or a code point (`'&#xe08d;'`, `0xe08d`). Ignored when `children` is set.
   */
  name?: IconRef;
  /** Accessible name; omit when the icon is decorative. */
  label?: string;
}

/** An accessible or decorative icon wrapper. Use IconButton for actions. */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon({ children, name, label, className, ...rest }, ref) {
  // Renders nothing for an unknown name or outside an IconProvider.
  const Named = useIcon(children == null ? name : undefined);
  return (
    <span {...rest} ref={ref} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cx(styles.icon, className)}>
      {children ?? (Named ? <Named /> : null)}
    </span>
  );
});
