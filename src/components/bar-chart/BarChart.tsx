import { forwardRef, type PointerEvent } from 'react';
import { ChartFrame, TooltipContent, defaultChartLabels, type ChartBaseProps, type ChartLegendItem } from '../chart-core/ChartFrame';
import { ReferenceLines, ValueGridX, ValueGridY, barPath, labelEvery, valueAxisWidth } from '../chart-core/cartesian';
import { formatCompact, formatNumber, seriesColor, toneColor } from '../chart-core/palette';
import { bandScale, estimateTextWidth, linearScale, truncate } from '../chart-core/scale';
import { valueOf, type ChartDatum, type ChartReferenceLine, type ChartSeries } from '../chart-core/types';
import styles from '../chart-core/Chart.module.css';

export interface BarChartProps extends ChartBaseProps {
  /** Rows of data, one per category, in display order. Sort by value for rankings. */
  data: ChartDatum[];
  /** Field holding each row's category label. */
  categoryKey: string;
  /** Header of the category column in the data table. Defaults to `categoryKey`. */
  categoryLabel?: string;
  /** Measures to draw. Several series are grouped side by side, or stacked with `stacked`. */
  series: ChartSeries[];
  /** `vertical` draws columns; `horizontal` draws bars, which suits long category names and rankings. @default 'vertical' */
  layout?: 'vertical' | 'horizontal';
  /** Stacks the series into one bar per category to show a total and its parts. @default false */
  stacked?: boolean;
  /** Prints each bar's value at its end. Best for one series and a handful of bars. @default false */
  valueLabels?: boolean;
  /** Targets or thresholds drawn as dashed lines across the bars. */
  referenceLines?: ChartReferenceLine[];
  /** Fixed value-axis bounds; leave either side undefined to compute it. */
  valueDomain?: [number?, number?];
}

interface Segment {
  series: number;
  from: number;
  to: number;
  value: number;
  /** The outermost segment of a stack gets the rounded data end. */
  outer: boolean;
}

const M = { top: 12, bottom: 28, right: 16 };

function segmentsFor(datum: ChartDatum, series: ChartSeries[], stacked: boolean): Segment[] {
  if (!stacked) {
    return series.flatMap((s, i) => {
      const v = valueOf(datum, s.key);
      return v === null ? [] : [{ series: i, from: 0, to: v, value: v, outer: true }];
    });
  }
  // Positive and negative parts stack away from zero independently.
  let pos = 0;
  let neg = 0;
  const out: Segment[] = [];
  series.forEach((s, i) => {
    const v = valueOf(datum, s.key);
    if (v === null || v === 0) return;
    if (v > 0) {
      out.push({ series: i, from: pos, to: pos + v, value: v, outer: false });
      pos += v;
    } else {
      out.push({ series: i, from: neg, to: neg + v, value: v, outer: false });
      neg += v;
    }
  });
  const lastPos = out.filter((s) => s.value > 0).pop();
  const lastNeg = out.filter((s) => s.value < 0).pop();
  if (lastPos) lastPos.outer = true;
  if (lastNeg) lastNeg.outer = true;
  return out;
}

