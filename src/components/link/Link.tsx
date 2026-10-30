import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Link.module.css';
export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Destination of the hyperlink. */
  href: string;
}
/** Native hyperlink for navigation. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ className, target, rel, ...rest }, ref) {
  return <a {...rest} ref={ref} target={target} rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)} className={cx(styles.link, className)} />;
});
