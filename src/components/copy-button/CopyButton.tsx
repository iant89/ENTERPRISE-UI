import { useEffect, useRef, useState } from 'react';
import { Button, type ButtonProps } from '../button';

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  value: string;
  /** Override clipboard access for applications or tests. */
  copy?: (value: string) => Promise<void>;
  label?: string;
  onCopied?: () => void;
  onError?: (error: unknown) => void;
}
/** Copies text with a visible and politely announced success or failure. */
export function CopyButton({ value, copy, label = 'Copy', onCopied, onError, ...props }: CopyButtonProps) {
  const [status, setStatus] = useState('');
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const run = async () => {
    if (lock.current) return;
    lock.current = true; setStatus('');
    try {
      if (copy) await copy(value);
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else throw new Error('Clipboard access is unavailable.');
      if (mounted.current) setStatus('Copied.');
    } catch (error) { if (mounted.current) setStatus('Could not copy.'); onError?.(error); return; }
    finally { lock.current = false; }
    onCopied?.();
  };
  return <span><Button {...props} onClick={() => void run()}>{label}</Button><span role="status"> {status}</span></span>;
}
