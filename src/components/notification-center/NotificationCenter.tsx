import { Button } from '../button';
import styles from './NotificationCenter.module.css';
export interface NotificationItem { id: string; title: string; description?: string; timestamp?: string; read: boolean }
export interface NotificationCenterProps {
  /** Application-controlled notifications, with unique IDs. */
  notifications: readonly NotificationItem[];
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  loading?: boolean;
  error?: string;
}
/** A controlled list of notifications; persistence and delivery belong to the host. */
export function NotificationCenter({ notifications, onMarkRead, onDismiss, loading, error }: NotificationCenterProps) {
  const unread = notifications.filter((item) => !item.read).length;
  return <section aria-label="Notifications" className={styles.root}><h2>Notifications</h2><p>{unread} unread</p>
    {loading && <p role="status">Loading notifications…</p>}{error && <p role="alert">{error}</p>}
    {!loading && !error && !notifications.length && <p>No notifications.</p>}
    <ul>{notifications.map((item) => <li key={item.id}><strong>{item.title}</strong> {!item.read && <span>Unread</span>}{item.description && <p>{item.description}</p>}{item.timestamp && <time dateTime={item.timestamp}>{item.timestamp}</time>}
      <div className={styles.actions}>{!item.read && onMarkRead && <Button size="sm" onClick={() => onMarkRead(item.id)} aria-label={`Mark as read: ${item.title}`}>Mark as read</Button>}{onDismiss && <Button size="sm" onClick={() => onDismiss(item.id)} aria-label={`Dismiss ${item.title}`}>Dismiss</Button>}</div>
    </li>)}</ul>
  </section>;
}
