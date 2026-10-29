import { useEffect, useRef, useState } from 'react';
import { SavedViews, createInMemorySavedViewPersistence, getDefaultSavedView, type SavedView, type SavedViewConfiguration } from '@enterprise-ui/react';

const storage = createInMemorySavedViewPersistence([{
  id: 'all', name: 'All inventory', scope: 'personal', isDefault: true,
  configuration: { filters: [], search: '', sort: [], visibleColumns: ['name', 'received'], pageSize: 2 },
}]);

/** In-memory only; production persistence and authorization are application responsibilities. */
export function InventoryViews({ current, onApply }: { current: SavedViewConfiguration; onApply: (configuration: SavedViewConfiguration) => void }) {
  const [views, setViews] = useState<SavedView[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const applyRef = useRef(onApply);
  applyRef.current = onApply;
  useEffect(() => {
    const active = new AbortController();
    controller.current = active;
    storage.list(active.signal).then((list) => {
      if (active.signal.aborted) return;
      setViews(list);
      const defaultView = getDefaultSavedView(list);
      if (defaultView) { setSelected(defaultView.id); applyRef.current(defaultView.configuration); }
    }, () => { if (!active.signal.aborted) setLoadError(true); });
    return () => { active.abort(); controller.current = null; };
  }, []);
  const signal = () => {
    if (!controller.current) throw new Error('View storage is not available.');
    return controller.current.signal;
  };
  const update = async (view: SavedView) => {
    const currentSignal = signal();
    await storage.save(view, currentSignal);
    const list = await storage.list(currentSignal);
    if (!currentSignal.aborted) setViews(list);
  };
  if (loadError) return <p role="alert">Could not load saved views.</p>;
  if (!views) return <p role="status">Loading views…</p>;
  return <SavedViews views={views} selectedId={selected} canSaveShared onSelect={(id) => {
    const view = views.find((item) => item.id === id);
    if (view) { setSelected(id); onApply(view.configuration); }
  }} onSave={async (name, scope) => {
    const view: SavedView = { id: crypto.randomUUID(), name, scope, configuration: current };
    await update(view);
    if (controller.current && !controller.current.signal.aborted) setSelected(view.id);
  }} onRename={async (id, name) => {
    const view = views.find((item) => item.id === id);
    if (view) await update({ ...view, name });
  }} onSetDefault={async (id) => {
    const view = views.find((item) => item.id === id);
    if (view) await update({ ...view, isDefault: true });
  }} onDelete={async (id) => {
    const currentSignal = signal();
    await storage.delete(id, currentSignal);
    const list = await storage.list(currentSignal);
    if (!currentSignal.aborted) { setViews(list); setSelected(null); }
  }} />;
}
