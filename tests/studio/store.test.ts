import { describe, expect, it } from 'vitest';
import { createStore, HISTORY_LIMIT, storeReducer } from '../../studio/src/model/store';
import { createProject } from '../../studio/src/model/project';

const project = () => createProject({ 'src/App.tsx': "import H from './H';\nexport default function App() { return <H />; }\n", 'src/H.tsx': 'export default function H() { return null; }\n' });

describe('project store (M3-04 slice)', () => {
  it('opens files and tracks the active path', () => {
    const s = storeReducer(createStore(project()), { type: 'openFile', path: 'src/H.tsx' });
    expect(s.activePath).toBe('src/H.tsx');
    expect(s.past).toHaveLength(0);
  });
  it('creates a file as one undoable step and opens it', () => {
    const s = storeReducer(createStore(project()), { type: 'createFile', path: 'src/New.tsx', text: 'x' });
    expect(s.project.files['src/New.tsx']).toBe('x');
    expect(s.activePath).toBe('src/New.tsx');
    const u = storeReducer(s, { type: 'undo' });
    expect(u.project.files['src/New.tsx']).toBeUndefined();
    expect(u.activePath).toBe('src/App.tsx');
  });
  it('renames with import rewrites, and undo reverts both in one step, restoring the active file', () => {
    let s = storeReducer(createStore(project()), { type: 'openFile', path: 'src/H.tsx' });
    s = storeReducer(s, { type: 'renameFile', from: 'src/H.tsx', to: 'src/parts/Header.tsx' });
    expect(s.project.files['src/App.tsx']).toContain("'./parts/Header'");
    expect(s.activePath).toBe('src/parts/Header.tsx');
    s = storeReducer(s, { type: 'openFile', path: 'src/App.tsx' });
    const u = storeReducer(s, { type: 'undo' });
    expect(u.project.files['src/H.tsx']).toBeDefined();
    expect(u.project.files['src/App.tsx']).toContain("'./H'");
    expect(u.activePath).toBe('src/H.tsx');
    const r = storeReducer(u, { type: 'redo' });
    expect(r.project.files['src/parts/Header.tsx']).toBeDefined();
  });
  it('renames folders and follows the active file', () => {
    let s = createStore(createProject({ 'src/App.tsx': '', 'src/a/B.tsx': '' }));
    s = storeReducer(s, { type: 'openFile', path: 'src/a/B.tsx' });
    s = storeReducer(s, { type: 'renameFolder', from: 'src/a', to: 'src/b' });
    expect(s.activePath).toBe('src/b/B.tsx');
  });
  it('deletes files and folders, moving the active file to the entry', () => {
    let s = createStore(createProject({ 'src/App.tsx': '', 'src/a/B.tsx': '', 'src/a/C.tsx': '' }));
    s = storeReducer(s, { type: 'openFile', path: 'src/a/B.tsx' });
    s = storeReducer(s, { type: 'deleteFolder', path: 'src/a' });
    expect(Object.keys(s.project.files)).toEqual(['src/App.tsx']);
    expect(s.activePath).toBe('src/App.tsx');
    expect(storeReducer(s, { type: 'undo' }).project.files['src/a/C.tsx']).toBe('');
  });
  it('sets the entry as an undoable step', () => {
    const s = storeReducer(createStore(project()), { type: 'setEntry', path: 'src/H.tsx' });
    expect(s.project.entry).toBe('src/H.tsx');
    expect(storeReducer(s, { type: 'undo' }).project.entry).toBe('src/App.tsx');
  });
  it('coalesces rapid editor typing per file', () => {
    let s = createStore(project());
    s = storeReducer(s, { type: 'editFile', path: 'src/App.tsx', text: 'a', source: 'editor', now: 1000 });
    s = storeReducer(s, { type: 'editFile', path: 'src/App.tsx', text: 'ab', source: 'editor', now: 1500 });
    expect(s.past).toHaveLength(1);
    s = storeReducer(s, { type: 'editFile', path: 'src/H.tsx', text: 'h', source: 'editor', now: 1600 });
    expect(s.past).toHaveLength(2);
  });
  it('ignores no-op edits and invalid operations', () => {
    const s0 = createStore(project());
    expect(storeReducer(s0, { type: 'editFile', path: 'src/App.tsx', text: s0.project.files['src/App.tsx'] })).toBe(s0);
    expect(() => storeReducer(s0, { type: 'deleteFile', path: 'src/App.tsx' })).toThrow();
  });
  it('loads a project and resets history', () => {
    const s = storeReducer(storeReducer(createStore(project()), { type: 'createFile', path: 'src/X.ts', text: '' }), { type: 'loadProject', project: project() });
    expect(s.past).toHaveLength(0);
    expect(s.activePath).toBe('src/App.tsx');
  });
});

