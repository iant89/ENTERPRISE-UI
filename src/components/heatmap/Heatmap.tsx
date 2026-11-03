import { forwardRef, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react';
import { cx } from '../../utilities/cx';
import { formatNumber, sequentialColor } from '../chart-core/palette';
import styles from './Heatmap.module.css';

export interface HeatmapLabels {
  /** Text for empty cells. */
  noValue: string;
  /** Legend caption for the low end of the ramp. */
  low: string;
  /** Legend caption for the high end of the ramp. */
  high: string;
}

export interface HeatmapProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Accessible name, e.g. "Warehouse utilization by weekday and hour". */
  label: string;
  /** Row headers (y dimension). */
  rows: string[];
  /** Column headers (x dimension). */
  columns: string[];
  /** Values by row then column; `null` marks a missing measurement. */
  values: (number | null)[][];
  /** Value mapped to the lightest step. Defaults to the minimum. */
  min?: number;
  /** Value mapped to the darkest step. Defaults to the maximum. */
  max?: number;
  /** Prints values inside the cells. @default false */
  showValues?: boolean;
  /** Shows the color ramp legend. @default true */
  showLegend?: boolean;
  /** Ramp hue; one hue light to dark. @default 'var(--eui-color-chart-1)' */
  color?: string;
  /** Formats values. */
  formatValue?: (value: number) => string;
  /** Called when a cell is activated with Enter, Space or a click. */
  onCellClick?: (cell: { row: number; column: number; value: number | null }) => void;
  /** Overrides for the built-in strings. */
  labels?: Partial<HeatmapLabels>;
}

const defaultLabels: HeatmapLabels = { noValue: 'No data', low: 'Low', high: 'High' };

/** Magnitude across two categorical dimensions as a grid of shaded cells. */
export const Heatmap = forwardRef<HTMLDivElement, HeatmapProps>(function Heatmap(
  { label, rows, columns, values, min: minProp, max: maxProp, showValues = false, showLegend = true, color = 'var(--eui-color-chart-1)', formatValue = formatNumber, onCellClick, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const flat = values.flat().filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const min = minProp ?? (flat.length ? Math.min(...flat) : 0);
  const max = maxProp ?? (flat.length ? Math.max(...flat) : 1);
  const t = (v: number) => (v - min) / (max - min || 1);
  const [focus, setFocus] = useState<[number, number]>([0, 0]);
  const gridRef = useRef<HTMLTableElement>(null);

  const move = (r: number, c: number) => {
    const nr = Math.min(Math.max(r, 0), rows.length - 1);
    const nc = Math.min(Math.max(c, 0), columns.length - 1);
    setFocus([nr, nc]);
    gridRef.current?.querySelector<HTMLElement>(`[data-cell="${nr}-${nc}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const [r, c] = focus;
    const map: Record<string, () => void> = {
      ArrowRight: () => move(r, c + 1),
      ArrowLeft: () => move(r, c - 1),
      ArrowDown: () => move(r + 1, c),
      ArrowUp: () => move(r - 1, c),
      Home: () => move(event.ctrlKey ? 0 : r, 0),
      End: () => move(event.ctrlKey ? rows.length - 1 : r, columns.length - 1),
      Enter: () => onCellClick?.({ row: r, column: c, value: values[r]?.[c] ?? null }),
      ' ': () => onCellClick?.({ row: r, column: c, value: values[r]?.[c] ?? null }),
    };
    const handler = map[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  };

  return (
    <div ref={ref} className={cx(styles.root, className)} {...rest}>
      <div className={styles.scroll}>
        <table ref={gridRef} className={styles.grid} role="grid" aria-label={label} onKeyDown={onKeyDown}>
          <thead>
            <tr>
              <td className={styles.corner} />
              {columns.map((col) => (
                <th key={col} scope="col" className={styles.colHeader}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={row}>
                <th scope="row" className={styles.rowHeader}>
                  {row}
                </th>
                {columns.map((col, c) => {
                  const v = values[r]?.[c];
                  const has = typeof v === 'number' && Number.isFinite(v);
                  const strong = has && t(v) > 0.55;
                  const text = has ? formatValue(v) : labels.noValue;
                  return (
                    <td
                      key={col}
                      role="gridcell"
                      data-cell={`${r}-${c}`}
                      tabIndex={focus[0] === r && focus[1] === c ? 0 : -1}
                      className={cx(styles.cell, !has && styles.missing, strong && styles.strong, onCellClick && styles.clickable)}
                      style={has ? { background: sequentialColor(t(v), color) } : undefined}
                      title={`${row}, ${col}: ${text}`}
                      onFocus={() => setFocus([r, c])}
                      onClick={onCellClick ? () => onCellClick({ row: r, column: c, value: has ? v : null }) : undefined}
                    >
                      {showValues && has ? <span aria-hidden="true">{formatValue(v)}</span> : null}
                      <span className="eui-visually-hidden">{text}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showLegend && flat.length > 0 && (
        <div className={styles.legend} aria-hidden="true">
          <span>
            {labels.low} {formatValue(min)}
          </span>
          <span className={styles.ramp} style={{ background: `linear-gradient(to right, ${sequentialColor(0, color)}, ${sequentialColor(1, color)})` }} />
          <span>
            {labels.high} {formatValue(max)}
          </span>
        </div>
      )}
    </div>
  );
});
