import { describe, expect, it } from 'vitest';
import {
  breakpointFor, clampSize, DEFAULT_LAYOUT, errorLine, fitScale, layoutReducer, LAYOUT_KEY_PREFIX, localLayoutStore, parseLayout, SIZE_LIMITS,
} from '../../studio/src/app/workspace/layout';

const memory = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v), removeItem: (k: string) => void map.delete(k),
    key: (i: number) => [...map.keys()][i] ?? null, get length() { return map.size; }, map,
  };
};

describe('layout reducer', () => {
  it('clamps resizes to the limits', () => {
    const big = layoutReducer(DEFAULT_LAYOUT, { type: 'resize', key: 'sidebar', size: 9999 });
    expect(big.sizes.sidebar).toBe(SIZE_LIMITS.sidebar[1]);
    const small = layoutReducer(DEFAULT_LAYOUT, { type: 'resize', key: 'bottom', size: -5 });
    expect(small.sizes.bottom).toBe(SIZE_LIMITS.bottom[0]);
    expect(clampSize('preview', Number.NaN)).toBe(SIZE_LIMITS.preview[0]);
    expect(layoutReducer(DEFAULT_LAYOUT, { type: 'resize', key: 'docs', size: DEFAULT_LAYOUT.sizes.docs })).toBe(DEFAULT_LAYOUT);
  });

  it('collapses and restores panels, keeping sizes', () => {
    const resized = layoutReducer(DEFAULT_LAYOUT, { type: 'resize', key: 'preview', size: 500 });
    const hidden = layoutReducer(resized, { type: 'toggle', panel: 'preview' });
    expect(hidden.collapsed.preview).toBe(true);
    const back = layoutReducer(hidden, { type: 'toggle', panel: 'preview' });
    expect(back.collapsed.preview).toBe(false);
    expect(back.sizes.preview).toBe(500);
    expect(layoutReducer(back, { type: 'toggle', panel: 'preview', collapsed: false })).toBe(back);
  });

  it('opening an activity or bottom tab restores its panel', () => {
    let s = layoutReducer(DEFAULT_LAYOUT, { type: 'toggle', panel: 'sidebar' });
    s = layoutReducer(s, { type: 'setActivity', activity: 'search' });
    expect(s).toMatchObject({ activity: 'search', collapsed: { sidebar: false } });
    s = layoutReducer(layoutReducer(s, { type: 'toggle', panel: 'bottom' }), { type: 'setBottomTab', tab: 'problems' });
    expect(s).toMatchObject({ bottomTab: 'problems', collapsed: { bottom: false } });
  });

  it('pins and unpins Docs', () => {
    const docs = layoutReducer(DEFAULT_LAYOUT, { type: 'setActivity', activity: 'docs' });
    const pinned = layoutReducer(docs, { type: 'pinDocs', pinned: true });
    expect(pinned.docsPinned).toBe(true);
    const fromExplorer = layoutReducer(layoutReducer(pinned, { type: 'setActivity', activity: 'explorer' }), { type: 'pinDocs', pinned: false });
    expect(fromExplorer).toMatchObject({ docsPinned: false, activity: 'docs' });
  });

  it('tracks open tabs and drops deleted files', () => {
    let s = layoutReducer(DEFAULT_LAYOUT, { type: 'openTab', path: 'src/App.tsx' });
    s = layoutReducer(s, { type: 'openTab', path: 'src/a.ts' });
    expect(layoutReducer(s, { type: 'openTab', path: 'src/a.ts' })).toBe(s);
    expect(layoutReducer(s, { type: 'closeTab', path: 'src/App.tsx' }).openTabs).toEqual(['src/a.ts']);
    expect(layoutReducer(s, { type: 'syncTabs', paths: ['src/App.tsx'] }).openTabs).toEqual(['src/App.tsx']);
  });

  it('maps widths to breakpoints', () => {
    expect(breakpointFor(390)).toBe('mobile');
    expect(breakpointFor(767)).toBe('mobile');
    expect(breakpointFor(768)).toBe('tablet');
    expect(breakpointFor(1279)).toBe('tablet');
    expect(breakpointFor(1280)).toBe('desktop');
    expect(breakpointFor(1440)).toBe('desktop');
  });
});

describe('layout persistence', () => {
  it('round-trips a layout per project', () => {
    const storage = memory();
    const store = localLayoutStore(storage);
    let s = layoutReducer(DEFAULT_LAYOUT, { type: 'setWorkspace', workspace: 'code' });
    s = layoutReducer(s, { type: 'resize', key: 'sidebar', size: 300 });
    s = layoutReducer(s, { type: 'toggle', panel: 'bottom' });
    s = layoutReducer(s, { type: 'pinDocs', pinned: true });
    s = layoutReducer(s, { type: 'setTabletLayout', layout: 'preview' });
    s = layoutReducer(s, { type: 'setBottomTab', tab: 'tests' });
    s = layoutReducer(s, { type: 'openTab', path: 'src/App.tsx' });
    store.save('p1', s);
    expect(storage.map.has(`${LAYOUT_KEY_PREFIX}p1`)).toBe(true);
    expect(store.load('p1')).toEqual(s);
    expect(store.load('other')).toBeNull();
  });

  it('migrates a project with no or a broken layout to the defaults', () => {
    expect(parseLayout(undefined)).toEqual(DEFAULT_LAYOUT);
    expect(parseLayout({ sizes: { sidebar: 'wide', preview: 5000 }, activity: 'nope', openTabs: [1, 'a.ts'] })).toEqual({
      ...DEFAULT_LAYOUT, sizes: { ...DEFAULT_LAYOUT.sizes, preview: SIZE_LIMITS.preview[1] }, openTabs: ['a.ts'], groups: [{ tabs: ['a.ts'], active: 'a.ts' }],
    });
    const storage = memory();
    storage.setItem(`${LAYOUT_KEY_PREFIX}p`, '{not json');
    expect(localLayoutStore(storage).load('p')).toBeNull();
  });
});

describe('helpers', () => {
  it('fits a viewport without upscaling', () => {
    expect(fitScale(1280, 800, 640, 800)).toBe(0.5);
    expect(fitScale(390, 844, 2000, 2000)).toBe(1);
  });
  it('reads the line from a parser message', () => {
    expect(errorLine('Unexpected token (5:3)')).toBe(5);
    expect(errorLine('nothing')).toBeNull();
  });
});
