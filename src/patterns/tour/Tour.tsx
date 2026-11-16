import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { Portal } from '../../utilities/Portal';
import { focusElement } from '../../utilities/focus';
import type { Placement } from '../../utilities/types';
import { useControllableState } from '../../hooks/useControllableState';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useId } from '../../hooks/useId';
import { useIsoLayoutEffect } from '../../hooks/useEventCallback';
import { computePosition } from '../../hooks/usePosition';
import { Button } from '../../components/button';
import { IconButton } from '../../components/icon-button';
import styles from './Tour.module.css';
import declineSvg from '../../assets/icons/decline.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

export interface TourStep {
  /** Unique, non-empty id. */
  id: string;
  /**
   * What the step points at: a CSS selector, or a function returning the
   * element. Without a target (or when it cannot be found in time) the step is
   * shown in the middle of the screen.
   */
  target?: string | (() => Element | null);
  /** Heading of the callout; also its accessible name. */
  title: string;
  /** The explanation. */
  content: ReactNode;
  /** @default 'bottom' */
  /** Preferred side of the target. It flips automatically when there is not enough space. */
  placement?: Placement;
}

export interface TourLabels {
  next: string;
  back: string;
  finish: string;
  skip: string;
  close: string;
  /** Progress text, e.g. "Step 2 of 7". */
  progress: (current: number, total: number) => string;
}

export interface TourProps {
  /** Non-empty steps with unique, non-empty IDs. */
  steps: TourStep[];
  /** Whether the tour is showing. */
  open: boolean;
  /** Controlled current step index. */
  step?: number;
  /** @default 0 */
  /** Zero-based index of the step shown initially when the step is uncontrolled. */
  defaultStep?: number;
  /** Called with the zero-based index of the step the user moves to. */
  onStepChange?: (index: number) => void;
  /** Called when the user finishes the last step. */
  onFinish: () => void;
  /** Called when the user leaves early (Skip, the close button or Escape), with the step they were on. */
  onSkip: (index: number) => void;
  /** @default true */
  /** Dim the page and leave a hole around the target. */
  spotlight?: boolean;
  /** @default 2000 */
  /** How long to wait for a step's target to appear (for example after navigating), in milliseconds. */
  targetTimeout?: number;
  /** Localizable strings. */
  labels?: Partial<TourLabels>;
  /** @default 'Guided tour' */
  /** Accessible description of the tour as a whole. */
  'aria-label'?: string;
  /** Additional CSS class names for the callout. */
  className?: string;
}

const DEFAULT_LABELS: TourLabels = {
  next: 'Next',
  back: 'Back',
  finish: 'Done',
  skip: 'Skip tour',
  close: 'Close tour',
  progress: (current, total) => `Step ${current} of ${total}`,
};

const GAP = 12; // between the target and the callout
const PAD = 6; // around the target inside the spotlight
const ARROW = 8;

interface Box { top: number; left: number; width: number; height: number }

function resolve(target: TourStep['target']): Element | null {
  if (!target) return null;
  if (typeof target === 'function') return target();
  try {
    return document.querySelector(target);
  } catch {
    return null;
  }
}

const sideOf = (placement: Placement) => placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';

/**
 * A guided tour: a sequence of callouts that point at parts of the page, with
 * Back / Next / Done and Skip. Each step finds its target by selector (waiting
 * for it to appear, so a step can follow a navigation), scrolls it into view
 * and highlights it; a step without a target is centred. The callout is a modal
 * dialog: focus moves to it on every step and stays inside it, the page behind
 * cannot be clicked, and Escape skips the tour. Left and Right arrows move
 * between steps.
 */
