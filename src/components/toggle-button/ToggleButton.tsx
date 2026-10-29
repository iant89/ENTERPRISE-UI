import { forwardRef } from 'react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { Button, type ButtonProps } from '../button';
import buttonStyles from '../button/Button.module.css';

export interface ToggleButtonProps extends Omit<ButtonProps, 'onChange' | 'variant'> {
  /** Controlled pressed state. */
  pressed?: boolean;
  /** Initial pressed state when uncontrolled. @default false */
  defaultPressed?: boolean;
  /** Called with the new pressed state. */
  onPressedChange?: (pressed: boolean) => void;
  /** @default 'secondary' */
  variant?: 'secondary' | 'tertiary';
}

/** A two-state button (exposes `aria-pressed`). */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
  { pressed, defaultPressed = false, onPressedChange, onClick, className, variant = 'secondary', ...rest },
  ref,
) {
  const [isPressed, setPressed] = useControllableState(pressed, defaultPressed, onPressedChange);
  return (
    <Button
      ref={ref}
      variant={variant}
      aria-pressed={isPressed}
      className={cx(isPressed && buttonStyles.pressed, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setPressed(!isPressed);
      }}
      {...rest}
    />
  );
});
