import { AnalyticalCard, BarChart, BulletChart, DonutChart, Grid, IconButton, LineChart, ProportionBar, OverflowIcon } from '@enterprise-ui/react';

export const title = 'Overview page';
export const description = 'Analytical cards pair a KPI header (value, trend, target and deviation) with a chart. `onHeaderClick` makes the header a drill-down target; header actions stay separately focusable.';

const revenue = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month, i) => ({ month, actual: [1.12, 1.08, 1.24, 1.31, 1.27, 1.42, 1.38, 1.51][i], plan: [1.1, 1.12, 1.15, 1.18, 1.2, 1.24, 1.26, 1.3][i] }));

export default function AnalyticalCardOverview() {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={4}>
      <AnalyticalCard
        title="Revenue"
        subtitle="Year to date, M EUR"
        value="10.33"
        unit="M EUR"
        valueTone="success"
        trend={{ direction: 'up', value: '+12.4%', label: 'vs. last year' }}
        indicators={[{ label: 'Target', value: '9.85' }, { label: 'Deviation', value: '+4.9%', tone: 'success' }]}
        onHeaderClick={() => {}}
        actions={<IconButton icon={<OverflowIcon />} label="Card options" size="sm" />}
        footer="Updated 5 minutes ago"
      >
        <LineChart label="Revenue by month, actual versus plan" data={revenue} categoryKey="month" categoryLabel="Month" series={[{ key: 'actual', label: 'Actual' }, { key: 'plan', label: 'Plan' }]} height={180} includeZero={false} tableToggle={false} />
      </AnalyticalCard>
      <AnalyticalCard title="Open orders by region" subtitle="Count" value="1,284" trend={{ direction: 'down', value: '−3.1%', label: 'vs. last week', upIsGood: false }} status="4 regions">
        <BarChart label="Open orders by region" data={[{ r: 'EMEA', n: 480 }, { r: 'Americas', n: 412 }, { r: 'APJ', n: 301 }, { r: 'MEA', n: 91 }]} categoryKey="r" categoryLabel="Region" series={[{ key: 'n', label: 'Open orders' }]} layout="horizontal" valueLabels tableToggle={false} />
      </AnalyticalCard>
      <AnalyticalCard title="Spend by category" subtitle="Quarter to date">
        <DonutChart label="Indirect spend by category" data={[{ label: 'IT services', value: 412 }, { label: 'Facilities', value: 286 }, { label: 'Travel', value: 174 }, { label: 'Marketing', value: 133 }]} height={180} centerLabel="K EUR total" tableToggle={false} />
      </AnalyticalCard>
      <AnalyticalCard title="Plant performance" subtitle="Hamburg 1010" value="87" unit="% OEE" valueTone="warning" indicators={[{ label: 'Target', value: '90%' }]}>
        <div style={{ display: 'grid', gap: 16 }}>
          <BulletChart label="Output (K units)" value={182} target={200} forecast={194} max={220} ranges={[{ to: 150, tone: 'error' }, { to: 190, tone: 'warning' }, { to: 220, tone: 'success' }]} />
          <ProportionBar label="Machine time this week" segments={[{ label: 'Running', value: 131, tone: 'success' }, { label: 'Changeover', value: 20, tone: 'information' }, { label: 'Down', value: 17, tone: 'error' }]} formatValue={(v) => `${v} h`} />
        </div>
      </AnalyticalCard>
    </Grid>
  );
}
