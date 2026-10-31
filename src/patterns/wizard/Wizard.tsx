import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { Button } from '../../components/button';
import { MessageStrip } from '../../components/message-strip';
import styles from './Wizard.module.css';

export interface WizardStep {
  id: string;
  title: string;
  description?: ReactNode;
  content: ReactNode;
  /** @default false */
  optional?: boolean;
  /**
   * Runs before leaving the step forwards. Return `true` to continue, or an
   * error message to stay on the step.
   */
  validate?: () => true | string | Promise<true | string>;
}

export interface WizardProps {
  /** Non-empty steps with unique, non-empty IDs. */
  steps: WizardStep[];
  /** Controlled current step index. */
  step?: number;
  /** @default 0 */
  /** Zero-based index of the step shown initially when the step is uncontrolled. */
  defaultStep?: number;
  /** Called with the zero-based index of the step the user moves to. */
  onStepChange?: (index: number) => void;
  /** Called after the last step validates. */
  onFinish: () => void | Promise<unknown>;
  /** Called when the user cancels the wizard. */
  onCancel?: () => void;
  /** @default 'Finish' */
  /** Text of the button on the last step. */
  finishLabel?: string;
  /** Accessible name for the wizard. */
  'aria-label'?: string;
  /** Additional CSS class names for the root element. */
  className?: string;
}

/**
 * Guides users through a multi-step task with a step indicator, per-step
 * validation and Back / Next / Finish actions. Focus moves to the step
 * heading on navigation; completed steps can be revisited. Navigation is locked
 * while validation or finishing is pending. Invalid step indexes are clamped to
 * the available range; an empty step list or duplicate/empty IDs throws.
 * Results from validation for a step that is no longer active are ignored.
 */
export function Wizard({ steps, step, defaultStep = 0, onStepChange, onFinish, onCancel, finishLabel = 'Finish', 'aria-label': ariaLabel, className }: WizardProps) {
  if (steps.length === 0) throw new Error('Wizard requires at least one step.');
  const ids = new Set<string>();
  for (const item of steps) {
    if (!item.id || !item.id.trim() || ids.has(item.id)) {
      throw new Error('Wizard step IDs must be non-empty and unique.');
    }
    ids.add(item.id);
  }
  const [requested, setCurrent] = useControllableState(step, defaultStep, onStepChange);
  const current = Number.isFinite(requested) ? Math.max(0, Math.min(steps.length - 1, Math.trunc(requested))) : 0;
  const [furthest, setFurthest] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(false);
  const activeIdentity = useRef({ current, id: steps[current].id });
  activeIdentity.current = { current, id: steps[current].id };
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const id = useId(undefined, 'wizard');
  const active = steps[current];
  const isLast = current === steps.length - 1;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
    moved.current = false;
  }, [current]);

  const goTo = (index: number) => {
    moved.current = true;
    setError(null);
    setCurrent(index);
    setFurthest((f) => Math.max(f, index));
  };

  const next = async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    const identity = { current, id: active.id };
    const isCurrent = () => mounted.current && activeIdentity.current.current === identity.current && activeIdentity.current.id === identity.id;
    try {
      const result = active.validate ? await active.validate() : true;
      if (!isCurrent()) return;
      if (result !== true) {
        setError(result || 'Validation failed.');
        return;
      }
      if (isLast) await onFinish();
      else goTo(current + 1);
    } catch (err) {
      // A rejected validate() or onFinish() is shown on the step instead of becoming an unhandled rejection.
      if (isCurrent()) setError((err instanceof Error ? err.message : String(err ?? '')) || 'An unexpected error occurred.');
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <section className={cx(styles.wizard, className)} aria-label={ariaLabel ?? 'Wizard'}>
      <ol className={styles.steps} tabIndex={0} aria-label="Wizard steps">
        {steps.map((s, i) => {
          const done = i < furthest && i !== current;
          return (
            <li key={s.id} className={cx(styles.step, i === current && styles.current, (done || i < current) && styles.done)}>
              <button
                type="button"
                className={styles.stepButton}
                aria-current={i === current ? 'step' : undefined}
                disabled={busy || i > Math.min(furthest, steps.length - 1) || i === current}
                onClick={() => goTo(i)}
              >
                <span className={styles.marker} aria-hidden="true">
                  {done ? <Check /> : i + 1}
                </span>
                <span className={styles.stepLabel}>
                  <span className="eui-visually-hidden">Step {i + 1}:</span>{' '}
                  {s.title}
                  {done && <span className="eui-visually-hidden"> (completed)</span>}
                </span>
                {s.optional && <span className={styles.optional}>Optional</span>}
              </button>
            </li>
          );
        })}
      </ol>
      <div className={styles.body} aria-labelledby={`${id}-heading`} role="group">
        <h2 id={`${id}-heading`} ref={headingRef} tabIndex={-1} className={styles.heading}>
          {active.title}
        </h2>
        {active.description && <p className={styles.description}>{active.description}</p>}
        {error && (
          <MessageStrip tone="error" announce="assertive">
            {error}
          </MessageStrip>
        )}
        {active.content}
      </div>
      <div className={styles.footer}>
        <span className={styles.progressText}>
          Step {current + 1} of {steps.length}
        </span>
        <div className={styles.footerEnd}>
          {onCancel && (
            <Button variant="tertiary" disabled={busy} onClick={onCancel}>
              Cancel
            </Button>
          )}
          {current > 0 && <Button disabled={busy} onClick={() => goTo(current - 1)}>Back</Button>}
          <Button variant="primary" loading={busy} onClick={next}>
            {isLast ? finishLabel : active.optional ? 'Next (or skip)' : 'Next'}
          </Button>
        </div>
      </div>
    </section>
  );
}
