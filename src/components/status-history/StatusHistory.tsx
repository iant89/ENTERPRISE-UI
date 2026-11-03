import { forwardRef, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { toneColor } from '../chart-core/palette';
import styles from './StatusHistory.module.css';

export interface StatusHistoryItem {
  id: string;
  /** Status of the period or run. */
  status: Tone;
  /** Period or run name, such as "Oct 29" or "Run #1042". */
  label: string;
  /** Details shown when the block is focused, hovered or tapped, such as "Down 42 min". */
  description?: ReactNode;
}

export interface StatusHistoryProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect' | 'title'> {
  /** Periods or runs, oldest first. */
  items: StatusHistoryItem[];
  /** Accessible name, such as "API uptime, last 30 days". */
  label: string;
  /** Visible heading text above the strip. */
  title?: ReactNode;
  /** Headline text next to the title, such as "99.2% uptime". */
  summary?: ReactNode;
  /** Name of each status, used in the legend and read with each block. */
  statusLabels?: Partial<Record<Tone, string>>;
  /** Shows a legend with the number of blocks per status. @default true */
  showLegend?: boolean;
  /** Called when the user activates a block (Enter, Space or click). */
  onSelect?: (item: StatusHistoryItem) => void;
}

const defaultStatusLabels: Record<Tone, string> = {
  success: 'Operational',
  warning: 'Degraded',
  error: 'Outage',
  information: 'Maintenance',
  neutral: 'No data',
};
const order: Tone[] = ['success', 'warning', 'error', 'information', 'neutral'];

/**
 * A row of status blocks for uptime, SLA periods or batch runs (a tracker).
 * The strip is one tab stop: arrow keys move between blocks, and the focused,
 * hovered or tapped block's details are shown as text under the strip.
 */
export const StatusHistory = forwardRef<HTMLElement, StatusHistoryProps>(function StatusHistory(
  { items, label, title, summary, statusLabels, showLegend = true, onSelect, className, ...rest },
  ref,
) {
  const names = { ...defaultStatusLabels, ...statusLabels };
  const [focusIndex, setFocusIndex] = useState(Math.max(0, items.length - 1));
  const [active, setActive] = useState<number | null>(null);
  const blocks = useRef<(HTMLElement | null)[]>([]);
  const current = Math.min(focusIndex, items.length - 1);
  const shown = active != null ? items[active] : null;
  const counts = order.map((tone) => [tone, items.filter((i) => i.status === tone).length] as const).filter(([, n]) => n > 0);

  const move = (index: number) => {
    const next = Math.max(0, Math.min(items.length - 1, index));
    setFocusIndex(next);
    setActive(next);
    blocks.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const keys: Record<string, number> = {
      ArrowRight: rtl ? index - 1 : index + 1,
      ArrowLeft: rtl ? index + 1 : index - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in keys) {
      event.preventDefault();
      move(keys[event.key]);
    }
  };

  return (
    <section ref={ref} aria-label={label} className={cx(styles.root, className)} {...rest}>
      {(title || summary) && (
        <div className={styles.header}>
          {title && <span className={styles.title}>{title}</span>}
          {summary && <span className={styles.summary}>{summary}</span>}
        </div>
      )}
      <ol className={styles.track} onMouseLeave={() => setActive(null)}>
        {items.map((item, index) => {
          const Block = onSelect ? 'button' : 'span';
          return (
            <li key={item.id} className={styles.cell}>
              <Block
                ref={(el: HTMLElement | null) => { blocks.current[index] = el; }}
                type={onSelect ? 'button' : undefined}
                className={cx(styles.block, styles[item.status], active === index && styles.active, onSelect && styles.clickable)}
                style={{ background: toneColor(item.status) }}
                tabIndex={index === current ? 0 : -1}
                onKeyDown={(event: KeyboardEvent<HTMLElement>) => onKeyDown(event, index)}
                onFocus={() => { setFocusIndex(index); setActive(index); }}
                onBlur={() => setActive(null)}
                onMouseEnter={() => setActive(index)}
                onClick={() => { setFocusIndex(index); setActive(index); onSelect?.(item); }}
              >
                <span className="eui-visually-hidden">
                  {item.label}: {names[item.status]}
                  {item.description != null && <>. {item.description}</>}
                </span>
              </Block>
            </li>
          );
        })}
      </ol>
      {items.length > 0 && (
        <div className={styles.axis} aria-hidden="true">
          <span>{items[0].label}</span>
          <span>{items[items.length - 1].label}</span>
        </div>
      )}
      <p className={styles.details} aria-hidden="true">
        {shown ? (
          <>
            <strong>{shown.label}</strong> · {names[shown.status]}
            {shown.description != null && <> · {shown.description}</>}
          </>
        ) : (
          ' '
        )}
      </p>
      {showLegend && counts.length > 0 && (
        <ul className={styles.legend}>
          {counts.map(([tone, n]) => (
            <li key={tone}>
              <span className={styles.swatch} style={{ background: toneColor(tone) }} aria-hidden="true" />
              {names[tone]} <span className={styles.count}>{n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});
