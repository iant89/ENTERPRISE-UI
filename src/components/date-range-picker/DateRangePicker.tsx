import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import { Button } from '../button';
import { parseISODate } from '../../utilities/date';
import styles from './DateRangePicker.module.css';

/** ISO calendar dates, inclusive at both ends. Empty string means no boundary. */
export interface DateRange { start: string; end: string }
export interface DateRangePickerProps {
  label: string;
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (value: DateRange) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  /** Preset labels may be replaced for localization. */
  presetLabels?: { today: string; last7Days: string; thisMonth: string };
  /** Supplies the current local calendar date, useful for deterministic tests. */
  today?: () => Date;
}

const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const defaultToday = () => new Date();

/** Validates ISO calendar dates and inclusive bounds. An empty boundary is allowed. */
export function isDateRangeValid(range: DateRange, min?: string, max?: string): boolean {
  const validDate = (value: string) => !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !!parseISODate(value));
  return validDate(range.start) && validDate(range.end) && validDate(min ?? '') && validDate(max ?? '')
    && !(min && max && min > max)
    && !(range.start && range.end && range.start > range.end)
    && !(min && ((range.start && range.start < min) || (range.end && range.end < min)))
    && !(max && ((range.start && range.start > max) || (range.end && range.end > max)));
}

/** Native date inputs use the browser's locale and keyboard behavior. Dates are local calendar days, not timestamps. */
export function DateRangePicker({ label, value, defaultValue = { start: '', end: '' }, onChange, min, max, disabled, presetLabels = { today: 'Today', last7Days: 'Last 7 Days', thisMonth: 'This Month' }, today = defaultToday }: DateRangePickerProps) {
  const [range, setRange] = useControllableState(value, defaultValue, onChange);
  const id = useId(undefined, 'date-range');
  const invalid = !isDateRangeValid(range, min, max);
  const preset = (kind: 'today' | 'last7Days' | 'thisMonth') => {
    let end = today();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    if (kind === 'last7Days') start.setDate(start.getDate() - 6);
    if (kind === 'thisMonth') {
      start.setDate(1);
      end = new Date(end.getFullYear(), end.getMonth() + 1, 0);
    }
    const clamp = (date: string) => max && date > max ? max : min && date < min ? min : date;
    setRange({ start: clamp(iso(start)), end: clamp(iso(end)) });
  };
  return (
    <fieldset className={styles.root} disabled={disabled} aria-describedby={invalid ? `${id}-error` : undefined}>
      <legend>{label}</legend>
      <div className={styles.dates}>
        <label>Start date<input type="date" value={range.start} min={min} max={max} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} onChange={(event) => setRange({ ...range, start: event.target.value })} /></label>
        <label>End date<input type="date" value={range.end} min={min} max={max} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} onChange={(event) => setRange({ ...range, end: event.target.value })} /></label>
      </div>
      {invalid && <p id={`${id}-error`} role="alert">Enter a valid date range within the allowed bounds.</p>}
      <div className={styles.presets} aria-label="Date range presets">
        {(['today', 'last7Days', 'thisMonth'] as const).map((kind) => <Button key={kind} size="sm" onClick={() => preset(kind)}>{presetLabels[kind]}</Button>)}
      </div>
    </fieldset>
  );
}
