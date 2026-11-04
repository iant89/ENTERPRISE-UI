import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { createStore, storeReducer, type StoreAction, type StoreState } from '../../studio/src/model/store';
import { createProject } from '../../studio/src/model/project';
import { DEFAULT_LAYOUT, LAYOUT_KEY_PREFIX, localLayoutStore, UNSAVED_PROJECT_KEY } from '../../studio/src/app/workspace/layout';
import { useBreakpoint } from '../../studio/src/app/workspace/useBreakpoint';

const FILES = {
  'src/App.tsx': "import Header from './components/Header';\nexport default function App() { return <Header />; }\n",
  'src/components/Header.tsx': "import './Header.css';\nexport default function Header() { return null; }\n",
  'src/components/Header.css': '',
  'src/util.ts': 'export const u = 1;\n',
};
const run = (state: StoreState, ...actions: StoreAction[]) => actions.reduce(storeReducer, state);
const start = () => run(createStore(createProject(FILES)), { type: 'openFile', path: 'src/components/Header.tsx' }, { type: 'openFile', path: 'src/util.ts' });

describe('store: VFS ops are single undo steps', () => {
  it.each<[string, StoreAction, string]>([
    ['rename file', { type: 'renameFile', from: 'src/components/Header.tsx', to: 'src/components/Top.tsx' }, 'Rename file'],
    ['move file', { type: 'moveTo', from: 'src/components/Header.tsx', folder: 'src' }, 'Move file'],
    ['rename folder', { type: 'renameFolder', from: 'src/components', to: 'src/parts' }, 'Rename folder'],
    ['move folder', { type: 'moveTo', from: 'src/components', folder: '' }, 'Move folder'],
    ['duplicate', { type: 'duplicateFile', path: 'src/util.ts' }, 'Duplicate file'],
    ['delete file', { type: 'deleteFile', path: 'src/util.ts' }, 'Delete file'],
    ['delete folder', { type: 'deleteFolder', path: 'src/components' }, 'Delete folder'],
    ['create file', { type: 'createFile', path: 'src/New.tsx', text: '' }, 'Create file'],
  ])('%s: one labelled step, undo and redo restore files, active file and tabs exactly', (_, action, label) => {
    const before = start();
    const after = run(before, action);
    expect(after.past).toHaveLength(before.past.length + 1);
    expect(after.past.at(-1)!.label).toBe(label);
    const undone = run(after, { type: 'undo' });
    expect(undone.project.files).toEqual(before.project.files);
    expect(undone.openTabs).toEqual(before.openTabs);
    const redone = run(undone, { type: 'redo' });
    expect(redone.project.files).toEqual(after.project.files);
    expect(redone.openTabs).toEqual(after.openTabs);
    // Undo/redo switch to the file the step touched (M3-04 UX-8); it is always an open tab.
    expect(redone.openTabs).toContain(redone.activePath);
  });

  it('active path and tabs follow renames and moves; importers are rewritten in the same step', () => {
    const s = run(start(), { type: 'openFile', path: 'src/components/Header.tsx' }, { type: 'renameFolder', from: 'src/components', to: 'src/parts' });
    expect(s.activePath).toBe('src/parts/Header.tsx');
    expect(s.openTabs).toEqual(['src/App.tsx', 'src/parts/Header.tsx', 'src/util.ts']);
    expect(s.project.files['src/App.tsx']).toContain("from './parts/Header'");
    expect(s.recent[0]).toBe('src/parts/Header.tsx');
    const undone = run(s, { type: 'undo' });
    expect(undone.activePath).toBe('src/components/Header.tsx');
    expect(undone.project.files['src/App.tsx']).toBe(FILES['src/App.tsx']);
  });

  it('deleting an open file closes its tab and prunes recent files', () => {
    const s = run(start(), { type: 'deleteFile', path: 'src/util.ts' });
    expect(s.openTabs).not.toContain('src/util.ts');
    expect(s.recent).not.toContain('src/util.ts');
    expect(Object.hasOwn(s.project.files, s.activePath)).toBe(true);
  });

  it('rejects invalid ops and leaves the state unchanged', () => {
    const s = start();
    expect(() => storeReducer(s, { type: 'renameFile', from: 'src/util.ts', to: '../x.ts' })).toThrow();
    expect(() => storeReducer(s, { type: 'renameFile', from: 'src/util.ts', to: 'src/App.tsx' })).toThrow();
    expect(() => storeReducer(s, { type: 'deleteFile', path: 'src/App.tsx' })).toThrow(/entry/);
    expect(() => storeReducer(s, { type: 'createFile', path: 'src/APP.tsx', text: '' })).toThrow();
  });

  it('closes tabs, moving to a neighbour, and restores saved tabs', () => {
    const s = run(start(), { type: 'closeTab', path: 'src/util.ts' });
    expect(s.openTabs).toEqual(['src/App.tsx', 'src/components/Header.tsx']);
    expect(s.activePath).toBe('src/components/Header.tsx');
    expect(run(s, { type: 'setTabs', paths: ['src/util.ts', 'gone.ts'] }).openTabs).toEqual(['src/util.ts', 'src/components/Header.tsx']);
  });
});

describe('layout keys (C2 follow-ups 1 and 2)', () => {
  it('removes a layout and sweeps orphans, keeping the unsaved key', () => {
    localStorage.clear();
    const store = localLayoutStore(localStorage);
    for (const id of ['a', 'b', 'gone', UNSAVED_PROJECT_KEY]) store.save(id, DEFAULT_LAYOUT);
    localStorage.setItem('unrelated', '1');
    expect(store.sweep(['a', 'b']).sort()).toEqual(['gone']);
    store.remove('b');
    expect(Object.keys(localStorage).filter((k) => k.startsWith(LAYOUT_KEY_PREFIX)).sort()).toEqual([`${LAYOUT_KEY_PREFIX}${UNSAVED_PROJECT_KEY}`, `${LAYOUT_KEY_PREFIX}a`]);
    expect(localStorage.getItem('unrelated')).toBe('1');
  });
});

describe('useBreakpoint (C2 follow-up 3)', () => {
  it('follows matchMedia change events at 768 and 1280 px', () => {
    let width = 1440;
    const listeners = new Set<() => void>();
    const mm = vi.fn((q: string) => ({
      get matches() { return width >= Number(/(\d+)px/.exec(q)![1]); },
      media: q,
      addEventListener: (_: string, l: () => void) => listeners.add(l),
      removeEventListener: (_: string, l: () => void) => listeners.delete(l),
    }));
    const original = window.matchMedia;
    window.matchMedia = mm as unknown as typeof window.matchMedia;
    const resize = vi.spyOn(window, 'addEventListener');
    try {
      const { result, unmount } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('desktop');
      expect(mm).toHaveBeenCalledWith('(min-width: 768px)');
      expect(mm).toHaveBeenCalledWith('(min-width: 1280px)');
      act(() => { width = 1024; listeners.forEach((l) => l()); });
      expect(result.current).toBe('tablet');
      act(() => { width = 390; listeners.forEach((l) => l()); });
      expect(result.current).toBe('mobile');
      expect(resize.mock.calls.some(([t]) => t === 'resize')).toBe(false);
      unmount();
      expect(listeners.size).toBe(0);
    } finally {
      window.matchMedia = original;
      resize.mockRestore();
    }
  });
});
