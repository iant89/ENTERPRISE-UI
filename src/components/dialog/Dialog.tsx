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
  /** Content rendered inside the dialog. */
  children?: ReactNode;
  /** Footer actions. Put the primary action last. */
  footer?: ReactNode;
  /** @default 'md' */
  /** Size of the dialog. */
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
  /** ARIA role. Use `alertdialog` for urgent messages that require a response. */
  role?: 'dialog' | 'alertdialog';
  /** @internal tone for alert dialogs */
  /** Semantic tone that adds a matching icon and header accent. The title should still convey the meaning. */
  tone?: 'information' | 'success' | 'warning' | 'error';
  /** Id of an element describing the dialog. */
  'aria-describedby'?: string;
  /** Accessible label for the close button. @default "Close dialog" */
  closeLabel?: string;
  /** Direction and language for dialog content, including its portal. */
  dir?: 'ltr' | 'rtl' | 'auto';
  /** BCP 47 language tag for the text, so screen readers pronounce it correctly. */
  lang?: string;
  /** Additional CSS class names for the root element. */
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
  closeLabel = 'Close dialog',
  dir,
  lang,
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
        dir={dir}
        lang={lang}
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
            {showClose && <IconButton icon={<X />} label={closeLabel} neutral onClick={onClose} />}
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
