import type { ReactNode } from 'react';
import { Button } from '../../components/button';
import styles from './AuditTrail.module.css';

export interface AuditChange { field: string; before: string | null; after: string | null }
export interface AuditRecord {
  id: string;
  actor: string;
  timestamp: string;
  action: string;
  source: string;
  changes: AuditChange[];
}
export interface AuditFilters { actor: string; action: string; start: string; end: string }
export interface AuditTrailProps {
  /** Records must come from an authoritative audit source, not client UI events. */
  records: AuditRecord[];
  /** Current filter values. */
  filters: AuditFilters;
  /** Called with the new filter values when the user changes them. */
  onFiltersChange: (filters: AuditFilters) => void;
  /** Shows a busy state while entries load. */
  loading?: boolean;
  /** Application-provided error and optional retry action. */
  error?: ReactNode;
  /** Whether more entries can be loaded. Shows the load-more button. */
  hasMore?: boolean;
  /** Called when the user asks for more entries. */
  onLoadMore?: () => void;
  /** BCP 47 locale used to format numbers, dates and times. Defaults to the browser locale. */
  locale?: string;
  /** IANA time zone used to display and interpret times, for example `Europe/Berlin`. */
  timeZone?: string;
  /** Override the default comparison table, for example to render DiffViewer. */
  renderChanges?: (record: AuditRecord) => ReactNode;
}

/** Presents authoritative audit records. Filtering and pagination are performed by the host. */
export function AuditTrail({ records, filters, onFiltersChange, loading, error, hasMore, onLoadMore, locale, timeZone, renderChanges }: AuditTrailProps) {
  return <section aria-label="Audit trail" className={styles.root}>
    <h2>Audit trail</h2>
    <p>Authoritative audit records</p>
    <div className={styles.filters}>
      <label>Actor<input value={filters.actor} onChange={(event) => onFiltersChange({ ...filters, actor: event.target.value })} /></label>
      <label>Action<input value={filters.action} onChange={(event) => onFiltersChange({ ...filters, action: event.target.value })} /></label>
      <label>From<input type="date" value={filters.start} onChange={(event) => onFiltersChange({ ...filters, start: event.target.value })} /></label>
      <label>To<input type="date" value={filters.end} onChange={(event) => onFiltersChange({ ...filters, end: event.target.value })} /></label>
    </div>
    {error && <div role="alert">{error}</div>}
    {!records.length && !loading && !error && <p>No audit records.</p>}
    {records.length > 0 && <ol className={styles.records}>{records.map((record) => {
      const parsed = new Date(record.timestamp);
      const formatted = Number.isNaN(parsed.getTime()) ? record.timestamp : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(parsed);
      return <li key={record.id}>
        <div><strong>{record.action}</strong> by {record.actor} · <time dateTime={record.timestamp}>{formatted}</time> · {record.source}</div>
        {renderChanges ? renderChanges(record) : record.changes.length > 0 && <div className={styles.tableWrapper}><table><caption>Changed fields for {record.action}</caption>
          <thead><tr><th scope="col">Field</th><th scope="col">Before</th><th scope="col">After</th></tr></thead>
          <tbody>{record.changes.map((change, index) => <tr key={`${change.field}-${index}`}><th scope="row">{change.field}</th><td>{change.before ?? '—'}</td><td>{change.after ?? '—'}</td></tr>)}</tbody>
        </table></div>}
      </li>;
    })}</ol>}
    {loading && <p role="status">Loading audit records…</p>}
    {hasMore && onLoadMore && <Button disabled={loading} onClick={onLoadMore}>Load more audit records</Button>}
  </section>;
}
