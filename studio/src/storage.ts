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

/**
 * The v1 `current` record. M2 wrote `{ code, updatedAt }`; the M3-04 build (#25) also wrote
 * `files`/`entry`. Treated as untrusted input by the migration.
 */
export interface V1Record { code?: unknown; updatedAt?: unknown; files?: unknown; entry?: unknown }

/** What `loadProject` returns: the stored project (id, name and timestamps included) plus its entry text. */
export type LoadedProject = Project & { code: string };

/** @deprecated M2 name kept for callers; use `LoadedProject`. */
export type SavedProject = LoadedProject;

/** Shown once after a migration that could not carry everything over (kept in `meta.migrationNotice`). */
export interface MigrationNotice { message: string; skipped: string[]; at: number }

/** Browser storage could not be opened or read (private mode, quota, corrupt data, …). */
export class StorageUnavailableError extends Error {
  constructor(message = "Couldn't open browser storage.", options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'StorageUnavailableError';
  }
}

const MIGRATION_NOTICE = 'migrationNotice';
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const has = (files: object, path: unknown): path is string => typeof path === 'string' && Object.hasOwn(files, path);
/** Adds an own data property, so a key such as `__proto__` is a file, never a prototype change. */
const setFile = (files: Record<string, string>, path: string, text: string) => {
  Object.defineProperty(files, path, { value: text, enumerable: true, configurable: true, writable: true });
};

/**
 * Entry fallback order: the given entry, `src/App.tsx`, the first `.tsx` file, then the first file
 * of any type (so a project without a page still opens and can be fixed in code). Sorted for stability.
 */
function pickEntry(files: Record<string, string>, wanted: unknown): string | undefined {
  if (has(files, wanted)) return wanted;
  if (has(files, ENTRY)) return ENTRY;
  const paths = Object.keys(files).sort();
  return paths.find((p) => p.endsWith('.tsx')) ?? paths[0];
}

/**
 * Turns a v1 record into project contents, never dropping anything silently: every file that
 * can't be carried over and every entry change is described in `notice` (the backup keeps all).
 */
