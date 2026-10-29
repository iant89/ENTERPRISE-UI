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
/** Host-provided translations should retain the distinction between failed and unknown outcomes. */
export interface BulkActionBarMessages {
  selected: (count: number) => string;
  clearSelection: string;
  processing: string;
  summary: (succeeded: number, failed: number, hasUnknown: boolean) => string;
  verifyUnknown: string;
  retryFailed: string;
  undo: string;
  dismiss: string;
  confirmTitle: (action: string) => string;
  confirmBody: (action: string, count: number) => string;
  confirm: string;
  cancel: string;
  actionChanged: string;
  conflictingResults: string;
  missingResult: string;
  operationFailed: string;
  outcomeUnknown: (reason: string) => string;
  requestFailed: string;
  undoOutcomeUnknown: (reason: string) => string;
}
const defaultMessages: BulkActionBarMessages = {
  selected: (count) => `${count} selected`, clearSelection: 'Clear selection', processing: 'Processing…',
  summary: (succeeded, failed, hasUnknown) => `${succeeded} succeeded; ${failed} ${hasUnknown ? 'not confirmed' : 'failed'}.`,
  verifyUnknown: 'Verify unknown operation outcomes before retrying.', retryFailed: 'Retry failed', undo: 'Undo', dismiss: 'Dismiss',
  confirmTitle: (action) => `Confirm ${action}`, confirmBody: (action, count) => `Apply ${action} to ${count} selected records?`,
  confirm: 'Confirm', cancel: 'Cancel', actionChanged: 'The action or selection changed. Please review and try again.',
  conflictingResults: 'The backend returned conflicting results.', missingResult: 'No result was returned for this record.', operationFailed: 'Operation failed.',
  outcomeUnknown: (reason) => `Outcome unknown: ${reason}`, requestFailed: 'Request failed.',
  undoOutcomeUnknown: (reason) => `Undo outcome unknown: ${reason} Verify the result before retrying.`,
};
export interface BulkActionBarProps {
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection?: () => void;
  /** Fired for each completed execution, including a retry. */
  onResult?: (actionId: string, result: BulkActionResult) => void;
  /** Called after undo succeeds so the host can refresh its data. */
  onUndo?: (actionId: string, ids: string[]) => void;
  'aria-label'?: string;
  /** Overrides built-in text and announcements. */
  messages?: Partial<BulkActionBarMessages>;
  /** Also applied to the portaled confirmation dialog. */
  dir?: 'ltr' | 'rtl' | 'auto';
  lang?: string;
}
interface Report { action: BulkAction; succeeded: string[]; failed: BulkActionFailure[] }
interface Pending { action: BulkAction; ids: string[]; retry: boolean }

