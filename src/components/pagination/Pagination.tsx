import { forwardRef, type HTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Select } from '../select';
import styles from './Pagination.module.css';

/** Override visible and accessible pagination text; format numeric values with the host locale. */
export interface PaginationMessages {
  summary: (from: number, to: number, total: number) => string;
  rowsPerPage: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  pageLabel: (page: number) => string;
  pageNumber: (page: number) => string;
  compactPage: (page: number, pageCount: number) => string;
}
const defaultMessages: PaginationMessages = {
  summary: (from, to, total) => `${from}–${to} of ${total}`, rowsPerPage: 'Rows per page',
  firstPage: 'First page', previousPage: 'Previous page', nextPage: 'Next page', lastPage: 'Last page',
  pageLabel: (page) => `Page ${page}`, pageNumber: String, compactPage: (page, total) => `Page ${page} of ${total}`,
};

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Override built-in labels and number formatting. */
  messages?: Partial<PaginationMessages>;
  /** Current page, 1-based. */
  page: number;
  /** Called with the new zero-based page index. */
  onPageChange: (page: number) => void;
  /** Total number of items (used with `pageSize`). */
  totalItems: number;
  /** @default 10 */
  /** Number of items per page. */
  pageSize?: number;
  /** Offer a page-size selector with these options. */
  pageSizeOptions?: number[];
  /** Called with the new page size when the user chooses one. */
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
    showSummary = true, showFirstLast = true, messages, className, dir, lang, 'aria-label': ariaLabel = 'Pagination', ...rest
  },
  ref,
) {
  const text = { ...defaultMessages, ...messages };
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const from = totalItems === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, totalItems);
  const go = (p: number) => onPageChange(Math.min(Math.max(1, p), pageCount));

  return (
    <nav ref={ref} dir={dir} lang={lang} aria-label={ariaLabel} className={cx(styles.root, className)} {...rest}>
      {showSummary && (
        <span className={styles.summary}>
          {text.summary(from, to, totalItems)}
        </span>
      )}
      <div className={styles.controls}>
        {pageSizeOptions && onPageSizeChange && (
          <div className={styles.pageSize}>
            <span aria-hidden="true">{text.rowsPerPage}</span>
            <Select
              aria-label={text.rowsPerPage}
              dir={dir === 'ltr' || dir === 'rtl' || dir === 'auto' ? dir : undefined}
              lang={lang}
              size="sm"
              value={String(pageSize)}
              options={pageSizeOptions.map((n) => ({ value: String(n), label: text.pageNumber(n) }))}
              onChange={(v) => v && onPageSizeChange(Number(v))}
            />
          </div>
        )}
        <ul className={styles.list}>
          {showFirstLast && (
            <li>
              <IconButton icon={<ChevronsLeft />} label={text.firstPage} size="sm" disabled={current === 1} onClick={() => go(1)} />
            </li>
          )}
          <li>
            <IconButton icon={<ChevronLeft />} label={text.previousPage} size="sm" disabled={current === 1} onClick={() => go(current - 1)} />
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
                  aria-label={text.pageLabel(p)}
                  aria-current={p === current ? 'page' : undefined}
                  onClick={() => go(p)}
                >
                  {text.pageNumber(p)}
                </Button>
              ),
            )}
          </li>
          <li className={cx(styles.compact, styles.mobileOnly)} aria-live="polite">
            {text.compactPage(current, pageCount)}
          </li>
          <li>
            <IconButton icon={<ChevronRight />} label={text.nextPage} size="sm" disabled={current === pageCount} onClick={() => go(current + 1)} />
          </li>
          {showFirstLast && (
            <li>
              <IconButton icon={<ChevronsRight />} label={text.lastPage} size="sm" disabled={current === pageCount} onClick={() => go(pageCount)} />
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
});
