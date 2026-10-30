import type { ReactNode } from 'react';
import { Button } from '../../components/button';
import styles from './ActivityFeed.module.css';

export interface ActivityEvent {
  id: string;
  type: string;
  actor: string;
  timestamp: string;
  description: ReactNode;
  /** Optional related-event group, supplied by the application. */
  group?: string;
}
export interface ActivityFeedProps {
  /** Events to display, newest first. */
  events: ActivityEvent[];
  /** Shows a busy state while events load. */
  loading?: boolean;
  /** Application-provided error and optional retry action. */
  error?: ReactNode;
  /** Whether more events can be loaded. Shows the load-more button. */
  hasMore?: boolean;
  /** Called when the user asks for more events. */
  onLoadMore?: () => void;
  /** Event types offered in the type filter. */
  types?: { value: string; label: string }[];
  /** Selected event type. Providing it makes the filter controlled. */
  typeFilter?: string;
  /** Called with the event type the user selects. */
  onTypeFilterChange?: (value: string) => void;
  /** BCP 47 locale used to format numbers, dates and times. Defaults to the browser locale. */
  locale?: string;
  /** IANA time zone used to display and interpret times, for example `Europe/Berlin`. */
  timeZone?: string;
}

/** Displays activity supplied by the host, newest first. Filtering and pagination are host-managed. */
export function ActivityFeed({ events, loading, error, hasMore, onLoadMore, types, typeFilter = '', onTypeFilterChange, locale, timeZone }: ActivityFeedProps) {
  const sorted = [...events].sort((a, b) => (Date.parse(b.timestamp) || 0) - (Date.parse(a.timestamp) || 0));
  // Group adjacent related events only, preserving overall chronology.
  const groups: ActivityEvent[][] = [];
  for (const event of sorted) {
    const previous = groups[groups.length - 1];
    if (event.group && previous?.[0].group === event.group) previous.push(event);
    else groups.push([event]);
  }
  const renderEvent = (event: ActivityEvent) => {
    const parsed = new Date(event.timestamp);
    const formatted = Number.isNaN(parsed.getTime()) ? event.timestamp : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(parsed);
    return <><div><strong>{event.actor}</strong> · <time dateTime={event.timestamp}>{formatted}</time></div><div>{event.description}</div></>;
  };
  return <section aria-label="Activity" className={styles.root}>
    <h2>Activity</h2>
    {types && onTypeFilterChange && <label>Event type <select value={typeFilter} onChange={(event) => onTypeFilterChange(event.target.value)}>
      <option value="">All</option>{types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
    </select></label>}
    {error && <div role="alert">{error}</div>}
    {sorted.length === 0 && !loading && !error && <p>No activity.</p>}
    {groups.length > 0 && <ol className={styles.events}>{groups.map((group) => group[0].group
      ? <li key={group[0].id}><strong className={styles.group}>{group[0].group}</strong><ol>{group.map((event) => <li key={event.id}>{renderEvent(event)}</li>)}</ol></li>
      : <li key={group[0].id}>{renderEvent(group[0])}</li>)}</ol>}
    {loading && <p role="status">Loading activity…</p>}
    {hasMore && onLoadMore && <Button disabled={loading} onClick={onLoadMore}>Load more activity</Button>}
  </section>;
}
