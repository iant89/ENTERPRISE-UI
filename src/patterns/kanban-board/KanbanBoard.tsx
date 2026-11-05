import { useEffect, useRef, useState, type DragEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './KanbanBoard.module.css';
import verticalGripSvg from '../../assets/icons/vertical-grip.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

export interface KanbanColumn {
  /** Unique column id, referenced by `KanbanItem.columnId`. */
  id: string;
  /** Column heading, e.g. "In review". */
  title: string;
  /** Work-in-progress limit. Exceeding it is allowed but flagged. */
  limit?: number;
  /** Supplementary header content, e.g. a total value. */
  meta?: ReactNode;
}

export interface KanbanItem {
  /** Unique item id. */
  id: string;
  /** Column the item is in. */
  columnId: string;
}

export interface KanbanMove<T extends KanbanItem> {
  item: T;
  fromColumnId: string;
  toColumnId: string;
  /** Position in the target column (0-based). */
  index: number;
}

export interface KanbanBoardLabels {
  /** Accessible name of each card's move handle. */
  handle: (item: string) => string;
  /** Count in the column header. */
  count: (count: number, limit?: number) => string;
  overLimit: string;
  empty: string;
  /** Usage hint read with the move handle. */
  instructions: string;
  grabbed: (item: string, column: string, position: number, total: number) => string;
  moved: (item: string, column: string, position: number, total: number) => string;
  dropped: (item: string, column: string, position: number, total: number) => string;
  cancelled: (item: string) => string;
}

export interface KanbanBoardProps<T extends KanbanItem> extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Accessible name of the board, e.g. "Sales pipeline". */
  label: string;
  /** Columns (stages), in order. */
  columns: KanbanColumn[];
  /** Items; their order within a column is their array order. Providing it makes the board controlled. */
  items?: T[];
  /** Initial items when uncontrolled. @default [] */
  defaultItems?: T[];
  /** Called with the reordered items after a move. */
  onItemsChange?: (items: T[]) => void;
  /** Called after an item is dropped in a new place. Persist the move here. */
  onMove?: (move: KanbanMove<T>) => void;
  /** Renders a card's content. */
  renderItem: (item: T) => ReactNode;
  /** Plain-text name of an item, used in announcements and the handle label. */
  getItemLabel: (item: T) => string;
  /** Business rule for allowed transitions. Disallowed columns are skipped while moving. */
  canMove?: (item: T, toColumnId: string) => boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<KanbanBoardLabels>;
}

const defaultLabels: KanbanBoardLabels = {
  handle: (item) => `Move ${item}`,
  count: (count, limit) => (limit === undefined ? String(count) : `${count} / ${limit}`),
  overLimit: 'Over limit',
  empty: 'No items',
  instructions: 'Press Space to pick up. Use the arrow keys to move, Space to drop and Escape to cancel.',
  grabbed: (item, column, position, total) => `Picked up ${item} in ${column}, position ${position} of ${total}.`,
  moved: (item, column, position, total) => `${item}: ${column}, position ${position} of ${total}.`,
  dropped: (item, column, position, total) => `Dropped ${item} in ${column}, position ${position} of ${total}.`,
  cancelled: (item) => `Move of ${item} cancelled.`,
};

/** Moves `id` into `toColumn` before the `toIndex`-th item of that column. */
function moveItem<T extends KanbanItem>(items: T[], id: string, toColumn: string, toIndex: number): T[] {
  const item = items.find((i) => i.id === id);
  if (!item) return items;
  const rest = items.filter((i) => i.id !== id);
  const target = rest.filter((i) => i.columnId === toColumn);
  const moved = { ...item, columnId: toColumn };
  if (toIndex >= target.length) {
    const last = target[target.length - 1];
    const at = last ? rest.indexOf(last) + 1 : rest.length;
    return [...rest.slice(0, at), moved, ...rest.slice(at)];
  }
  const at = rest.indexOf(target[Math.max(toIndex, 0)]);
  return [...rest.slice(0, at), moved, ...rest.slice(at)];
}

/**
 * Items moving through stages (pipeline, tickets, approvals) as cards in columns.
 * Mouse users drag cards; keyboard users pick a card up with its handle and move it with the arrow keys.
 */
