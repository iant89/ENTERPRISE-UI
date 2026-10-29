import { useMemo, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { Checkbox } from '../checkbox';
import { Skeleton } from '../skeleton';
import styles from './Table.module.css';

export type SortDirection = 'ascending' | 'descending';

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface TableColumn<T> {
  /** Unique column id. */
  id: string;
  /** Header content. */
  header: ReactNode;
  /** Plain-text header used for stacked mobile labels and menus. Defaults to `header` when it is a string. */
  headerText?: string;
  /** Property name or function returning the cell's raw value (used for sorting, filtering and default rendering). */
  accessor?: keyof T | ((row: T) => unknown);
  /** Custom cell renderer. */
  cell?: (row: T, rowIndex: number) => ReactNode;
  /** @default false */
  sortable?: boolean;
  /** Custom comparator for ascending order. */
  sortFn?: (a: T, b: T) => number;
  /** @default 'start' */
  align?: 'start' | 'center' | 'end';
  width?: CSSProperties['width'];
  minWidth?: CSSProperties['minWidth'];
  /** Render the cell as a row header (`<th scope="row">`). Use for the identifying column. */
  rowHeader?: boolean;
  /** Footer content (e.g. totals). */
  footer?: ReactNode;
  /** Allow cell text to wrap in `scroll` mode (cells stay on one line by default). @default false */
  wrap?: boolean;
}

export type TableDensity = 'cozy' | 'compact' | 'condensed';
export type SelectionMode = 'none' | 'single' | 'multiple';

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** Returns a stable id for a row. Defaults to `row.id`, then the index. */
  getRowId?: (row: T, index: number) => string;
  /** Visible caption / accessible name. */
  caption?: ReactNode;
  /** Visually hide the caption. @default true */
  hideCaption?: boolean;
  'aria-label'?: string;
  /** Controlled sort. */
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** Data is already sorted (server-side); only render the indicator. @default false */
  manualSorting?: boolean;
  /** @default 'none' */
  selectionMode?: SelectionMode;
  /** Accessible label for the select-all checkbox. @default 'Select all rows' */
  selectAllLabel?: string;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Makes rows activatable (click / Enter) and shows a navigation chevron. */
  onRowClick?: (row: T) => void;
  /** Accessible label for a row's selection checkbox. */
  getRowLabel?: (row: T) => string;
  /** Status colour shown as a bar at the start of the row. */
  getRowHighlight?: (row: T) => Tone | undefined;
  /** Show skeleton rows. @default false */
  loading?: boolean;
  /** @default 5 */
  loadingRowCount?: number;
  /** Shown when `data` is empty. */
  emptyState?: ReactNode;
  /** Row height. Inherits the theme density when omitted. */
  density?: TableDensity;
  /** @default false */
  striped?: boolean;
  /** Keep the header visible while scrolling (set `maxHeight`). @default true */
  stickyHeader?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
  /** `stack` turns rows into label/value cards on phones; `scroll` scrolls horizontally. @default 'scroll' */
  responsive?: 'scroll' | 'stack';
  /** Remove the outer border (when inside a Card). @default false */
  borderless?: boolean;
  className?: string;
}

const getValue = <T,>(row: T, column: TableColumn<T>): unknown => {
  if (!column.accessor) return undefined;
  return typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor];
};

export const compareValues = (a: unknown, b: unknown): number => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

/** Sorts rows with a column's `sortFn` or accessor. Pure helper used by Table and DataGrid. */
export function sortRows<T>(data: T[], columns: TableColumn<T>[], sort: SortState | null | undefined): T[] {
  if (!sort) return data;
  const column = columns.find((c) => c.id === sort.columnId);
  if (!column) return data;
  const factor = sort.direction === 'ascending' ? 1 : -1;
  const cmp = column.sortFn ?? ((a: T, b: T) => compareValues(getValue(a, column), getValue(b, column)));
  return [...data].sort((a, b) => cmp(a, b) * factor);
}

export const getColumnText = <T,>(column: TableColumn<T>) => column.headerText ?? (typeof column.header === 'string' ? column.header : column.id);