export function migrateV1(old: unknown): { files: Record<string, string>; entry: string; updatedAt?: number; notice?: string; skipped: string[] } | { notice: string; skipped: string[] } {
  if (!isRecord(old)) return { notice: "Your saved page from the previous Studio version couldn't be read. A copy is kept in browser storage (meta.v1Backup).", skipped: [] };
  const updatedAt = typeof old.updatedAt === 'number' ? old.updatedAt : undefined;
  const files: Record<string, string> = {};
  const skipped: string[] = [];
  if (isRecord(old.files)) {
    for (const [path, text] of Object.entries(old.files)) {
      if (typeof text === 'string') setFile(files, path, text); else skipped.push(path);
    }
  }
  const notes: string[] = [];
  if (skipped.length) notes.push(`${skipped.length} file(s) had unreadable contents and were left out: ${skipped.join(', ')}.`);
  // Order: a valid recorded entry; a recorded entry missing from files gets `code` back (so the
  // page text is never lost); `src/App.tsx`; `code` as `src/App.tsx`; the first `.tsx` file.
  const code = typeof old.code === 'string' ? old.code : undefined;
  let entry: string | undefined;
  let codePlaced = false;
  if (has(files, old.entry)) entry = old.entry;
  else if (typeof old.entry === 'string' && code !== undefined && /^[A-Za-z0-9._/-]+\.(tsx|jsx|ts|js)$/.test(old.entry) && !old.entry.split('/').includes('..')) {
    setFile(files, old.entry, code);
    entry = old.entry;
    codePlaced = true;
  } else if (has(files, ENTRY)) entry = ENTRY;
  else if (code !== undefined) { setFile(files, ENTRY, code); entry = ENTRY; codePlaced = true; }
  else entry = pickEntry(files, undefined);
  if (!entry) return { notice: `Your saved project from the previous Studio version couldn't be opened. ${notes.join(' ')} A copy is kept in browser storage (meta.v1Backup).`.replace(/\s+/g, ' '), skipped };
  const hadFiles = isRecord(old.files);
  if (code !== undefined && !codePlaced && !Object.values(files).includes(code)) {
    notes.push('The saved page text (`code`) did not match any file and survives only in browser storage (meta.v1Backup).');
  }
  if (isRecord(old.files) && typeof old.entry === 'string' && !has(old.files, old.entry)) {
    notes.push(old.entry === entry ? `The entry file ${old.entry} was missing from the files and was restored from the saved page.` : `The entry file ${old.entry} was missing, so ${entry} is used instead.`);
  } else if (hadFiles && old.entry !== entry) notes.push(`No entry file was recorded, so ${entry} is used.`);
  const notice = notes.length ? `Your project was upgraded with changes. ${notes.join(' ')} The original is kept in browser storage (meta.v1Backup).` : undefined;
  return { files, entry, updatedAt, notice, skipped };
}
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
      const old: unknown = get.result;
      if (old === undefined) return;
      const meta = tx.objectStore(META);
      meta.put({ value: old, migratedAt: Date.now() } satisfies V1Backup, V1_BACKUP);
      // The v1 record stays where it is (manual recovery). Null, non-objects and unusable records
      // are not migrated; anything left out is reported through `meta.migrationNotice`.
      const result = migrateV1(old);
      if (result.notice) meta.put({ message: result.notice, skipped: result.skipped, at: Date.now() } satisfies MigrationNotice, MIGRATION_NOTICE);
      if (!('files' in result)) return;
      const project = { ...newProject(result.files, 'My application', result.updatedAt), entry: result.entry };
      projects.put(project, project.id);
      meta.put(project.id, LAST_OPENED);
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
  isRecord(value) && typeof value.id === 'string' && value.id !== V1_KEY && isRecord(value.files) && typeof value.entry === 'string';

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

export const getMigrationNotice = () => run<MigrationNotice | undefined>(META, 'readonly', (s) => s.get(MIGRATION_NOTICE));
export const clearMigrationNotice = async () => { await run(META, 'readwrite', (s) => s.delete(MIGRATION_NOTICE)); };
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

// ---------------------------------------------------------------- Studio load / save

/**
 * The project Studio opens on start, or `undefined` when nothing is stored yet. A stored entry that
 * is missing from `files` is repaired with the migration's fallback order; no file is dropped.
 * Throws `StorageBlockedError` or `StorageUnavailableError`: callers must not autosave after a throw,
 * or they would overwrite the stored project with whatever is on screen.
 */
export async function loadProject(): Promise<LoadedProject | undefined> {
  let p: Project | undefined;
  try {
    p = await getCurrentProject();
  } catch (err) {
    if (err instanceof StorageBlockedError || err instanceof StorageUnavailableError) throw err;
    throw new StorageUnavailableError(undefined, { cause: err });
  }
  if (!p) return undefined;
  const entry = pickEntry(p.files, p.entry);
  // A project without any file has nothing to show; Studio starts fresh and saves under a new id,
  // so the empty record is never overwritten.
  if (!entry) return undefined;
  return { ...p, entry, code: p.files[entry] };
}

/**
 * Saves Studio's project under its own `id` (creating it when it isn't stored yet) and makes it
 * `lastOpened`. The stored name and `createdAt` win: renames go through `renameProject`.
 * A string (M2 callers) replaces only the current project's entry file.
 * Limits (200 files, 1 MB, 10 MB) are enforced by the store and import (M3-13), not here.
 */
export interface SaveOptions {
  /** Make this project `lastOpened` (default). Docs examples pass `false` so they never hide the user's project. */
  remember?: boolean;
}

