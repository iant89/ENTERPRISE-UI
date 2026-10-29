import { forwardRef, type HTMLAttributes, type MouseEvent } from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { DropdownMenu } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: (event: MouseEvent) => void;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  /** Path from the root to the current page. The last item is the current page. */
  items: BreadcrumbItem[];
  /** Collapse middle items into a menu when there are more than this. @default 5 */
  maxItems?: number;
  /** Show the last (current) item. @default true */
  showCurrent?: boolean;
  /** @default 'Breadcrumb' */
  'aria-label'?: string;
}

/** Shows the user's location in a hierarchy and links to parent pages. */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, maxItems = 5, showCurrent = true, className, 'aria-label': ariaLabel = 'Breadcrumb', ...rest },
  ref,
) {
  const visibleItems = showCurrent ? items : items.slice(0, -1);
  const collapse = visibleItems.length > maxItems;
  const head = collapse ? visibleItems.slice(0, 1) : visibleItems;
  const hidden = collapse ? visibleItems.slice(1, visibleItems.length - (maxItems - 2)) : [];
  const tail = collapse ? visibleItems.slice(visibleItems.length - (maxItems - 2)) : [];

  const renderItem = (item: BreadcrumbItem, isLast: boolean) => {
    const isCurrent = isLast && showCurrent;
    return (
      <li key={`${item.label}-${item.href ?? ''}`} className={styles.item}>
        {isCurrent ? (
          <span className={styles.current} aria-current="page">
            {item.label}
          </span>
        ) : item.href ? (
          <a className={styles.link} href={item.href} onClick={item.onClick}>
            {item.label}
          </a>
        ) : (
          <button type="button" className={styles.link} onClick={item.onClick}>
            {item.label}
          </button>
        )}
        {!isLast && <span className={styles.separator} aria-hidden="true"><ChevronRight /></span>}
      </li>
    );
  };

  return (
    <nav ref={ref} aria-label={ariaLabel} className={cx(styles.nav, className)} {...rest}>
      <ol className={styles.list}>
        {head.map((item, i) => renderItem(item, !collapse && i === head.length - 1))}
        {collapse && (
          <li className={styles.item}>
            <DropdownMenu
              aria-label="Hidden breadcrumbs"
              items={hidden.map((item, i) => ({ id: String(i), label: item.label, href: item.href, onSelect: item.onClick }))}
              trigger={<IconButton icon={<MoreHorizontal />} label={`Show ${hidden.length} more`} size="sm" />}
            />
            <span className={styles.separator} aria-hidden="true"><ChevronRight /></span>
          </li>
        )}
        {tail.map((item, i) => renderItem(item, i === tail.length - 1))}
      </ol>
    </nav>
  );
});
