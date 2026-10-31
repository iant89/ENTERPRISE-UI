import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DB_NAME,
  DB_VERSION,
  StorageBlockedError,
  announceOpen,
  copyName,
  getV1Backup,
  openDatabase,
  openProjectChannel,
  storageOptions,
  deleteProject,
  duplicateProject,
  getLastOpened,
  getProject,
  listProjects,
  loadProject,
  putProject,
  renameProject,
  saveProject,
  setLastOpened,
} from '../../studio/src/storage';
import { createProject } from '../../studio/src/model/project';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

async function seedV1Raw(value: unknown) {
  globalThis.indexedDB = new IDBFactory();
  await seedV1(value);
}

/** Writes a record exactly like the M2 (v1) storage.ts did. */
function seedV1(value: unknown) {
  return new Promise<void>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('projects');
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('projects', 'readwrite');
      if (value !== undefined) tx.objectStore('projects').put(value, 'current');
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  });
}

function rawKeys(store: string) {
  return new Promise<IDBValidKey[]>((resolve) => {
    const req = indexedDB.open(DB_NAME);
    req.onsuccess = () => {
      const db = req.result;
      const r = db.transaction(store).objectStore(store).getAllKeys();
      r.onsuccess = () => { db.close(); resolve(r.result); };
    };
  });
}

function rawValue(store: string, key: IDBValidKey) {
  return new Promise<unknown>((resolve) => {
    const req = indexedDB.open(DB_NAME);
    req.onsuccess = () => {
      const db = req.result;
      const r = db.transaction(store).objectStore(store).get(key);
      r.onsuccess = () => { db.close(); resolve(r.result); };
    };
  });
}

describe('migration from v1', () => {
  it('wraps the v1 `current` record as a project and leaves `current` in place', async () => {
    await seedV1({ code: 'export default 1;', updatedAt: 1234 });
    const list = await listProjects();
    expect(list).toHaveLength(1);
    const p = (await getProject(list[0].id))!;
    expect(p.files).toEqual({ 'src/App.tsx': 'export default 1;' });
    expect(p.entry).toBe('src/App.tsx');
    expect(p.name).toBe('My application');
    expect(p.updatedAt).toBe(1234);
    expect(await getLastOpened()).toBe(p.id);
    expect((await rawKeys('projects')).sort()).toEqual([p.id, 'current'].sort());
    expect(DB_VERSION).toBe(2);
  });
  it('the old single-page API still returns the migrated code', async () => {
    await seedV1({ code: 'old', updatedAt: 1 });
    expect((await loadProject())?.code).toBe('old');
  });
  it('handles a v1 database without `current` and a fresh browser', async () => {
    await seedV1(undefined);
    expect(await listProjects()).toEqual([]);
    globalThis.indexedDB = new IDBFactory();
    expect(await listProjects()).toEqual([]);
    expect(await loadProject()).toBeUndefined();
  });
  it('ignores a corrupt v1 record instead of failing the upgrade, and keeps it', async () => {
    await seedV1({ nope: true });
    expect(await listProjects()).toEqual([]);
    expect(await rawKeys('projects')).toEqual(['current']);
  });
  it('keeps the v1 record byte-for-byte for manual recovery, without ever reading it again', async () => {
    const v1 = { code: 'export default function Page() { return null; }', updatedAt: 42 };
    await seedV1(v1);
    const [summary] = await listProjects();
    await saveProject('changed');
    await deleteProject(summary.id);
    expect(await rawValue('projects', 'current')).toEqual(v1);
    expect(await listProjects()).toEqual([]);
    expect(await getProject('current')).toBeUndefined();
    expect(await loadProject()).toBeUndefined();
    await saveProject('fresh');
    expect((await listProjects()).length).toBe(1);
    expect(await rawValue('projects', 'current')).toEqual(v1);
  });
  it('keeps the raw v1 value in meta.v1Backup', async () => {
    const v1 = { code: 'x', updatedAt: 7 };
    await seedV1(v1);
    const backup = (await getV1Backup())!;
    expect(backup.value).toEqual(v1);
    expect(typeof backup.migratedAt).toBe('number');
    await saveProject('changed');
    expect((await getV1Backup())!.value).toEqual(v1);
  });
  it('backs up a corrupt v1 record too', async () => {
    await seedV1({ nope: true });
    expect((await getV1Backup())!.value).toEqual({ nope: true });
    await seedV1Raw('just a string');
    expect((await getV1Backup())!.value).toBe('just a string');
  });
  it('writes no backup when there was nothing to migrate', async () => {
    await seedV1(undefined);
    expect(await getV1Backup()).toBeUndefined();
  });
  it('never overwrites the retained record through putProject', async () => {
    await expect(putProject({ ...createProject({}), id: 'current' })).rejects.toThrow(/reserved/);
  });
});

