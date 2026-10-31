import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DB_NAME,
  DB_VERSION,
  announceOpen,
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

describe('migration from v1', () => {
  it('wraps the v1 `current` record as a project and deletes `current`', async () => {
    await seedV1({ code: 'export default 1;', updatedAt: 1234 });
    const list = await listProjects();
    expect(list).toHaveLength(1);
    const p = (await getProject(list[0].id))!;
    expect(p.files).toEqual({ 'src/App.tsx': 'export default 1;' });
    expect(p.entry).toBe('src/App.tsx');
    expect(p.name).toBe('My application');
    expect(p.updatedAt).toBe(1234);
    expect(await getLastOpened()).toBe(p.id);
    expect(await rawKeys('projects')).toEqual([p.id]);
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
  it('ignores a corrupt v1 record instead of failing the upgrade', async () => {
    await seedV1({ nope: true });
    expect(await listProjects()).toEqual([]);
    expect(await rawKeys('projects')).toEqual([]);
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
    expect((await duplicateProject(a.id, 'Other')).name).toBe('Other');
    expect(await listProjects()).toHaveLength(3);
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
  it('is a no-op where BroadcastChannel is missing', () => {
    expect(() => announceOpen('p', () => {}, () => undefined)()).not.toThrow();
  });
});