/** A selection-scoped action bar. Select-all semantics and backend authorization remain with the host. */
export function BulkActionBar({ selectedIds, actions, onClearSelection, onResult, onUndo, messages, dir, lang, 'aria-label': ariaLabel = 'Bulk actions' }: BulkActionBarProps) {
  const text = { ...defaultMessages, ...messages };
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
        if (failed.has(id) && succeeded.has(id)) result.failed.push({ id, message: text.conflictingResults, outcomeUnknown: true });
        else if (failed.has(id)) result.failed.push({ ...failed.get(id)!, message: failed.get(id)?.message || text.operationFailed });
        else if (succeeded.has(id)) result.succeeded.push(id);
        else result.failed.push({ id, message: text.missingResult, outcomeUnknown: true });
      }
      setReport((previous) => ({ action, succeeded: retry && previous?.action.id === action.id ? [...new Set([...previous.succeeded, ...result.succeeded])] : result.succeeded, failed: retry && previous?.action.id === action.id ? [...previous.failed.filter((failure) => !requested.has(failure.id)), ...result.failed] : result.failed }));
      try { onResult?.(action.id, result); } catch (error) { console.error('BulkActionBar onResult failed:', error); }
    } catch (reason) {
      if (active.signal.aborted) return;
      const message = reason instanceof Error && reason.message ? reason.message : text.operationFailed;
      const failed = ids.map((id) => ({ id, message: text.outcomeUnknown(message), outcomeUnknown: true }));
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
      if (!active.signal.aborted) setUndoError(text.undoOutcomeUnknown(reason instanceof Error && reason.message ? reason.message : text.requestFailed));
    } finally {
      if (!active.signal.aborted) { lock.current = false; controller.current = null; setBusy(false); }
    }
  };

  const retryAction = actions.find((action) => action.id === report?.action.id);
  const retryIds = report?.failed.filter((failure) => !failure.outcomeUnknown || retryAction?.retryOnError).map((failure) => failure.id) ?? [];
  const hasUnknown = report?.failed.some((failure) => failure.outcomeUnknown);
  if (!selectedIds.length && !report && !pending && !notice) return null;
  return <section aria-label={ariaLabel} dir={dir} lang={lang} className={styles.root}>
    {selectedIds.length > 0 && <div className={styles.actions}>
      <strong>{text.selected(new Set(selectedIds).size)}</strong>
      {actions.map((action) => <Button key={action.id} size="sm" disabled={busy || action.disabled} onClick={() => request(action, selectedIds)}>{action.label}</Button>)}
      {onClearSelection && <Button size="sm" variant="tertiary" disabled={busy} onClick={onClearSelection}>{text.clearSelection}</Button>}
    </div>}
    {busy && <p role="status">{text.processing}</p>}
    {notice && <p role="alert">{notice}</p>}
    {report && <div className={styles.report} role="status">
      <span>{text.summary(report.succeeded.length, report.failed.length, !!hasUnknown)}</span>
      {report.failed.length > 0 && <ul>{report.failed.map((failure) => <li key={failure.id}><bdi>{failure.id}</bdi>: {failure.message}</li>)}</ul>}
      {hasUnknown && !retryAction?.retryOnError && <p>{text.verifyUnknown}</p>}
      {retryIds.length > 0 && <Button size="sm" disabled={busy || !retryAction || retryAction.disabled} onClick={() => {
        const currentAction = actions.find((action) => action.id === report.action.id);
        if (currentAction) request(currentAction, retryIds, true);
      }}>{text.retryFailed}</Button>}
      {report.action.undo && report.succeeded.length > 0 && <Button size="sm" disabled={busy || !actions.some((action) => action.id === report.action.id && !!action.undo && !action.disabled && (!undoError || action.undoRetrySafe))} onClick={() => void undo()}>{text.undo}</Button>}
      {undoError && <p role="alert">{undoError}</p>}
      <Button size="sm" variant="tertiary" disabled={busy} onClick={() => setReport(null)}>{text.dismiss}</Button>
    </div>}
    <AlertDialog open={pending !== null} title={pending ? text.confirmTitle(pending.action.label) : ''} dir={dir} lang={lang} confirmLabel={text.confirm} cancelLabel={text.cancel} tone={pending?.action.destructive ? 'error' : 'warning'}
      onCancel={() => setPending(null)} onConfirm={() => {
        if (!pending) return;
        const current = actions.find((action) => action.id === pending.action.id);
        const retryStillSafe = !pending.retry || pending.ids.every((id) => {
          const failure = report && current && report.action.id === current.id ? report.failed.find((item) => item.id === id) : undefined;
          return failure && (!failure.outcomeUnknown || current?.retryOnError);
        });
        if (!current || current.disabled || !retryStillSafe || (!pending.retry && pending.ids.some((id) => !selectedIds.includes(id)))) {
          setPending(null); setNotice(text.actionChanged); return;
        }
        return execute({ ...pending, action: current });
      }}>
      {pending && (pending.action.confirmation ?? text.confirmBody(pending.action.label, pending.ids.length))}
    </AlertDialog>
  </section>;
}
