import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { IconProvider } from '../../icons';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { formatRelativeTime, useNow } from '../../hooks/useRelativeTime';
import { IconButton } from '../icon-button';
import { Select } from '../select';
import styles from './RefreshControl.module.css';

export interface RefreshControlLabels {
  refresh: string;
  autoRefresh: string;
  off: string;
  /** Option text for an interval in milliseconds. */
  every: (ms: number) => string;
  /** Freshness text; `relative` is e.g. "5 minutes ago". */
  updated: (relative: string) => string;
  /** Announced after a manual refresh finishes. */
  refreshed: string;
}

export interface RefreshControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Reloads the data. Return a promise to show progress until it settles. */
  onRefresh: () => void | Promise<unknown>;
  /** Shows progress, e.g. when the application refreshes on its own. Promise-based refreshes set this automatically. */
  refreshing?: boolean;
  /** When the data was last loaded; shown as relative time. */
  lastUpdated?: Date | number;
  /** Auto-refresh interval in milliseconds, or `null` for off. Providing it makes the interval controlled. */
  interval?: number | null;
  /** Initial interval when uncontrolled. @default null */
  defaultInterval?: number | null;
  /** Called with the new interval. Persist it with the user's view settings. */
  onIntervalChange?: (interval: number | null) => void;
  /** Interval choices in milliseconds. Pass `[]` to hide the auto-refresh select. @default [30000, 60000, 300000, 900000] */
  intervals?: number[];
  /** Skips automatic refreshes while the browser tab is hidden and catches up when it returns. @default true */
  pauseWhenHidden?: boolean;
  /** Locale for the relative time. Defaults to the browser locale. */
  locale?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<RefreshControlLabels>;
}

const defaultLabels: RefreshControlLabels = {
  refresh: 'Refresh',
  autoRefresh: 'Auto-refresh',
  off: 'Auto-refresh off',
  every: (ms) => (ms < 60_000 ? `Refresh every ${ms / 1000} s` : `Refresh every ${ms / 60_000} min`),
  updated: (relative) => `Updated ${relative}`,
  refreshed: 'Data refreshed',
};

/** A refresh button, "Updated … ago" freshness text and an optional auto-refresh interval. */
export const RefreshControl = forwardRef<HTMLDivElement, RefreshControlProps>(function RefreshControl(
  { onRefresh, refreshing: refreshingProp, lastUpdated, interval: intervalProp, defaultInterval = null, onIntervalChange, intervals = [30_000, 60_000, 300_000, 900_000], pauseWhenHidden = true, locale, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const [interval, setInterval_] = useControllableState(intervalProp, defaultInterval, onIntervalChange);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const refreshing = refreshingProp ?? pending;
  const now = useNow(15_000, lastUpdated !== undefined);
  const busy = useRef(false);
  const lastRun = useRef(Date.now());
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const run = async (manual: boolean) => {
    if (busy.current) return;
    busy.current = true;
    lastRun.current = Date.now();
    try {
      const result = onRefreshRef.current();
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        setPending(true);
        await result;
      }
      // Only manual refreshes are announced, so live data does not flood screen readers.
      if (manual) setMessage(labels.refreshed);
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    if (!interval) return;
    const tick = () => {
      if (pauseWhenHidden && typeof document !== 'undefined' && document.hidden) return;
      void runRef.current(false);
    };
    const id = setInterval(tick, interval);
    const onVisible = () => {
      if (!document.hidden && Date.now() - lastRun.current >= interval) tick();
    };
    if (pauseWhenHidden) document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [interval, pauseWhenHidden]);

  return (
    <div ref={ref} className={cx(styles.root, className)} {...rest}>
      {lastUpdated !== undefined && (
        <time className={styles.updated} dateTime={new Date(lastUpdated).toISOString()} title={new Date(lastUpdated).toLocaleString(locale)}>
          {labels.updated(formatRelativeTime(lastUpdated, now, locale))}
        </time>
      )}
      <IconButton icon={IconProvider.getIcon('refresh', { className: cx(refreshing && styles.spinning) })} label={labels.refresh} size="sm" aria-busy={refreshing || undefined} onClick={() => void run(true)} />
      {intervals.length > 0 && (
        <Select
          size="sm"
          label={labels.autoRefresh}
          hideLabel
          className={styles.select}
          value={interval ? String(interval) : 'off'}
          onChange={(v) => setInterval_(v && v !== 'off' ? Number(v) : null)}
          options={[{ value: 'off', label: labels.off }, ...intervals.map((ms) => ({ value: String(ms), label: labels.every(ms) }))]}
        />
      )}
      <span className="eui-visually-hidden" aria-live="polite">
        {message}
      </span>
    </div>
  );
});
