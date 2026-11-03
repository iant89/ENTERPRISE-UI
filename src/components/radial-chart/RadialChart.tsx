import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { toneColor } from '../chart-core/palette';
import styles from './RadialChart.module.css';

export interface RadialChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Current value. */
  value: number;
  /** Value that fills the ring. @default 100 */
  max?: number;
  /** Accessible name, e.g. "Budget used". */
  label: string;
  /** Shows `label` under the ring. @default false */
  showLabel?: boolean;
  /** Status color. Defaults to the first chart color. */
  tone?: Tone;
  /** Diameter: 48, 72 or 104 pixels. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Text in the middle of the ring. Defaults to the percentage. */
  centerContent?: ReactNode;
  /** Formats the value for assistive technology and the default center text. @default percentage of `max` */
  formatValue?: (value: number, max: number) => string;
}

const SIZES = { sm: 48, md: 72, lg: 104 };
const defaultFormat = (value: number, max: number) => `${Math.round((value / (max || 1)) * 100)}%`;

/** A single percentage, such as completion or utilization, as a ring. */
export const RadialChart = forwardRef<HTMLDivElement, RadialChartProps>(function RadialChart(
  { value, max = 100, label, showLabel = false, tone, size = 'md', centerContent, formatValue = defaultFormat, className, style, ...rest },
  ref,
) {
  const d = SIZES[size];
  const stroke = size === 'sm' ? 5 : size === 'md' ? 7 : 9;
  const r = (d - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.min(Math.max(value / (max || 1), 0), 1);
  const text = formatValue(value, max);
  return (
    <div
      ref={ref}
      className={cx(styles.radial, styles[size], className)}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      aria-valuetext={text}
      style={{ color: toneColor(tone), ...style }}
      {...rest}
    >
      <span className={styles.ring} style={{ width: d, height: d }}>
        <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} aria-hidden="true" focusable="false">
          <circle className={styles.track} cx={d / 2} cy={d / 2} r={r} strokeWidth={stroke} fill="none" />
          <circle
            className={styles.value}
            cx={d / 2}
            cy={d / 2}
            r={r}
            strokeWidth={stroke}
            fill="none"
            stroke="currentColor"
            strokeDasharray={`${(circumference * ratio).toFixed(2)} ${circumference.toFixed(2)}`}
            strokeLinecap={ratio > 0 && ratio < 1 ? 'round' : 'butt'}
            transform={`rotate(-90 ${d / 2} ${d / 2})`}
          />
        </svg>
        <span className={styles.center} aria-hidden="true">{centerContent ?? text}</span>
      </span>
      {showLabel && <span className={styles.label} aria-hidden="true">{label}</span>}
    </div>
  );
});
