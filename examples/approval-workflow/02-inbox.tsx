import { useState } from 'react';
import { ApprovalWorkflow, type ApprovalDecision } from '@enterprise-ui/react';
export const title = 'Approval inbox';
const initial = [{ id: 'PO-2041', supplier: 'Aster Medical', amount: '$1,240' }, { id: 'PO-2042', supplier: 'Northstar Supply', amount: '$850' }];
export default function ApprovalInboxExample() {
  const [orders, setOrders] = useState(initial);
  const [fail, setFail] = useState(false);
  const order = orders[0];
  const decide = async (_decision: ApprovalDecision, _comment: string, signal: AbortSignal) => {
    signal.throwIfAborted();
    if (fail) throw new Error('Mock approval service unavailable. Try again.');
    setOrders((current) => current.slice(1));
  };
  return <section aria-label="Approval inbox"><h2>Approval inbox</h2><label><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} /> Simulate service failure</label>
    {order ? <><h3>{order.id} — {order.supplier} ({order.amount})</h3><ApprovalWorkflow key={order.id} status="pending" approver="Morgan Lee" history={[]} allowedDecisions={['approve', 'reject']} onDecision={decide} /></> : <p>No approvals waiting.</p>}
    <p>Mock decisions are not persisted or authorized.</p>
  </section>;
}
