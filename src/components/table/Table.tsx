import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
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
  /** Column definitions. */
  columns: TableColumn<T>[];
  /** Rows to display. */
  data: T[];
  /** Returns a stable id for a row. Defaults to `row.id`, then the index. */
  getRowId?: (row: T, index: number) => string;
  /** Visible caption / accessible name. */
  caption?: ReactNode;
  /** Visually hide the caption. @default true */
  hideCaption?: boolean;
  /** Accessible name, used when there is no visible label. */
  'aria-label'?: string;
  /** Controlled sort. */
  sort?: SortState | null;
  /** Sort applied initially when sorting is uncontrolled. */
  defaultSort?: SortState | null;
  /** Called with the new sort, or `null` when sorting is cleared. */
  onSortChange?: (sort: SortState | null) => void;
  /** Data is already sorted (server-side); only render the indicator. @default false */
  manualSorting?: boolean;
  /** @default 'none' */
  /** Whether no items, one item or several items can be selected. */
  selectionMode?: SelectionMode;
  /** Accessible label for the select-all checkbox. @default 'Select all rows' */
  selectAllLabel?: string;
  /** Accessible selection-column heading. @default 'Selection' */
  selectionHeaderLabel?: string;
  /** Format the accessible selection control name from the row label. */
  selectRowLabel?: (rowLabel: string) => string;
  /** IDs of the selected items. Providing it makes the selection controlled. */
  selectedIds?: string[];
  /** IDs of the items selected initially when the selection is uncontrolled. */
  defaultSelectedIds?: string[];
  /** Called with the new selection when the user changes it. */
  onSelectionChange?: (ids: string[]) => void;
  /** Makes rows activatable (click / Enter) and shows a navigation chevron. */
  onRowClick?: (row: T) => void;
  /** Accessible label for a row's selection checkbox. */
  getRowLabel?: (row: T) => string;
  /** Status color shown as a bar at the start of the row. */
  getRowHighlight?: (row: T) => Tone | undefined;
  /** Show skeleton rows. @default false */
  loading?: boolean;
  /** @default 5 */
  /** Number of skeleton rows shown while `loading` is true. */
  loadingRowCount?: number;
  /** Shown when `data` is empty. */
  emptyState?: ReactNode;
  /** Row height. Inherits the theme density when omitted. */
  density?: TableDensity;
  /** @default false */
  /** Shades alternate rows to make wide tables easier to scan. */
  striped?: boolean;
  /** Keep the header visible while scrolling (set `maxHeight`). @default true */
  stickyHeader?: boolean;
  /** Maximum height before the content scrolls. */
  maxHeight?: CSSProperties['maxHeight'];
  /** Opt in to fixed-height row windowing. Use stable getRowId and non-wrapping cells. */
  virtualization?: { rowHeight: number; height: number; overscan?: number };
  /** `stack` turns rows into label/value cards on phones; `scroll` scrolls horizontally. @default 'scroll' */
  responsive?: 'scroll' | 'stack';
  /** Remove the outer border (when inside a Card). @default false */
  borderless?: boolean;
  /** Additional CSS class names for the root element. */
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
  selectionMode = 'none', selectAllLabel = 'Select all rows', selectionHeaderLabel = 'Selection', selectRowLabel = (label) => `Select ${label}`, selectedIds, defaultSelectedIds = [], onSelectionChange,
  onRowClick, getRowLabel, getRowHighlight, loading = false, loadingRowCount = 5, emptyState,
  density, striped = false, stickyHeader = true, maxHeight, responsive = 'scroll', borderless = false, className, virtualization,
}: TableProps<T>) {
  const [sortState, setSort] = useControllableState<SortState | null>(sort, defaultSort, onSortChange);
  const [selected, setSelected] = useControllableState<string[]>(selectedIds, defaultSelectedIds, onSelectionChange);
  const tableId = useId(undefined, 'table');
  const rows = useMemo(() => (manualSorting ? data : sortRows(data, columns, sortState)), [data, columns, sortState, manualSorting]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [focusedRow, setFocusedRow] = useState<string | null>(null);
  const pendingFocus = useRef<{ index: number; last: boolean } | null>(null);
  const virtual = virtualization && responsive !== 'stack' && Number.isFinite(virtualization.height) && virtualization.height > 0 && Number.isFinite(virtualization.rowHeight) && virtualization.rowHeight >= 32 ? virtualization : undefined;
  const virtualHeight = virtual?.height ?? 0;
  const rowHeight = virtual?.rowHeight ?? 1;
  const overscan = Number.isFinite(virtual?.overscan) ? Math.max(0, Math.floor(virtual?.overscan ?? 0)) : 3;
  const position = virtual ? Math.min(scrollTop, Math.max(0, rows.length * rowHeight - virtualHeight)) : 0;
  const start = virtual ? Math.max(0, Math.floor(position / rowHeight) - overscan - 1) : 0;
  const end = virtual ? Math.min(rows.length, Math.ceil((position + virtualHeight) / rowHeight) + overscan) : rows.length;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const rowIds = rows.map((row, i) => getRowId(row, i));
  const focusedIndex = focusedRow === null ? -1 : rowIds.indexOf(focusedRow);
  const displayedIndices = virtual ? Array.from(new Set([...Array.from({ length: Math.max(0, end - start) }, (_, index) => index + start), ...(focusedIndex >= 0 ? [focusedIndex] : [])])).sort((a, b) => a - b) : rows.map((_, index) => index);
  useEffect(() => {
    if (pendingFocus.current === null) return;
    const pending = pendingFocus.current;
    const row = wrapperRef.current?.querySelector<HTMLElement>(`[data-virtual-index="${pending.index}"]`);
    if (row) {
      pendingFocus.current = null;
      const controls = Array.from(row.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hidden && !element.closest('[hidden], [inert]'));
      (pending.last ? controls[controls.length - 1] ?? row : row).focus();
    }
  });
  const moveVirtualRow = (event: KeyboardEvent<HTMLTableRowElement>, index: number) => {
    if (!virtual || event.target !== event.currentTarget || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    const next = Math.max(0, Math.min(rows.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
    event.preventDefault();
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    pendingFocus.current = { index: next, last: false };
    setFocusedRow(rowIds[next]);
    const headerHeight = wrapper.querySelector('thead')?.getBoundingClientRect().height ?? 0;
    const top = headerHeight + next * rowHeight;
    if (top < wrapper.scrollTop + headerHeight) wrapper.scrollTop = Math.max(0, top - headerHeight);
    else if (top + rowHeight > wrapper.scrollTop + virtual.height) wrapper.scrollTop = top + rowHeight - virtual.height;
    setScrollTop(wrapper.scrollTop);
  };
  const handleVirtualTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!virtual || event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    const row = target.closest<HTMLElement>('[data-virtual-index]');
    if (!row || !event.currentTarget.contains(row)) return;
    const index = Number(row.dataset.virtualIndex);
    const controls = Array.from(row.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hidden && !element.closest('[hidden], [inert]'));
    const atBoundary = event.shiftKey ? target === row : target === (controls[controls.length - 1] ?? row);
    const next = index + (event.shiftKey ? -1 : 1);
    if (!atBoundary || next < 0 || next >= rows.length || displayedIndices.includes(next)) return;
    event.preventDefault();
    pendingFocus.current = { index: next, last: event.shiftKey };
    setFocusedRow(rowIds[next]);
    const headerHeight = event.currentTarget.querySelector('thead')?.getBoundingClientRect().height ?? 0;
    const top = headerHeight + next * rowHeight;
    event.currentTarget.scrollTop = event.shiftKey ? Math.max(0, top - headerHeight) : Math.max(0, top + rowHeight - virtual.height);
    setScrollTop(event.currentTarget.scrollTop);
  };
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
      ref={wrapperRef}
      onScroll={(event) => { if (virtual) setScrollTop(event.currentTarget.scrollTop); }}
      onKeyDownCapture={handleVirtualTab}
      onFocusCapture={(event) => { if (virtual && !(event.target as HTMLElement).closest('[data-virtual-index]')) setFocusedRow(null); }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusedRow(null); }}
      className={cx(
        styles.wrapper,
        stickyHeader && styles.sticky,
        responsive === 'stack' ? styles.stack : styles.scroll,
        density && styles[density],
        striped && styles.striped,
        borderless && styles.borderless,
        className,
        virtual && styles.virtual,
      )}
      style={{ maxHeight: virtual?.height ?? maxHeight, height: virtual?.height }}
      tabIndex={0}
      role={maxHeight || virtual ? 'region' : undefined}
      aria-labelledby={(maxHeight || virtual) && caption ? `${tableId}-caption` : undefined}
      aria-label={(maxHeight || virtual) && !caption ? ariaLabel : undefined}
    >
      <table className={styles.table} aria-label={caption ? undefined : ariaLabel} aria-busy={loading || undefined} aria-rowcount={loading ? -1 : virtual ? rows.length + 1 + (hasFooter ? 1 : 0) : undefined}>
        {caption && (
          <caption id={`${tableId}-caption`} className={cx(styles.caption, hideCaption && 'eui-visually-hidden')}>
            {caption}
          </caption>
        )}
        <thead className={styles.thead}>
          <tr aria-rowindex={virtual ? 1 : undefined}>
            {hasSelection && (
              <th scope="col" className={cx(styles.th, styles.selectCell)}>
                {selectionMode === 'multiple' ? (
                  <Checkbox aria-label={selectAllLabel} checked={allSelected} indeterminate={someSelected} onChange={toggleAll} disabled={loading || rows.length === 0} />
                ) : (
                  <span className="eui-visually-hidden">{selectionHeaderLabel}</span>
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
            displayedIndices.map((rowIndex, position) => {
              const row = rows[rowIndex];
              const previous = position ? displayedIndices[position - 1] + 1 : 0;
              const gap = rowIndex - previous;
              const id = rowIds[rowIndex];
              const isSelected = selectedSet.has(id);
              const highlight = getRowHighlight?.(row);
              const rowLabel = getRowLabel?.(row) ?? `row ${rowIndex + 1}`;
              return <Fragment key={id}>
                {virtual && gap > 0 && <tr aria-hidden="true"><td colSpan={colCount} style={{ height: gap * rowHeight, padding: 0, border: 0 }} /></tr>}
                <tr
                  data-virtual-index={virtual ? rowIndex : undefined}
                  aria-rowindex={virtual ? rowIndex + 2 : undefined}
                  onFocus={() => { if (virtual) setFocusedRow(id); }}
                  style={virtual ? { height: rowHeight } : undefined}
                  className={cx(styles.row, onRowClick && styles.clickable)}
                  aria-selected={hasSelection ? isSelected : undefined}
                  tabIndex={onRowClick || virtual ? 0 : undefined}
                  onClick={onRowClick ? (event) => {
                    if ((event.target as HTMLElement).closest('button, a, input, [role="checkbox"]')) return;
                    onRowClick(row);
                  } : undefined}
                  onKeyDown={onRowClick || hasSelection || virtual ? (event) => { moveVirtualRow(event, rowIndex); if (!event.defaultPrevented) onRowKeyDown(event, row); } : undefined}
                >
                  {hasSelection && (
                    <td className={cx(styles.td, styles.selectCell, highlight && styles.highlight, highlight && styles[`hl-${highlight}`])}>
                      <div className={virtual ? styles.virtualContent : undefined} style={virtual ? { height: rowHeight } : undefined}>{selectionMode === 'multiple' ? (
                        <Checkbox aria-label={selectRowLabel(rowLabel)} checked={isSelected} onChange={() => toggleRow(id)} />
                      ) : (
                        <input
                          type="radio"
                          name={`${tableId}-selection`}
                          aria-label={selectRowLabel(rowLabel)}
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          style={{ accentColor: 'var(--eui-color-primary)', width: 16, height: 16 }}
                        />
                      )}</div>
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
                        {virtual ? <div className={styles.virtualContent} style={{ height: rowHeight }}>{content}</div> : content}
                      </Cell>
                    );
                  })}
                  {onRowClick && (
                    <td className={cx(styles.td, styles.navCell)} aria-hidden="true">
                      {virtual ? <div className={styles.virtualContent} style={{ height: rowHeight }}><ChevronRight /></div> : <ChevronRight />}
                    </td>
                  )}
                </tr>
              </Fragment>;
            })}
          {!loading && virtual && displayedIndices.length > 0 && displayedIndices[displayedIndices.length - 1] < rows.length - 1 && <tr aria-hidden="true"><td colSpan={colCount} style={{ height: (rows.length - 1 - displayedIndices[displayedIndices.length - 1]) * rowHeight, padding: 0, border: 0 }} /></tr>}
        </tbody>
        {hasFooter && !loading && rows.length > 0 && (
          <tfoot className={styles.tfoot}>
            <tr aria-rowindex={virtual ? rows.length + 2 : undefined}>
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
