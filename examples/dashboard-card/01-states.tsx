import { useState } from 'react';
import { BarChart, DashboardCard, SegmentedButton, type DashboardCardStatus } from '@enterprise-ui/react';

export const title = 'Widget states';
export const description = 'Every widget gets the same loading, error (with Retry), empty and no-access states. `lastUpdated` shows freshness and `staleAfter` flags old data; `chartTools` adds the chart toolbar.';

const data = [
  { plant: 'Hamburg', oee: 87 },
  { plant: 'Lyon', oee: 91 },
  { plant: 'Pune', oee: 78 },
  { plant: 'Monterrey', oee: 83 },
];

export default function DashboardCardStates() {
  const [status, setStatus] = useState<DashboardCardStatus>('ready');
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState(() => Date.now() - 42 * 60_000);
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setUpdated(Date.now());
    }, 900);
  };
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      <SegmentedButton
        aria-label="Widget state"
        size="sm"
        items={(['ready', 'loading', 'error', 'empty', 'forbidden'] as const).map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
        value={[status]}
        onChange={(v) => v[0] && setStatus(v[0] as DashboardCardStatus)}
      />
      <DashboardCard
        title="Overall equipment effectiveness"
        subtitle="By plant, %"
        status={status}
        error="The production service did not respond (timeout after 30 s)."
        onRetry={() => setStatus('ready')}
        lastUpdated={updated}
        staleAfter={30 * 60_000}
        onRefresh={refresh}
        refreshing={refreshing}
        chartTools
        footer={<a href="#">Open production report</a>}
      >
        <BarChart label="OEE by plant" data={data} categoryKey="plant" categoryLabel="Plant" series={[{ key: 'oee', label: 'OEE %' }]} layout="horizontal" valueLabels referenceLines={[{ value: 85, label: 'Target', tone: 'success' }]} valueDomain={[0, 100]} />
      </DashboardCard>
    </div>
  );
}
