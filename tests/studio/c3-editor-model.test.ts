import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { ModelRegistry, languageFor, minimalEdit, pathOfUri, uriFor, type MonacoLike, type TextModelLike } from '../../studio/src/editor/monaco/models';
import { createStore, groupsOf, storeReducer, capTabs, MAX_TABS, type StoreState, type StoreAction } from '../../studio/src/model/store';
import { createProject } from '../../studio/src/model/project';
import {
  DEFAULT_LAYOUT, LAYOUT_KEY_PREFIX, UNSAVED_PROJECT_KEY, layoutReducer, localLayoutStore, parseLayout, recordLayoutStore, type LayoutState,
} from '../../studio/src/app/workspace/layout';
import { deleteProject, getProject, getProjectLayout, putProjectLayout, saveProject } from '../../studio/src/storage';
import { fileNamedAfter, groupReferences, isIdentifier, offsetAt, planRename, positionAt } from '../../studio/src/editor/navigationModel';
import { editorLabel } from '../../studio/src/editor/EditorAdapter';

// ------------------------------------------------------------------ a tiny fake of Monaco's model API

class FakeModel implements TextModelLike {
  disposed = false;
  edits = 0;
  stack = 0;
  constructor(private text: string, public uri: { toString(): string }) {}
  getValue() { return this.text; }
  setValue(t: string) { this.text = t; }
  isDisposed() { return this.disposed; }
  dispose() { this.disposed = true; }
  getPositionAt(offset: number) { const p = positionAt(this.text, offset); return { lineNumber: p.line, column: p.column }; }
  pushStackElement() { this.stack++; }
  pushEditOperations(_: unknown, edits: { range: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }; text: string }[]) {
    for (const e of edits) {
      const a = offsetAt(this.text, e.range.startLineNumber, e.range.startColumn);
      const b = offsetAt(this.text, e.range.endLineNumber, e.range.endColumn);
      this.text = this.text.slice(0, a) + e.text + this.text.slice(b);
      this.edits++;
    }
    return null;
  }
}
function fakeMonaco() {
  const models = new Map<string, FakeModel>();
  const api: MonacoLike = {
    Uri: { parse: (v: string) => ({ toString: () => v }) },
    editor: {
      getModel: (uri) => models.get(String(uri)) ?? null,
      createModel: (text, _lang, uri) => { const m = new FakeModel(text, uri as { toString(): string }); models.set(String(uri), m); return m; },
    },
  };
  return { api, models };
}

