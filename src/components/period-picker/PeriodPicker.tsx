import { useState, type KeyboardEvent } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { useFormControl, type FieldProps } from '../form-field';
import { Popover } from '../popover';
import styles from './PeriodPicker.module.css';

export type PeriodGranularity = 'month' | 'quarter' | 'year' | 'fiscalPeriod' | 'week';

export interface Period {
  /** Canonical value: `2026-03`, `2026-Q1`, `2026`, `2026-P03` (fiscal) or `2026-W09` (ISO week). */
  value: string;
  /** First day (local date). */
  start: Date;
  /** Last day (local date). */
  end: Date;
}

export interface PeriodPickerLabels {
  placeholder: string;
  previousYear: string;
  nextYear: string;
  previousYears: string;
  nextYears: string;
  quarter: (q: number) => string;
  fiscalPeriod: (p: number) => string;
  week: (w: number) => string;
  /** Display of a fiscal year, e.g. "FY 2026". */
  fiscalYear: (year: number) => string;
}

export interface PeriodPickerProps extends FieldProps {
  /** Unit of the period. @default 'month' */
  granularity?: PeriodGranularity;
  /** Selected value (see Period.value). Providing it makes the picker controlled. */
  value?: string | null;
  /** Initial value when uncontrolled. @default null */
  defaultValue?: string | null;
  /** Called with the period, including its start and end dates. */
  onChange?: (period: Period | null) => void;
  /** First month of the fiscal year, 1–12 (fiscal periods). @default 1 */
  fiscalYearStartMonth?: number;
  /** Locale for month names. */
  locale?: string;
  /** Required field. @default false */
  required?: boolean;
  /** Disabled field. @default false */
  disabled?: boolean;
  /** Id of the trigger. */
  id?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<PeriodPickerLabels>;
}

const defaultLabels: PeriodPickerLabels = {
  placeholder: 'Select period',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  previousYears: 'Earlier years',
  nextYears: 'Later years',
  quarter: (q) => `Q${q}`,
  fiscalPeriod: (p) => `P${String(p).padStart(2, '0')}`,
  week: (w) => `W${String(w).padStart(2, '0')}`,
  fiscalYear: (y) => `FY ${y}`,
};

/** ISO 8601 week-numbering: weeks start on Monday and week 1 contains January 4th. */
function isoWeekStart(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  const monday = new Date(year, 0, 4 - ((jan4.getDay() + 6) % 7));
  return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + (week - 1) * 7);
}
const isoWeeksInYear = (year: number) => (isoWeekStart(year + 1, 1).getTime() - isoWeekStart(year, 1).getTime()) / (7 * 86400000);

/** Resolves a period value to its dates. The fiscal year is named by the calendar year in which it ends. */
export function resolvePeriod(value: string, fiscalYearStartMonth = 1): Period | null {
  let m: RegExpExecArray | null;
  if ((m = /^(\d{4})-(\d{2})$/.exec(value))) {
    const [y, mo] = [Number(m[1]), Number(m[2])];
    return { value, start: new Date(y, mo - 1, 1), end: new Date(y, mo, 0) };
  }
  if ((m = /^(\d{4})-Q([1-4])$/.exec(value))) {
    const [y, q] = [Number(m[1]), Number(m[2])];
    return { value, start: new Date(y, (q - 1) * 3, 1), end: new Date(y, q * 3, 0) };
  }
  if ((m = /^(\d{4})$/.exec(value))) {
    const y = Number(m[1]);
    return { value, start: new Date(y, 0, 1), end: new Date(y, 12, 0) };
  }
  if ((m = /^(\d{4})-P(\d{2})$/.exec(value))) {
    const [fy, p] = [Number(m[1]), Number(m[2])];
    const startYear = fiscalYearStartMonth === 1 ? fy : fy - 1;
    const monthIndex = fiscalYearStartMonth - 1 + (p - 1);
    return { value, start: new Date(startYear, monthIndex, 1), end: new Date(startYear, monthIndex + 1, 0) };
  }
  if ((m = /^(\d{4})-W(\d{2})$/.exec(value))) {
    const start = isoWeekStart(Number(m[1]), Number(m[2]));
    return { value, start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6) };
  }
  return null;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Pick a month, quarter, year, fiscal period or ISO week — the units finance and planning screens
 * work in — instead of two dates. Reports the canonical value with its start and end dates.
 */
