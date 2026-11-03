import { useState } from 'react';
import { Heatmap } from '@enterprise-ui/react';

export const title = 'Utilization by weekday and shift';
export const description = 'One hue from light to dark. The grid is keyboard navigable (arrow keys, Home, End) and every cell is announced with its row, column and value; `null` cells are hatched.';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const shifts = ['06–10', '10–14', '14–18', '18–22', '22–02'];
const values = [
  [62, 88, 91, 54, 12],
  [70, 92, 95, 60, 18],
  [66, 85, 89, 58, 15],
  [73, 96, 98, 66, 20],
  [58, 81, 77, 40, 8],
  [22, 41, 38, null, null],
  [null, 18, 22, null, null],
];

export default function HeatmapBasic() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Heatmap
        label="Warehouse dock utilization by weekday and shift, percent"
        rows={days}
        columns={shifts}
        values={values}
        min={0}
        max={100}
        showValues
        formatValue={(v) => `${v}%`}
        onCellClick={({ row, column, value }) => setPicked(`${days[row]} ${shifts[column]}: ${value ?? 'no data'}`)}
      />
      <p style={{ margin: 0 }} aria-live="polite">{picked ? `Selected ${picked}` : 'Select a cell to drill down.'}</p>
    </div>
  );
}
