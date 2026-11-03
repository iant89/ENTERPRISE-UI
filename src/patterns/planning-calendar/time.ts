export type PlanningView = 'day' | 'week' | 'month';

export const MINUTE = 60_000;
export const DAY = 24 * 60 * MINUTE;

export const toDate = (value: Date | string | number) => (value instanceof Date ? value : new Date(value));

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfWeek(date: Date, weekStartsOn: number): Date {
  const d = startOfDay(date);
  return addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));
}

export interface Column {
  start: Date;
  end: Date;
  weekend: boolean;
  today: boolean;
}

export interface Range {
  start: Date;
  end: Date;
  columns: Column[];
}

/** Visible range and its columns (hours for `day`, days otherwise). */
export function getRange(view: PlanningView, date: Date, opts: { weekStartsOn: number; dayStartHour: number; dayEndHour: number; now: Date }): Range {
  const today = startOfDay(opts.now).getTime();
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  if (view === 'day') {
    const day = startOfDay(date);
    const columns: Column[] = [];
    for (let h = opts.dayStartHour; h < opts.dayEndHour; h++) {
      const start = new Date(day);
      start.setHours(h);
      const end = new Date(day);
      end.setHours(h + 1);
      columns.push({ start, end, weekend: false, today: false });
    }
    return { start: columns[0].start, end: columns[columns.length - 1].end, columns };
  }
  const first = view === 'week' ? startOfWeek(date, opts.weekStartsOn) : new Date(date.getFullYear(), date.getMonth(), 1);
  const count = view === 'week' ? 7 : new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const columns = Array.from({ length: count }, (_, i) => {
    const start = addDays(first, i);
    return { start, end: addDays(first, i + 1), weekend: isWeekend(start), today: start.getTime() === today };
  });
  return { start: first, end: columns[columns.length - 1].end, columns };
}

/** Moves the anchor date by one view-length. */
export function shiftDate(view: PlanningView, date: Date, direction: 1 | -1): Date {
  if (view === 'day') return addDays(date, direction);
  if (view === 'week') return addDays(date, 7 * direction);
  const d = new Date(date.getFullYear(), date.getMonth() + direction, 1);
  return d;
}

export interface Lane<T> {
  item: T;
  lane: number;
}

/** Assigns overlapping items to lanes so they stack instead of covering each other. */
export function assignLanes<T extends { start: Date; end: Date }>(items: T[]): { lanes: Lane<T>[]; count: number } {
  const sorted = [...items].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
  const ends: number[] = [];
  const lanes = sorted.map((item) => {
    let lane = ends.findIndex((end) => end <= item.start.getTime());
    if (lane === -1) lane = ends.length;
    ends[lane] = item.end.getTime();
    return { item, lane };
  });
  return { lanes, count: Math.max(1, ends.length) };
}
