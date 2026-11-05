import { formatFieldValue, parseFieldDate, toNumber, type FormatContext } from './format';
import { isEmptyValue, readValue, type EntitySchema, type FieldDefinition } from './schema';

/** Lower and upper bound of a number or currency filter; `null` means no bound. */
export interface NumberRangeFilter {
  /** Smallest included value. */
  from: number | null;
  /** Largest included value. */
  to: number | null;
}

/** ISO calendar dates, inclusive at both ends. Empty string means no bound. */
export interface DateRangeFilter {
  /** First included date (`YYYY-MM-DD`). */
  start: string;
  /** Last included date (`YYYY-MM-DD`). */
  end: string;
}

/**
 * A filter condition. Its shape follows the field type:
 * `string` → text the value contains; `enum` and `multi` → values to match (any of);
 * `boolean` → `true`, `false` or `null` for any; `number` and `currency` → {@link NumberRangeFilter};
 * `date` and `datetime` → {@link DateRangeFilter}.
 */
export type FilterCondition = string | string[] | boolean | null | NumberRangeFilter | DateRangeFilter;

/** Filter conditions by field name. */
export type FilterValues = Record<string, FilterCondition | undefined>;

/** Whether a condition restricts the result. Empty text, empty lists and open ranges do not. */
export function isFilterActive(condition: FilterCondition | undefined): boolean {
  if (condition == null) return false;
  if (typeof condition === 'string') return condition.trim() !== '';
  if (typeof condition === 'boolean') return true;
  if (Array.isArray(condition)) return condition.length > 0;
  if ('from' in condition) return condition.from != null || condition.to != null;
  return !!condition.start || !!condition.end;
}

/** Number of active conditions, for the filter bar's count. */
export const countActiveFilters = (filters: FilterValues) => Object.values(filters).filter(isFilterActive).length;

/** Whether a single value satisfies a condition for the given field. */
export function matchesCondition(field: FieldDefinition, value: unknown, condition: FilterCondition | undefined, record: object = {}, context: FormatContext = {}): boolean {
  if (!isFilterActive(condition)) return true;
  switch (field.type) {
    case 'boolean':
      return Boolean(value) === condition;
    case 'enum':
    case 'multi': {
      // Multi fields without options are filtered by text.
      if (typeof condition === 'string') return containsText(field, value, condition, record, context);
      const wanted = condition as string[];
      const values = Array.isArray(value) ? value.map(String) : value == null ? [] : [String(value)];
      return values.some((v) => wanted.includes(v));
    }
    case 'number':
    case 'currency': {
      const range = condition as NumberRangeFilter;
      const n = toNumber(value);
      if (n == null) return false;
      return (range.from == null || n >= range.from) && (range.to == null || n <= range.to);
    }
    case 'date':
    case 'datetime': {
      const range = condition as DateRangeFilter;
      const date = parseFieldDate(value);
      if (!date) return false;
      const day = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
      const bound = (iso: string) => {
        const d = parseFieldDate(iso);
        return d ? d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() : null;
      };
      const start = range.start ? bound(range.start) : null;
      const end = range.end ? bound(range.end) : null;
      return (start == null || day >= start) && (end == null || day <= end);
    }
    default:
      return containsText(field, value, String(condition), record, context);
  }
}

function containsText(field: FieldDefinition, value: unknown, text: string, record: object, context: FormatContext) {
  if (isEmptyValue(field.type, value)) return false;
  const needle = text.trim().toLocaleLowerCase(context.locale);
  const raw = Array.isArray(value) ? value.join(' ') : String(value);
  return raw.toLocaleLowerCase(context.locale).includes(needle) || formatFieldValue(field, value, record, context).toLocaleLowerCase(context.locale).includes(needle);
}

/** Options for {@link filterRecords}. */
export interface FilterRecordsOptions extends FormatContext {
  /** Free text that at least one searchable field must contain. */
  search?: string;
  /** Fields searched by `search`. Defaults to visible string, enum and multi fields. */
  searchFields?: readonly string[];
}

/** Returns the records that satisfy every active condition and the free-text search. */
export function filterRecords<T extends object>(schema: EntitySchema, records: readonly T[], filters: FilterValues, options: FilterRecordsOptions = {}): T[] {
  const active = schema.fields.filter((f) => isFilterActive(filters[f.name]));
  const search = options.search?.trim();
  const searchable = search
    ? schema.fields.filter((f) => (options.searchFields ? options.searchFields.includes(f.name) : !f.hidden && (f.type === 'string' || f.type === 'enum' || f.type === 'multi')))
    : [];
  return records.filter(
    (record) =>
      active.every((f) => matchesCondition(f, readValue(record, f.name), filters[f.name], record, options)) &&
      (!search || searchable.some((f) => containsText(f, readValue(record, f.name), search, record, options))),
  );
}
