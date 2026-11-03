import { useMemo } from 'react';
import { ComboBox, type ComboBoxProps } from '../combo-box';

export interface TimeZonePickerProps extends Omit<ComboBoxProps, 'options' | 'children' | 'filter' | 'formatValue' | 'allowCustomValue'> {
  /** IANA zones to offer. Defaults to every zone the browser knows. */
  zones?: string[];
  /** Date used to compute offsets (they change with daylight saving time). @default now */
  referenceDate?: Date;
  /** Locale for zone names. */
  locale?: string;
}

const FALLBACK = ['UTC', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'];

function allZones(): string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  try {
    return intl.supportedValuesOf?.('timeZone') ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
}

/** Offset of a zone at `date` in minutes east of UTC. */
export function timeZoneOffset(zone: string, date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  return Math.round((asUtc - Math.floor(date.getTime() / 60000) * 60000) / 60000);
}

const formatOffset = (minutes: number) => {
  const sign = minutes < 0 ? '−' : '+';
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
};

/**
 * Choose an IANA time zone, listed by current UTC offset with a readable name, e.g.
 * "(UTC+01:00) Berlin — Central European Standard Time". Search matches city, region and offset.
 */
export function TimeZonePicker({ zones, referenceDate, locale, ...rest }: TimeZonePickerProps) {
  const options = useMemo(() => {
    const date = referenceDate ?? new Date();
    return (zones ?? allZones())
      .map((zone) => {
        let offset = 0;
        let name = '';
        try {
          offset = timeZoneOffset(zone, date);
          name = new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: 'long' }).formatToParts(date).find((p) => p.type === 'timeZoneName')?.value ?? '';
        } catch {
          // Unknown zone in this browser: keep it with a zero offset.
        }
        const city = zone.split('/').pop()!.replace(/_/g, ' ');
        return { zone, offset, label: `(${formatOffset(offset)}) ${city}${name ? ` — ${name}` : ''}`, search: `${zone} ${name} ${formatOffset(offset)}`.toLowerCase() };
      })
      .sort((a, b) => a.offset - b.offset || a.label.localeCompare(b.label));
  }, [zones, referenceDate, locale]);

  const searchText = useMemo(() => new Map(options.map((o) => [o.zone, o.search])), [options]);

  return (
    <ComboBox
      {...rest}
      options={options.map((o) => ({ value: o.zone, label: o.label }))}
      filter={(option, text) => {
        const q = text.trim().toLowerCase();
        return !q || option.label.toLowerCase().includes(q) || (searchText.get(option.value) ?? '').includes(q);
      }}
    />
  );
}
