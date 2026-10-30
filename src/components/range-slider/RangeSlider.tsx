import { useRef, type KeyboardEvent } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { sliderBounds, snapToStep } from '../slider';
import styles from './RangeSlider.module.css';

export interface RangeSliderProps {
  /** Names the range. */
  label: string;
  value?: readonly [number, number];
  /** @default [min, max] */
  defaultValue?: readonly [number, number];
  onChange?: (value: [number, number]) => void;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** @default 1 */
  step?: number;
  /** @default false */
  disabled?: boolean;
  /** Accessible name of the start handle. @default 'Range start' */
  startLabel?: string;
  /** Accessible name of the end handle. @default 'Range end' */
  endLabel?: string;
  formatValue?: (value: number) => string;
}

/** Two-handle range. Each handle stops at the other handle. */
export function RangeSlider({
  label, value, defaultValue, onChange, min: minProp, max: maxProp, step: stepProp, disabled = false,
  startLabel = 'Range start', endLabel = 'Range end', formatValue,
}: RangeSliderProps) {
  const { min, max, step } = sliderBounds(minProp, maxProp, stepProp);
  const [current, setCurrent] = useControllableState<[number, number]>(
    value ? [value[0], value[1]] : undefined,
    defaultValue ? [defaultValue[0], defaultValue[1]] : [min, max],
    onChange,
  );
  const start = snapToStep(Math.min(current[0], current[1]), min, max, step);
  const end = snapToStep(Math.max(current[0], current[1]), min, max, step);
  const startOnFocus = useRef(start);
  const endOnFocus = useRef(end);
  const display = (n: number) => formatValue?.(n) ?? String(n);
  const setStart = (next: number) => setCurrent([snapToStep(Math.min(next, end), min, end, step), end]);
  const setEnd = (next: number) => setCurrent([start, snapToStep(Math.max(next, start), start, max, step)]);
  const onKeyDown = (which: 'start' | 'end') => (event: KeyboardEvent<HTMLInputElement>) => {
    const selected = which === 'start' ? start : end;
    const commit = which === 'start' ? setStart : setEnd;
    const rtl = event.currentTarget.closest('[dir="rtl"]') != null;
    const large = Math.max(step, (max - min) / 10);
    const key = event.key;
    let delta: number | null = null;
    if (key === 'Home') delta = (which === 'start' ? min : start) - selected;
    else if (key === 'End') delta = (which === 'start' ? end : max) - selected;
    else if (key === 'PageUp') delta = large;
    else if (key === 'PageDown') delta = -large;
    else if (key === 'ArrowUp' || key === '+' || (key === 'ArrowRight' && !rtl) || (key === 'ArrowLeft' && rtl)) delta = event.ctrlKey || event.metaKey ? large : step;
    else if (key === 'ArrowDown' || key === '-' || (key === 'ArrowLeft' && !rtl) || (key === 'ArrowRight' && rtl)) delta = event.ctrlKey || event.metaKey ? -large : -step;
    else if (key === 'Escape') {
      event.preventDefault();
      commit(which === 'start' ? startOnFocus.current : endOnFocus.current);
      return;
    }
    if (delta == null || disabled) return;
    event.preventDefault();
    commit(selected + delta);
  };
  return (
    <fieldset className={styles.field} disabled={disabled}>
      <legend>{label}</legend>
      <div className={styles.readout} aria-hidden="true">{display(start)} – {display(end)}</div>
      <div className={styles.tracks}>
        <input
          className={styles.slider}
          type="range"
          min={min}
          max={end}
          step={step}
          value={start}
          aria-label={startLabel}
          aria-valuetext={formatValue ? display(start) : undefined}
          onFocus={() => { startOnFocus.current = start; }}
          onChange={(event) => setStart(Number(event.target.value))}
          onKeyDown={onKeyDown('start')}
        />
        <input
          className={styles.slider}
          type="range"
          min={start}
          max={max}
          step={step}
          value={end}
          aria-label={endLabel}
          aria-valuetext={formatValue ? display(end) : undefined}
          onFocus={() => { endOnFocus.current = end; }}
          onChange={(event) => setEnd(Number(event.target.value))}
          onKeyDown={onKeyDown('end')}
        />
      </div>
    </fieldset>
  );
}
