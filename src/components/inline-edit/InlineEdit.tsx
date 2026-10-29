import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '../button';
import { useId } from '../../hooks/useId';
import styles from './InlineEdit.module.css';

export interface InlineEditProps {
  label: string;
  value: string;
  /** Save the draft. The application owns the value and persists it. */
  onSave: (value: string, signal: AbortSignal) => Promise<void> | void;
  validate?: (value: string) => string | undefined;
  disabled?: boolean;
}
/** Controlled single-field edit; failed saves preserve the draft. */
export function InlineEdit({ label, value, onSave, validate, disabled }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const operation = useRef<AbortController | null>(null);
  const id = useId(undefined, 'inline-edit');
  useEffect(() => () => { operation.current?.abort(); }, []);
  useEffect(() => { if (editing) input.current?.focus(); }, [editing]);
  const cancel = () => { setEditing(false); setError(''); setDraft(value); requestAnimationFrame(() => editButton.current?.focus()); };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (operation.current) return;
    let validation: string | undefined;
    try { validation = validate?.(draft); } catch { validation = 'Validation failed.'; }
    if (validation) { setError(validation); return; }
    const controller = new AbortController(); operation.current = controller; setBusy(true); setError('');
    try {
      await onSave(draft, controller.signal);
      if (!controller.signal.aborted) { setEditing(false); requestAnimationFrame(() => editButton.current?.focus()); }
    } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error && reason.message ? reason.message : 'Could not save.'); }
    finally { if (!controller.signal.aborted) { operation.current = null; setBusy(false); } }
  };
  return <div className={styles.root}>
    {editing ? <form onSubmit={(event) => void save(event)} onKeyDown={(event) => { if (event.key === 'Escape' && !busy) { event.preventDefault(); cancel(); } }}>
      <label htmlFor={id}>{label}</label><input ref={input} id={id} value={draft} disabled={busy} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => setDraft(event.target.value)} />
      <Button type="submit" size="sm" loading={busy} disabled={busy}>Save</Button><Button size="sm" disabled={busy} onClick={cancel}>Cancel</Button>
      {error && <p id={`${id}-error`} role="alert">{error}</p>}
    </form> : <><span>{label}: {value || '—'}</span> <Button ref={editButton} size="sm" disabled={disabled} aria-label={`Edit ${label}`} onClick={() => { setDraft(value); setError(''); setEditing(true); }}>Edit</Button></>}
  </div>;
}
