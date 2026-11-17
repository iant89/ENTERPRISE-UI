import { forwardRef, useMemo, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
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
import { collectOptionElements, ComboBoxItem, ComboBoxItemCustom, ComboBoxItemGroup } from '../listbox/optionElements';
import listboxStyles from '../listbox/Listbox.module.css';
import declineSvg from '../../assets/icons/decline.svg?raw';
import slimArrowDownSvg from '../../assets/icons/slim-arrow-down.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

export interface ComboBoxProps
  extends FieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size'> {
  /** Choices. Item elements are used when this is omitted. */
  options?: SelectOption[];
  /** ComboBoxItem, ComboBoxItemCustom and ComboBoxItemGroup elements. */
  children?: ReactNode;
  /** Controlled selected value. */
  value?: string | null;
  /** @default null */
  /** The initial value when the component is uncontrolled. */
  defaultValue?: string | null;
  /** Called with the new value when the user changes it. */
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
  /** Size of the combo box. */
  size?: 'sm' | 'md' | 'lg';
  /** Show a clear button when there is a value. @default true */
  clearable?: boolean;
  /** Display text for a value (defaults to the option label or the value). */
  formatValue?: (value: string) => string;
  /**
   * Whether the text can be typed in. `false` makes a select-like combo box: no
   * typing or filtering; click (with `openOnClick`), Space, Enter or the arrows open
   * it, and a letter jumps to the next option whose label starts with it.
   * @default true
   */
  editable?: boolean;
  /** Open the list when the text is clicked, not only from the arrow button. @default false */
  openOnClick?: boolean;
}

const defaultFilter = (option: SelectOption, text: string) => option.label.toLocaleLowerCase().includes(text.toLocaleLowerCase());

/**
 * Editable combobox: type to filter a list of options, then pick one with
 * the arrow keys and Enter. Implements the ARIA 1.2 combobox pattern.
 */
export const ComboBox = forwardRef<HTMLInputElement, ComboBoxProps>(function ComboBox(
  {
    label, description, error, status, statusMessage, hideLabel, labelPosition,
    options: optionsProp, children, value, defaultValue = null, onChange, onInputChange, allowCustomValue = false, parseCustomValue,
    filter = defaultFilter, loading = false, emptyText, size = 'md', clearable = true, formatValue, editable = true, openOnClick = false,
    id, required, disabled, readOnly, placeholder, className, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, ...rest
  },
  ref,
) {
  const options = optionsProp ?? collectOptionElements(children, { item: ComboBoxItem, custom: ComboBoxItemCustom, group: ComboBoxItemGroup } as Parameters<typeof collectOptionElements>[1]);
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

  /** Opens the full list with the selected option active (the arrow button, a click, Space). */
  const openList = () => {
    setFiltering(false);
    setOpen(true);
    setActive(Math.max(0, options.findIndex((o) => o.value === selected)));
  };

  /** Select-like type-ahead: the next option, after the active one, whose label starts with `char`. */
  const jumpTo = (char: string) => {
    const starts = (o: SelectOption) => !o.disabled && o.label.replace(/^[^\p{L}\p{N}]+/u, '').toLocaleLowerCase().startsWith(char.toLocaleLowerCase());
    const from = open ? active : visible.findIndex((o) => o.value === selected);
    for (let step = 1; step <= visible.length; step++) {
      const i = (from + step + visible.length) % visible.length;
      if (visible[i] && starts(visible[i])) {
        if (open) setActive(i);
        else setSelected(visible[i].value);
        return;
      }
    }
  };

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
    // Select-like: Space and Enter open the list (Enter still picks once it is open).
    if (!editable && !open && (key === ' ' || key === 'Enter')) {
      event.preventDefault();
      return openList();
    }
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
      } else if (text && (editable || clearable)) {
        // A select-like box without a clear button keeps its value.
        event.preventDefault();
        setFiltering(false);
        setSelected(null);
      }
    } else if (key === 'Tab') {
      if (open && active >= 0 && visible[active]) choose(visible[active]);
      else commitText();
    } else if (!editable && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && key !== ' ') {
      event.preventDefault();
      jumpTo(key);
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
          aria-autocomplete={editable ? 'list' : 'none'}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && active >= 0 ? optionId(listId, active) : undefined}
          aria-label={control.labelId ? undefined : ariaLabel}
          className={cx(inputBoxStyles.input, !editable && listboxStyles.selectOnly, className)}
          value={text}
          placeholder={placeholder}
          disabled={control.disabled}
          // Not editable: the text cannot be typed in, but the list still opens.
          readOnly={readOnly || !editable}
          required={control.required}
          onChange={(event) => {
            setQuery(event.target.value);
            setFiltering(true);
            setOpen(true);
            setActive(event.target.value ? 0 : -1);
            onInputChange?.(event.target.value);
          }}
          onKeyDown={onKeyDown}
          onClick={() => {
            if (!openOnClick || !interactive) return;
            // A select-like box toggles; an editable one only opens (a click also places the caret).
            if (!open) openList();
            else if (!editable) closeAndRevert();
          }}
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
            {svgIcon(declineSvg, 'decline', { 'aria-hidden': "true" })}
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
            else openList();
            inputRef.current?.focus();
          }}
        >
          {svgIcon(slimArrowDownSvg, 'slim-arrow-down', { 'aria-hidden': "true" })}
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
