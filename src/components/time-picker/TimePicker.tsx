import { forwardRef, useMemo } from 'react';
import { ComboBox, type ComboBoxProps } from '../combo-box';

export interface TimePickerProps extends Omit<ComboBoxProps, 'options' | 'allowCustomValue' | 'parseCustomValue' | 'formatValue'> {
  /** Value in 24-hour `HH:mm` format. */
  value?: string | null;
  /** Minutes between suggested times. @default 30 */
  step?: number;
  /** Earliest suggested time (`HH:mm`). @default '00:00' */
  minTime?: string;
  /** Latest suggested time (`HH:mm`). @default '23:59' */
  maxTime?: string;
  /** Display times with AM/PM. @default false */
  hour12?: boolean;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const pad = (n: number) => String(n).padStart(2, '0');
const toHHMM = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

function display(value: string, hour12: boolean): string {
  if (!hour12) return value;
  const minutes = toMinutes(value);
  const h = Math.floor(minutes / 60);
  return `${((h + 11) % 12) + 1}:${pad(minutes % 60)} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Parses `9`, `930`, `9:30`, `09.30`, `9:30 pm` into `HH:mm`. */
export function parseTime(text: string): string | null {
  const match = /^(\d{1,2})(?:[:.]?(\d{2}))?\s*([ap])?\.?m?\.?$/i.exec(text.trim());
  if (!match) return null;
  let h = Number(match[1]);
  const m = Number(match[2] ?? 0);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem) {
    if (h < 1 || h > 12) return null;
    if (meridiem === 'p' && h !== 12) h += 12;
    if (meridiem === 'a' && h === 12) h = 0;
  }
  if (h > 23 || m > 59) return null;
  return `${pad(h)}:${pad(m)}`;
}

/** Time entry: type a time or pick one from a list of suggestions. */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  { step = 30, minTime = '00:00', maxTime = '23:59', hour12 = false, placeholder, ...rest },
  ref,
) {
  const options = useMemo(() => {
    const out = [];
    for (let t = toMinutes(minTime); t <= toMinutes(maxTime); t += step) {
      const v = toHHMM(t);
      out.push({ value: v, label: display(v, hour12) });
    }
    return out;
  }, [step, minTime, maxTime, hour12]);

  return (
    <ComboBox
      ref={ref}
      {...rest}
      options={options}
      allowCustomValue
      parseCustomValue={parseTime}
      formatValue={(v) => display(v, hour12)}
      filter={(option, text) => option.label.toLowerCase().startsWith(text.toLowerCase().replace(/^0/, '')) || option.value.startsWith(text)}
      placeholder={placeholder ?? (hour12 ? 'h:mm AM' : 'HH:mm')}
      emptyText="Type a time, e.g. 9:30"
    />
  );
});
