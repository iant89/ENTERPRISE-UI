import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import { addDays, startOfMonth, startOfWeek, toISODate } from '../../utilities/date';
import { useControllableState } from '../../hooks/useControllableState';
import { Select } from '../select';
import { DateRangePicker, type DateRange } from '../date-range-picker';
import styles from './DynamicDateRange.module.css';

export type DynamicDateRangeOption = 'today' | 'yesterday' | 'thisWeek' | 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

export interface DynamicDateRangeValue {
  option: DynamicDateRangeOption;
  /** Resolved local dates (YYYY-MM-DD). For relative options this is re-resolved against `today()` on change. */
  range: DateRange;
}

export interface DynamicDateRangeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Visible label of the dynamic date range. Also used as its accessible name. */
  label: string;
  /** The current value. Providing it makes the component controlled; update it from the change callback. */
  value?: DynamicDateRangeValue | null;
  /** @default null */
  /** The initial value when the component is uncontrolled. */
  defaultValue?: DynamicDateRangeValue | null;
  /** Called with the new value, or `null` when it is cleared. */
  onChange?: (value: DynamicDateRangeValue | null) => void;
  /** Offered options, in order. @default all options */
  options?: DynamicDateRangeOption[];
  /** Localized option labels. */
  optionLabels?: Partial<Record<DynamicDateRangeOption, string>>;
  /** First day of week for "this week" (0 = Sunday). @default 1 */
  weekStartsOn?: number;
  /** Supplies the current local date; useful for deterministic tests. */
  today?: () => Date;
  /** Disables the dynamic date range. A disabled control cannot be focused or changed. */
  disabled?: boolean;
}

const allOptions: DynamicDateRangeOption[] = ['today', 'yesterday', 'thisWeek', 'last7Days', 'last30Days', 'thisMonth', 'lastMonth', 'thisYear', 'custom'];
const defaultLabels: Record<DynamicDateRangeOption, string> = {
  today: 'Today', yesterday: 'Yesterday', thisWeek: 'This week', last7Days: 'Last 7 days', last30Days: 'Last 30 days',
  thisMonth: 'This month', lastMonth: 'Last month', thisYear: 'This year', custom: 'Custom range',
};

/** Resolves a relative option to concrete local dates. */
export function resolveDynamicDateRange(option: Exclude<DynamicDateRangeOption, 'custom'>, now: Date, weekStartsOn = 1): DateRange {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const r = (a: Date, b: Date): DateRange => ({ start: toISODate(a), end: toISODate(b) });
  switch (option) {
    case 'today': return r(d, d);
    case 'yesterday': return r(addDays(d, -1), addDays(d, -1));
    case 'thisWeek': return r(startOfWeek(d, weekStartsOn), d);
    case 'last7Days': return r(addDays(d, -6), d);
    case 'last30Days': return r(addDays(d, -29), d);
    case 'thisMonth': return r(startOfMonth(d), d);
    case 'lastMonth': { const first = new Date(d.getFullYear(), d.getMonth() - 1, 1); return r(first, new Date(d.getFullYear(), d.getMonth(), 0)); }
    case 'thisYear': return r(new Date(d.getFullYear(), 0, 1), d);
  }
}

/** Choose a relative period (today, last 7 days…) or a custom date range. */
export const DynamicDateRange = forwardRef<HTMLDivElement, DynamicDateRangeProps>(function DynamicDateRange(
  { label, value, defaultValue = null, onChange, options = allOptions, optionLabels, weekStartsOn = 1, today = () => new Date(), disabled, className, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
  const labels = { ...defaultLabels, ...optionLabels };
  const select = (option: DynamicDateRangeOption | null) => {
    if (!option) return setCurrent(null);
    if (option === 'custom') return setCurrent({ option, range: current?.range ?? resolveDynamicDateRange('today', today(), weekStartsOn) });
    setCurrent({ option, range: resolveDynamicDateRange(option, today(), weekStartsOn) });
  };
  return (
    <div ref={ref} className={cx(styles.root, className)} {...rest}>
      <Select label={label} disabled={disabled} value={current?.option ?? null} onChange={select} options={options.map((o) => ({ value: o, label: labels[o] }))} />
      {current?.option === 'custom' && (
        <DateRangePicker label={labels.custom} disabled={disabled} value={current.range} onChange={(range) => setCurrent({ option: 'custom', range })} today={today} />
      )}
    </div>
  );
});
