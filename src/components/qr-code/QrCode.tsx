import { forwardRef, useEffect, useMemo, useState, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import { Button } from '../button';
import { Dialog } from '../dialog';
import { encodeQrCode, QrCodeTooLongError, type QrCodeMatrix, type QrErrorCorrection, type QrMode } from './qrEncoder';
import styles from './QrCode.module.css';

export interface QrCodeLabels {
  /** Accessible name of the code when no `label` is given. */
  image: string;
  /** Accessible name of the button around an enlargeable code. */
  enlarge: (label: string) => string;
  /** Visible hint under an enlargeable code. */
  hint: string;
  /** Title of the dialog with the larger code. */
  dialogTitle: string;
  /** Close button of that dialog. */
  close: string;
  /** Shown in place of the code when the value does not fit. */
  tooLong: string;
}

/** What was encoded: reported through `onEncoded`. */
export interface QrCodeInfo {
  /** 1–40. */
  version: number;
  /** Modules per side, without the quiet zone. */
  modules: number;
  /** The level used (higher than requested when `boostErrorCorrection` raised it). */
  errorCorrection: QrErrorCorrection;
  mask: number;
  mode: QrMode;
}

export interface QrCodeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color' | 'onError'> {
  /** Text to encode, e.g. a URL or an `otpauth://` link. Encoded as numeric, alphanumeric or UTF-8 bytes, whichever is smallest. */
  value: string;
  /** Accessible name, e.g. "QR code for your authenticator app". Defaults to `labels.image`. */
  label?: string;
  /** How much of the code can be damaged and still scan: about 7% (L), 15% (M), 25% (Q) or 30% (H). Higher levels need more modules. @default 'M' */
  errorCorrection?: QrErrorCorrection;
  /** Raise the error-correction level when it fits in the same version (no extra size). @default false */
  boostErrorCorrection?: boolean;
  /** Width and height in CSS pixels; the code scales down to fit narrower containers. @default 192 */
  size?: number;
  /** Quiet zone around the code, in modules. Scanners expect 4; less saves space but may scan worse. @default 4 */
  margin?: number;
  /** Colour of the dark modules. Keep strong contrast with `background`: scanners need dark on light. @default '#000' */
  color?: string;
  /** Colour behind the code, including the quiet zone. @default '#fff' */
  background?: string;
  /** Smallest QR version (1–40), e.g. for a consistent size across codes. @default 1 */
  minVersion?: number;
  /** Largest QR version (1–40); longer values report `onError` and show `labels.tooLong`. @default 40 */
  maxVersion?: number;
  /** Mask pattern 0–7, or `'auto'` for the lowest-penalty mask as the standard describes. @default 'auto' */
  mask?: number | 'auto';
  /** Rounds the corners of the background tile. @default true */
  rounded?: boolean;
  /** Makes the code a button that opens a larger copy in a dialog, easier to scan from a distance. @default false */
  enlargeable?: boolean;
  /** Size of the larger copy in CSS pixels (it shrinks to fit small screens). @default 360 */
  enlargedSize?: number;
  /** Shows `labels.hint` under an enlargeable code. @default true */
  showHint?: boolean;
  /** Called with what was encoded (version, level, mask, mode). */
  onEncoded?: (info: QrCodeInfo) => void;
  /** Called when the value does not fit in `maxVersion` at the chosen level. */
  onError?: (error: QrCodeTooLongError) => void;
  /** Overrides for the built-in strings. */
  labels?: Partial<QrCodeLabels>;
}

const defaultLabels: QrCodeLabels = {
  image: 'QR code',
  enlarge: (label) => `${label}. Show it larger`,
  hint: 'Click to enlarge',
  dialogTitle: 'Scan the QR code',
  close: 'Close',
  tooLong: 'This text is too long for a QR code.',
};

/** One SVG path of 1×1 squares: small, and crisp at any size. */
function modulePath(qr: QrCodeMatrix, margin: number): string {
  let d = '';
  qr.modules.forEach((row, y) => row.forEach((dark, x) => { if (dark) d += `M${x + margin} ${y + margin}h1v1h-1z`; }));
  return d;
}

function QrSvg({ qr, margin, size, color, background, rounded, label, className }: {
  qr: QrCodeMatrix; margin: number; size: number; color: string; background: string; rounded: boolean; label: string; className?: string;
}) {
  const span = qr.size + margin * 2;
  const path = useMemo(() => modulePath(qr, margin), [qr, margin]);
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${span} ${span}`}
      shapeRendering="crispEdges"
      className={cx(styles.code, rounded && styles.rounded, className)}
    >
      <rect width={span} height={span} fill={background} />
      <path d={path} fill={color} />
    </svg>
  );
}

/**
 * A QR code drawn as SVG in the browser: the value never leaves the page. Error
 * correction, size, quiet zone, colours, version range and mask are adjustable,
 * and an enlargeable code opens a larger copy in a dialog.
 */
export const QrCode = forwardRef<HTMLDivElement, QrCodeProps>(function QrCode(
  {
    value, label, errorCorrection = 'M', boostErrorCorrection = false, size = 192, margin = 4, color = '#000', background = '#fff',
    minVersion, maxVersion, mask = 'auto', rounded = true, enlargeable = false, enlargedSize = 360, showHint = true,
    onEncoded, onError, labels: labelOverrides, className, ...rest
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const name = label ?? labels.image;
  const quiet = Math.max(0, Math.round(margin));
  const [open, setOpen] = useState(false);

  const result = useMemo(() => {
    try {
      return { qr: encodeQrCode(value, { errorCorrection, boostErrorCorrection, minVersion, maxVersion, mask: mask === 'auto' ? undefined : mask }) };
    } catch (error) {
      if (error instanceof QrCodeTooLongError) return { error };
      throw error;
    }
  }, [value, errorCorrection, boostErrorCorrection, minVersion, maxVersion, mask]);

  useEffect(() => {
    if (result.qr) onEncoded?.({ version: result.qr.version, modules: result.qr.size, errorCorrection: result.qr.errorCorrection, mask: result.qr.mask, mode: result.qr.mode });
    else if (result.error) onError?.(result.error);
    // Report once per encoding, not on every render of a parent's inline callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (!result.qr) {
    return (
      <div ref={ref} className={cx(styles.root, className)} {...rest}>
        <div className={styles.error} role="img" aria-label={labels.tooLong} style={{ inlineSize: size, blockSize: size }}>
          <span aria-hidden="true">{labels.tooLong}</span>
        </div>
      </div>
    );
  }

  const svg = (s: number, extra?: string) => (
    <QrSvg qr={result.qr} margin={quiet} size={s} color={color} background={background} rounded={rounded} label={name} className={extra} />
  );

  return (
    <div ref={ref} className={cx(styles.root, className)} {...rest}>
      {enlargeable ? (
        <>
          <button type="button" className={cx(styles.button, rounded && styles.rounded)} aria-label={labels.enlarge(name)} onClick={() => setOpen(true)}>
            {svg(size)}
          </button>
          {showHint && <span className={styles.hint}>{labels.hint}</span>}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            title={labels.dialogTitle}
            size="md"
            footer={<Button variant="secondary" onClick={() => setOpen(false)}>{labels.close}</Button>}
          >
            <div className={styles.enlarged}>{svg(enlargedSize, styles.large)}</div>
          </Dialog>
        </>
      ) : svg(size)}
    </div>
  );
});
