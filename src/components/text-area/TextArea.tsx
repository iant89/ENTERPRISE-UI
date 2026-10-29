import { forwardRef, useLayoutEffect, useRef, useState, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import { useMergedRefs } from '../../utilities/refs';
import { useFormControl, type FieldProps } from '../form-field';
import { inputBoxStyles } from '../input';
import styles from './TextArea.module.css';

export interface TextAreaProps extends FieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow with the content up to `maxRows`. @default false */
  autoResize?: boolean;
  /** @default 10 */
  maxRows?: number;
  /** Show a character counter (uses `maxLength` when set). @default false */
  showCount?: boolean;
}

/** Multi-line text input. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label, description, error, status, statusMessage, hideLabel, labelPosition,
    autoResize = false, maxRows = 10, showCount = false, rows = 3, className, id, required, disabled, readOnly,
    maxLength, value, defaultValue, onChange, 'aria-describedby': ariaDescribedBy, ...rest
  },
  ref,
) {
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled, 'aria-describedby': ariaDescribedBy });
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const merged = useMergedRefs(ref, innerRef);
  const [length, setLength] = useState(() => String(value ?? defaultValue ?? '').length);
  const counterId = `${control.id}-count`;

  useLayoutEffect(() => {
    if (value !== undefined) setLength(String(value).length);
    const el = innerRef.current;
    if (!autoResize || !el) return;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const max = lineHeight * maxRows + 16;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }, [value, autoResize, maxRows, length]);

  const describedBy = [control.ariaProps['aria-describedby'], showCount ? counterId : null].filter(Boolean).join(' ') || undefined;

  return control.wrap(
    <div
      className={cx(
        inputBoxStyles.box,
        styles.box,
        control.status !== 'none' && inputBoxStyles[control.status],
        control.disabled && inputBoxStyles.disabled,
        readOnly && inputBoxStyles.readOnly,
      )}
    >
      <textarea
        ref={merged}
        id={control.id}
        rows={rows}
        className={cx(styles.textarea, autoResize && styles.noResize, className)}
        disabled={control.disabled}
        readOnly={readOnly}
        required={control.required}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          setLength(event.target.value.length);
          onChange?.(event);
        }}
        {...control.ariaProps}
        aria-describedby={describedBy}
        {...rest}
      />
      {showCount && (
        <span id={counterId} className={cx(styles.counter, maxLength != null && length >= maxLength && styles.over)}>
          {maxLength != null ? `${length} / ${maxLength}` : length}
          <span className="eui-visually-hidden"> characters</span>
        </span>
      )}
    </div>,
  );
});
