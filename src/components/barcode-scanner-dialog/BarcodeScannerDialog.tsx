import { forwardRef, useEffect, useRef, useState, type FormEvent } from 'react';
import { cx } from '../../utilities/cx';
import { Dialog } from '../dialog';
import { Button } from '../button';
import { Input } from '../input';
import { MessageStrip } from '../message-strip';
import { allBarcodeFormats, createDefaultBarcodeDecoder, type BarcodeDecoder, type BarcodeFormat } from './barcodeDecoder';
import styles from './BarcodeScannerDialog.module.css';

export type BarcodeScanErrorKind = 'insecure-context' | 'unsupported' | 'permission-denied' | 'no-camera' | 'camera-error' | 'decoder-error';

export interface BarcodeScanError { kind: BarcodeScanErrorKind; message: string; cause?: unknown }

export interface BarcodeScannerDialogLabels {
  title: string;
  preview: string;
  instructions: string;
  starting: string;
  close: string;
  manualEntry: string;
  manualSubmit: string;
  retry: string;
  errors: Record<BarcodeScanErrorKind, string>;
}

const defaultLabels: BarcodeScannerDialogLabels = {
  title: 'Scan barcode',
  preview: 'Camera preview',
  instructions: 'Point the camera at a barcode.',
  starting: 'Starting camera…',
  close: 'Close',
  manualEntry: 'Or enter the code manually',
  manualSubmit: 'Use code',
  retry: 'Try again',
  errors: {
    'insecure-context': 'The camera is only available on secure (HTTPS) pages.',
    unsupported: 'This browser does not support camera access.',
    'permission-denied': 'Camera access was denied. Allow camera access in your browser settings and try again.',
    'no-camera': 'No camera was found on this device.',
    'camera-error': 'The camera could not be started. It may be in use by another application.',
    'decoder-error': 'Barcodes cannot be read in this browser.',
  },
};

export interface BarcodeScannerDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called once per scan with the decoded text and format (`'manual'` for typed entry). Scanning stops; close the dialog from here. */
  onScanSuccess: (text: string, format: BarcodeFormat | 'manual') => void;
  onScanError?: (error: BarcodeScanError) => void;
  /** Formats to recognize. @default all supported formats */
  formats?: BarcodeFormat[];
  /** Offer a text field when scanning is impossible or inconvenient. @default true */
  allowManualEntry?: boolean;
  /** Milliseconds between decode attempts. @default 150 */
  scanInterval?: number;
  /** Override decoding (custom decoders or tests). Defaults to native BarcodeDetector with a lazily loaded zxing fallback. */
  createDecoder?: (formats: BarcodeFormat[]) => Promise<BarcodeDecoder>;
  /** Localized text. */
  labels?: Partial<Omit<BarcodeScannerDialogLabels, 'errors'>> & { errors?: Partial<BarcodeScannerDialogLabels['errors']> };
  className?: string;
}

function classify(error: unknown): BarcodeScanErrorKind {
  const name = (error as { name?: string } | null)?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'permission-denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') return 'no-camera';
  return 'camera-error';
}

/**
 * Scans a barcode with the device camera (rear camera preferred) inside a modal dialog.
 * The stream stops on success, close and unmount. The ref targets the dialog's content root.
 */
export const BarcodeScannerDialog = forwardRef<HTMLDivElement, BarcodeScannerDialogProps>(function BarcodeScannerDialog(
  { open, onClose, onScanSuccess, onScanError, formats = allBarcodeFormats, allowManualEntry = true, scanInterval = 150, createDecoder = createDefaultBarcodeDecoder, labels, className },
  ref,
) {
  const text = { ...defaultLabels, ...labels, errors: { ...defaultLabels.errors, ...labels?.errors } };
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'starting' | 'scanning' | 'error' | 'done'>('starting');
  const [error, setError] = useState<BarcodeScanError | null>(null);
  const [manual, setManual] = useState('');
  const [attempt, setAttempt] = useState(0);
  const callbacks = useRef({ onScanSuccess, onScanError, createDecoder });
  callbacks.current = { onScanSuccess, onScanError, createDecoder };
  const formatKey = formats.join(',');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => { if (timer) clearTimeout(timer); stream?.getTracks().forEach((t) => t.stop()); stream = null; if (video.current) video.current.srcObject = null; };
    const fail = (kind: BarcodeScanErrorKind, cause?: unknown) => {
      if (cancelled) return;
      stop();
      const e = { kind, message: defaultLabels.errors[kind], cause };
      setError(e); setStatus('error');
      callbacks.current.onScanError?.(e);
    };
    setStatus('starting'); setError(null);
    (async () => {
      if (typeof window !== 'undefined' && window.isSecureContext === false) return fail('insecure-context');
      if (!navigator.mediaDevices?.getUserMedia) return fail('unsupported');
      let decoder: BarcodeDecoder;
      try { decoder = await callbacks.current.createDecoder(formatKey.split(',') as BarcodeFormat[]); } catch (e) { return fail('decoder-error', e); }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch (e) { return fail(classify(e), e); }
      if (cancelled) return stop();
      const el = video.current;
      if (el) { el.srcObject = stream; try { await el.play(); } catch { /* autoplay may be deferred; frames still arrive */ } }
      if (cancelled) return stop();
      setStatus('scanning');
      const tick = async () => {
        if (cancelled || !video.current) return;
        try {
          const result = await decoder.detect(video.current);
          if (cancelled) return;
          if (result) { stop(); setStatus('done'); callbacks.current.onScanSuccess(result.text, result.format); return; }
        } catch (e) { return fail('decoder-error', e); }
        timer = setTimeout(tick, scanInterval);
      };
      timer = setTimeout(tick, 0);
    })();
    return () => { cancelled = true; stop(); };
  }, [open, formatKey, scanInterval, attempt]);

  const submitManual = (event: FormEvent) => {
    event.preventDefault();
    const value = manual.trim();
    if (!value) return;
    setManual('');
    onScanSuccess(value, 'manual');
  };

  return (
    <Dialog open={open} onClose={onClose} title={text.title} size="md" closeLabel={text.close} footer={<Button onClick={onClose}>{text.close}</Button>}>
      <div ref={ref} className={cx(styles.root, className)}>
        {status === 'error' && error ? (
          <MessageStrip tone="error">
            {text.errors[error.kind]}
          </MessageStrip>
        ) : (
          <div className={styles.viewport}>
            <video ref={video} className={styles.video} muted playsInline aria-label={text.preview} />
            <span className={styles.frame} aria-hidden="true" />
          </div>
        )}
        <p role="status" className={styles.status}>{status === 'starting' ? text.starting : status === 'scanning' ? text.instructions : ''}</p>
        {status === 'error' && error && (error.kind === 'camera-error' || error.kind === 'permission-denied') && (
          <Button onClick={() => setAttempt((n) => n + 1)}>{text.retry}</Button>
        )}
        {allowManualEntry && (
          <form className={styles.manual} onSubmit={submitManual}>
            <Input label={text.manualEntry} value={manual} onChange={(e) => setManual(e.target.value)} autoComplete="off" />
            <Button type="submit" disabled={!manual.trim()}>{text.manualSubmit}</Button>
          </form>
        )}
      </div>
    </Dialog>
  );
});
