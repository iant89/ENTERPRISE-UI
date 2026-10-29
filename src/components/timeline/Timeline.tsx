import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import styles from './Timeline.module.css';

export interface TimelineItem {
  id: string;
  title: ReactNode;
  /** Display time. Pass a Date to render a `<time>` element. */
  timestamp?: ReactNode | Date;
  description?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  /** Arbitrary content below the description (e.g. a comment Card). */
  content?: ReactNode;
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
  /** Locale for Date timestamps. */
  locale?: string;
}

/** Chronological list of events, e.g. an approval history or object changelog. */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline({ items, locale, className, ...rest }, ref) {
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <ol ref={ref} className={cx(styles.timeline, className)} {...rest}>
      {items.map((item) => (
        <li key={item.id} className={cx(styles.item, item.tone && styles[item.tone])}>
          <span className={styles.marker} aria-hidden="true">
            {item.icon ?? <span className={styles.dot} />}
          </span>
          <div className={styles.body}>
            <div className={styles.header}>
              <span className={styles.title}>{item.title}</span>
              {item.timestamp != null &&
                (item.timestamp instanceof Date ? (
                  <time className={styles.time} dateTime={item.timestamp.toISOString()}>
                    {fmt.format(item.timestamp)}
                  </time>
                ) : (
                  <span className={styles.time}>{item.timestamp}</span>
                ))}
            </div>
            {item.description && <div className={styles.description}>{item.description}</div>}
            {item.content && <div className={styles.content}>{item.content}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
});
