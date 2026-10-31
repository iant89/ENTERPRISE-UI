import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { cloneTrigger } from '../../utilities/cloneTrigger';
import { Portal } from '../../utilities/Portal';
import type { Placement } from '../../utilities/types';
import { useEscapeKey } from '../../hooks/useDismiss';
import { useId } from '../../hooks/useId';
import { usePosition } from '../../hooks/usePosition';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  /** Tooltip text. Keep it short; tooltips must not hold essential information. */
  content: ReactNode;
  /** A single focusable element (e.g. an IconButton). */
  children: ReactElement;
  /** @default 'top' */
  placement?: Placement;
  /** Delay before showing on hover, in ms. @default 400 */
  delay?: number;
  /** @default false */
  disabled?: boolean;
  /**
   * How the tooltip relates to the trigger: `description` adds
   * `aria-describedby`; `label` adds `aria-labelledby` (for icon-only triggers).
   * @default 'description'
   */
  relationship?: 'description' | 'label';
}

/**
 * Short contextual help on hover and keyboard focus. Dismissible with
 * Escape and hoverable (WCAG 1.4.13).
 */
export function Tooltip({ content, children, placement = 'top', delay = 400, disabled = false, relationship = 'description' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId(undefined, 'tooltip');
  const { style } = usePosition({ open, anchorRef: triggerRef, floatingRef: tipRef, placement, offset: 6 });

  useEffect(() => () => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  }, []);
  useEscapeKey(() => setOpen(false), open);
  // Close an open tooltip when it becomes disabled.
  useEffect(() => {
    if (!disabled) return;
    clearTimeout(showTimer.current);
    setOpen(false);
  }, [disabled]);

  const show = (immediate: boolean) => {
    if (disabled) return;
    clearTimeout(hideTimer.current);
    clearTimeout(showTimer.current);
    if (immediate) setOpen(true);
    else showTimer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 100);
  };

  const relation = relationship === 'label' ? { 'aria-labelledby': id } : { 'aria-describedby': open ? id : undefined };

  return (
    <>
      {cloneTrigger(children, triggerRef, {
        ...relation,
        onPointerEnter: (e: PointerEvent) => e.pointerType !== 'touch' && show(false),
        onPointerLeave: hide,
        onFocus: () => show(true),
        onBlur: hide,
      })}
      {(open || relationship === 'label') && (
        <Portal>
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            className={styles.tooltip}
            style={open ? style : { display: 'none' }}
            onPointerEnter={() => clearTimeout(hideTimer.current)}
            onPointerLeave={hide}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}
