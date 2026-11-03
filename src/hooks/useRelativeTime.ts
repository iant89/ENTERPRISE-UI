import { useEffect, useState } from 'react';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
];

/** Formats `date` relative to `now`, e.g. "5 minutes ago" or "now" (locale-aware). */
export function formatRelativeTime(date: Date | number, now: Date | number = Date.now(), locale?: string): string {
  const seconds = Math.round((new Date(date).getTime() - new Date(now).getTime()) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (Math.abs(seconds) < 45) return format.format(0, 'second');
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === 'second') return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, 'second');
}

/**
 * The current time, re-read every `intervalMs` while `active`. Use it to keep relative timestamps
 * ("2 minutes ago") and staleness checks current without re-rendering on every second.
 */
export function useNow(intervalMs = 15_000, active = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);
  return now;
}
