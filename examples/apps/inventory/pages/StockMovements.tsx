import { useState } from 'react';
import { FilterBar, Page, Select, Timeline } from '@enterprise-ui/react';
import { movementTone, stockMovements, type MovementType } from '../data';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';

const types: MovementType[] = ['Receipt', 'Issue', 'Transfer', 'Adjustment'];

export function StockMovements() {
  const { navigate } = useInventory();
  const [type, setType] = useState<MovementType | null>(null);
  const rows = type ? stockMovements.filter((m) => m.type === type) : stockMovements;
  return (
    <Page
      title="Stock movements"
      subtitle="Goods receipts, issues, transfers and adjustments."
      breadcrumbs={crumbs(navigate, ['Home', 'home'], 'Inventory', 'Stock movements')}
      toolbar={
        <FilterBar liveMode activeCount={type ? 1 : 0} onClear={() => setType(null)}>
          <Select label="Movement type" placeholder="All types" size="sm" options={types.map((t) => ({ value: t, label: t }))} value={type} onChange={setType} />
        </FilterBar>
      }
    >
      <Timeline
        aria-label="Stock movements"
        items={rows.map((m) => ({
          id: m.id,
          title: `${m.type}: ${m.product} (${m.quantity > 0 ? '+' : ''}${m.quantity})`,
          timestamp: m.date,
          description: `${m.id} · ${m.reference}`,
          tone: movementTone[m.type],
        }))}
      />
    </Page>
  );
}
