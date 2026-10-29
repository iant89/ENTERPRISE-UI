import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { Spinner } from '../spinner';
import type { ButtonSize, ButtonVariant } from '../button';
import styles from '../button/Button.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The icon to display. */
  icon: ReactNode;
  /** Accessible name — required because the button has no visible text. Also shown as a native tooltip. */
  label: string;
  /** @default 'tertiary' */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
  /** @default false */
  loading?: boolean;
  /** Use neutral (grey) colours. @default false */
  neutral?: boolean;
  /** Hide the native `title` tooltip (e.g. when wrapped in a Tooltip). @default false */
  hideTitle?: boolean;
}

/** A square, icon-only button. Always provide `label` for assistive technology. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = 'tertiary', size = 'md', loading = false, neutral = false, hideTitle = false, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={hideTitle ? undefined : label}
      aria-busy={loading || undefined}
      className={cx(styles.button, styles[variant], styles.iconOnly, size !== 'md' && styles[size], neutral && styles.neutral, className)}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {loading ? <Spinner size="sm" decorative inheritColor /> : icon}
      </span>
    </button>
  );
});
