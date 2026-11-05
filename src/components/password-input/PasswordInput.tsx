import { forwardRef, useState, type ChangeEvent } from 'react';
import { useId } from '../../hooks/useId';
import { IconProvider } from '../../icons';
import { cx } from '../../utilities/cx';
import { Input, type InputProps } from '../input';
import styles from './PasswordInput.module.css';

export interface PasswordRequirement {
  /** Requirement text, e.g. "At least 12 characters". */
  label: string;
  /** Whether the password meets it. */
  test: (password: string) => boolean;
}

export interface PasswordInputLabels {
  show: string;
  hide: string;
  strength: string;
  levels: [string, string, string, string];
  met: string;
  notMet: string;
}

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'endAdornment'> {
  /** `new` for sign-up and password change (shows strength), `current` for sign-in. @default 'current' */
  purpose?: 'current' | 'new';
  /** Requirements shown as a live checklist (new passwords). */
  requirements?: PasswordRequirement[];
  /** Custom strength score 0–3. Defaults to a heuristic on length and character variety. */
  scoreStrength?: (password: string) => 0 | 1 | 2 | 3;
  /** Overrides for the built-in strings. */
  labels?: Partial<PasswordInputLabels>;
}

const defaultLabels: PasswordInputLabels = {
  show: 'Show password',
  hide: 'Hide password',
  strength: 'Password strength',
  levels: ['Weak', 'Fair', 'Good', 'Strong'],
  met: 'met',
  notMet: 'not met',
};

/** Length and variety heuristic. It is a hint only; enforce the real policy on the server. */
export function defaultPasswordScore(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d]/].filter((r) => r.test(password)).length;
  const points = (password.length >= 8 ? 1 : 0) + (password.length >= 12 ? 1 : 0) + (password.length >= 16 ? 1 : 0) + (variety >= 3 ? 1 : 0) - (/^(.)\1+$/.test(password) ? 2 : 0);
  return Math.max(0, Math.min(3, points)) as 0 | 1 | 2 | 3;
}

/** A password field with a show/hide toggle and, for new passwords, a strength meter and requirement checklist. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { purpose = 'current', requirements = [], scoreStrength = defaultPasswordScore, labels: labelOverrides, value, defaultValue, onChange, description, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const [visible, setVisible] = useState(false);
  const [own, setOwn] = useState(String(defaultValue ?? ''));
  const password = value !== undefined ? String(value) : own;
  const score = scoreStrength(password);
  const isNew = purpose === 'new';
  const meterId = useId(undefined, 'password-strength');

  return (
    <div className={styles.root}>
      <Input
        ref={ref}
        {...rest}
        type={visible ? 'text' : 'password'}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        autoComplete={rest.autoComplete ?? (isNew ? 'new-password' : 'current-password')}
        spellCheck={false}
        description={description}
        aria-describedby={isNew && password ? meterId : undefined}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setOwn(event.target.value);
          onChange?.(event);
        }}
        endAdornment={
          <button type="button" className={styles.toggle} aria-pressed={visible} aria-label={visible ? labels.hide : labels.show} title={visible ? labels.hide : labels.show} onClick={() => setVisible((v) => !v)}>
            {visible ? IconProvider.getIcon('hide', { 'aria-hidden': "true" }) : IconProvider.getIcon('show', { 'aria-hidden': "true" })}
          </button>
        }
      />
      {isNew && password && (
        <div id={meterId} className={styles.meter}>
          <span className={styles.bars} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cx(styles.bar, i <= score && styles[`level${score}`])} />
            ))}
          </span>
          <span className={styles.level}>
            {labels.strength}: {labels.levels[score]}
          </span>
        </div>
      )}
      {isNew && requirements.length > 0 && (
        <ul className={styles.requirements}>
          {requirements.map((r) => {
            const met = r.test(password);
            return (
              <li key={r.label} className={cx(styles.requirement, met && styles.met)}>
                {met ? IconProvider.getIcon('accept', { 'aria-hidden': "true" }) : IconProvider.getIcon('decline', { 'aria-hidden': "true" })}
                <span>{r.label}</span>
                <span className="eui-visually-hidden">: {met ? labels.met : labels.notMet}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
