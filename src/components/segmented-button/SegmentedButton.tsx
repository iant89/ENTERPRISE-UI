import { forwardRef, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './SegmentedButton.module.css';

export interface SegmentedButtonItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Required for icon-only items. */
  ariaLabel?: string;
  disabled?: boolean;
}

export interface SegmentedButtonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Items shown in the segmented button. */
  items: SegmentedButtonItem[];
  /** Selected values. Single mode keeps at most one. */
  value?: string[];
  /** @default [] */
  /** IDs of the items selected initially when the selection is uncontrolled. */
  defaultValue?: string[];
  /** Called with the IDs of the selected items when the selection changes. */
  onChange?: (value: string[]) => void;
  /** @default 'single' */
  /** Whether one item or several items can be selected. */
  selectionMode?: 'single' | 'multiple';
  /** Accessible group name. */
  'aria-label': string;
  /** @default 'md' */
  /** Size of the segmented button. */
  size?: 'sm' | 'md';
}

/** A set of mutually exclusive (or multi-select) toggle buttons with arrow-key navigation. */
export const SegmentedButton = forwardRef<HTMLDivElement, SegmentedButtonProps>(function SegmentedButton(
  { items, value, defaultValue = [], onChange, selectionMode = 'single', size = 'md', className, onKeyDown, ...rest },
  ref,
) {
  const [selected, setSelected] = useControllableState(value, defaultValue, onChange);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const toggle = (item: SegmentedButtonItem) => {
    if (selectionMode === 'single') setSelected([item.value]);
    else setSelected(selected.includes(item.value) ? selected.filter((v) => v !== item.value) : [...selected, item.value]);
  };
  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (event.defaultPrevented || !keys.includes(event.key)) return;
    const enabled = buttons.current.filter((b): b is HTMLButtonElement => !!b && !b.disabled);
    const index = enabled.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const delta = event.key === 'ArrowRight' ? (rtl ? -1 : 1) : event.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (index + delta + enabled.length) % enabled.length;
    enabled[next]?.focus();
  };
  return (
    <div ref={ref} role="group" className={cx(styles.root, size === 'sm' && styles.sm, className)} onKeyDown={handleKey} {...rest}>
      {items.map((item, i) => {
        const pressed = selected.includes(item.value);
        return (
          <button
            key={item.value}
            ref={(el) => { buttons.current[i] = el; }}
            type="button"
            className={cx(styles.item, pressed && styles.selected)}
            aria-pressed={pressed}
            aria-label={item.ariaLabel}
            disabled={item.disabled}
            onClick={() => toggle(item)}
          >
            {item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );
});