describe('blocked upgrades and versionchange', () => {
  it('rejects with StorageBlockedError when an old tab holds the v1 database open', async () => {
    await seedV1(undefined);
    const old = await new Promise<IDBDatabase>((resolve) => { const r = indexedDB.open(DB_NAME, 1); r.onsuccess = () => resolve(r.result); });
    const prev = storageOptions.blockedTimeoutMs;
    storageOptions.blockedTimeoutMs = 50;
    try {
      const err = await listProjects().catch((e: unknown) => e);
      expect(err).toBeInstanceOf(StorageBlockedError);
      expect((err as StorageBlockedError).name).toBe('StorageBlockedError');
    } finally {
      storageOptions.blockedTimeoutMs = prev;
      old.close();
    }
    // once the old tab is gone the upgrade goes through
    expect(await listProjects()).toEqual([]);
  });
  it('closes its own connection on versionchange so it never blocks a later upgrade', async () => {
    const db = await openDatabase();
    let blocked = false;
    await new Promise<void>((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, DB_VERSION + 1);
      r.onblocked = () => { blocked = true; };
      r.onsuccess = () => { r.result.close(); resolve(); };
      r.onerror = () => reject(r.error);
    });
    expect(blocked).toBe(false);
    expect(() => db.transaction('projects')).toThrow();
  });
});

describe('copyName (UX-6 §6.4)', () => {
  it('appends (copy), then the first free number', () => {
    expect(copyName('Sales', ['Sales'])).toBe('Sales (copy)');
    expect(copyName('Sales', ['Sales', 'Sales (copy)'])).toBe('Sales (copy 2)');
    expect(copyName('Sales', ['Sales', 'Sales (copy)', 'Sales (copy 2)', 'Sales (copy 4)'])).toBe('Sales (copy 3)');
  });
  it('never stacks the suffix when copying a copy', () => {
    expect(copyName('Sales (copy)', ['Sales', 'Sales (copy)'])).toBe('Sales (copy 2)');
    expect(copyName('Sales (copy 3)', ['Sales (copy 3)'])).toBe('Sales (copy)');
    expect(copyName('Sales (Copy 2)', ['Sales (copy)', 'Sales (copy 2)'])).toBe('Sales (copy 3)');
  });
  it('compares case-insensitively and trimmed', () => {
    expect(copyName('  Sales  ', ['sales', ' SALES (COPY) '])).toBe('Sales (copy 2)');
  });
});

describe('project list API', () => {
  it('puts, lists (newest first), gets and deletes', async () => {
    const a = { ...createProject({ 'src/App.tsx': 'a' }, 'src/App.tsx', 'A'), updatedAt: 1 };
    const b = { ...createProject({ 'src/App.tsx': 'b', 'src/x.ts': '' }, 'src/App.tsx', 'B'), updatedAt: 2 };
    await putProject(a);
    await putProject(b);
    expect((await listProjects()).map((p) => [p.name, p.fileCount])).toEqual([['B', 2], ['A', 1]]);
    expect(await getProject(a.id)).toEqual(a);
    expect(await getProject('missing')).toBeUndefined();
    await setLastOpened(a.id);
    await deleteProject(a.id);
    expect(await getProject(a.id)).toBeUndefined();
    expect(await getLastOpened()).toBeUndefined();
  });
  it('renames and duplicates', async () => {
    const a = createProject({ 'src/App.tsx': 'a' }, 'src/App.tsx', 'Orders');
    await putProject(a);
    const renamed = await renameProject(a.id, 'Sales');
    expect(renamed.name).toBe('Sales');
    expect((await getProject(a.id))!.name).toBe('Sales');
    const copy = await duplicateProject(a.id);
    expect(copy.id).not.toBe(a.id);
    expect(copy.name).toBe('Sales (copy)');
    expect(copy.files).toEqual(a.files);
    expect((await duplicateProject(a.id)).name).toBe('Sales (copy 2)');
    expect((await duplicateProject(copy.id)).name).toBe('Sales (copy 3)');
    expect((await duplicateProject(a.id, 'Other')).name).toBe('Other');
    expect(await listProjects()).toHaveLength(5);
    await expect(renameProject('missing', 'x')).rejects.toThrow(/not found/);
    await expect(duplicateProject('missing')).rejects.toThrow(/not found/);
    await expect(renameProject(a.id, '   ')).rejects.toThrow(/name/);
  });
});

describe('single-page compatibility (autosave and Ctrl+S in Studio.tsx)', () => {
  it('saveProject creates a project on first save and then updates its entry', async () => {
    await saveProject('one');
    await saveProject('two');
    const list = await listProjects();
    expect(list).toHaveLength(1);
    expect((await loadProject())?.code).toBe('two');
    expect((await getProject(list[0].id))!.files['src/App.tsx']).toBe('two');
  });
  it('writes to the last opened project and keeps its other files', async () => {
    const p = createProject({ 'src/App.tsx': 'a', 'src/x.ts': 'x' }, 'src/App.tsx', 'P');
    await putProject(p);
    await putProject(createProject({ 'src/App.tsx': 'other' }));
    await setLastOpened(p.id);
    await saveProject('edited');
    const saved = (await getProject(p.id))!;
    expect(saved.files).toEqual({ 'src/App.tsx': 'edited', 'src/x.ts': 'x' });
    expect(saved.updatedAt).toBeGreaterThanOrEqual(p.updatedAt);
    expect((await loadProject())?.code).toBe('edited');
  });
  it('falls back to the newest project when lastOpened is stale', async () => {
    await putProject({ ...createProject({ 'src/App.tsx': 'new' }), updatedAt: 5 });
    await putProject({ ...createProject({ 'src/App.tsx': 'old' }), updatedAt: 1 });
    await setLastOpened('gone');
    expect((await loadProject())?.code).toBe('new');
  });
});

