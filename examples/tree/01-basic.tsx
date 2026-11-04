import { Badge, Tree, BuildingIcon, FactoryIcon, RetailStoreIcon } from '@enterprise-ui/react';

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
            id: 'emea', label: 'EMEA', icon: <BuildingIcon />,
            children: [
              { id: 'de', label: 'Germany', icon: <FactoryIcon />, children: [
                { id: 'ber', label: 'Berlin plant', icon: <RetailStoreIcon />, trailing: <Badge count={3} tone="warning" /> },
                { id: 'muc', label: 'Munich plant', icon: <RetailStoreIcon /> },
              ] },
              { id: 'fr', label: 'France', icon: <FactoryIcon />, children: [{ id: 'lyo', label: 'Lyon plant', icon: <RetailStoreIcon /> }] },
            ],
          },
          { id: 'amer', label: 'Americas', icon: <BuildingIcon />, children: [{ id: 'chi', label: 'Chicago DC', icon: <RetailStoreIcon /> }] },
          { id: 'apj', label: 'Asia Pacific', icon: <BuildingIcon />, disabled: true },
        ]}
      />
    </div>
  );
}
