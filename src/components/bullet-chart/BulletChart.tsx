import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { formatNumber, toneColor, toneSubtle } from '../chart-core/palette';
import styles from './BulletChart.module.css';

export interface BulletChartRange {
  /** Upper bound of this qualitative range (ranges start where the previous one ends). */
  to: number;
  /** Status of the range, e.g. `error` for "below plan". */
  tone: Tone;
  /** Name used in the accessible summary, e.g. "Below plan". */
  label?: string;
}

export interface BulletChartLabels {
  /** Builds the accessible summary. */
  summary: (parts: { label: string; actual: string; target?: string; forecast?: string; range?: string }) => string;
}

export interface BulletChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Name of the measure, e.g. "Revenue". Shown above the bar and used as the accessible name. */
  label: string;
  /** Actual value. */
  value: number;
  /** Target or plan value, drawn as a vertical marker. */
  target?: number;
  /** Forecast or projected value, drawn as a lighter bar behind the actual. */
  forecast?: number;
  /** Start of the scale. @default 0 */
  min?: number;
  /** End of the scale. Defaults to the largest value plus 10%. */
  max?: number;
  /** Qualitative background ranges (poor, satisfactory, good). */
  ranges?: BulletChartRange[];
  /** Status color of the actual bar. Defaults to the range the value falls in, else the first chart color. */
  tone?: Tone;
  /** Hides the visible label row (keep `label` for the accessible name). @default false */
  hideLabel?: boolean;
  /** `sm` for table cells, `md` for cards. @default 'md' */
  size?: 'sm' | 'md';
  /** Formats values. */
  formatValue?: (value: number) => string;
  /** Overrides for the built-in strings. */
  labels?: Partial<BulletChartLabels>;
}

const defaultLabels: BulletChartLabels = {
  summary: ({ label, actual, target, forecast, range }) =>
    [`${label}: actual ${actual}`, target && `target ${target}`, forecast && `forecast ${forecast}`, range].filter(Boolean).join(', '),
};

/** Actual versus target (and forecast) at one point in time, against qualitative ranges. */
export const BulletChart = forwardRef<HTMLDivElement, BulletChartProps>(function BulletChart(
  { label, value, target, forecast, min = 0, max: maxProp, ranges = [], tone, hideLabel = false, size = 'md', formatValue = formatNumber, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const candidates = [value, target, forecast, ...ranges.map((r) => r.to)].filter((v): v is number => typeof v === 'number');
  const max = maxProp ?? Math.max(...candidates) * 1.1;
  const span = max - min || 1;
  const pct = (v: number) => `${(Math.min(Math.max((v - min) / span, 0), 1) * 100).toFixed(2)}%`;
  const sorted = [...ranges].sort((a, b) => a.to - b.to);
  const inRange = sorted.find((r) => value <= r.to) ?? sorted[sorted.length - 1];
  const barTone = tone ?? inRange?.tone;
  const summary = labels.summary({
    label,
    actual: formatValue(value),
    target: target !== undefined ? formatValue(target) : undefined,
    forecast: forecast !== undefined ? formatValue(forecast) : undefined,
    range: inRange?.label,
  });

  return (
    <div ref={ref} className={cx(styles.bullet, styles[size], className)} role="img" aria-label={summary} {...rest}>
      {!hideLabel && (
        <div className={styles.header} aria-hidden="true">
          <span className={styles.label}>{label}</span>
          <span className={styles.values}>
            <strong>{formatValue(value)}</strong>
            {target !== undefined && <span className={styles.target}> / {formatValue(target)}</span>}
          </span>
        </div>
      )}
      <div className={styles.track} aria-hidden="true">
        {sorted.map((r, i) => {
          const from = i === 0 ? min : sorted[i - 1].to;
          return <span key={i} className={styles.range} style={{ insetInlineStart: pct(from), width: `calc(${pct(r.to)} - ${pct(from)})`, background: toneSubtle(r.tone) } as CSSProperties} />;
        })}
        {forecast !== undefined && <span className={cx(styles.bar, styles.forecast)} style={{ width: pct(forecast), color: toneColor(barTone) }} />}
        <span className={styles.bar} style={{ width: pct(value), color: toneColor(barTone) }} />
        {target !== undefined && <span className={styles.marker} style={{ insetInlineStart: pct(target) }} />}
      </div>
    </div>
  );
});
