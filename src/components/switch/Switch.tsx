import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './Switch.module.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'checked' | 'defaultChecked'> {
  /** Visible label of the switch. Also used as its accessible name. */
  label?: ReactNode;
  /** Secondary text shown below the main text. */
  description?: ReactNode;
  /** Whether the switch is on. Providing it makes it controlled. */
  checked?: boolean;
  /** @default false */
  /** Whether the switch is on initially when it is uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the new checked state when the user toggles the switch. */
  onChange?: (checked: boolean) => void;
  /** Place the label before the switch. @default 'end' */
  labelPlacement?: 'start' | 'end';
  /** Show On/Off text next to the track. @default false */
  showStateText?: boolean;
}

/** An on/off toggle that takes effect immediately (`role="switch"`). */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, checked, defaultChecked = false, onChange, labelPlacement = 'end', showStateText = false, disabled, id: providedId, className, ...rest },
  ref,
) {
  const id = useId(providedId, 'switch');
  const [isOn, setOn] = useControllableState(checked, defaultChecked, onChange);
  const descriptionId = description ? `${id}-description` : undefined;
  return (
    <label htmlFor={id} className={cx(styles.root, labelPlacement === 'start' && styles.labelStart, disabled && styles.disabled, className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={isOn}
        aria-checked={isOn}
        disabled={disabled}
        aria-describedby={descriptionId}
        onChange={(event) => setOn(event.target.checked)}
        {...rest}
      />
      {showStateText && (
        <span className={styles.state} aria-hidden="true">
          {isOn ? 'On' : 'Off'}
        </span>
      )}
      {(label || description) && (
        <span>
          {label}
          {description && (
            <span id={descriptionId} className={styles.description}>
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});
