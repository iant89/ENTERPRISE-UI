import { forwardRef, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { findTypeaheadIndex, getNavigationIndex } from '../../utilities/keyboard';
import { useMergedRefs } from '../../utilities/refs';
import { useControllableState } from '../../hooks/useControllableState';
import { useClickOutside } from '../../hooks/useDismiss';
import { usePosition } from '../../hooks/usePosition';
import { useFormControl, type FieldProps } from '../form-field';
import inputBoxStyles from '../input/InputBox.module.css';
import { ListboxPopup, optionId, type SelectOption } from '../listbox';
import styles from '../listbox/Listbox.module.css';

export interface SelectProps<V extends string = string> extends FieldProps {
  options: SelectOption<V>[];
  /** Controlled selected value. `null` for no selection. */
  value?: V | null;
  /** @default null */
  defaultValue?: V | null;
  onChange?: (value: V | null) => void;
  /** @default 'Select' */
  placeholder?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  /** Form field name; renders a hidden input with the value. */
  name?: string;
  /** @default false */
  required?: boolean;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  readOnly?: boolean;
  /** Accessible name when there is no visible label. */
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
  /** Custom rendering of the selected value. */
  renderValue?: (option: SelectOption<V>) => ReactNode;
}

/**
 * Choose one option from a list (select-only combobox). Supports arrow
 * keys, Home/End, type-ahead, Enter/Space to select and Escape to close.
 */
function SelectInner<V extends string = string>(
  {
    label, description, error, status, statusMessage, hideLabel, labelPosition,
    options, value, defaultValue = null, onChange, placeholder = 'Select', size = 'md',
    id, name, required, disabled, readOnly, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, className, renderValue,
  }: SelectProps<V>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled, 'aria-describedby': ariaDescribedBy });
  const [selected, setSelected] = useControllableState<V | null>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const merged = useMergedRefs(ref, triggerRef);
  const typeahead = useRef({ query: '', timer: undefined as ReturnType<typeof setTimeout> | undefined });
  const listId = `${control.id}-listbox`;
  const valueId = `${control.id}-value`;
  const { style } = usePosition({ open, anchorRef: triggerRef, floatingRef: listRef, matchWidth: true });

  const selectedIndex = options.findIndex((o) => o.value === selected);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const isDisabled = (i: number) => !!options[i]?.disabled;
  const interactive = !control.disabled && !readOnly;

  useClickOutside([triggerRef, listRef], () => setOpen(false), open);

  const openList = (index = selectedIndex >= 0 ? selectedIndex : options.findIndex((o) => !o.disabled)) => {
    if (!interactive) return;
    setActive(index);
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    setSelected(option.value);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const { key } = event;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        event.preventDefault();
        openList();
      } else if (key === 'Home' || key === 'End') {
        event.preventDefault();
        openList(getNavigationIndex(key, 0, options.length, { isDisabled }) ?? 0);
      }
    } else {
      const next = getNavigationIndex(key, active, options.length, { isDisabled, loop: false });
      if (next !== null) {
        event.preventDefault();
        setActive(next);
        return;
      }
      if (key === 'PageDown' || key === 'PageUp') {
        event.preventDefault();
        setActive((a) => Math.max(0, Math.min(options.length - 1, a + (key === 'PageDown' ? 10 : -10))));
        return;
      }
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        choose(active);
        return;
      }
      if (key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        return;
      }
      if (key === 'Tab') {
        if (active >= 0) choose(active);
        setOpen(false);
        return;
      }
    }
    if (key.length === 1 && /\S/.test(key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const state = typeahead.current;
      clearTimeout(state.timer);
      state.query += key;
      state.timer = setTimeout(() => (state.query = ''), 500);
      const from = open ? active : selectedIndex;
      const found = findTypeaheadIndex(options.map((o) => o.label), state.query, state.query.length > 1 ? from - 1 : from, isDisabled);
      if (found >= 0) {
        if (open) setActive(found);
        else setSelected(options[found].value);
      }
    }
  };

  const labelledBy = [control.labelId, valueId].filter(Boolean).join(' ');

  return control.wrap(
    <>
      <div
        ref={merged}
        id={control.id}
        role="combobox"
        tabIndex={control.disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? optionId(listId, active) : undefined}
        aria-labelledby={control.labelId ? labelledBy : undefined}
        aria-label={control.labelId ? undefined : ariaLabel}
        aria-disabled={control.disabled || undefined}
        aria-readonly={readOnly || undefined}
        {...control.ariaProps}
        className={cx(
          inputBoxStyles.box,
          styles.trigger,
          size !== 'md' && inputBoxStyles[size],
          control.status !== 'none' && inputBoxStyles[control.status],
          control.disabled && inputBoxStyles.disabled,
          readOnly && inputBoxStyles.readOnly,
          open && styles.open,
          className,
        )}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        onBlur={(event) => {
          if (!listRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
        }}
      >
        <span id={valueId} className={cx(styles.value, !selectedOption && styles.placeholder)}>
          {selectedOption ? (renderValue ? renderValue(selectedOption) : selectedOption.label) : placeholder}
        </span>
        <span className={styles.chevron} aria-hidden="true">
          <ChevronDown />
        </span>
      </div>
      {name && <input type="hidden" name={name} value={selected ?? ''} />}
      {open && (
        <ListboxPopup
          ref={listRef}
          id={listId}
          options={options}
          activeIndex={active}
          isSelected={(o) => o.value === selected}
          onSelect={(_, index) => choose(index)}
          onActiveChange={setActive}
          labelledBy={control.labelId}
          aria-label={control.labelId ? undefined : ariaLabel}
          style={style}
        />
      )}
    </>,
  );
}

export const Select = forwardRef(SelectInner) as <V extends string = string>(
  props: SelectProps<V> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof SelectInner>;
