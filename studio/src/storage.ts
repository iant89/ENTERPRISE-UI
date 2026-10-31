import type { Project } from './model/project';

/**
 * Project persistence in IndexedDB (docs/plans/studio-m3-design.md §2.3, ide-design.md §5.7).
 *
 * DB v2 has two stores: `projects` (key = `project.id`, value = `Project`) and `meta`
 * (key `lastOpened`). Upgrading from v1 wraps the single-page record `current` as a project.
 * Undo history is not persisted (decision T4).
 */
export const DB_NAME = 'eui-studio';
export const DB_VERSION = 2;
const PROJECTS = 'projects';
const META = 'meta';
const V1_KEY = 'current';
const LAST_OPENED = 'lastOpened';
const ENTRY = 'src/App.tsx';

/** v1 shape, still returned by `loadProject` until the Studio store becomes project-wide (M3-04). */
export interface SavedProject { code: string; updatedAt: number }
export interface ProjectSummary { id: string; name: string; createdAt: number; updatedAt: number; fileCount: number; template?: string }

const newId = () => globalThis.crypto.randomUUID();

function newProject(files: Record<string, string>, name: string, now = Date.now()): Project {
  return { id: newId(), name, files, entry: ENTRY, createdAt: now, updatedAt: now };
}

function upgrade(request: IDBOpenDBRequest, oldVersion: number) {
  const db = request.result;
  const tx = request.transaction!;
  if (oldVersion < 1) db.createObjectStore(PROJECTS);
  if (oldVersion < 2) {
    db.createObjectStore(META);
    const projects = tx.objectStore(PROJECTS);
    const get = projects.get(V1_KEY);
    get.onsuccess = () => {
      const old = get.result as Partial<SavedProject> | undefined;
      if (old === undefined) return;
      projects.delete(V1_KEY);
      if (typeof old?.code !== 'string') return; // corrupt v1 record: drop it rather than fail the upgrade
      const at = typeof old.updatedAt === 'number' ? old.updatedAt : Date.now();
      const project = newProject({ [ENTRY]: old.code }, 'My application', at);
      projects.put(project, project.id);
      tx.objectStore(META).put(project.id, LAST_OPENED);
    };
  }
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => upgrade(request, event.oldVersion);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(store: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const request = action(tx.objectStore(store));
    let result: T;
    request.onsuccess = () => { result = request.result; };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error ?? request.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  }).finally(() => db.close());
}

// ---------------------------------------------------------------- project list API

export const getProject = (id: string) => run<Project | undefined>(PROJECTS, 'readonly', (s) => s.get(id));
export const putProject = async (project: Project) => { await run(PROJECTS, 'readwrite', (s) => s.put(project, project.id)); };

export async function listProjects(): Promise<ProjectSummary[]> {
  const all = await run<Project[]>(PROJECTS, 'readonly', (s) => s.getAll());
  return all
    .map(({ id, name, createdAt, updatedAt, files, template }) => ({ id, name, createdAt, updatedAt, fileCount: Object.keys(files).length, ...(template ? { template } : {}) }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteProject(id: string) {
  await run(PROJECTS, 'readwrite', (s) => s.delete(id));
  if ((await getLastOpened()) === id) await run(META, 'readwrite', (s) => s.delete(LAST_OPENED));
}

async function mustGet(id: string) {
  const p = await getProject(id);
  if (!p) throw new Error(`Project ${id} not found`);
  return p;
}

export async function renameProject(id: string, name: string): Promise<Project> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('A project needs a name');
  const next = { ...(await mustGet(id)), name: trimmed, updatedAt: Date.now() };
  await putProject(next);
  return next;
}

export async function duplicateProject(id: string, name?: string): Promise<Project> {
  const source = await mustGet(id);
  const now = Date.now();
  const copy: Project = { ...source, files: { ...source.files }, id: newId(), name: name?.trim() || `${source.name} (copy)`, createdAt: now, updatedAt: now };
  await putProject(copy);
  return copy;
}

export const getLastOpened = () => run<string | undefined>(META, 'readonly', (s) => s.get(LAST_OPENED));
export const setLastOpened = async (id: string) => { await run(META, 'readwrite', (s) => s.put(id, LAST_OPENED)); };

/** The project to open on start: `lastOpened` if it still exists, else the newest one. */
export async function getCurrentProject(): Promise<Project | undefined> {
  const last = await getLastOpened();
  const p = last ? await getProject(last) : undefined;
  if (p) return p;
  const newest = (await listProjects())[0];
  return newest ? getProject(newest.id) : undefined;
}

// ---------------------------------------------------------------- single-page API (M2 callers)

/** The current project's entry file, in the v1 shape `Studio.tsx` uses today. */
export async function loadProject(): Promise<SavedProject | undefined> {
  try {
    const p = await getCurrentProject();
    return p ? { code: p.files[p.entry] ?? '', updatedAt: p.updatedAt } : undefined;
  } catch {
    return undefined;
  }
}

/** Writes `code` into the current project's entry file (creating a project on first save). */
export async function saveProject(code: string) {
  const current = await getCurrentProject();
  const project = current
    ? { ...current, files: { ...current.files, [current.entry]: code }, updatedAt: Date.now() }
    : newProject({ [ENTRY]: code }, 'My application');
  await putProject(project);
  await setLastOpened(project.id);
}

// ---------------------------------------------------------------- multi-tab notice (UX-7)

type Message = { type: 'open' | 'here'; projectId: string; tab: string };

/**
 * Announces that this tab opened `projectId`. `onConflict` runs in every tab that has the same
 * project open (UX-7: "This project is open in another tab"). Returns a cleanup function.
 */
export function announceOpen(
  projectId: string,
  onConflict: () => void,
  channelFactory: (name: string) => BroadcastChannel | undefined = (name) => (typeof BroadcastChannel === 'undefined' ? undefined : new BroadcastChannel(name)),
): () => void {
  const channel = channelFactory('eui-studio');
  if (!channel) return () => {};
  const tab = newId();
  channel.onmessage = (event: MessageEvent<Message>) => {
    const msg = event.data;
    if (!msg || msg.tab === tab || msg.projectId !== projectId) return;
    if (msg.type === 'open') channel.postMessage({ type: 'here', projectId, tab } satisfies Message);
    onConflict();
  };
  channel.postMessage({ type: 'open', projectId, tab } satisfies Message);
  return () => channel.close();
}
