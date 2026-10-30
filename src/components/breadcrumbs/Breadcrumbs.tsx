import { forwardRef, type HTMLAttributes, type MouseEvent } from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { BreadcrumbsItem } from './BreadcrumbsItem';
import { cx } from '../../utilities/cx';
import { DropdownMenu } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** Optional browsing context for links. */
  target?: string;
  /** Override the accessible name. */
  ariaLabel?: string;
  onClick?: (event: MouseEvent) => void;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  /** Path from the root to the current page. The last item is the current page. */
  items: BreadcrumbItem[];
  /** Collapse middle items into a menu when there are more than this. Minimum 3. @default 5 */
  maxItems?: number;
  /** Show the last (current) item. @default true */
  showCurrent?: boolean;
  /** Accessible name for the collapsed-items menu. @default 'Hidden breadcrumbs' */
  overflowMenuLabel?: string;
  /** Localized label for the overflow trigger. */
  overflowTriggerLabel?: (count: number) => string;
  /** @default 'Breadcrumb' */
  'aria-label'?: string;
}

/** Shows the user's location in a hierarchy and links to parent pages. */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, maxItems = 5, showCurrent = true, overflowMenuLabel = 'Hidden breadcrumbs', overflowTriggerLabel = (count) => `Show ${count} more`, className, 'aria-label': ariaLabel = 'Breadcrumb', ...rest },
  ref,
) {
  const visibleItems = showCurrent ? items : items.slice(0, -1);
  const limit = Number.isFinite(maxItems) ? Math.max(3, Math.floor(maxItems)) : 5;
  const collapse = visibleItems.length > limit;
  const head = collapse ? visibleItems.slice(0, 1) : visibleItems;
  const hidden = collapse ? visibleItems.slice(1, visibleItems.length - (limit - 2)) : [];
  const tail = collapse ? visibleItems.slice(visibleItems.length - (limit - 2)) : [];

  const renderItem = (item: BreadcrumbItem, isLast: boolean, key: number) => (
    <BreadcrumbsItem key={key} href={item.href} target={item.target} aria-label={item.ariaLabel}
      current={isLast && showCurrent} separator={!isLast} onClick={item.onClick}>{item.label}</BreadcrumbsItem>
  );

  return (
    <nav ref={ref} aria-label={ariaLabel} className={cx(styles.nav, className)} {...rest}>
      <ol className={styles.list}>
        {head.map((item, i) => renderItem(item, !collapse && i === head.length - 1, i))}
        {collapse && (
          <li className={styles.item}>
            <DropdownMenu
              aria-label={overflowMenuLabel}
              items={hidden.map((item, i) => ({ id: String(i), label: item.label, href: item.href, target: item.target, ariaLabel: item.ariaLabel, onSelect: item.onClick }))}
              trigger={<IconButton icon={<MoreHorizontal />} label={overflowTriggerLabel(hidden.length)} size="sm" />}
            />
            <span className={styles.separator} aria-hidden="true"><ChevronRight /></span>
          </li>
        )}
        {tail.map((item, i) => renderItem(item, i === tail.length - 1, head.length + hidden.length + i))}
      </ol>
    </nav>
  );
});
