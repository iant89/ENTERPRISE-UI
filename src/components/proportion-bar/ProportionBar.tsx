import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { formatNumber, seriesColor, toneColor } from '../chart-core/palette';
import styles from './ProportionBar.module.css';

export interface ProportionBarSegment {
  /** Segment name. */
  label: string;
  /** Segment value. */
  value: number;
  /** Status color, for segments that represent a state (on time, late, blocked). */
  tone?: Tone;
  /** Explicit color. Defaults to the fixed categorical order (or `tone`). */
  color?: string;
}

export interface ProportionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Accessible name, e.g. "Orders by delivery status". */
  label: string;
  /** Parts of the whole, in display order. */
  segments: ProportionBarSegment[];
  /** Value of the whole. Defaults to the sum; a larger total leaves an empty remainder. */
  total?: number;
  /** Shows the legend with values and shares. @default true */
  showLegend?: boolean;
  /** Bar thickness. @default 'md' */
  size?: 'sm' | 'md';
  /** Formats values. @default locale number format */
  formatValue?: (value: number) => string;
}

/** A single 100% bar showing how a total splits into a few parts (a stacked bar micro chart). */
export const ProportionBar = forwardRef<HTMLDivElement, ProportionBarProps>(function ProportionBar(
  { label, segments, total: totalProp, showLegend = true, size = 'md', formatValue = formatNumber, className, ...rest },
  ref,
) {
  const parts = segments.filter((s) => s.value > 0);
  const sum = parts.reduce((acc, s) => acc + s.value, 0);
  const total = Math.max(totalProp ?? sum, sum) || 1;
  const share = (v: number) => `${Math.round((v / total) * 100)}%`;
  const colorOf = (s: ProportionBarSegment, i: number) => s.color ?? (s.tone ? toneColor(s.tone) : seriesColor(i));
  const summary = `${label}: ${parts.map((s) => `${s.label} ${formatValue(s.value)} (${share(s.value)})`).join(', ')}`;

  return (
    <div ref={ref} className={cx(styles.root, styles[size], className)} role={showLegend ? 'group' : 'img'} aria-label={showLegend ? label : summary} {...rest}>
      <div className={styles.bar} aria-hidden="true">
        {parts.map((s, i) => (
          <span key={`${s.label}-${i}`} className={styles.segment} style={{ flexGrow: s.value, background: colorOf(s, i) }} title={`${s.label}: ${formatValue(s.value)} (${share(s.value)})`} />
        ))}
        {total > sum && <span className={styles.remainder} style={{ flexGrow: total - sum }} />}
      </div>
      {showLegend && (
        <ul className={styles.legend}>
          {parts.map((s, i) => (
            <li key={`${s.label}-${i}`} className={styles.item}>
              <span className={styles.swatch} style={{ color: colorOf(s, i) }} aria-hidden="true" />
              <span>{s.label}</span>
              <span className={styles.value}>
                {formatValue(s.value)} · {share(s.value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
