import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { cx } from '../../utilities/cx';
import styles from './Stepper.module.css';

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

export interface StepperStep {
  id: string;
  label: ReactNode;
  /** Secondary text, e.g. "Optional" or a summary of what was entered. */
  description?: ReactNode;
  /** Overrides the status derived from `current`. */
  status?: StepStatus;
  /** Step cannot be clicked even when `onStepClick` is set. */
  disabled?: boolean;
}

export interface StepperLabels {
  status: Record<StepStatus, string>;
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onChange'> {
  /** Steps in order. */
  steps: StepperStep[];
  /** Index of the current step; earlier steps are complete. @default 0 */
  current?: number;
  /** Layout. Horizontal steps stack vertically on phones. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Makes completed (and errored) steps clickable, e.g. to go back. */
  onStepClick?: (index: number, step: StepperStep) => void;
  /** Overrides for the built-in strings. */
  labels?: Partial<StepperLabels>;
}

const defaultLabels: StepperLabels = { status: { complete: 'Completed', current: 'Current step', upcoming: 'Not started', error: 'Has errors' } };

/** Progress through a sequence of steps, outside of a full Wizard (e.g. order status, onboarding). */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current = 0, orientation = 'horizontal', onStepClick, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { status: { ...defaultLabels.status, ...labelOverrides?.status } };
  return (
    <ol ref={ref} className={cx(styles.stepper, styles[orientation], className)} {...rest}>
      {steps.map((step, i) => {
        const status: StepStatus = step.status ?? (i < current ? 'complete' : i === current ? 'current' : 'upcoming');
        const clickable = !!onStepClick && !step.disabled && (status === 'complete' || status === 'error');
        const marker = status === 'complete' ? <Check aria-hidden="true" /> : status === 'error' ? <AlertTriangle aria-hidden="true" /> : <span aria-hidden="true">{i + 1}</span>;
        const body = (
          <>
            <span className={styles.marker}>{marker}</span>
            <span className={styles.text}>
              <span className={styles.label}>{step.label}</span>
              {step.description && <span className={styles.description}>{step.description}</span>}
              <span className="eui-visually-hidden">, {labels.status[status]}</span>
            </span>
          </>
        );
        return (
          <li key={step.id} className={cx(styles.step, styles[status])} aria-current={status === 'current' ? 'step' : undefined}>
            {clickable ? (
              <button type="button" className={styles.button} onClick={() => onStepClick!(i, step)}>
                {body}
              </button>
            ) : (
              <span className={styles.static}>{body}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
});
