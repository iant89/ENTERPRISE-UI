import { forwardRef, useEffect, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { Input, type InputProps } from '../input';

export interface DurationInputLabels {
  /** Formats minutes for display, e.g. "2 h 30 min". */
  format: (minutes: number, parts: { days: number; hours: number; minutes: number }) => string;
  invalid: string;
  /** Unit words accepted while typing, per unit. */
  units: { day: string[]; hour: string[]; minute: string[] };
}

export interface DurationInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'type'> {
  /** Duration in minutes; `null` when empty. Providing it makes the input controlled. */
  value?: number | null;
  /** Initial duration when uncontrolled. @default null */
  defaultValue?: number | null;
  /** Called with the committed duration in minutes (after blur or Enter). */
  onChange?: (minutes: number | null) => void;
  /** Hours in a day for `d` (8 for working days). @default 24 */
  hoursPerDay?: number;
  /** Unit of a bare number such as "90". @default 'minute' */
  defaultUnit?: 'minute' | 'hour';
  /** Overrides for the built-in strings. */
  labels?: Partial<DurationInputLabels>;
}

const defaultLabels: DurationInputLabels = {
  format: (_, { days, hours, minutes }) => [days && `${days} d`, hours && `${hours} h`, (minutes || (!days && !hours)) && `${minutes} min`].filter(Boolean).join(' '),
  invalid: 'Enter a duration such as 2h 30m, 1:45 or 90.',
  units: { day: ['d', 'day', 'days'], hour: ['h', 'hr', 'hrs', 'hour', 'hours'], minute: ['m', 'min', 'mins', 'minute', 'minutes'] },
};

/** Parses "2h 30m", "1.5h", "1:45", "1d 2h" or a bare number into minutes. Returns NaN when invalid. */
export function parseDuration(text: string, { hoursPerDay = 24, defaultUnit = 'minute', units = defaultLabels.units }: { hoursPerDay?: number; defaultUnit?: 'minute' | 'hour'; units?: DurationInputLabels['units'] } = {}): number | null {
  const s = text.trim().toLowerCase().replace(',', '.');
  if (!s) return null;
  const clock = /^(\d+):([0-5]\d)$/.exec(s);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  if (/^\d+(\.\d+)?$/.test(s)) return Math.round(Number(s) * (defaultUnit === 'hour' ? 60 : 1));
  const factor = (unit: string) => (units.day.includes(unit) ? hoursPerDay * 60 : units.hour.includes(unit) ? 60 : units.minute.includes(unit) ? 1 : NaN);
  let total = 0;
  let rest = s;
  const part = /^\s*(\d+(?:\.\d+)?)\s*([a-zà-ÿ]+)/;
  while (rest.trim()) {
    const m = part.exec(rest);
    if (!m) return Number.NaN;
    const f = factor(m[2]);
    if (Number.isNaN(f)) return Number.NaN;
    total += Number(m[1]) * f;
    rest = rest.slice(m[0].length);
  }
  return Math.round(total);
}

/** A time span typed naturally ("2h 30m", "1:45", "90") and stored as minutes. */
export const DurationInput = forwardRef<HTMLInputElement, DurationInputProps>(function DurationInput(
  { value, defaultValue = null, onChange, hoursPerDay = 24, defaultUnit = 'minute', labels: labelOverrides, error, onBlur, onKeyDown, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides, units: { ...defaultLabels.units, ...labelOverrides?.units } };
  const [minutes, setMinutes] = useControllableState(value, defaultValue, onChange);
  const display = (m: number | null) => {
    if (m === null) return '';
    const days = Math.floor(m / (hoursPerDay * 60));
    const hours = Math.floor((m - days * hoursPerDay * 60) / 60);
    return labels.format(m, { days, hours, minutes: m - days * hoursPerDay * 60 - hours * 60 });
  };
  const [text, setText] = useState(() => display(minutes));
  const [problem, setProblem] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setText(display(minutes)), [minutes, hoursPerDay]);

  const commit = () => {
    const parsed = parseDuration(text, { hoursPerDay, defaultUnit, units: labels.units });
    if (parsed !== null && Number.isNaN(parsed)) {
      setProblem(labels.invalid);
      return;
    }
    setProblem(null);
    setMinutes(parsed);
    setText(display(parsed));
  };

  return (
    <Input
      ref={ref}
      {...rest}
      value={text}
      error={problem ?? error}
      autoComplete="off"
      onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
      onBlur={(e: FocusEvent<HTMLInputElement>) => {
        commit();
        onBlur?.(e);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') commit();
        onKeyDown?.(e);
      }}
    />
  );
});
