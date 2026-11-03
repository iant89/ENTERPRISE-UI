import { forwardRef, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useElementSize } from '../../hooks/useResizeObserver';
import { Skeleton } from '../skeleton';
import styles from './Chart.module.css';

/** Localizable strings shared by the charts. */
export interface ChartLabels {
  /** Toggle button text that reveals the data table. */
  showTable: string;
  /** Toggle button text that hides the data table. */
  hideTable: string;
  /** Shown when there is nothing to plot. */
  noData: string;
  /** Announced while `loading`. */
  loading: string;
  /** `aria-roledescription` of the focusable plot area. */
  roleDescription: string;
  /** Name of the series or segment that collects values beyond the color budget. */
  other: string;
  /** Instructions announced with the chart name. */
  instructions: string;
  /** Name of the total row or column of stacked charts. */
  total: string;
}

export const defaultChartLabels: ChartLabels = {
  showTable: 'Show table',
  hideTable: 'Hide table',
  noData: 'No data',
  loading: 'Loading chart',
  roleDescription: 'chart',
  other: 'Other',
  instructions: 'Use the arrow keys to move between data points.',
  total: 'Total',
};

/** Properties shared by every full-size chart. */
export interface ChartBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /** Accessible name of the chart, for example "Revenue by month". Also the data table caption. */
  label: string;
  /** Visible one-line takeaway shown under the chart (for example "Revenue is up 12% on last year"). */
  description?: ReactNode;
  /** Height of the plot area in pixels. @default 240 */
  height?: number;
  /** Formats values in tooltips, the legend and the data table. Defaults to locale number formatting. */
  formatValue?: (value: number) => string;
  /** Shows the legend when there are two or more series. @default true */
  showLegend?: boolean;
  /** Shows a button that reveals the underlying data as a table. @default true */
  tableToggle?: boolean;
  /** Shows a placeholder while data loads. @default false */
  loading?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<ChartLabels>;
}

export interface ChartLegendItem {
  key: string;
  label: string;
  color: string;
  /** Optional direct value, e.g. a donut segment's share. */
  value?: string;
  /** Dashed swatch for reference lines and forecasts. */
  dashed?: boolean;
}

export interface ChartTable {
  headers: string[];
  rows: string[][];
}

interface ChartFrameProps extends ChartBaseProps {
  /** Number of keyboard-navigable points (categories, segments). */
  count: number;
  empty: boolean;
  legend: ChartLegendItem[];
  table: ChartTable;
  /** Text announced when the keyboard moves to a point. */
  announce: (index: number) => string;
  /** Tooltip content for the active point. */
  tooltip: (index: number) => ReactNode;
  /** Tooltip anchor in plot coordinates. */
  anchor: (index: number, width: number) => { x: number; y: number };
  /** Renders the SVG plot for the measured width. */
  plot: (width: number, active: number | null, setActive: (index: number | null) => void) => ReactNode;
  rootClassName?: string;
}

const FALLBACK_WIDTH = 480;

