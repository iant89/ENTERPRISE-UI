import { Badge, Tree, IconProvider } from '@enterprise-ui/react';

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
            id: 'emea', label: 'EMEA', icon: IconProvider.getIcon('building'),
            children: [
              { id: 'de', label: 'Germany', icon: IconProvider.getIcon('factory'), children: [
                { id: 'ber', label: 'Berlin plant', icon: IconProvider.getIcon('retail-store'), trailing: <Badge count={3} tone="warning" /> },
                { id: 'muc', label: 'Munich plant', icon: IconProvider.getIcon('retail-store') },
              ] },
              { id: 'fr', label: 'France', icon: IconProvider.getIcon('factory'), children: [{ id: 'lyo', label: 'Lyon plant', icon: IconProvider.getIcon('retail-store') }] },
            ],
          },
          { id: 'amer', label: 'Americas', icon: IconProvider.getIcon('building'), children: [{ id: 'chi', label: 'Chicago DC', icon: IconProvider.getIcon('retail-store') }] },
          { id: 'apj', label: 'Asia Pacific', icon: IconProvider.getIcon('building'), disabled: true },
        ]}
      />
    </div>
  );
}
