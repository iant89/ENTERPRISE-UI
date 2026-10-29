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
  steps: WizardStep[];
  /** Controlled current step index. */
  step?: number;
  /** @default 0 */
  defaultStep?: number;
  onStepChange?: (index: number) => void;
  /** Called after the last step validates. */
  onFinish: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** @default 'Finish' */
  finishLabel?: string;
  /** Accessible name for the wizard. */
  'aria-label'?: string;
  className?: string;
}

/**
 * Guides users through a multi-step task with a step indicator, per-step
 * validation and Back / Next / Finish actions. Focus moves to the step
 * heading on navigation; completed steps can be revisited.
 */
export function Wizard({ steps, step, defaultStep = 0, onStepChange, onFinish, onCancel, finishLabel = 'Finish', 'aria-label': ariaLabel, className }: WizardProps) {
  const [current, setCurrent] = useControllableState(step, defaultStep, onStepChange);
  const [furthest, setFurthest] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const id = useId(undefined, 'wizard');
  const active = steps[current];
  const isLast = current === steps.length - 1;

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
    setBusy(true);
    try {
      const result = active.validate ? await active.validate() : true;
      if (result !== true) {
        setError(result);
        return;
      }
      if (isLast) await onFinish();
      else goTo(current + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={cx(styles.wizard, className)} aria-label={ariaLabel ?? 'Wizard'}>
      <ol className={styles.steps}>
        {steps.map((s, i) => {
          const done = i < furthest && i !== current;
          return (
            <li key={s.id} className={cx(styles.step, i === current && styles.current, (done || i < current) && styles.done)}>
              <button
                type="button"
                className={styles.stepButton}
                aria-current={i === current ? 'step' : undefined}
                disabled={i > furthest || i === current}
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
            <Button variant="tertiary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {current > 0 && <Button onClick={() => goTo(current - 1)}>Back</Button>}
          <Button variant="primary" loading={busy} onClick={next}>
            {isLast ? finishLabel : active.optional ? 'Next (or skip)' : 'Next'}
          </Button>
        </div>
      </div>
    </section>
  );
}