describe('M3-04 acceptance', () => {
  it('undo switches to the file the step changed, even if another file is active', () => {
    let s = createStore(project());
    s = storeReducer(s, { type: 'editFile', path: 'src/H.tsx', text: 'changed', source: 'visual' });
    s = storeReducer(s, { type: 'openFile', path: 'src/App.tsx' });
    const u = storeReducer(s, { type: 'undo' });
    expect(u.project.files['src/H.tsx']).not.toBe('changed');
    expect(u.activePath).toBe('src/H.tsx');
    const r = storeReducer({ ...u, activePath: 'src/App.tsx' }, { type: 'redo' });
    expect(r.activePath).toBe('src/H.tsx');
  });
  it('a rename with import rewrites in other files is one undo step', () => {
    let s = createStore(project());
    s = storeReducer(s, { type: 'renameFile', from: 'src/H.tsx', to: 'src/Header.tsx' });
    expect(s.past).toHaveLength(1);
    const u = storeReducer(s, { type: 'undo' });
    expect(u.project.files).toEqual(project().files);
    expect(u.past).toHaveLength(0);
  });
  it('the persisted project carries no history, so none survives a reload', () => {
    let s = createStore(project());
    s = storeReducer(s, { type: 'createFile', path: 'src/X.ts', text: '' });
    const saved = JSON.parse(JSON.stringify(s.project));
    expect(Object.keys(saved)).not.toEqual(expect.arrayContaining(['past']));
    expect(JSON.stringify(saved)).not.toContain('"past"');
    const reloaded = storeReducer(createStore(saved), { type: 'undo' });
    expect(reloaded.past).toHaveLength(0);
    expect(reloaded.project.files['src/X.ts']).toBe('');
  });
  it('shares unchanged file strings between snapshots', () => {
    let s = createStore(project());
    s = storeReducer(s, { type: 'editFile', path: 'src/App.tsx', text: 'x' });
    expect(s.past[0].project.files['src/H.tsx']).toBe(s.project.files['src/H.tsx']);
  });
});

describe('M3-04 re-review', () => {
  it('caps history at HISTORY_LIMIT (200) steps, dropping the oldest', () => {
    expect(HISTORY_LIMIT).toBe(200);
    let s = createStore(project());
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) s = storeReducer(s, { type: 'editFile', path: 'src/App.tsx', text: `v${i}`, source: 'visual' });
    expect(s.past).toHaveLength(HISTORY_LIMIT);
    expect(s.past[0].project.files['src/App.tsx']).toBe('v4');
  });
  it('treats the editor echo after an undo as a no-op, so redo still works', () => {
    let s = createStore(project());
    s = storeReducer(s, { type: 'editFile', path: 'src/App.tsx', text: 'typed', source: 'editor', now: 1000 });
    s = storeReducer(s, { type: 'undo' });
    // Monaco reports the restored value back through onChange.
    const echoed = storeReducer(s, { type: 'editFile', path: 'src/App.tsx', text: s.project.files['src/App.tsx'], source: 'editor', now: 1100 });
    expect(echoed).toBe(s);
    expect(storeReducer(echoed, { type: 'redo' }).project.files['src/App.tsx']).toBe('typed');
  });
  it('a real edit after undo (e.g. Ctrl+Z inside Monaco) records a new step and clears redo', () => {
    let s = createStore(project());
    s = storeReducer(s, { type: 'editFile', path: 'src/App.tsx', text: 'a', source: 'visual' });
    s = storeReducer(s, { type: 'undo' });
    s = storeReducer(s, { type: 'editFile', path: 'src/App.tsx', text: 'monaco-undo', source: 'editor' });
    expect(s.future).toHaveLength(0);
  });
  it('undoing a folder delete switches to a file in the restored folder', () => {
    let s = createStore(createProject({ 'src/App.tsx': '', 'src/a/C.tsx': '', 'src/a/B.tsx': '' }));
    s = storeReducer(s, { type: 'deleteFolder', path: 'src/a' });
    const u = storeReducer(s, { type: 'undo' });
    expect(u.activePath).toBe('src/a/B.tsx');
  });
});

describe('inherited keys (review #26 round 4)', () => {
  it('openFile / setEntry ignore toString and constructor', () => {
    const s = createStore(createProject({ 'src/App.tsx': 'a', 'src/H.tsx': 'h' }, 'src/App.tsx'));
    expect(storeReducer(s, { type: 'openFile', path: 'toString' })).toBe(s);
    expect(storeReducer(s, { type: 'openFile', path: 'constructor' })).toBe(s);
  });
});