export function PeriodPicker({
  granularity = 'month', value, defaultValue = null, onChange, fiscalYearStartMonth = 1, locale, labels: labelOverrides,
  label, description, error, status, statusMessage, hideLabel, labelPosition, required, disabled, id,
}: PeriodPickerProps) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled });
  const [selected, setSelected] = useControllableState<string | null>(value, defaultValue);
  const [open, setOpen] = useState(false);
  const selectedYear = selected ? Number(selected.slice(0, 4)) : new Date().getFullYear();
  const [year, setYear] = useState(selectedYear);
  const monthName = (i: number, style: 'short' | 'long' = 'short') => new Intl.DateTimeFormat(locale, { month: style }).format(new Date(2026, i, 1));

  const options: { value: string; label: string; title?: string }[] = (() => {
    switch (granularity) {
      case 'quarter':
        return [1, 2, 3, 4].map((q) => ({ value: `${year}-Q${q}`, label: labels.quarter(q) }));
      case 'year': {
        const first = year - (year % 12);
        return Array.from({ length: 12 }, (_, i) => ({ value: String(first + i), label: String(first + i) }));
      }
      case 'fiscalPeriod':
        return Array.from({ length: 12 }, (_, i) => {
          const r = resolvePeriod(`${year}-P${pad(i + 1)}`, fiscalYearStartMonth)!;
          return { value: r.value, label: labels.fiscalPeriod(i + 1), title: `${monthName(r.start.getMonth(), 'long')} ${r.start.getFullYear()}` };
        });
      case 'week':
        return Array.from({ length: isoWeeksInYear(year) }, (_, i) => ({ value: `${year}-W${pad(i + 1)}`, label: String(i + 1), title: labels.week(i + 1) }));
      default:
        return Array.from({ length: 12 }, (_, i) => ({ value: `${year}-${pad(i + 1)}`, label: monthName(i), title: `${monthName(i, 'long')} ${year}` }));
    }
  })();

  const describe = (v: string | null): string => {
    if (!v) return '';
    const r = resolvePeriod(v, fiscalYearStartMonth);
    if (!r) return v;
    const y = v.slice(0, 4);
    switch (granularity) {
      case 'quarter':
        return `${labels.quarter(Number(v.slice(6)))} ${y}`;
      case 'year':
        return y;
      case 'fiscalPeriod':
        return `${labels.fiscalPeriod(Number(v.slice(6)))} ${labels.fiscalYear(Number(y))}`;
      case 'week':
        return `${labels.week(Number(v.slice(6)))} ${y}`;
      default:
        return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(r.start);
    }
  };

  const choose = (v: string) => {
    setSelected(v);
    onChange?.(resolvePeriod(v, fiscalYearStartMonth));
    setOpen(false);
  };

  const step = granularity === 'year' ? 12 : 1;
  const columns = granularity === 'week' ? 7 : granularity === 'quarter' ? 4 : 3;
  const onGridKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[event.key];
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      buttons[event.key === 'Home' ? 0 : buttons.length - 1].focus();
    } else if (delta) {
      event.preventDefault();
      buttons[Math.min(Math.max(i + delta, 0), buttons.length - 1)].focus();
    }
  };
  const yearTitle = granularity === 'year' ? `${year - (year % 12)}–${year - (year % 12) + 11}` : granularity === 'fiscalPeriod' ? labels.fiscalYear(year) : String(year);

  return control.wrap(
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (o) setYear(selectedYear);
        setOpen(o);
      }}
      aria-label={typeof label === 'string' ? label : labels.placeholder}
      placement="bottom-start"
      width={granularity === 'week' ? '20rem' : '16rem'}
      trigger={
        <button
          type="button"
          id={control.id}
          className={cx(styles.trigger, control.status !== 'none' && styles[control.status])}
          disabled={control.disabled}
          aria-haspopup="dialog"
          aria-describedby={control.ariaProps['aria-describedby']}
          aria-invalid={control.ariaProps['aria-invalid']}
          aria-labelledby={control.labelId ? `${control.labelId} ${control.id}-value` : undefined}
        >
          <span id={`${control.id}-value`} className={cx(styles.value, !selected && styles.placeholder)}>
            {selected ? describe(selected) : labels.placeholder}
          </span>
          <CalendarRange aria-hidden="true" className={styles.icon} />
        </button>
      }
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <button type="button" className={styles.nav} aria-label={granularity === 'year' ? labels.previousYears : labels.previousYear} onClick={() => setYear((y) => y - step)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <span className={styles.year} aria-live="polite">
            {yearTitle}
          </span>
          <button type="button" className={styles.nav} aria-label={granularity === 'year' ? labels.nextYears : labels.nextYear} onClick={() => setYear((y) => y + step)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} role="group" aria-label={yearTitle} onKeyDown={onGridKey}>
          {options.map((o) => (
            <button key={o.value} type="button" className={cx(styles.option, o.value === selected && styles.selected)} aria-pressed={o.value === selected} title={o.title} aria-label={o.title ? `${o.label}, ${o.title}` : o.label} onClick={() => choose(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </Popover>,
  );
}
