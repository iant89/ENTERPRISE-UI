import { useMemo } from 'react';
import { Text, Tree, type TreeNode } from '@enterprise-ui/react';
import { walk, type StudioNode } from './model/jsx';
import styles from './Studio.module.css';

function label(node: StudioNode) {
  const name = node.kind === 'fragment' ? 'Fragment' : node.name;
  return node.text ? `${name} · ${node.text.length > 24 ? `${node.text.slice(0, 24)}…` : node.text}` : name;
}

function toTree(node: StudioNode): TreeNode {
  return {
    id: node.id,
    label: label(node),
    children: [
      ...node.children.map(toTree),
      ...node.locked.map((l, i) => ({ id: `locked:${node.id}:${i}`, label: `{ code } ${l.text.length > 28 ? `${l.text.slice(0, 28)}…` : l.text}`, disabled: true })),
    ],
  };
}

export interface OutlineProps {
  root: StudioNode | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** The page's element tree. Expressions such as `{items.map(...)}` are locked and edited in code. */
export function Outline({ root, selectedId, onSelect }: OutlineProps) {
  const nodes = useMemo(() => (root ? [toTree(root)] : []), [root]);
  const expanded = useMemo(() => { const ids: string[] = []; walk(root, (n) => ids.push(n.id)); return ids; }, [root]);
  if (!root) return <Text tone="secondary" size="sm" className={styles.empty}>Fix the code to see the outline.</Text>;
  return (
    <Tree
      aria-label="Page outline"
      nodes={nodes}
      expandedIds={expanded}
      selectedId={selectedId}
      onSelect={(id) => { if (id && !id.startsWith('locked:')) onSelect(id); }}
    />
  );
}
