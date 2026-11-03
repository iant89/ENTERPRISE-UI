import { useState } from 'react';
import { Avatar, Badge, KanbanBoard, type KanbanItem } from '@enterprise-ui/react';

export const title = 'Sales pipeline';
export const description = 'Drag cards with the mouse, or focus a card’s handle and press Space to pick it up, the arrow keys to move and Space to drop. `limit` flags WIP overruns; `canMove` stops a lost deal from being moved straight to Won (keyboard moves skip that column).';

interface Deal extends KanbanItem {
  name: string;
  account: string;
  value: number;
  owner: string;
  risk?: boolean;
}

const initial: Deal[] = [
  { id: 'd1', columnId: 'lead', name: 'Fleet telematics', account: 'Contoso', value: 120, owner: 'Avery Lindqvist' },
  { id: 'd2', columnId: 'lead', name: 'Warehouse robotics', account: 'Fabrikam', value: 340, owner: 'Kai Moreno' },
  { id: 'd3', columnId: 'qualified', name: 'ERP migration', account: 'Northwind', value: 890, owner: 'Priya Natarajan', risk: true },
  { id: 'd4', columnId: 'proposal', name: 'Spare parts portal', account: 'Tailspin', value: 210, owner: 'Avery Lindqvist' },
  { id: 'd5', columnId: 'proposal', name: 'Field service app', account: 'Litware', value: 150, owner: 'Kai Moreno' },
  { id: 'd6', columnId: 'proposal', name: 'Quality analytics', account: 'Adventure Works', value: 95, owner: 'Priya Natarajan' },
  { id: 'd7', columnId: 'won', name: 'Supplier onboarding', account: 'Woodgrove', value: 60, owner: 'Kai Moreno' },
  { id: 'd8', columnId: 'lost', name: 'Fleet tracking', account: 'Litware', value: 180, owner: 'Avery Lindqvist' },
];

const columns = [
  { id: 'lead', title: 'Lead' },
  { id: 'qualified', title: 'Qualified', limit: 3 },
  { id: 'proposal', title: 'Proposal', limit: 2 },
  { id: 'won', title: 'Won' },
  { id: 'lost', title: 'Lost' },
];

export default function KanbanPipeline() {
  const [deals, setDeals] = useState(initial);
  const [log, setLog] = useState('');
  const total = (col: string) => deals.filter((d) => d.columnId === col).reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <KanbanBoard
        label="Sales pipeline"
        columns={columns.map((c) => ({ ...c, meta: `${total(c.id)} K EUR` }))}
        items={deals}
        onItemsChange={setDeals}
        onMove={({ item, toColumnId }) => setLog(`Saved: ${item.name} → ${columns.find((c) => c.id === toColumnId)?.title}`)}
        getItemLabel={(d) => d.name}
        // A lost deal can be reopened as a lead, but not marked as won directly.
        canMove={(d, to) => !(d.columnId === 'lost' && to === 'won')}
        renderItem={(d) => (
          <div style={{ display: 'grid', gap: 4 }}>
            <strong>{d.name}</strong>
            <span style={{ color: 'var(--eui-color-text-secondary)', fontSize: 'var(--eui-font-size-sm)' }}>{d.account}</span>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{d.value} K EUR</span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {d.risk && <Badge tone="warning">At risk</Badge>}
                <Avatar name={d.owner} size="xs" />
              </span>
            </span>
          </div>
        )}
      />
      <p style={{ margin: 0 }}>{log || 'Move a deal to see the save callback.'}</p>
    </div>
  );
}
