/** QA (PR #26): storage v2 round-trip and v1 → v2 migration without data loss. */
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { DB_NAME, getCurrentProject, getLastOpened, getProject, getV1Backup, listProjects, loadProject, openDatabase, putProject, saveProject } from '../../studio/src/storage';
import { createProject } from '../../studio/src/model/project';

beforeEach(() => { globalThis.indexedDB = new IDBFactory(); });

function seedV1(value: unknown) {
  return new Promise<void>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('projects');
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('projects', 'readwrite');
      tx.objectStore('projects').put(value, 'current');
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  });
}
const reopen = async () => (await openDatabase()).close();
const tricky = 'import { Title } from "@enterprise-ui/react";\r\n// ünïcødé 🚀 \u2028 tabs\t\n' + 'x'.repeat(900_000);

describe('storage v2 round-trip', () => {
  it('putProject → getProject is deep-equal (nested paths, unicode, empty and large files, template)', async () => {
    const p = { ...createProject({ 'src/App.tsx': tricky, 'src/a/b/c/Deep.tsx': '', 'README.md': '# ✓', 'data.json': '{"a":1}' }, 'src/App.tsx', 'Ünïcode ✓'), template: 'dashboard' };
    await putProject(p);
    await reopen();
    expect(await getProject(p.id)).toEqual(p);
    const [s] = await listProjects();
    expect(s).toMatchObject({ id: p.id, name: 'Ünïcode ✓', fileCount: 4, template: 'dashboard' });
  });
  it('saveProject(Project) then loadProject returns every file and the entry', async () => {
    const p = createProject({ 'src/App.tsx': 'A', 'src/main.tsx': 'M' }, 'src/main.tsx');
    await saveProject(p);
    expect(await loadProject()).toMatchObject({ code: 'M', entry: 'src/main.tsx', files: { 'src/App.tsx': 'A', 'src/main.tsx': 'M' } });
  });
});

describe('v1 → v2 migration: no data loss (P0)', () => {
  it('a pure M2 record keeps its code byte-for-byte, its updatedAt, and becomes lastOpened', async () => {
    await seedV1({ code: tricky, updatedAt: 1234 });
    const p = (await getCurrentProject())!;
    expect(p.files).toEqual({ 'src/App.tsx': tricky });
    expect(p.entry).toBe('src/App.tsx');
    expect(p.updatedAt).toBe(1234);
    expect(await getLastOpened()).toBe(p.id);
    expect((await loadProject())!.code).toBe(tricky);
  });
  it('a partial M2 record (no updatedAt) still migrates with a numeric timestamp', async () => {
    await seedV1({ code: 'X' });
    const p = (await getCurrentProject())!;
    expect(p.files['src/App.tsx']).toBe('X');
    expect(typeof p.updatedAt).toBe('number');
  });
  it('a record with code + files but no entry keeps ALL files, not just code', async () => {
    await seedV1({ code: 'APP', files: { 'src/App.tsx': 'APP', 'src/Header.tsx': 'HEADER' }, updatedAt: 1 });
    const p = (await getCurrentProject())!;
    expect(p.files['src/Header.tsx']).toBe('HEADER');
    expect(p.files['src/App.tsx']).toBe('APP');
  });
  it('a record whose entry is missing from files does not lose code (entry file is readable)', async () => {
    await seedV1({ code: 'APP', files: { 'src/Other.tsx': 'O' }, entry: 'src/App.tsx', updatedAt: 1 });
    const p = (await getCurrentProject())!;
    expect(p.files[p.entry]).toBe('APP');
    expect(p.files['src/Other.tsx']).toBe('O');
  });
  const BAD: unknown[] = [null, 'just a string', 42, { code: 5 }, { files: 'x', entry: 'a' }, { files: ['a'], entry: 'src/App.tsx' }, { files: { 'src/App.tsx': 7 }, entry: 'src/App.tsx' }, {}];
  it.each(BAD.map((v) => [JSON.stringify(v), v]))('corrupt/partial v1 %s: upgrade succeeds, backup verbatim, no broken project', async (_, value) => {
    await seedV1(value);
    await expect(reopen()).resolves.toBeUndefined();
    expect((await getV1Backup())?.value).toEqual(value);
    for (const s of await listProjects()) {
      const p = (await getProject(s.id))!;
      expect(Array.isArray(p.files)).toBe(false);
      for (const text of Object.values(p.files)) expect(typeof text).toBe('string');
      expect(p.entry in p.files).toBe(true);
    }
  });
  it('is idempotent: reopening, loading and saving never re-migrate or duplicate', async () => {
    await seedV1({ code: 'ONE', updatedAt: 5 });
    await reopen();
    const backup1 = await getV1Backup();
    const id = (await getCurrentProject())!.id;
    await reopen();
    await loadProject();
    await saveProject('TWO');
    await reopen();
    const list = await listProjects();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(id);
    expect(await getV1Backup()).toEqual(backup1);
    expect((await loadProject())!.code).toBe('TWO');
  });
  it('saveProject(string) after migration updates only the entry, keeping id, name and other files', async () => {
    await seedV1({ code: 'A', files: { 'src/App.tsx': 'A', 'src/B.tsx': 'B' }, entry: 'src/App.tsx', updatedAt: 1 });
    const before = (await getCurrentProject())!;
    await saveProject('A2');
    const after = (await getCurrentProject())!;
    expect(after).toMatchObject({ id: before.id, name: before.name, entry: 'src/App.tsx', files: { 'src/App.tsx': 'A2', 'src/B.tsx': 'B' } });
    expect(after.updatedAt).toBeGreaterThanOrEqual(before.updatedAt);
  });
  it('saveProject(string) on an empty database creates exactly one project; repeated saves reuse it', async () => {
    await saveProject('first');
    await saveProject('second');
    await saveProject('');
    const list = await listProjects();
    expect(list).toHaveLength(1);
    expect((await loadProject())!.code).toBe('');
  });
});

