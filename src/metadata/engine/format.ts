import { currencyDigits } from '../../utilities/number';
import { parseISODate } from '../../utilities/date';
import { currencyOf, isEmptyValue, type FieldDefinition } from './schema';
import { defaultMessages, type MetadataMessages } from './messages';

/** Locale and strings used to format and validate values. */
export interface FormatContext {
  /** BCP 47 locale. Defaults to the browser locale. */
  locale?: string;
  /** Strings for yes, no and empty values. */
  messages?: Partial<MetadataMessages>;
}

/** Parses an ISO date (`2026-10-30`) or local date-time (`2026-10-30T09:30`) without shifting time zones. */
export function parseFieldDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string' || !value) return null;
  const dateOnly = parseISODate(value.slice(0, 10));
  if (!dateOnly) return null;
  const time = /T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value);
  if (time) dateOnly.setHours(Number(time[1]), Number(time[2]), Number(time[3] ?? 0));
  return dateOnly;
}

/** Converts a value to a number when it is one (numbers or numeric strings). */
export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return null;
}

/** Formats a number or currency amount according to the field's display format. */
export function formatNumberValue(field: FieldDefinition, value: number, record?: object, locale?: string): string {
  const fmt = field.format ?? {};
  const options: Intl.NumberFormatOptions = { notation: fmt.compact ? 'compact' : 'standard' };
  const code = field.type === 'currency' ? currencyOf(field, record) : undefined;
  if (code) {
    options.style = 'currency';
    options.currency = code;
    const digits = fmt.fractionDigits ?? currencyDigits(code, locale);
    options.minimumFractionDigits = digits;
    options.maximumFractionDigits = digits;
  } else {
    if (fmt.percent) options.style = 'percent';
    if (fmt.fractionDigits != null) {
      options.minimumFractionDigits = fmt.fractionDigits;
      options.maximumFractionDigits = fmt.fractionDigits;
    }
  }
  const text = new Intl.NumberFormat(locale, options).format(value);
  return fmt.unit && !fmt.percent ? `${text} ${fmt.unit}` : text;
}

/** The label of an option value, or the value itself when it is not an option. */
export const optionLabel = (field: FieldDefinition, value: string) => field.options?.find((o) => o.value === value)?.label ?? value;

/**
 * Formats a field value as display text: localized numbers, currency amounts,
 * dates and date-times, Yes/No for booleans, option labels for enums and
 * comma-separated lists for multi-value fields. Empty values become `—`.
 */
export function formatFieldValue(field: FieldDefinition, value: unknown, record: object = {}, context: FormatContext = {}): string {
  const fmt = field.format ?? {};
  const messages = { ...defaultMessages, ...context.messages };
  if (fmt.formatter) return fmt.formatter(value, record as Record<string, unknown>);
  const empty = fmt.emptyText ?? messages.empty;
  if (isEmptyValue(field.type, value)) return empty;
  const { locale } = context;
  switch (field.type) {
    case 'boolean':
      return value ? (fmt.trueLabel ?? messages.yes) : (fmt.falseLabel ?? messages.no);
    case 'number':
    case 'currency': {
      const n = toNumber(value);
      return n == null ? String(value) : formatNumberValue(field, n, record, locale);
    }
    case 'date':
    case 'datetime': {
      const date = parseFieldDate(value);
      if (!date) return String(value);
      const options: Intl.DateTimeFormatOptions = { dateStyle: fmt.dateStyle ?? 'medium' };
      if (field.type === 'datetime') options.timeStyle = fmt.timeStyle ?? 'short';
      return new Intl.DateTimeFormat(locale, options).format(date);
    }
    case 'enum':
      return optionLabel(field, String(value));
    case 'multi':
      return (Array.isArray(value) ? value : [value]).map((v) => optionLabel(field, String(v))).join(', ');
    default:
      return String(value);
  }
}

/**
 * Compares two values of a field for sorting. Empty values sort last in
 * ascending order; strings use locale-aware, numeric-aware collation.
 */
export function compareFieldValues(field: FieldDefinition, a: unknown, b: unknown, locale?: string): number {
  const aEmpty = isEmptyValue(field.type, a);
  const bEmpty = isEmptyValue(field.type, b);
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
  switch (field.type) {
    case 'number':
    case 'currency':
      return (toNumber(a) ?? 0) - (toNumber(b) ?? 0);
    case 'boolean':
      return Number(Boolean(a)) - Number(Boolean(b));
    case 'date':
    case 'datetime':
      return (parseFieldDate(a)?.getTime() ?? 0) - (parseFieldDate(b)?.getTime() ?? 0);
    case 'enum': {
      // Enums sort in option order, which is usually the business order (e.g. Low, Medium, High).
      const order = (v: unknown) => field.options?.findIndex((o) => o.value === v) ?? -1;
      return order(a) - order(b);
    }
    default: {
      const text = (v: unknown) => (Array.isArray(v) ? v.join(', ') : String(v));
      return text(a).localeCompare(text(b), locale, { numeric: true, sensitivity: 'base' });
    }
  }
}
