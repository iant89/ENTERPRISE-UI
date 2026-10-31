import { forwardRef, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { addDays, addMonths, isOutOfRange, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek } from '../../utilities/date';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import { IconButton } from '../icon-button';
import { readCalendarMarkers } from './dates';
import styles from './Calendar.module.css';

export interface CalendarProps {
  /** Selected date. */
  value?: Date | null;
  /** @default null */
  /** The initial value when the component is uncontrolled. */
  defaultValue?: Date | null;
  /** Called with the date the user selects. */
  onChange?: (date: Date) => void;
  /** Earliest selectable date. */
  min?: Date | null;
  /** Latest selectable date. */
  max?: Date | null;
  /** Return true for dates that cannot be selected. */
  isDateDisabled?: (date: Date) => boolean;
  /** BCP 47 locale for month and weekday names. Defaults to the browser locale. */
  locale?: string;
  /** First day of the week (0 = Sunday, 1 = Monday). @default 1 */
  weekStartsOn?: number;
  /** Focus the active day on mount. @default false */
  autoFocus?: boolean;
  /** Highlight weekends. @default true */
  highlightWeekends?: boolean;
  /** CalendarDate, CalendarDateRange and SpecialCalendarDate markers. */
  children?: ReactNode;
  /** Additional CSS class names for the root element. */
  className?: string;
}

/**
 * Month calendar grid. Arrow keys move by day/week, PageUp/PageDown by
 * month (with Shift: by year), Home/End to the start/end of the week.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { value, defaultValue = null, onChange, min, max, isDateDisabled, locale, weekStartsOn = 1, autoFocus = false, highlightWeekends = true, children, className },
  ref,
) {
  const markers = readCalendarMarkers(children);
  const [selected, setSelected] = useControllableState<Date | null>(value, defaultValue);
  const [focused, setFocused] = useState<Date>(() => startOfDay(selected ?? new Date()));
  const gridRef = useRef<HTMLTableElement>(null);
  const shouldFocus = useRef(autoFocus);
  const titleId = useId(undefined, 'calendar');
  const today = startOfDay(new Date());

  useEffect(() => {
    if (selected) setFocused(startOfDay(selected));
  }, [selected]);

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [focused]);

  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }), [locale]);
  const dayLabelFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), [locale]);
  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'short' }), [locale]);
  const weekdayLongFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'long' }), [locale]);

  const gridStart = startOfWeek(startOfMonth(focused), weekStartsOn);
  const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)));
  const disabled = (d: Date) => isOutOfRange(d, min, max) || !!isDateDisabled?.(d);

  const moveFocus = (next: Date) => {
    shouldFocus.current = true;
    setFocused(next);
  };

  const select = (d: Date) => {
    if (disabled(d)) return;
    setSelected(d);
    setFocused(d);
    onChange?.(d);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => startOfWeek(focused, weekStartsOn),
      End: () => addDays(startOfWeek(focused, weekStartsOn), 6),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    const fn = map[event.key];
    if (fn) {
      event.preventDefault();
      moveFocus(fn());
    }
  };

  return (
    <div ref={ref} className={cx(styles.calendar, className)}>
      <div className={styles.header}>
        <IconButton icon={<ChevronLeft />} label="Previous month" size="sm" onClick={() => setFocused(addMonths(focused, -1))} />
        <h2 id={titleId} className={styles.title} aria-live="polite">
          {monthFormatter.format(focused)}
        </h2>
        <IconButton icon={<ChevronRight />} label="Next month" size="sm" onClick={() => setFocused(addMonths(focused, 1))} />
      </div>
      <table ref={gridRef} role="grid" aria-labelledby={titleId} className={styles.grid} onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {weeks[0].map((d) => (
              <th key={d.getDay()} scope="col" className={styles.weekday} abbr={weekdayLongFormatter.format(d)}>
                {weekdayFormatter.format(d)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((d) => {
                const marked = markers.selected.some((date) => isSameDay(date, d));
                const isSelected = isSameDay(d, selected) || marked;
                const inRange = markers.ranges.some((range) => startOfDay(d).getTime() >= startOfDay(range.start).getTime() && startOfDay(d).getTime() <= startOfDay(range.end).getTime());
                const special = markers.special.find((date) => isSameDay(date.date, d));
                const isToday = isSameDay(d, today);
                const weekend = d.getDay() === 0 || d.getDay() === 6;
                const name = [dayLabelFormatter.format(d), inRange ? 'in selected range' : null, special?.label].filter(Boolean).join(', ');
                return (
                  <td key={d.toISOString()} role="gridcell" aria-selected={isSelected || undefined} className={styles.cell}>
                    <button
                      type="button"
                      tabIndex={isSameDay(d, focused) ? 0 : -1}
                      aria-label={name}
                      aria-current={isToday ? 'date' : undefined}
                      aria-pressed={isSelected}
                      disabled={disabled(d)}
                      className={cx(
                        styles.day,
                        !isSameMonth(d, focused) && styles.outside,
                        isToday && styles.today,
                        isSelected && styles.selected,
                        inRange && styles.range,
                        special && special.type !== 'none' && styles.special,
                        special && styles[special.type],
                        highlightWeekends && weekend && styles.weekend,
                      )}
                      onClick={() => select(d)}
                      onFocus={() => !isSameDay(d, focused) && setFocused(d)}
                    >
                      {d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
