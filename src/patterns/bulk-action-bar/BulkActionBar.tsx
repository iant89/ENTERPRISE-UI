import { useEffect, useRef, useState } from 'react';
import { AlertDialog } from '../../components/alert-dialog';
import { Button } from '../../components/button';
import styles from './BulkActionBar.module.css';

export interface BulkActionFailure {
  id: string;
  message: string;
  /** The backend did not confirm whether the operation happened. */
  outcomeUnknown?: boolean;
}
export interface BulkActionResult {
  /** IDs successfully processed. */
  succeeded: string[];
  /** IDs which failed, with an explanation suitable for display. */
  failed: BulkActionFailure[];
}
export interface BulkAction {
  id: string;
  label: string;
  /** Disabled state is a presentation hint; the backend must enforce permissions. */
  disabled?: boolean;
  destructive?: boolean;
  /** Allow retry of unconfirmed outcomes only when the operation is idempotent. @default false */
  retryOnError?: boolean;
  /** Allow repeating an undo whose outcome is unknown only when undo is idempotent. @default false */
  undoRetrySafe?: boolean;
  confirmation?: string;
  /** Must report a result for every supplied ID; operations belong to the application. */
  execute: (ids: string[], signal: AbortSignal) => Promise<BulkActionResult>;
  /** Optional backend-supported undo for the successfully processed IDs. */
  undo?: (ids: string[], signal: AbortSignal) => Promise<void>;
}
export interface BulkActionBarProps {
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection?: () => void;
  /** Fired for each completed execution, including a retry. */
  onResult?: (actionId: string, result: BulkActionResult) => void;
  /** Called after undo succeeds so the host can refresh its data. */
  onUndo?: (actionId: string, ids: string[]) => void;
  'aria-label'?: string;
}
interface Report { action: BulkAction; succeeded: string[]; failed: BulkActionFailure[] }
interface Pending { action: BulkAction; ids: string[]; retry: boolean }

