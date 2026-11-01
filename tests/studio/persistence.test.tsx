import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectPersistence, type PersistenceDeps } from '../../studio/src/persistence';
import { StorageBlockedError } from '../../studio/src/storage';
import { createProject, type Project } from '../../studio/src/model/project';

const starter = createProject({ 'src/App.tsx': 'starter' }, 'src/App.tsx', 'My application');
const stored = { ...createProject({ 'src/App.tsx': 'mine', 'src/x.ts': 'x' }, 'src/App.tsx', 'Orders'), createdAt: 1, updatedAt: 2 };

function deps(over: Partial<PersistenceDeps> = {}): PersistenceDeps {
  return {
    start: vi.fn(async () => stored),
    save: vi.fn(async () => {}),
    getNotice: vi.fn(async () => undefined),
    clearNotice: vi.fn(async () => {}),
    ...over,
  };
}

const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

function setup(d: PersistenceDeps) {
  const onStart = vi.fn();
  const hook = renderHook(({ project }: { project: Project }) => useProjectPersistence(project, onStart, d), { initialProps: { project: starter } });
  return { ...hook, onStart };
}

describe('useProjectPersistence', () => {
  it('hydrates from storage, then autosaves the project after 400 ms', async () => {
    const d = deps();
    const { result, rerender, onStart } = setup(d);
    expect(result.current.status).toBe('loading');
    await flush();
    expect(onStart).toHaveBeenCalledWith(stored);
    expect(result.current.status).toBe('ready');
    const edited = { ...stored, files: { ...stored.files, 'src/App.tsx': 'edited' } };
    rerender({ project: edited });
    await act(async () => { vi.advanceTimersByTime(399); });
    expect(d.save).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(d.save).toHaveBeenCalledWith(edited);
  });

  it('a blocked load never autosaves or saves on Ctrl+S', async () => {
    const d = deps({ start: vi.fn(async () => { throw new StorageBlockedError(); }) });
    const { result, rerender, onStart } = setup(d);
    await flush();
    expect(result.current.status).toBe('unavailable');
    expect(result.current.error).toBeInstanceOf(StorageBlockedError);
    expect(onStart).not.toHaveBeenCalled();
    rerender({ project: { ...starter, files: { 'src/App.tsx': 'typed while blocked' } } });
    await act(async () => { vi.advanceTimersByTime(5000); });
    let ok = true;
    await act(async () => { ok = await result.current.saveNow(); });
    expect(ok).toBe(false);
    expect(d.save).not.toHaveBeenCalled();
  });

  it('does not save before the load has finished', async () => {
    let finish: (p: Project) => void = () => {};
    const d = deps({ start: vi.fn(() => new Promise<Project>((r) => { finish = r; })) });
    const { result, rerender } = setup(d);
    rerender({ project: { ...starter, files: { 'src/App.tsx': 'early' } } });
    await act(async () => { vi.advanceTimersByTime(1000); });
    let ok = true;
    await act(async () => { ok = await result.current.saveNow(); });
    expect(ok).toBe(false);
    expect(d.save).not.toHaveBeenCalled();
    finish(stored);
    await flush();
    expect(result.current.status).toBe('ready');
  });

  it('a rejected save switches to unavailable and stops autosave', async () => {
    const save = vi.fn(async () => { throw new Error('quota'); });
    const d = deps({ save });
    const { result, rerender } = setup(d);
    await flush();
    rerender({ project: { ...stored, files: { 'src/App.tsx': 'one' } } });
    await act(async () => { vi.advanceTimersByTime(400); });
    await flush();
    expect(result.current.status).toBe('unavailable');
    expect(result.current.saved).toBe(false);
    rerender({ project: { ...stored, files: { 'src/App.tsx': 'two' } } });
    await act(async () => { vi.advanceTimersByTime(400); });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('saveNow saves immediately when ready and reports failures without throwing', async () => {
    const d = deps();
    const { result } = setup(d);
    await flush();
    let ok = false;
    await act(async () => { ok = await result.current.saveNow(); });
    expect(ok).toBe(true);
    expect(result.current.saved).toBe(true);
    (d.save as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('x'));
    await act(async () => { ok = await result.current.saveNow(); });
    expect(ok).toBe(false);
    expect(result.current.status).toBe('unavailable');
  });

  it('surfaces the migration notice and clears it on dismiss', async () => {
    const d = deps({ getNotice: vi.fn(async () => ({ message: 'Some files could not be migrated', skipped: ['src/bad.ts'], at: 1 })) });
    const { result } = setup(d);
    await flush();
    await flush();
    expect(result.current.notice?.skipped).toEqual(['src/bad.ts']);
    await act(async () => { await result.current.dismissNotice(); });
    expect(result.current.notice).toBeUndefined();
    expect(d.clearNotice).toHaveBeenCalled();
  });
});
