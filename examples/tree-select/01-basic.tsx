import { TreeSelect } from '@enterprise-ui/react';

export const title = 'Cost center hierarchy';
export const description = 'Filter the hierarchy and pick a node; the field shows its path. With `leavesOnly`, company and plant nodes only expand.';

const nodes = [
  { id: 'c1000', label: '1000 Contoso AG', children: [
    { id: 'p1010', label: '1010 Plant Hamburg', children: [{ id: 'cc4100', label: '4100 Assembly' }, { id: 'cc4200', label: '4200 Quality' }, { id: 'cc4300', label: '4300 Maintenance' }] },
    { id: 'p1020', label: '1020 Plant Munich', children: [{ id: 'cc5100', label: '5100 Machining' }, { id: 'cc5200', label: '5200 Logistics' }] },
  ] },
  { id: 'c2000', label: '2000 Contoso SAS', children: [{ id: 'p2010', label: '2010 Plant Lyon', children: [{ id: 'cc6100', label: '6100 Assembly' }] }] },
];

export default function TreeSelectBasic() {
  return (
    <div style={{ maxWidth: 360 }}>
      <TreeSelect label="Cost center" nodes={nodes} leavesOnly defaultValue="cc4200" required />
    </div>
  );
}
