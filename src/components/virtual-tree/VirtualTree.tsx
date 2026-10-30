import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import type { TreeNode, TreeProps } from '../tree';
import { getVirtualWindow } from '../virtual-list/virtualWindow';
import styles from './VirtualTree.module.css';

export interface VirtualTreeProps extends Omit<TreeProps, 'className'> {
  /** Fixed row height, in CSS pixels. Variable-height nodes are unsupported. */
  itemHeight: number;
  /** Height of the scrolling viewport, in pixels. */
  height?: number;
  /** Number of extra rows rendered above and below the viewport for smoother scrolling. */
  overscan?: number;
  /** Turn off windowing as an accessibility alternative. @default true */
  virtualized?: boolean;
}
interface FlatNode { node: TreeNode; level: number; parentId: string | null; position: number; setsize: number }
function flatten(nodes: TreeNode[], expanded: Set<string>, level = 1, parentId: string | null = null, result: FlatNode[] = []): FlatNode[] {
  nodes.forEach((node, index) => {
    result.push({ node, level, parentId, position: index + 1, setsize: nodes.length });
    if (node.children?.length && expanded.has(node.id)) flatten(node.children, expanded, level + 1, node.id, result);
  });
  return result;
}
/** Fixed-height virtualized tree sharing TreeNode and controlled state contracts with Tree. */
export function VirtualTree({ nodes, 'aria-label': label, expandedIds, defaultExpandedIds = [], onExpandedChange, selectedId, defaultSelectedId = null, onSelect, itemHeight, height = 320, overscan = 3, virtualized = true }: VirtualTreeProps) {
  const [expanded, setExpanded] = useControllableState(expandedIds, defaultExpandedIds, onExpandedChange);
  const [selected, setSelected] = useControllableState<string | null>(selectedId, defaultSelectedId);
  const expandedSet = useMemo(() => new Set(expanded), [expanded]);
  const visible = useMemo(() => flatten(nodes, expandedSet), [nodes, expandedSet]);
  const [activeId, setActiveId] = useState<string>();
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(height);
  const tree = useRef<HTMLDivElement>(null);
  const id = useId(undefined, 'virtual-tree');
  const rowHeight = Number.isFinite(itemHeight) && itemHeight > 0 ? itemHeight : 1;
  const extra = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0;
  const range = getVirtualWindow(visible.length, rowHeight, viewportHeight, scrollTop, extra);
  const start = virtualized ? range.start : 0; const end = virtualized ? range.end : visible.length;
  const activeIndex = Math.max(0, visible.findIndex(({ node }) => node.id === activeId));
  const activeVisible = visible.length > 0 && activeIndex >= start && activeIndex < end;
  const optionId = (index: number) => `${id}-${index}`;
  useEffect(() => {
    const element = tree.current; if (!element) return;
    const update = () => setViewportHeight(element.clientHeight || height);
    update(); if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update); observer.observe(element); return () => observer.disconnect();
  }, [height]);
  const move = (index: number) => {
    if (!visible.length) return;
    const next = Math.min(visible.length - 1, Math.max(0, index)); setActiveId(visible[next].node.id);
    const element = tree.current; if (!element) return;
    const top = next * rowHeight;
    if (top < element.scrollTop) element.scrollTop = top;
    else if (top + rowHeight > element.scrollTop + viewportHeight) element.scrollTop = top + rowHeight - viewportHeight;
    setScrollTop(element.scrollTop);
  };
  const toggle = (node: TreeNode, open: boolean) => {
    if (!node.children?.length) return;
    setExpanded(open ? [...new Set([...expanded, node.id])] : expanded.filter((entry) => entry !== node.id));
  };
  const select = (node: TreeNode) => { if (node.disabled) return; setSelected(node.id); onSelect?.(node.id, node); };
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const entry = visible[activeIndex]; if (!entry) return;
    const { node, parentId } = entry;
    switch (event.key) {
      case 'ArrowDown': move(activeIndex + 1); break;
      case 'ArrowUp': move(activeIndex - 1); break;
      case 'Home': move(0); break;
      case 'End': move(visible.length - 1); break;
      case 'ArrowRight': if (node.children?.length && !expandedSet.has(node.id)) toggle(node, true); else if (node.children?.length) move(activeIndex + 1); break;
      case 'ArrowLeft': if (node.children?.length && expandedSet.has(node.id)) toggle(node, false); else if (parentId) move(visible.findIndex((item) => item.node.id === parentId)); break;
      case 'Enter': case ' ': select(node); break;
      default: return;
    }
    event.preventDefault();
  };
  return <div ref={tree} role="tree" aria-label={label} tabIndex={0} aria-activedescendant={activeVisible ? optionId(activeIndex) : undefined} className={styles.viewport} style={{ height }} onKeyDown={keyDown} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
    <div role="none" style={virtualized ? { height: visible.length * rowHeight, position: 'relative' } : undefined}>
      {visible.slice(start, end).map((entry, offset) => {
        const index = start + offset; const { node, level, position, setsize } = entry;
        return <div role="treeitem" id={optionId(index)} key={node.id} aria-level={level} aria-posinset={position} aria-setsize={setsize} aria-expanded={node.children?.length ? expandedSet.has(node.id) : undefined} aria-selected={selected === node.id} aria-disabled={node.disabled || undefined} data-active={activeVisible && index === activeIndex || undefined} className={styles.item} style={{ height: rowHeight, paddingInlineStart: `${(level - 1) * 1.25 + 0.5}rem`, ...(virtualized ? { position: 'absolute', top: index * rowHeight, left: 0, right: 0 } : {}) }} onClick={() => { move(index); tree.current?.focus(); if (node.children?.length) toggle(node, !expandedSet.has(node.id)); select(node); }}>
          <span aria-hidden="true" className={styles.toggle}>{node.children?.length ? <ChevronRight className={expandedSet.has(node.id) ? styles.expanded : undefined} /> : null}</span>{node.icon && <span aria-hidden="true">{node.icon}</span>}<span className={styles.label}>{node.label}</span>{node.trailing && <span>{node.trailing}</span>}
        </div>;
      })}
    </div>
  </div>;
}
