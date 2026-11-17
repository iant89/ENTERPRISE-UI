import { forwardRef, useEffect, useRef, useState } from 'react';
import { Button, type ButtonProps } from '../button';
import { IconButton } from '../icon-button';

export interface CopyButtonMessages {
  copied: string;
  failed: string;
  clipboardUnavailable: string;
}
const defaultMessages: CopyButtonMessages = { copied: 'Copied.', failed: 'Could not copy.', clipboardUnavailable: 'Clipboard access is unavailable.' };

/** How long an icon-only button shows its check mark (or error icon) after a copy. */
const ICON_FEEDBACK_MS = 2000;

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  /** Text that is copied to the clipboard. */
  value: string;
  /** Override clipboard access for applications or tests. */
  copy?: (value: string) => Promise<void>;
  /** Accessible name and tooltip of the button. */
  label?: string;
  /** Overrides success, failure and clipboard-unavailable messages. */
  messages?: Partial<CopyButtonMessages>;
  /** Called after the text was copied to the clipboard. */
  onCopied?: () => void;
  /** Called with the error when copying fails. */
  onError?: (error: unknown) => void;
  /**
   * A square button with only the copy icon, small enough to sit inside a field
   * (an Input's `endAdornment`). `label` becomes its accessible name and native
   * tooltip; the outcome is shown by the icon (a check mark, or an error icon, for two
   * seconds) and announced to screen readers, but not written next to the button.
   * Use `onCopied` and `onError` to show a toast as well.
   * @default false
   */
  iconOnly?: boolean;
}
/** Copies text with a visible and politely announced success or failure. */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { value, copy, label = 'Copy', messages, onCopied, onError, iconOnly = false, className, ...props },
  ref,
) {
  const [status, setStatus] = useState('');
  const [outcome, setOutcome] = useState<'copied' | 'failed' | null>(null);
  const text = { ...defaultMessages, ...messages };
  const lock = useRef(false);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(timer.current); }; }, []);
  const show = (result: 'copied' | 'failed') => {
    setStatus(result === 'copied' ? text.copied : text.failed);
    setOutcome(result);
    clearTimeout(timer.current);
    if (iconOnly) timer.current = setTimeout(() => { if (mounted.current) setOutcome(null); }, ICON_FEEDBACK_MS);
  };
  const run = async () => {
    if (lock.current) return;
    lock.current = true; setStatus('');
    try {
      if (copy) await copy(value);
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else throw new Error(text.clipboardUnavailable);
      if (mounted.current) show('copied');
    } catch (error) { if (mounted.current) show('failed'); onError?.(error); return; }
    finally { lock.current = false; }
    onCopied?.();
  };
  if (iconOnly) {
    const { icon: _icon, iconEnd: _iconEnd, badge: _badge, fullWidth: _fullWidth, ...rest } = props;
    return (
      <span>
        <IconButton
          {...rest}
          className={className}
          ref={ref}
          icon={outcome === 'copied' ? 'accept' : outcome === 'failed' ? 'error' : 'copy'}
          label={label}
          onClick={() => void run()}
        />
        <span role="status" className="eui-visually-hidden">{status}</span>
      </span>
    );
  }
  return <span><Button {...props} className={className} ref={ref} onClick={() => void run()}>{label}</Button><span role="status"> {status}</span></span>;
});
