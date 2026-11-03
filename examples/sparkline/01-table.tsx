import { Sparkline } from '@enterprise-ui/react';

export const title = 'Sparklines in a table';
export const description = 'Word-sized trends with no axes. Give each a `label` so its range is announced; omit it when the trend is decorative next to the same numbers.';

const rows = [
  { sku: 'Valve assembly', stock: [120, 118, 112, 104, 98, 90, 86, 80], tone: 'warning' as const },
  { sku: 'Pressure sensor', stock: [40, 44, 47, 52, 55, 61, 64, 70] },
  { sku: 'Control unit', stock: [12, 14, 9, null, 11, 13, 15, 16] },
];
const variance = [3, -2, 4, 1, -5, 2, 6, -1, 3, 4];

export default function SparklineTable() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 520 }}>
        <thead>
          <tr>
            <th scope="col" style={{ textAlign: 'start', padding: 8 }}>Material</th>
            <th scope="col" style={{ textAlign: 'end', padding: 8 }}>On hand</th>
            <th scope="col" style={{ textAlign: 'start', padding: 8 }}>Last 8 weeks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sku}>
              <th scope="row" style={{ textAlign: 'start', fontWeight: 400, padding: 8 }}>{r.sku}</th>
              <td style={{ textAlign: 'end', padding: 8, fontVariantNumeric: 'tabular-nums' }}>{r.stock[r.stock.length - 1]}</td>
              <td style={{ padding: 8 }}>
                <Sparkline values={r.stock} label={`${r.sku} stock`} tone={r.tone} variant="area" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        Weekly forecast variance <Sparkline values={variance} variant="bar" label="Forecast variance" width={120} />
      </p>
    </div>
  );
}