export function Tour({
  steps,
  open,
  step,
  defaultStep = 0,
  onStepChange,
  onFinish,
  onSkip,
  spotlight = true,
  targetTimeout = 2000,
  labels,
  'aria-label': ariaLabel = 'Guided tour',
  className,
}: TourProps) {
  if (steps.length === 0) throw new Error('Tour requires at least one step.');
  const ids = new Set<string>();
  for (const item of steps) {
    if (!item.id || !item.id.trim() || ids.has(item.id)) throw new Error(`Tour step ids must be unique and non-empty (got "${item.id}").`);
    ids.add(item.id);
  }
  const text = { ...DEFAULT_LABELS, ...labels };
  const [rawIndex, setIndex] = useControllableState(step, defaultStep, onStepChange);
  // Uncontrolled: every time the tour opens it starts again from defaultStep.
  const wasOpen = useRef(open);
  useEffect(() => {
    if (open && !wasOpen.current && step === undefined) setIndex(defaultStep);
    wasOpen.current = open;
  }, [open, step, defaultStep, setIndex]);
  const index = Math.min(Math.max(0, rawIndex), steps.length - 1);
  const current = steps[index]!;
  const last = index === steps.length - 1;

  const calloutRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const id = useId(undefined, 'tour');
  const [target, setTarget] = useState<{ element: Element | null; searching: boolean }>({ element: null, searching: true });
  const [box, setBox] = useState<Box | null>(null);
  const [position, setPosition] = useState<{ style: CSSProperties; placement: Placement; arrow: CSSProperties } | null>(null);

  useFocusTrap(calloutRef, open, { initialFocusRef: headingRef });

  // Read by the target search, which restarts only when the step changes.
  const findRef = useRef({ target: current.target, timeout: targetTimeout });
  findRef.current = { target: current.target, timeout: targetTimeout };

  // Find this step's target, waiting for it to appear.
  useEffect(() => {
    if (!open) return;
    const { target: wanted, timeout } = findRef.current;
    setTarget({ element: null, searching: Boolean(wanted) });
    setBox(null);
    setPosition(null);
    if (!wanted) return;
    let frame = 0;
    const deadline = performance.now() + timeout;
    const look = () => {
      const element = resolve(wanted);
      if (element) {
        element.scrollIntoView?.({ block: 'center', inline: 'nearest' });
        setTarget({ element, searching: false });
      } else if (performance.now() < deadline) {
        frame = requestAnimationFrame(look);
      } else {
        setTarget({ element: null, searching: false });
      }
    };
    look();
    return () => cancelAnimationFrame(frame);
  }, [open, index, current.id]);

  // Track the target's box as the page scrolls or resizes.
  useEffect(() => {
    const element = target.element;
    if (!open || !element) return;
    let frame = 0;
    const measure = () => {
      const r = element.getBoundingClientRect();
      setBox((prev) => (prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height ? prev : { top: r.top, left: r.left, width: r.width, height: r.height }));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    observer?.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
    };
  }, [open, target.element]);

  // Place the callout next to the target, or in the middle without one.
  useIsoLayoutEffect(() => {
    const callout = calloutRef.current;
    if (!open || !callout || target.searching) return;
    const size = callout.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    if (!box) {
      const next = { style: { top: Math.max(8, (viewport.height - size.height) / 2), left: Math.max(8, (viewport.width - size.width) / 2) }, placement: 'bottom' as Placement, arrow: { display: 'none' } };
      setPosition((prev) => (prev && prev.style.top === next.style.top && prev.style.left === next.style.left && prev.arrow.display === 'none' ? prev : next));
      return;
    }
    const anchor = { top: box.top - PAD, left: box.left - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2 };
    const result = computePosition(anchor, { width: size.width, height: size.height }, { placement: current.placement ?? 'bottom', offset: GAP, viewport });
    const side = sideOf(result.placement);
    const arrow: CSSProperties = {};
    if (side === 'top' || side === 'bottom') {
      arrow.left = Math.min(Math.max(anchor.left + anchor.width / 2 - result.left - ARROW, 12), size.width - 12 - ARROW * 2);
      arrow[side === 'bottom' ? 'top' : 'bottom'] = -ARROW;
    } else {
      arrow.top = Math.min(Math.max(anchor.top + anchor.height / 2 - result.top - ARROW, 12), size.height - 12 - ARROW * 2);
      arrow[side === 'right' ? 'left' : 'right'] = -ARROW;
    }
    setPosition((prev) =>
      prev && prev.style.top === result.top && prev.style.left === result.left && prev.placement === result.placement && prev.arrow.left === arrow.left && prev.arrow.top === arrow.top
        ? prev
        : { style: { top: result.top, left: result.left }, placement: result.placement, arrow },
    );
  });

  // A new step: focus its heading, so screen readers announce it.
  const placed = position !== null;
  useEffect(() => {
    if (open && placed) focusElement(headingRef.current);
  }, [open, index, placed]);

  if (!open) return null;

  const back = () => index > 0 && setIndex(index - 1);
  const next = () => (last ? onFinish() : setIndex(index + 1));
  const skip = () => onSkip(index);
  const hole = spotlight && box ? { top: box.top - PAD, left: box.left - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2 } : null;

  return (
    <Portal>
      <div className={cx(styles.backdrop, spotlight && !hole && styles.dimmed)} aria-hidden="true" data-eui-tour-backdrop="" />
      {hole && <div className={styles.spotlight} style={hole} aria-hidden="true" data-eui-tour-spotlight="" />}
      <div
        ref={calloutRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-content`}
        aria-roledescription={ariaLabel}
        tabIndex={-1}
        className={cx(styles.callout, className)}
        data-placement={position?.placement}
        style={{ ...(position?.style ?? { top: 0, left: 0 }), visibility: position ? undefined : 'hidden' }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            skip();
          } else if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && !(event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')) {
            event.preventDefault();
            if (event.key === 'ArrowRight') next();
            else back();
          }
        }}
      >
        <span className={styles.arrow} style={position?.arrow} aria-hidden="true" />
        <div className={styles.header}>
          <h2 ref={headingRef} id={`${id}-title`} className={styles.title} tabIndex={-1}>
            {current.title}
          </h2>
          <IconButton icon={svgIcon(declineSvg, 'decline')} label={text.close} size="sm" onClick={skip} />
        </div>
        <div id={`${id}-content`} className={styles.body}>
          {current.content}
        </div>
        <div className={styles.footer}>
          <span className={styles.progress} aria-live="polite">
            {text.progress(index + 1, steps.length)}
          </span>
          <span className={styles.actions}>
            {!last && (
              <Button variant="tertiary" size="sm" onClick={skip}>
                {text.skip}
              </Button>
            )}
            {index > 0 && (
              <Button variant="secondary" size="sm" onClick={back}>
                {text.back}
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={next}>
              {last ? text.finish : text.next}
            </Button>
          </span>
        </div>
      </div>
    </Portal>
  );
}
