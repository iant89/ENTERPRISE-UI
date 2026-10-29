import { forwardRef, useMemo, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { getNavigationIndex } from '../../utilities/keyboard';
import { useMergedRefs } from '../../utilities/refs';
import { useControllableState } from '../../hooks/useControllableState';
import { useClickOutside } from '../../hooks/useDismiss';
import { usePosition } from '../../hooks/usePosition';
import { useFormControl, type FieldProps } from '../form-field';
import inputBoxStyles from '../input/InputBox.module.css';
import { Spinner } from '../spinner';
import { ListboxPopup, optionId, type SelectOption } from '../listbox';
import listboxStyles from '../listbox/Listbox.module.css';

export interface ComboBoxProps
  extends FieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size'> {
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string | null;
  /** @default null */
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Called as the user types (e.g. to load options from a server). */
  onInputChange?: (text: string) => void;
  /**
   * Accept text that does not match an option. The value becomes the text,
   * or the result of `parseCustomValue`.
   * @default false
   */
  allowCustomValue?: boolean;
  /** Normalises custom text; return `null` to reject it. */
  parseCustomValue?: (text: string) => string | null;
  /** Custom filter. Defaults to case-insensitive "contains" on the label. */
  filter?: (option: SelectOption, text: string) => boolean;
  /** Show a busy indicator while options load. @default false */
  loading?: boolean;
  /** Shown when no option matches. @default 'No matches' */
  emptyText?: ReactNode;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Show a clear button when there is a value. @default true */
  clearable?: boolean;
  /** Display text for a value (defaults to the option label or the value). */
  formatValue?: (value: string) => string;
}

const defaultFilter = (option: SelectOption, text: string) => option.label.toLocaleLowerCase().includes(text.toLocaleLowerCase());

/**
 * Editable combobox: type to filter a list of options, then pick one with
 * the arrow keys and Enter. Implements the ARIA 1.2 combobox pattern.
 */
export const ComboBox = forwardRef<HTMLInputElement, ComboBoxProps>(function ComboBox(
  {
    label, description, error, status, statusMessage, hideLabel, labelPosition,
    options, value, defaultValue = null, onChange, onInputChange, allowCustomValue = false, parseCustomValue,
    filter = defaultFilter, loading = false, emptyText, size = 'md', clearable = true, formatValue,
    id, required, disabled, readOnly, placeholder, className, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, ...rest
  },
  ref,
) {
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled, 'aria-describedby': ariaDescribedBy });
  const [selected, setSelected] = useControllableState<string | null>(value, defaultValue, onChange);
  const labelFor = (v: string | null) => (v == null ? '' : formatValue?.(v) ?? options.find((o) => o.value === v)?.label ?? v);
  // While the user types, the input shows their query; otherwise the selected label.
  const [query, setQuery] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const merged = useMergedRefs(ref, inputRef);
  const listId = `${control.id}-listbox`;
  const { style } = usePosition({ open, anchorRef: boxRef, floatingRef: listRef, matchWidth: true });
  const text = filtering ? query : labelFor(selected);

  const visible = useMemo(() => (filtering && text ? options.filter((o) => filter(o, text)) : options), [filtering, text, options, filter]);
  const interactive = !control.disabled && !readOnly;

  const closeAndRevert = () => {
    setOpen(false);
    setFiltering(false);
    setActive(-1);
  };

  const commitText = () => {
    if (!filtering) return closeAndRevert();
    const exact = options.find((o) => o.label.toLocaleLowerCase() === text.trim().toLocaleLowerCase() && !o.disabled);
    if (exact) setSelected(exact.value);
    else if (text.trim() === '') setSelected(null);
    else if (allowCustomValue) {
      const parsed = parseCustomValue ? parseCustomValue(text.trim()) : text.trim();
      if (parsed != null) setSelected(parsed);
    }
    setFiltering(false);
    setOpen(false);
    setActive(-1);
  };

  useClickOutside([boxRef, listRef], commitText, open);

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    setSelected(option.value);
    setFiltering(false);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!interactive) return;
    const { key } = event;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        const selIndex = visible.findIndex((o) => o.value === selected);
        setActive(selIndex >= 0 ? selIndex : key === 'ArrowDown' ? 0 : visible.length - 1);
        return;
      }
      if (event.altKey && key === 'ArrowUp') return closeAndRevert();
      const next = getNavigationIndex(key, active, visible.length, { isDisabled: (i) => !!visible[i]?.disabled });
      if (next !== null) setActive(next);
    } else if (key === 'Enter') {
      if (open && active >= 0 && visible[active]) {
        event.preventDefault();
        choose(visible[active]);
      } else if (open || filtering) {
        event.preventDefault();
        commitText();
      }
    } else if (key === 'Escape') {
      if (open) {
        event.preventDefault();
        event.stopPropagation();
        closeAndRevert();
      } else if (text) {
        event.preventDefault();
        setFiltering(false);
        setSelected(null);
      }
    } else if (key === 'Tab') {
      if (open && active >= 0 && visible[active]) choose(visible[active]);
      else commitText();
    }
  };

  return control.wrap(
    <>
      <div
        ref={boxRef}
        className={cx(
          inputBoxStyles.box,
          size !== 'md' && inputBoxStyles[size],
          control.status !== 'none' && inputBoxStyles[control.status],
          control.disabled && inputBoxStyles.disabled,
          readOnly && inputBoxStyles.readOnly,
          open && listboxStyles.open,
        )}
      >
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
          className={cx(inputBoxStyles.input, className)}
          value={text}
          placeholder={placeholder}
          disabled={control.disabled}
          readOnly={readOnly}
          required={control.required}
          onChange={(event) => {
            setQuery(event.target.value);
            setFiltering(true);
            setOpen(true);
            setActive(event.target.value ? 0 : -1);
            onInputChange?.(event.target.value);
          }}
          onKeyDown={onKeyDown}
          onBlur={(event) => {
            if (!listRef.current?.contains(event.relatedTarget as Node) && !boxRef.current?.contains(event.relatedTarget as Node)) commitText();
          }}
          {...control.ariaProps}
          {...rest}
        />
        {loading && <Spinner size="sm" label="Loading options" />}
        {clearable && interactive && (text || selected) && (
          <button
            type="button"
            tabIndex={-1}
            className={inputBoxStyles.fieldButton}
            aria-label="Clear"
            onClick={() => {
              setFiltering(false);
              setSelected(null);
              inputRef.current?.focus();
            }}
          >
            <X aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? 'Hide options' : 'Show options'}
          className={cx(inputBoxStyles.fieldButton, listboxStyles.chevron)}
          disabled={!interactive}
          onClick={() => {
            if (open) closeAndRevert();
            else {
              setFiltering(false);
              setOpen(true);
              setActive(Math.max(0, options.findIndex((o) => o.value === selected)));
            }
            inputRef.current?.focus();
          }}
        >
          <ChevronDown aria-hidden="true" />
        </button>
      </div>
      {open && (
        <ListboxPopup
          ref={listRef}
          id={listId}
          options={visible}
          activeIndex={active}
          isSelected={(o) => o.value === selected}
          onSelect={choose}
          onActiveChange={setActive}
          labelledBy={control.labelId}
          aria-label={control.labelId ? undefined : ariaLabel}
          style={style}
          emptyText={loading ? 'Loading…' : allowCustomValue && text ? `Use “${text}”` : emptyText}
          highlight={filtering ? text : undefined}
        />
      )}
    </>,
  );
});
