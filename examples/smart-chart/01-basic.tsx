import { useState } from 'react';
import { SegmentedButton, SmartChart, type Aggregation } from '@enterprise-ui/react';
import { productRecords, productSchema } from '../metadata';

export const title = 'Charts from metadata';
export const description = 'Records are grouped by a `dimension` field and `measures` are aggregated per group. Labels, the chart name and value formatting (here euros) come from the schema. Date dimensions are bucketed with `dateGranularity`.';

export default function SmartChartBasic() {
  const [aggregation, setAggregation] = useState<Aggregation>('sum');
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <SegmentedButton
        aria-label="Aggregation"
        size="sm"
        items={(['sum', 'avg', 'max'] as const).map((value) => ({ value, label: value === 'sum' ? 'Sum' : value === 'avg' ? 'Average' : 'Maximum' }))}
        value={[aggregation]}
        onChange={(v) => v[0] && setAggregation(v[0] as Aggregation)}
      />
      <SmartChart schema={productSchema} data={productRecords} dimension="category" measures={['price']} aggregation={aggregation} height={240} />
      <SmartChart schema={productSchema} data={productRecords} dimension="supplier" aggregation="count" chartType="donut" label="Products by supplier" height={240} />
      <SmartChart schema={productSchema} data={productRecords} dimension="released" measures={['stock']} dateGranularity="year" chartType="line" height={220} />
    </div>
  );
}
