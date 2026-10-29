import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { clamp } from '../../utilities/format';
import { useId } from '../../hooks/useId';
import type { Tone } from '../../utilities/types';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value. Omit for an indeterminate bar. */
  value?: number;
  /** @default 100 */
  max?: number;
  /** Visible label (also the accessible name). */
  label?: ReactNode;
  /** Show the formatted value. @default true when `label` is set */
  showValue?: boolean;
  /** Formats the value text. @default percentage */
  formatValue?: (value: number, max: number) => string;
  /** @default 'information' */
  tone?: Tone;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

/** Shows progress of a task or how much of a quantity is used. */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  { value, max = 100, label, showValue, formatValue = (v, m) => `${Math.round((v / m) * 100)}%`, tone = 'information', size = 'md', className, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  const id = useId(undefined, 'progress');
  const indeterminate = value === undefined;
  const current = indeterminate ? 0 : clamp(value, 0, max);
  const text = indeterminate ? undefined : formatValue(current, max);
  const displayValue = showValue ?? label != null;
  return (
    <div ref={ref} className={cx(styles.root, size !== 'md' && styles[size], indeterminate && styles.indeterminate, tone !== 'information' && styles[tone], className)} {...rest}>
      {(label || (displayValue && text)) && (
        <div className={styles.top}>
          {label && (
            <span id={`${id}-label`} className={styles.label}>
              {label}
            </span>
          )}
          {displayValue && text && <span className={styles.value} aria-hidden="true">{text}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-label={label ? undefined : ariaLabel ?? 'Progress'}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : current}
        aria-valuetext={text}
        className={styles.track}
      >
        <div className={styles.fill} style={{ width: `${(current / max) * 100}%` }} />
      </div>
    </div>
  );
});
