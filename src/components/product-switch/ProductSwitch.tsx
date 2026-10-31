import { forwardRef, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './ProductSwitch.module.css';

export interface ProductSwitchItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Navigates natively when set. */
  href?: string;
  target?: string;
  /** Marks the current product. */
  current?: boolean;
}

export interface ProductSwitchProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Items shown in the product switch. */
  items: ProductSwitchItem[];
  /** Called for items without `href`, and before native navigation for items with one. */
  onItemClick?: (item: ProductSwitchItem) => void;
  /** Accessible name. @default 'Products' */
  'aria-label'?: string;
  /** Columns on wide screens. @default 4 */
  columns?: 3 | 4;
}

/** A grid of applications or products to switch between, with 2D arrow-key navigation. */
export const ProductSwitch = forwardRef<HTMLElement, ProductSwitchProps>(function ProductSwitch(
  { items, onItemClick, columns = 4, className, 'aria-label': label = 'Products', ...rest },
  ref,
) {
  const tiles = useRef<(HTMLElement | null)[]>([]);
  const onKey = (event: KeyboardEvent, index: number) => {
    const el = event.currentTarget.closest('ul');
    const cols = el ? Math.max(1, getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length) : columns;
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
    let next = event.key in moves ? index + moves[event.key] : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : -1;
    if (next < 0 && !(event.key in moves)) return;
    next = Math.max(0, Math.min(items.length - 1, next));
    event.preventDefault();
    tiles.current[next]?.focus();
  };
  return (
    <nav ref={ref} aria-label={label} className={cx(styles.root, className)} {...rest}>
      <ul className={cx(styles.grid, columns === 3 && styles.three)}>
        {items.map((item, index) => {
          const content = <>{item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}<span className={styles.title}>{item.title}</span>{item.subtitle && <span className={styles.subtitle}>{item.subtitle}</span>}</>;
          const common = { ref: (el: HTMLElement | null) => { tiles.current[index] = el; }, className: cx(styles.tile, item.current && styles.current), 'aria-current': item.current ? ('page' as const) : undefined, onKeyDown: (e: KeyboardEvent) => onKey(e, index), onClick: () => onItemClick?.(item) };
          return <li key={item.id}>{item.href ? <a {...common} href={item.href} target={item.target}>{content}</a> : <button {...common} type="button">{content}</button>}</li>;
        })}
      </ul>
    </nav>
  );
});
