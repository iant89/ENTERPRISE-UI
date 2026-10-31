import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertDialog } from '../../components/alert-dialog';
import { Button } from '../../components/button';
import styles from './ObjectEditor.module.css';

export type ObjectFieldErrors = Record<string, string>;
/** Application can throw this for field-level validation errors or a version conflict. */
export class ObjectSaveError extends Error {
  constructor(message: string, public fieldErrors: ObjectFieldErrors = {}, public conflict = false) { super(message); this.name = 'ObjectSaveError'; }
}
export interface ObjectEditorRenderProps<T> {
  /** Whether the object is being viewed or edited. */
  mode: 'view' | 'edit';
  /** Current draft of the object. */
  value: T;
  /** Current saved snapshot, for composing a change preview with DiffViewer. */
  baseline: T;
  /** Supply immutable replacement values; ignored in view mode. */
  onChange: (value: T) => void;
  /** Validation errors by field name. */
  errors: ObjectFieldErrors;
  /** Whether the draft differs from the saved object. */
  dirty: boolean;
  /** Whether a save is in progress. */
  busy: boolean;
  /** Whether the save failed because someone else changed the object. */
  conflict: boolean;
  /** Version (ETag) of the saved object, used for conflict detection. */
  version: string | undefined;
  /** After explicitly resolving a conflict, use the latest server snapshot and a user-approved merged draft. */
  resolveConflict: (latestValue: T, latestVersion: string | undefined, mergedValue: T) => void;
  /** Call instead of navigating directly to enable unsaved-change confirmation. */
  requestNavigation: () => void;
  /** Provide a specific SPA-router continuation. */
  requestNavigationTo: (continueNavigation: () => void) => void;
}
export interface ObjectEditorProps<T> {
  /** Initial snapshot. Remount with a new key when switching to a different object. */
  initialValue: T;
  /** Version (ETag) of the initial object, sent with the first save. */
  initialVersion?: string;
  /** Compare immutable snapshots for unsaved changes. */
  isEqual: (a: T, b: T) => boolean;
  /** Validates the draft and returns errors by field name. An empty object means the draft is valid. */
  validate?: (value: T) => ObjectFieldErrors;
  /** Persist and return the authoritative saved value and version. */
  onSave: (value: T, version: string | undefined, signal: AbortSignal) => Promise<{ value: T; version?: string }>;
  /** Called when the user leaves the editor after saving or discarding. */
  onNavigate?: () => void;
  /** Renders the editor content from the editor state (`mode`, `value`, `errors` and actions). */
  children: (props: ObjectEditorRenderProps<T>) => ReactNode;
}

/** Object editing state and safety contract; field rendering and backend rules belong to the host. */
export function ObjectEditor<T>({ initialValue, initialVersion, isEqual, validate, onSave, onNavigate, children }: ObjectEditorProps<T>) {
  const [baseline, setBaseline] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);
  const [version, setVersion] = useState(initialVersion);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [errors, setErrors] = useState<ObjectFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<'cancel' | 'navigate' | null>(null);
  const lock = useRef(false);
  const navigationRef = useRef<(() => void) | undefined>(undefined);
  const controller = useRef<AbortController | null>(null);
  const dirty = mode === 'edit' && !isEqual(draft, baseline);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);
  useEffect(() => () => { controller.current?.abort(); }, []);
  const cancel = () => { setDraft(baseline); setErrors({}); setError(null); setConflict(false); setMode('view'); };
  const navigate = (continueNavigation?: () => void) => {
    if (busy || confirm) return;
    const next = continueNavigation ?? onNavigate;
    if (!next) return;
    if (dirty) { navigationRef.current = next; setConfirm('navigate'); }
    else next();
  };
  const save = async () => {
    if (lock.current || mode !== 'edit' || conflict) return;
    let nextErrors: ObjectFieldErrors;
    try { nextErrors = validate?.(draft) ?? {}; }
    catch (reason) { setError(reason instanceof Error && reason.message ? reason.message : 'Validation failed.'); return; }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setError('Correct the highlighted fields.'); return; }
    const active = new AbortController(); controller.current = active; lock.current = true; setBusy(true); setError(null); setConflict(false);
    try {
      const result = await onSave(draft, version, active.signal);
      if (!active.signal.aborted) { setBaseline(result.value); setDraft(result.value); setVersion(result.version); setMode('view'); setErrors({}); }
    } catch (reason) {
      if (!active.signal.aborted) {
        setError(reason instanceof Error && reason.message ? reason.message : 'Could not save changes.');
        if (reason instanceof ObjectSaveError) { setErrors(reason.fieldErrors); setConflict(reason.conflict); }
      }
    } finally {
      if (!active.signal.aborted) { controller.current = null; lock.current = false; setBusy(false); }
    }
  };
  return <section aria-label="Object editor" className={styles.root}>
    <div className={styles.actions}>
      {mode === 'view' ? <Button onClick={() => setMode('edit')}>Edit</Button> : <>
        <Button variant="primary" loading={busy} disabled={conflict} onClick={() => void save()}>Save</Button>
        <Button disabled={busy} onClick={() => dirty ? setConfirm('cancel') : cancel()}>Cancel</Button>
        <Button disabled={busy || !dirty} onClick={() => { setDraft(baseline); setErrors({}); setError(null); setConflict(false); }}>Reset</Button>
      </>}
    </div>
    {dirty && <p role="status">Unsaved changes</p>}
    {error && <div role="alert">{error}{conflict && <p>The record changed on the server. Preserve your changes and resolve the conflict before retrying.</p>}</div>}
    {children({ mode, baseline, value: mode === 'view' ? baseline : draft, onChange: (value) => { if (mode === 'edit' && !busy) setDraft(value); }, errors, dirty, busy, conflict, version,
      resolveConflict: (latestValue, latestVersion, mergedValue) => {
        if (!conflict || busy || mode !== 'edit') return;
        setBaseline(latestValue); setVersion(latestVersion); setDraft(mergedValue); setErrors({}); setError(null); setConflict(false);
      }, requestNavigation: () => navigate(), requestNavigationTo: navigate })}
    <AlertDialog open={confirm !== null} title="Discard unsaved changes?" onCancel={() => { navigationRef.current = undefined; setConfirm(null); }} onConfirm={() => {
      const action = confirm; const proceed = navigationRef.current; navigationRef.current = undefined; setConfirm(null); cancel(); if (action === 'navigate') proceed?.();
    }}>Your unsaved changes will be lost.</AlertDialog>
  </section>;
}
