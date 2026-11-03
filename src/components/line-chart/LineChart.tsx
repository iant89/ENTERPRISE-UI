import { forwardRef, type PointerEvent } from 'react';
import { ChartFrame, TooltipContent, type ChartBaseProps, type ChartLegendItem } from '../chart-core/ChartFrame';
import { ReferenceLines, ValueGridY, labelEvery, valueAxisWidth } from '../chart-core/cartesian';
import { formatNumber, seriesColor, toneColor } from '../chart-core/palette';
import { estimateTextWidth, linearScale, truncate } from '../chart-core/scale';
import { valueOf, type ChartDatum, type ChartReferenceLine, type ChartSelectProps, type ChartSeries } from '../chart-core/types';
import styles from '../chart-core/Chart.module.css';

export interface LineChartProps extends ChartBaseProps, ChartSelectProps {
  /** Rows of data, one per category (usually a time period), in display order. */
  data: ChartDatum[];
  /** Field holding each row's category label. */
  categoryKey: string;
  /** Header of the category column in the data table. Defaults to `categoryKey`. */
  categoryLabel?: string;
  /** Measures to draw as lines. Colors follow the fixed categorical order. */
  series: ChartSeries[];
  /** Fills the area under each line. Use for one or two series only. @default false */
  area?: boolean;
  /** Draws a marker on every point, not only the hovered one. @default false */
  markers?: boolean;
  /** Labels each line at its last point (2–4 series), so identity is not color-only. @default true */
  directLabels?: boolean;
  /** Targets or thresholds drawn as dashed lines. */
  referenceLines?: ChartReferenceLine[];
  /** Fixed value-axis bounds; leave either side undefined to compute it. */
  yDomain?: [number?, number?];
  /** Keeps zero on the value axis. Turn off to zoom into small changes (areas always keep zero). @default true */
  includeZero?: boolean;
}

const M = { top: 12, bottom: 28, right: 16 };

