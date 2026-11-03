import type { LinearScale } from './scale';
import { estimateTextWidth } from './scale';
import { formatCompact, toneColor } from './palette';
import type { ChartReferenceLine } from './types';
import styles from './Chart.module.css';

export type BarEnd = 'top' | 'bottom' | 'start' | 'end' | null;

/**
 * Rect path with a 4px radius on the data end only, so bars stay anchored to the baseline.
 * `end` names the side that carries the value (top for positive columns, end for positive bars).
 */
export function barPath(x: number, y: number, w: number, h: number, end: BarEnd, radius = 4): string {
  if (w <= 0 || h <= 0) return '';
  const r = Math.min(radius, w / 2, h / 2);
  const tl = end === 'top' || end === 'start' ? r : 0;
  const tr = end === 'top' || end === 'end' ? r : 0;
  const br = end === 'bottom' || end === 'end' ? r : 0;
  const bl = end === 'bottom' || end === 'start' ? r : 0;
  return [
    `M${x + tl},${y}`,
    `H${x + w - tr}`,
    tr ? `Q${x + w},${y} ${x + w},${y + tr}` : '',
    `V${y + h - br}`,
    br ? `Q${x + w},${y + h} ${x + w - br},${y + h}` : '',
    `H${x + bl}`,
    bl ? `Q${x},${y + h} ${x},${y + h - bl}` : '',
    `V${y + tl}`,
    tl ? `Q${x},${y} ${x + tl},${y}` : '',
    'Z',
  ].join(' ');
}

/** Width needed for the value-axis tick labels. */
export function valueAxisWidth(scale: LinearScale, format: (v: number) => string = formatCompact) {
  return Math.ceil(Math.max(...scale.ticks.map((t) => estimateTextWidth(format(t))), 12)) + 8;
}

/** Horizontal grid lines and value ticks for a vertical value axis. */
export function ValueGridY({ scale, x0, x1, format = formatCompact }: { scale: LinearScale; x0: number; x1: number; format?: (v: number) => string }) {
  return (
    <g aria-hidden="true">
      {scale.ticks.map((t) => {
        const y = Math.round(scale(t)) + 0.5;
        return (
          <g key={t}>
            <line className={t === 0 ? styles.baseline : styles.grid} x1={x0} x2={x1} y1={y} y2={y} />
            <text className={styles.tick} x={x0 - 8} y={y} dy="0.32em" textAnchor="end">
              {format(t)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Vertical grid lines and value ticks for a horizontal value axis (horizontal bar charts). */
export function ValueGridX({ scale, y0, y1, format = formatCompact }: { scale: LinearScale; y0: number; y1: number; format?: (v: number) => string }) {
  return (
    <g aria-hidden="true">
      {scale.ticks.map((t) => {
        const x = Math.round(scale(t)) + 0.5;
        return (
          <g key={t}>
            <line className={t === 0 ? styles.baseline : styles.grid} x1={x} x2={x} y1={y0} y2={y1} />
            <text className={styles.tick} x={x} y={y1 + 16} textAnchor="middle">
              {format(t)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Dashed target or threshold lines with a short end label. */
export function ReferenceLines({ lines, scale, from, to, horizontal = true }: { lines: ChartReferenceLine[]; scale: LinearScale; from: number; to: number; horizontal?: boolean }) {
  return (
    <g aria-hidden="true">
      {lines.map((line) => {
        const p = Math.round(scale(line.value)) + 0.5;
        const color = toneColor(line.tone ?? 'neutral');
        return horizontal ? (
          <g key={`${line.label}-${line.value}`}>
            <line className={styles.reference} style={{ stroke: color }} x1={from} x2={to} y1={p} y2={p} />
            <text className={styles.referenceLabel} x={to} y={p - 4} textAnchor="end">
              {line.label}
            </text>
          </g>
        ) : (
          <g key={`${line.label}-${line.value}`}>
            <line className={styles.reference} style={{ stroke: color }} x1={p} x2={p} y1={from} y2={to} />
            <text className={styles.referenceLabel} x={p + 4} y={from + 10}>
              {line.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Every n-th category label is shown so labels never collide. */
export function labelEvery(labels: string[], slot: number): number {
  const widest = Math.max(...labels.map((l) => estimateTextWidth(l)), 1);
  return Math.max(1, Math.ceil((widest + 12) / Math.max(slot, 1)));
}
