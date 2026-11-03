/** Locale-aware number parsing and formatting for data entry. */

export interface NumberSymbols {
  group: string;
  decimal: string;
}

const cache = new Map<string, NumberSymbols>();

/** Grouping and decimal separators of a locale, e.g. `.` and `,` for `de-DE`. */
export function numberSymbols(locale?: string): NumberSymbols {
  const key = locale ?? '';
  const hit = cache.get(key);
  if (hit) return hit;
  const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(1234567.5);
  const symbols = {
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
  };
  cache.set(key, symbols);
  return symbols;
}

/**
 * Parses what a user typed in the locale's format. Grouping separators (including spaces, no-break
 * spaces and apostrophes) are accepted only between groups of three digits, the locale decimal
 * separator is honored, and `-`, `−` or accounting parentheses mark negatives. Returns `null` for
 * empty input and `NaN` for invalid or ambiguous input, never a guess.
 */
export function parseLocaleNumber(text: string, locale?: string): number | null {
  const { group, decimal } = numberSymbols(locale);
  let s = text.trim();
  if (s === '') return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/[−‒–]/g, '-');
  if (s.startsWith('-')) {
    negative = !negative;
    s = s.slice(1);
  } else if (s.endsWith('-')) {
    negative = !negative;
    s = s.slice(0, -1);
  }
  // Spaces of any kind are grouping separators in many locales (fr, sv, cs …).
  s = s.replace(/[\s\u00a0\u202f'\u2019]/g, '');
  const esc = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (group.trim() && s.includes(group)) {
    // Grouping must sit between groups of three digits; "1.5" in German is rejected rather than read as 15.
    const grouped = new RegExp(`^\\d{1,3}(?:${esc(group)}\\d{3})+(?:${esc(decimal)}\\d*)?$`);
    if (!grouped.test(s)) return Number.NaN;
    s = s.split(group).join('');
  }
  if (decimal !== '.') {
    if (s.includes('.')) return Number.NaN;
    s = s.replace(decimal, '.');
  }
  if (!/^\d*\.?\d*$/.test(s) || s === '' || s === '.') return Number.NaN;
  const n = Number(s);
  return negative ? -n : n;
}

/** Formats a number for display in an input, with grouping and fixed or bounded decimals. */
export function formatLocaleNumber(value: number | null | undefined, locale?: string, { minimumFractionDigits, maximumFractionDigits, useGrouping = true }: { minimumFractionDigits?: number; maximumFractionDigits?: number; useGrouping?: boolean } = {}): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits: Math.max(maximumFractionDigits ?? 20, minimumFractionDigits ?? 0),
    useGrouping,
  }).format(value);
}

/** Minor-unit digits of a currency (JPY 0, EUR 2, KWD 3). */
export function currencyDigits(currency: string, locale?: string): number {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}
