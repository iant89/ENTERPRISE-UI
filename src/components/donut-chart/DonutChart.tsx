import { forwardRef, type ReactNode } from 'react';
import { useChartHeight } from '../chart-core/ChartToolsContext';
import { ChartFrame, TooltipContent, defaultChartLabels, type ChartBaseProps } from '../chart-core/ChartFrame';
import { CHART_HUES, formatNumber, seriesColor } from '../chart-core/palette';
import type { ChartSelectProps } from '../chart-core/types';
import styles from '../chart-core/Chart.module.css';

export interface DonutChartDatum {
  /** Segment name. */
  label: string;
  /** Segment value; negative values are ignored. */
  value: number;
  /** Overrides the categorical color. */
  color?: string;
}

export interface DonutChartProps extends ChartBaseProps, ChartSelectProps {
  /** Parts of the whole. Keep to a few segments; beyond `maxSegments` the smallest fold into "Other". */
  data: DonutChartDatum[];
  /** `donut` leaves room for a total in the middle; `pie` is a full disc. @default 'donut' */
  variant?: 'donut' | 'pie';
  /** Number shown in the middle of a donut. Defaults to the formatted total. */
  centerValue?: ReactNode;
  /** Caption under the center value. @default 'Total' */
  centerLabel?: ReactNode;
  /** Maximum distinct segments before the rest fold into "Other". Capped at the 7 categorical hues. @default 6 */
  maxSegments?: number;
  /** Header of the segment column in the data table. @default 'Category' */
  categoryLabel?: string;
  /** Header of the value column in the data table. @default 'Value' */
  valueLabel?: string;
}

const TAU = Math.PI * 2;

function arc(cx: number, cy: number, outer: number, inner: number, start: number, end: number): string {
  // A full circle cannot be drawn as one arc; split it in two halves.
  if (end - start >= TAU - 1e-6) {
    const mid = start + Math.PI;
    return `${arc(cx, cy, outer, inner, start, mid)} ${arc(cx, cy, outer, inner, mid, end)}`;
  }
  const p = (r: number, a: number) => `${(cx + r * Math.sin(a)).toFixed(2)},${(cy - r * Math.cos(a)).toFixed(2)}`;
  const large = end - start > Math.PI ? 1 : 0;
  if (inner <= 0) return `M${cx},${cy} L${p(outer, start)} A${outer},${outer} 0 ${large} 1 ${p(outer, end)} Z`;
  return `M${p(outer, start)} A${outer},${outer} 0 ${large} 1 ${p(outer, end)} L${p(inner, end)} A${inner},${inner} 0 ${large} 0 ${p(inner, start)} Z`;
}

/** Part-to-whole for a handful of categories, with share labels in the legend. */
export const DonutChart = forwardRef<HTMLElement, DonutChartProps>(function DonutChart(
  { data, variant = 'donut', centerValue, centerLabel, maxSegments = 6, categoryLabel = 'Category', valueLabel = 'Value', height: heightProp = 220, formatValue = formatNumber, labels: labelOverrides, onSelect, selectedCategory, ...rest },
  ref,
) {
  const height = useChartHeight(heightProp);
  const labels = { ...defaultChartLabels, ...labelOverrides };
  const cap = Math.min(Math.max(maxSegments, 1), CHART_HUES);
  const positive = data.filter((d) => d.value > 0);
  // Fold the tail into "Other" so no hue is reused and small slivers stay readable.
  const segments =
    positive.length > cap
      ? [...positive.slice(0, cap - 1).map((d, i) => ({ ...d, color: seriesColor(i, d.color) })), { label: labels.other, value: positive.slice(cap - 1).reduce((s, d) => s + d.value, 0), color: 'var(--eui-color-chart-other)' }]
      : positive.map((d, i) => ({ ...d, color: seriesColor(i, d.color) }));
  const total = segments.reduce((s, d) => s + d.value, 0);
  const share = (v: number) => `${Math.round((v / (total || 1)) * 100)}%`;
  const describe = (i: number) => `${segments[i].label}: ${formatValue(segments[i].value)} (${share(segments[i].value)})`;

  const angles = segments.reduce<{ start: number; end: number }[]>((acc, d) => {
    const start = acc.length ? acc[acc.length - 1].end : 0;
    return [...acc, { start, end: start + (d.value / (total || 1)) * TAU }];
  }, []);

  return (
    <ChartFrame
      ref={ref}
      height={height}
      count={segments.length}
      empty={total <= 0}
      legend={segments.map((d, i) => ({ key: `${d.label}-${i}`, label: d.label, color: d.color, value: `${formatValue(d.value)} · ${share(d.value)}` }))}
      table={{ headers: [categoryLabel, valueLabel, '%'], rows: segments.map((d) => [d.label, formatValue(d.value), share(d.value)]) }}
      announce={describe}
      tooltip={(i) => <TooltipContent title={segments[i].label} rows={[{ key: 'v', label: share(segments[i].value), value: formatValue(segments[i].value), color: segments[i].color }]} />}
      anchor={(i, width) => {
        const r = (height / 2) * 0.82;
        const a = (angles[i].start + angles[i].end) / 2;
        return { x: width / 2 + r * Math.sin(a), y: height / 2 - r * Math.cos(a) };
      }}
      plot={(width, active, setActive) => {
        const cx = width / 2;
        const cy = height / 2;
        const outer = height / 2 - 4;
        const inner = variant === 'donut' ? outer * 0.62 : 0;
        return (
          <svg width={width} height={height} aria-hidden="true" focusable="false">
            {segments.map((d, i) => (
              <path
                key={`${d.label}-${i}`}
                className={`${styles.segment}${(active !== null ? active !== i : selectedCategory != null && d.label !== selectedCategory) ? ` ${styles.dimmed}` : ''}`}
                fill={d.color}
                d={arc(cx, cy, active === i ? outer + 3 : outer, inner, angles[i].start, angles[i].end)}
                onPointerEnter={() => setActive(i)}
                onPointerDown={() => setActive(i)}
              />
            ))}
            {variant === 'donut' && (
              <>
                <text className={styles.centerValue} x={cx} y={cy} dy={centerLabel === null ? '0.32em' : '0.1em'} textAnchor="middle">
                  {active !== null ? share(segments[active].value) : centerValue ?? formatValue(total)}
                </text>
                {centerLabel !== null && (
                  <text className={styles.centerLabel} x={cx} y={cy + 18} textAnchor="middle">
                    {active !== null ? segments[active].label : centerLabel ?? labels.total}
                  </text>
                )}
              </>
            )}
          </svg>
        );
      }}
      onSelectIndex={onSelect ? (i) => onSelect({ index: i, category: segments[i].label }) : undefined}
      labels={labelOverrides}
      {...rest}
    />
  );
});
