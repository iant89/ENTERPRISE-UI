import { useId, useReducer, useRef, useState, type KeyboardEvent } from 'react';
import { Button, NumberInput, Popover, Select, ToggleButton, BrokenLinkIcon, ChainLinkIcon, ResetIcon } from '@enterprise-ui/react';
import { PREVIEW_SIZE_LIMITS, PREVIEW_ZOOMS, type PreviewSize, type PreviewZoom } from '../app/workspace/layout';
import { draftErrors, draftFrom, draftToSize, sizeDraftReducer } from './previewSize';
import styles from '../app/workspace/CodeWorkspace.module.css';

export interface PreviewSizePopoverProps {
  /** The current frame size and zoom. */
  size: { width: number; height: number; zoom: PreviewZoom };
  /** Fit scale, 0–1 (for the label and the Fit option). */
  fit: number;
  onApply: (size: PreviewSize) => void;
  /** Reset to Desktop: back to the preset, Fit (clears the saved custom size). */
  onReset: () => void;
}

const zoomLabel = (z: PreviewZoom, fit: number) => (z === 'fit' ? `Fit (${Math.round(fit * 100)}%)` : `${z}%`);
const digits = (v: string | undefined) => { const n = Number((v ?? '').replace(/[^\d]/g, '')); return v && Number.isFinite(n) && /\d/.test(v) ? n : null; };

/**
 * C4 mockup 01, option (a): the "W × H · Fit (n%)" label opens Width/Height (px), an aspect-ratio
 * lock, Zoom, Reset to Desktop and Apply. Enter applies, Esc closes without change, focus returns to the label.
 */
export function PreviewSizePopover({ size, fit, onApply, onReset }: PreviewSizePopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, dispatch] = useReducer(sizeDraftReducer, size, draftFrom);
  const form = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  // Decision 1a: focus returns to the label after Apply / Reset too (Esc is handled by Popover).
  const close = () => { setOpen(false); requestAnimationFrame(() => document.getElementById(triggerId)?.focus()); };
  const errors = draftErrors(draft);
  const valid = !errors.width && !errors.height;
  const onOpenChange = (next: boolean) => {
    if (next) dispatch({ type: 'load', size });
    setOpen(next);
  };
  const apply = (d = draft) => {
    const next = draftToSize(d);
    if (!next) return;
    onApply(next);
    close();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' || (event.target as HTMLElement).closest('button, [role="combobox"], [role="listbox"]')) return;
    event.preventDefault();
    // The NumberInput commits on Enter too; read the typed values so Enter applies what is shown.
    const input = (name: string) => form.current?.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value;
    let d = draft;
    const w = digits(input('preview-width')), h = digits(input('preview-height'));
    if (w !== d.width) d = sizeDraftReducer(d, { type: 'width', value: w });
    if (h !== d.height) d = sizeDraftReducer(d, { type: 'height', value: h });
    apply(d);
  };
  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      title="Custom size"
      width={340}
      placement="bottom-end"
      trigger={
        <button type="button" id={triggerId} className={styles.fitLabel} data-testid="preview-size" aria-haspopup="dialog" aria-expanded={open} title="Change preview size">
          {size.width} × {size.height} · {zoomLabel(size.zoom, fit)}
        </button>
      }
      footer={
        <div className={styles.sizeFooter}>
          <Button size="sm" variant="tertiary" icon={<ResetIcon />} onClick={() => { onReset(); close(); }}>Reset to Desktop</Button>
          <Button size="sm" variant="primary" disabled={!valid} onClick={() => apply()}>Apply</Button>
        </div>
      }
    >
      <div ref={form} className={styles.sizeForm} onKeyDown={onKeyDown} data-testid="preview-size-form">
        <div className={styles.sizeRow}>
          <NumberInput size="sm" label="Width" name="preview-width" unit="px" value={draft.width} onChange={(v) => dispatch({ type: 'width', value: v })} error={errors.width} />
          <ToggleButton size="sm" variant="tertiary" pressed={draft.locked} onPressedChange={(p: boolean) => dispatch({ type: 'lock', locked: p })} aria-label="Lock aspect ratio" title="Lock aspect ratio">
            {draft.locked ? <ChainLinkIcon aria-hidden="true" /> : <BrokenLinkIcon aria-hidden="true" />}
          </ToggleButton>
          <NumberInput size="sm" label="Height" name="preview-height" unit="px" value={draft.height} onChange={(v) => dispatch({ type: 'height', value: v })} error={errors.height} />
        </div>
        <p className={styles.sizeHint}>{PREVIEW_SIZE_LIMITS.width[0]}–{PREVIEW_SIZE_LIMITS.width[1]} × {PREVIEW_SIZE_LIMITS.height[0]}–{PREVIEW_SIZE_LIMITS.height[1]} px. Frame scales to fit; zoom below.</p>
        <Select size="sm" label="Zoom" value={String(draft.zoom)} onChange={(v) => v && dispatch({ type: 'zoom', zoom: (v === 'fit' ? 'fit' : Number(v)) as PreviewZoom })}
          options={PREVIEW_ZOOMS.map((z) => ({ value: String(z), label: zoomLabel(z, fit) }))} />
      </div>
    </Popover>
  );
}
