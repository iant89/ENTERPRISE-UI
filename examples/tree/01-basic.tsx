import { Badge, Tree, Icon } from '@enterprise-ui/react';

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
            id: 'emea', label: 'EMEA', icon: <Icon name="building" />,
            children: [
              { id: 'de', label: 'Germany', icon: <Icon name="factory" />, children: [
                { id: 'ber', label: 'Berlin plant', icon: <Icon name="retail-store" />, trailing: <Badge count={3} tone="warning" /> },
                { id: 'muc', label: 'Munich plant', icon: <Icon name="retail-store" /> },
              ] },
              { id: 'fr', label: 'France', icon: <Icon name="factory" />, children: [{ id: 'lyo', label: 'Lyon plant', icon: <Icon name="retail-store" /> }] },
            ],
          },
          { id: 'amer', label: 'Americas', icon: <Icon name="building" />, children: [{ id: 'chi', label: 'Chicago DC', icon: <Icon name="retail-store" /> }] },
          { id: 'apj', label: 'Asia Pacific', icon: <Icon name="building" />, disabled: true },
        ]}
      />
    </div>
  );
}
