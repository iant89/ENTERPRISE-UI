import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useFormControl, type FieldProps } from '../form-field';
import styles from './InputBox.module.css';

export interface InputProps extends FieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** @default 'md' */
  /** Size of the input. */
  size?: 'sm' | 'md' | 'lg';
  /** Content before the text (icon, currency symbol). */
  startAdornment?: ReactNode;
  /** Content after the text (unit, icon, button). */
  endAdornment?: ReactNode;
  /** Class name for the outer field box. */
  boxClassName?: string;
}

/** Single-line text input with optional label, helper text and validation state. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label, description, error, status, statusMessage, hideLabel, labelPosition,
    size = 'md', startAdornment, endAdornment, className, boxClassName, id, required, disabled, readOnly,
    'aria-describedby': ariaDescribedBy, type = 'text', ...rest
  },
  ref,
) {
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled, 'aria-describedby': ariaDescribedBy });
  return control.wrap(
    <div
      className={cx(
        styles.box,
        size !== 'md' && styles[size],
        control.status !== 'none' && styles[control.status],
        control.disabled && styles.disabled,
        readOnly && styles.readOnly,
        startAdornment != null && styles.withStart,
        boxClassName,
      )}
    >
      {startAdornment != null && <span className={cx(styles.adornment, styles.startAdornment)}>{startAdornment}</span>}
      <input
        ref={ref}
        id={control.id}
        type={type}
        className={cx(styles.input, className)}
        disabled={control.disabled}
        readOnly={readOnly}
        required={control.required}
        {...control.ariaProps}
        {...rest}
      />
      {endAdornment != null && <span className={styles.adornment}>{endAdornment}</span>}
    </div>,
  );
});

