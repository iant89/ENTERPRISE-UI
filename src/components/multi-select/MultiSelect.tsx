import { forwardRef, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { getNavigationIndex } from '../../utilities/keyboard';
import { useMergedRefs } from '../../utilities/refs';
import { useControllableState } from '../../hooks/useControllableState';
import { useClickOutside } from '../../hooks/useDismiss';
import { usePosition } from '../../hooks/usePosition';
import { useAnnouncer } from '../../themes/ThemeProvider';
import { useFormControl, type FieldProps } from '../form-field';
import { inputBoxStyles } from '../input';
import { ListboxPopup, listboxStyles, optionId, type SelectOption } from '../listbox';
import styles from './MultiSelect.module.css';

export interface MultiSelectProps extends FieldProps {
  options: SelectOption[];
  /** Controlled selected values. */
  value?: string[];
  /** @default [] */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  /** Maximum tokens shown before collapsing into “+N more”. @default 3 */
  maxVisibleTokens?: number;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  name?: string;
  /** @default false */
  required?: boolean;
  /** @default false */
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  emptyText?: ReactNode;
  className?: string;
}

/**
 * Select several options from a filterable list. Selected values appear as
 * removable tokens; Backspace removes the last token.
 */
export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(function MultiSelect(
  {
    label, description, error, status, statusMessage, hideLabel, labelPosition,
    options, value, defaultValue = [], onChange, placeholder = 'Select', maxVisibleTokens = 3, size = 'md',
    id, name, required, disabled, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, emptyText, className,
  },
  ref,
) {
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled, 'aria-describedby': ariaDescribedBy });
  const [selected, setSelected] = useControllableState<string[]>(value, defaultValue, onChange);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const announce = useAnnouncer();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const merged = useMergedRefs(ref, inputRef);
  const listId = `${control.id}-listbox`;
  const summaryId = `${control.id}-summary`;
  const { style } = usePosition({ open, anchorRef: boxRef, floatingRef: listRef, matchWidth: true });

  const visible = useMemo(
    () => (query ? options.filter((o) => o.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())) : options),
    [options, query],
  );
  const selectedOptions = selected.map((v) => options.find((o) => o.value === v) ?? { value: v, label: v });

  useClickOutside([boxRef, listRef], () => setOpen(false), open);

  const toggle = (option: SelectOption) => {
    if (option.disabled) return;
    const isSelected = selected.includes(option.value);
    setSelected(isSelected ? selected.filter((v) => v !== option.value) : [...selected, option.value]);
    announce(`${option.label} ${isSelected ? 'removed' : 'selected'}. ${isSelected ? selected.length - 1 : selected.length + 1} selected.`);
  };

  const remove = (v: string) => {
    setSelected(selected.filter((s) => s !== v));
    const removed = options.find((o) => o.value === v)?.label ?? v;
    announce(`${removed} removed`);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (control.disabled) return;
    const { key } = event;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(key === 'ArrowDown' ? 0 : visible.length - 1);
        return;
      }
      const next = getNavigationIndex(key, active, visible.length, { isDisabled: (i) => !!visible[i]?.disabled });
      if (next !== null) setActive(next);
    } else if (key === 'Home' || key === 'End') {
      if (!open) return;
      event.preventDefault();
      setActive(getNavigationIndex(key, active, visible.length, { isDisabled: (i) => !!visible[i]?.disabled }) ?? 0);
    } else if (key === 'Enter' || (key === ' ' && open && !query)) {
      if (open && active >= 0 && visible[active]) {
        event.preventDefault();
        toggle(visible[active]);
      } else if (!open) {
        event.preventDefault();
        setOpen(true);
        setActive(0);
      }
    } else if (key === 'Escape') {
      if (open) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        setQuery('');
      }
    } else if (key === 'Backspace' && !query && selected.length > 0) {
      remove(selected[selected.length - 1]);
    } else if (key === 'Tab') {
      setOpen(false);
      setQuery('');
    }
  };

  const hidden = Math.max(0, selectedOptions.length - maxVisibleTokens);

  return control.wrap(
    <>
      <div
        ref={boxRef}
        className={cx(
          inputBoxStyles.box,
          styles.box,
          size !== 'md' && inputBoxStyles[size],
          control.status !== 'none' && inputBoxStyles[control.status],
          control.disabled && inputBoxStyles.disabled,
          open && listboxStyles.open,
          className,
        )}
        onClick={(event) => {
          if (event.target === event.currentTarget) inputRef.current?.focus();
        }}
      >
        {selectedOptions.length > 0 && (
          <ul className={styles.tokens} aria-label="Selected">
            {selectedOptions.slice(0, maxVisibleTokens).map((option) => (
              <li key={option.value} className={styles.token}>
                <span className={styles.tokenLabel}>{option.label}</span>
                {!control.disabled && (
                  <button type="button" tabIndex={-1} className={styles.tokenRemove} aria-label={`Remove ${option.label}`} onClick={() => remove(option.value)}>
                    <X aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
            {hidden > 0 && <li className={styles.more}>+{hidden} more</li>}
          </ul>
        )}
        <span id={summaryId} className="eui-visually-hidden">
          {selectedOptions.length ? `${selectedOptions.length} selected: ${selectedOptions.map((o) => o.label).join(', ')}` : 'None selected'}
        </span>
        <input
          ref={merged}
          id={control.id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && active >= 0 ? optionId(listId, active) : undefined}
          aria-label={control.labelId ? undefined : ariaLabel}
          className={cx(inputBoxStyles.input, styles.input)}
          value={query}
          placeholder={selected.length ? undefined : placeholder}
          disabled={control.disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          onBlur={(event) => {
            if (!listRef.current?.contains(event.relatedTarget as Node)) {
              setOpen(false);
              setQuery('');
            }
          }}
          {...control.ariaProps}
          aria-describedby={[summaryId, control.ariaProps['aria-describedby']].filter(Boolean).join(' ')}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? 'Hide options' : 'Show options'}
          className={cx(inputBoxStyles.fieldButton, listboxStyles.chevron)}
          disabled={control.disabled}
          onClick={() => {
            setOpen(!open);
            setActive(0);
            inputRef.current?.focus();
          }}
        >
          <ChevronDown aria-hidden="true" />
        </button>
      </div>
      {name && selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      {open && (
        <ListboxPopup
          ref={listRef}
          id={listId}
          multiple
          options={visible}
          activeIndex={active}
          isSelected={(o) => selected.includes(o.value)}
          onSelect={toggle}
          onActiveChange={setActive}
          labelledBy={control.labelId}
          aria-label={control.labelId ? undefined : ariaLabel}
          style={style}
          emptyText={emptyText}
          highlight={query}
        />
      )}
    </>,
  );
});
