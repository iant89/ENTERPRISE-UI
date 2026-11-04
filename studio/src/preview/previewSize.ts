/** Code Studio C4 (decisions 1a–3a): the custom preview size popover's draft state, pure. */
import { PREVIEW_SIZE_LIMITS, validPreviewDim, VIEWPORTS, type PreviewSize, type PreviewZoom } from '../app/workspace/layout';

export interface SizeDraft { width: number | null; height: number | null; zoom: PreviewZoom; locked: boolean; /** width / height when locked. */ ratio: number }
export type SizeDraftAction =
  | { type: 'width'; value: number | null }
  | { type: 'height'; value: number | null }
  | { type: 'zoom'; zoom: PreviewZoom }
  | { type: 'lock'; locked: boolean }
  | { type: 'reset' }
  | { type: 'load'; size: { width: number; height: number; zoom?: PreviewZoom } };

export const draftFrom = (size: { width: number; height: number; zoom?: PreviewZoom }): SizeDraft =>
  ({ width: size.width, height: size.height, zoom: size.zoom ?? 'fit', locked: false, ratio: size.width / size.height });

export function sizeDraftReducer(d: SizeDraft, a: SizeDraftAction): SizeDraft {
  switch (a.type) {
    case 'width': return { ...d, width: a.value, height: d.locked && a.value != null ? Math.round(a.value / d.ratio) : d.height };
    case 'height': return { ...d, height: a.value, width: d.locked && a.value != null ? Math.round(a.value * d.ratio) : d.width };
    case 'zoom': return { ...d, zoom: a.zoom };
    case 'lock': return { ...d, locked: a.locked, ratio: a.locked && d.width && d.height ? d.width / d.height : d.ratio };
    case 'load': return { ...draftFrom(a.size), locked: d.locked };
    case 'reset': return { ...draftFrom(VIEWPORTS.desktop), locked: d.locked };
  }
}

const limitText = (key: 'width' | 'height') => `${PREVIEW_SIZE_LIMITS[key][0]}–${PREVIEW_SIZE_LIMITS[key][1]} px`;
/** Inline validation (decision 2a). */
export function draftErrors(d: SizeDraft): { width?: string; height?: string } {
  const out: { width?: string; height?: string } = {};
  if (d.width == null || !validPreviewDim('width', d.width)) out.width = `Width must be ${limitText('width')}.`;
  if (d.height == null || !validPreviewDim('height', d.height)) out.height = `Height must be ${limitText('height')}.`;
  return out;
}
export const draftToSize = (d: SizeDraft): PreviewSize | null =>
  (Object.keys(draftErrors(d)).length ? null : { width: d.width!, height: d.height!, zoom: d.zoom });

/** The frame scale for a zoom: Fit never upscales; fixed zooms are exact. */
export const zoomScale = (zoom: PreviewZoom, fit: number) => (zoom === 'fit' ? fit : zoom / 100);
