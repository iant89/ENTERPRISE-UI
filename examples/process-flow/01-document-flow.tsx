import { useState } from 'react';
import { ProcessFlow, type ProcessFlowNode } from '@enterprise-ui/react';

export const title = 'Sales order document flow';
export const description = 'Lanes take the status of their most severe document. Every node has visible status text, so state is never color-only. On phones the lanes stack vertically.';

export default function ProcessFlowDocumentFlow() {
  const [selected, setSelected] = useState<ProcessFlowNode | null>(null);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <ProcessFlow
        label="Document flow for sales order 4711"
        selectedNodeId={selected?.id}
        onNodeSelect={(node) => setSelected(node)}
        lanes={[
          { id: 'order', title: 'Sales order', nodes: [{ id: 'so', title: 'Sales order 4711', subtitle: '02 Nov 2026', status: 'done', statusText: 'Confirmed', meta: '48,210 EUR' }] },
          {
            id: 'delivery',
            title: 'Delivery',
            nodes: [
              { id: 'dl1', title: 'Delivery 80001234', subtitle: 'Hamburg → Lyon', status: 'done', statusText: 'Shipped' },
              { id: 'dl2', title: 'Delivery 80001235', subtitle: 'Back order', status: 'warning', statusText: 'Partially picked' },
            ],
          },
          { id: 'invoice', title: 'Invoice', nodes: [{ id: 'inv', title: 'Invoice 90004410', subtitle: 'For delivery 80001234', status: 'error', statusText: 'Blocked: price variance' }] },
          { id: 'payment', title: 'Payment', nodes: [] },
        ]}
      />
      <p style={{ margin: 0 }} aria-live="polite">{selected ? `Opened ${String(selected.title)} (${selected.statusText})` : 'Select a document to open it.'}</p>
    </div>
  );
}
