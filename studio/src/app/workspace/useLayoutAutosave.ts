import { useEffect, useRef, type MutableRefObject } from 'react';
import type { LayoutState } from './layout';

export interface LayoutAutosaveOptions {
  layout: LayoutState;
  projectId: string;
  /** The project the loaded layout belongs to (set by the load effect). */
  layoutFor: MutableRefObject<{ id: string; layout: LayoutState } | null>;
  /** Storage key for the current project (refs only). */
  keyFor: () => string;
  /** Keys written synchronously instead of debounced (the unsaved starter's localStorage key). */
  immediate: (key: string) => boolean;
  save: (key: string, layout: LayoutState) => unknown;
  delay: number;
}

/**
 * Debounced layout save per project. On project switch the pending write is flushed (it already targets
 * the old key) instead of dropped (C3 review note 1); same-project re-renders keep the debounce.
 * Pending writes are also flushed on pagehide.
 */
export function useLayoutAutosave({ layout, projectId, layoutFor, keyFor, immediate, save, delay }: LayoutAutosaveOptions): void {
  const pending = useRef<(() => void) | null>(null);
  const currentId = useRef(projectId);
  currentId.current = projectId;
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const at = layoutFor.current;
    if (!at || at.id !== projectId || at.layout === layout) return;
    at.layout = layout;
    const key = keyFor();
    const write = () => { if (pending.current === write) pending.current = null; void Promise.resolve(saveRef.current(key, layout)).catch(() => undefined); };
    if (immediate(key)) { write(); return; }
    pending.current = write;
    const t = setTimeout(write, delay);
    const savedFor = projectId;
    return () => {
      clearTimeout(t);
      if (currentId.current !== savedFor && pending.current === write) write();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyFor/immediate read refs.
  }, [layout, projectId]);
  useEffect(() => {
    const flush = () => pending.current?.();
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);
}
