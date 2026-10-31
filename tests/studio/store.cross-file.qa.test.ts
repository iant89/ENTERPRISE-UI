/** QA (PR #26 / M3-04): cross-file undo/redo. */
import { describe, expect, it } from 'vitest';
import { createProject } from '../../studio/src/model/project';
import { createStore, storeReducer as r, type StoreState } from '../../studio/src/model/store';

const base = () => createStore(createProject({ 'src/App.tsx': "import H from './Header';", 'src/Header.tsx': 'H0', 'src/Footer.tsx': 'F0' }));
const edit = (s: StoreState, path: string, text: string, now = 0, source: 'visual' | 'editor' = 'visual') => r(s, { type: 'editFile', path, text, source, now });

describe('cross-file undo/redo', () => {
  it('interleaved edits in three files undo in reverse order, switching the active file each time', () => {
    let s = base();
    s = edit(r(s, { type: 'openFile', path: 'src/Header.tsx' }), 'src/Header.tsx', 'H1');
    s = edit(r(s, { type: 'openFile', path: 'src/Footer.tsx' }), 'src/Footer.tsx', 'F1');
    s = edit(r(s, { type: 'openFile', path: 'src/App.tsx' }), 'src/App.tsx', 'A1');
    s = r(s, { type: 'openFile', path: 'src/Header.tsx' });
    s = r(s, { type: 'undo' });
    expect([s.activePath, s.project.files['src/App.tsx']]).toEqual(['src/App.tsx', "import H from './Header';"]);
    s = r(s, { type: 'undo' });
    expect([s.activePath, s.project.files['src/Footer.tsx']]).toEqual(['src/Footer.tsx', 'F0']);
    s = r(s, { type: 'undo' });
    expect([s.activePath, s.project.files['src/Header.tsx']]).toEqual(['src/Header.tsx', 'H0']);
    expect(r(s, { type: 'undo' })).toBe(s);
    s = r(r(r(s, { type: 'redo' }), { type: 'redo' }), { type: 'redo' });
    expect(s.project.files).toMatchObject({ 'src/Header.tsx': 'H1', 'src/Footer.tsx': 'F1', 'src/App.tsx': 'A1' });
    expect(s.activePath).toBe('src/App.tsx');
    expect(s.future).toHaveLength(0);
  });
  it('editor typing in file A does not coalesce with typing in file B', () => {
    let s = edit(base(), 'src/Header.tsx', 'H1', 0, 'editor');
    s = edit(s, 'src/Footer.tsx', 'F1', 100, 'editor');
    s = edit(s, 'src/Header.tsx', 'H2', 200, 'editor');
    expect(s.past).toHaveLength(3);
  });
  it('undo of a delete restores the file and its content; redo deletes it again', () => {
    let s = edit(base(), 'src/Footer.tsx', 'F1');
    s = r(s, { type: 'deleteFile', path: 'src/Footer.tsx' });
    s = r(s, { type: 'undo' });
    expect(s.project.files['src/Footer.tsx']).toBe('F1');
    expect(s.activePath).toBe('src/Footer.tsx');
    s = r(s, { type: 'redo' });
    expect('src/Footer.tsx' in s.project.files).toBe(false);
    expect(s.activePath in s.project.files).toBe(true);
  });
  it('edit after rename: undo twice restores both the content and the old name and importer', () => {
    let s = r(base(), { type: 'renameFile', from: 'src/Header.tsx', to: 'src/ui/Header.tsx' });
    s = edit(s, 'src/ui/Header.tsx', 'H1');
    s = r(r(s, { type: 'undo' }), { type: 'undo' });
    expect(s.project.files).toEqual(base().project.files);
  });
  it('a new edit after undo clears redo across files', () => {
    let s = edit(edit(base(), 'src/Header.tsx', 'H1'), 'src/Footer.tsx', 'F1');
    s = r(s, { type: 'undo' });
    s = edit(s, 'src/App.tsx', 'A1');
    expect(s.future).toHaveLength(0);
    expect(r(s, { type: 'redo' })).toBe(s);
  });
});
