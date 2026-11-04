import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import styles from './CodeWorkspace.module.css';

export interface SplitterProps {
  label: string;
  /** 'vertical' separates columns (drag horizontally); 'horizontal' separates rows. */
  orientation: 'vertical' | 'horizontal';
  value: number;
  min: number;
  max: number;
  /** +1 when dragging right/down grows the panel, -1 when it shrinks it. */
  direction?: 1 | -1;
  controls?: string;
  onChange: (size: number) => void;
}

const STEP = 16;

/** A small, dependency-free splitter: role=separator, pointer drag and arrow / Home / End keys. */
export function Splitter({ label, orientation, value, min, max, direction = 1, controls, onChange }: SplitterProps) {
  const start = useRef<{ pos: number; size: number } | null>(null);
  const axis = (e: PointerEvent) => (orientation === 'vertical' ? e.clientX : e.clientY);
  const onKey = (event: KeyboardEvent) => {
    const grow: Record<string, number> = orientation === 'vertical' ? { ArrowRight: 1, ArrowLeft: -1 } : { ArrowDown: 1, ArrowUp: -1 };
    const d = grow[event.key];
    const step = event.shiftKey ? STEP * 4 : STEP;
    if (d) { event.preventDefault(); onChange(value + d * direction * step); }
    else if (event.key === 'Home') { event.preventDefault(); onChange(min); }
    else if (event.key === 'End') { event.preventDefault(); onChange(max); }
  };
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={orientation}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-controls={controls}
      className={orientation === 'vertical' ? styles.splitterV : styles.splitterH}
      onKeyDown={onKey}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); start.current = { pos: axis(e), size: value }; }}
      onPointerMove={(e) => { if (start.current) onChange(start.current.size + (axis(e) - start.current.pos) * direction); }}
      onPointerUp={() => { start.current = null; }}
      onPointerCancel={() => { start.current = null; }}
    />
  );
}
