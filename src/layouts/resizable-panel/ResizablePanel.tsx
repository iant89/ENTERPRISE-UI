import { forwardRef, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { GripHorizontal, GripVertical } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { clamp } from '../../utilities/format';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './ResizablePanel.module.css';

export interface ResizablePanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onResize'> {
  /** Controlled size in px (width for start/end handles, height for top/bottom). */
  size?: number;
  /** @default 320 */
  defaultSize?: number;
  onResize?: (size: number) => void;
  /** @default 160 */
  minSize?: number;
  /** @default 800 */
  maxSize?: number;
  /** Edge that carries the drag handle. @default 'end' */
  handle?: 'start' | 'end' | 'top' | 'bottom';
  /** Arrow-key step in px (Shift ×5). @default 16 */
  step?: number;
  /** Accessible label for the separator. @default 'Resize panel' */
  handleLabel?: string;
  /** Make the scrollable content area focusable so keyboard users can scroll it. @default false */
  focusableContent?: boolean;
  children: ReactNode;
}

/**
 * A panel with a draggable edge. The handle is a focusable `separator`:
 * arrow keys resize, Home/End jump to the min/max size.
 */
export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(function ResizablePanel(
  { size, defaultSize = 320, onResize, minSize = 160, maxSize = 800, handle = 'end', step = 16, handleLabel = 'Resize panel', focusableContent = false, className, style, children, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState(size, defaultSize, onResize);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ pos: 0, size: 0 });
  const horizontal = handle === 'start' || handle === 'end';
  const sign = handle === 'end' || handle === 'bottom' ? 1 : -1;
  const value = clamp(current, minSize, maxSize);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = { pos: horizontal ? event.clientX : event.clientY, size: value };
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const delta = (horizontal ? event.clientX : event.clientY) - start.current.pos;
    setCurrent(clamp(start.current.size + delta * sign, minSize, maxSize));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const s = event.shiftKey ? step * 5 : step;
    const grow = horizontal ? (handle === 'end' ? 'ArrowRight' : 'ArrowLeft') : handle === 'bottom' ? 'ArrowDown' : 'ArrowUp';
    const shrink = horizontal ? (handle === 'end' ? 'ArrowLeft' : 'ArrowRight') : handle === 'bottom' ? 'ArrowUp' : 'ArrowDown';
    let next: number | null = null;
    if (event.key === grow) next = value + s;
    else if (event.key === shrink) next = value - s;
    else if (event.key === 'Home') next = minSize;
    else if (event.key === 'End') next = maxSize;
    if (next !== null) {
      event.preventDefault();
      setCurrent(clamp(next, minSize, maxSize));
    }
  };

  const Grip = horizontal ? GripVertical : GripHorizontal;
  return (
    <div ref={ref} className={cx(styles.panel, className)} style={{ ...(horizontal ? { width: value } : { height: value }), ...style } as CSSProperties} {...rest}>
      <div className={styles.content} tabIndex={focusableContent ? 0 : undefined}>
        {children}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={handleLabel}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={Math.round(value)}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        className={cx(styles.handle, styles[handle], dragging && styles.dragging)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={onKeyDown}
      >
        <span className={styles.grip} aria-hidden="true">
          <Grip />
        </span>
      </div>
    </div>
  );
});
