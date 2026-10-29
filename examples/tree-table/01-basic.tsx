import { StatusIndicator, TreeTable } from '@enterprise-ui/react';
import { currency } from '../data';

export const title = 'Cost center hierarchy';
export const description = 'A `treegrid`: ↑/↓ move between rows, → expands, ← collapses or moves to the parent.';

interface CostCenter {
  id: string;
  name: string;
  budget: number;
  actual: number;
  children?: CostCenter[];
}

const data: CostCenter[] = [
  {
    id: '1000', name: 'Operations', budget: 1200000, actual: 1080000,
    children: [
      { id: '1100', name: 'Production', budget: 800000, actual: 760000, children: [
        { id: '1110', name: 'Line A', budget: 450000, actual: 470000 },
        { id: '1120', name: 'Line B', budget: 350000, actual: 290000 },
      ] },
      { id: '1200', name: 'Logistics', budget: 400000, actual: 320000 },
    ],
  },
  { id: '2000', name: 'Sales', budget: 650000, actual: 702000, children: [{ id: '2100', name: 'EMEA Sales', budget: 650000, actual: 702000 }] },
  { id: '3000', name: 'Administration', budget: 300000, actual: 240000 },
];

export default function TreeTableBasic() {
  return (
    <TreeTable<CostCenter>
      aria-label="Cost centers"
      data={data}
      getRowId={(r) => r.id}
      defaultExpandedIds={['1000']}
      columns={[
        { id: 'name', header: 'Cost center', accessor: 'name', cell: (r) => <span><strong>{r.id}</strong> {r.name}</span> },
        { id: 'budget', header: 'Budget', accessor: 'budget', align: 'end', cell: (r) => currency(r.budget) },
        { id: 'actual', header: 'Actual', accessor: 'actual', align: 'end', cell: (r) => currency(r.actual) },
        {
          id: 'variance', header: 'Variance', align: 'end',
          cell: (r) => {
            const over = r.actual > r.budget;
            return <StatusIndicator tone={over ? 'error' : 'success'} size="sm">{over ? 'Over' : 'Within'} budget</StatusIndicator>;
          },
        },
      ]}
    />
  );
}
