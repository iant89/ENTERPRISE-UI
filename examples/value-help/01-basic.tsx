import { useState } from 'react';
import { Stack, ValueHelpInput } from '@enterprise-ui/react';

export const title = 'Supplier and material value help';
export const description = 'Press F4 in the field or use its button. The material help searches a simulated server of 3,200 materials with a debounced, cancellable request; the supplier help filters local data and allows several choices.';

interface Supplier { id: string; name: string; city: string; country: string }
interface Material { id: string; text: string; group: string }
const suppliers: Supplier[] = [
  { id: '100045', name: 'Northwind Components', city: 'Hamburg', country: 'DE' },
  { id: '100046', name: 'Contoso Industrial', city: 'Lyon', country: 'FR' },
  { id: '100047', name: 'Fabrikam Metals', city: 'Munich', country: 'DE' },
  { id: '100048', name: 'Adventure Works', city: 'Seattle', country: 'US' },
];
const groups = ['Valves', 'Sensors', 'Fasteners', 'Lubricants'];
const materials: Material[] = Array.from({ length: 3200 }, (_, i) => ({ id: `MAT-${String(1000 + i)}`, text: `${groups[i % 4].slice(0, -1)} type ${i}`, group: groups[i % 4] }));

export default function ValueHelpBasic() {
  const [chosen, setChosen] = useState<Supplier[]>([]);
  return (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <ValueHelpInput
        label="Suppliers"
        title="Select suppliers"
        selectionMode="multiple"
        items={suppliers}
        value={chosen}
        onChange={setChosen}
        columns={[{ key: 'id', header: 'Supplier' }, { key: 'name', header: 'Name' }, { key: 'city', header: 'City' }]}
        filters={[{ key: 'country', label: 'Country', options: [{ value: 'DE', label: 'Germany' }, { value: 'FR', label: 'France' }, { value: 'US', label: 'United States' }] }]}
        getKey={(s) => s.id}
        getLabel={(s) => `${s.name} (${s.id})`}
      />
      <ValueHelpInput<Material>
        label="Material"
        title="Select material"
        columns={[{ key: 'id', header: 'Material' }, { key: 'text', header: 'Description' }, { key: 'group', header: 'Group' }]}
        filters={[{ key: 'group', label: 'Material group', options: groups.map((g) => ({ value: g, label: g })) }]}
        getKey={(m) => m.id}
        getLabel={(m) => `${m.text} (${m.id})`}
        fetchItems={(q, signal) =>
          new Promise((resolve, reject) => {
            const t = setTimeout(() => {
              const hits = materials.filter((m) => (!q.search || `${m.id} ${m.text}`.toLowerCase().includes(q.search.toLowerCase())) && (!q.filters.group || m.group === q.filters.group));
              resolve({ items: hits.slice(0, 50), total: hits.length });
            }, 300);
            signal.addEventListener('abort', () => {
              clearTimeout(t);
              reject(new DOMException('aborted', 'AbortError'));
            });
          })
        }
      />
    </Stack>
  );
}
