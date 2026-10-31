import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbsItemProps {
  /** Text or non-interactive content for this step. */
  children: ReactNode;
  /** Optional hyperlink for a non-current item. */
  href?: string;
  /** Link browsing context, only used when href is provided. */
  target?: string;
  /** Override the accessible name of the item. */
  'aria-label'?: string;
  /** Mark this item as the current page; its href is not used. @default false */
  current?: boolean;
  /** Show a decorative separator after the item. @default false */
  separator?: boolean;
  /** Called on activation. A handler can prevent the default link navigation. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Additional CSS class names for the root element. */
  className?: string;
}

/** One breadcrumb list item. Render within an ordered list in a navigation landmark. */
export const BreadcrumbsItem = forwardRef<HTMLLIElement, BreadcrumbsItemProps>(function BreadcrumbsItem(
  { children, href, target, 'aria-label': ariaLabel, current = false, separator = false, onClick, className }, ref,
) {
  const content = current && !onClick ? <span className={styles.current} aria-label={ariaLabel} aria-current="page">{children}</span>
    : current ? <button type="button" className={cx(styles.link, styles.current)} aria-label={ariaLabel} aria-current="page" onClick={onClick}>{children}</button>
      : href ? <a className={styles.link} href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} aria-label={ariaLabel} onClick={onClick}>{children}</a>
        : onClick ? <button type="button" className={styles.link} aria-label={ariaLabel} onClick={onClick}>{children}</button>
          : <span className={styles.current} aria-label={ariaLabel}>{children}</span>;
  return <li ref={ref} className={cx(styles.item, className)}>{content}{separator && <span className={styles.separator} aria-hidden="true"><ChevronRight /></span>}</li>;
});