describe('REGRESSION (FE-reported data-loss risk 2): saveProject must honour project.id', () => {
  it('saving two projects with different ids keeps both; neither overwrites the other', async () => {
    const a = createProject({ 'src/App.tsx': 'AAA' }, 'src/App.tsx', 'Project A');
    const b = createProject({ 'src/App.tsx': 'BBB', 'src/B.tsx': 'b' }, 'src/App.tsx', 'Project B');
    await saveProject(a);
    await saveProject(b);
    expect((await getProject(a.id))?.files).toEqual({ 'src/App.tsx': 'AAA' });
    expect((await getProject(b.id))?.files).toEqual({ 'src/App.tsx': 'BBB', 'src/B.tsx': 'b' });
    expect((await listProjects()).map((p) => p.id).sort()).toEqual([a.id, b.id].sort());
  });
  it('saving a project with an unknown id never replaces the last-opened project', async () => {
    const mine = createProject({ 'src/App.tsx': 'MY WORK' }, 'src/App.tsx', 'Mine');
    await putProject(mine);
    await saveProject(createProject({ 'src/App.tsx': 'STARTER' }));
    expect((await getProject(mine.id))?.files['src/App.tsx']).toBe('MY WORK');
  });
});

describe('REGRESSION (FE-reported data-loss risk 1): failed or unreadable load must not lead to overwrite', () => {
  it('loadProject surfaces a failing read instead of reporting an empty database', async () => {
    const mine = createProject({ 'src/App.tsx': 'MY WORK' }, 'src/App.tsx', 'Mine');
    await putProject(mine);
    const real = globalThis.indexedDB;
    globalThis.indexedDB = { open: () => { throw new Error('boom'); } } as unknown as IDBFactory;
    try {
      await expect(loadProject()).rejects.toThrow();
    } finally { globalThis.indexedDB = real; }
  });
  it('an unreadable saved record (entry missing from files) is not reported as "nothing saved"', async () => {
    await putProject({ ...createProject({ 'src/Page.tsx': 'MY WORK' }), entry: 'src/App.tsx' });
    const loaded = await loadProject();
    expect(loaded, 'loadProject hid the saved record').toBeDefined();
    expect(loaded!.files?.['src/Page.tsx']).toBe('MY WORK');
  });
});
