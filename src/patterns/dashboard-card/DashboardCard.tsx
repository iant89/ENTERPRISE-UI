import { forwardRef, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { AlertTriangle, Clock, Lock, RefreshCw } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useMergedRefs } from '../../utilities/refs';
import { useId } from '../../hooks/useId';
import { formatRelativeTime, useNow } from '../../hooks/useRelativeTime';
import { Button } from '../../components/button';
import { IconButton } from '../../components/icon-button';
import { Skeleton } from '../../components/skeleton';
import { ChartToolsContext } from '../../components/chart-core/ChartToolsContext';
import {
  ChartToolbar, defaultToolbarLabels, useChartToolsState, type ChartToolbarLabels, type ChartToolOptions, type ChartToolsStateProps,
} from '../../components/chart-container/chartTools';
import styles from './DashboardCard.module.css';

export type DashboardCardStatus = 'ready' | 'loading' | 'error' | 'empty' | 'forbidden';

export interface DashboardCardLabels extends ChartToolbarLabels {
  refresh: string;
  retry: string;
  loading: string;
  error: string;
  empty: string;
  forbidden: string;
  /** Freshness text; `relative` is e.g. "5 minutes ago". */
  updated: (relative: string) => string;
  /** Shown when the data is older than `staleAfter`. */
  stale: string;
}

export interface DashboardCardProps extends ChartToolsStateProps, Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Card title. */
  title: ReactNode;
  /** Secondary line, e.g. the period or unit. */
  subtitle?: ReactNode;
  /** Heading level of the title. @default 3 */
  headingLevel?: 2 | 3 | 4;
  /** Data state. `ready` shows the content; the others show a standard placeholder. @default 'ready' */
  status?: DashboardCardStatus;
  /** Error details shown in the `error` state. */
  error?: ReactNode;
  /** Adds a Retry button to the `error` state. */
  onRetry?: () => void;
  /** Content of the `empty` state. Defaults to a short message. */
  emptyContent?: ReactNode;
  /** Content of the `forbidden` state. Defaults to a short message. */
  forbiddenContent?: ReactNode;
  /** When the data was loaded; shown as relative time in the header. */
  lastUpdated?: Date | number;
  /** Age in milliseconds after which the data is flagged as out of date. */
  staleAfter?: number;
  /** Adds a refresh button to the header. */
  onRefresh?: () => void;
  /** Shows refresh progress while keeping the current content visible. @default false */
  refreshing?: boolean;
  /** Adds the chart toolbar (chart/table view, legend, download, full screen) for the charts inside. `true` shows every tool. */
  chartTools?: boolean | ChartToolOptions;
  /** Header actions, e.g. an overflow menu. */
  actions?: ReactNode;
  /** Footer content, e.g. a link to the full report. */
  footer?: ReactNode;
  /** Height of the loading placeholder and minimum body height. @default 200 */
  bodyHeight?: number;
  /** Locale for the relative time. */
  locale?: string;
  /** Card content, usually a chart or list. */
  children?: ReactNode;
  /** Overrides for the built-in strings. */
  labels?: Partial<DashboardCardLabels>;
}

const defaultLabels: DashboardCardLabels = {
  ...defaultToolbarLabels,
  refresh: 'Refresh',
  retry: 'Retry',
  loading: 'Loading',
  error: 'The data could not be loaded.',
  empty: 'No data for the current filters.',
  forbidden: 'You do not have access to this data.',
  updated: (relative) => `Updated ${relative}`,
  stale: 'Out of date',
};

/**
 * Frame for a dashboard widget: title, freshness, refresh, chart tools, and the standard
 * loading, error, empty and no-access states, so every card behaves the same way.
 */
