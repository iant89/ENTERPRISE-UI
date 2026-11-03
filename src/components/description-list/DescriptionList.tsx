import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './DescriptionList.module.css';

export interface DescriptionListItem {
  /** Stable key. Defaults to the index. */
  id?: string;
  /** The term (field name), e.g. "Supplier". */
  term: ReactNode;
  /** The value. Empty values show `emptyText`. */
  description?: ReactNode;
  /** Columns this item spans on wide screens, or `full` for the whole row. @default 1 */
  span?: number | 'full';
  /** Help or unit shown after the term. */
  hint?: ReactNode;
}

export interface DescriptionListProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  /** Term and value pairs, in reading order. */
  items: DescriptionListItem[];
  /** Columns on wide screens; phones always use one column. @default 2 */
  columns?: 1 | 2 | 3 | 4;
  /** `stacked` puts the term above the value; `inline` puts it beside the value. @default 'stacked' */
  layout?: 'stacked' | 'inline';
  /** Draws dividers between rows, as in a read-only form. @default false */
  bordered?: boolean;
  /** Text shown for missing values. @default '–' */
  emptyText?: ReactNode;
}

/** Read-only label and value pairs for business object facts (Fiori form in display mode). */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { items, columns = 2, layout = 'stacked', bordered = false, emptyText = '–', className, style, ...rest },
  ref,
) {
  return (
    <dl ref={ref} className={cx(styles.list, styles[layout], bordered && styles.bordered, className)} style={{ '--eui-dl-columns': columns, ...style } as CSSProperties} {...rest}>
      {items.map((item, i) => {
        const empty = item.description === undefined || item.description === null || item.description === '';
        const span = item.span === 'full' ? columns : Math.min(item.span ?? 1, columns);
        return (
          <div key={item.id ?? i} className={styles.item} style={{ '--eui-dl-span': span } as CSSProperties}>
            <dt className={styles.term}>
              {item.term}
              {item.hint && <span className={styles.hint}> {item.hint}</span>}
            </dt>
            <dd className={cx(styles.description, empty && styles.empty)}>{empty ? emptyText : item.description}</dd>
          </div>
        );
      })}
    </dl>
  );
});