/** Trend over an ordered dimension (usually time) for one or more measures. */
export const LineChart = forwardRef<HTMLElement, LineChartProps>(function LineChart(
  { data, categoryKey, categoryLabel, series, area = false, markers = false, directLabels = true, referenceLines = [], yDomain, includeZero = true, height: heightProp = 240, formatValue = formatNumber, onSelect, selectedCategory, ...rest },
  ref,
) {
  const baseHeight = heightProp;
  const categories = data.map((d) => String(d[categoryKey] ?? ''));
  const values = data.flatMap((d) => series.map((s) => valueOf(d, s.key))).filter((v): v is number => v !== null);
  const empty = data.length === 0 || series.length === 0 || values.length === 0;
  const labelled = directLabels && series.length >= 2 && series.length <= 4;

  const legend: ChartLegendItem[] = [
    ...series.map((s, i) => ({ key: s.key, label: s.label, color: seriesColor(i, s.color) })),
    ...referenceLines.map((r) => ({ key: `ref-${r.label}`, label: r.label, color: toneColor(r.tone ?? 'neutral'), dashed: true })),
  ];
  const cell = (d: ChartDatum, key: string) => {
    const v = valueOf(d, key);
    return v === null ? '–' : formatValue(v);
  };

  const geometry = (width: number, height: number) => {
    const plotHeight = height - M.top - M.bottom;
    const y = linearScale([...values, ...referenceLines.map((r) => r.value)], [M.top + plotHeight, M.top], { includeZero: includeZero || area, domain: yDomain });
    const left = valueAxisWidth(y);
    const right = labelled ? Math.min(Math.max(...series.map((s) => estimateTextWidth(s.label))) + 12, width * 0.25) : M.right;
    const plotWidth = Math.max(width - left - right, 1);
    const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
    const x = (i: number) => (data.length > 1 ? left + i * step : left + plotWidth / 2);
    return { y, left, right, plotWidth, step, x };
  };

  return (
    <ChartFrame
      ref={ref}
      height={baseHeight}
      count={data.length}
      empty={empty}
      legend={legend}
      table={{ headers: [categoryLabel ?? categoryKey, ...series.map((s) => s.label)], rows: data.map((d, i) => [categories[i], ...series.map((s) => cell(d, s.key))]) }}
      announce={(i) => `${categories[i]}: ${series.map((s) => `${s.label} ${cell(data[i], s.key)}`).join(', ')}`}
      tooltip={(i) => <TooltipContent title={categories[i]} rows={series.map((s, si) => ({ key: s.key, label: s.label, value: cell(data[i], s.key), color: seriesColor(si, s.color) }))} />}
      anchor={(i, width, height) => {
        const g = geometry(width, height);
        const ys = series.map((s) => valueOf(data[i], s.key)).filter((v): v is number => v !== null).map(g.y);
        return { x: g.x(i), y: ys.length ? Math.min(...ys) : M.top };
      }}
      plot={(width, active, setActive, height) => {
        const g = geometry(width, height);
        const bottom = M.top + (height - M.top - M.bottom);
        const base = g.y(Math.max(g.y.domain[0], Math.min(0, g.y.domain[1])));
        const every = labelEvery(categories, g.step || g.plotWidth);
        const onMove = (event: PointerEvent<SVGRectElement>) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const px = event.clientX - rect.left;
          setActive(data.length > 1 ? Math.min(Math.max(Math.floor(px / g.step), 0), data.length - 1) : 0);
        };
        // End labels, nudged apart so they never overlap.
        const ends = labelled
          ? series
              .map((s, si) => {
                let last = data.length - 1;
                while (last >= 0 && valueOf(data[last], s.key) === null) last--;
                return last < 0 ? null : { key: s.key, label: s.label, x: g.x(last), y: g.y(valueOf(data[last], s.key)!), color: seriesColor(si, s.color) };
              })
              .filter((e): e is NonNullable<typeof e> => e !== null)
              .sort((a, b) => a.y - b.y)
          : [];
        for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;
        return (
          <svg width={width} height={height} aria-hidden="true" focusable="false">
            <ValueGridY scale={g.y} x0={g.left} x1={g.left + g.plotWidth} />
            {categories.map((c, i) =>
              i % every === 0 ? (
                <text key={i} className={styles.tick} x={g.x(i)} y={bottom + 18} textAnchor={data.length > 1 && i === 0 ? 'start' : 'middle'}>
                  {truncate(c, Math.max(g.step * every - 8, 24))}
                </text>
              ) : null,
            )}
            <ReferenceLines lines={referenceLines} scale={g.y} from={g.left} to={g.left + g.plotWidth} />
            {selectedCategory != null && categories.includes(selectedCategory) && (
              <rect className={styles.hoverBand} x={g.x(categories.indexOf(selectedCategory)) - Math.max(g.step / 2, 6)} width={Math.max(g.step, 12)} y={M.top} height={bottom - M.top} />
            )}
            {active !== null && <line className={styles.crosshair} x1={g.x(active)} x2={g.x(active)} y1={M.top} y2={bottom} />}
            {series.map((s, si) => {
              const color = seriesColor(si, s.color);
              // Split into runs so missing values leave a gap instead of a misleading interpolation.
              const runs: [number, number][][] = [[]];
              data.forEach((d, i) => {
                const v = valueOf(d, s.key);
                if (v === null) {
                  if (runs[runs.length - 1].length) runs.push([]);
                } else runs[runs.length - 1].push([g.x(i), g.y(v)]);
              });
              return (
                <g key={s.key} style={{ color }}>
                  {runs.filter((r) => r.length).map((run, ri) => {
                    const d = run.map(([px, py], pi) => `${pi ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
                    return (
                      <g key={ri}>
                        {area && <path className={styles.area} fill="currentColor" d={`${d} L${run[run.length - 1][0].toFixed(1)},${base} L${run[0][0].toFixed(1)},${base} Z`} />}
                        <path className={styles.line} stroke="currentColor" d={d} />
                        {run.length === 1 && <circle className={styles.marker} cx={run[0][0]} cy={run[0][1]} r={4} fill="currentColor" />}
                      </g>
                    );
                  })}
                  {data.map((d, i) => {
                    const v = valueOf(d, s.key);
                    if (v === null || (!markers && active !== i)) return null;
                    return <circle key={i} className={styles.marker} cx={g.x(i)} cy={g.y(v)} r={active === i ? 5 : 4} fill="currentColor" />;
                  })}
                </g>
              );
            })}
            {ends.map((e) => (
              <g key={e.key}>
                <text className={styles.directLabel} x={e.x + 8} y={e.y} dy="0.32em">
                  {truncate(e.label, g.right - 10)}
                </text>
              </g>
            ))}
            <rect x={g.left - (g.step / 2 || 0)} y={M.top} width={g.plotWidth + (g.step || 0)} height={bottom - M.top} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} />
          </svg>
        );
      }}
      onSelectIndex={onSelect ? (i) => onSelect({ index: i, category: categories[i] }) : undefined}
      {...rest}
    />
  );
});
