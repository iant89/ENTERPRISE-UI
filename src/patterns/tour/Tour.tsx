import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import type { Placement } from '../../utilities/types';
import { Portal } from '../../utilities/Portal';
import { useControllableState } from '../../hooks/useControllableState';
import { useIsoLayoutEffect } from '../../hooks/useEventCallback';
import { useId } from '../../hooks/useId';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePosition } from '../../hooks/usePosition';
import { Button } from '../../components/button';
import styles from './Tour.module.css';

/** The element a step points at: a CSS selector, a ref, or a function returning the element. */
export type TourTarget = string | RefObject<HTMLElement | null> | (() => HTMLElement | null);

export interface TourStep {
  id: string;
  /** Element the step points at. Without a target, or when it is not found, the step is centered. */
  target?: TourTarget;
  title: ReactNode;
  content?: ReactNode;
  /** Where the card sits relative to the target. Flips when there is no room. @default 'bottom' */
  placement?: Placement;
}

export type TourCloseReason = 'finish' | 'skip' | 'escape';

export interface TourLabels {
  next: string;
  back: string;
  finish: string;
  skip: string;
  close: string;
  progress: (step: number, total: number) => string;
}

export interface TourProps {
  steps: TourStep[];
  /** Whether the tour is shown. */
  open: boolean;
  /** Called when the user finishes, skips or presses Escape. Persist completion here so the tour is not shown again. */
  onClose: (reason: TourCloseReason, stepIndex: number) => void;
  /** Controlled step index. */
  step?: number;
  /** Step shown first when the step is uncontrolled. @default 0 */
  defaultStep?: number;
  /** Called with the index of the step the user moves to. */
  onStepChange?: (index: number) => void;
  /** Dims the page around the target. @default true */
  spotlight?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<TourLabels>;
  /** Additional CSS class names for the card. */
  className?: string;
}

const defaultLabels: TourLabels = {
  next: 'Next',
  back: 'Back',
  finish: 'Finish',
  skip: 'Skip tour',
  close: 'Close',
  progress: (step, total) => `${step} of ${total}`,
};

function resolve(target: TourTarget | undefined): HTMLElement | null {
  if (!target || typeof document === 'undefined') return null;
  if (typeof target === 'string') return document.querySelector<HTMLElement>(target);
  if (typeof target === 'function') return target();
  return target.current;
}

/**
 * Guided onboarding: a sequence of cards anchored to elements on the page,
 * with an optional spotlight. The card is a non-modal dialog: focus moves
 * into it on each step, the page stays usable, Escape closes it and focus
 * returns to where it was. Show a tour once, on request or for new features,
 * and keep it short.
 */
export function Tour({ steps, open, onClose, step, defaultStep = 0, onStepChange, spotlight = true, labels: overrides, className }: TourProps) {
  const labels = { ...defaultLabels, ...overrides };
  const [requested, setStep] = useControllableState(step, defaultStep, onStepChange);
  const index = Math.max(0, Math.min(steps.length - 1, Math.trunc(requested) || 0));
  const current = steps[index];
  const id = useId(undefined, 'tour');
  const cardRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [rect, setRect] = useState<DOMRect | null>(null);

  const target = open && current ? resolve(current.target) : null;
  anchorRef.current = target;
  const position = usePosition({ open: open && !!target, anchorRef, floatingRef: cardRef, placement: current?.placement ?? 'bottom', offset: 12 });

  // Remember where focus was when the tour opened, and restore it when it closes.
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    return () => {
      const el = returnFocus.current;
      if (el && el.isConnected) el.focus();
    };
  }, [open]);

  // Bring the target into view and move focus to the card on every step.
  useEffect(() => {
    if (!open || !current) return;
    target?.scrollIntoView?.({ block: 'center', inline: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
    cardRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, current?.id]);

  // Track the target's box for the spotlight.
  useIsoLayoutEffect(() => {
    if (!open || !spotlight || !target) {
      setRect(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRect(target.getBoundingClientRect()));
    };
    setRect(target.getBoundingClientRect());
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [open, spotlight, target]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        onClose('escape', index);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, index, onClose]);

  if (!open || !current) return null;
  const isLast = index === steps.length - 1;
  const pad = 6;
  const spot: CSSProperties | undefined = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : undefined;

  return (
    <Portal>
      {spotlight && <div className={cx(styles.spotlight, !spot && styles.dimOnly)} style={spot} aria-hidden="true" data-tour-spotlight="" />}
      <div
        ref={cardRef}
        role="dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={current.content ? `${id}-content` : undefined}
        tabIndex={-1}
        className={cx(styles.card, !target && styles.centered, className)}
        style={target ? position.style : undefined}
        data-placement={target ? position.placement : undefined}
      >
        <div className={styles.header}>
          <h2 id={`${id}-title`} className={styles.title}>{current.title}</h2>
          <button type="button" className={styles.close} aria-label={labels.close} onClick={() => onClose('skip', index)}>
            <X aria-hidden="true" />
          </button>
        </div>
        {current.content && <div id={`${id}-content`} className={styles.content}>{current.content}</div>}
        <div className={styles.footer}>
          {steps.length > 1 && <span className={styles.progress}>{labels.progress(index + 1, steps.length)}</span>}
          <div className={styles.actions}>
            {steps.length > 1 && !isLast && (
              <Button variant="tertiary" size="sm" onClick={() => onClose('skip', index)}>
                {labels.skip}
              </Button>
            )}
            {index > 0 && <Button size="sm" onClick={() => setStep(index - 1)}>{labels.back}</Button>}
            <Button variant="primary" size="sm" onClick={() => (isLast ? onClose('finish', index) : setStep(index + 1))}>
              {isLast ? labels.finish : labels.next}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export interface CoachmarkProps {
  /** Element the coachmark points at. */
  target: TourTarget;
  open: boolean;
  /** Called when the user dismisses it. Persist the dismissal so it is not shown again. */
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  /** @default 'bottom' */
  placement?: Placement;
  /** Text of the dismiss button. @default 'Got it' */
  dismissLabel?: string;
  /** Dims the page around the target. @default false */
  spotlight?: boolean;
  className?: string;
}

/** A single tip anchored to an element, such as a pointer to a new feature. A one-step Tour. */
export function Coachmark({ target, open, onClose, title, children, placement, dismissLabel = 'Got it', spotlight = false, className }: CoachmarkProps) {
  return (
    <Tour
      open={open}
      onClose={() => onClose()}
      steps={[{ id: 'coachmark', target, title, content: children, placement }]}
      spotlight={spotlight}
      labels={{ finish: dismissLabel }}
      className={className}
    />
  );
}
