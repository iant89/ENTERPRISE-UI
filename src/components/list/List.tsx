import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { findTypeaheadIndex, getNavigationIndex } from '../../utilities/keyboard';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import styles from './List.module.css';

export interface ListItemData {
  id: string;
  title: ReactNode;
  /** Plain-text title used for type-ahead (defaults to `title` when it is a string). */
  textValue?: string;
  description?: ReactNode;
  /** Leading visual: icon or Avatar. */
  leading?: ReactNode;
  /** Trailing content, e.g. a StatusIndicator or amount. */
  trailing?: ReactNode;
  /** Secondary trailing text, e.g. a date. */
  meta?: ReactNode;
  disabled?: boolean;
  href?: string;
}

export interface ListProps {
  items: ListItemData[];
  /** Accessible name. */
  'aria-label'?: string;
  /** Header text shown above the list. */
  header?: ReactNode;
  /** @default 'none' */
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Makes items activatable (navigation). Shows a chevron when there is no selection. */
  onItemClick?: (item: ListItemData) => void;
  /** Highlight this item as the current one (navigation lists). */
  currentId?: string;
  /** @default true */
  dividers?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

const textOf = (item: ListItemData) => item.textValue ?? (typeof item.title === 'string' ? item.title : '');

/**
 * Vertical list of items. Static, navigable (items are buttons/links) or
 * selectable (`role="listbox"` with arrow-key navigation and type-ahead).
 */
export function List({
  items, 'aria-label': ariaLabel, header, selectionMode = 'none', selectedIds, defaultSelectedIds = [], onSelectionChange,
  onItemClick, currentId, dividers = true, emptyState = 'No items', className,
}: ListProps) {
  const [selected, setSelected] = useControllableState(selectedIds, defaultSelectedIds, onSelectionChange);
  const [active, setActive] = useState(() => Math.max(0, items.findIndex((i) => selected.includes(i.id))));
  const listRef = useRef<HTMLUListElement>(null);
  const headerId = useId(undefined, 'list');
  const typeahead = useRef({ query: '', timer: undefined as ReturnType<typeof setTimeout> | undefined });
  const selectable = selectionMode !== 'none';
  const labelProps = { 'aria-label': ariaLabel, 'aria-labelledby': !ariaLabel && header ? headerId : undefined };

  const content = (item: ListItemData, showChevron: boolean) => (
    <>
      {selectionMode === 'multiple' && (
        <span className={styles.check} aria-hidden="true">
          {selected.includes(item.id) && <Check />}
        </span>
      )}
      {item.leading && <span className={styles.leading}>{item.leading}</span>}
      <span className={styles.text}>
        <span className={styles.title}>{item.title}</span>
        {item.description && <span className={styles.description}>{item.description}</span>}
      </span>
      {(item.trailing || item.meta) && (
        <span className={styles.trailing}>
          {item.trailing}
          {item.meta && <span className={styles.meta}>{item.meta}</span>}
        </span>
      )}
      {showChevron && (
        <span className={styles.chevron} aria-hidden="true">
          <ChevronRight />
        </span>
      )}
    </>
  );

  const head = header && (
    <div id={headerId} className={styles.header}>
      {header}
    </div>
  );

  if (items.length === 0) {
    return (
      <div className={className}>
        {head}
        <div className={styles.empty}>{emptyState}</div>
      </div>
    );
  }

  if (!selectable) {
    return (
      <div className={className}>
        {head}
        <ul className={cx(styles.list, !dividers && styles.noDividers)} {...labelProps}>
          {items.map((item) => {
            const isCurrent = currentId === item.id;
            if (item.href && !item.disabled)
              return (
                <li key={item.id}>
                  <a className={cx(styles.item, styles.interactive)} href={item.href} aria-current={isCurrent ? 'page' : undefined} onClick={() => onItemClick?.(item)}>
                    {content(item, true)}
                  </a>
                </li>
              );
            if (onItemClick)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cx(styles.item, styles.interactive)}
                    disabled={item.disabled}
                    aria-disabled={item.disabled || undefined}
                    aria-current={isCurrent ? 'true' : undefined}
                    onClick={() => onItemClick(item)}
                  >
                    {content(item, true)}
                  </button>
                </li>
              );
            return (
              <li key={item.id} className={styles.item}>
                {content(item, false)}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const focusItem = (index: number) => {
    setActive(index);
    listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[index]?.focus();
  };

  const toggle = (item: ListItemData) => {
    if (item.disabled) return;
    if (selectionMode === 'single') setSelected([item.id]);
    else setSelected(selected.includes(item.id) ? selected.filter((s) => s !== item.id) : [...selected, item.id]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const next = getNavigationIndex(event.key, active, items.length, { loop: false, isDisabled: (i) => !!items[i].disabled });
    if (next !== null) {
      event.preventDefault();
      focusItem(next);
      if (selectionMode === 'single' && !event.ctrlKey) toggle(items[next]);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggle(items[active]);
      if (event.key === 'Enter') onItemClick?.(items[active]);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && selectionMode === 'multiple') {
      event.preventDefault();
      setSelected(items.filter((i) => !i.disabled).map((i) => i.id));
      return;
    }
    if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey) {
      const state = typeahead.current;
      clearTimeout(state.timer);
      state.query += event.key;
      state.timer = setTimeout(() => (state.query = ''), 500);
      const found = findTypeaheadIndex(items.map(textOf), state.query, state.query.length > 1 ? active - 1 : active, (i) => !!items[i].disabled);
      if (found >= 0) focusItem(found);
    }
  };

  return (
    <div className={className}>
      {head}
      <ul
        ref={listRef}
        role="listbox"
        aria-multiselectable={selectionMode === 'multiple' || undefined}
        className={cx(styles.list, !dividers && styles.noDividers)}
        onKeyDown={onKeyDown}
        {...labelProps}
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            role="option"
            aria-selected={selected.includes(item.id)}
            aria-disabled={item.disabled || undefined}
            tabIndex={index === active ? 0 : -1}
            className={cx(styles.item, styles.interactive)}
            onFocus={() => setActive(index)}
            onClick={() => {
              setActive(index);
              toggle(item);
              onItemClick?.(item);
            }}
          >
            {content(item, false)}
          </li>
        ))}
      </ul>
    </div>
  );
}
