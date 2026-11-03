import type { Tone } from '../../utilities/types';

/** Number of distinct categorical hues. Further series share the neutral "other" color. */
export const CHART_HUES = 7;

/**
 * Color for the series at `index`. Hues are assigned in a fixed order and never cycled:
 * an eighth series is drawn in the neutral "other" color, so fold extra series into "Other"
 * (or use small multiples) instead of relying on color alone.
 */
export function seriesColor(index: number, override?: string): string {
  if (override) return override;
  return index < CHART_HUES ? `var(--eui-color-chart-${index + 1})` : 'var(--eui-color-chart-other)';
}

/** Semantic status colors. Reserved for state (good, critical, bad) and never used as "series 4". */
export function toneColor(tone: Tone | undefined): string {
  switch (tone) {
    case 'success':
      return 'var(--eui-color-success)';
    case 'warning':
      return 'var(--eui-color-warning)';
    case 'error':
      return 'var(--eui-color-error)';
    case 'information':
      return 'var(--eui-color-info)';
    case 'neutral':
      return 'var(--eui-color-neutral-border)';
    default:
      return 'var(--eui-color-chart-1)';
  }
}

/** Subtle background version of a status color, for qualitative ranges. */
export function toneSubtle(tone: Tone | undefined): string {
  switch (tone) {
    case 'success':
      return 'var(--eui-color-success-subtle)';
    case 'warning':
      return 'var(--eui-color-warning-subtle)';
    case 'error':
      return 'var(--eui-color-error-subtle)';
    case 'information':
      return 'var(--eui-color-info-subtle)';
    default:
      return 'var(--eui-color-neutral-subtle)';
  }
}

/**
 * Sequential ramp step: one hue from light (low) to dark (high), mixed with the surface so the
 * ramp works in every theme. `t` is 0…1.
 */
export function sequentialColor(t: number, hue = 'var(--eui-color-chart-1)'): string {
  const pct = Math.round(12 + Math.min(Math.max(t, 0), 1) * 88);
  return `color-mix(in oklab, ${hue} ${pct}%, var(--eui-color-surface))`;
}

const defaultNumber = typeof Intl !== 'undefined' ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }) : null;
const compactNumber = typeof Intl !== 'undefined' ? new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }) : null;

/** Locale-aware value formatter used when a chart has no `formatValue`. */
export const formatNumber = (value: number) => (defaultNumber ? defaultNumber.format(value) : String(value));
/** Compact formatter (1.2K, 3.4M) for axis ticks. */
export const formatCompact = (value: number) => (compactNumber ? compactNumber.format(value) : String(value));
