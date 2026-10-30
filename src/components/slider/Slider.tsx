import { useId, useRef } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { clamp } from '../../utilities/format';
import { useFormControl, type FieldProps } from '../form-field';
import styles from './Slider.module.css';

export interface SliderProps extends FieldProps {
  /** Accessible name when there is no visible label. */
  'aria-label'?: string;
  'aria-describedby'?: string;
  /** @default false */
  required?: boolean;
  value?: number;
  /** @default min */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** @default 1 */
  step?: number;
  /** @default false */
  disabled?: boolean;
  /** Shown instead of the numeric value, and used as `aria-valuetext`. */
  formatValue?: (value: number) => string;
  /** Draw tick marks when the step count is 20 or fewer. @default false */
  showTickmarks?: boolean;
  id?: string;
}

export function sliderBounds(min = 0, max = 100, step = 1) {
  const low = Number.isFinite(min) ? min : 0;
  const high = Number.isFinite(max) ? max : 100;
  const [start, end] = low <= high ? [low, high] : [high, low];
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  return { min: start, max: end, step: increment };
}

export function snapToStep(value: number, min: number, max: number, step: number) {
  if (!Number.isFinite(value)) return min;
  const decimals = (String(step).split('.')[1] ?? '').length;
  const steps = Math.round((value - min) / step);
  return clamp(Number((min + steps * step).toFixed(decimals)), min, max);
}

/** Single-value slider. Arrow keys move by one step; Page Up and Page Down move by a tenth of the range. */
export function Slider({
  label, description, error, status, statusMessage, hideLabel, labelPosition, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy,
  value, defaultValue, onChange, min: minProp, max: maxProp, step: stepProp, disabled, formatValue, showTickmarks = false, id, required,
}: SliderProps) {
  const { min, max, step } = sliderBounds(minProp, maxProp, stepProp);
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled, 'aria-describedby': ariaDescribedBy });
  const [current, setCurrent] = useControllableState(value, defaultValue ?? min, onChange);
  const selected = snapToStep(current, min, max, step);
  const valueOnFocus = useRef(selected);
  const listId = useId();
  const display = formatValue?.(selected) ?? String(selected);
  const ticks = showTickmarks && (max - min) / step <= 20
    ? Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) => snapToStep(min + index * step, min, max, step))
    : [];
  const move = (next: number) => setCurrent(snapToStep(next, min, max, step));
  return control.wrap(
    <div className={styles.row}>
      <input
        id={control.id}
        className={styles.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={selected}
        disabled={control.disabled}
        list={ticks.length ? listId : undefined}
        aria-valuetext={formatValue ? display : undefined}
        aria-label={control.labelId ? undefined : ariaLabel}
        onFocus={() => { valueOnFocus.current = selected; }}
        onChange={(event) => move(Number(event.target.value))}
        onKeyDown={(event) => {
          const rtl = event.currentTarget.closest('[dir="rtl"]') != null;
          const large = (max - min) / 10;
          const key = event.key;
          let delta: number | null = null;
          if (key === 'Home') delta = min - selected;
          else if (key === 'End') delta = max - selected;
          else if (key === 'PageUp') delta = large;
          else if (key === 'PageDown') delta = -large;
          else if (key === 'ArrowUp' || key === '+' || (key === 'ArrowRight' && !rtl) || (key === 'ArrowLeft' && rtl)) delta = event.ctrlKey || event.metaKey ? large : step;
          else if (key === 'ArrowDown' || key === '-' || (key === 'ArrowLeft' && !rtl) || (key === 'ArrowRight' && rtl)) delta = event.ctrlKey || event.metaKey ? -large : -step;
          else if (key === 'Escape') {
            event.preventDefault();
            move(valueOnFocus.current);
            return;
          }
          if (delta == null || control.disabled) return;
          event.preventDefault();
          move(selected + delta);
        }}
        {...control.ariaProps}
      />
      <span className={styles.value} aria-hidden="true">{display}</span>
      {ticks.length > 0 && (
        <datalist id={listId}>
          {ticks.map((tick) => <option key={tick} value={tick} />)}
        </datalist>
      )}
    </div>,
  );
}
