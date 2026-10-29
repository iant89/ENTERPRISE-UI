import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useId } from '../../hooks/useId';
import styles from './VirtualList.module.css';
import { getVirtualWindow } from './useVirtualWindow';

export interface VirtualListProps<T> {
  items: readonly T[];
  /** Stable unique identity. Do not use array indexes when the collection can change. */
  getItemId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  'aria-label': string;
  /** Fixed row height in CSS pixels. Variable heights are not supported. */
  itemHeight: number;
  /** Viewport height in CSS pixels. @default 320 */
  height?: number;
  /** Extra rows on either side of the viewport. @default 3 */
  overscan?: number;
  /** Controlled selection; omitted means no selection. */
  selectedIds?: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Render every item as an accessible alternative. @default true */
  virtualized?: boolean;
}

/** Fixed-height listbox. Items must not contain independently interactive controls. */
export function VirtualList<T>({ items, getItemId, renderItem, 'aria-label': label, itemHeight, height = 320, overscan = 3, selectedIds, onSelectionChange, virtualized = true }: VirtualListProps<T>) {
  const viewport = useRef<HTMLDivElement>(null);
  const listId = useId(undefined, 'virtual-list');
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(height);
  const [activeId, setActiveId] = useState<string>();
  const rowHeight = Number.isFinite(itemHeight) && itemHeight > 0 ? itemHeight : 1;
  const extra = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0;
  const maxScroll = Math.max(0, items.length * rowHeight - viewportHeight);
  const window = getVirtualWindow(items.length, rowHeight, viewportHeight, scrollTop, extra);
  const start = virtualized ? window.start : 0;
  const end = virtualized ? window.end : items.length;
  const activeIndex = Math.max(0, items.findIndex((item) => getItemId(item) === activeId));
  const activeVisible = items.length > 0 && activeIndex >= start && activeIndex < end;
  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const update = () => setViewportHeight(element.clientHeight || height);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update); observer.observe(element);
    return () => observer.disconnect();
  }, [height]);
  useEffect(() => {
    const element = viewport.current;
    if (element && element.scrollTop > maxScroll) { element.scrollTop = maxScroll; setScrollTop(maxScroll); }
  }, [maxScroll]);

  const move = (index: number) => {
    if (!items.length) return;
    const next = Math.max(0, Math.min(index, items.length - 1));
    setActiveId(getItemId(items[next]));
    const element = viewport.current;
    if (!element) return;
    const top = next * rowHeight; const bottom = top + rowHeight;
    if (top < element.scrollTop) element.scrollTop = top;
    else if (bottom > element.scrollTop + viewportHeight) element.scrollTop = bottom - viewportHeight;
    setScrollTop(element.scrollTop);
  };
  const toggle = (index: number) => {
    if (!selectedIds || !onSelectionChange || !items[index]) return;
    const id = getItemId(items[index]);
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter((selected) => selected !== id) : [...selectedIds, id]);
  };
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let target: number | undefined;
    if (event.key === 'ArrowDown') target = activeIndex + 1;
    if (event.key === 'ArrowUp') target = activeIndex - 1;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = items.length - 1;
    if (target !== undefined) { event.preventDefault(); move(target); }
    else if ((event.key === ' ' || event.key === 'Enter') && items.length && selectedIds && onSelectionChange) { event.preventDefault(); toggle(activeIndex); }
  };
  return <div ref={viewport} role="listbox" aria-label={label} aria-multiselectable={selectedIds ? true : undefined} aria-readonly={!selectedIds || !onSelectionChange} aria-activedescendant={activeVisible ? optionId(activeIndex) : undefined} tabIndex={0} className={styles.viewport} style={{ height }} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)} onKeyDown={keyDown}>
    <div style={virtualized ? { height: items.length * rowHeight, position: 'relative' } : undefined}>
      {items.slice(start, end).map((item, offset) => {
        const index = start + offset; const id = getItemId(item);
        return <div role="option" id={optionId(index)} key={id} aria-selected={selectedIds?.includes(id) ?? false} aria-posinset={index + 1} aria-setsize={items.length} className={styles.item} data-active={activeVisible && index === activeIndex || undefined} style={virtualized ? { height: rowHeight, position: 'absolute', top: index * rowHeight, left: 0, right: 0 } : { height: rowHeight }} onClick={() => { move(index); toggle(index); viewport.current?.focus(); }}>{renderItem(item)}</div>;
      })}
    </div>
  </div>;
}
