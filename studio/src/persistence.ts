import { useCallback, useEffect, useRef, useState } from 'react';
import type { Project } from './model/project';
import { clearMigrationNotice, getMigrationNotice, saveProject, type MigrationNotice } from './storage';

/**
 * Studio's load/autosave lifecycle. Saving is only possible once `start` has resolved: a blocked or
 * failed load, or a rejected save, switches to `unavailable` and stops autosave and Ctrl+S, so the
 * stored project is never overwritten by the starter page or by edits made while storage was down.
 */
export type PersistenceStatus = 'loading' | 'ready' | 'unavailable';

export interface PersistenceDeps {
  /** Loads the project to open (`undefined` keeps the starter). Throwing means storage is unavailable. */
  start: () => Promise<Project | undefined>;
  save: (project: Project) => Promise<void>;
  getNotice: () => Promise<MigrationNotice | undefined>;
  clearNotice: () => Promise<void>;
}

export const AUTOSAVE_MS = 400;
/**
 * QA 7: IndexedDB writes started during unload are not guaranteed to commit, so a flush also journals the
 * pending project synchronously to localStorage. The next start replays it (same project only) and the
 * journal is cleared after the next successful save.
 */
export const PENDING_SAVE_KEY = 'eui-studio:pending-save';
const journal = {
  write(p: Project) { try { localStorage.setItem(PENDING_SAVE_KEY, JSON.stringify(p)); } catch { /* quota or private mode: best effort */ } },
  read(): Project | undefined { try { const t = localStorage.getItem(PENDING_SAVE_KEY); return t ? (JSON.parse(t) as Project) : undefined; } catch { return undefined; } },
  clear() { try { localStorage.removeItem(PENDING_SAVE_KEY); } catch { /* ignore */ } },
};

export function useProjectPersistence(project: Project, onStart: (project: Project | undefined) => void, deps: PersistenceDeps) {
  const [status, setStatus] = useState<PersistenceStatus>('loading');
  const [error, setError] = useState<unknown>(undefined);
  const [saved, setSaved] = useState(true);
  const [notice, setNotice] = useState<MigrationNotice | undefined>(undefined);
  const latest = useRef({ project, onStart, deps });
  latest.current = { project, onStart, deps };
  const statusRef = useRef(status);
  statusRef.current = status;
  const startedWith = useRef<Project | null>(null);
  /** The last project written to (or read from) storage; files that differ from it are dirty. */
  const [savedProject, setSavedProject] = useState<Project | null>(null);

  const fail = useCallback((err: unknown) => {
    statusRef.current = 'unavailable';
    setStatus('unavailable');
    setError(err);
    setSaved(false);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      let loaded: Project | undefined;
      try {
        loaded = await latest.current.deps.start();
      } catch (err) {
        if (active) fail(err);
        return;
      }
      if (!active) return;
      const pending = journal.read();
      const base = loaded ?? latest.current.project;
      const replay = pending && (!loaded || pending.id === loaded.id) && pending.files && typeof pending.files === 'object' ? pending : undefined;
      if (!replay) journal.clear();
      latest.current.onStart(replay ?? loaded);
      // A replayed journal differs from `startedWith`, so the autosave effect writes it to storage.
      startedWith.current = base;
      setSavedProject(startedWith.current);
      statusRef.current = 'ready';
      setStatus('ready');
      try {
        const n = await latest.current.deps.getNotice();
        if (active && n) setNotice(n);
      } catch { /* a missing notice is not a storage failure */ }
    })();
    return () => { active = false; };
  }, [fail]);

  const pendingSave = useRef<(() => void) | null>(null);
  const save = useCallback(async (p: Project): Promise<boolean> => {
    if (statusRef.current !== 'ready') return false;
    try {
      await latest.current.deps.save(p);
      if (latest.current.project === p) journal.clear();
      if (statusRef.current === 'ready') { setSaved(true); setSavedProject(p); }
      return true;
    } catch (err) {
      fail(err);
      return false;
    }
  }, [fail]);

  useEffect(() => {
    if (status !== 'ready') return;
    // The first render after hydration still shows the project we just loaded: nothing to save.
    if (startedWith.current === project) return;
    setSaved(false);
    const timer = setTimeout(() => { pendingSave.current = null; void save(project); }, AUTOSAVE_MS);
    pendingSave.current = () => { clearTimeout(timer); pendingSave.current = null; journal.write(project); void save(project); };
    return () => { clearTimeout(timer); pendingSave.current = null; };
  }, [project, status, save]);
  // QA 7: flush a pending debounced save when the page is hidden or unloads (as useLayoutAutosave does).
  useEffect(() => {
    const flush = () => pendingSave.current?.();
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  const saveNow = useCallback(() => save(latest.current.project), [save]);
  /** Ctrl+S: distinguishes "still loading" (nothing to report as a failure) from a storage problem. */
  const saveNowResult = useCallback(async (): Promise<'loading' | 'saved' | 'unavailable'> => {
    if (statusRef.current === 'loading') return 'loading';
    return (await save(latest.current.project)) ? 'saved' : 'unavailable';
  }, [save]);
  const dismissNotice = useCallback(async () => {
    setNotice(undefined);
    try { await latest.current.deps.clearNotice(); } catch { /* shown again next time */ }
  }, []);

  return { status, error, saved, savedProject, notice, saveNow, saveNowResult, dismissNotice };
}

export const defaultPersistenceDeps = (start: PersistenceDeps['start'], save: PersistenceDeps['save'] = (p) => saveProject(p)): PersistenceDeps => ({
  start,
  save,
  getNotice: getMigrationNotice,
  clearNotice: clearMigrationNotice,
});
