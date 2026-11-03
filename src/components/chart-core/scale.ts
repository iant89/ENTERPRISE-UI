/** Linear scales and "nice" tick generation shared by the cartesian charts. */

export interface LinearScale {
  (value: number): number;
  domain: [number, number];
  ticks: number[];
}

/** Rounds a step to 1, 2, 2.5 or 5 × 10ⁿ so axis labels read cleanly. */
function niceStep(span: number, count: number): number {
  const raw = span / Math.max(count, 1);
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

/**
 * Builds a linear scale whose domain is widened to whole tick steps. Zero is always included
 * so bar lengths stay honest; pass `includeZero: false` for lines that should zoom in.
 */
export function linearScale(
  values: number[],
  range: [number, number],
  { tickCount = 5, includeZero = true, domain }: { tickCount?: number; includeZero?: boolean; domain?: [number?, number?] } = {},
): LinearScale {
  const finite = values.filter((v) => Number.isFinite(v));
  let lo = domain?.[0] ?? (finite.length ? Math.min(...finite) : 0);
  let hi = domain?.[1] ?? (finite.length ? Math.max(...finite) : 1);
  if (includeZero && domain?.[0] === undefined) lo = Math.min(lo, 0);
  if (includeZero && domain?.[1] === undefined) hi = Math.max(hi, 0);
  if (lo === hi) {
    hi = lo + 1;
    if (lo > 0 && includeZero) lo = 0;
  }
  const step = niceStep(hi - lo, tickCount);
  const niceLo = domain?.[0] ?? Math.floor(lo / step) * step;
  const niceHi = domain?.[1] ?? Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  // Accumulate by index to avoid floating point drift (0.1 + 0.2 …).
  for (let i = 0; ; i++) {
    const t = Math.round((Math.ceil(niceLo / step) * step + i * step) * 1e10) / 1e10;
    if (t > niceHi + step / 1e6) break;
    ticks.push(t);
    if (i > 50) break;
  }
  const [r0, r1] = range;
  const span = niceHi - niceLo || 1;
  const scale = ((value: number) => r0 + ((value - niceLo) / span) * (r1 - r0)) as LinearScale;
  scale.domain = [niceLo, niceHi];
  scale.ticks = ticks;
  return scale;
}

/** Band scale: the start offset and width of each category slot. */
export function bandScale(count: number, [r0, r1]: [number, number], padding = 0.25) {
  const step = (r1 - r0) / Math.max(count, 1);
  const bandwidth = step * (1 - padding);
  return {
    step,
    bandwidth,
    start: (index: number) => r0 + index * step + (step - bandwidth) / 2,
    center: (index: number) => r0 + index * step + step / 2,
  };
}

/** Rough text width in px for 12px UI text; good enough for collision avoidance without layout reads. */
export const estimateTextWidth = (text: string, fontSize = 12) => text.length * fontSize * 0.58;

/** Shortens text to a pixel budget with an ellipsis. */
export function truncate(text: string, maxWidth: number, fontSize = 12): string {
  if (estimateTextWidth(text, fontSize) <= maxWidth) return text;
  const chars = Math.max(1, Math.floor(maxWidth / (fontSize * 0.58)) - 1);
  return `${text.slice(0, chars)}…`;
}
