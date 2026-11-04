import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { CONSOLE_CAP, consoleReducer, createConsoleBatcher, EMPTY_CONSOLE, type ConsoleInput } from '../../studio/src/preview/console';
import { usePreviewBuild } from '../../studio/src/preview/usePreviewBuild';

const log = (i: number): ConsoleInput => ({ level: 'log', args: [`n ${i}`], location: { path: null, line: null, column: null } as never });

describe('console batching (C4 review 1)', () => {
  it('a 10k-log loop flushes once per frame and keeps the last CONSOLE_CAP with a dropped count', () => {
    const frames: (() => void)[] = [];
    const flushed: ConsoleInput[][] = [];
    const b = createConsoleBatcher((items) => flushed.push(items), (cb) => frames.push(cb));
    for (let i = 0; i < 10_000; i++) b.push(log(i));
    expect(frames).toHaveLength(1);
    frames[0]();
    expect(flushed).toHaveLength(1);
    const s = consoleReducer(EMPTY_CONSOLE, { type: 'addMany', items: flushed[0] });
    expect(s.entries).toHaveLength(CONSOLE_CAP);
    expect(s.dropped).toBe(10_000 - CONSOLE_CAP);
    expect(s.entries.at(-1)!.text).toBe('n 9999');
    expect(s.entries[0].text).toBe(`n ${10_000 - CONSOLE_CAP}`);
    expect(s.next).toBe(10_001);
    expect(new Set(s.entries.map((e) => e.id)).size).toBe(CONSOLE_CAP);
  });
  it('reset drops queued messages; a later push schedules a new frame', () => {
    const frames: (() => void)[] = [];
    const flushed: ConsoleInput[][] = [];
    const b = createConsoleBatcher((items) => flushed.push(items), (cb) => frames.push(cb));
    b.push(log(1)); b.reset(); frames[0]();
    expect(flushed).toHaveLength(0);
    b.push(log(2)); frames[1]();
    expect(flushed).toEqual([[log(2)]]);
  });
});

describe('preview reset on project switch (C4 review 2)', () => {
  it('a failed first build of the new project shows no artifact from the previous project', async () => {
    const good = { 'src/App.tsx': 'export default function App() { return <h1>A</h1>; }\n' };
    const bad = { 'src/App.tsx': 'export default function App() { return <h1>; }\n' };
    const { result, rerender } = renderHook(({ files, k }) => usePreviewBuild(files, 'src/App.tsx', { projectKey: k, debounceMs: 0 }), { initialProps: { files: good, k: 'a' } });
    await waitFor(() => expect(result.current.artifact).toBeTruthy());
    rerender({ files: bad, k: 'b' });
    expect(result.current.artifact).toBeNull();
    await waitFor(() => expect(result.current.diagnostics.length).toBeGreaterThan(0));
    expect(result.current.artifact).toBeNull();
    expect(result.current.failed).toBe(true);
  });
});
