import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './Slider.module.css';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step'> {
  /** Visible label. Provide `aria-label` instead when no label is shown. */
  label?: ReactNode;
  /** The current value. Providing it makes the component controlled; update it from the change callback. */
  value?: number;
  /** @default min */
  /** The initial value when the component is uncontrolled. */
  defaultValue?: number;
  /** Called with the new value as the user moves the handle. */
  onChange?: (value: number) => void;
  /** @default 0 */
  /** Smallest allowed value. */
  min?: number;
  /** @default 100 */
  /** Largest allowed value. */
  max?: number;
  /** @default 1 */
  /** Amount the value changes by per step. */
  step?: number;
  /** Show the current value next to the label. @default false */
  showValue?: boolean;
  /** Formats the visible value and `aria-valuetext`. */
  formatValue?: (value: number) => string;
}

/** Selects one number from a continuous range, built on a native range input. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, value, defaultValue, onChange, min = 0, max = 100, step = 1, showValue = false, formatValue = String, id: providedId, className, disabled, ...rest },
  ref,
) {
  const id = useId(providedId, 'slider');
  const [current, setCurrent] = useControllableState(value, defaultValue ?? min, onChange);
  const text = formatValue(current);
  return (
    <div className={cx(styles.root, disabled && styles.disabled, className)}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <label htmlFor={id} className={styles.label}>{label}</label>}
          {showValue && <output htmlFor={id} className={styles.value}>{text}</output>}
        </div>
      )}
      <input
        ref={ref}
        id={id}
        type="range"
        className={styles.input}
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        aria-valuetext={text}
        onChange={(event) => setCurrent(Number(event.target.value))}
        {...rest}
      />
    </div>
  );
});