describe('models.ts: one Monaco model per VFS file', () => {
  it('creates a model per file, keyed by its file:/// URI, with a language per extension', () => {
    const { api, models } = fakeMonaco();
    const reg = new ModelRegistry(api);
    reg.sync({ 'src/App.tsx': 'a', 'src/styles.css': 'b' });
    expect([...models.keys()].sort()).toEqual(['file:///src/App.tsx', 'file:///src/styles.css']);
    expect(uriFor('src/x.ts')).toBe('file:///src/x.ts');
    expect(pathOfUri('file:///src/a%20b.ts')).toBe('src/a b.ts');
    expect([languageFor('a.tsx'), languageFor('a.js'), languageFor('a.css'), languageFor('a.md'), languageFor('a.txt')]).toEqual(['typescript', 'javascript', 'css', 'markdown', 'plaintext']);
  });

  it('store → model: applies only the changed middle, flagged so editors do not echo it', () => {
    const { api } = fakeMonaco();
    const reg = new ModelRegistry(api);
    reg.sync({ 'a.ts': 'const a = 1;\nconst b = 2;\n' });
    const m = reg.get('a.ts') as unknown as FakeModel;
    let sawApplying = false;
    const orig = m.pushEditOperations.bind(m);
    m.pushEditOperations = (...args) => { sawApplying = reg.isApplying(); return orig(...args); };
    reg.sync({ 'a.ts': 'const a = 1;\nconst b = 3;\n' });
    expect(m.getValue()).toBe('const a = 1;\nconst b = 3;\n');
    expect(m.edits).toBe(1);
    expect(sawApplying).toBe(true);
    expect(reg.isApplying()).toBe(false);
    expect(minimalEdit('const b = 2;', 'const b = 3;')).toEqual({ start: 10, end: 11, text: '3' });
    expect(minimalEdit('same', 'same')).toBeNull();
  });

  it('model → store edits are left to the editor (an unchanged sync is a no-op)', () => {
    const { api } = fakeMonaco();
    const reg = new ModelRegistry(api);
    reg.sync({ 'a.ts': 'x' });
    const m = reg.get('a.ts') as unknown as FakeModel;
    m.setValue('typed'); // the user typed: the editor forwards it with editFile; the store then syncs back the same text
    reg.sync({ 'a.ts': 'typed' });
    expect(m.edits).toBe(0);
  });

  it('a rename re-keys view state (per group) and disposes the old model; deletes drop both', () => {
    const { api } = fakeMonaco();
    const reg = new ModelRegistry(api);
    reg.sync({ 'src/A.tsx': 'a', 'src/B.tsx': 'b' });
    const old = reg.get('src/A.tsx') as unknown as FakeModel;
    reg.saveViewState(0, 'src/A.tsx', { cursor: 3 });
    reg.saveViewState(1, 'src/A.tsx', { cursor: 9 });
    reg.sync({ 'src/C.tsx': 'a', 'src/B.tsx': 'b' }, { id: 1, moves: [['src/A.tsx', 'src/C.tsx']] });
    expect(old.disposed).toBe(true);
    expect(reg.viewState(0, 'src/C.tsx')).toEqual({ cursor: 3 });
    expect(reg.viewState(1, 'src/C.tsx')).toEqual({ cursor: 9 });
    expect(reg.viewState(0, 'src/A.tsx')).toBeUndefined();
    // The same report is applied once.
    reg.saveViewState(0, 'src/A.tsx', { cursor: 1 });
    reg.sync({ 'src/C.tsx': 'a', 'src/B.tsx': 'b' }, { id: 1, moves: [['src/A.tsx', 'src/C.tsx']] });
    expect(reg.viewState(0, 'src/C.tsx')).toEqual({ cursor: 3 });
    // Delete.
    const b = reg.get('src/B.tsx') as unknown as FakeModel;
    reg.saveViewState(0, 'src/B.tsx', { cursor: 2 });
    reg.sync({ 'src/C.tsx': 'a' });
    expect(b.disposed).toBe(true);
    expect(reg.viewState(0, 'src/B.tsx')).toBeUndefined();
    expect(reg.paths()).toEqual(['src/C.tsx']);
  });

  it('keeps view state across tab switches and forgets it when the tab closes', () => {
    const reg = new ModelRegistry(fakeMonaco().api);
    reg.saveViewState(0, 'a.ts', { scroll: 120, folded: [3] });
    expect(reg.viewState(0, 'a.ts')).toEqual({ scroll: 120, folded: [3] });
    expect(reg.viewState(1, 'a.ts')).toBeUndefined();
    reg.forget(0, 'a.ts');
    expect(reg.viewState(0, 'a.ts')).toBeUndefined();
  });
});

// ------------------------------------------------------------------ tabs and split (store)

const FILES: Record<string, string> = Object.fromEntries(
  ['App', 'Card', 'Page', 'Header', 'Footer', 'Nav', 'List', 'Item', 'Table', 'Row', 'Cell', 'Form', 'Field', 'Button', 'Modal', 'Menu', 'Tab', 'Icon']
    .map((n) => [`src/${n}.tsx`, `export function ${n}() { return null; }\n`]),
);
const store = () => createStore(createProject(FILES, 'src/App.tsx', 'Test'));
const run = (s: StoreState, ...actions: StoreAction[]) => actions.reduce(storeReducer, s);
const names = (s: StoreState) => groupsOf(s).map((g) => g.tabs.map((p) => p.slice(4, -4)));

