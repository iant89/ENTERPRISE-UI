import { forwardRef, type HTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Select } from '../select';
import styles from './Pagination.module.css';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page, 1-based. */
  page: number;
  onPageChange: (page: number) => void;
  /** Total number of items (used with `pageSize`). */
  totalItems: number;
  /** @default 10 */
  pageSize?: number;
  /** Offer a page-size selector with these options. */
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  /** Pages shown on each side of the current page. @default 1 */
  siblingCount?: number;
  /** Show "1–10 of 240". @default true */
  showSummary?: boolean;
  /** Show first/last page buttons. @default true */
  showFirstLast?: boolean;
  /** @default 'Pagination' */
  'aria-label'?: string;
}

/** Returns page numbers and `'ellipsis'` markers for a pagination control. */
export function getPageRange(page: number, pageCount: number, siblingCount = 1): Array<number | 'ellipsis'> {
  const total = siblingCount * 2 + 5;
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const left = Math.max(page - siblingCount, 2);
  const right = Math.min(page + siblingCount, pageCount - 1);
  const showLeft = left > 3;
  const showRight = right < pageCount - 2;
  if (!showLeft) return [...Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1), 'ellipsis', pageCount];
  if (!showRight) return [1, 'ellipsis', ...Array.from({ length: 3 + siblingCount * 2 }, (_, i) => pageCount - (2 + siblingCount * 2) + i)];
  return [1, 'ellipsis', ...Array.from({ length: right - left + 1 }, (_, i) => left + i), 'ellipsis', pageCount];
}

/** Navigates between pages of a data set. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page, onPageChange, totalItems, pageSize = 10, pageSizeOptions, onPageSizeChange, siblingCount = 1,
    showSummary = true, showFirstLast = true, className, 'aria-label': ariaLabel = 'Pagination', ...rest
  },
  ref,
) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const from = totalItems === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, totalItems);
  const go = (p: number) => onPageChange(Math.min(Math.max(1, p), pageCount));

  return (
    <nav ref={ref} aria-label={ariaLabel} className={cx(styles.root, className)} {...rest}>
      {showSummary && (
        <span className={styles.summary}>
          {from}–{to} of {totalItems}
        </span>
      )}
      <div className={styles.controls}>
        {pageSizeOptions && onPageSizeChange && (
          <div className={styles.pageSize}>
            <span aria-hidden="true">Rows per page</span>
            <Select
              aria-label="Rows per page"
              size="sm"
              value={String(pageSize)}
              options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => v && onPageSizeChange(Number(v))}
            />
          </div>
        )}
        <ul className={styles.list}>
          {showFirstLast && (
            <li>
              <IconButton icon={<ChevronsLeft />} label="First page" size="sm" disabled={current === 1} onClick={() => go(1)} />
            </li>
          )}
          <li>
            <IconButton icon={<ChevronLeft />} label="Previous page" size="sm" disabled={current === 1} onClick={() => go(current - 1)} />
          </li>
          <li className={styles.pages}>
            {getPageRange(current, pageCount, siblingCount).map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`e-${i}`} className={styles.ellipsis} aria-hidden="true">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  size="sm"
                  variant="tertiary"
                  className={styles.page}
                  aria-label={`Page ${p}`}
                  aria-current={p === current ? 'page' : undefined}
                  onClick={() => go(p)}
                >
                  {p}
                </Button>
              ),
            )}
          </li>
          <li className={cx(styles.compact, styles.mobileOnly)} aria-live="polite">
            Page {current} of {pageCount}
          </li>
          <li>
            <IconButton icon={<ChevronRight />} label="Next page" size="sm" disabled={current === pageCount} onClick={() => go(current + 1)} />
          </li>
          {showFirstLast && (
            <li>
              <IconButton icon={<ChevronsRight />} label="Last page" size="sm" disabled={current === pageCount} onClick={() => go(pageCount)} />
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
});