export const DashboardCard = forwardRef<HTMLElement, DashboardCardProps>(function DashboardCard(
  {
    title, subtitle, headingLevel = 3, status = 'ready', error, onRetry, emptyContent, forbiddenContent, lastUpdated, staleAfter, onRefresh, refreshing = false,
    chartTools, actions, footer, bodyHeight = 200, locale, children, labels: labelOverrides,
    view, defaultView, onViewChange, showLegend, defaultShowLegend, onShowLegendChange, onDownload, onExportImage, downloadFileName,
    className, ...rest
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const rootRef = useRef<HTMLElement>(null);
  const merged = useMergedRefs(ref, rootRef);
  const titleId = useId(undefined, 'dashboard-card');
  const now = useNow(15_000, lastUpdated !== undefined);
  const tools = chartTools ? (chartTools === true ? {} : chartTools) : null;
  const state = useChartToolsState(
    { view, defaultView, onViewChange, showLegend, defaultShowLegend, onShowLegendChange, onDownload, onExportImage, downloadFileName },
    rootRef,
    typeof title === 'string' ? title : '',
  );
  const stale = lastUpdated !== undefined && staleAfter !== undefined && now - new Date(lastUpdated).getTime() > staleAfter;
  const Heading = `h${headingLevel}` as const;

  let body: ReactNode;
  if (status === 'loading') {
    body = (
      <div className={styles.placeholder}>
        <Skeleton variant="rect" height={bodyHeight} width="100%" />
        <span className="eui-visually-hidden">{labels.loading}</span>
      </div>
    );
  } else if (status === 'error') {
    body = (
      <div className={cx(styles.state, styles.error)} style={{ minHeight: bodyHeight }}>
        <AlertTriangle aria-hidden="true" className={styles.stateIcon} />
        <p className={styles.stateText}>{error ?? labels.error}</p>
        {onRetry && (
          <Button size="sm" variant="secondary" icon={<RefreshCw />} onClick={onRetry}>
            {labels.retry}
          </Button>
        )}
      </div>
    );
  } else if (status === 'empty') {
    body = (
      <div className={styles.state} style={{ minHeight: bodyHeight }}>
        {emptyContent ?? <p className={styles.stateText}>{labels.empty}</p>}
      </div>
    );
  } else if (status === 'forbidden') {
    body = (
      <div className={styles.state} style={{ minHeight: bodyHeight }}>
        <Lock aria-hidden="true" className={styles.stateIcon} />
        {forbiddenContent ?? <p className={styles.stateText}>{labels.forbidden}</p>}
      </div>
    );
  } else {
    body = children;
  }

  return (
    <article
      ref={merged}
      className={cx(styles.card, state.inPageFullscreen && styles.expanded, state.fullscreen && styles.fullscreen, className)}
      aria-labelledby={titleId}
      aria-busy={status === 'loading' || refreshing || undefined}
      {...rest}
    >
      <header className={styles.header}>
        <div className={styles.titles}>
          <Heading id={titleId} className={styles.title}>
            {title}
          </Heading>
          {(subtitle || lastUpdated !== undefined) && (
            <p className={styles.subtitle}>
              {subtitle}
              {subtitle && lastUpdated !== undefined && <span aria-hidden="true"> · </span>}
              {lastUpdated !== undefined && (
                <time dateTime={new Date(lastUpdated).toISOString()} title={new Date(lastUpdated).toLocaleString(locale)}>
                  {labels.updated(formatRelativeTime(lastUpdated, now, locale))}
                </time>
              )}
              {stale && (
                <span className={styles.stale}>
                  <Clock aria-hidden="true" />
                  {labels.stale}
                </span>
              )}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          {tools && status === 'ready' && <ChartToolbar state={state} tools={tools} labels={labels} />}
          {onRefresh && (
            <IconButton
              icon={<RefreshCw className={cx(refreshing && styles.spinning)} />}
              label={labels.refresh}
              size="sm"
              aria-busy={refreshing || undefined}
              disabled={status === 'loading'}
              onClick={onRefresh}
            />
          )}
          {actions}
        </div>
      </header>
      <div className={cx(styles.body, refreshing && status === 'ready' && styles.refreshing)} style={{ minHeight: status === 'ready' ? undefined : bodyHeight }}>
        {tools ? <ChartToolsContext.Provider value={state.context}>{body}</ChartToolsContext.Provider> : body}
      </div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
      {/* Announces failures that happen after the card first rendered (e.g. a background refresh). */}
      <span className="eui-visually-hidden" aria-live="polite">
        {status === 'error' ? (typeof error === 'string' ? error : labels.error) : ''}
      </span>
    </article>
  );
});
