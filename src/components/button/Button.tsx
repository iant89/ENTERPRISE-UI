import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { Spinner } from '../spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual emphasis. Use one `primary` action per area; `destructive` for
   * irreversible actions.
   * @default 'secondary'
   */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
  /** Icon rendered before the label. */
  icon?: ReactNode;
  /** Icon rendered after the label. */
  iconEnd?: ReactNode;
  /** Decorative badge; include meaningful badge information in the button accessible name. */
  badge?: ReactNode;
  /** Shows a spinner and marks the button busy; clicks are ignored. @default false */
  loading?: boolean;
  /** Stretch to the container width. @default false */
  fullWidth?: boolean;
  /** Use neutral (grey) colours instead of the brand colour. @default false */
  neutral?: boolean;
  /** @default 'button' */
  type?: 'button' | 'submit' | 'reset';
}

/** Triggers an action. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    icon,
    iconEnd,
    badge,
    loading = false,
    fullWidth = false,
    neutral = false,
    type = 'button',
    className,
    children,
    disabled,
    onClick,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        size !== 'md' && styles[size],
        fullWidth && styles.fullWidth,
        neutral && styles.neutral,
        loading && styles.loading,
        className,
      )}
      disabled={disabled}
      aria-busy={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" decorative inheritColor />
      ) : (
        icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )
      )}
      {children != null && children !== false && <span className={styles.label}>{children}</span>}
      {badge}
      {iconEnd && (
        <span className={styles.icon} aria-hidden="true">
          {iconEnd}
        </span>
      )}
    </button>
  );
});

