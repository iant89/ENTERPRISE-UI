import { useEffect, useRef, useState } from 'react';
import { AlertDialog } from '../../components/alert-dialog';
import { Button } from '../../components/button';
import styles from './ApprovalWorkflow.module.css';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'returned';
export type ApprovalDecision = 'approve' | 'reject' | 'return';
export interface ApprovalHistoryEntry {
  id: string;
  actor: string;
  decision: ApprovalDecision;
  /** ISO timestamp; formatted in the supplied locale and time zone. */
  timestamp: string;
  comment?: string;
}
export interface ApprovalWorkflowProps {
  status: ApprovalStatus;
  approver: string;
  history: ApprovalHistoryEntry[];
  dueDate?: string;
  escalated?: boolean;
  locale?: string;
  timeZone?: string;
  /** UI hints only; the backend must enforce authorization. */
  allowedDecisions?: ApprovalDecision[];
  /** Called after confirmation. Update status and history from authoritative backend data. */
  onDecision: (decision: ApprovalDecision, comment: string, signal: AbortSignal) => Promise<void>;
}
const labels: Record<ApprovalDecision, string> = { approve: 'Approve', reject: 'Reject', return: 'Return' };

/** Controlled approval presentation. It never changes status or creates audit records itself. */
export function ApprovalWorkflow({ status, approver, history, dueDate, escalated, locale, timeZone, allowedDecisions = [], onDecision }: ApprovalWorkflowProps) {
  const [comment, setComment] = useState('');
  const [pending, setPending] = useState<ApprovalDecision | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); }, []);
  const date = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    // A date-only deadline is a calendar date, not midnight in a local time zone.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(parsed);
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(parsed);
  };
  const choose = (decision: ApprovalDecision) => {
    if (busy || lock.current || status !== 'pending' || !allowedDecisions.includes(decision)) return;
    if (decision === 'reject' && !comment.trim()) { setError('Enter a reason before rejecting.'); return; }
    setError(null); setPending(decision);
  };
  const confirm = async () => {
    if (!pending || lock.current) return;
    if (status !== 'pending' || !allowedDecisions.includes(pending)) { setPending(null); setError('This decision is no longer available.'); return; }
    const active = new AbortController(); controller.current = active; lock.current = true; setBusy(true);
    try {
      await onDecision(pending, comment.trim(), active.signal);
      if (!active.signal.aborted) { setComment(''); setPending(null); }
    } catch (reason) {
      if (!active.signal.aborted) { setPending(null); setError(reason instanceof Error && reason.message ? reason.message : 'Could not submit the decision.'); }
    } finally {
      if (!active.signal.aborted) { controller.current = null; lock.current = false; setBusy(false); }
    }
  };
  return <section aria-label="Approval workflow" className={styles.root}>
    <dl className={styles.details}><div><dt>Status</dt><dd>{status}</dd></div><div><dt>Approver</dt><dd>{approver}</dd></div>
      {dueDate && <div><dt>Due</dt><dd><time dateTime={dueDate}>{date(dueDate)}</time></dd></div>}
      {escalated && <div><dt>Escalation</dt><dd>Escalated</dd></div>}</dl>
    {status === 'pending' && allowedDecisions.length > 0 && <>
      <label className={styles.comment}>Comment or rejection reason<textarea value={comment} disabled={busy} onChange={(event) => setComment(event.target.value)} /></label>
      <div className={styles.actions}>{allowedDecisions.map((decision) => <Button key={decision} disabled={busy} onClick={() => choose(decision)}>{labels[decision]}</Button>)}</div>
    </>}
    {busy && <p role="status">Submitting decision…</p>}
    {error && <p role="alert">{error}</p>}
    <h3>Decision history</h3>
    {history.length === 0 ? <p>No decisions yet.</p> : <ol>{history.map((entry) => <li key={entry.id}>
      <strong>{entry.actor}</strong> — {labels[entry.decision]} — <time dateTime={entry.timestamp}>{date(entry.timestamp)}</time>{entry.comment && <p>{entry.comment}</p>}
    </li>)}</ol>}
    <AlertDialog open={pending !== null} title={`Confirm ${pending ? labels[pending] : 'decision'}`} onCancel={() => setPending(null)} onConfirm={confirm}>
      Confirm this decision for the current approval?
    </AlertDialog>
  </section>;
}
