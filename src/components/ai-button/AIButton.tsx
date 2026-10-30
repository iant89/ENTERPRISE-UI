import { forwardRef, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { Button, type ButtonProps } from '../button';
import styles from './AIButton.module.css';

/** A named visual state of an AIButton (replaces UI5 `ButtonState`). */
export interface AIButtonState {
  name: string;
  label: string;
  icon?: ReactNode;
  endIcon?: ReactNode;
  /** Marks a working state: the button is announced as busy. */
  busy?: boolean;
}

export interface AIButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'iconEnd' | 'loading'> {
  /** Available states. */
  states: AIButtonState[];
  /** Name of the current state; the application drives transitions. */
  state: string;
}

/** A button for AI-assisted actions whose label and icon follow application-driven states (Generate → Generating… → Revise). */
export const AIButton = forwardRef<HTMLButtonElement, AIButtonProps>(function AIButton({ states, state, className, variant = 'secondary', ...rest }, ref) {
  const current = states.find((s) => s.name === state) ?? states[0];
  return (
    <span className={styles.wrap}>
      <Button
        ref={ref}
        variant={variant}
        className={cx(styles.button, current?.busy && styles.busy, className)}
        icon={current?.icon ?? <Sparkles />}
        iconEnd={current?.endIcon}
        aria-busy={current?.busy || undefined}
        {...rest}
      >
        {current?.label}
      </Button>
      <span className={styles.live} role="status">{current?.busy ? current.label : ''}</span>
    </span>
  );
});
