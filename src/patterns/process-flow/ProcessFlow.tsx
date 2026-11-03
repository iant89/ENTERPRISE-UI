import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { AlertTriangle, Check, Circle, Clock, X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import styles from './ProcessFlow.module.css';

export type ProcessFlowStatus = 'done' | 'current' | 'pending' | 'warning' | 'error';

export interface ProcessFlowNode {
  /** Unique node id. */
  id: string;
  /** Document or step name, e.g. "Delivery 80001234". */
  title: ReactNode;
  /** Secondary line, e.g. a date or owner. */
  subtitle?: ReactNode;
  /** Processing state; sets the icon and color. */
  status: ProcessFlowStatus;
  /** Visible status text, e.g. "Shipped" or "Blocked: credit check". Required so status is never color-only. */
  statusText: string;
  /** Extra facts, e.g. an amount. */
  meta?: ReactNode;
}

export interface ProcessFlowLane {
  /** Unique lane id. */
  id: string;
  /** Stage name, e.g. "Invoice". */
  title: string;
  /** Documents in this stage. An empty lane is a stage that has not started. */
  nodes: ProcessFlowNode[];
  /** Overrides the lane status, which otherwise follows its most severe node. */
  status?: ProcessFlowStatus;
}

export interface ProcessFlowLabels {
  /** Visually hidden lane status, read after the lane title. */
  status: Record<ProcessFlowStatus, string>;
  /** Text for a lane with no documents yet. */
  notStarted: string;
}

export interface ProcessFlowProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onSelect'> {
  /** Accessible name, e.g. "Document flow for sales order 4711". */
  label: string;
  /** Stages in process order. */
  lanes: ProcessFlowLane[];
  /** Makes nodes selectable (e.g. to open the document). */
  onNodeSelect?: (node: ProcessFlowNode, lane: ProcessFlowLane) => void;
  /** Highlights the node shown in a detail area. */
  selectedNodeId?: string;
  /** Overrides for the built-in strings; `status` may override only some statuses. */
  labels?: Partial<Omit<ProcessFlowLabels, 'status'>> & { status?: Partial<ProcessFlowLabels['status']> };
}

const defaultLabels: ProcessFlowLabels = {
  status: { done: 'Completed', current: 'In progress', pending: 'Not started', warning: 'Needs attention', error: 'Blocked' },
  notStarted: 'Not started',
};

const ICONS: Record<ProcessFlowStatus, typeof Check> = { done: Check, current: Clock, pending: Circle, warning: AlertTriangle, error: X };
const SEVERITY: ProcessFlowStatus[] = ['error', 'warning', 'current', 'pending', 'done'];

function laneStatus(lane: ProcessFlowLane): ProcessFlowStatus {
  if (lane.status) return lane.status;
  if (lane.nodes.length === 0) return 'pending';
  if (lane.nodes.every((n) => n.status === 'done')) return 'done';
  return SEVERITY.find((s) => s !== 'done' && lane.nodes.some((n) => n.status === s)) ?? 'current';
}

/** The documents of a business process across its stages (order → delivery → invoice → payment). */
export const ProcessFlow = forwardRef<HTMLOListElement, ProcessFlowProps>(function ProcessFlow(
  { label, lanes, onNodeSelect, selectedNodeId, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides, status: { ...defaultLabels.status, ...labelOverrides?.status } };
  return (
    <ol ref={ref} className={cx(styles.flow, className)} aria-label={label} {...rest}>
      {lanes.map((lane, index) => {
        const status = laneStatus(lane);
        const Icon = ICONS[status];
        const next = lanes[index + 1];
        // The connector to the next lane is solid once that lane has started.
        const reached = next ? laneStatus(next) !== 'pending' : false;
        return (
          <li key={lane.id} className={cx(styles.lane, styles[status], next && styles.hasNext, reached && styles.reached)}>
            <div className={styles.laneHeader}>
              <span className={styles.icon} aria-hidden="true">
                <Icon />
              </span>
              <span className={styles.laneTitle}>
                {lane.title}
                <span className="eui-visually-hidden">, {labels.status[status]}</span>
              </span>
              {next && <span className={styles.connector} aria-hidden="true" />}
            </div>
            {lane.nodes.length === 0 ? (
              <p className={styles.placeholder}>{labels.notStarted}</p>
            ) : (
              <ul className={styles.nodes}>
                {lane.nodes.map((node) => {
                  const NodeIcon = ICONS[node.status];
                  const body = (
                    <>
                      <span className={styles.nodeTitle}>{node.title}</span>
                      {node.subtitle && <span className={styles.nodeSubtitle}>{node.subtitle}</span>}
                      <span className={cx(styles.nodeStatus, styles[`text-${node.status}`])}>
                        <NodeIcon aria-hidden="true" />
                        {node.statusText}
                      </span>
                      {node.meta && <span className={styles.nodeMeta}>{node.meta}</span>}
                    </>
                  );
                  return (
                    <li key={node.id} className={cx(styles.node, styles[`node-${node.status}`], selectedNodeId === node.id && styles.selected)}>
                      {onNodeSelect ? (
                        <button type="button" className={styles.nodeButton} aria-current={selectedNodeId === node.id ? 'true' : undefined} onClick={() => onNodeSelect(node, lane)}>
                          {body}
                        </button>
                      ) : (
                        <div className={styles.nodeBody}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
});
