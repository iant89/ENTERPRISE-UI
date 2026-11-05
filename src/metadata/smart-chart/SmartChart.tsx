import { forwardRef, useMemo } from 'react';
import { BarChart } from '../../components/bar-chart';
import type { ChartBaseProps } from '../../components/chart-core';
import type { ChartSelectProps } from '../../components/chart-core/types';
import { DonutChart } from '../../components/donut-chart';
import { LineChart } from '../../components/line-chart';
import { useMetadata } from '../MetadataProvider';
import { aggregateRecords, type Aggregation, type DateGranularity } from '../engine/aggregate';
import { formatNumberValue } from '../engine/format';
import { getField, type EntitySchema } from '../engine/schema';

export interface SmartChartProps extends Omit<ChartBaseProps, 'label'>, ChartSelectProps {
  /** Metadata of the records. */
  schema: EntitySchema;
  /** Records to aggregate. */
  data: readonly object[];
  /** Field whose values become the categories (x-axis or segments). */
  dimension: string;
  /** Number or currency fields to plot. Defaults to every visible number and currency field; a donut uses the first. */
  measures?: readonly string[];
  /** How values are combined per category. `count` counts records. @default 'sum' */
  aggregation?: Aggregation;
  /** Bucket size for date dimensions. @default 'month' */
  dateGranularity?: DateGranularity;
  /** Category order. @default 'dimension' */
  sort?: 'dimension' | 'value' | 'none';
  /** Keep only the first N categories after sorting. */
  limit?: number;
  /** Chart to draw. @default 'bar' */
  chartType?: 'bar' | 'line' | 'donut';
  /** Accessible name and title. Defaults to "<measures> by <dimension>". */
  label?: string;
  /** Bar orientation (bar charts). @default 'vertical' */
  layout?: 'vertical' | 'horizontal';
  /** Stack the series (bar charts). @default false */
  stacked?: boolean;
  /** Fill the area under the lines (line charts). @default false */
  area?: boolean;
}

/**
 * A chart generated from a schema: groups records by a dimension field,
 * aggregates measure fields, and draws a bar, line or donut chart with labels
 * and value formatting (currency, units, percent) taken from the metadata.
 */
export const SmartChart = forwardRef<HTMLElement, SmartChartProps>(function SmartChart(
  { schema, data, dimension, measures, aggregation = 'sum', dateGranularity, sort, limit, chartType = 'bar', label, layout, stacked, area, formatValue, ...rest },
  ref,
) {
  const { locale, messages } = useMetadata();
  const result = useMemo(
    () => aggregateRecords(schema, data, { dimension, measures, aggregation, dateGranularity, sort, limit, locale, messages }),
    [schema, data, dimension, measures, aggregation, dateGranularity, sort, limit, locale, messages],
  );
  const dimensionLabel = getField(schema, dimension)?.label ?? dimension;
  const name = label ?? messages.chartLabel(result.series.map((s) => s.label).join(', '), dimensionLabel);

  const first = result.measureFields[0];
  // Values use the first measure's format (currency amounts take the first record's currency); counts are plain numbers.
  const format =
    formatValue ??
    (first ? (n: number) => formatNumberValue(first, n, data[0], locale) : (n: number) => new Intl.NumberFormat(locale).format(n));

  if (chartType === 'donut') {
    const key = result.series[0]?.key;
    const segments = result.data.map((d) => ({ label: String(d[result.categoryKey]), value: Number(d[key] ?? 0) })).filter((s) => s.value > 0);
    return <DonutChart ref={ref} {...rest} label={name} data={segments} categoryLabel={dimensionLabel} valueLabel={result.series[0]?.label} formatValue={format} />;
  }
  if (chartType === 'line') {
    return <LineChart ref={ref} {...rest} label={name} data={result.data} categoryKey={result.categoryKey} categoryLabel={dimensionLabel} series={result.series} area={area} formatValue={format} />;
  }
  return <BarChart ref={ref} {...rest} label={name} data={result.data} categoryKey={result.categoryKey} categoryLabel={dimensionLabel} series={result.series} layout={layout} stacked={stacked} formatValue={format} />;
});
