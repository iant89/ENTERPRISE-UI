import { forwardRef, useEffect, useRef, useState } from 'react';
import { Button, type ButtonProps } from '../button';

export interface CopyButtonMessages {
  copied: string;
  failed: string;
  clipboardUnavailable: string;
}
const defaultMessages: CopyButtonMessages = { copied: 'Copied.', failed: 'Could not copy.', clipboardUnavailable: 'Clipboard access is unavailable.' };

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  value: string;
  /** Override clipboard access for applications or tests. */
  copy?: (value: string) => Promise<void>;
  label?: string;
  /** Overrides success, failure and clipboard-unavailable messages. */
  messages?: Partial<CopyButtonMessages>;
  onCopied?: () => void;
  onError?: (error: unknown) => void;
}
/** Copies text with a visible and politely announced success or failure. */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton({ value, copy, label = 'Copy', messages, onCopied, onError, ...props }, ref) {
  const [status, setStatus] = useState('');
  const text = { ...defaultMessages, ...messages };
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const run = async () => {
    if (lock.current) return;
    lock.current = true; setStatus('');
    try {
      if (copy) await copy(value);
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else throw new Error(text.clipboardUnavailable);
      if (mounted.current) setStatus(text.copied);
    } catch (error) { if (mounted.current) setStatus(text.failed); onError?.(error); return; }
    finally { lock.current = false; }
    onCopied?.();
  };
  return <span><Button {...props} ref={ref} onClick={() => void run()}>{label}</Button><span role="status"> {status}</span></span>;
});
