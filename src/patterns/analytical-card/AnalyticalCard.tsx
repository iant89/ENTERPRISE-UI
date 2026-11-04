import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowRightIcon, TrendDownIcon, TrendUpIcon } from '../../icons';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import type { Tone } from '../../utilities/types';
import type { MetricTrend } from '../../components/metric-card';
import { Skeleton } from '../../components/skeleton';
import styles from './AnalyticalCard.module.css';

export interface AnalyticalCardIndicator {
  /** Name, e.g. "Target" or "Deviation". */
  label: string;
  /** Formatted value. */
  value: ReactNode;
  /** Status color for the value. */
  tone?: Exclude<Tone, 'neutral'>;
}

export interface AnalyticalCardLabels {
  up: string;
  down: string;
  flat: string;
}

export interface AnalyticalCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Card title, e.g. "Revenue by region". */
  title: ReactNode;
  /** Secondary line, e.g. the period. */
  subtitle?: ReactNode;
  /** Status text at the top end, e.g. "4 of 12". */
  status?: ReactNode;
  /** Headline KPI, already formatted. */
  value?: ReactNode;
  /** Unit or scale of the KPI, e.g. "M EUR". */
  unit?: ReactNode;
  /** Status color for the KPI (good, critical, bad). */
  valueTone?: Exclude<Tone, 'neutral'>;
  /** Trend arrow and change text. */
  trend?: MetricTrend;
  /** Up to three side indicators such as target and deviation. */
  indicators?: AnalyticalCardIndicator[];
  /** Header actions, e.g. an overflow menu. */
  actions?: ReactNode;
  /** Makes the header a single navigation target (drill down to the analytical app). */
  onHeaderClick?: () => void;
  /** Footer text, e.g. data freshness. */
  footer?: ReactNode;
  /** Shows placeholders while data loads. @default false */
  loading?: boolean;
  /** Heading level of the title. @default 3 */
  headingLevel?: 2 | 3 | 4;
  /** Chart or other visualization. */
  children?: ReactNode;
  /** Overrides for the built-in strings. */
  labels?: Partial<AnalyticalCardLabels>;
}

const defaultLabels: AnalyticalCardLabels = { up: 'Up', down: 'Down', flat: 'Unchanged' };

/** An overview-page card: KPI header with trend and target, a chart, and an optional drill-down. */
export const AnalyticalCard = forwardRef<HTMLElement, AnalyticalCardProps>(function AnalyticalCard(
  { title, subtitle, status, value, unit, valueTone, trend, indicators = [], actions, onHeaderClick, footer, loading = false, headingLevel = 3, labels: labelOverrides, className, children, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const titleId = useId(undefined, 'analytical-card');
  const Heading = `h${headingLevel}` as const;
  const TrendIcon = trend?.direction === 'up' ? TrendUpIcon : trend?.direction === 'down' ? TrendDownIcon : ArrowRightIcon;
  const good = trend && trend.direction !== 'flat' ? (trend.direction === 'up') === (trend.upIsGood ?? true) : null;

  return (
    <article ref={ref} className={cx(styles.card, onHeaderClick && styles.interactive, className)} aria-labelledby={titleId} aria-busy={loading || undefined} {...rest}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titles}>
            <Heading id={titleId} className={styles.title}>
              {onHeaderClick ? (
                <button type="button" className={styles.cover} onClick={onHeaderClick}>
                  {title}
                </button>
              ) : (
                title
              )}
            </Heading>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {status && <span className={styles.status}>{status}</span>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        {(value !== undefined || indicators.length > 0) &&
          (loading ? (
            <Skeleton variant="rect" height={40} width="50%" />
          ) : (
            <div className={styles.kpiRow}>
              {value !== undefined && (
                <div className={styles.kpi}>
                  <span className={cx(styles.value, valueTone && styles[valueTone])}>{value}</span>
                  {trend && (
                    <span className={cx(styles.trend, good === null ? styles.flat : good ? styles.good : styles.bad)}>
                      <TrendIcon aria-hidden="true" />
                      <span className="eui-visually-hidden">{labels[trend.direction]}</span>
                    </span>
                  )}
                  {unit && <span className={styles.unit}>{unit}</span>}
                  {trend && (
                    <span className={styles.trendText}>
                      {trend.value}
                      {trend.label && <> {trend.label}</>}
                    </span>
                  )}
                </div>
              )}
              {indicators.length > 0 && (
                <dl className={styles.indicators}>
                  {indicators.slice(0, 3).map((ind) => (
                    <div key={ind.label} className={styles.indicator}>
                      <dt>{ind.label}</dt>
                      <dd className={cx(ind.tone && styles[ind.tone])}>{ind.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ))}
      </header>
      {children && <div className={styles.content}>{loading ? <Skeleton variant="rect" height={160} width="100%" /> : children}</div>}
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </article>
  );
});