describe('store: tabs and split editing (C3)', () => {
  it('opens, reorders and closes tabs in a group', () => {
    let s = run(store(), { type: 'openFile', path: 'src/Card.tsx' }, { type: 'openFile', path: 'src/Page.tsx' });
    expect(names(s)).toEqual([['App', 'Card', 'Page']]);
    s = run(s, { type: 'moveTab', path: 'src/Page.tsx', from: 0, to: 0, index: 0 });
    expect(names(s)).toEqual([['Page', 'App', 'Card']]);
    s = run(s, { type: 'closeTab', path: 'src/App.tsx' });
    expect(names(s)).toEqual([['Page', 'Card']]);
  });

  it('opens to the side (creating the split), focuses groups, and caps at two groups', () => {
    let s = run(store(), { type: 'openFile', path: 'src/Card.tsx', toSide: true });
    expect(names(s)).toEqual([['App'], ['Card']]);
    expect(s.focusedGroup).toBe(1);
    expect(s.activePath).toBe('src/Card.tsx');
    s = run(s, { type: 'focusGroup', group: 0 });
    expect(s.activePath).toBe('src/App.tsx');
    s = run(s, { type: 'openFile', path: 'src/Page.tsx', toSide: true }); // the other group exists: it opens there
    expect(names(s)).toEqual([['App'], ['Card', 'Page']]);
    expect(groupsOf(s)).toHaveLength(2);
    s = run(s, { type: 'splitEditor' });
    expect(groupsOf(s)).toHaveLength(2);
  });

  it('moves a tab between groups, and closing a group\'s last tab collapses the split', () => {
    let s = run(store(), { type: 'openFile', path: 'src/Card.tsx' }, { type: 'openFile', path: 'src/Page.tsx', toSide: true });
    s = run(s, { type: 'moveTab', path: 'src/Card.tsx', from: 0, to: 1, index: 0 });
    expect(names(s)).toEqual([['App'], ['Card', 'Page']]);
    expect(s.activePath).toBe('src/Card.tsx');
    s = run(s, { type: 'closeTab', path: 'src/App.tsx', group: 0 });
    expect(names(s)).toEqual([['Card', 'Page']]);
    expect(s.side).toBeUndefined();
    expect(s.focusedGroup).toBe(0);
    // Dragging a group's only tab across also collapses it.
    s = run(s, { type: 'openFile', path: 'src/Nav.tsx', toSide: true });
    s = run(s, { type: 'moveTab', path: 'src/Nav.tsx', from: 1, to: 0, index: 99 });
    expect(names(s)).toEqual([['Card', 'Page', 'Nav']]);
  });

  it('close all tabs in a group', () => {
    let s = run(store(), { type: 'openFile', path: 'src/Card.tsx', toSide: true }, { type: 'openFile', path: 'src/Page.tsx' });
    s = run(s, { type: 'closeGroup', group: 1 });
    expect(names(s)).toEqual([['App']]);
    s = run(s, { type: 'openFile', path: 'src/Card.tsx' }, { type: 'closeGroup', group: 0 });
    expect(names(s)).toEqual([['App']]);
  });

  it('keeps at most 15 tabs across both groups, closing the least recently used (never an active tab)', () => {
    let s = store();
    for (const p of Object.keys(FILES).slice(1, 10)) s = run(s, { type: 'openFile', path: p });
    for (const p of Object.keys(FILES).slice(10)) s = run(s, { type: 'openFile', path: p, toSide: true });
    const total = groupsOf(s).reduce((n, g) => n + g.tabs.length, 0);
    expect(total).toBe(MAX_TABS);
    expect(groupsOf(s).flatMap((g) => g.tabs)).not.toContain('src/App.tsx'); // the oldest went first
    for (const g of groupsOf(s)) expect(g.tabs).toContain(g.active);
    expect(capTabs([{ tabs: ['a', 'b'], active: 'a' }, { tabs: ['a', 'c'], active: 'c' }], ['c', 'b', 'a'], 3))
      .toEqual([{ tabs: ['a', 'b'], active: 'a' }, { tabs: ['c'], active: 'c' }]);
  });

  it('tabs in both groups follow renames and drop deleted files', () => {
    let s = run(store(), { type: 'openFile', path: 'src/Card.tsx' }, { type: 'openFile', path: 'src/Page.tsx', toSide: true }, { type: 'openFile', path: 'src/Card.tsx' });
    s = run(s, { type: 'focusGroup', group: 0 }, { type: 'renameFile', from: 'src/Card.tsx', to: 'src/Tile.tsx' });
    expect(names(s)).toEqual([['App', 'Tile'], ['Page', 'Tile']]);
    expect(s.lastChange?.moves).toEqual([['src/Card.tsx', 'src/Tile.tsx']]);
    s = run(s, { type: 'deleteFile', path: 'src/Page.tsx' });
    expect(names(s)).toEqual([['App', 'Tile'], ['Tile']]);
  });

  it('restores saved groups, dropping files that no longer exist', () => {
    const s = run(store(), { type: 'setGroups', groups: [{ tabs: ['src/Card.tsx', 'src/Gone.tsx'], active: 'src/Gone.tsx' }, { tabs: ['src/Page.tsx'], active: 'src/Page.tsx' }], focused: 1 });
    expect(names(s)).toEqual([['Card'], ['Page']]);
    expect(groupsOf(s)[0].active).toBe('src/Card.tsx');
    expect(s.activePath).toBe('src/Page.tsx');
    const gone = run(store(), { type: 'setGroups', groups: [{ tabs: ['src/Gone.tsx'], active: 'src/Gone.tsx' }, { tabs: ['src/Page.tsx'], active: 'src/Page.tsx' }], focused: 0 });
    expect(names(gone)).toEqual([['Page']]);
  });

  it('rename symbol: every file in one labelled undo step, and undo restores them exactly', () => {
    const s0 = run(store(), { type: 'openFile', path: 'src/Card.tsx' });
    const files = { 'src/Card.tsx': 'export function Tile() { return null; }\n', 'src/Page.tsx': 'import { Tile } from "./Card";\n' };
    const s1 = run(s0, { type: 'applyEdits', files, label: 'Rename symbol', touched: 'src/Card.tsx' });
    expect(s1.past).toHaveLength(s0.past.length + 1);
    expect(s1.past.at(-1)!.label).toBe('Rename symbol');
    expect(s1.project.files['src/Page.tsx']).toBe(files['src/Page.tsx']);
    const s2 = run(s1, { type: 'undo' });
    expect(s2.project.files).toEqual(s0.project.files);
    expect(run(s2, { type: 'redo' }).project.files).toEqual(s1.project.files);
  });
});

