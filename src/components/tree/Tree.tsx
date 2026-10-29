import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type CSSProperties } from 'react';
import { ChevronRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { findTypeaheadIndex } from '../../utilities/keyboard';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './Tree.module.css';

export interface TreeNode {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Trailing content (badge, count). */
  trailing?: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeProps {
  nodes: TreeNode[];
  'aria-label': string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string | null;
  /** @default null */
  defaultSelectedId?: string | null;
  onSelect?: (id: string | null, node?: TreeNode) => void;
  className?: string;
}

interface FlatNode {
  node: TreeNode;
  level: number;
  parentId: string | null;
}

function flattenVisible(nodes: TreeNode[], expanded: Set<string>, level = 1, parentId: string | null = null, out: FlatNode[] = []): FlatNode[] {
  for (const node of nodes) {
    out.push({ node, level, parentId });
    if (node.children?.length && expanded.has(node.id)) flattenVisible(node.children, expanded, level + 1, node.id, out);
  }
  return out;
}

/**
 * Hierarchical list (`role="tree"`). ↑/↓ move, → expands or enters a
 * branch, ← collapses or returns to the parent, Enter/Space selects,
 * Home/End jump, and typing jumps to a matching item.
 */
export function Tree({ nodes, 'aria-label': ariaLabel, expandedIds, defaultExpandedIds = [], onExpandedChange, selectedId, defaultSelectedId = null, onSelect, className }: TreeProps) {
  const [expanded, setExpanded] = useControllableState(expandedIds, defaultExpandedIds, onExpandedChange);
  const [selected, setSelected] = useControllableState<string | null>(selectedId, defaultSelectedId);
  const expandedSet = useMemo(() => new Set(expanded), [expanded]);
  const visible = useMemo(() => flattenVisible(nodes, expandedSet), [nodes, expandedSet]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const treeRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ query: '', timer: undefined as ReturnType<typeof setTimeout> | undefined });

  const tabStop = focusedId && visible.some((v) => v.node.id === focusedId) ? focusedId : selected && visible.some((v) => v.node.id === selected) ? selected : visible[0]?.node.id;

  const focusNode = (id: string) => {
    setFocusedId(id);
    treeRef.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`)?.focus();
  };
  const toggleExpanded = (id: string, open?: boolean) => {
    const isOpen = expandedSet.has(id);
    const next = open ?? !isOpen;
    if (next === isOpen) return;
    setExpanded(next ? [...expanded, id] : expanded.filter((e) => e !== id));
  };
  const select = (node: TreeNode) => {
    if (node.disabled) return;
    setSelected(node.id);
    onSelect?.(node.id, node);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const index = visible.findIndex((v) => v.node.id === (document.activeElement as HTMLElement)?.dataset.treeId);
    if (index < 0) return;
    const { node, parentId } = visible[index];
    const hasChildren = !!node.children?.length;
    const isOpen = expandedSet.has(node.id);
    let handled = true;
    switch (event.key) {
      case 'ArrowDown':
        if (index < visible.length - 1) focusNode(visible[index + 1].node.id);
        break;
      case 'ArrowUp':
        if (index > 0) focusNode(visible[index - 1].node.id);
        break;
      case 'ArrowRight':
        if (hasChildren && !isOpen) toggleExpanded(node.id, true);
        else if (hasChildren && isOpen) focusNode(node.children![0].id);
        break;
      case 'ArrowLeft':
        if (hasChildren && isOpen) toggleExpanded(node.id, false);
        else if (parentId) focusNode(parentId);
        break;
      case 'Home':
        focusNode(visible[0].node.id);
        break;
      case 'End':
        focusNode(visible[visible.length - 1].node.id);
        break;
      case 'Enter':
      case ' ':
        select(node);
        break;
      case '*': {
        const siblings = parentId ? visible.find((v) => v.node.id === parentId)?.node.children ?? [] : nodes;
        setExpanded(Array.from(new Set([...expanded, ...siblings.filter((s) => s.children?.length).map((s) => s.id)])));
        break;
      }
      default: {
        handled = false;
        if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey) {
          const state = typeahead.current;
          clearTimeout(state.timer);
          state.query += event.key;
          state.timer = setTimeout(() => (state.query = ''), 500);
          const found = findTypeaheadIndex(visible.map((v) => v.node.label), state.query, state.query.length > 1 ? index - 1 : index);
          if (found >= 0) focusNode(visible[found].node.id);
        }
      }
    }
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const renderNodes = (list: TreeNode[], level: number): ReactNode =>
    list.map((node, i) => {
      const hasChildren = !!node.children?.length;
      const isOpen = hasChildren && expandedSet.has(node.id);
      return (
        <li
          key={node.id}
          role="treeitem"
          data-tree-id={node.id}
          aria-level={level}
          aria-setsize={list.length}
          aria-posinset={i + 1}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={selected === node.id}
          aria-disabled={node.disabled || undefined}
          tabIndex={tabStop === node.id ? 0 : -1}
          className={cx(styles.item, isOpen && styles.expanded)}
          onFocus={(event) => {
            if (event.target === event.currentTarget) setFocusedId(node.id);
          }}
        >
          <div
            className={styles.row}
            style={{ '--_level': level } as CSSProperties}
            onClick={() => {
              focusNode(node.id);
              if (hasChildren) toggleExpanded(node.id);
              select(node);
            }}
          >
            <span className={styles.toggle} aria-hidden="true">
              {hasChildren && <ChevronRight />}
            </span>
            {node.icon && <span className={styles.icon} aria-hidden="true">{node.icon}</span>}
            <span className={styles.label}>{node.label}</span>
            {node.trailing && <span className={styles.trailing}>{node.trailing}</span>}
          </div>
          {isOpen && (
            <ul role="group" className={styles.group}>
              {renderNodes(node.children!, level + 1)}
            </ul>
          )}
        </li>
      );
    });

  return (
    <ul ref={treeRef} role="tree" aria-label={ariaLabel} className={cx(styles.tree, className)} onKeyDown={onKeyDown}>
      {renderNodes(nodes, 1)}
    </ul>
  );
}