/** A selection-scoped action bar. Select-all semantics and backend authorization remain with the host. */
export function BulkActionBar({ selectedIds, actions, onClearSelection, onResult, onUndo, 'aria-label': ariaLabel = 'Bulk actions' }: BulkActionBarProps) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [undoError, setUndoError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); }, []);

  const execute = async ({ action, ids, retry }: Pending) => {
    if (lock.current || !ids.length) return;
    lock.current = true;
    const active = new AbortController(); controller.current = active;
    setBusy(true); setPending(null); setUndoError(null); setNotice(null);
    try {
      const raw = await action.execute(ids, active.signal);
      if (active.signal.aborted) return;
      // Never silently mark missing, conflicting, or unrequested IDs as successes.
      const requested = new Set(ids);
      const succeeded = new Set(raw.succeeded.filter((id) => requested.has(id)));
      const failed = new Map(raw.failed.filter((failure) => requested.has(failure.id)).map((failure) => [failure.id, failure]));
      const result: BulkActionResult = { succeeded: [], failed: [] };
      for (const id of ids) {
        if (failed.has(id) && succeeded.has(id)) result.failed.push({ id, message: 'The backend returned conflicting results.', outcomeUnknown: true });
        else if (failed.has(id)) result.failed.push({ ...failed.get(id)!, message: failed.get(id)?.message || 'Operation failed.' });
        else if (succeeded.has(id)) result.succeeded.push(id);
        else result.failed.push({ id, message: 'No result was returned for this record.', outcomeUnknown: true });
      }
      setReport((previous) => ({ action, succeeded: retry && previous?.action.id === action.id ? [...new Set([...previous.succeeded, ...result.succeeded])] : result.succeeded, failed: retry && previous?.action.id === action.id ? [...previous.failed.filter((failure) => !requested.has(failure.id)), ...result.failed] : result.failed }));
      try { onResult?.(action.id, result); } catch (error) { console.error('BulkActionBar onResult failed:', error); }
    } catch (reason) {
      if (active.signal.aborted) return;
      const message = reason instanceof Error && reason.message ? reason.message : 'Operation failed.';
      const failed = ids.map((id) => ({ id, message: `Outcome unknown: ${message}`, outcomeUnknown: true }));
      const requested = new Set(ids);
      setReport((previous) => ({ action, succeeded: retry && previous?.action.id === action.id ? previous.succeeded : [], failed: retry && previous?.action.id === action.id ? [...previous.failed.filter((failure) => !requested.has(failure.id)), ...failed] : failed }));
      try { onResult?.(action.id, { succeeded: [], failed }); } catch (error) { console.error('BulkActionBar onResult failed:', error); }
    } finally {
      if (!active.signal.aborted) { lock.current = false; controller.current = null; setBusy(false); }
    }
  };
  const request = (action: BulkAction, ids: string[], retry = false) => {
    if (busy || lock.current || action.disabled || ids.length === 0) return;
    const next = { action, ids: [...new Set(ids)], retry };
    if (action.destructive || action.confirmation) setPending(next);
    else void execute(next);
  };
  const undo = async () => {
    const currentAction = actions.find((action) => action.id === report?.action.id);
    if (!report || !currentAction?.undo || currentAction.disabled || lock.current || !report.succeeded.length || (undoError && !currentAction.undoRetrySafe)) return;
    const snapshot = report;
    lock.current = true;
    const active = new AbortController(); controller.current = active;
    setBusy(true); setUndoError(null);
    try {
      await currentAction.undo(snapshot.succeeded, active.signal);
      if (!active.signal.aborted) {
        setReport({ ...snapshot, succeeded: [] });
        try { onUndo?.(snapshot.action.id, snapshot.succeeded); } catch (error) { console.error('BulkActionBar onUndo failed:', error); }
      }
    } catch (reason) {
      if (!active.signal.aborted) setUndoError(`Undo outcome unknown: ${reason instanceof Error && reason.message ? reason.message : 'Request failed.'} Verify the result before retrying.`);
    } finally {
      if (!active.signal.aborted) { lock.current = false; controller.current = null; setBusy(false); }
    }
  };

  const retryAction = actions.find((action) => action.id === report?.action.id);
  const retryIds = report?.failed.filter((failure) => !failure.outcomeUnknown || retryAction?.retryOnError).map((failure) => failure.id) ?? [];
  const hasUnknown = report?.failed.some((failure) => failure.outcomeUnknown);
  if (!selectedIds.length && !report && !pending && !notice) return null;
  return <section aria-label={ariaLabel} className={styles.root}>
    {selectedIds.length > 0 && <div className={styles.actions}>
      <strong>{new Set(selectedIds).size} selected</strong>
      {actions.map((action) => <Button key={action.id} size="sm" disabled={busy || action.disabled} onClick={() => request(action, selectedIds)}>{action.label}</Button>)}
      {onClearSelection && <Button size="sm" variant="tertiary" disabled={busy} onClick={onClearSelection}>Clear selection</Button>}
    </div>}
    {busy && <p role="status">Processing…</p>}
    {notice && <p role="alert">{notice}</p>}
    {report && <div className={styles.report} role="status">
      <span>{report.succeeded.length} succeeded; {report.failed.length} {hasUnknown ? 'not confirmed' : 'failed'}.</span>
      {report.failed.length > 0 && <ul>{report.failed.map((failure) => <li key={failure.id}>{failure.id}: {failure.message}</li>)}</ul>}
      {hasUnknown && !retryAction?.retryOnError && <p>Verify unknown operation outcomes before retrying.</p>}
      {retryIds.length > 0 && <Button size="sm" disabled={busy || !retryAction || retryAction.disabled} onClick={() => {
        const currentAction = actions.find((action) => action.id === report.action.id);
        if (currentAction) request(currentAction, retryIds, true);
      }}>Retry failed</Button>}
      {report.action.undo && report.succeeded.length > 0 && <Button size="sm" disabled={busy || !actions.some((action) => action.id === report.action.id && !!action.undo && !action.disabled && (!undoError || action.undoRetrySafe))} onClick={() => void undo()}>Undo</Button>}
      {undoError && <p role="alert">{undoError}</p>}
      <Button size="sm" variant="tertiary" disabled={busy} onClick={() => setReport(null)}>Dismiss</Button>
    </div>}
    <AlertDialog open={pending !== null} title={`Confirm ${pending?.action.label ?? 'action'}`} tone={pending?.action.destructive ? 'error' : 'warning'}
      onCancel={() => setPending(null)} onConfirm={() => {
        if (!pending) return;
        const current = actions.find((action) => action.id === pending.action.id);
        const retryStillSafe = !pending.retry || pending.ids.every((id) => {
          const failure = report && current && report.action.id === current.id ? report.failed.find((item) => item.id === id) : undefined;
          return failure && (!failure.outcomeUnknown || current?.retryOnError);
        });
        if (!current || current.disabled || !retryStillSafe || (!pending.retry && pending.ids.some((id) => !selectedIds.includes(id)))) {
          setPending(null); setNotice('The action or selection changed. Please review and try again.'); return;
        }
        return execute({ ...pending, action: current });
      }}>
      {pending?.action.confirmation ?? `Apply ${pending?.action.label ?? 'this action'} to ${pending?.ids.length ?? 0} selected records?`}
    </AlertDialog>
  </section>;
}
