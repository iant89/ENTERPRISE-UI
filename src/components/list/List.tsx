import { Fragment, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { findTypeaheadIndex, getNavigationIndex } from '../../utilities/keyboard';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { listHighlightLabel, readListItems, type ListItemHighlight } from './items';
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
  /** Group heading shared by consecutive items. */
  group?: string;
  /** Accessible name of the group when it differs from `group`. */
  groupAccessibleName?: string;
  /** Visible status text. */
  highlight?: Exclude<ListItemHighlight, 'none'>;
}

export interface ListProps {
  /** Row model. Used instead of item elements when provided. */
  items?: ListItemData[];
  /** ListItemStandard, ListItemCustom and ListItemGroup elements. */
  children?: ReactNode;
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

function blocksOf(items: ListItemData[]) {
  const blocks: Array<{ key: string; label?: string; accessibleName?: string; items: Array<{ item: ListItemData; index: number }> }> = [];
  items.forEach((item, index) => {
    const last = blocks[blocks.length - 1];
    if (last && last.label === item.group && last.accessibleName === item.groupAccessibleName) last.items.push({ item, index });
    else blocks.push({ key: `${item.group ?? 'items'}-${index}`, label: item.group, accessibleName: item.groupAccessibleName, items: [{ item, index }] });
  });
  return blocks;
}

/**
 * Vertical list of items. Static, navigable (items are buttons/links) or
 * selectable (`role="listbox"` with arrow-key navigation and type-ahead).
 */
export function List({
  items, children, 'aria-label': ariaLabel, header, selectionMode = 'none', selectedIds, defaultSelectedIds = [], onSelectionChange,
  onItemClick, currentId, dividers = true, emptyState = 'No items', className,
}: ListProps) {
  const resolved = items ?? readListItems(children);
  const [selected, setSelected] = useControllableState(selectedIds, defaultSelectedIds, onSelectionChange);
  const [active, setActive] = useState(() => Math.max(0, resolved.findIndex((i) => selected.includes(i.id))));
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
      {(item.trailing || item.meta || item.highlight) && (
        <span className={styles.trailing}>
          {item.highlight && <span className={cx(styles.highlight, styles[item.highlight])}> {listHighlightLabel[item.highlight]}</span>}
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

  const renderBlocks = (renderItem: (item: ListItemData, index: number) => ReactNode) =>
    blocksOf(resolved).map((block) => {
      const nodes = block.items.map(({ item, index }) => renderItem(item, index));
      if (!block.label) return <Fragment key={block.key}>{nodes}</Fragment>;
      const labelId = `${headerId}-${block.key}`;
      const named = block.accessibleName && block.accessibleName !== block.label;
      return (
        <li key={block.key} role={selectable ? 'presentation' : undefined} className={styles.group}>
          <div id={labelId} className={styles.groupHeader} aria-hidden={selectable || named || undefined}>{block.label}</div>
          <ul
            role={selectable ? 'group' : undefined}
            aria-labelledby={selectable && !named ? labelId : undefined}
            aria-label={named ? block.accessibleName : undefined}
            className={styles.groupList}
          >
            {nodes}
          </ul>
        </li>
      );
    });

  const head = header && (
    <div id={headerId} className={styles.header}>
      {header}
    </div>
  );

  if (resolved.length === 0) {
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
          {renderBlocks((item) => {
            const isCurrent = currentId === item.id;
            const customName = typeof item.title === 'string' ? undefined : item.textValue;
            if (item.href && !item.disabled)
              return (
                <li key={item.id}>
                  <a className={cx(styles.item, styles.interactive)} href={item.href} aria-label={customName} aria-current={isCurrent ? 'page' : undefined} onClick={() => onItemClick?.(item)}>
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
                    aria-label={customName}
                    aria-disabled={item.disabled || undefined}
                    aria-current={isCurrent ? 'true' : undefined}
                    onClick={() => onItemClick(item)}
                  >
                    {content(item, true)}
                  </button>
                </li>
              );
            return (
              <li key={item.id} className={styles.item} aria-label={customName}>
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
    const next = getNavigationIndex(event.key, active, resolved.length, { loop: false, isDisabled: (i) => !!resolved[i].disabled });
    if (next !== null) {
      event.preventDefault();
      focusItem(next);
      if (selectionMode === 'single' && !event.ctrlKey) toggle(resolved[next]);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggle(resolved[active]);
      if (event.key === 'Enter') onItemClick?.(resolved[active]);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && selectionMode === 'multiple') {
      event.preventDefault();
      setSelected(resolved.filter((i) => !i.disabled).map((i) => i.id));
      return;
    }
    if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey) {
      const state = typeahead.current;
      clearTimeout(state.timer);
      state.query += event.key;
      state.timer = setTimeout(() => (state.query = ''), 500);
      const found = findTypeaheadIndex(resolved.map(textOf), state.query, state.query.length > 1 ? active - 1 : active, (i) => !!resolved[i].disabled);
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
        {renderBlocks((item, index) => (
          <li
            key={item.id}
            role="option"
            aria-label={typeof item.title === 'string' ? undefined : item.textValue}
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
