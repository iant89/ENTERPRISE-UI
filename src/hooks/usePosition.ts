import { useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { Placement } from '../utilities/types';
import { useIsoLayoutEffect } from './useEventCallback';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ComputePositionOptions {
  placement: Placement;
  offset: number;
  viewport: { width: number; height: number };
  padding?: number;
}

/**
 * Pure positioning: places `floating` next to `anchor`, flipping to the
 * opposite side when it would overflow and clamping into the viewport.
 */
export function computePosition(anchor: Rect, floating: { width: number; height: number }, options: ComputePositionOptions) {
  const { offset, viewport, padding = 8 } = options;
  const [initialSide, align = 'center'] = options.placement.split('-') as [string, string?];
  let side = initialSide;

  const fits = (s: string) => {
    if (s === 'bottom') return anchor.top + anchor.height + offset + floating.height <= viewport.height - padding;
    if (s === 'top') return anchor.top - offset - floating.height >= padding;
    if (s === 'right') return anchor.left + anchor.width + offset + floating.width <= viewport.width - padding;
    return anchor.left - offset - floating.width >= padding;
  };
  const opposite: Record<string, string> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  if (!fits(side) && fits(opposite[side])) side = opposite[side];

  let top: number;
  let left: number;
  if (side === 'top' || side === 'bottom') {
    top = side === 'bottom' ? anchor.top + anchor.height + offset : anchor.top - offset - floating.height;
    if (align === 'start') left = anchor.left;
    else if (align === 'end') left = anchor.left + anchor.width - floating.width;
    else left = anchor.left + anchor.width / 2 - floating.width / 2;
  } else {
    left = side === 'right' ? anchor.left + anchor.width + offset : anchor.left - offset - floating.width;
    if (align === 'start') top = anchor.top;
    else if (align === 'end') top = anchor.top + anchor.height - floating.height;
    else top = anchor.top + anchor.height / 2 - floating.height / 2;
  }

  left = Math.max(padding, Math.min(left, viewport.width - floating.width - padding));
  top = Math.max(padding, Math.min(top, viewport.height - floating.height - padding));
  const placement = (align === 'center' ? side : `${side}-${align}`) as Placement;
  return { top, left, placement };
}

export interface UsePositionOptions {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  floatingRef: RefObject<HTMLElement | null>;
  placement?: Placement;
  offset?: number;
  /** Make the floating element at least as wide as the anchor. */
  matchWidth?: boolean;
}

/** Positions a fixed floating element relative to an anchor, tracking scroll and resize. */
export function usePosition({ open, anchorRef, floatingRef, placement = 'bottom-start', offset = 4, matchWidth = false }: UsePositionOptions) {
  const [state, setState] = useState<{ style: CSSProperties; placement: Placement }>({
    style: { position: 'fixed', top: 0, left: 0, visibility: 'hidden' },
    placement,
  });

  const update = () => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!open || !anchor || !floating) return;
    const a = anchor.getBoundingClientRect();
    const minWidth = matchWidth ? a.width : undefined;
    const f = floating.getBoundingClientRect();
    const result = computePosition(
      { top: a.top, left: a.left, width: a.width, height: a.height },
      { width: Math.max(f.width, minWidth ?? 0), height: f.height },
      { placement, offset, viewport: { width: window.innerWidth, height: window.innerHeight } },
    );
    setState((prev) =>
      prev.style.top === result.top && prev.style.left === result.left && prev.style.minWidth === minWidth && prev.placement === result.placement && prev.style.visibility === undefined
        ? prev
        : { style: { position: 'fixed', top: result.top, left: result.left, minWidth }, placement: result.placement },
    );
  };
  const updateRef = useRef(update);
  updateRef.current = update;

  // Re-measure after every render: the floating element may mount late (portals) or change size.
  useIsoLayoutEffect(() => {
    updateRef.current();
  });

  useIsoLayoutEffect(() => {
    if (!open) {
      setState((prev) => (prev.style.visibility === 'hidden' ? prev : { style: { position: 'fixed', top: 0, left: 0, visibility: 'hidden' }, placement }));
      return;
    }
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => updateRef.current());
    };
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (anchorRef.current) observer?.observe(anchorRef.current);
    if (floatingRef.current) observer?.observe(floatingRef.current);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
    };
  }, [open]);

  return state;
}
