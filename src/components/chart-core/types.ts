import type { Tone } from '../../utilities/types';

/** One measure plotted by a cartesian chart. */
export interface ChartSeries {
  /** Field of each datum that holds this series' value. */
  key: string;
  /** Display name used in the legend, tooltip and data table. */
  label: string;
  /** Overrides the categorical color. Prefer the default fixed order. */
  color?: string;
}

/** A row of chart data: a category field plus one numeric field per series. */
export type ChartDatum = Record<string, string | number | null | undefined>;

/** A horizontal (or, for horizontal bars, vertical) line such as a target or threshold. */
export interface ChartReferenceLine {
  /** Position on the value axis. */
  value: number;
  /** Short label drawn next to the line and listed in the legend. */
  label: string;
  /** Status color for the line. @default 'neutral' */
  tone?: Tone;
}

/** Reads a numeric value from a datum; non-numbers become `null` (a gap). */
export function valueOf(datum: ChartDatum, key: string): number | null {
  const v = datum[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
