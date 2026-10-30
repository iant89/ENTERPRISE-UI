import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react';
import { Avatar, type AvatarProps } from '../avatar';
import { cx } from '../../utilities/cx';
import styles from './AvatarGroup.module.css';

export interface AvatarGroupItem extends Pick<AvatarProps, 'name' | 'src' | 'icon' | 'presence' | 'accent'> {
  /** Stable unique identifier. */
  id: string;
  /** Accessible name for this member. */
  name: string;
}

export interface AvatarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: AvatarGroupItem[];
  /** Overlapping group or individually navigable avatars. @default 'group' */
  mode?: 'group' | 'individual';
  /** @default 'md' */
  size?: AvatarProps['size'];
  /** Accessible name for the group. */
  'aria-label': string;
  /** Called with all items when the group is activated. */
  onGroupPress?: (items: AvatarGroupItem[]) => void;
  /** Called when an individual avatar is activated. */
  onItemPress?: (item: AvatarGroupItem) => void;
  /** Called with currently hidden items when overflow is activated. */
  onOverflowPress?: (items: AvatarGroupItem[]) => void;
  /** Localized accessible label for the overflow indicator. */
  overflowLabel?: (count: number) => string;
}

const sizes = { xs: 1.5, sm: 2, md: 2.5, lg: 3.5, xl: 5 };

/** Displays related avatars, collapsing those that do not fit into an overflow indicator. */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { items, mode = 'group', size = 'md', 'aria-label': label, onGroupPress, onItemPress, onOverflowPress, overflowLabel = (count) => `${count} more`, className, ...rest }, ref,
) {
  const container = useRef<HTMLDivElement>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const [width, setWidth] = useState<number>();
  const [rem, setRem] = useState(16);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const measure = () => {
      setWidth(el.getBoundingClientRect().width);
      setRem(parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const avatarWidth = sizes[size] * rem;
  const step = mode === 'group' ? avatarWidth * 0.75 : avatarWidth + 4;
  const required = items.length ? avatarWidth + (items.length - 1) * step : 0;
  // Zero-width measurements are common in SSR, hidden panels and test environments.
  const visibleCount = width && required > width ? Math.max(0, Math.min(items.length, Math.floor((width - avatarWidth) / step))) : items.length;
  const visible = items.slice(0, visibleCount);
  const hidden = items.slice(visibleCount);
  const safeActive = Math.min(active, Math.max(0, visible.length - 1));
  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    if (event.key === 'ArrowRight') next += rtl ? -1 : 1;
    else if (event.key === 'ArrowLeft') next += rtl ? 1 : -1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = visible.length - 1;
    else return;
    event.preventDefault();
    next = Math.max(0, Math.min(visible.length - 1, next));
    setActive(next);
    buttons.current[next]?.focus();
  };
  const overflow = hidden.length > 0 && <span className={cx(styles.more, styles[size])} aria-hidden="true">+{hidden.length}</span>;
  const avatar = ({ id, ...item }: AvatarGroupItem, decorative = false) => <Avatar key={id} {...item} size={size} decorative={decorative} />;
  const avatars = visible.map((item) => avatar(item, true));
  return <div {...rest} ref={ref} className={cx(styles.root, className)} style={{ ...rest.style, '--group-size': `${sizes[size]}rem` } as React.CSSProperties}>
    <div ref={container} className={styles.measure}>
      {mode === 'group' ? onGroupPress && items.length ? <button type="button" aria-label={label} className={cx(styles.group, styles.interactive)} onClick={() => onGroupPress(items)}>{avatars}{overflow}</button> : <div role="group" aria-label={label} className={styles.group}>{visible.map((item) => avatar(item))}{hidden.length > 0 && <span role="img" className={cx(styles.more, styles[size])} aria-label={overflowLabel(hidden.length)}>+{hidden.length}</span>}</div>
        : <div role="group" aria-label={label} className={styles.individual}>
          {visible.map((item, index) => onItemPress ? <button key={item.id} ref={(node) => { buttons.current[index] = node; }} type="button" className={styles.interactive} aria-label={item.name} tabIndex={index === safeActive ? 0 : -1} onFocus={() => setActive(index)} onKeyDown={(event) => move(event, index)} onClick={() => onItemPress(item)}>{avatar(item, true)}</button> : avatar(item))}
          {hidden.length > 0 && (onOverflowPress ? <button type="button" className={styles.interactive} aria-label={overflowLabel(hidden.length)} onClick={() => onOverflowPress(hidden)}>{overflow}</button> : <span role="img" className={cx(styles.more, styles[size])} aria-label={overflowLabel(hidden.length)}>+{hidden.length}</span>)}
        </div>}
    </div>
  </div>;
});
