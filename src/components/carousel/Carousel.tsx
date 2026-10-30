import { useId, useState, type ReactNode } from 'react';
import { Button } from '../button';
import styles from './Carousel.module.css';

export interface CarouselItem { id: string; content: ReactNode; label?: string }
export interface CarouselProps {
  /** Items with unique stable ids. */
  items: CarouselItem[];
  /** Accessible name for the carousel. */
  'aria-label': string;
  /** Controlled zero-based page. */
  page?: number;
  /** Uncontrolled starting page. @default 0 */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Localized navigation and page text. */
  labels?: { previous: string; next: string; page: (page: number, total: number) => string };
}
/** A manually controlled, one-item-per-page carousel. It never advances automatically. */
export function Carousel({ items, 'aria-label': label, page, defaultPage = 0, onPageChange, labels = { previous: 'Previous', next: 'Next', page: (current, total) => `${current} of ${total}` } }: CarouselProps) {
  const [internal, setInternal] = useState(defaultPage);
  const id = useId();
  const index = Math.max(0, Math.min(items.length - 1, Math.floor(Number.isFinite(page ?? internal) ? (page ?? internal) : 0)));
  const move = (next: number) => { if (page === undefined) setInternal(next); onPageChange?.(next); };
  const item = items[index];
  return <section aria-label={label} aria-roledescription="carousel" className={styles.carousel}>
    {item && <div id={id} role="group" aria-roledescription="slide" aria-label={item.label ?? labels.page(index + 1, items.length)} className={styles.slide} key={item.id}>{item.content}</div>}
    {items.length > 0 && <div className={styles.controls}>
      <Button size="sm" onClick={() => move(index - 1)} disabled={index === 0} aria-controls={id}>{labels.previous}</Button>
      <span role="status" aria-live="polite">{labels.page(index + 1, items.length)}</span>
      <Button size="sm" onClick={() => move(index + 1)} disabled={index === items.length - 1} aria-controls={id}>{labels.next}</Button>
    </div>}
  </section>;
}
