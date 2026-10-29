import type { SavedView, SavedViewPersistence } from './SavedViews';

/** Returns the personal default first, or the shared default if there is none. */
export function getDefaultSavedView(views: readonly SavedView[]): SavedView | undefined {
  return views.find((view) => view.scope === 'personal' && view.isDefault)
    ?? views.find((view) => view.scope === 'shared' && view.isDefault);
}

/** Volatile example persistence. Not suitable for authorization or durable storage. */
export function createInMemorySavedViewPersistence(initial: readonly SavedView[] = []): SavedViewPersistence {
  let views: SavedView[] = structuredClone([...initial]);
  return {
    async list(signal) {
      signal.throwIfAborted();
      return structuredClone(views);
    },
    async save(view, signal) {
      signal.throwIfAborted();
      if (!view.id.trim() || !view.name.trim()) throw new Error('A view requires an ID and name.');
      const next = structuredClone(view);
      views = views.filter((item) => item.id !== next.id).map((item) => next.isDefault && item.scope === next.scope ? { ...item, isDefault: false } : item);
      views.push(next);
    },
    async delete(id, signal) {
      signal.throwIfAborted();
      if (!views.some((item) => item.id === id)) throw new Error('View not found.');
      views = views.filter((item) => item.id !== id);
    },
  };
}