// ------------------------------------------------------------------ split layout persistence

describe('layout: split saved with the project (C3)', () => {
  it('round-trips groups, tabs, active tabs and the focused group', () => {
    const groups = [{ tabs: ['src/App.tsx', 'src/Card.tsx'], active: 'src/Card.tsx' }, { tabs: ['src/Page.tsx'], active: 'src/Page.tsx' }];
    const l = layoutReducer(DEFAULT_LAYOUT, { type: 'setGroups', groups, focused: 1 });
    expect(l.openTabs).toEqual(['src/Page.tsx']);
    const back = parseLayout(JSON.parse(JSON.stringify(l)));
    expect(back.groups).toEqual(groups);
    expect(back.focusedGroup).toBe(1);
    expect(layoutReducer(l, { type: 'setGroups', groups, focused: 1 })).toBe(l);
    // Bad input: more than two groups, empty groups, a stale active tab, a focused index out of range.
    const bad = parseLayout({ groups: [{ tabs: [] }, { tabs: ['a', 3], active: 'zzz' }, { tabs: ['c'] }, { tabs: ['d'] }], focusedGroup: 7 });
    expect(bad.groups).toEqual([{ tabs: ['a'], active: 'a' }]);
    expect(bad.focusedGroup).toBe(0);
  });
});

// ------------------------------------------------------------------ layout on the project record

function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k),
    key: (i: number) => [...m.keys()][i] ?? null, get length() { return m.size; }, keys: () => [...m.keys()],
  };
}

describe('layout migration: localStorage → project record (C3)', () => {
  beforeEach(() => { (globalThis as { indexedDB: IDBFactory }).indexedDB = new IDBFactory(); });
  const layout = (sidebar: number): LayoutState => ({ ...DEFAULT_LAYOUT, sizes: { ...DEFAULT_LAYOUT.sizes, sidebar } });

  it('copies a pre-C3 key onto a record without a layout, then removes the key', async () => {
    const project = createProject({ 'src/App.tsx': 'x' }, 'src/App.tsx', 'P');
    await saveProject(project);
    const mem = memoryStorage();
    mem.setItem(LAYOUT_KEY_PREFIX + project.id, JSON.stringify(layout(400)));
    const store = recordLayoutStore({ get: getProjectLayout, put: putProjectLayout }, localLayoutStore(mem));
    expect((await store.load(project.id))?.sizes.sidebar).toBe(400);
    expect(mem.keys()).toEqual([]);
    expect(parseLayout(await getProjectLayout(project.id)).sizes.sidebar).toBe(400);
    expect((await store.load(project.id))?.sizes.sidebar).toBe(400); // now from the record
  });

  it('the record wins over a stale key; saves go to the record; a project save keeps the layout', async () => {
    const project = createProject({ 'src/App.tsx': 'x' }, 'src/App.tsx', 'P');
    await saveProject(project);
    await putProjectLayout(project.id, layout(300));
    const mem = memoryStorage();
    mem.setItem(LAYOUT_KEY_PREFIX + project.id, JSON.stringify(layout(450)));
    const store = recordLayoutStore({ get: getProjectLayout, put: putProjectLayout }, localLayoutStore(mem));
    expect((await store.load(project.id))?.sizes.sidebar).toBe(300);
    expect(mem.keys()).toEqual([]);
    await store.save(project.id, layout(350));
    await saveProject({ ...project, files: { 'src/App.tsx': 'y' } });
    const record = await getProject(project.id) as unknown as { layout: LayoutState; files: Record<string, string> };
    expect(record.files['src/App.tsx']).toBe('y');
    expect(record.layout.sizes.sidebar).toBe(350);
  });

  it('the unsaved starter uses localStorage until its first save; a project that is not stored gets nothing written', async () => {
    const mem = memoryStorage();
    const store = recordLayoutStore({ get: getProjectLayout, put: putProjectLayout }, localLayoutStore(mem));
    await store.save(UNSAVED_PROJECT_KEY, layout(320));
    expect(mem.keys()).toEqual([LAYOUT_KEY_PREFIX + UNSAVED_PROJECT_KEY]);
    expect((await store.load(UNSAVED_PROJECT_KEY))?.sizes.sidebar).toBe(320);
    expect(await putProjectLayout('missing', layout(1))).toBe(false);
    await store.save('missing', layout(1));
    expect(mem.keys()).toEqual([LAYOUT_KEY_PREFIX + UNSAVED_PROJECT_KEY]);
    expect(await store.load('missing')).toBeNull();
  });

  it('deleting a project removes its layout everywhere', async () => {
    const project = createProject({ 'src/App.tsx': 'x' }, 'src/App.tsx', 'P');
    await saveProject(project);
    await putProjectLayout(project.id, layout(300));
    localStorage.setItem(LAYOUT_KEY_PREFIX + project.id, JSON.stringify(layout(200))); // a leftover pre-C3 key
    await deleteProject(project.id);
    expect(await getProject(project.id)).toBeUndefined();
    expect(await getProjectLayout(project.id)).toBeUndefined();
    expect(localStorage.getItem(LAYOUT_KEY_PREFIX + project.id)).toBeNull();
  });
});

