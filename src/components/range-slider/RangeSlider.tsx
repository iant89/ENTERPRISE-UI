import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { DirectionArrowsIcon } from '../../icons';
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
  /** Localized handle names. */
  labels?: { start: string; end: string };
  /** Draws a tick mark every `tickInterval` units, starting at `min`. Omit for no tick marks. */
  tickInterval?: number;
  /** Shows the value under each tick mark (formatted with `formatValue`). Requires `tickInterval`. @default false */
  showTickLabels?: boolean;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Selects a start and end value on one track with two handles that cannot cross. The selected
 * range is highlighted; optional tick marks and labels show the scale. Each handle is a native
 * range input, so keyboard and assistive technology support is built in.
 */
export const RangeSlider = forwardRef<HTMLFieldSetElement, RangeSliderProps>(function RangeSlider(
  {
    label, value, defaultValue, onChange, min = 0, max = 100, step = 1, disabled = false, showValue = true, formatValue = String,
    labels = { start: 'Minimum', end: 'Maximum' }, tickInterval, showTickLabels = false, className, id: providedId, ...rest
  },
  ref,
) {
  const id = useId(providedId, 'range');
  const [[start, end], setRange] = useControllableState<RangeValue>(value, defaultValue ?? [min, max], onChange);
  const span = max - min || 1;
  const fraction = (v: number) => (clamp(v, min, max) - min) / span;
  const pct = (v: number) => `${fraction(v) * 100}%`;
  const ticks: number[] = [];
  if (tickInterval && tickInterval > 0) {
    for (let v = min; v <= max + 1e-9; v += tickInterval) ticks.push(Math.round(v * 1e6) / 1e6);
    if (ticks[ticks.length - 1] !== max) ticks.push(max);
  }
  // When both handles sit at the maximum, keep the start handle on top so it can still move.
  const startOnTop = start >= max - (max - min) / 2 && start === end;

  return (
    <fieldset ref={ref} id={id} className={cx(styles.root, disabled && styles.disabled, className)} disabled={disabled} {...rest}>
      <legend className={styles.legend}>{label}</legend>
      {showValue && <output className={styles.value} aria-live="polite">{formatValue(start)} – {formatValue(end)}</output>}
      <div className={cx(styles.slider, showTickLabels && ticks.length > 0 && styles.withLabels)} style={{ '--range-start': pct(start), '--range-end': pct(end) } as CSSProperties}>
        <div className={styles.rail} aria-hidden="true">
          <span className={cx(styles.endDot, styles.dotStart)} />
          <span className={cx(styles.endDot, styles.dotEnd)} />
        </div>
        <div className={styles.scale} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className={styles.tick} style={{ insetInlineStart: pct(t) }}>
              {showTickLabels && <span className={styles.tickLabel}>{formatValue(t)}</span>}
            </span>
          ))}
          <span className={styles.selection} />
        </div>
        <input type="range" className={cx(styles.input, startOnTop && styles.onTop)} aria-label={labels.start} aria-valuetext={formatValue(start)} min={min} max={max} step={step} value={start}
          onChange={(e) => setRange([Math.min(Number(e.target.value), end), end])} />
        <span className={styles.handle} style={{ '--pos': fraction(start) } as CSSProperties} aria-hidden="true"><DirectionArrowsIcon /></span>
        <input type="range" className={styles.input} aria-label={labels.end} aria-valuetext={formatValue(end)} min={min} max={max} step={step} value={end}
          onChange={(e) => setRange([start, Math.max(Number(e.target.value), start)])} />
        <span className={styles.handle} style={{ '--pos': fraction(end) } as CSSProperties} aria-hidden="true"><DirectionArrowsIcon /></span>
      </div>
    </fieldset>
  );
});
