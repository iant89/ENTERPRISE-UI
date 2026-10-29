import { forwardRef, useEffect, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { clamp } from '../../utilities/format';
import { useControllableState } from '../../hooks/useControllableState';
import { useFormControl, type FieldProps } from '../form-field';
import styles from '../input/InputBox.module.css';

export interface NumberInputProps
  extends FieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'min' | 'max' | 'step'> {
  /** Controlled value; `null` when empty. */
  value?: number | null;
  /** @default null */
  defaultValue?: number | null;
  /** Called with the committed number (after blur, Enter or stepping). */
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** @default 1 */
  step?: number;
  /** Decimal places to round to. */
  precision?: number;
  /** Show − / + buttons. @default true */
  showStepper?: boolean;
  /** Unit displayed after the value, e.g. `kg` or `EUR`. */
  unit?: ReactNode;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

const format = (value: number | null, precision: number | undefined) =>
  value == null ? '' : precision != null ? value.toFixed(precision) : String(value);

/**
 * Numeric entry with keyboard stepping (↑/↓, PageUp/PageDown, Home/End),
 * optional stepper buttons, clamping and precision.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    label, description, error, status, statusMessage, hideLabel, labelPosition,
    value, defaultValue = null, onChange, min, max, step = 1, precision, showStepper = true, unit,
    size = 'md', id, required, disabled, readOnly, className, onBlur, onKeyDown, 'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled, 'aria-describedby': ariaDescribedBy });
  const [current, setCurrent] = useControllableState<number | null>(value, defaultValue, onChange);
  const [text, setText] = useState(() => format(current, precision));

  useEffect(() => setText(format(current, precision)), [current, precision]);

  const normalize = (n: number) => {
    let next = clamp(n, min ?? -Infinity, max ?? Infinity);
    if (precision != null) next = Number(next.toFixed(precision));
    return next;
  };

  const commit = (raw: string) => {
    const trimmed = raw.trim().replace(',', '.');
    if (trimmed === '') {
      setCurrent(null);
      setText('');
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) {
      setText(format(current, precision));
      return;
    }
    const next = normalize(parsed);
    setCurrent(next);
    setText(format(next, precision));
  };

  const stepBy = (delta: number) => {
    if (control.disabled || readOnly) return;
    const base = current ?? (delta > 0 ? (min ?? 0) - step : (max ?? 0) + step);
    // Avoid floating point drift (0.1 + 0.2).
    const decimals = Math.max(precision ?? 0, (String(step).split('.')[1] ?? '').length);
    const next = normalize(Number((base + delta).toFixed(decimals)));
    setCurrent(next);
    setText(format(next, precision));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const map: Record<string, () => void> = {
      ArrowUp: () => stepBy(step),
      ArrowDown: () => stepBy(-step),
      PageUp: () => stepBy(step * 10),
      PageDown: () => stepBy(-step * 10),
      Home: () => min != null && setCurrent(min),
      End: () => max != null && setCurrent(max),
      Enter: () => commit(text),
    };
    const action = map[event.key];
    if (action) {
      if (event.key !== 'Enter') event.preventDefault();
      action();
    }
  };

  return control.wrap(
    <div
      className={cx(
        styles.box,
        size !== 'md' && styles[size],
        control.status !== 'none' && styles[control.status],
        control.disabled && styles.disabled,
        readOnly && styles.readOnly,
      )}
    >
      {showStepper && (
        <button
          type="button"
          tabIndex={-1}
          className={styles.fieldButton}
          style={{ marginInlineStart: 4 }}
          aria-label="Decrease"
          disabled={control.disabled || readOnly || (min != null && current != null && current <= min)}
          onClick={() => stepBy(-step)}
        >
          <Minus aria-hidden="true" />
        </button>
      )}
      <input
        ref={ref}
        id={control.id}
        type="text"
        inputMode={precision ? 'decimal' : 'numeric'}
        role="spinbutton"
        autoComplete="off"
        aria-valuenow={current ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        className={cx(styles.input, className)}
        style={{ textAlign: 'end' }}
        value={text}
        disabled={control.disabled}
        readOnly={readOnly}
        required={control.required}
        onChange={(event) => setText(event.target.value)}
        onBlur={(event) => {
          commit(text);
          onBlur?.(event);
        }}
        onKeyDown={handleKeyDown}
        {...control.ariaProps}
        {...rest}
      />
      {unit != null && <span className={styles.adornment}>{unit}</span>}
      {showStepper && (
        <button
          type="button"
          tabIndex={-1}
          className={styles.fieldButton}
          aria-label="Increase"
          disabled={control.disabled || readOnly || (max != null && current != null && current >= max)}
          onClick={() => stepBy(step)}
        >
          <Plus aria-hidden="true" />
        </button>
      )}
    </div>,
  );
});
