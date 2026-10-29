import { VirtualTree, type TreeNode } from '@enterprise-ui/react';
const nodes: TreeNode[] = [{ id: 'root', label: 'Inventory', children: Array.from({ length: 5000 }, (_, i) => ({ id: `item-${i}`, label: `Item ${i + 1}` })) }];
export default function Example() { return <VirtualTree aria-label="Inventory tree" nodes={nodes} defaultExpandedIds={['root']} itemHeight={40} height={240} />; }
