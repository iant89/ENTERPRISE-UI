import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { IconButton } from '../icon-button';
import styles from './MessageStrip.module.css';
import alertSvg from '../../assets/icons/alert.svg?raw';
import declineSvg from '../../assets/icons/decline.svg?raw';
import messageErrorSvg from '../../assets/icons/message-error.svg?raw';
import messageInformationSvg from '../../assets/icons/message-information.svg?raw';
import messageSuccessSvg from '../../assets/icons/message-success.svg?raw';
import warning2Svg from '../../assets/icons/warning2.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

const ICON_SVGS: Record<string, string> = { 'alert': alertSvg, 'message-error': messageErrorSvg, 'message-information': messageInformationSvg, 'message-success': messageSuccessSvg, 'warning2': warning2Svg };

export interface MessageStripProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** @default 'information' */
  /** Semantic tone that sets the color and icon. */
  tone?: Tone;
  /** Bold lead-in text. */
  title?: ReactNode;
  /** Content rendered inside the message strip. */
  children?: ReactNode;
  /** Show a close button. @default false */
  dismissible?: boolean;
  /** Called when the user dismisses the message. A close button is shown only when this is set. */
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

const ICONS = { neutral: 'message-information', information: 'message-information', success: 'message-success', warning: 'warning2', error: 'message-error' } as const;
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
          {svgIcon(ICON_SVGS[Icon], Icon)}
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
          icon={svgIcon(declineSvg, 'decline')}
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
