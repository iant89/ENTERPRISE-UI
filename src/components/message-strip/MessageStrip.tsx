import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { IconButton } from '../icon-button';
import styles from './MessageStrip.module.css';

export interface MessageStripProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** @default 'information' */
  tone?: Tone;
  /** Bold lead-in text. */
  title?: ReactNode;
  children?: ReactNode;
  /** Show a close button. @default false */
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Action elements (e.g. a tertiary Button or link). */
  actions?: ReactNode;
  /** Hide the status icon. @default false */
  hideIcon?: boolean;
  /**
   * Announce the message when it appears: `polite` uses `role="status"`,
   * `assertive` uses `role="alert"`, `off` no live region.
   * @default 'off'
   */
  announce?: 'off' | 'polite' | 'assertive';
}

const ICONS = { neutral: Info, information: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle } as const;
const PREFIX: Record<Tone, string> = { neutral: '', information: 'Information', success: 'Success', warning: 'Warning', error: 'Error' };

/** Inline message about the current page or section. */
export const MessageStrip = forwardRef<HTMLDivElement, MessageStripProps>(function MessageStrip(
  { tone = 'information', title, children, dismissible = false, onDismiss, actions, hideIcon = false, announce = 'off', className, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const Icon = ICONS[tone];
  const role = announce === 'assertive' ? 'alert' : announce === 'polite' ? 'status' : undefined;
  return (
    <div ref={ref} role={role} className={cx(styles.strip, styles[tone], className)} {...rest}>
      {!hideIcon && (
        <span className={styles.icon} aria-hidden="true">
          <Icon />
        </span>
      )}
      <div className={styles.content}>
        {PREFIX[tone] && <span className="eui-visually-hidden">{PREFIX[tone]}:</span>}
        {PREFIX[tone] && ' '}
        {title && <span className={styles.title}>{title}</span>}
        {children}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
      {dismissible && (
        <IconButton
          className={styles.close}
          icon={<X />}
          label="Dismiss message"
          size="sm"
          neutral
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
        />
      )}
    </div>
  );
});
