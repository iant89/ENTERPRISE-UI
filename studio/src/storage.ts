import type { Project } from './model/project';

/**
 * Project persistence in IndexedDB (docs/plans/studio-m3-design.md §2.3, ide-design.md §5.7).
 *
 * DB v2 has two stores: `projects` (key = `project.id`, value = `Project`) and `meta`
 * (keys `lastOpened`, `v1Backup`). Upgrading from v1 wraps the single-page record `current` as a
 * project, copies the raw v1 value (even a corrupt one) to `meta.v1Backup` as `{ value, migratedAt }`,
 * and leaves `current` untouched in the `projects` store (never read again).
 *
 * Downgrading the Studio after M3 isn't supported: an M2 build opens version 1, gets a `VersionError`
 * on this v2 database, shows its starter page and cannot save. The v1 record is kept in
 * `meta.v1Backup` (and in `projects/current`) for manual recovery; see studio/README.md.
 *
 * Every connection closes itself on `versionchange`, so this build never blocks a later upgrade. An
 * upgrade blocked by an older tab rejects with `StorageBlockedError` after `blockedTimeoutMs`.
 *
 * Each call opens its own connection; multi-step helpers (`deleteProject`, `saveProject`) use
 * separate transactions and are not atomic. That is acceptable for M3.
 * Undo history is not persisted (decision T4).
 */
export const DB_NAME = 'eui-studio';
export const DB_VERSION = 2;
const PROJECTS = 'projects';
const META = 'meta';
const V1_KEY = 'current';
const LAST_OPENED = 'lastOpened';
const V1_BACKUP = 'v1Backup';

export const storageOptions = { blockedTimeoutMs: 3000 };

/** The database upgrade is blocked by another tab that still has an older version open. */
export class StorageBlockedError extends Error {
  constructor(message = 'Studio storage is blocked by another tab running an older version. Close other Studio tabs and reload.') {
    super(message);
    this.name = 'StorageBlockedError';
  }
}

export interface V1Backup { value: unknown; migratedAt: number }
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
      tx.objectStore(META).put({ value: old, migratedAt: Date.now() } satisfies V1Backup, V1_BACKUP);
      // The v1 record stays where it is (manual recovery); only a valid one is migrated.
      if (typeof old?.code !== 'string') return;
      const at = typeof old.updatedAt === 'number' ? old.updatedAt : Date.now();
      const project = newProject({ [ENTRY]: old.code }, 'My application', at);
      projects.put(project, project.id);
      tx.objectStore(META).put(project.id, LAST_OPENED);
    };
  }
}

/** Opens the v2 database. Exported for tests and for callers that hold a connection. */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    request.onupgradeneeded = (event) => upgrade(request, event.oldVersion);
    request.onblocked = () => {
      timer ??= setTimeout(() => { settled = true; reject(new StorageBlockedError()); }, storageOptions.blockedTimeoutMs);
    };
    request.onsuccess = () => {
      clearTimeout(timer);
      const db = request.result;
      db.onversionchange = () => db.close();
      if (settled) { db.close(); return; }
      settled = true;
      resolve(db);
    };
    request.onerror = () => {
      clearTimeout(timer);
      if (!settled) { settled = true; reject(request.error); }
    };
  });
}
const open = openDatabase;

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

/** True for a v2 project record; filters out the retained v1 `current` record. */
const isProject = (value: unknown): value is Project =>
  !!value && typeof value === 'object' && typeof (value as Project).id === 'string' && (value as Project).id !== V1_KEY && typeof (value as Project).files === 'object';

export const getProject = async (id: string): Promise<Project | undefined> => {
  if (id === V1_KEY) return undefined;
  const value = await run<unknown>(PROJECTS, 'readonly', (s) => s.get(id));
  return isProject(value) ? value : undefined;
};
export const putProject = async (project: Project) => {
  if (project.id === V1_KEY) throw new Error(`"${V1_KEY}" is reserved for the retained v1 record`);
  await run(PROJECTS, 'readwrite', (s) => s.put(project, project.id));
};

