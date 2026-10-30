import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { Skeleton } from '../skeleton';
import styles from './MetricCard.module.css';

export interface MetricTrend {
  direction: 'up' | 'down' | 'flat';
  /** Change text, e.g. `+4.2%`. */
  value: string;
  /** Context, e.g. `vs last month`. */
  label?: string;
  /** Whether an increase is good (green). @default true */
  upIsGood?: boolean;
}

export interface MetricCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  /** Title of the metric. */
  title: ReactNode;
  /** Secondary text shown below the title. */
  subtitle?: ReactNode;
  /** The headline figure, already formatted. */
  value: ReactNode;
  /** Unit or scale, e.g. `EUR`, `K`, `%`. */
  unit?: ReactNode;
  /** Trend of the value, shown as an arrow with an accessible description. */
  trend?: MetricTrend;
  /** Color the value by status (Fiori semantic KPI coloring). */
  tone?: Exclude<Tone, 'neutral'>;
  /** Icon shown next to the title. */
  icon?: ReactNode;
  /** Data points for a small trend line. */
  sparkline?: number[];
  /** Content shown in the footer. */
  footer?: ReactNode;
  /** @default false */
  /** Shows a skeleton in place of the value while data loads. */
  loading?: boolean;
  /** Make the whole card a single click target (e.g. drill-down). */
  onClick?: () => void;
  /** @default 3 */
  /** Heading level used for the title, so the document outline stays correct. */
  headingLevel?: 2 | 3 | 4;
}

function Sparkline({ points }: { points: number[] }) {
  const w = 96;
  const h = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => [(i / Math.max(points.length - 1, 1)) * w, h - ((p - min) / range) * (h - 4) - 2]);
  const path = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const last = coords[coords.length - 1];
  return (
    <svg className={styles.sparkline} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={area} fill="currentColor" opacity="0.1" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {last && <circle cx={last[0]} cy={last[1]} r="3" fill="currentColor" />}
    </svg>
  );
}

/** Key performance indicator tile: headline value, unit, trend and optional sparkline. */
export const MetricCard = forwardRef<HTMLElement, MetricCardProps>(function MetricCard(
  { title, subtitle, value, unit, trend, tone, icon, sparkline, footer, loading = false, onClick, headingLevel = 3, className, ...rest },
  ref,
) {
  const Heading = `h${headingLevel}` as const;
  const TrendIcon = trend?.direction === 'up' ? ArrowUpRight : trend?.direction === 'down' ? ArrowDownRight : ArrowRight;
  const good = trend && trend.direction !== 'flat' ? (trend.direction === 'up') === (trend.upIsGood ?? true) : null;
  return (
    <article ref={ref} className={cx(styles.card, tone && styles[tone], onClick && styles.interactive, className)} aria-busy={loading || undefined} {...rest}>
      <div className={styles.header}>
        <div>
          <Heading className={styles.title}>
            {onClick ? (
              <button type="button" className={styles.cover} onClick={onClick}>
                {title}
              </button>
            ) : (
              title
            )}
          </Heading>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      </div>
      {loading ? (
        <Skeleton variant="rect" height={40} width="60%" />
      ) : (
        <div className={styles.valueRow}>
          <div>
            <div className={styles.value}>
              <span>{value}</span>
              {unit && <span className={styles.unit}>{unit}</span>}
            </div>
            {trend && (
              <div className={cx(styles.trend, good === null ? styles.flat : good ? styles.good : styles.bad)}>
                <TrendIcon aria-hidden="true" />
                <span>
                  <span className="eui-visually-hidden">{trend.direction === 'up' ? 'Up' : trend.direction === 'down' ? 'Down' : 'Unchanged'}</span>{' '}
                  {trend.value}
                </span>
                {trend.label && <span className={styles.trendLabel}>{trend.label}</span>}
              </div>
            )}
          </div>
          {sparkline && sparkline.length > 1 && <Sparkline points={sparkline} />}
        </div>
      )}
      {footer && <div className={styles.footer}>{footer}</div>}
    </article>
  );
});
