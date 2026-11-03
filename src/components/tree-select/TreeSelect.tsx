import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { useFormControl, type FieldProps } from '../form-field';
import { Popover } from '../popover';
import { Tree, type TreeNode } from '../tree';
import styles from './TreeSelect.module.css';

export interface TreeSelectLabels {
  search: string;
  noMatches: string;
  placeholder: string;
}

export interface TreeSelectProps extends FieldProps {
  /** The hierarchy, e.g. company › plant › cost center. */
  nodes: TreeNode[];
  /** Selected node id. Providing it makes the selection controlled. */
  value?: string | null;
  /** Initial selection when uncontrolled. @default null */
  defaultValue?: string | null;
  /** Called with the selected id, the node and the path of labels from the root. */
  onChange?: (id: string | null, node: TreeNode | undefined, path: string[]) => void;
  /** Only leaf nodes can be chosen (parents only expand). @default false */
  leavesOnly?: boolean;
  /** Separator between path segments in the field. @default ' › ' */
  separator?: string;
  /** Required field. @default false */
  required?: boolean;
  /** Disabled field. @default false */
  disabled?: boolean;
  /** Id of the trigger. */
  id?: string;
  /** Class name for the trigger. */
  className?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<TreeSelectLabels>;
}

const defaultLabels: TreeSelectLabels = { search: 'Filter', noMatches: 'No matching entries', placeholder: 'Select' };

function findPath(nodes: TreeNode[], id: string, trail: TreeNode[] = []): TreeNode[] | null {
  for (const n of nodes) {
    const here = [...trail, n];
    if (n.id === id) return here;
    const hit = n.children && findPath(n.children, id, here);
    if (hit) return hit;
  }
  return null;
}

/** Keeps nodes that match, plus the ancestors needed to reach them. */
function filterTree(nodes: TreeNode[], text: string): TreeNode[] {
  return nodes.flatMap((n) => {
    const children = n.children ? filterTree(n.children, text) : [];
    if (n.label.toLowerCase().includes(text) || children.length) return [{ ...n, children: n.label.toLowerCase().includes(text) ? n.children : children }];
    return [];
  });
}

const allIds = (nodes: TreeNode[]): string[] => nodes.flatMap((n) => [n.id, ...(n.children ? allIds(n.children) : [])]);

/** Choose one node from a hierarchy (cost centers, material groups, org units); the field shows its path. */
export function TreeSelect({
  nodes, value, defaultValue = null, onChange, leavesOnly = false, separator = ' › ', labels: labelOverrides, className,
  label, description, error, status, statusMessage, hideLabel, labelPosition, required, disabled, id,
}: TreeSelectProps) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled });
  const [selected, setSelected] = useControllableState<string | null>(value, defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const path = useMemo(() => (selected ? findPath(nodes, selected) ?? [] : []), [nodes, selected]);
  const text = query.trim().toLowerCase();
  const shown = useMemo(() => (text ? filterTree(nodes, text) : nodes), [nodes, text]);
  // Expand to the current selection, or everything while filtering.
  const expanded = text ? allIds(shown) : path.slice(0, -1).map((n) => n.id);

  const choose = (nodeId: string | null, node?: TreeNode) => {
    if (!nodeId || !node) return;
    if (leavesOnly && node.children?.length) return;
    const p = findPath(nodes, nodeId) ?? [];
    setSelected(nodeId);
    onChange?.(nodeId, node, p.map((n) => n.label));
    setOpen(false);
    setQuery('');
  };

  const display: ReactNode = path.length ? path.map((n) => n.label).join(separator) : <span className={styles.placeholder}>{labels.placeholder}</span>;

  return control.wrap(
    <Popover
      open={open}
      onOpenChange={setOpen}
      aria-label={typeof label === 'string' ? label : labels.placeholder}
      width="22rem"
      placement="bottom-start"
      trigger={
        <button
          type="button"
          id={control.id}
          className={cx(styles.trigger, control.status !== 'none' && styles[control.status], className)}
          disabled={control.disabled}
          aria-haspopup="dialog"
          // Buttons do not support aria-required; required is conveyed by the label's asterisk and validation.
          aria-describedby={control.ariaProps['aria-describedby']}
          aria-invalid={control.ariaProps['aria-invalid']}
          aria-labelledby={control.labelId ? `${control.labelId} ${control.id}-value` : undefined}
        >
          <span id={`${control.id}-value`} className={styles.value}>
            {display}
          </span>
          <ChevronDown aria-hidden="true" className={styles.chevron} />
        </button>
      }
    >
      <div className={styles.panel}>
        <input type="search" className={styles.search} placeholder={labels.search} aria-label={labels.search} value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
        {shown.length ? (
          <Tree key={text} aria-label={typeof label === 'string' ? label : labels.placeholder} nodes={shown} defaultExpandedIds={expanded} selectedId={selected} onSelect={choose} className={styles.tree} />
        ) : (
          <p className={styles.empty}>{labels.noMatches}</p>
        )}
      </div>
    </Popover>,
  );
}
