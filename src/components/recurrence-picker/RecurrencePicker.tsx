import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import { toISODate } from '../../utilities/date';
import { DatePicker } from '../date-picker';
import { NumberInput } from '../number-input';
import { RadioGroup } from '../radio-group';
import { SegmentedButton } from '../segmented-button';
import { Select } from '../select';
import styles from './RecurrencePicker.module.css';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Recurrence {
  frequency: RecurrenceFrequency;
  /** Repeat every N days/weeks/months/years. */
  interval: number;
  /** Weekdays for weekly rules, 0 = Monday … 6 = Sunday. */
  weekdays: number[];
  /** Day of the month for monthly rules (1–31; months without it skip). */
  monthDay: number;
  /** When the series ends. */
  end: { type: 'never' } | { type: 'until'; date: string } | { type: 'count'; count: number };
}

export interface RecurrencePickerLabels {
  legend: string;
  frequency: string;
  frequencies: Record<RecurrenceFrequency, string>;
  interval: string;
  units: Record<Exclude<RecurrenceFrequency, 'none'>, (n: number) => string>;
  weekdays: string;
  monthDay: string;
  end: string;
  never: string;
  until: string;
  count: string;
  occurrences: string;
  endDate: string;
  summary: string;
}

export interface RecurrencePickerProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  /** Current rule. Providing it makes the picker controlled. */
  value?: Recurrence;
  /** Initial rule when uncontrolled. */
  defaultValue?: Recurrence;
  /** Called with the rule, its iCalendar RRULE and a readable summary. */
  onChange?: (value: Recurrence, details: { rrule: string; summary: string }) => void;
  /** Locale for weekday names, dates and the summary. */
  locale?: string;
  /** Disables every control. @default false */
  disabled?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<RecurrencePickerLabels>;
}

