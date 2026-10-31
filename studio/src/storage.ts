/**
 * Project persistence in IndexedDB. One project per browser until storage v2 (M3-03); the record
 * keeps `code` (the entry file) for v1 readers and adds `files`/`entry` for multi-file projects.
 */
import type { Project } from './model/project';
const DB = 'eui-studio';
const STORE = 'projects';
const KEY = 'current';

export interface SavedProject { code: string; updatedAt: number; files?: Record<string, string>; entry?: string }

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

export const loadProject = () => run<SavedProject | undefined>('readonly', (s) => s.get(KEY)).catch(() => undefined);
export const saveProject = (project: Project) =>
  run('readwrite', (s) => s.put({ code: project.files[project.entry] ?? '', files: project.files, entry: project.entry, updatedAt: Date.now() } satisfies SavedProject, KEY));