const defaultRowId = (row: unknown, index: number) => {
  const id = (row as { id?: unknown })?.id;
  return id != null ? String(id) : String(index);
};

/**
 * Semantic data table with sorting, row selection, loading and empty
 * states, row highlights, configurable density and responsive modes.
 */
export function Table<T>({
  columns, data, getRowId = defaultRowId, caption, hideCaption = true, 'aria-label': ariaLabel,
  sort, defaultSort = null, onSortChange, manualSorting = false,
  selectionMode = 'none', selectAllLabel = 'Select all rows', selectedIds, defaultSelectedIds = [], onSelectionChange,
  onRowClick, getRowLabel, getRowHighlight, loading = false, loadingRowCount = 5, emptyState,
  density, striped = false, stickyHeader = true, maxHeight, responsive = 'scroll', borderless = false, className,
}: TableProps<T>) {
  const [sortState, setSort] = useControllableState<SortState | null>(sort, defaultSort, onSortChange);
  const [selected, setSelected] = useControllableState<string[]>(selectedIds, defaultSelectedIds, onSelectionChange);
  const tableId = useId(undefined, 'table');
  const rows = useMemo(() => (manualSorting ? data : sortRows(data, columns, sortState)), [data, columns, sortState, manualSorting]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const rowIds = rows.map((row, i) => getRowId(row, i));
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && rowIds.some((id) => selectedSet.has(id));
  const hasSelection = selectionMode !== 'none';
  const colCount = columns.length + (hasSelection ? 1 : 0) + (onRowClick ? 1 : 0);

  const toggleSort = (column: TableColumn<T>) => {
    if (!sortState || sortState.columnId !== column.id) setSort({ columnId: column.id, direction: 'ascending' });
    else if (sortState.direction === 'ascending') setSort({ columnId: column.id, direction: 'descending' });
    else setSort(null);
  };

  const toggleRow = (id: string) => {
    if (selectionMode === 'single') setSelected(selectedSet.has(id) ? [] : [id]);
    else setSelected(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const toggleAll = () => {
    if (allSelected) setSelected(selected.filter((id) => !rowIds.includes(id)));
    else setSelected(Array.from(new Set([...selected, ...rowIds])));
  };

  const onRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter') onRowClick?.(row);
    if (event.key === ' ' && hasSelection) {
      event.preventDefault();
      toggleRow(getRowId(row, rows.indexOf(row)));
    }
  };

  const alignClass = (align?: TableColumn<T>['align']) => (align === 'center' ? styles.alignCenter : align === 'end' ? styles.alignEnd : undefined);
  const hasFooter = columns.some((c) => c.footer != null);

  return (
    <div
      className={cx(
        styles.wrapper,
        stickyHeader && styles.sticky,
        responsive === 'stack' ? styles.stack : styles.scroll,
        density && styles[density],
        striped && styles.striped,
        borderless && styles.borderless,
        className,
      )}
      style={{ maxHeight }}
      tabIndex={maxHeight ? 0 : undefined}
      role={maxHeight ? 'region' : undefined}
      aria-labelledby={maxHeight && caption ? `${tableId}-caption` : undefined}
      aria-label={maxHeight && !caption ? ariaLabel : undefined}
    >
      <table className={styles.table} aria-label={caption ? undefined : ariaLabel} aria-busy={loading || undefined} aria-rowcount={loading ? -1 : undefined}>
        {caption && (
          <caption id={`${tableId}-caption`} className={cx(styles.caption, hideCaption && 'eui-visually-hidden')}>
            {caption}
          </caption>
        )}
        <thead className={styles.thead}>
          <tr>
            {hasSelection && (
              <th scope="col" className={cx(styles.th, styles.selectCell)}>
                {selectionMode === 'multiple' ? (
                  <Checkbox aria-label={selectAllLabel} checked={allSelected} indeterminate={someSelected} onChange={toggleAll} disabled={loading || rows.length === 0} />
                ) : (
                  <span className="eui-visually-hidden">Selection</span>
                )}
              </th>
            )}
            {columns.map((column) => {
              const sorted = sortState?.columnId === column.id ? sortState.direction : undefined;
              const SortIcon = sorted === 'ascending' ? ArrowUp : sorted === 'descending' ? ArrowDown : ArrowUpDown;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={column.sortable ? sorted ?? 'none' : undefined}
                  className={cx(styles.th, alignClass(column.align))}
                  style={{ width: column.width, minWidth: column.minWidth }}
                >
                  {column.sortable ? (
                    <button type="button" className={styles.sortButton} onClick={() => toggleSort(column)}>
                      <span>{column.header}</span>
                      <span className={cx(styles.sortIcon, !sorted && styles.sortIdle)} aria-hidden="true">
                        <SortIcon />
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
            {onRowClick && (
              <th scope="col" className={cx(styles.th, styles.navCell)}>
                <span className="eui-visually-hidden">Open</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {loading &&
            Array.from({ length: loadingRowCount }, (_, i) => (
              <tr key={`loading-${i}`} className={styles.row}>
                {Array.from({ length: colCount }, (_, c) => (
                  <td key={c} className={styles.td}>
                    <Skeleton width={c === 0 && hasSelection ? 18 : `${60 + ((i * 7 + c * 13) % 35)}%`} />
                  </td>
                ))}
              </tr>
            ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={colCount} className={styles.empty}>
                {emptyState ?? 'No data'}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row, rowIndex) => {
              const id = rowIds[rowIndex];
              const isSelected = selectedSet.has(id);
              const highlight = getRowHighlight?.(row);
              const rowLabel = getRowLabel?.(row) ?? `row ${rowIndex + 1}`;
              return (
                <tr
                  key={id}
                  className={cx(styles.row, onRowClick && styles.clickable)}
                  aria-selected={hasSelection ? isSelected : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? (event) => {
                    if ((event.target as HTMLElement).closest('button, a, input, [role="checkbox"]')) return;
                    onRowClick(row);
                  } : undefined}
                  onKeyDown={onRowClick || hasSelection ? (event) => onRowKeyDown(event, row) : undefined}
                >
                  {hasSelection && (
                    <td className={cx(styles.td, styles.selectCell, highlight && styles.highlight, highlight && styles[`hl-${highlight}`])}>
                      {selectionMode === 'multiple' ? (
                        <Checkbox aria-label={`Select ${rowLabel}`} checked={isSelected} onChange={() => toggleRow(id)} />
                      ) : (
                        <input
                          type="radio"
                          name={`${tableId}-selection`}
                          aria-label={`Select ${rowLabel}`}
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          style={{ accentColor: 'var(--eui-color-primary)', width: 16, height: 16 }}
                        />
                      )}
                    </td>
                  )}
                  {columns.map((column, c) => {
                    const content = column.cell ? column.cell(row, rowIndex) : (getValue(row, column) as ReactNode);
                    const Cell = column.rowHeader ? 'th' : 'td';
                    return (
                      <Cell
                        key={column.id}
                        scope={column.rowHeader ? 'row' : undefined}
                        data-label={getColumnText(column)}
                        className={cx(
                          styles.td,
                          column.wrap && styles.wrap,
                          alignClass(column.align),
                          !hasSelection && c === 0 && highlight && styles.highlight,
                          !hasSelection && c === 0 && highlight && styles[`hl-${highlight}`],
                        )}
                        style={column.rowHeader ? { fontWeight: 'inherit', textAlign: column.align === 'end' ? 'end' : 'start' } : undefined}
                      >
                        {content}
                      </Cell>
                    );
                  })}
                  {onRowClick && (
                    <td className={cx(styles.td, styles.navCell)} aria-hidden="true">
                      <ChevronRight />
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
        {hasFooter && !loading && rows.length > 0 && (
          <tfoot className={styles.tfoot}>
            <tr>
              {hasSelection && <td className={styles.td} />}
              {columns.map((column) => (
                <td key={column.id} className={cx(styles.td, alignClass(column.align))} data-label={getColumnText(column)}>
                  {column.footer}
                </td>
              ))}
              {onRowClick && <td className={styles.td} />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