/** Compare magnitudes across categories: grouped or stacked, vertical columns or horizontal bars. */
export const BarChart = forwardRef<HTMLElement, BarChartProps>(function BarChart(
  { data, categoryKey, categoryLabel, series, layout = 'vertical', stacked = false, valueLabels = false, referenceLines = [], valueDomain, height: heightProp, formatValue = formatNumber, labels: labelOverrides, ...rest },
  ref,
) {
  const horizontal = layout === 'horizontal';
  const height = heightProp ?? (horizontal ? Math.max(120, data.length * (series.length > 1 && !stacked ? 36 : 28) + M.top + M.bottom) : 240);
  const categories = data.map((d) => String(d[categoryKey] ?? ''));
  const stacks = data.map((d) => segmentsFor(d, series, stacked));
  const extents = stacks.flatMap((segs) => segs.map((s) => s.to));
  const empty = data.length === 0 || series.length === 0 || extents.length === 0;

  const legend: ChartLegendItem[] = [
    ...series.map((s, i) => ({ key: s.key, label: s.label, color: seriesColor(i, s.color) })),
    ...referenceLines.map((r) => ({ key: `ref-${r.label}`, label: r.label, color: toneColor(r.tone ?? 'neutral'), dashed: true })),
  ];
  const cell = (d: ChartDatum, key: string) => {
    const v = valueOf(d, key);
    return v === null ? '–' : formatValue(v);
  };
  const totalOf = (i: number) => stacks[i].reduce((sum, s) => sum + s.value, 0);
  const showTotal = stacked && series.length > 1;
  const totalLabel = labelOverrides?.total ?? defaultChartLabels.total;

  const geometry = (width: number) => {
    const extentValues = [...extents, ...referenceLines.map((r) => r.value)];
    if (horizontal) {
      const labelWidth = Math.min(Math.max(...categories.map((c) => estimateTextWidth(c)), 24) + 12, width * 0.4);
      const valueRoom = valueLabels ? 48 : M.right;
      const x = linearScale(extentValues, [labelWidth, width - valueRoom], { domain: valueDomain });
      const band = bandScale(data.length, [M.top, height - M.bottom], 0.3);
      return { x, band, labelWidth };
    }
    const plotBottom = height - M.bottom;
    const y = linearScale(extentValues, [plotBottom, M.top + (valueLabels ? 14 : 0)], { domain: valueDomain });
    const left = valueAxisWidth(y);
    const band = bandScale(data.length, [left, width - M.right], 0.3);
    return { y, band, left, plotBottom };
  };

  const subBand = (bandwidth: number) => {
    const groups = stacked ? 1 : Math.max(series.length, 1);
    const gap = groups > 1 ? 2 : 0;
    return { groups, gap, size: (bandwidth - gap * (groups - 1)) / groups };
  };

  return (
    <ChartFrame
      ref={ref}
      height={height}
      count={data.length}
      empty={empty}
      legend={legend}
      table={{
        headers: [categoryLabel ?? categoryKey, ...series.map((s) => s.label), ...(showTotal ? [totalLabel] : [])],
        rows: data.map((d, i) => [categories[i], ...series.map((s) => cell(d, s.key)), ...(showTotal ? [formatValue(totalOf(i))] : [])]),
      }}
      announce={(i) => `${categories[i]}: ${series.map((s) => `${s.label} ${cell(data[i], s.key)}`).join(', ')}${showTotal ? `, ${totalLabel} ${formatValue(totalOf(i))}` : ''}`}
      tooltip={(i) => (
        <TooltipContent
          title={categories[i]}
          rows={[
            ...series.map((s, si) => ({ key: s.key, label: s.label, value: cell(data[i], s.key), color: seriesColor(si, s.color) })),
            ...(showTotal ? [{ key: '__total', label: totalLabel, value: formatValue(totalOf(i)), color: 'transparent' }] : []),
          ]}
        />
      )}
      anchor={(i, width) => {
        const g = geometry(width);
        const max = Math.max(0, ...stacks[i].map((s) => s.to));
        if (horizontal) return { x: Math.min(g.x!(max), width - 20), y: g.band.start(i) };
        return { x: g.band.center(i), y: g.y!(max) };
      }}
      plot={(width, active, setActive) => {
        const g = geometry(width);
        const sb = subBand(g.band.bandwidth);
        const onMove = (event: PointerEvent<SVGRectElement>) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const offset = horizontal ? event.clientY - rect.top : event.clientX - rect.left;
          setActive(Math.min(Math.max(Math.floor(offset / g.band.step), 0), data.length - 1));
        };

        if (horizontal) {
          const x = g.x!;
          const lw = g.labelWidth ?? 0;
          const zero = x(Math.max(x.domain[0], Math.min(0, x.domain[1])));
          return (
            <svg width={width} height={height} aria-hidden="true" focusable="false">
              <ValueGridX scale={x} y0={M.top} y1={height - M.bottom} />
              {active !== null && <rect className={styles.hoverBand} x={lw} width={width - lw} y={g.band.start(active) - (g.band.step - g.band.bandwidth) / 2} height={g.band.step} />}
              {categories.map((c, i) => (
                <text key={i} className={styles.tick} x={lw - 8} y={g.band.center(i)} dy="0.32em" textAnchor="end">
                  {truncate(c, lw - 12)}
                </text>
              ))}
              {stacks.map((segs, i) =>
                segs.map((seg, k) => {
                  const slot = stacked ? 0 : seg.series;
                  const y0 = g.band.start(i) + slot * (sb.size + sb.gap);
                  const a = x(seg.from);
                  const b = x(seg.to);
                  // A 2px surface gap separates stacked segments.
                  const inset = stacked && !seg.outer ? 1 : 0;
                  const left = Math.min(a, b) + (seg.value < 0 ? inset : 0);
                  const w = Math.abs(b - a) - inset;
                  return (
                    <path key={`${i}-${k}`} className={styles.bar} fill={seriesColor(seg.series, series[seg.series].color)} d={barPath(left, y0, w, sb.size, seg.outer ? (seg.value < 0 ? 'start' : 'end') : null)} />
                  );
                }),
              )}
              {valueLabels &&
                data.map((_, i) => {
                  const total = stacked ? totalOf(i) : null;
                  return (stacked ? [{ series: 0, value: total!, to: total! }] : stacks[i]).map((seg, k) => {
                    const slot = stacked ? 0 : seg.series;
                    const cy = g.band.start(i) + slot * (sb.size + sb.gap) + sb.size / 2;
                    return (
                      <text key={`${i}-${k}`} className={styles.directLabel} x={x(seg.to) + (seg.value < 0 ? -6 : 6)} y={cy} dy="0.32em" textAnchor={seg.value < 0 ? 'end' : 'start'}>
                        {formatCompact(seg.value)}
                      </text>
                    );
                  });
                })}
              <line className={styles.baseline} x1={zero} x2={zero} y1={M.top} y2={height - M.bottom} aria-hidden="true" />
              <ReferenceLines lines={referenceLines} scale={x} from={M.top} to={height - M.bottom} horizontal={false} />
              <rect x={lw} y={M.top} width={width - lw} height={height - M.top - M.bottom} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} />
            </svg>
          );
        }

        const y = g.y!;
        const zero = y(Math.max(y.domain[0], Math.min(0, y.domain[1])));
        const every = labelEvery(categories, g.band.step);
        return (
          <svg width={width} height={height} aria-hidden="true" focusable="false">
            <ValueGridY scale={y} x0={g.left!} x1={width - M.right} />
            {active !== null && <rect className={styles.hoverBand} x={g.band.start(active) - (g.band.step - g.band.bandwidth) / 2} width={g.band.step} y={M.top} height={g.plotBottom! - M.top} />}
            {categories.map((c, i) =>
              i % every === 0 ? (
                <text key={i} className={styles.tick} x={g.band.center(i)} y={g.plotBottom! + 18} textAnchor="middle">
                  {truncate(c, g.band.step * every - 6)}
                </text>
              ) : null,
            )}
            {stacks.map((segs, i) =>
              segs.map((seg, k) => {
                const slot = stacked ? 0 : seg.series;
                const x0 = g.band.start(i) + slot * (sb.size + sb.gap);
                const a = y(seg.from);
                const b = y(seg.to);
                const inset = stacked && !seg.outer ? 1 : 0;
                const top = Math.min(a, b) + (seg.value > 0 ? inset : 0);
                const h = Math.abs(b - a) - inset;
                return (
                  <path key={`${i}-${k}`} className={styles.bar} fill={seriesColor(seg.series, series[seg.series].color)} d={barPath(x0, top, sb.size, h, seg.outer ? (seg.value < 0 ? 'bottom' : 'top') : null)} />
                );
              }),
            )}
            {valueLabels &&
              data.map((_, i) => {
                const total = stacked ? totalOf(i) : null;
                return (stacked ? [{ series: 0, value: total!, to: total! }] : stacks[i]).map((seg, k) => {
                  const slot = stacked ? 0 : seg.series;
                  const cx = g.band.start(i) + slot * (sb.size + sb.gap) + sb.size / 2;
                  return (
                    <text key={`${i}-${k}`} className={styles.directLabel} x={cx} y={y(seg.to) + (seg.value < 0 ? 14 : -6)} textAnchor="middle">
                      {formatCompact(seg.value)}
                    </text>
                  );
                });
              })}
            <line className={styles.baseline} x1={g.left!} x2={width - M.right} y1={Math.round(zero) + 0.5} y2={Math.round(zero) + 0.5} aria-hidden="true" />
            <ReferenceLines lines={referenceLines} scale={y} from={g.left!} to={width - M.right} />
            <rect x={g.left!} y={M.top} width={width - M.right - g.left!} height={g.plotBottom! - M.top} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} />
          </svg>
        );
      }}
      labels={labelOverrides}
      {...rest}
    />
  );
});
