import { forwardRef, useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check, Minus } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useMergedRefs } from '../../utilities/refs';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'checked' | 'defaultChecked'> {
  /** Label rendered next to the box. */
  label?: ReactNode;
  /** Secondary text under the label. */
  description?: ReactNode;
  checked?: boolean;
  /** @default false */
  defaultChecked?: boolean;
  /** Called with the new checked state. */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Mixed state, e.g. for a "select all" box. @default false */
  indeterminate?: boolean;
  /** Error message; marks the box invalid. */
  error?: ReactNode;
}

/** A binary choice. Supports an indeterminate (mixed) state. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, checked, defaultChecked = false, onChange, indeterminate = false, error, disabled, id: providedId, className, 'aria-describedby': ariaDescribedBy, ...rest },
  ref,
) {
  const id = useId(providedId, 'checkbox');
  const inputRef = useRef<HTMLInputElement>(null);
  const merged = useMergedRefs(ref, inputRef);
  const [isChecked, setChecked] = useControllableState(checked, defaultChecked);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

  return (
    <span className={cx(styles.root, className)}>
      <label className={cx(styles.row, disabled && styles.disabled)} htmlFor={id}>
        <span className={styles.boxWrap}>
          <input
            ref={merged}
            id={id}
            type="checkbox"
            className={styles.input}
            checked={isChecked}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => {
              setChecked(event.target.checked);
              onChange?.(event.target.checked, event);
            }}
            {...rest}
          />
          <span className={styles.mark} aria-hidden="true">
            {indeterminate ? <Minus /> : isChecked ? <Check /> : null}
          </span>
        </span>
        {(label || description) && (
          <span>
            {label && <span className={styles.label}>{label}</span>}
            {description && (
              <span id={descriptionId} className={styles.description}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
      {error && (
        <span id={errorId} className={styles.message}>
          {error}
        </span>
      )}
    </span>
  );
});

export { styles as checkboxStyles };
