import { forwardRef, type ReactNode, type SVGAttributes } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { formatNumber, toneColor } from '../chart-core/palette';
import styles from './Sparkline.module.css';

export interface SparklineLabels {
  /** Builds the accessible description from the series summary. */
  summary: (info: { label: string; first: string; last: string; min: string; max: string; count: number }) => string;
}

export interface SparklineProps extends Omit<SVGAttributes<SVGSVGElement>, 'values' | 'width' | 'height'> {
  /** Values in order (oldest first). `null` leaves a gap. */
  values: (number | null)[];
  /** Accessible name, e.g. "Revenue, last 12 weeks". Without it the sparkline is decorative. */
  label?: string;
  /** `line`, `area` (line with a light fill) or `bar` (win/loss style columns). @default 'line' */
  variant?: 'line' | 'area' | 'bar';
  /** Width in pixels. @default 96 */
  width?: number;
  /** Height in pixels. @default 28 */
  height?: number;
  /** Status color. Defaults to the first chart color. */
  tone?: Tone;
  /** Highlights the last value with a dot. @default true */
  showLast?: boolean;
  /** Formats values in the accessible summary. */
  formatValue?: (value: number) => string;
  /** Overrides for the built-in strings. */
  labels?: Partial<SparklineLabels>;
}

const defaultLabels: SparklineLabels = {
  summary: ({ label, first, last, min, max, count }) => `${label}: ${count} values from ${first} to ${last}, low ${min}, high ${max}`,
};

/** A word-sized trend line with no axes, for tables, tiles and headers. */
export const Sparkline = forwardRef<SVGSVGElement, SparklineProps>(function Sparkline(
  { values, label, variant = 'line', width = 96, height = 28, tone, showLast = true, formatValue = formatNumber, labels: labelOverrides, className, style, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const min = nums.length ? Math.min(...nums) : 0;
  const max = nums.length ? Math.max(...nums) : 1;
  const pad = 3;
  const color = toneColor(tone);
  const a11y = label && nums.length
    ? { role: 'img', 'aria-label': labels.summary({ label, first: formatValue(nums[0]), last: formatValue(nums[nums.length - 1]), min: formatValue(min), max: formatValue(max), count: nums.length }) }
    : { 'aria-hidden': true as const };

  let body: ReactNode;
  if (variant === 'bar') {
    const lo = Math.min(min, 0);
    const hi = Math.max(max, 0);
    const span = hi - lo || 1;
    const slot = width / Math.max(values.length, 1);
    const zero = height - ((0 - lo) / span) * height;
    body = (
      <g>
        {values.map((v, i) => {
          if (typeof v !== 'number') return null;
          const y = height - ((v - lo) / span) * height;
          return <rect key={i} x={i * slot + 1} width={Math.max(slot - 2, 1)} y={Math.min(y, zero)} height={Math.max(Math.abs(zero - y), 1)} rx={1} fill={v < 0 ? 'var(--eui-color-error)' : 'currentColor'} />;
        })}
      </g>
    );
  } else {
    const span = max - min || 1;
    const x = (i: number) => (values.length > 1 ? pad + (i / (values.length - 1)) * (width - pad * 2) : width / 2);
    const y = (v: number) => height - pad - ((v - min) / span) * (height - pad * 2);
    const runs: string[] = [];
    let current = '';
    values.forEach((v, i) => {
      if (typeof v !== 'number') {
        if (current) runs.push(current);
        current = '';
        return;
      }
      current += `${current ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    });
    if (current) runs.push(current);
    let lastIndex = values.length - 1;
    while (lastIndex >= 0 && typeof values[lastIndex] !== 'number') lastIndex--;
    body = (
      <g>
        {variant === 'area' && runs.map((d, i) => {
          const xs = [...d.matchAll(/[ML]([\d.]+),/g)].map((m) => m[1]);
          return <path key={`a${i}`} d={`${d} L${xs[xs.length - 1]},${height} L${xs[0]},${height} Z`} fill="currentColor" opacity={0.12} />;
        })}
        {runs.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {showLast && lastIndex >= 0 && <circle className={styles.last} cx={x(lastIndex)} cy={y(values[lastIndex] as number)} r={3} fill="currentColor" />}
      </g>
    );
  }

  return (
    <svg
      ref={ref}
      className={cx(styles.sparkline, className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      focusable="false"
      style={{ color, ...style }}
      {...a11y}
      {...rest}
    >
      {body}
    </svg>
  );
});
