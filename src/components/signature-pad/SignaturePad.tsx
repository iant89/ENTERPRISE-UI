import { forwardRef, useCallback, useEffect, useRef, useState, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react';
import { Eraser, Undo2 } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { Button } from '../button';
import { SegmentedButton } from '../segmented-button';
import styles from './SignaturePad.module.css';

export interface SignatureValue {
  /** PNG data URL of the signature, or `null` when empty. */
  dataUrl: string | null;
  /** How the signature was given. */
  method: 'draw' | 'type';
  /** The typed name (type method). */
  typedName?: string;
}

export interface SignaturePadLabels {
  method: string;
  draw: string;
  type: string;
  canvas: string;
  typedName: string;
  clear: string;
  undo: string;
  empty: string;
  signed: string;
}

export interface SignaturePadProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  /** Legend, e.g. "Signature of the approver". */
  label: ReactNode;
  /** Called after every stroke, undo, clear or typed change. */
  onChange?: (value: SignatureValue) => void;
  /** Drawing height in pixels. @default 160 */
  height?: number;
  /** Font stack used to render typed signatures. @default a cursive stack */
  typedFont?: string;
  /** Helper text, e.g. legal wording. */
  description?: ReactNode;
  /** Error message. */
  error?: ReactNode;
  /** Disables signing. @default false */
  disabled?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<SignaturePadLabels>;
}

const defaultLabels: SignaturePadLabels = {
  method: 'Signature method',
  draw: 'Draw',
  type: 'Type',
  canvas: 'Signature drawing area. Draw with a mouse, pen or finger, or choose Type to type your name.',
  typedName: 'Full name',
  clear: 'Clear',
  undo: 'Undo stroke',
  empty: 'Not signed',
  signed: 'Signed',
};

type Point = [number, number];

/**
 * Captures a handwritten signature with mouse, pen or touch, with a typed-name alternative for
 * keyboard and switch users (WCAG 2.1.1, 2.5.1). Reports a PNG data URL.
 */
export const SignaturePad = forwardRef<HTMLFieldSetElement, SignaturePadProps>(function SignaturePad(
  { label, onChange, height = 160, typedFont = '"Segoe Script", "Brush Script MT", "Snell Roundhand", cursive', description, error, disabled = false, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const id = useId(undefined, 'signature');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [method, setMethod] = useState<'draw' | 'type'>('draw');
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [typed, setTyped] = useState('');
  const drawing = useRef<Point[] | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const paint = useCallback(
    (all: Point[][], name: string, mode: 'draw' | 'type') => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext?.('2d');
      if (!canvas || !ctx) return;
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 480;
      if (canvas.width !== width * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const ink = getComputedStyle(canvas).color || '#000';
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (mode === 'type') {
        ctx.font = `${Math.round(height * 0.32)}px ${typedFont}`;
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 16, height / 2, width - 32);
        return;
      }
      for (const stroke of all) {
        ctx.beginPath();
        stroke.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y);
          else {
            // Quadratic smoothing through midpoints.
            const [px, py] = stroke[i - 1];
            ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
          }
        });
        if (stroke.length === 1) ctx.arc(stroke[0][0], stroke[0][1], 1.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    [height, typedFont],
  );

  const report = (all: Point[][], name: string, mode: 'draw' | 'type') => {
    const empty = mode === 'draw' ? all.length === 0 : name.trim() === '';
    let dataUrl: string | null;
    try {
      dataUrl = empty ? null : canvasRef.current?.toDataURL('image/png') ?? null;
    } catch {
      // jsdom and tainted canvases cannot export.
      dataUrl = null;
    }
    onChangeRef.current?.({ dataUrl, method: mode, typedName: mode === 'type' ? name : undefined });
  };

  useEffect(() => {
    paint(strokes, typed, method);
  }, [paint, strokes, typed, method]);

  const point = (e: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const signed = method === 'draw' ? strokes.length > 0 : typed.trim() !== '';

  return (
    <fieldset ref={ref} className={cx(styles.root, className)} disabled={disabled} aria-describedby={[description ? `${id}-desc` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined} {...rest}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.bar}>
        <SegmentedButton
          aria-label={labels.method}
          size="sm"
          items={[{ value: 'draw', label: labels.draw }, { value: 'type', label: labels.type }]}
          value={[method]}
          onChange={(v) => {
            const next = (v[0] as 'draw' | 'type') ?? method;
            setMethod(next);
            requestAnimationFrame(() => report(strokes, typed, next));
          }}
        />
        <span className={styles.state} aria-live="polite">
          {signed ? labels.signed : labels.empty}
        </span>
      </div>
      {method === 'type' && (
        <label className={styles.typed}>
          <span>{labels.typedName}</span>
          <input
            className={styles.typedInput}
            value={typed}
            autoComplete="name"
            onChange={(e) => {
              setTyped(e.target.value);
              requestAnimationFrame(() => report(strokes, e.target.value, 'type'));
            }}
          />
        </label>
      )}
      <canvas
        ref={canvasRef}
        className={cx(styles.canvas, error ? styles.invalid : undefined, method === 'type' && styles.preview)}
        style={{ height }}
        role="img"
        aria-label={method === 'draw' ? labels.canvas : `${labels.typedName}: ${typed}`}
        onPointerDown={(e) => {
          if (method !== 'draw' || disabled) return;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          drawing.current = [point(e)];
          setStrokes((s) => [...s, drawing.current!]);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          drawing.current.push(point(e));
          paint([...strokes.slice(0, -1), drawing.current], typed, method);
        }}
        onPointerUp={() => {
          if (!drawing.current) return;
          const done = [...strokes.slice(0, -1), drawing.current];
          drawing.current = null;
          setStrokes(done);
          requestAnimationFrame(() => report(done, typed, 'draw'));
        }}
      />
      <div className={styles.actions}>
        {method === 'draw' && (
          <Button
            size="sm"
            variant="tertiary"
            icon={<Undo2 />}
            disabled={!strokes.length}
            onClick={() => {
              const next = strokes.slice(0, -1);
              setStrokes(next);
              requestAnimationFrame(() => report(next, typed, 'draw'));
            }}
          >
            {labels.undo}
          </Button>
        )}
        <Button
          size="sm"
          variant="tertiary"
          icon={<Eraser />}
          disabled={!signed}
          onClick={() => {
            setStrokes([]);
            setTyped('');
            requestAnimationFrame(() => report([], '', method));
          }}
        >
          {labels.clear}
        </Button>
      </div>
      {description && (
        <p id={`${id}-desc`} className={styles.description}>
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </fieldset>
  );
});
