import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import styles from './StatusHistory.module.css';

/** The status of one period: a semantic tone, or `disabled` (the subject was switched off). */
export type StatusHistoryStatus = Tone | 'disabled';

export interface StatusHistorySegment {
  /** Stable key, for example the period's start time. Defaults to the position. */
  id?: string | number;
  /** The period's status (usually the worst one seen in it); `null` when nothing was recorded. */
  status: StatusHistoryStatus | null;
  /**
   * The period and its status as text, for example "Nov 17 14:00–14:15: Degraded (worst of
   * 3 checks)". It is the segment's accessible name and tooltip, so it must carry the
   * status in words: color is only a supplement.
   */
  label: string;
}

export interface StatusHistoryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The periods, oldest first. They share the width equally. */
  segments: StatusHistorySegment[];
  /** Accessible name of the strip. @default 'Status over time, oldest first' */
  'aria-label'?: string;
  /** Height of the strip. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A strip of periods (for example the last 24 hours in 15-minute slots), each coloured
 * by its status: uptime and health history on status pages and dashboards. Every
 * segment names its period and status in text, and periods without data are drawn
 * dashed rather than coloured. Put a text summary (availability, number of changes)
 * next to it.
 */
export const StatusHistory = forwardRef<HTMLDivElement, StatusHistoryProps>(function StatusHistory(
  { segments, 'aria-label': ariaLabel = 'Status over time, oldest first', size = 'md', className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="list"
      aria-label={ariaLabel}
      className={cx(styles.strip, size !== 'md' && styles[size], className)}
      {...rest}
    >
      {segments.map((s, i) => (
        <span
          key={s.id ?? i}
          role="listitem"
          aria-label={s.label}
          title={s.label}
          className={cx(styles.segment, s.status ? styles[s.status] : styles.none)}
          data-status={s.status ?? 'none'}
        />
      ))}
    </div>
  );
});