export function KanbanBoard<T extends KanbanItem>({
  label, columns, items: itemsProp, defaultItems = [], onItemsChange, onMove, renderItem, getItemLabel, canMove, labels: labelOverrides, className, ...rest
}: KanbanBoardProps<T>) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const id = useId(undefined, 'kanban');
  const [items, setItems] = useControllableState(itemsProp, defaultItems, onItemsChange);
  // While a card is being moved, the board renders a preview that is committed on drop.
  const [preview, setPreview] = useState<{ items: T[]; id: string; origin: { columnId: string; index: number } } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ columnId: string; index: number } | null>(null);
  const [message, setMessage] = useState('');
  const boardRef = useRef<HTMLElement>(null);
  const refocus = useRef<string | null>(null);

  const shown = preview?.items ?? items;
  const inColumn = (list: T[], columnId: string) => list.filter((i) => i.columnId === columnId);
  const columnTitle = (columnId: string) => columns.find((c) => c.id === columnId)?.title ?? columnId;
  const positionOf = (list: T[], itemId: string) => {
    const item = list.find((i) => i.id === itemId)!;
    const col = inColumn(list, item.columnId);
    return { column: item.columnId, index: col.findIndex((i) => i.id === itemId), total: col.length };
  };

  // Moving a card between columns remounts its handle; put focus back on it.
  useEffect(() => {
    if (!refocus.current) return;
    boardRef.current?.querySelector<HTMLElement>(`[data-kanban-handle="${CSS.escape(refocus.current)}"]`)?.focus();
    refocus.current = null;
  });

  const commit = (next: T[], itemId: string, origin: { columnId: string; index: number }) => {
    const pos = positionOf(next, itemId);
    if (pos.column === origin.columnId && pos.index === origin.index) return pos;
    const item = next.find((i) => i.id === itemId)!;
    setItems(next);
    onMove?.({ item, fromColumnId: origin.columnId, toColumnId: pos.column, index: pos.index });
    return pos;
  };

  const onHandleKey = (event: KeyboardEvent<HTMLButtonElement>, item: T) => {
    const name = getItemLabel(item);
    if (!preview) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        const pos = positionOf(items, item.id);
        setPreview({ items, id: item.id, origin: { columnId: pos.column, index: pos.index } });
        setMessage(labels.grabbed(name, columnTitle(pos.column), pos.index + 1, pos.total));
      }
      return;
    }
    if (preview.id !== item.id) return;
    const pos = positionOf(preview.items, item.id);
    const colIndex = columns.findIndex((c) => c.id === pos.column);
    let next: T[] | null = null;
    if (event.key === 'ArrowUp' && pos.index > 0) next = moveItem(preview.items, item.id, pos.column, pos.index - 1);
    if (event.key === 'ArrowDown' && pos.index < pos.total - 1) next = moveItem(preview.items, item.id, pos.column, pos.index + 1);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const step = event.key === 'ArrowRight' ? 1 : -1;
      // RTL boards read right to left.
      const dir = getComputedStyle(event.currentTarget).direction === 'rtl' ? -step : step;
      for (let c = colIndex + dir; c >= 0 && c < columns.length; c += dir) {
        if (canMove && !canMove(item, columns[c].id)) continue;
        const target = inColumn(preview.items, columns[c].id).filter((i) => i.id !== item.id);
        next = moveItem(preview.items, item.id, columns[c].id, Math.min(pos.index, target.length));
        break;
      }
    }
    if (next) {
      event.preventDefault();
      const np = positionOf(next, item.id);
      refocus.current = item.id;
      setPreview({ ...preview, items: next });
      setMessage(labels.moved(name, columnTitle(np.column), np.index + 1, np.total));
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      const np = commit(preview.items, item.id, preview.origin);
      refocus.current = item.id;
      setPreview(null);
      setMessage(labels.dropped(name, columnTitle(np.column), np.index + 1, np.total));
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      refocus.current = event.key === 'Escape' ? item.id : null;
      setPreview(null);
      setMessage(labels.cancelled(name));
    } else if (event.key.startsWith('Arrow')) {
      event.preventDefault();
    }
  };

  // Pointer drag and drop (HTML5).
  const dropIndex = (event: DragEvent<HTMLUListElement>) => {
    const cards = [...event.currentTarget.querySelectorAll<HTMLElement>(':scope > li[data-kanban-item]')].filter((el) => el.dataset.kanbanItem !== dragId);
    const index = cards.findIndex((el) => {
      const r = el.getBoundingClientRect();
      return event.clientY < r.top + r.height / 2;
    });
    return index < 0 ? cards.length : index;
  };
  const onDragOver = (event: DragEvent<HTMLUListElement>, columnId: string) => {
    const item = items.find((i) => i.id === dragId);
    if (!item || (canMove && item.columnId !== columnId && !canMove(item, columnId))) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const index = dropIndex(event);
    if (dropTarget?.columnId !== columnId || dropTarget.index !== index) setDropTarget({ columnId, index });
  };
  const onDrop = (event: DragEvent<HTMLUListElement>, columnId: string) => {
    event.preventDefault();
    const item = items.find((i) => i.id === dragId);
    setDragId(null);
    setDropTarget(null);
    if (!item) return;
    const origin = positionOf(items, item.id);
    const pos = commit(moveItem(items, item.id, columnId, dropIndex(event)), item.id, { columnId: origin.column, index: origin.index });
    setMessage(labels.dropped(getItemLabel(item), columnTitle(pos.column), pos.index + 1, pos.total));
  };

  return (
    <section ref={boardRef} className={cx(styles.board, className)} aria-label={label} {...rest}>
      <span id={`${id}-help`} className="eui-visually-hidden">
        {labels.instructions}
      </span>
      {columns.map((column) => {
        const cards = inColumn(shown, column.id);
        const over = column.limit !== undefined && cards.length > column.limit;
        const titleId = `${id}-${column.id}`;
        const targeted = dropTarget?.columnId === column.id;
        return (
          <section key={column.id} className={cx(styles.column, over && styles.over, targeted && styles.targeted)} aria-labelledby={titleId}>
            <header className={styles.header}>
              <h3 id={titleId} className={styles.title}>
                {column.title}
              </h3>
              <span className={styles.count}>
                {labels.count(cards.length, column.limit)}
                {over && <span className={styles.overLabel}> · {labels.overLimit}</span>}
              </span>
              {column.meta && <div className={styles.meta}>{column.meta}</div>}
            </header>
            <ul className={styles.cards} aria-labelledby={titleId} onDragOver={(e) => onDragOver(e, column.id)} onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null);
            }} onDrop={(e) => onDrop(e, column.id)}>
              {cards.map((item, index) => {
                const name = getItemLabel(item);
                const grabbed = preview?.id === item.id;
                return (
                  <li
                    key={item.id}
                    data-kanban-item={item.id}
                    className={cx(styles.card, grabbed && styles.grabbed, dragId === item.id && styles.dragging, targeted && dropTarget.index === index && styles.insertBefore)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', item.id);
                      setDragId(item.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDropTarget(null);
                    }}
                  >
                    <button
                      type="button"
                      className={styles.handle}
                      data-kanban-handle={item.id}
                      aria-label={labels.handle(name)}
                      aria-describedby={`${id}-help`}
                      aria-pressed={grabbed}
                      onKeyDown={(e) => onHandleKey(e, item)}
                      onBlur={() => {
                        if (grabbed && !refocus.current) {
                          setPreview(null);
                          setMessage(labels.cancelled(name));
                        }
                      }}
                    >
                      {svgIcon(verticalGripSvg, 'vertical-grip', { 'aria-hidden': "true" })}
                    </button>
                    <div className={styles.content}>{renderItem(item)}</div>
                  </li>
                );
              })}
              {targeted && dropTarget.index >= cards.filter((c) => c.id !== dragId).length && <li className={styles.dropEnd} aria-hidden="true" />}
              {cards.length === 0 && !targeted && <li className={styles.empty}>{labels.empty}</li>}
            </ul>
          </section>
        );
      })}
      <span className="eui-visually-hidden" aria-live="assertive">
        {message}
      </span>
    </section>
  );
}
