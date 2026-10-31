/** Project persistence in IndexedDB. The MVP keeps one page per browser. */
const DB = 'eui-studio';
const STORE = 'projects';
const KEY = 'current';

export interface SavedProject { code: string; updatedAt: number }

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
export const saveProject = (code: string) => run('readwrite', (s) => s.put({ code, updatedAt: Date.now() } satisfies SavedProject, KEY));