export async function saveProject(input: string | Project, options: SaveOptions = {}): Promise<void> {
  const remember = options.remember ?? true;
  if (typeof input === 'string') {
    const current = await getCurrentProject();
    const project = current
      ? { ...current, files: { ...current.files, [current.entry]: input }, updatedAt: Date.now() }
      : newProject({ [ENTRY]: input }, 'My application');
    await putProject(project);
    await setLastOpened(project.id);
    return;
  }
  if (!has(input.files, input.entry)) throw new Error(`Can't save: the entry file ${input.entry} is not in the project.`);
  const stored = await getProject(input.id);
  const project: Project = stored
    ? { ...stored, files: { ...input.files }, entry: input.entry, updatedAt: Date.now() }
    : { ...input, files: { ...input.files }, updatedAt: Date.now() };
  await putProject(project);
  if (remember) await setLastOpened(project.id);
}

// ---------------------------------------------------------------- multi-tab notice (UX-7)

/** The `BroadcastChannel('eui-studio')` protocol (shape signed off for M3-03). */
export type ChannelMessage = { type: 'open' | 'here' | 'saved' | 'take-over' | 'left'; projectId: string; tabId: string };

export interface ChannelHandlers {
  /** Another tab opened or saved the same project. Fires on every message: callers announce once (UX-7). */
  onConflict?: () => void;
  /** Another tab pressed "Use this tab": this tab should go read-only. */
  onTakeOver?: () => void;
  /** The last other tab with the same project closed (peers are counted by `tabId`): the strip can clear. */
  onLeft?: () => void;
  /** The number of other tabs with this project open changed. */
  onPeersChange?: (count: number) => void;
}

export interface ProjectChannel {
  readonly tabId: string;
  /** Call after each save so other tabs see the conflict. */
  announceSaved(): void;
  /** "Use this tab": other tabs on the project go read-only. */
  takeOver(): void;
  /** Other tabs that currently have this project open. */
  peerCount(): number;
  /** Posts `left` and closes the channel. Safe to call twice. Also runs on `pagehide`. */
  close(): void;
}

const defaultFactory = (name: string) => (typeof BroadcastChannel === 'undefined' ? undefined : new BroadcastChannel(name));

/**
 * Joins the project's tab channel. The channel closes itself on the page's `pagehide` event
 * (`page`, default `window`), which also covers bfcache. Callers should still call `close()`
 * when they switch to another project or unmount.
 */
export function openProjectChannel(
  projectId: string,
  handlers: ChannelHandlers,
  channelFactory: (name: string) => BroadcastChannel | undefined = defaultFactory,
  page: EventTarget | undefined = typeof window === 'undefined' ? undefined : window,
): ProjectChannel {
  const tabId = newId();
  const peers = new Set<string>();
  const setPeer = (id: string, present: boolean) => {
    const had = peers.has(id);
    if (present === had) return;
    if (present) peers.add(id); else peers.delete(id);
    handlers.onPeersChange?.(peers.size);
    if (!present && peers.size === 0) handlers.onLeft?.();
  };
  const channel = channelFactory('eui-studio');
  let closed = !channel;
  const post = (type: ChannelMessage['type']) => { if (!closed) channel?.postMessage({ type, projectId, tabId } satisfies ChannelMessage); };
  if (channel) {
    channel.onmessage = (event: MessageEvent<ChannelMessage>) => {
      const msg = event.data;
      if (!msg || msg.tabId === tabId || msg.projectId !== projectId) return;
      if (msg.type === 'left') { setPeer(msg.tabId, false); return; }
      setPeer(msg.tabId, true);
      if (msg.type === 'open') post('here');
      if (msg.type === 'take-over') handlers.onTakeOver?.();
      else handlers.onConflict?.();
    };
    post('open');
  }
  const close = () => {
    page?.removeEventListener('pagehide', close);
    if (closed) return;
    post('left');
    closed = true;
    channel?.close();
  };
  if (channel) page?.addEventListener('pagehide', close);
  return {
    tabId,
    announceSaved: () => post('saved'),
    takeOver: () => post('take-over'),
    peerCount: () => peers.size,
    close,
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