const defaultLabels: RecurrencePickerLabels = {
  legend: 'Repeat',
  frequency: 'Repeats',
  frequencies: { none: 'Does not repeat', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' },
  interval: 'Every',
  units: { daily: (n) => (n === 1 ? 'day' : 'days'), weekly: (n) => (n === 1 ? 'week' : 'weeks'), monthly: (n) => (n === 1 ? 'month' : 'months'), yearly: (n) => (n === 1 ? 'year' : 'years') },
  weekdays: 'On',
  monthDay: 'Day of the month',
  end: 'Ends',
  never: 'Never',
  until: 'On date',
  count: 'After',
  occurrences: 'Occurrences',
  endDate: 'End date',
  summary: 'Summary',
};

export const defaultRecurrence: Recurrence = { frequency: 'weekly', interval: 1, weekdays: [0], monthDay: 1, end: { type: 'never' } };

const RRULE_DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

/** iCalendar (RFC 5545) RRULE for the rule, e.g. `FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE`. Empty for no repeat. */
export function toRRule(r: Recurrence): string {
  if (r.frequency === 'none') return '';
  const parts = [`FREQ=${r.frequency.toUpperCase()}`];
  if (r.interval > 1) parts.push(`INTERVAL=${r.interval}`);
  if (r.frequency === 'weekly' && r.weekdays.length) parts.push(`BYDAY=${[...r.weekdays].sort().map((d) => RRULE_DAYS[d]).join(',')}`);
  if (r.frequency === 'monthly') parts.push(`BYMONTHDAY=${r.monthDay}`);
  if (r.end.type === 'until') parts.push(`UNTIL=${r.end.date.replace(/-/g, '')}`);
  if (r.end.type === 'count') parts.push(`COUNT=${r.end.count}`);
  return parts.join(';');
}

const weekdayName = (d: number, locale?: string, style: 'short' | 'long' = 'short') => new Intl.DateTimeFormat(locale, { weekday: style }).format(new Date(2024, 0, 1 + d));

/** English readable summary, e.g. "Every 2 weeks on Mon, Wed, until 31 Dec 2026". Pass `labels` and `locale` for other languages. */
export function describeRecurrence(r: Recurrence, { locale, labels = defaultLabels }: { locale?: string; labels?: RecurrencePickerLabels } = {}): string {
  if (r.frequency === 'none') return labels.frequencies.none;
  const unit = labels.units[r.frequency](r.interval);
  let text = r.interval === 1 ? labels.frequencies[r.frequency] : `${labels.interval} ${r.interval} ${unit}`;
  if (r.frequency === 'weekly' && r.weekdays.length) text += ` · ${[...r.weekdays].sort().map((d) => weekdayName(d, locale)).join(', ')}`;
  if (r.frequency === 'monthly') text += ` · ${labels.monthDay.toLowerCase()} ${r.monthDay}`;
  if (r.end.type === 'until') {
    const [y, m, d] = r.end.date.split('-').map(Number);
    text += ` · ${labels.end.toLowerCase()} ${new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(y, m - 1, d))}`;
  }
  if (r.end.type === 'count') text += ` · ${r.end.count} ${labels.occurrences.toLowerCase()}`;
  return text;
}

/** Schedule rule editor (daily, weekly on chosen days, monthly, yearly; ending never, on a date or after N times) that outputs an RRULE. */
export const RecurrencePicker = forwardRef<HTMLFieldSetElement, RecurrencePickerProps>(function RecurrencePicker(
  { value, defaultValue = defaultRecurrence, onChange, locale, disabled = false, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides, frequencies: { ...defaultLabels.frequencies, ...labelOverrides?.frequencies }, units: { ...defaultLabels.units, ...labelOverrides?.units } };
  const id = useId(undefined, 'recurrence');
  const [rule, setRule] = useControllableState(value, defaultValue);
  const update = (patch: Partial<Recurrence>) => {
    const next = { ...rule, ...patch };
    setRule(next);
    onChange?.(next, { rrule: toRRule(next), summary: describeRecurrence(next, { locale, labels }) });
  };
  const repeats = rule.frequency !== 'none';
  const summary: ReactNode = describeRecurrence(rule, { locale, labels });
  const untilDate = rule.end.type === 'until' ? (() => {
    const [y, m, d] = rule.end.date.split('-').map(Number);
    return new Date(y, m - 1, d);
  })() : null;

  return (
    <fieldset ref={ref} className={cx(styles.root, className)} disabled={disabled} aria-describedby={`${id}-summary`} {...rest}>
      <legend className={styles.legend}>{labels.legend}</legend>
      <div className={styles.row}>
        <Select
          label={labels.frequency}
          value={rule.frequency}
          onChange={(v) => v && update({ frequency: v as RecurrenceFrequency })}
          options={(Object.keys(labels.frequencies) as RecurrenceFrequency[]).map((f) => ({ value: f, label: labels.frequencies[f] }))}
          disabled={disabled}
        />
        {repeats && (
          <NumberInput
            label={`${labels.interval} (${labels.units[rule.frequency as Exclude<RecurrenceFrequency, 'none'>](rule.interval)})`}
            value={rule.interval}
            min={1}
            max={99}
            precision={0}
            onChange={(n) => update({ interval: n ?? 1 })}
            disabled={disabled}
          />
        )}
      </div>
      {rule.frequency === 'weekly' && (
        <div className={styles.field}>
          <span className={styles.label} aria-hidden="true">
            {labels.weekdays}
          </span>
          <SegmentedButton
            aria-label={labels.weekdays}
            selectionMode="multiple"
            size="sm"
            items={[0, 1, 2, 3, 4, 5, 6].map((d) => ({ value: String(d), label: weekdayName(d, locale), ariaLabel: weekdayName(d, locale, 'long') }))}
            value={rule.weekdays.map(String)}
            onChange={(v) => v.length && update({ weekdays: v.map(Number) })}
          />
        </div>
      )}
      {rule.frequency === 'monthly' && (
        <NumberInput label={labels.monthDay} value={rule.monthDay} min={1} max={31} precision={0} onChange={(n) => update({ monthDay: n ?? 1 })} disabled={disabled} />
      )}
      {repeats && (
        <div className={styles.row}>
          <RadioGroup
            label={labels.end}
            orientation="horizontal"
            value={rule.end.type}
            onChange={(t) =>
              update({
                end: t === 'until' ? { type: 'until', date: toISODate(new Date(new Date().getFullYear(), 11, 31)) } : t === 'count' ? { type: 'count', count: 10 } : { type: 'never' },
              })
            }
            options={[
              { value: 'never', label: labels.never },
              { value: 'until', label: labels.until },
              { value: 'count', label: labels.count },
            ]}
            disabled={disabled}
          />
          {rule.end.type === 'until' && <DatePicker label={labels.endDate} value={untilDate} onChange={(d) => d && update({ end: { type: 'until', date: toISODate(d) } })} locale={locale} disabled={disabled} />}
          {rule.end.type === 'count' && (
            <NumberInput label={labels.occurrences} value={rule.end.count} min={1} max={999} precision={0} onChange={(n) => update({ end: { type: 'count', count: n ?? 1 } })} disabled={disabled} />
          )}
        </div>
      )}
      <p id={`${id}-summary`} className={styles.summary} aria-live="polite">
        <span className={styles.summaryLabel}>{labels.summary}:</span> {summary}
      </p>
    </fieldset>
  );
});
