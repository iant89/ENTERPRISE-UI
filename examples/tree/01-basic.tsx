import { Building2, Factory, Warehouse } from 'lucide-react';
import { Badge, Tree } from '@enterprise-ui/react';

export const title = 'Organizational tree';
export const description = '→ expands or enters a branch, ← collapses or returns to the parent, * expands all siblings, and typing jumps to a matching node.';

export default function TreeBasic() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Tree
        aria-label="Plants and warehouses"
        defaultExpandedIds={['emea', 'de']}
        defaultSelectedId="ber"
        nodes={[
          {
            id: 'emea', label: 'EMEA', icon: <Building2 />,
            children: [
              { id: 'de', label: 'Germany', icon: <Factory />, children: [
                { id: 'ber', label: 'Berlin plant', icon: <Warehouse />, trailing: <Badge count={3} tone="warning" /> },
                { id: 'muc', label: 'Munich plant', icon: <Warehouse /> },
              ] },
              { id: 'fr', label: 'France', icon: <Factory />, children: [{ id: 'lyo', label: 'Lyon plant', icon: <Warehouse /> }] },
            ],
          },
          { id: 'amer', label: 'Americas', icon: <Building2 />, children: [{ id: 'chi', label: 'Chicago DC', icon: <Warehouse /> }] },
          { id: 'apj', label: 'Asia Pacific', icon: <Building2 />, disabled: true },
        ]}
      />
    </div>
  );
}
