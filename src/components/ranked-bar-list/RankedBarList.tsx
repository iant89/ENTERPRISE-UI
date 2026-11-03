import { forwardRef, useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { formatNumber, seriesColor, toneColor } from '../chart-core/palette';
import { Button } from '../button';
import styles from './RankedBarList.module.css';

export interface RankedBarItem {
  id: string;
  /** Name shown on the bar, such as a supplier or product. */
  label: string;
  /** Value that sets the rank and the bar length. Negative values draw no bar. */
  value: number;
  /** Secondary text after the label, such as a code or region. */
  meta?: ReactNode;
  /** Status color for this bar. Use only for states (over budget), not categories. */
  tone?: Tone;
}

export interface RankedBarListLabels {
  showAll: (total: number) => string;
  showFewer: string;
  share: (percent: string) => string;
  empty: string;
}

export interface RankedBarListProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: RankedBarItem[];
  /** Accessible name, such as "Spend by supplier". */
  label: string;
  /** Formats the value text. Defaults to the locale's number format. */
  formatValue?: (value: number) => string;
  /** `desc` ranks largest first, `asc` smallest first, `none` keeps the given order. @default 'desc' */
  sort?: 'desc' | 'asc' | 'none';
  /** Rows shown before "Show all". `0` shows all. @default 5 */
  limit?: number;
  /** Value of a full-length bar. Defaults to the largest value. */
  max?: number;
  /** Shows each item's share of the total after its value. @default false */
  showShare?: boolean;
  /** Shows the rank number before each label. @default false */
  showRank?: boolean;
  /** Makes rows buttons, for drill-down or cross-filtering. */
  onSelect?: (item: RankedBarItem) => void;
  /** Highlights the selected row (with `onSelect`). */
  selectedId?: string | null;
  /** Overrides for the built-in strings. */
  labels?: Partial<RankedBarListLabels>;
}

const defaultLabels: RankedBarListLabels = {
  showAll: (total) => `Show all ${total}`,
  showFewer: 'Show fewer',
  share: (percent) => `${percent} of total`,
  empty: 'No data.',
};

/**
 * A ranked list of labelled values with proportional bars: top suppliers,
 * error codes, cost centers. Reads as a plain ordered list; bars are
 * decorative because every value is printed as text.
 */
export const RankedBarList = forwardRef<HTMLElement, RankedBarListProps>(function RankedBarList(
  { items, label, formatValue = formatNumber, sort = 'desc', limit = 5, max, showShare = false, showRank = false, onSelect, selectedId, labels: overrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...overrides };
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const sorted = sort === 'none' ? items : [...items].sort((a, b) => (sort === 'desc' ? b.value - a.value : a.value - b.value));
  const scale = max ?? Math.max(0, ...items.map((i) => i.value));
  const total = items.reduce((sum, i) => sum + Math.max(0, i.value), 0);
  const collapsible = limit > 0 && sorted.length > limit;
  const shown = collapsible && !expanded ? sorted.slice(0, limit) : sorted;

  return (
    <section ref={ref} aria-label={label} className={cx(styles.root, className)} {...rest}>
      {items.length === 0 ? (
        <p className={styles.empty}>{labels.empty}</p>
      ) : (
        <ol id={listId} className={styles.list}>
          {shown.map((item, index) => {
            const width = scale > 0 ? Math.max(0, Math.min(1, item.value / scale)) * 100 : 0;
            const share = showShare && total > 0 ? labels.share(new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 }).format(Math.max(0, item.value) / total)) : null;
            const body = (
              <>
                <span className={styles.bar} style={{ inlineSize: `${width}%`, background: item.tone ? toneColor(item.tone) : seriesColor(0) }} aria-hidden="true" />
                <span className={styles.text}>
                  {showRank && <span className={styles.rank}>{index + 1}.</span>}
                  <span className={styles.label}>{item.label}</span>
                  {item.meta && <span className={styles.meta}>{item.meta}</span>}
                </span>
                <span className={styles.value}>
                  {formatValue(item.value)}
                  {share && <span className={styles.share}>{share}</span>}
                </span>
              </>
            );
            return (
              <li key={item.id} className={cx(styles.item, selectedId === item.id && styles.selected)}>
                {onSelect ? (
                  <button type="button" className={styles.row} aria-pressed={selectedId === item.id} onClick={() => onSelect(item)}>
                    {body}
                  </button>
                ) : (
                  <div className={styles.row}>{body}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {collapsible && (
        <Button variant="tertiary" size="sm" className={styles.more} aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((e) => !e)}>
          {expanded ? labels.showFewer : labels.showAll(sorted.length)}
        </Button>
      )}
    </section>
  );
});
