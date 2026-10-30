import { forwardRef, useId, type FieldsetHTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import { Star } from 'lucide-react';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './RatingIndicator.module.css';
export interface RatingIndicatorProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** Accessible group name. */
  label: string;
  /** Native form field name; generated when omitted. */
  name?: string;
  /** Whole-number rating; zero means no selection. */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** @default 5 */
  max?: number;
  disabled?: boolean;
  /** Non-editable but still announced. */
  readOnly?: boolean;
  /** Localized name for each choice. */
  formatLabel?: (value: number, max: number) => string;
}
/** Integer rating using a native radio group. */
export const RatingIndicator = forwardRef<HTMLFieldSetElement, RatingIndicatorProps>(function RatingIndicator({ label, name, value, defaultValue = 0, onChange, max = 5, disabled = false, readOnly = false, formatLabel = (n, total) => `${n} of ${total}`, className, ...rest }, ref) {
  const id = useId();
  const [selected, setSelected] = useControllableState(value, defaultValue, onChange);
  const count = Number.isFinite(max) ? Math.max(1, Math.min(20, Math.floor(max))) : 5;
  const rating = Number.isFinite(selected) ? Math.max(0, Math.min(count, Math.round(selected))) : 0;
  if (readOnly) return <span className={className} role="img" aria-label={`${label}: ${formatLabel(rating, count)}`}><span aria-hidden="true">{'★'.repeat(rating)}{'☆'.repeat(count - rating)}</span></span>;
  return <fieldset {...rest} ref={ref} className={cx(styles.group, className)} disabled={disabled}><legend className={styles.legend}>{label}</legend><div className={styles.options}>{Array.from({ length: count }, (_, index) => {
    const score = index + 1; return <label key={score} className={styles.option}><input className={styles.input} type="radio" name={name ?? id} value={score} checked={rating === score} aria-label={formatLabel(score, count)} onChange={() => setSelected(score)} /><Star className={score <= rating ? styles.filled : styles.empty} aria-hidden="true" /></label>;
  })}</div></fieldset>;
});
