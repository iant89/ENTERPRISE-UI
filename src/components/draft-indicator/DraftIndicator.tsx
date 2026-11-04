import { forwardRef, useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { AcceptIcon, HighPriorityIcon, UploadToCloudIcon, WriteNewIcon } from '../../icons';
import { cx } from '../../utilities/cx';
import { formatRelativeTime, useNow } from '../../hooks/useRelativeTime';
import styles from './DraftIndicator.module.css';

export type DraftStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

export interface DraftIndicatorLabels {
  unsaved: string;
  saving: string;
  saved: (relative: string | null) => string;
  error: string;
  retry: string;
}

export interface DraftIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Save state, e.g. from `useAutosave`. */
  status: DraftStatus;
  /** When the draft was last saved. */
  lastSaved?: Date | number | null;
  /** Adds a Retry button in the error state. */
  onRetry?: () => void;
  /** Locale for the relative time. */
  locale?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<DraftIndicatorLabels>;
}

const defaultLabels: DraftIndicatorLabels = {
  unsaved: 'Unsaved changes',
  saving: 'Saving…',
  saved: (relative) => (relative ? `Draft saved ${relative}` : 'All changes saved'),
  error: 'Changes could not be saved',
  retry: 'Retry',
};

/** Shows whether an edited object's draft is saving, saved or failed (Fiori draft handling). */
export const DraftIndicator = forwardRef<HTMLDivElement, DraftIndicatorProps>(function DraftIndicator(
  { status, lastSaved, onRetry, locale, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const now = useNow(15_000, status === 'saved' && !!lastSaved);
  const Icon = status === 'saving' ? UploadToCloudIcon : status === 'saved' ? AcceptIcon : status === 'error' ? HighPriorityIcon : WriteNewIcon;
  const text =
    status === 'saving' ? labels.saving : status === 'saved' ? labels.saved(lastSaved ? formatRelativeTime(lastSaved, now, locale) : null) : status === 'error' ? labels.error : status === 'unsaved' ? labels.unsaved : '';
  return (
    <div ref={ref} className={cx(styles.root, styles[status], className)} {...rest}>
      {/* Only the outcome is announced, not every keystroke-driven "Saving…". */}
      <span className={styles.text} role="status" aria-live="polite">
        {status !== 'idle' && <Icon aria-hidden="true" />}
        <span aria-hidden={status === 'saving' || status === 'unsaved' ? true : undefined}>{text}</span>
      </span>
      {status === 'error' && onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          {labels.retry}
        </button>
      )}
    </div>
  );
});

export interface UseAutosaveOptions<V> {
  /** Persists the draft; reject to show the error state. */
  save: (value: V) => Promise<unknown>;
  /** Quiet time after the last change before saving. @default 1500 */
  delay?: number;
  /** Turns autosaving off (e.g. in display mode). @default true */
  enabled?: boolean;
}

export interface UseAutosaveResult {
  status: DraftStatus;
  lastSaved: Date | null;
  error: unknown;
  /** Saves immediately, e.g. before navigating away. */
  flush: () => Promise<void>;
}

/**
 * Debounced draft saving: saves `value` after `delay` ms without changes, never runs two saves at
 * once, and saves again if the value changed while a save was running.
 */
export function useAutosave<V>(value: V, { save, delay = 1500, enabled = true }: UseAutosaveOptions<V>): UseAutosaveResult {
  const [status, setStatus] = useState<DraftStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<unknown>(null);
  const latest = useRef(value);
  const savedKey = useRef(JSON.stringify(value));
  const running = useRef<Promise<void> | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;
  latest.current = value;
  const key = JSON.stringify(value);

  const flush = useCallback(async (): Promise<void> => {
    if (running.current) await running.current;
    const snapshot = latest.current;
    const snapshotKey = JSON.stringify(snapshot);
    if (snapshotKey === savedKey.current) return;
    setStatus('saving');
    const run = (async () => {
      try {
        await saveRef.current(snapshot);
        savedKey.current = snapshotKey;
        setLastSaved(new Date());
        setError(null);
        setStatus(JSON.stringify(latest.current) === snapshotKey ? 'saved' : 'unsaved');
      } catch (e) {
        setError(e);
        setStatus('error');
      }
    })();
    running.current = run;
    await run;
    running.current = null;
  }, []);

  useEffect(() => {
    if (!enabled || key === savedKey.current) return;
    setStatus((s) => (s === 'saving' ? s : 'unsaved'));
    const timer = setTimeout(() => void flush(), delay);
    return () => clearTimeout(timer);
  }, [key, enabled, delay, flush]);

  return { status, lastSaved, error, flush };
}