export async function listProjects(): Promise<ProjectSummary[]> {
  const all = await run<unknown[]>(PROJECTS, 'readonly', (s) => s.getAll());
  return all
    .filter(isProject)
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

const COPY_SUFFIX = /\s*\((?:copy)(?:\s+\d+)?\)$/i;

/**
 * UX-6 §6.4: "<name> (copy)", then "(copy 2)", "(copy 3)" with the first free number. A copy of a
 * copy does not stack the suffix, and names are compared case-insensitively and trimmed.
 */
export function copyName(name: string, existing: Iterable<string>): string {
  const taken = new Set([...existing].map((n) => n.trim().toLowerCase()));
  const stem = name.trim().replace(COPY_SUFFIX, '').trim();
  for (let i = 1; ; i++) {
    const candidate = i === 1 ? `${stem} (copy)` : `${stem} (copy ${i})`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}

export async function duplicateProject(id: string, name?: string): Promise<Project> {
  const source = await mustGet(id);
  const now = Date.now();
  const finalName = name?.trim() || copyName(source.name, (await listProjects()).map((p) => p.name));
  const copy: Project = { ...source, files: { ...source.files }, id: newId(), name: finalName, createdAt: now, updatedAt: now };
  await putProject(copy);
  return copy;
}

export const getV1Backup = () => run<V1Backup | undefined>(META, 'readonly', (s) => s.get(V1_BACKUP));
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

/** The `BroadcastChannel('eui-studio')` protocol (shape signed off for M3-03). */
export type ChannelMessage = { type: 'open' | 'here' | 'saved' | 'take-over' | 'left'; projectId: string; tabId: string };

export interface ChannelHandlers {
  /** Another tab opened or saved the same project. Fires on every message: callers announce once (UX-7). */
  onConflict?: () => void;
  /** Another tab pressed "Use this tab": this tab should go read-only. */
  onTakeOver?: () => void;
  /** Another tab with the same project closed: the strip can clear. */
  onLeft?: () => void;
}

export interface ProjectChannel {
  readonly tabId: string;
  /** Call after each save so other tabs see the conflict. */
  announceSaved(): void;
  /** "Use this tab": other tabs on the project go read-only. */
  takeOver(): void;
  /** Posts `left` and closes the channel. Safe to call twice. */
  close(): void;
}

const defaultFactory = (name: string) => (typeof BroadcastChannel === 'undefined' ? undefined : new BroadcastChannel(name));

export function openProjectChannel(
  projectId: string,
  handlers: ChannelHandlers,
  channelFactory: (name: string) => BroadcastChannel | undefined = defaultFactory,
): ProjectChannel {
  const tabId = newId();
  const channel = channelFactory('eui-studio');
  let closed = !channel;
  const post = (type: ChannelMessage['type']) => { if (!closed) channel!.postMessage({ type, projectId, tabId } satisfies ChannelMessage); };
  if (channel) {
    channel.onmessage = (event: MessageEvent<ChannelMessage>) => {
      const msg = event.data;
      if (!msg || msg.tabId === tabId || msg.projectId !== projectId) return;
      if (msg.type === 'open') post('here');
      if (msg.type === 'open' || msg.type === 'here' || msg.type === 'saved') handlers.onConflict?.();
      else if (msg.type === 'take-over') handlers.onTakeOver?.();
      else if (msg.type === 'left') handlers.onLeft?.();
    };
    post('open');
  }
  return {
    tabId,
    announceSaved: () => post('saved'),
    takeOver: () => post('take-over'),
    close: () => { if (closed) return; post('left'); closed = true; channel!.close(); },
  };
}

/** Shorthand: announces `projectId` and calls `onConflict` (see `openProjectChannel`). Returns cleanup. */
export function announceOpen(
  projectId: string,
  onConflict: () => void,
  channelFactory: (name: string) => BroadcastChannel | undefined = defaultFactory,
): () => void {
  const ch = openProjectChannel(projectId, { onConflict }, channelFactory);
  return ch.close;
}