/** Internal frame: legend, keyboard navigation, live announcements, tooltip and data-table view. */
export const ChartFrame = forwardRef<HTMLElement, ChartFrameProps>(function ChartFrame(
  {
    label, description, height = 240, showLegend = true, tableToggle = true, loading = false, labels: labelOverrides,
    count, empty, legend, table, announce, tooltip, anchor, plot, rootClassName, className, formatValue: _formatValue, ...rest
  },
  ref,
) {
  const labels = { ...defaultChartLabels, ...labelOverrides };
  const plotRef = useRef<HTMLDivElement>(null);
  const { width: measured } = useElementSize(plotRef);
  const width = measured || FALLBACK_WIDTH;
  const [active, setActive] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [tableOpen, setTableOpen] = useState(false);
  const instructionsId = useId(undefined, 'chart-help');
  const tableId = useId(undefined, 'chart-table');

  const moveTo = (index: number) => {
    const next = Math.min(Math.max(index, 0), count - 1);
    setActive(next);
    setMessage(announce(next));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!count) return;
    const current = active ?? -1;
    const keys: Record<string, () => void> = {
      ArrowRight: () => moveTo(current + 1),
      ArrowDown: () => moveTo(current + 1),
      ArrowLeft: () => moveTo(current < 0 ? count - 1 : current - 1),
      ArrowUp: () => moveTo(current < 0 ? count - 1 : current - 1),
      Home: () => moveTo(0),
      End: () => moveTo(count - 1),
      Escape: () => setActive(null),
    };
    const handler = keys[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  };

  const tip = active !== null && active < count ? tooltip(active) : null;
  const point = active !== null && active < count ? anchor(active, width) : null;
  const align = point ? (point.x < 90 ? 'start' : point.x > width - 90 ? 'end' : 'center') : 'center';

  return (
    <figure ref={ref} className={cx(styles.chart, rootClassName, className)} aria-busy={loading || undefined} {...rest}>
      {loading ? (
        <div className={styles.placeholder} style={{ height }}>
          <Skeleton variant="rect" height={height} width="100%" />
          <span className="eui-visually-hidden" role="status">{labels.loading}</span>
        </div>
      ) : empty ? (
        <div className={styles.empty} style={{ height }} role="img" aria-label={`${label}: ${labels.noData}`}>
          {labels.noData}
        </div>
      ) : (
        <div
          ref={plotRef}
          className={styles.plot}
          style={{ height }}
          role="group"
          tabIndex={0}
          aria-label={label}
          aria-roledescription={labels.roleDescription}
          aria-describedby={instructionsId}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
        >
          {plot(width, active, setActive)}
          {tip && point && (
            <div className={cx(styles.tooltip, styles[`tooltip-${align}`])} style={{ left: point.x, top: point.y }} aria-hidden="true">
              {tip}
            </div>
          )}
          <span id={instructionsId} className="eui-visually-hidden">{labels.instructions}</span>
          <span className="eui-visually-hidden" aria-live="polite">{message}</span>
        </div>
      )}
      {!loading && !empty && showLegend && legend.length >= 2 && (
        <ul className={styles.legend}>
          {legend.map((item) => (
            <li key={item.key} className={styles.legendItem}>
              <span className={cx(styles.swatch, item.dashed && styles.swatchDashed)} style={{ color: item.color }} aria-hidden="true" />
              <span>{item.label}</span>
              {item.value && <span className={styles.legendValue}>{item.value}</span>}
            </li>
          ))}
        </ul>
      )}
      {(description || (tableToggle && !loading && !empty)) && (
        <figcaption className={styles.caption}>
          {description && <span className={styles.description}>{description}</span>}
          {tableToggle && !loading && !empty && (
            <button type="button" className={styles.tableToggle} aria-expanded={tableOpen} aria-controls={tableId} onClick={() => setTableOpen((v) => !v)}>
              {tableOpen ? labels.hideTable : labels.showTable}
            </button>
          )}
        </figcaption>
      )}
      {!loading && !empty && (
        <div id={tableId} className={cx(styles.tableWrap, !tableOpen && 'eui-visually-hidden')}>
          <table className={styles.table}>
            <caption className="eui-visually-hidden">{label}</caption>
            <thead>
              <tr>
                {table.headers.map((h, i) => (
                  <th key={i} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
});

/** Tooltip body: a heading and rows of swatch, name and value. */
export function TooltipContent({ title, rows }: { title: ReactNode; rows: { key: string; label: string; value: string; color: string }[] }) {
  return (
    <>
      <div className={styles.tooltipTitle}>{title}</div>
      {rows.map((row) => (
        <div key={row.key} className={styles.tooltipRow}>
          <span className={styles.swatch} style={{ color: row.color }} />
          <span className={styles.tooltipLabel}>{row.label}</span>
          <span className={styles.tooltipValue}>{row.value}</span>
        </div>
      ))}
    </>
  );
}
