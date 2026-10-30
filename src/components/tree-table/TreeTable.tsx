import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import type { TableColumn, TableDensity } from '../table';
import tableStyles from '../table/Table.module.css';
import styles from './TreeTable.module.css';

export interface TreeTableProps<T> {
  /** Column definitions. */
  columns: TableColumn<T>[];
  /** Top-level rows. */
  data: T[];
  /** Returns a stable, unique ID for a row. */
  getRowId: (row: T) => string;
  /** Returns child rows. @default row.children */
  getChildren?: (row: T) => T[] | undefined;
  /** Accessible name, used when there is no visible label. */
  'aria-label': string;
  /** IDs of the expanded rows. Providing it makes the expanded state controlled. */
  expandedIds?: string[];
  /** IDs of the rows expanded initially when the expanded state is uncontrolled. */
  defaultExpandedIds?: string[];
  /** Called with the IDs of the expanded rows when the user expands or collapses a row. */
  onExpandedChange?: (ids: string[]) => void;
  /** Called when a row is activated with Enter or a click. */
  onRowClick?: (row: T) => void;
  /** Row density. */
  density?: TableDensity;
  /** Maximum height before the content scrolls. */
  maxHeight?: CSSProperties['maxHeight'];
  /** Additional CSS class names for the root element. */
  className?: string;
}

interface FlatRow<T> {
  row: T;
  id: string;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  posInSet: number;
  setSize: number;
}

const defaultChildren = <T,>(row: T) => (row as { children?: T[] }).children;

/**
 * Hierarchical table (`role="treegrid"`). Rows are focusable: ↑/↓ move
 * between rows, → expands, ← collapses or moves to the parent, Home/End
 * jump to the first/last row, Enter activates.
 */
export function TreeTable<T>({
  columns, data, getRowId, getChildren = defaultChildren, 'aria-label': ariaLabel, expandedIds, defaultExpandedIds = [],
  onExpandedChange, onRowClick, density, maxHeight, className,
}: TreeTableProps<T>) {
  const [expanded, setExpanded] = useControllableState(expandedIds, defaultExpandedIds, onExpandedChange);
  const expandedSet = useMemo(() => new Set(expanded), [expanded]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  const rows = useMemo(() => {
    const out: FlatRow<T>[] = [];
    const walk = (list: T[], level: number, parentId: string | null) => {
      list.forEach((row, i) => {
        const id = getRowId(row);
        const children = getChildren(row) ?? [];
        out.push({ row, id, level, parentId, hasChildren: children.length > 0, posInSet: i + 1, setSize: list.length });
        if (children.length && expandedSet.has(id)) walk(children, level + 1, id);
      });
    };
    walk(data, 1, null);
    return out;
  }, [data, expandedSet, getRowId, getChildren]);

  const tabStop = focusedId && rows.some((r) => r.id === focusedId) ? focusedId : rows[0]?.id;

  const focusRow = (id: string) => {
    setFocusedId(id);
    bodyRef.current?.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(id)}"]`)?.focus();
  };
  const setOpen = (id: string, open: boolean) => {
    if (open === expandedSet.has(id)) return;
    setExpanded(open ? [...expanded, id] : expanded.filter((e) => e !== id));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, index: number) => {
    if (event.target !== event.currentTarget) return;
    const current = rows[index];
    const open = expandedSet.has(current.id);
    const actions: Record<string, () => void> = {
      ArrowDown: () => index < rows.length - 1 && focusRow(rows[index + 1].id),
      ArrowUp: () => index > 0 && focusRow(rows[index - 1].id),
      ArrowRight: () => current.hasChildren && (open ? focusRow(rows[index + 1].id) : setOpen(current.id, true)),
      ArrowLeft: () => (current.hasChildren && open ? setOpen(current.id, false) : current.parentId && focusRow(current.parentId)),
      Home: () => focusRow(rows[0].id),
      End: () => focusRow(rows[rows.length - 1].id),
      Enter: () => onRowClick?.(current.row),
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  const align = (a?: string) => (a === 'end' ? tableStyles.alignEnd : a === 'center' ? tableStyles.alignCenter : undefined);

  return (
    <div className={cx(tableStyles.wrapper, tableStyles.sticky, density && tableStyles[density], className)} style={{ maxHeight }}>
      <table role="treegrid" aria-label={ariaLabel} className={tableStyles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} scope="col" className={cx(tableStyles.th, align(column.align))} style={{ width: column.width, minWidth: column.minWidth }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={bodyRef}>
          {rows.map((flat, index) => (
            <tr
              key={flat.id}
              data-row-id={flat.id}
              aria-level={flat.level}
              aria-posinset={flat.posInSet}
              aria-setsize={flat.setSize}
              aria-expanded={flat.hasChildren ? expandedSet.has(flat.id) : undefined}
              tabIndex={tabStop === flat.id ? 0 : -1}
              className={cx(tableStyles.row, styles.row, onRowClick && tableStyles.clickable)}
              onFocus={(event) => event.target === event.currentTarget && setFocusedId(flat.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('button, a, input')) return;
                focusRow(flat.id);
                onRowClick?.(flat.row);
              }}
            >
              {columns.map((column, c) => {
                const raw = typeof column.accessor === 'function' ? column.accessor(flat.row) : column.accessor ? flat.row[column.accessor] : undefined;
                const content = column.cell ? column.cell(flat.row, index) : (raw as ReactNode);
                return (
                  <td key={column.id} role="gridcell" className={cx(tableStyles.td, align(column.align))}>
                    {c === 0 ? (
                      <span className={styles.first} style={{ '--_level': flat.level } as CSSProperties}>
                        {flat.hasChildren ? (
                          <button
                            type="button"
                            tabIndex={-1}
                            className={cx(styles.toggle, expandedSet.has(flat.id) && styles.open)}
                            aria-label={expandedSet.has(flat.id) ? 'Collapse' : 'Expand'}
                            onClick={() => {
                              setOpen(flat.id, !expandedSet.has(flat.id));
                              focusRow(flat.id);
                            }}
                          >
                            <ChevronRight aria-hidden="true" />
                          </button>
                        ) : (
                          <span className={styles.spacer} />
                        )}
                        {content}
                      </span>
                    ) : (
                      content
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
