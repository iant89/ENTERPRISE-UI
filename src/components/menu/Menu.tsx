import { forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { findTypeaheadIndex, getNavigationIndex } from '../../utilities/keyboard';
import { focusElement } from '../../utilities/focus';
import { useMergedRefs } from '../../utilities/refs';
import styles from './Menu.module.css';

export interface MenuItemDef {
  /** Unique id, passed to `onAction`. */
  id: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  /** Keyboard shortcut hint, e.g. `Ctrl+S`. Display only. */
  shortcut?: string;
  disabled?: boolean;
  /** Style as a destructive action. */
  destructive?: boolean;
  /** When defined, the item is a `menuitemcheckbox` with this state. */
  checked?: boolean;
  /** Render as a link. */
  href?: string;
  /** Browsing context for link items. */
  target?: string;
  /** Override the item's accessible name. */
  ariaLabel?: string;
  /**
   * Called when the item is activated (in addition to `onAction`). Receives the
   * click event — keyboard activation is delivered as a click — so link items
   * can call `event.preventDefault()` to handle navigation themselves.
   */
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

export interface MenuSeparator {
  type: 'separator';
  id?: string;
}

export interface MenuGroupLabel {
  type: 'label';
  id?: string;
  label: string;
}

export type MenuEntry = MenuItemDef | MenuSeparator | MenuGroupLabel;

const isItem = (entry: MenuEntry): entry is MenuItemDef => !('type' in entry);

export interface MenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'autoFocus'> {
  items: MenuEntry[];
  /** Called with the id of the activated item. */
  onAction?: (id: string) => void;
  /** Called when the menu requests to close (after activation, Escape or Tab). */
  onClose?: (reason: 'select' | 'escape' | 'tab') => void;
  /** Move focus into the menu on mount. @default false */
  autoFocus?: boolean | 'first' | 'last';
}

/**
 * A list of actions (`role="menu"`) with roving focus, arrow-key and
 * type-ahead navigation. Usually rendered by DropdownMenu or SplitButton.
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { items, onAction, onClose, autoFocus = false, className, ...rest },
  ref,
) {
  const listRef = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, listRef);
  const actionable = useMemo(() => items.filter(isItem), [items]);
  const [active, setActive] = useState(() => {
    const first = actionable.findIndex((i) => !i.disabled);
    if (autoFocus === 'last') {
      for (let i = actionable.length - 1; i >= 0; i--) if (!actionable[i].disabled) return i;
    }
    return Math.max(first, 0);
  });
  const typeahead = useRef({ query: '', timer: undefined as ReturnType<typeof setTimeout> | undefined });

  const focusIndex = (index: number) => {
    setActive(index);
    focusElement(listRef.current?.querySelectorAll<HTMLElement>('[data-eui-menu-item]')[index]);
  };

  useEffect(() => {
    if (!autoFocus) return;
    const frame = requestAnimationFrame(() => focusIndex(active));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activate = (item: MenuItemDef, event: MouseEvent<HTMLElement>) => {
    if (item.disabled) return;
    item.onSelect?.(event);
    onAction?.(item.id);
    onClose?.('select');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = getNavigationIndex(event.key, active, actionable.length, { isDisabled: (i) => !!actionable[i]?.disabled });
    if (next !== null) {
      event.preventDefault();
      focusIndex(next);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose?.('escape');
      return;
    }
    if (event.key === 'Tab') {
      onClose?.('tab');
      return;
    }
    if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const state = typeahead.current;
      clearTimeout(state.timer);
      state.query += event.key;
      state.timer = setTimeout(() => (state.query = ''), 500);
      const found = findTypeaheadIndex(actionable.map((i) => i.label), state.query, state.query.length > 1 ? active - 1 : active, (i) => !!actionable[i].disabled);
      if (found >= 0) focusIndex(found);
    }
  };

  let index = -1;
  return (
    <div ref={merged} role="menu" aria-orientation="vertical" className={cx(styles.menu, className)} onKeyDown={onKeyDown} {...rest}>
      {items.map((entry, i) => {
        if (!isItem(entry)) {
          if (entry.type === 'separator') return <div key={entry.id ?? `sep-${i}`} role="separator" className={styles.separator} />;
          return (
            <div key={entry.id ?? `label-${i}`} role="presentation" className={styles.groupLabel}>
              {entry.label}
            </div>
          );
        }
        index += 1;
        const itemIndex = index;
        const isCheckbox = entry.checked !== undefined;
        const common = {
          'data-eui-menu-item': '',
          'aria-label': entry.ariaLabel,
          role: isCheckbox ? 'menuitemcheckbox' : 'menuitem',
          'aria-checked': isCheckbox ? entry.checked : undefined,
          'aria-disabled': entry.disabled || undefined,
          tabIndex: itemIndex === active ? 0 : -1,
          className: cx(styles.item, entry.destructive && styles.destructive),
          onFocus: () => setActive(itemIndex),
          onMouseMove: () => {
            if (!entry.disabled && document.activeElement !== listRef.current?.querySelectorAll('[data-eui-menu-item]')[itemIndex]) focusIndex(itemIndex);
          },
        };
        const inner = (
          <>
            {(entry.icon || isCheckbox) && (
              <span className={cx(styles.icon, isCheckbox && styles.check)} aria-hidden="true">
                {isCheckbox ? entry.checked ? <Check /> : null : entry.icon}
              </span>
            )}
            <span className={styles.text}>
              <span>{entry.label}</span>
              {entry.description && <span className={styles.description}>{entry.description}</span>}
            </span>
            {entry.shortcut && <span className={styles.shortcut}>{entry.shortcut}</span>}
          </>
        );
        if (entry.href && !entry.disabled) {
          return (
            <a key={entry.id} href={entry.href} target={entry.target} rel={entry.target === '_blank' ? 'noopener noreferrer' : undefined} {...common} onClick={(event) => activate(entry, event)}>
              {inner}
            </a>
          );
        }
        return (
          <div
            key={entry.id}
            {...common}
            onClick={(event) => activate(entry, event)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                // Activate through a click so onSelect always receives a MouseEvent.
                event.currentTarget.click();
              }
            }}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
});
