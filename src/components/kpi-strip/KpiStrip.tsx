import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import type { MetricTrend } from '../metric-card';
import { Skeleton } from '../skeleton';
import { Sparkline } from '../sparkline';
import styles from './KpiStrip.module.css';

export interface KpiStripItem {
  /** Stable id. */
  id: string;
  /** Name of the indicator, such as "Open orders". */
  label: string;
  /** The figure, already formatted. */
  value: ReactNode;
  /** Unit or scale, such as `EUR`, `K` or `%`. */
  unit?: ReactNode;
  /** Change against a previous period. Direction is announced as text. */
  trend?: MetricTrend;
  /** Status color for the value, for example when it misses its target. Say why in `target` or `hint`. */
  tone?: Exclude<Tone, 'neutral'>;
  /** Target or comparison text, such as "Target 95%". */
  target?: ReactNode;
  /** Short note under the value. */
  hint?: ReactNode;
  /** Recent values for a small trend line, oldest first. */
  sparkline?: (number | null)[];
  /** Makes the item a drill-down button. */
  onClick?: () => void;
}

export interface KpiStripProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Indicators, in priority order. Keep to about six. */
  items: KpiStripItem[];
  /** Accessible name of the strip, such as "Warehouse KPIs". */
  label: string;
  /** Shows skeletons in place of the values. @default false */
  loading?: boolean;
  /** `divided`: one bordered bar with dividers. `cards`: separate tiles. @default 'divided' */
  variant?: 'divided' | 'cards';
}

const TrendIcon = ({ direction }: { direction: MetricTrend['direction'] }) =>
  direction === 'up' ? <ArrowUpRight aria-hidden="true" /> : direction === 'down' ? <ArrowDownRight aria-hidden="true" /> : <ArrowRight aria-hidden="true" />;

/**
 * A compact row of headline indicators for the top of a dashboard or object
 * page. Wraps onto more rows on narrow screens. Each indicator is a list item
 * whose label, value, unit and trend are read in order.
 */
export const KpiStrip = forwardRef<HTMLElement, KpiStripProps>(function KpiStrip({ items, label, loading = false, variant = 'divided', className, ...rest }, ref) {
  return (
    <section ref={ref} aria-label={label} aria-busy={loading || undefined} className={cx(styles.strip, styles[variant], className)} {...rest}>
      <ul className={styles.list}>
        {items.map((item) => {
          const good = item.trend && item.trend.direction !== 'flat' ? (item.trend.direction === 'up') === (item.trend.upIsGood ?? true) : null;
          const body = (
            <>
              <span className={styles.label}>{item.label}</span>
              {loading ? (
                <Skeleton variant="rect" height={28} width="70%" />
              ) : (
                <span className={styles.valueRow}>
                  <span className={cx(styles.value, item.tone && styles[item.tone])}>
                    {item.value}
                    {item.unit && <span className={styles.unit}>{item.unit}</span>}
                  </span>
                  {item.sparkline && item.sparkline.length > 1 && <Sparkline className={styles.sparkline} values={item.sparkline} width={56} height={20} tone={item.tone} />}
                </span>
              )}
              {!loading && item.trend && (
                <span className={cx(styles.trend, good === null ? styles.flat : good ? styles.good : styles.bad)}>
                  <TrendIcon direction={item.trend.direction} />
                  <span>
                    <span className="eui-visually-hidden">{item.trend.direction === 'up' ? 'Up' : item.trend.direction === 'down' ? 'Down' : 'Unchanged'} </span>
                    {item.trend.value}
                  </span>
                  {item.trend.label && <span className={styles.muted}>{item.trend.label}</span>}
                </span>
              )}
              {!loading && item.target && <span className={styles.muted}>{item.target}</span>}
              {!loading && item.hint && <span className={styles.muted}>{item.hint}</span>}
            </>
          );
          return (
            <li key={item.id} className={styles.item}>
              {item.onClick ? (
                <button type="button" className={styles.button} onClick={item.onClick}>
                  {body}
                </button>
              ) : (
                <div className={styles.content}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
});
