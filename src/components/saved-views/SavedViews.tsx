import { useRef, useState } from 'react';
import type { DataFilter, DataSort } from '../../data';
import { Button } from '../button';
import styles from './SavedViews.module.css';

export interface SavedViewConfiguration {
  filters: DataFilter[];
  search?: string;
  sort: DataSort[];
  grouping?: string[];
  visibleColumns: string[];
  pageSize: number;
}
export interface SavedView {
  id: string;
  name: string;
  scope: 'personal' | 'shared';
  isDefault?: boolean;
  configuration: SavedViewConfiguration;
}
/** Application-defined persistence and authorization. IDs must be stable and unique. */
export interface SavedViewPersistence {
  list(signal: AbortSignal): Promise<SavedView[]>;
  save(view: SavedView, signal: AbortSignal): Promise<void>;
  delete(id: string, signal: AbortSignal): Promise<void>;
}
export interface SavedViewsProps {
  /** Saved views the user can choose from. */
  views: SavedView[];
  /** ID of the active view, or `null` when no view is active. */
  selectedId: string | null;
  /** Called with the ID of the view the user selects. */
  onSelect: (id: string) => void;
  /** Receives the entered name and scope; the application captures current configuration. */
  onSave: (name: string, scope: 'personal' | 'shared') => void | Promise<void>;
  /** Called with the view ID and the new name when the user renames a view. Return a promise to show a busy state. */
  onRename: (id: string, name: string) => void | Promise<void>;
  /** Called with the view ID when the user deletes a view. Return a promise to show a busy state. */
  onDelete: (id: string) => void | Promise<void>;
  /** Optional action for persisting a default in the selected view scope. */
  onSetDefault?: (id: string) => void | Promise<void>;
  /** UI permissions only. The backend must enforce authorization. */
  canSaveShared?: boolean;
  /** Returns whether the user may rename or delete a view. By default, every view except the standard view can be modified. */
  canModify?: (view: SavedView) => boolean;
}

/** Controlled view selector. The application owns persistence, default selection, and authorization. */
export function SavedViews({ views, selectedId, onSelect, onSave, onRename, onDelete, onSetDefault, canSaveShared = false, canModify = () => true }: SavedViewsProps) {
  const [name, setName] = useState('');
  const [scope, setScope] = useState<'personal' | 'shared'>('personal');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const selected = views.find((view) => view.id === selectedId);
  const run = async (action: () => void | Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try { await action(); }
    catch (reason) { setError(reason instanceof Error && reason.message ? reason.message : 'Could not update the view.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const trimmed = name.trim();
  return <section className={styles.root} aria-label="Saved views">
    <label>View
      <select value={selected?.id ?? ''} disabled={busy} onChange={(event) => onSelect(event.target.value)}>
        <option value="" disabled>Select a view</option>
        {views.map((view) => <option key={view.id} value={view.id}>{view.name}{view.isDefault ? ' (default)' : ''} — {view.scope}</option>)}
      </select>
    </label>
    <label>View name<input value={name} disabled={busy} onChange={(event) => setName(event.target.value)} /></label>
    <label>Scope<select value={scope} disabled={busy} onChange={(event) => setScope(event.target.value as 'personal' | 'shared')}><option value="personal">Personal</option>{canSaveShared && <option value="shared">Shared</option>}</select></label>
    <div className={styles.actions}>
      <Button size="sm" disabled={busy || !trimmed || (scope === 'shared' && !canSaveShared)} onClick={() => void run(() => onSave(trimmed, scope))}>Save current view</Button>
      <Button size="sm" disabled={busy || !trimmed || !selected || !canModify(selected)} onClick={() => selected && void run(() => onRename(selected.id, trimmed))}>Rename</Button>
      <Button size="sm" disabled={busy || !selected || !canModify(selected)} onClick={() => selected && void run(() => onDelete(selected.id))}>Delete</Button>
      {onSetDefault && <Button size="sm" disabled={busy || !selected || selected.isDefault || !canModify(selected)} onClick={() => selected && void run(() => onSetDefault(selected.id))}>Set default</Button>}
    </div>
    {error && <p role="alert">{error}</p>}
  </section>;
}
