import { useRef, useState, type ReactNode } from 'react';
import { Button } from '../button';
import { Dialog } from '../dialog';
import messageErrorSvg from '../../assets/icons/message-error.svg?raw';
import messageInformationSvg from '../../assets/icons/message-information.svg?raw';
import messageSuccessSvg from '../../assets/icons/message-success.svg?raw';
import warning2Svg from '../../assets/icons/warning2.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

const ICON_SVGS: Record<string, string> = { 'message-error': messageErrorSvg, 'message-information': messageInformationSvg, 'message-success': messageSuccessSvg, 'warning2': warning2Svg };

export interface AlertDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the user cancels (Cancel button or Escape). */
  onCancel: () => void;
  /** Called when the user confirms. May return a promise; the button shows a busy state until it settles. */
  onConfirm: () => void | Promise<unknown>;
  /** Title of the dialog. It is also its accessible name. */
  title: ReactNode;
  /** Explain the consequence of the action. */
  children: ReactNode;
  /** @default 'Confirm' */
  /** Text of the confirm button. */
  confirmLabel?: string;
  /** @default 'Cancel' */
  /** Text of the cancel button. */
  cancelLabel?: string;
  /** `error` styles the confirm button as destructive. @default 'warning' */
  tone?: 'information' | 'success' | 'warning' | 'error';
  /** Direction and language for the portaled dialog. */
  dir?: 'ltr' | 'rtl' | 'auto';
  /** BCP 47 language tag for the text, so screen readers pronounce it correctly. */
  lang?: string;
}

const ICONS = { information: 'message-information', success: 'message-success', warning: 'warning2', error: 'message-error' } as const;

/**
 * Interrupts the user to confirm an important or destructive action
 * (`role="alertdialog"`). Focus starts on the least destructive action.
 */
export function AlertDialog({ open, onCancel, onConfirm, title, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'warning', dir, lang }: AlertDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const Icon = ICONS[tone];

  const confirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      dir={dir}
      lang={lang}
      onClose={() => !busy && onCancel()}
      title={title}
      role="alertdialog"
      tone={tone}
      size="sm"
      icon={svgIcon(ICON_SVGS[Icon], Icon)}
      showClose={false}
      closeOnOverlayClick={false}
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button variant={tone === 'error' ? 'destructive' : 'primary'} loading={busy} onClick={confirm}>
            {confirmLabel}
          </Button>
          <Button ref={cancelRef} variant="secondary" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
