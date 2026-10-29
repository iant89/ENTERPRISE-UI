import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { CalendarDays } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { parseISODate, toISODate, isOutOfRange } from '../../utilities/date';
import { focusElement } from '../../utilities/focus';
import { Portal } from '../../utilities/Portal';
import { useMergedRefs } from '../../utilities/refs';
import { useControllableState } from '../../hooks/useControllableState';
import { useClickOutside } from '../../hooks/useDismiss';
import { usePosition } from '../../hooks/usePosition';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useFormControl, type FieldProps } from '../form-field';
import styles from '../input/InputBox.module.css';
import { Calendar } from '../calendar';
import floating from '../popover/Floating.module.css';

export interface DatePickerProps
  extends FieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'min' | 'max' | 'type'> {
  value?: Date | null;
  /** @default null */
  defaultValue?: Date | null;
  /** Called with the committed date, or `null` when cleared. */
  onChange?: (date: Date | null) => void;
  min?: Date | null;
  max?: Date | null;
  isDateDisabled?: (date: Date) => boolean;
  /** @default 1 */
  weekStartsOn?: number;
  locale?: string;
  /** Formats a date for display. @default ISO `YYYY-MM-DD` */
  formatDate?: (date: Date) => string;
  /** Parses typed text. Return `null` for invalid input. @default ISO parser */
  parseDate?: (text: string) => Date | null;
  /** Message shown for unparseable input. @default 'Enter a valid date' */
  invalidMessage?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Date entry by typing or by picking from a calendar popup.
 * Alt+ArrowDown (or the button) opens the calendar; Escape closes it.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    label, description, error, status, statusMessage, hideLabel, labelPosition,
    value, defaultValue = null, onChange, min, max, isDateDisabled, weekStartsOn = 1, locale,
    formatDate = toISODate, parseDate = parseISODate, invalidMessage = 'Enter a valid date', size = 'md',
    id, required, disabled, readOnly, placeholder = 'YYYY-MM-DD', className, onKeyDown, 'aria-describedby': ariaDescribedBy, ...rest
  },
  ref,
) {
  const [invalid, setInvalid] = useState(false);
  const control = useFormControl({
    label, description, error: error ?? (invalid ? invalidMessage : undefined), status, statusMessage, hideLabel, labelPosition, id, required, disabled, 'aria-describedby': ariaDescribedBy,
  });
  const [date, setDate] = useControllableState<Date | null>(value, defaultValue, onChange);
  const [text, setText] = useState(() => (date ? formatDate(date) : ''));
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, inputRef);
  const dialogId = `${control.id}-calendar`;
  const { style } = usePosition({ open, anchorRef: boxRef, floatingRef: popupRef, placement: 'bottom-start' });

  useEffect(() => {
    setText(date ? formatDate(date) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date?.getTime()]);

  useClickOutside([boxRef, popupRef], () => setOpen(false), open);
  useFocusTrap(popupRef, open, { restoreFocus: false });

  const commit = () => {
    if (text.trim() === '') {
      setInvalid(false);
      setDate(null);
      return;
    }
    const parsed = parseDate(text);
    if (!parsed || isOutOfRange(parsed, min, max) || isDateDisabled?.(parsed)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setDate(parsed);
    setText(formatDate(parsed));
  };

  const close = () => {
    setOpen(false);
    focusElement(inputRef.current);
  };

  const interactive = !control.disabled && !readOnly;

  return control.wrap(
    <>
      <div
        ref={boxRef}
        className={cx(
          styles.box,
          size !== 'md' && styles[size],
          control.status !== 'none' && styles[control.status],
          control.disabled && styles.disabled,
          readOnly && styles.readOnly,
        )}
      >
        <input
          ref={merged}
          id={control.id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={cx(styles.input, className)}
          value={text}
          placeholder={placeholder}
          disabled={control.disabled}
          readOnly={readOnly}
          required={control.required}
          onChange={(event) => setText(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.key === 'Enter') commit();
            if (event.key === 'ArrowDown' && event.altKey && interactive) {
              event.preventDefault();
              setOpen(true);
            }
          }}
          {...control.ariaProps}
          {...rest}
        />
        <button
          type="button"
          className={styles.fieldButton}
          aria-label={open ? 'Close calendar' : 'Choose date'}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          disabled={!interactive}
          onClick={() => (open ? close() : setOpen(true))}
        >
          <CalendarDays aria-hidden="true" />
        </button>
      </div>
      {open && (
        <Portal>
          <div
            ref={popupRef}
            id={dialogId}
            role="dialog"
            aria-modal="false"
            aria-label="Choose date"
            className={floating.floating}
            style={{ ...style, maxHeight: 'none' }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                close();
              }
            }}
          >
            <Calendar
              autoFocus
              value={date}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              locale={locale}
              weekStartsOn={weekStartsOn}
              onChange={(d) => {
                setInvalid(false);
                setDate(d);
                setText(formatDate(d));
                close();
              }}
            />
          </div>
        </Portal>
      )}
    </>,
  );
});
