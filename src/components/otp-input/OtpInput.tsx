import { forwardRef, useRef, type ClipboardEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './OtpInput.module.css';

export interface OtpInputProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  /** Visible label, e.g. "Verification code". */
  label: ReactNode;
  /** Number of characters. @default 6 */
  length?: number;
  /** Current code. Providing it makes the input controlled. */
  value?: string;
  /** Initial code when uncontrolled. @default '' */
  defaultValue?: string;
  /** Called with the code on every change. */
  onChange?: (code: string) => void;
  /** Called once every box is filled. */
  onComplete?: (code: string) => void;
  /** Allowed characters. @default 'numeric' */
  characters?: 'numeric' | 'alphanumeric';
  /** Error message; marks every box invalid. */
  error?: ReactNode;
  /** Helper text under the boxes. */
  description?: ReactNode;
  /** Disables the input. @default false */
  disabled?: boolean;
  /** Accessible name of each box. @default (i, n) => `Character ${i} of ${n}` */
  boxLabel?: (index: number, length: number) => string;
}

/**
 * One-time code entry in separate boxes: typing advances, Backspace goes back, pasting fills every
 * box, and the first box offers `autocomplete="one-time-code"` so phones can fill SMS codes.
 */
export const OtpInput = forwardRef<HTMLFieldSetElement, OtpInputProps>(function OtpInput(
  { label, length = 6, value, defaultValue = '', onChange, onComplete, characters = 'numeric', error, description, disabled = false, boxLabel = (i, n) => `Character ${i} of ${n}`, className, ...rest },
  ref,
) {
  const id = useId(undefined, 'otp');
  const [code, setCode] = useControllableState(value, defaultValue, onChange);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const allowed = characters === 'numeric' ? /\d/ : /[a-z\d]/i;
  const chars = Array.from({ length }, (_, i) => code[i] ?? '');

  const update = (next: string) => {
    const clean = [...next].filter((c) => allowed.test(c)).join('').slice(0, length).toUpperCase();
    setCode(clean);
    if (clean.length === length && code.length !== length) onComplete?.(clean);
    return clean;
  };

  const focusBox = (i: number) => inputs.current[Math.max(0, Math.min(i, length - 1))]?.focus();

  const onInput = (i: number, text: string) => {
    const typed = [...text].filter((c) => allowed.test(c));
    if (!typed.length) return;
    // Replace from this box onward (handles fast typing and SMS autofill into one box).
    const next = update(chars.slice(0, i).join('') + typed.join('') + chars.slice(i + typed.length).join(''));
    focusBox(Math.min(i + typed.length, next.length, length - 1));
  };

  const onKeyDown = (i: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (chars[i]) update(chars.slice(0, i).join('') + chars.slice(i + 1).join(''));
      else if (i > 0) {
        update(chars.slice(0, i - 1).join('') + chars.slice(i).join(''));
        focusBox(i - 1);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(i - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(i + 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const next = update(event.clipboardData.getData('text'));
    focusBox(next.length);
  };

  return (
    <fieldset ref={ref} className={cx(styles.root, className)} disabled={disabled} aria-describedby={[description ? `${id}-desc` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined} {...rest}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.boxes}>
        {chars.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            className={cx(styles.box, error ? styles.invalid : undefined)}
            value={c}
            inputMode={characters === 'numeric' ? 'numeric' : 'text'}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={boxLabel(i + 1, length)}
            aria-invalid={error ? true : undefined}
            maxLength={length}
            onChange={(e) => onInput(i, e.target.value.replace(c, '') || e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      {description && (
        <p id={`${id}-desc`} className={styles.description}>
          {description}
        </p>
      )}
      <p id={`${id}-error`} className={styles.error} aria-live="polite">
        {error}
      </p>
    </fieldset>
  );
});
