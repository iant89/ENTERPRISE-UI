import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '../button';
import { useId } from '../../hooks/useId';
import styles from './InlineEdit.module.css';

/** Text for the inline editor; the host also translates its label, value and validation errors. */
export interface InlineEditMessages {
  edit: string;
  editLabel: (label: string) => string;
  save: string;
  cancel: string;
  validationFailed: string;
  saveFailed: string;
  emptyValue: string;
}
const defaultMessages: InlineEditMessages = {
  edit: 'Edit', editLabel: (label) => `Edit ${label}`, save: 'Save', cancel: 'Cancel',
  validationFailed: 'Validation failed.', saveFailed: 'Could not save.', emptyValue: '—',
};

export interface InlineEditProps {
  /** Visible label of the inline edit. Also used as its accessible name. */
  label: string;
  /** Saved value shown in read mode. */
  value: string;
  /** Save the draft. The application owns the value and persists it. */
  onSave: (value: string, signal: AbortSignal) => Promise<void> | void;
  /** Validates the draft. Return an error message to block saving, or `undefined` if the draft is valid. */
  validate?: (value: string) => string | undefined;
  /** Disables editing. The value is still shown. */
  disabled?: boolean;
  /** Overrides built-in text and the accessible edit-button name. */
  messages?: Partial<InlineEditMessages>;
}
/** Controlled single-field edit; failed saves preserve the draft. */
export function InlineEdit({ label, value, onSave, validate, disabled, messages }: InlineEditProps) {
  const text = { ...defaultMessages, ...messages };
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
    try { validation = validate?.(draft); } catch { validation = text.validationFailed; }
    if (validation) { setError(validation); return; }
    const controller = new AbortController(); operation.current = controller; setBusy(true); setError('');
    try {
      await onSave(draft, controller.signal);
      if (!controller.signal.aborted) { setEditing(false); requestAnimationFrame(() => editButton.current?.focus()); }
    } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error && reason.message ? reason.message : text.saveFailed); }
    finally { if (!controller.signal.aborted) { operation.current = null; setBusy(false); } }
  };
  return <div className={styles.root}>
    {editing ? <form onSubmit={(event) => void save(event)} onKeyDown={(event) => { if (event.key === 'Escape' && !busy) { event.preventDefault(); cancel(); } }}>
      <label htmlFor={id}>{label}</label><input ref={input} id={id} value={draft} disabled={busy} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => setDraft(event.target.value)} />
      <Button type="submit" size="sm" loading={busy} disabled={busy}>{text.save}</Button><Button size="sm" disabled={busy} onClick={cancel}>{text.cancel}</Button>
      {error && <p id={`${id}-error`} role="alert">{error}</p>}
    </form> : <><span>{label}: <bdi>{value || text.emptyValue}</bdi></span> <Button ref={editButton} size="sm" disabled={disabled} aria-label={text.editLabel(label)} onClick={() => { setDraft(value); setError(''); setEditing(true); }}>{text.edit}</Button></>}
  </div>;
}
