import type { ChartDatum, ChartSeries } from '../../components/chart-core/types';
import { compareFieldValues, formatFieldValue, parseFieldDate, toNumber, type FormatContext } from './format';
import { defaultMessages } from './messages';
import { getField, isEmptyValue, readValue, type EntitySchema, type FieldDefinition } from './schema';

/** How the values of a measure are combined per category. */
export type Aggregation = 'sum' | 'avg' | 'min' | 'max' | 'count';

/** Bucket size for date and date-time dimensions. */
export type DateGranularity = 'day' | 'month' | 'quarter' | 'year';

/** Series key used for the record count. */
export const COUNT_MEASURE = '__count';

/** Options for {@link aggregateRecords}. */
export interface AggregateOptions extends FormatContext {
  /** Field whose values become the categories. */
  dimension: string;
  /** Number or currency fields to aggregate. Defaults to every visible number and currency field; with `aggregation: 'count'` it is ignored. */
  measures?: readonly string[];
  /** @default 'sum' */
  aggregation?: Aggregation;
  /** Bucket size for date dimensions. @default 'month' */
  dateGranularity?: DateGranularity;
  /** Category order: by the dimension (dates chronologically, enums in option order), by the first series descending, or as encountered. @default 'dimension' */
  sort?: 'dimension' | 'value' | 'none';
  /** Keep only the first N categories after sorting. */
  limit?: number;
}

/** Chart-ready data produced by {@link aggregateRecords}. */
export interface AggregateResult {
  /** One datum per category. */
  data: ChartDatum[];
  /** Datum field that holds the category label. */
  categoryKey: string;
  /** One series per measure, labelled from the schema. */
  series: ChartSeries[];
  /** The measure fields, in series order (empty for counts). */
  measureFields: FieldDefinition[];
}

function bucketOf(field: FieldDefinition, value: unknown, granularity: DateGranularity, context: FormatContext): { key: string; label: string; sortValue: unknown } {
  if (field.type === 'date' || field.type === 'datetime') {
    const date = parseFieldDate(value);
    if (date) {
      const y = date.getFullYear();
      const m = date.getMonth();
      const pad = (n: number) => String(n).padStart(2, '0');
      if (granularity === 'year') return { key: `${y}`, label: `${y}`, sortValue: y * 10000 };
      if (granularity === 'quarter') return { key: `${y}-Q${Math.floor(m / 3) + 1}`, label: `Q${Math.floor(m / 3) + 1} ${y}`, sortValue: y * 10000 + m };
      if (granularity === 'month') {
        return { key: `${y}-${pad(m + 1)}`, label: new Intl.DateTimeFormat(context.locale, { month: 'short', year: 'numeric' }).format(date), sortValue: y * 10000 + m * 100 };
      }
      const label = formatFieldValue({ ...field, type: 'date' }, value, {}, context);
      return { key: `${y}-${pad(m + 1)}-${pad(date.getDate())}`, label, sortValue: y * 10000 + m * 100 + date.getDate() };
    }
  }
  const label = formatFieldValue(field, value, {}, context);
  return { key: isEmptyValue(field.type, value) ? '\u0000empty' : String(value), label, sortValue: value };
}

/**
 * Groups records by a dimension field and aggregates measure fields per
 * group, returning data, a category key and labelled series for the charts.
 * Multi-value dimensions count a record once for each of its values.
 */
export function aggregateRecords(schema: EntitySchema, records: readonly object[], options: AggregateOptions): AggregateResult {
  const { dimension, aggregation = 'sum', dateGranularity = 'month', sort = 'dimension', limit } = options;
  const dimensionField = getField(schema, dimension);
  if (!dimensionField) throw new Error(`Unknown dimension field "${dimension}".`);
  const measureFields =
    aggregation === 'count'
      ? []
      : options.measures
        ? options.measures.map((name) => getField(schema, name)).filter((f): f is FieldDefinition => !!f)
        : schema.fields.filter((f) => !f.hidden && (f.type === 'number' || f.type === 'currency'));
  const keys = aggregation === 'count' ? [COUNT_MEASURE] : measureFields.map((f) => f.name);

  type Group = { label: string; sortValue: unknown; count: number; sums: number[]; counts: number[]; mins: number[]; maxs: number[] };
  const groups = new Map<string, Group>();
  for (const record of records) {
    const raw = readValue(record, dimension);
    const values = dimensionField.type === 'multi' && Array.isArray(raw) ? (raw.length ? raw : [null]) : [raw];
    for (const value of values) {
      const bucket = bucketOf(dimensionField, value, dateGranularity, options);
      let group = groups.get(bucket.key);
      if (!group) {
        group = { label: bucket.label, sortValue: bucket.sortValue, count: 0, sums: keys.map(() => 0), counts: keys.map(() => 0), mins: keys.map(() => Infinity), maxs: keys.map(() => -Infinity) };
        groups.set(bucket.key, group);
      }
      group.count += 1;
      measureFields.forEach((f, i) => {
        const n = toNumber(readValue(record, f.name));
        if (n == null) return;
        group.sums[i] += n;
        group.counts[i] += 1;
        group.mins[i] = Math.min(group.mins[i], n);
        group.maxs[i] = Math.max(group.maxs[i], n);
      });
    }
  }

  const valueAt = (g: Group, i: number): number | null => {
    if (aggregation === 'count') return g.count;
    if (g.counts[i] === 0) return null;
    if (aggregation === 'avg') return g.sums[i] / g.counts[i];
    if (aggregation === 'min') return g.mins[i];
    if (aggregation === 'max') return g.maxs[i];
    return g.sums[i];
  };

  let entries = [...groups.values()];
  if (sort === 'dimension') {
    const isDate = dimensionField.type === 'date' || dimensionField.type === 'datetime';
    entries.sort((a, b) => (isDate ? Number(a.sortValue ?? Infinity) - Number(b.sortValue ?? Infinity) : compareFieldValues(dimensionField, a.sortValue, b.sortValue, options.locale)));
  } else if (sort === 'value') {
    entries.sort((a, b) => (valueAt(b, 0) ?? -Infinity) - (valueAt(a, 0) ?? -Infinity));
  }
  if (limit != null) entries = entries.slice(0, limit);

  const messages = { ...defaultMessages, ...options.messages };
  const data = entries.map((g) => {
    const datum: ChartDatum = { [dimension]: g.label };
    keys.forEach((key, i) => (datum[key] = valueAt(g, i)));
    return datum;
  });
  const series: ChartSeries[] = aggregation === 'count' ? [{ key: COUNT_MEASURE, label: messages.count }] : measureFields.map((f) => ({ key: f.name, label: f.label }));
  return { data, categoryKey: dimension, series, measureFields };
}
