import { useState } from 'react';
import { ApprovalWorkflow, type ApprovalDecision, type ApprovalHistoryEntry, type ApprovalStatus } from '@enterprise-ui/react';

export default function PurchaseOrderApproval() {
  const [status, setStatus] = useState<ApprovalStatus>('pending');
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>([]);
  const decide = async (decision: ApprovalDecision, comment: string) => {
    // Demo only: a real backend must authorize and persist decisions and history.
    setStatus(decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'returned');
    setHistory((previous) => [...previous, { id: crypto.randomUUID(), actor: 'Morgan Lee', decision, comment, timestamp: new Date().toISOString() }]);
  };
  return <ApprovalWorkflow status={status} approver="Morgan Lee" dueDate="2026-11-06T17:00:00Z" history={history} allowedDecisions={['approve', 'reject', 'return']} onDecision={decide} />;
}
