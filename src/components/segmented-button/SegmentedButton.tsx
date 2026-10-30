import { Children, Fragment, isValidElement, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './SegmentedButton.module.css';

export interface SegmentedButtonItemProps {
  /** Stable value for this segment. */
  id: string;
  /** Visible label. */
  children?: ReactNode;
  /** Accessible name when the visible content is not text. */
  accessibleName?: string;
  icon?: ReactNode;
  /** @default false */
  disabled?: boolean;
}
/** One choice inside SegmentedButton. */
export function SegmentedButtonItem(_props: SegmentedButtonItemProps): null {
  return null;
}

export interface SegmentedButtonProps {
  /** Accessible name of the group. */
  accessibleName: string;
  /** @default 'single' */
  selectionMode?: 'single' | 'multiple';
  /** Selected id, or ids when `selectionMode` is `multiple`. */
  value?: string | readonly string[];
  defaultValue?: string | readonly string[];
  onChange?: (value: string | string[]) => void;
  /** Size each item to its content instead of sharing the width equally. @default false */
  itemsFitContent?: boolean;
  /** @default false */
  disabled?: boolean;
  children?: ReactNode;
}

interface SegmentItem {
  id: string;
  children?: ReactNode;
  accessibleName?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

function readItems(children: ReactNode): SegmentItem[] {
  const items: SegmentItem[] = [];
  const visit = (nodes: ReactNode) => {
    Children.forEach(nodes, (node) => {
      if (!isValidElement(node)) return;
      if (node.type === Fragment) {
        visit((node.props as { children?: ReactNode }).children);
        return;
      }
      if (node.type !== SegmentedButtonItem) return;
      const props = node.props as SegmentedButtonItemProps;
      if (!props.id) return;
      items.push(props);
    });
  };
  visit(children);
  return items;
}

function asIds(value: string | readonly string[] | undefined): string[] {
  if (value == null) return [];
  return typeof value === 'string' ? [value] : [...value];
}

/** A single or multiple selection group of adjacent buttons. */
export function SegmentedButton({
  accessibleName, selectionMode = 'single', value, defaultValue, onChange, itemsFitContent = false, disabled = false, children,
}: SegmentedButtonProps) {
  const items = readItems(children);
  const [selected, setSelected] = useControllableState<string[]>(
    value === undefined ? undefined : asIds(value),
    asIds(defaultValue),
    (next) => onChange?.(selectionMode === 'single' ? next[0] ?? '' : next),
  );
  const enabled = items.filter((item) => !item.disabled && !disabled);
  const initialActive = enabled.find((item) => selected.includes(item.id))?.id ?? enabled[0]?.id ?? '';
  const [active, setActive] = useState(initialActive);
  const activeId = enabled.some((item) => item.id === active) ? active : initialActive;
  const choose = (id: string) => {
    if (disabled) return;
    const item = items.find((entry) => entry.id === id);
    if (!item || item.disabled) return;
    setActive(id);
    if (selectionMode === 'single') setSelected([id]);
    else setSelected(selected.includes(id) ? selected.filter((entry) => entry !== id) : [...selected, id]);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rtl = event.currentTarget.closest('[dir="rtl"]') != null;
    const order = [...enabled];
    const index = Math.max(0, order.findIndex((item) => item.id === activeId));
    const previousKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const next = event.key === previousKey || event.key === 'ArrowUp'
      ? (index - 1 + order.length) % order.length
      : event.key === nextKey || event.key === 'ArrowDown'
        ? (index + 1) % order.length
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? order.length - 1
            : null;
    if (next == null || order.length === 0) return;
    event.preventDefault();
    const target = order[next];
    if (!target) return;
    setActive(target.id);
    if (selectionMode === 'single') setSelected([target.id]);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-segment="${CSS.escape(target.id)}"]`)?.focus();
  };
  return (
    <div
      role={selectionMode === 'single' ? 'radiogroup' : 'group'}
      aria-label={accessibleName}
      className={cx(styles.group, itemsFitContent && styles.fit)}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const isSelected = selected.includes(item.id);
        const isDisabled = disabled || item.disabled;
        return (
          <button
            key={item.id}
            type="button"
            data-segment={item.id}
            className={styles.item}
            role={selectionMode === 'single' ? 'radio' : undefined}
            aria-checked={selectionMode === 'single' ? isSelected : undefined}
            aria-pressed={selectionMode === 'multiple' ? isSelected : undefined}
            aria-label={item.accessibleName}
            disabled={isDisabled}
            tabIndex={item.id === activeId ? 0 : -1}
            onClick={() => choose(item.id)}
          >
            {item.icon}
            {item.children}
          </button>
        );
      })}
    </div>
  );
}