describe('announceOpen (BroadcastChannel notice)', () => {
  class Bus {
    static channels: Bus[] = [];
    onmessage: ((e: { data: unknown }) => void) | null = null;
    closed = false;
    constructor(readonly name: string) { Bus.channels.push(this); }
    postMessage(data: unknown) {
      for (const c of Bus.channels) if (c !== this && !c.closed && c.name === this.name) c.onmessage?.({ data });
    }
    close() { this.closed = true; }
  }
  const factory = (name: string) => new Bus(name) as unknown as BroadcastChannel;

  it('warns both tabs when the same project opens twice, not for other projects', () => {
    Bus.channels = [];
    const seen: string[] = [];
    const a = announceOpen('p1', () => seen.push('a'), factory);
    const c = announceOpen('p2', () => seen.push('c'), factory);
    expect(seen).toEqual([]);
    const b = announceOpen('p1', () => seen.push('b'), factory);
    expect(seen.sort()).toEqual(['a', 'b']);
    expect(Bus.channels[0].name).toBe('eui-studio');
    a(); b(); c();
    expect(Bus.channels.every((x) => x.closed)).toBe(true);
  });
  it('take-over, saved and left messages', () => {
    Bus.channels = [];
    const log: string[] = [];
    const a = openProjectChannel('p1', { onConflict: () => log.push('a:conflict'), onTakeOver: () => log.push('a:takeover'), onLeft: () => log.push('a:left') }, factory);
    const b = openProjectChannel('p1', { onConflict: () => log.push('b:conflict'), onTakeOver: () => log.push('b:takeover'), onLeft: () => log.push('b:left') }, factory);
    const other = openProjectChannel('p2', { onConflict: () => log.push('x'), onTakeOver: () => log.push('x'), onLeft: () => log.push('x') }, factory);
    log.length = 0;
    b.announceSaved();
    expect(log).toEqual(['a:conflict']);
    log.length = 0;
    b.takeOver();
    expect(log).toEqual(['a:takeover']);
    log.length = 0;
    b.close();
    expect(log).toEqual(['a:left']);
    b.close();
    expect(log).toEqual(['a:left']);
    a.close(); other.close();
    expect(log).toEqual(['a:left']);
  });
  it('counts peers by tabId: onLeft fires only when the last other tab closes', () => {
    Bus.channels = [];
    const counts: number[] = [];
    let left = 0;
    const a = openProjectChannel('p1', { onPeersChange: (n) => counts.push(n), onLeft: () => { left++; } }, factory);
    const b = openProjectChannel('p1', {}, factory);
    const c = openProjectChannel('p1', {}, factory);
    expect(a.peerCount()).toBe(2);
    expect(b.peerCount()).toBe(2);
    b.announceSaved(); // repeat messages from a known peer do not change the count
    expect(a.peerCount()).toBe(2);
    b.close();
    expect(a.peerCount()).toBe(1);
    expect(c.peerCount()).toBe(1);
    expect(left).toBe(0);
    c.close();
    expect(a.peerCount()).toBe(0);
    expect(left).toBe(1);
    expect(counts).toEqual([1, 2, 1, 0]);
    a.close();
  });
  it('closes itself on pagehide and stops listening afterwards', () => {
    Bus.channels = [];
    const page = new EventTarget();
    let left = 0;
    const a = openProjectChannel('p1', { onLeft: () => { left++; } }, factory);
    const b = openProjectChannel('p1', {}, factory, page);
    expect(a.peerCount()).toBe(1);
    page.dispatchEvent(new Event('pagehide'));
    expect(left).toBe(1);
    expect(a.peerCount()).toBe(0);
    page.dispatchEvent(new Event('pagehide'));
    b.close();
    expect(left).toBe(1);
    a.close();
  });
  it('messages carry { type, projectId, tabId }', () => {
    Bus.channels = [];
    const seen: unknown[] = [];
    const spy = factory('eui-studio') as unknown as Bus;
    spy.onmessage = (e) => seen.push(e.data);
    const ch = openProjectChannel('p9', {}, factory);
    ch.takeOver();
    ch.close();
    expect(seen.map((m) => (m as { type: string }).type)).toEqual(['open', 'take-over', 'left']);
    for (const m of seen) expect(m).toEqual({ type: expect.any(String), projectId: 'p9', tabId: expect.any(String) });
  });
  it('is a no-op where BroadcastChannel is missing', () => {
    const ch = openProjectChannel('p', {}, () => undefined);
    expect(() => { ch.announceSaved(); ch.takeOver(); ch.close(); }).not.toThrow();
    expect(() => announceOpen('p', () => {}, () => undefined)()).not.toThrow();
  });
});
