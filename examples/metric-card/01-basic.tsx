import { DollarSign, Package, ShoppingCart, Timer } from 'lucide-react';
import { Grid, MetricCard } from '@enterprise-ui/react';

export const title = 'KPI tiles';
export const description = 'Headline value, unit, trend (with screen-reader text for direction) and an optional sparkline. `tone` colours the value semantically.';

export default function MetricCardBasic() {
  return (
    <Grid columns={{ base: 1, sm: 2, md: 4 }} gap={4}>
      <MetricCard title="Revenue" subtitle="Month to date" value="1.24" unit="M USD" icon={<DollarSign />} trend={{ direction: 'up', value: '+8.2%', label: 'vs. last month' }} sparkline={[8, 9, 7, 10, 11, 10, 12, 13]} />
      <MetricCard title="Open orders" value="342" icon={<ShoppingCart />} trend={{ direction: 'down', value: '−3.1%', label: 'vs. last week' }} sparkline={[40, 38, 41, 37, 36, 35, 34]} />
      <MetricCard title="Stock-outs" value="7" tone="error" icon={<Package />} trend={{ direction: 'up', value: '+2', upIsGood: false }} footer="3 critical items" onClick={() => {}} />
      <MetricCard title="Avg. lead time" value="4.6" unit="days" tone="success" icon={<Timer />} trend={{ direction: 'flat', value: '±0' }} loading={false} />
    </Grid>
  );
}
