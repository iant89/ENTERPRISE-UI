import { describe, expect, it } from 'vitest';
import { caseCollision, checkFilePath, checkNewFile, join, normalizePath, relative } from '../../studio/src/core/vfs/paths';
import * as ops from '../../studio/src/core/vfs/ops';
import { findCssImports, rewriteImports } from '../../studio/src/core/vfs/rewriteImports';
import { searchFiles } from '../../studio/src/core/vfs/search';
import { fuzzyScore, rankPaths } from '../../studio/src/core/vfs/fuzzy';
import { pruneRecent, RECENT_LIMIT, renameRecent, touchRecent } from '../../studio/src/core/vfs/recent';

// The #27 relative-import fixtures.
const P0 = {
  'src/App.tsx': "import H from './Header';\nimport { d } from '../shared/data';\nimport W from './widgets';\n",
  'src/Header.tsx': 'export default () => null;',
  'src/Header.css': '',
  'src/widgets/index.tsx': "export { default } from './Button';",
  'src/widgets/Button.tsx': "import '../Header.css';",
  'shared/data.ts': 'export const d = 1;',
  'src/pages/Home.tsx': "import x from '..';",
  'src/index.ts': '',
};

describe('paths', () => {
  it.each([
    ['src//a.tsx', 'src/a.tsx'], ['/src/./a.tsx', 'src/a.tsx'], ['src\\a.tsx', 'src/a.tsx'], ['src/x/../a.tsx', 'src/a.tsx'],
  ])('normalises %s', (input, out) => expect(normalizePath(input)).toEqual({ ok: true, path: out }));

  it.each([
    ['', 'empty'], ['../x.tsx', 'escapes-root'], ['src/../../x.tsx', 'escapes-root'], ['src/a b.tsx', 'invalid-segment'],
    ['src/a?.tsx', 'invalid-segment'], ['src/a.exe', 'invalid-extension'], ['src/x/../a.tsx', 'escapes-root'],
  ])('rejects file path %j (%s)', (input, code) => {
    const r = checkFilePath(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe(code);
  });

  it('detects exact and case-only collisions, also on folders', () => {
    const paths = ['src/App.tsx', 'src/components/Header.tsx'];
    expect(caseCollision(paths, 'src/app.tsx')).toBe('src/App.tsx');
    expect(caseCollision(paths, 'src/Components/X.tsx')).toBe('src/components');
    expect(caseCollision(paths, 'src/App.tsx')).toBeNull();
    expect(checkNewFile(paths, 'src/App.tsx')).toMatchObject({ ok: false, error: { code: 'exists' } });
    expect(checkNewFile(paths, 'src/APP.tsx')).toMatchObject({ ok: false, error: { code: 'case-clash' } });
    expect(checkNewFile(paths, 'src/APP.tsx', new Set(['src/App.tsx']))).toEqual({ ok: true, path: 'src/APP.tsx' });
  });

  it('joins and computes relative specifiers', () => {
    expect(join('src', 'components', 'A.tsx')).toBe('src/components/A.tsx');
    expect(join('src/a', '../b.ts')).toBe('src/b.ts');
    expect(relative('src/pages/Home.tsx', 'src/components/A')).toBe('../components/A');
    expect(relative('src/App.tsx', 'src/A')).toBe('./A');
  });
});

describe('ops', () => {
  const files = { 'src/App.tsx': "import A from './A';\n", 'src/A.tsx': 'export default 1;\n', 'src/lib/b.ts': '' };

  it('creates files and validates new folders without touching the map', () => {
    const r = ops.createFile(files, 'src/B.tsx', 'x');
    expect(r.ok && r.files['src/B.tsx']).toBe('x');
    expect(ops.createFile(files, 'src/a.tsx')).toMatchObject({ ok: false, error: { code: 'case-clash' } });
    expect(ops.createFile(files, 'src/lib')).toMatchObject({ ok: false });
    expect(ops.createFolder(files, 'src/empty')).toEqual({ ok: true, path: 'src/empty' });
    expect(ops.createFolder(files, 'src/lib')).toMatchObject({ ok: false, error: { code: 'folder-exists' } });
    expect(ops.createFolder(files, 'src/x', ['src/x'])).toMatchObject({ ok: false, error: { code: 'folder-exists' } });
    expect(ops.createFolder(files, '../out')).toMatchObject({ ok: false, error: { code: 'escapes-root' } });
  });

  it('renames and moves files and folders with labels and moves', () => {
    const r = ops.rename(files, 'src/A.tsx', 'src/Alpha.tsx');
    expect(r).toMatchObject({ ok: true, label: 'Rename file' });
    if (r.ok) {
      expect(r.files['src/App.tsx']).toBe("import A from './Alpha';\n");
      expect(r.rewritten).toEqual(['src/App.tsx']);
    }
    expect(ops.move(files, 'src/A.tsx', 'src/lib')).toMatchObject({ ok: true, label: 'Move file' });
    const f = ops.rename(files, 'src/lib', 'src/util');
    expect(f).toMatchObject({ ok: true, label: 'Rename folder' });
    if (f.ok) expect([...f.moves]).toEqual([['src/lib/b.ts', 'src/util/b.ts']]);
    expect(ops.move(files, 'src/lib', '')).toMatchObject({ ok: true, label: 'Move folder' });
  });

  it('is all-or-nothing on errors', () => {
    const frozen = Object.freeze({ ...files });
    expect(ops.rename(frozen, 'src/A.tsx', 'src/lib/b.ts')).toMatchObject({ ok: false });
    expect(ops.rename(frozen, 'src/A.tsx', '../x.tsx')).toMatchObject({ ok: false, error: { code: 'escapes-root' } });
    expect(ops.rename(frozen, 'src/lib', 'src/lib/deeper')).toMatchObject({ ok: false, error: { code: 'into-itself' } });
    expect(ops.rename(frozen, 'src/nope.tsx', 'src/x.tsx')).toMatchObject({ ok: false, error: { code: 'not-found' } });
    expect(ops.remove(frozen, 'src/App.tsx', 'src/App.tsx')).toMatchObject({ ok: false, error: { code: 'entry' } });
    expect(ops.remove(frozen, 'src', 'src/App.tsx')).toMatchObject({ ok: false, error: { code: 'entry' } });
    expect(frozen).toEqual(files);
  });

  it('duplicates with copy names and deletes subtrees', () => {
    const d1 = ops.duplicate(files, 'src/A.tsx');
    expect(d1.ok && Object.keys(d1.files)).toContain('src/A-copy.tsx');
    if (d1.ok) {
      const d2 = ops.duplicate(d1.files, 'src/A.tsx');
      expect(d2.ok && Object.keys(d2.files)).toContain('src/A-copy-2.tsx');
    }
    const del = ops.remove(files, 'src/lib');
    expect(del.ok && Object.keys(del.files)).toEqual(['src/App.tsx', 'src/A.tsx']);
    expect(del).toMatchObject({ label: 'Delete folder' });
  });
});

describe('rewriteImports', () => {
  it('rewrites importers and the moved file, keeping extension style, and leaves others byte-identical', () => {
    const files = {
      ...P0,
      'src/Other.tsx': "import x from 'react';\nimport y from './Header.tsx';\n",
      'src/lazy.ts': "const m = import('./Header');\nexport * from './Header';\n",
    };
    const r = rewriteImports(files, new Map([['src/Header.tsx', 'src/components/Header.tsx']]));
    expect(r.files['src/App.tsx']).toContain("from './components/Header'");
    expect(r.files['src/Other.tsx']).toBe("import x from 'react';\nimport y from './components/Header.tsx';\n");
    expect(r.files['src/lazy.ts']).toBe("const m = import('./components/Header');\nexport * from './components/Header';\n");
    expect(r.files['shared/data.ts']).toBe(files['shared/data.ts']);
    expect(r.files['src/widgets/Button.tsx']).toBe(files['src/widgets/Button.tsx']);
    expect(r.rewritten).toEqual(['src/App.tsx', 'src/Other.tsx', 'src/lazy.ts']);
  });

  it('rewrites specifiers inside a moved folder that point outside it, and index imports', () => {
    const r = rewriteImports(P0, new Map([['src/widgets/index.tsx', 'src/ui/widgets/index.tsx'], ['src/widgets/Button.tsx', 'src/ui/widgets/Button.tsx']]));
    expect(r.files['src/ui/widgets/Button.tsx']).toBe("import '../../Header.css';");
    expect(r.files['src/ui/widgets/index.tsx']).toBe("export { default } from './Button';");
    expect(r.files['src/App.tsx']).toContain("from './ui/widgets'");
  });

  it('rewrites CSS @import and ignores bare and commented ones', () => {
    const files = { 'src/a.css': "/* @import './b.css'; */\n@import './b.css';\n@import url(theme.css);\n@import 'pkg/x.css';\n", 'src/b.css': '' };
    expect(findCssImports(files['src/a.css']).map((s) => s.value)).toEqual(['./b.css', 'theme.css', 'pkg/x.css']);
    const r = rewriteImports(files, new Map([['src/b.css', 'src/styles/b.css']]));
    expect(r.files['src/a.css']).toBe("/* @import './b.css'; */\n@import './styles/b.css';\n@import url(theme.css);\n@import 'pkg/x.css';\n");
  });

  it('reports unresolved specifiers in moved files and skipped unparsable importers', () => {
    const files = { 'src/A.tsx': "import x from './missing';\n", 'src/Bad.tsx': 'import {', 'src/B.tsx': '' };
    const r = rewriteImports(files, new Map([['src/A.tsx', 'src/sub/A.tsx']]));
    expect(r.unresolved).toEqual([{ file: 'src/sub/A.tsx', specifier: './missing' }]);
    expect(r.files['src/sub/A.tsx']).toBe(files['src/A.tsx']);
    expect(r.skipped).toEqual(['src/Bad.tsx']);
  });
});

describe('search', () => {
  const files = { 'b.ts': 'const Foo = 1;\nfoo(); food();\n', 'a.ts': 'FOO\n' };
  it('is literal and case-insensitive by default, sorted by path, with 1-based ranges', () => {
    const r = searchFiles(files, 'foo');
    expect(r.ok && r.matches.map((m) => `${m.path}:${m.line}:${m.column}-${m.endColumn}`)).toEqual(['a.ts:1:1-4', 'b.ts:1:7-10', 'b.ts:2:1-4', 'b.ts:2:8-11']);
    expect(r.ok && r.matches[1].preview).toBe('const Foo = 1;');
  });
  it('supports case, whole word, regex, cap and regex errors', () => {
    const count = (q: string, o = {}) => { const r = searchFiles(files, q, o); return r.ok ? r.matches.length : r.error; };
    expect(count('foo', { caseSensitive: true })).toBe(2);
    expect(count('foo', { wholeWord: true })).toBe(3);
    expect(count('fo+d?\\(', { regex: true })).toBe(2);
    expect(count('a.b')).toBe(0);
    const capped = searchFiles(files, 'o', { maxResults: 3 });
    expect(capped.ok && [capped.matches.length, capped.truncated]).toEqual([3, true]);
    expect(typeof count('(', { regex: true })).toBe('string');
    expect(count('')).toBe(0);
  });
});

describe('fuzzy', () => {
  const paths = ['src/components/OrderTable.tsx', 'src/App.tsx', 'src/pages/Orders.tsx', 'README.md', 'src/order/table.ts'];
  it('ranks file-name prefix and boundary matches first', () => {
    expect(rankPaths('ord', paths).map((m) => m.path).slice(0, 2)).toEqual(['src/pages/Orders.tsx', 'src/components/OrderTable.tsx']);
    expect(rankPaths('OT', paths)[0].path).toBe('src/components/OrderTable.tsx');
    expect(fuzzyScore('xyz', 'src/App.tsx')).toBeNull();
    expect(fuzzyScore('app', 'src/App.tsx')!.indices).toEqual([4, 5, 6]);
  });
  it('shows recent files first for an empty query', () => {
    expect(rankPaths('', paths, { recent: ['README.md'] }).map((m) => m.path)[0]).toBe('README.md');
    expect(rankPaths('', paths, { limit: 2 })).toHaveLength(2);
  });
});

describe('recent files', () => {
  it('keeps most recent first, caps, follows renames and prunes deletes', () => {
    let r: string[] = [];
    for (let i = 0; i < 25; i++) r = touchRecent(r, `f${i}.ts`);
    expect(r).toHaveLength(RECENT_LIMIT);
    expect(r[0]).toBe('f24.ts');
    r = touchRecent(r, 'f20.ts');
    expect(r.slice(0, 2)).toEqual(['f20.ts', 'f24.ts']);
    expect(renameRecent(['a.ts', 'b.ts'], new Map([['a.ts', 'c.ts']]))).toEqual(['c.ts', 'b.ts']);
    expect(pruneRecent(['a.ts', 'b.ts'], { 'b.ts': '' })).toEqual(['b.ts']);
  });
});
