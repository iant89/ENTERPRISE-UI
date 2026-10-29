import { useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Button } from '../button';
import { Dialog } from '../dialog';

export interface AlertDialogProps {
  open: boolean;
  /** Called when the user cancels (Cancel button or Escape). */
  onCancel: () => void;
  /** Called when the user confirms. May return a promise; the button shows a busy state until it settles. */
  onConfirm: () => void | Promise<unknown>;
  title: ReactNode;
  /** Explain the consequence of the action. */
  children: ReactNode;
  /** @default 'Confirm' */
  confirmLabel?: string;
  /** @default 'Cancel' */
  cancelLabel?: string;
  /** `error` styles the confirm button as destructive. @default 'warning' */
  tone?: 'information' | 'success' | 'warning' | 'error';
}

const ICONS = { information: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle } as const;

/**
 * Interrupts the user to confirm an important or destructive action
 * (`role="alertdialog"`). Focus starts on the least destructive action.
 */
export function AlertDialog({ open, onCancel, onConfirm, title, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'warning' }: AlertDialogProps) {
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
      onClose={() => !busy && onCancel()}
      title={title}
      role="alertdialog"
      tone={tone}
      size="sm"
      icon={<Icon />}
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
