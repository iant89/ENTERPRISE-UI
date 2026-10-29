import { useRef, type ReactNode, type RefObject } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { Portal } from '../../utilities/Portal';
import { useId } from '../../hooks/useId';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { IconButton } from '../icon-button';
import styles from './Dialog.module.css';

export interface DialogProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called when the dialog asks to close (Escape, close button, overlay click). */
  onClose: () => void;
  /** Dialog heading — also its accessible name. */
  title: ReactNode;
  children?: ReactNode;
  /** Footer actions. Put the primary action last. */
  footer?: ReactNode;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Element to focus when opening. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Close when the backdrop is clicked. @default true */
  closeOnOverlayClick?: boolean;
  /** Close on Escape. @default true */
  closeOnEscape?: boolean;
  /** Show the × button in the header. @default true */
  showClose?: boolean;
  /** Icon shown before the title. */
  icon?: ReactNode;
  /** @internal ARIA role. */
  role?: 'dialog' | 'alertdialog';
  /** @internal tone for alert dialogs */
  tone?: 'information' | 'success' | 'warning' | 'error';
  /** Id of an element describing the dialog. */
  'aria-describedby'?: string;
  className?: string;
}

/**
 * Modal dialog. Traps focus while open, restores it to the trigger on close,
 * locks page scrolling and closes with Escape.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  initialFocusRef,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showClose = true,
  icon,
  role = 'dialog',
  tone,
  'aria-describedby': ariaDescribedBy,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId(undefined, 'dialog-title');
  const bodyId = `${titleId}-body`;
  const overlayPointerDown = useRef(false);
  useFocusTrap(dialogRef, open, { initialFocusRef });
  useScrollLock(open);

  if (!open) return null;

  return (
    <Portal>
      <div
        className={styles.overlay}
        onPointerDown={(event) => {
          overlayPointerDown.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          if (closeOnOverlayClick && overlayPointerDown.current && event.target === event.currentTarget) onClose();
        }}
      >
        <div
          ref={dialogRef}
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={ariaDescribedBy ?? (role === 'alertdialog' ? bodyId : undefined)}
          tabIndex={-1}
          className={cx(styles.dialog, styles[size], role === 'alertdialog' && styles.alert, tone && styles[tone], tone && styles.toneBar, className)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && closeOnEscape) {
              event.stopPropagation();
              onClose();
            }
          }}
        >
          <div className={styles.header}>
            {icon && (
              <span className={styles.headerIcon} aria-hidden="true">
                {icon}
              </span>
            )}
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {showClose && <IconButton icon={<X />} label="Close dialog" neutral onClick={onClose} />}
          </div>
          <div id={bodyId} className={styles.body}>
            {children}
          </div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}
