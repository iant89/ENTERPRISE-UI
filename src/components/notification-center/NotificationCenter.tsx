import { Button } from '../button';
import styles from './NotificationCenter.module.css';
export interface NotificationItem { id: string; title: string; description?: string; timestamp?: string; read: boolean }

/** Text and accessible names for NotificationCenter. Functions allow locale-specific word order and plural rules. */
export interface NotificationCenterMessages {
  title: string;
  unreadCount: (count: number) => string;
  loading: string;
  empty: string;
  unread: string;
  markRead: string;
  dismiss: string;
  markReadLabel: (title: string) => string;
  dismissLabel: (title: string) => string;
}

const defaultMessages: NotificationCenterMessages = {
  title: 'Notifications', unreadCount: (count) => `${count} unread`, loading: 'Loading notifications…',
  empty: 'No notifications.', unread: 'Unread', markRead: 'Mark as read', dismiss: 'Dismiss',
  markReadLabel: (title) => `Mark as read: ${title}`, dismissLabel: (title) => `Dismiss ${title}`,
};

export interface NotificationCenterProps {
  /** Application-controlled notifications, with unique IDs. */
  notifications: readonly NotificationItem[];
  /** Called with the ID of the notification the user marks as read. */
  onMarkRead?: (id: string) => void;
  /** Called with the ID of the notification the user dismisses. */
  onDismiss?: (id: string) => void;
  /** Shows a busy state while notifications load. */
  loading?: boolean;
  /** Error message shown in place of the list when notifications cannot be loaded. */
  error?: string;
  /** Overrides visible text and accessible names; omitted messages use English defaults. */
  messages?: Partial<NotificationCenterMessages>;
  /** Format timestamps for display. The original value remains the time element's dateTime. */
  formatTimestamp?: (timestamp: string) => string;
  /** Text direction. `auto` follows the document. */
  dir?: 'ltr' | 'rtl' | 'auto';
  /** BCP 47 language tag for the text, so screen readers pronounce it correctly. */
  lang?: string;
}
/** A controlled list of notifications; persistence and delivery belong to the host. */
export function NotificationCenter({ notifications, onMarkRead, onDismiss, loading, error, messages, formatTimestamp, dir, lang }: NotificationCenterProps) {
  const unread = notifications.filter((item) => !item.read).length;
  const text = { ...defaultMessages, ...messages };
  return <section aria-label={text.title} dir={dir} lang={lang} className={styles.root}><h2>{text.title}</h2><p>{text.unreadCount(unread)}</p>
    {loading && <p role="status">{text.loading}</p>}{error && <p role="alert">{error}</p>}
    {!loading && !error && !notifications.length && <p>{text.empty}</p>}
    <ul>{notifications.map((item) => <li key={item.id}><strong><bdi>{item.title}</bdi></strong> {!item.read && <span>{text.unread}</span>}{item.description && <p><bdi>{item.description}</bdi></p>}{item.timestamp && <time dateTime={item.timestamp}>{formatTimestamp ? formatTimestamp(item.timestamp) : item.timestamp}</time>}
      <div className={styles.actions}>{!item.read && onMarkRead && <Button size="sm" onClick={() => onMarkRead(item.id)} aria-label={text.markReadLabel(item.title)}>{text.markRead}</Button>}{onDismiss && <Button size="sm" onClick={() => onDismiss(item.id)} aria-label={text.dismissLabel(item.title)}>{text.dismiss}</Button>}</div>
    </li>)}</ul>
  </section>;
}
