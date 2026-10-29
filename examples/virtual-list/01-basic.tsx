import { useState } from 'react';
import { VirtualList } from '@enterprise-ui/react';
const items = Array.from({ length: 10000 }, (_, index) => ({ id: `item-${index}`, label: `Inventory item ${index + 1}` }));
export default function VirtualListExample() {
  const [selected, setSelected] = useState<string[]>([]);
  return <VirtualList aria-label="Inventory" items={items} getItemId={(item) => item.id} renderItem={(item) => item.label} itemHeight={40} selectedIds={selected} onSelectionChange={setSelected} />;
}
