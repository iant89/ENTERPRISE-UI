import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './RangeSlider.module.css';

export type RangeValue = [start: number, end: number];

export interface RangeSliderProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  /** Group label. */
  label: ReactNode;
  /** The current value. Providing it makes the component controlled; update it from the change callback. */
  value?: RangeValue;
  /** @default [min, max] */
  /** The initial value when the component is uncontrolled. */
  defaultValue?: RangeValue;
  /** Called with the new `[start, end]` range as the user moves a handle. */
  onChange?: (value: RangeValue) => void;
  /** @default 0 */
  /** Smallest allowed value. */
  min?: number;
  /** @default 100 */
  /** Largest allowed value. */
  max?: number;
  /** @default 1 */
  /** Amount the value changes by per step. */
  step?: number;
  /** Disables the range slider. A disabled control cannot be focused or changed. */
  disabled?: boolean;
  /** Show the selected range as text. @default true */
  showValue?: boolean;
  /** Formats a value for the visible labels and `aria-valuetext`. */
  formatValue?: (value: number) => string;
  /** Localized thumb names. */
  labels?: { start: string; end: string };
}

/** Selects a start and end value with two native range inputs that cannot cross. */
export const RangeSlider = forwardRef<HTMLFieldSetElement, RangeSliderProps>(function RangeSlider(
  { label, value, defaultValue, onChange, min = 0, max = 100, step = 1, disabled = false, showValue = true, formatValue = String, labels = { start: 'Minimum', end: 'Maximum' }, className, id: providedId, ...rest },
  ref,
) {
  const id = useId(providedId, 'range');
  const [[start, end], setRange] = useControllableState<RangeValue>(value, defaultValue ?? [min, max], onChange);
  return (
    <fieldset ref={ref} id={id} className={cx(styles.root, className)} disabled={disabled} {...rest}>
      <legend className={styles.legend}>{label}</legend>
      {showValue && <output className={styles.value} aria-live="polite">{formatValue(start)} – {formatValue(end)}</output>}
      <div className={styles.track}>
        <input type="range" className={styles.input} aria-label={labels.start} aria-valuetext={formatValue(start)} min={min} max={max} step={step} value={start}
          onChange={(e) => setRange([Math.min(Number(e.target.value), end), end])} />
        <input type="range" className={styles.input} aria-label={labels.end} aria-valuetext={formatValue(end)} min={min} max={max} step={step} value={end}
          onChange={(e) => setRange([start, Math.max(Number(e.target.value), start)])} />
      </div>
    </fieldset>
  );
});
