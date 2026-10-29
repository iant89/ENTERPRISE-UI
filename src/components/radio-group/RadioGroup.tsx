import { forwardRef, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './RadioGroup.module.css';

export interface RadioOption<V extends string = string> {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<V extends string = string> {
  /** Group label, rendered as the fieldset legend. */
  label: ReactNode;
  options: RadioOption<V>[];
  value?: V | null;
  /** @default null */
  defaultValue?: V | null;
  onChange?: (value: V) => void;
  /** Input `name`. Generated when omitted. */
  name?: string;
  /** @default 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  description?: ReactNode;
  error?: ReactNode;
  /** @default false */
  required?: boolean;
  /** @default false */
  disabled?: boolean;
  /** Visually hide the legend. @default false */
  hideLabel?: boolean;
  className?: string;
}

/** Choose exactly one option. Arrow keys move between options (native behaviour). */
function RadioGroupInner<V extends string = string>(
  {
    label, options, value, defaultValue = null, onChange, name, orientation = 'vertical',
    description, error, required = false, disabled = false, hideLabel = false, className,
  }: RadioGroupProps<V>,
  ref: React.ForwardedRef<HTMLFieldSetElement>,
) {
  const id = useId(undefined, 'radio');
  const groupName = name ?? id;
  const [selected, setSelected] = useControllableState<V | null>(value, defaultValue, onChange as (v: V | null) => void);
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset
      ref={ref}
      className={cx(styles.fieldset, error && styles.invalid, className)}
      disabled={disabled}
      aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
      aria-invalid={error ? true : undefined}
      role="radiogroup"
      aria-required={required || undefined}
    >
      <legend className={cx(styles.legend, hideLabel && 'eui-visually-hidden')}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </legend>
      <div className={cx(styles.options, orientation === 'horizontal' && styles.horizontal)}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const isDisabled = disabled || option.disabled;
          return (
            <label key={option.value} htmlFor={optionId} className={cx(styles.option, isDisabled && styles.disabled)}>
              <input
                id={optionId}
                type="radio"
                className={styles.input}
                name={groupName}
                value={option.value}
                checked={selected === option.value}
                disabled={isDisabled}
                required={required}
                onChange={() => setSelected(option.value)}
              />
              <span>
                <span className={styles.label}>{option.label}</span>
                {option.description && <span className={styles.description}>{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {description && (
        <p id={descriptionId} className={styles.helper}>
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </fieldset>
  );
}

export const RadioGroup = forwardRef(RadioGroupInner) as <V extends string = string>(
  props: RadioGroupProps<V> & { ref?: React.Ref<HTMLFieldSetElement> },
) => ReturnType<typeof RadioGroupInner>;