// ------------------------------------------------------------------ navigation helpers

describe('navigation helpers (C3)', () => {
  const files = { 'src/Card.tsx': 'export function Card() {\n  return null;\n}\n', 'src/Page.tsx': "import { Card } from './Card';\nconst x = <Card />;\n" };

  it('groups references by file with line, columns and preview', () => {
    const set = groupReferences(files, 'Card', [
      { path: 'src/Page.tsx', start: files['src/Page.tsx'].indexOf('Card />'), length: 4 },
      { path: 'src/Page.tsx', start: 9, length: 4 },
      { path: 'src/Card.tsx', start: 16, length: 4 },
      { path: 'lib.d.ts', start: 0, length: 4 },
      { path: 'src/Card.tsx', start: 16, length: 4 },
    ]);
    expect(set.groups.map((g) => [g.path, g.items.length])).toEqual([['src/Card.tsx', 1], ['src/Page.tsx', 2]]);
    expect(set.groups[1].items[0]).toEqual({ line: 1, column: 10, endColumn: 14, preview: "import { Card } from './Card';" });
    expect(set.groups[1].items[1].line).toBe(2);
  });

  it('plans a rename across files, ignoring overlapping or out-of-range spans', () => {
    const spans = [
      { path: 'src/Card.tsx', start: 16, length: 4 },
      { path: 'src/Page.tsx', start: 9, length: 4 },
      { path: 'src/Page.tsx', start: files['src/Page.tsx'].indexOf('Card />'), length: 4 },
      { path: 'src/Page.tsx', start: 10, length: 2 }, // overlaps
      { path: 'src/Page.tsx', start: 9999, length: 4 }, // stale
    ];
    const plan = planRename(files, spans, 'Tile');
    expect(plan.edits).toEqual([{ path: 'src/Card.tsx', count: 1 }, { path: 'src/Page.tsx', count: 2 }]);
    expect(plan.files['src/Page.tsx']).toBe("import { Tile } from './Card';\nconst x = <Tile />;\n");
    expect(planRename(files, [{ path: 'src/Page.tsx', start: 9, length: 4, prefixText: 'Card as ' }], 'Tile').files['src/Page.tsx']).toContain('{ Card as Tile }');
  });

  it('positions, identifiers, the "Also rename the file?" candidate and the editor label', () => {
    expect(positionAt('ab\ncd', 4)).toEqual({ line: 2, column: 2 });
    expect(offsetAt('ab\ncd', 2, 2)).toBe(4);
    expect([isIdentifier('Tile'), isIdentifier('9x'), isIdentifier('class'), isIdentifier('a-b')]).toEqual([true, false, false, false]);
    expect(fileNamedAfter(['src/Page.tsx', 'src/Card.tsx'], 'Card')).toBe('src/Card.tsx');
    expect(fileNamedAfter(['src/Page.tsx'], 'Card')).toBeNull();
    expect(editorLabel('src/Header.tsx')).toBe('Code editor, src/Header.tsx');
    expect(editorLabel('src/Header.tsx', 0, 2)).toBe('Code editor, src/Header.tsx, group 1');
  });
});
