import { describe, expect, it } from 'vitest';
import {
  ProjectError,
  applyCommand,
  createFile,
  createProject,
  deleteFile,
  deleteFolder,
  dirname,
  findImportSpecifiers,
  listTree,
  normalize,
  relativeSpecifier,
  renameFile,
  renameFolder,
  resolveImport,
  resolveRelative,
  revertCommand,
  validatePath,
  writeFile,
  LIMITS,
} from '../../studio/src/model/project';

const files = (p: { files: Record<string, string> }) => Object.keys(p.files).sort();
const code = (e: unknown) => { try { (e as () => void)(); } catch (err) { return (err as ProjectError).code; } return 'none'; };

describe('normalize', () => {
  it('produces POSIX paths without leading slash', () => {
    expect(normalize('src/App.tsx')).toBe('src/App.tsx');
    expect(normalize('/src//App.tsx')).toBe('src/App.tsx');
    expect(normalize('./src/./App.tsx')).toBe('src/App.tsx');
    expect(normalize('src\\pages\\Home.tsx')).toBe('src/pages/Home.tsx');
    expect(normalize('src/pages/../App.tsx')).toBe('src/App.tsx');
    expect(normalize('src/')).toBe('src');
  });
  it('rejects escaping the root and empty paths', () => {
    expect(code(() => normalize('../x.ts'))).toBe('escapes-root');
    expect(code(() => normalize('src/../../x.ts'))).toBe('escapes-root');
    expect(code(() => normalize(''))).toBe('empty');
    expect(code(() => normalize('/'))).toBe('empty');
  });
});

describe('validatePath', () => {
  it('accepts allowed segments and extensions', () => {
    for (const ext of ['tsx', 'ts', 'jsx', 'js', 'css', 'json', 'md']) expect(validatePath(`src/a-b_c.d.${ext}`)).toBe(`src/a-b_c.d.${ext}`);
  });
  it('rejects bad characters, extensions, dot segments', () => {
    expect(code(() => validatePath('src/my file.tsx'))).toBe('invalid-segment');
    expect(code(() => validatePath('src/é.tsx'))).toBe('invalid-segment');
    expect(code(() => validatePath('src/App.png'))).toBe('invalid-extension');
    expect(code(() => validatePath('src/README'))).toBe('invalid-extension');
    expect(code(() => validatePath('src/..'))).toBe('escapes-root');
    expect(code(() => validatePath('C:/x.ts'))).toBe('invalid-segment');
    expect(code(() => validatePath('../a.ts'))).toBe('escapes-root');
  });
});

describe('dirname / resolveRelative', () => {
  it('dirname', () => {
    expect(dirname('src/App.tsx')).toBe('src');
    expect(dirname('a.ts')).toBe('');
    expect(dirname('src/pages/Home.tsx')).toBe('src/pages');
  });
  it('resolves relative specifiers against the importing file', () => {
    expect(resolveRelative('src/App.tsx', './Header')).toBe('src/Header');
    expect(resolveRelative('src/pages/Home.tsx', '../data')).toBe('src/data');
    expect(resolveRelative('src/App.tsx', './pages/Home.tsx')).toBe('src/pages/Home.tsx');
    expect(resolveRelative('App.tsx', './x')).toBe('x');
  });
  it('returns null for bare specifiers and throws on escape', () => {
    expect(resolveRelative('src/App.tsx', '@enterprise-ui/react')).toBeNull();
    expect(resolveRelative('src/App.tsx', 'react')).toBeNull();
    expect(code(() => resolveRelative('src/App.tsx', '../../x'))).toBe('escapes-root');
  });
  it('resolveImport finds extensions and index files in the VFS', () => {
    const vfs = { 'src/Header.tsx': '', 'src/components/index.ts': '', 'src/data.json': '', 'src/a.css': '' };
    expect(resolveImport(vfs, 'src/App.tsx', './Header')).toBe('src/Header.tsx');
    expect(resolveImport(vfs, 'src/App.tsx', './components')).toBe('src/components/index.ts');
    expect(resolveImport(vfs, 'src/App.tsx', './data.json')).toBe('src/data.json');
    expect(resolveImport(vfs, 'src/App.tsx', './a.css')).toBe('src/a.css');
    expect(resolveImport(vfs, 'src/App.tsx', './Missing')).toBeNull();
    expect(resolveImport(vfs, 'src/App.tsx', 'react')).toBeNull();
    expect(resolveImport(vfs, 'src/App.tsx', '../../../x')).toBeNull();
  });
  it('relativeSpecifier always starts with ./ or ../', () => {
    expect(relativeSpecifier('src/App.tsx', 'src/Header')).toBe('./Header');
    expect(relativeSpecifier('src/pages/Home.tsx', 'src/data')).toBe('../data');
    expect(relativeSpecifier('src/App.tsx', 'src/pages/x/Y')).toBe('./pages/x/Y');
    expect(relativeSpecifier('a/b/c/D.tsx', 'e/F')).toBe('../../../e/F');
    expect(relativeSpecifier('App.tsx', 'x')).toBe('./x');
  });
});

describe('createFile / writeFile', () => {
  const base = createProject({ 'src/App.tsx': 'x' });
  it('creates a file and leaves the original untouched', () => {
    const next = createFile(base, 'src/Header.tsx', 'h');
    expect(next.files['src/Header.tsx']).toBe('h');
    expect(base.files['src/Header.tsx']).toBeUndefined();
    expect(next.files['src/App.tsx']).toBe(base.files['src/App.tsx']);
  });
  it('normalises the path', () => {
    expect(files(createFile(base, '/src/./pages/Home.tsx'))).toContain('src/pages/Home.tsx');
  });
  it('rejects duplicates and case clashes', () => {
    expect(code(() => createFile(base, 'src/App.tsx'))).toBe('exists');
    expect(code(() => createFile(base, 'src/app.tsx'))).toBe('case-clash');
    expect(code(() => createFile(base, 'SRC/Other.tsx'))).toBe('case-clash');
  });
  it('rejects a file where a folder is, or inside a file', () => {
    expect(code(() => createFile(base, 'src'))).toBe('invalid-extension');
    const p = createProject({ 'src/a.ts': '' });
    expect(code(() => createFile(p, 'src/a.ts/b.ts'))).toBe('file-is-folder');
    const q = createProject({ 'src/x.ts/b.ts': '' });
    expect(code(() => createFile(q, 'src/x.ts'))).toBe('folder-exists');
  });
  it('enforces limits', () => {
    expect(code(() => createFile(base, 'src/big.ts', 'a'.repeat(LIMITS.fileBytes + 1)))).toBe('file-too-large');
    const many: Record<string, string> = {};
    for (let i = 0; i < LIMITS.files; i++) many[`f${i}.ts`] = '';
    expect(code(() => createFile(createProject(many), 'extra.ts'))).toBe('too-many-files');
    const big: Record<string, string> = {};
    for (let i = 0; i < 10; i++) big[`f${i}.ts`] = 'a'.repeat(LIMITS.fileBytes);
    expect(code(() => createFile(createProject(big), 'extra.ts', 'a'))).toBe('project-too-large');
  });
  it('writeFile edits an existing file only', () => {
    expect(writeFile(base, 'src/App.tsx', 'y').files['src/App.tsx']).toBe('y');
    expect(writeFile(base, 'src/App.tsx', 'x')).toBe(base);
    expect(code(() => writeFile(base, 'src/Nope.tsx', 'y'))).toBe('not-found');
  });
});

describe('deleteFile / deleteFolder', () => {
  const p = createProject({ 'src/App.tsx': 'a', 'src/pages/A.tsx': 'a', 'src/pages/sub/B.tsx': 'b', 'src/pagesX.tsx': '' }, 'src/App.tsx');
  it('deletes a file', () => {
    expect(files(deleteFile(p, 'src/pages/A.tsx'))).toEqual(['src/App.tsx', 'src/pages/sub/B.tsx', 'src/pagesX.tsx']);
    expect(code(() => deleteFile(p, 'src/nope.tsx'))).toBe('not-found');
  });
  it('refuses to delete the entry', () => {
    expect(code(() => deleteFile(p, 'src/App.tsx'))).toBe('entry');
    expect(code(() => deleteFolder(p, 'src'))).toBe('entry');
  });
  it('deletes a folder recursively without touching siblings with a shared prefix', () => {
    expect(files(deleteFolder(p, 'src/pages'))).toEqual(['src/App.tsx', 'src/pagesX.tsx']);
    expect(code(() => deleteFolder(p, 'src/none'))).toBe('not-found');
  });
});

describe('renameFile', () => {
  const vfs = {
    'src/App.tsx': `import { Button } from '@enterprise-ui/react';\nimport Header from './Header';\nimport './Header.css';\nexport default function App() { return <Header />; }\n`,
    'src/Header.tsx': `import { rows } from './data';\nexport default function Header() { return null; }\n`,
    'src/Header.css': '.h{}',
    'src/data.ts': 'export const rows = [];',
    'src/pages/Home.tsx': `import Header from "../Header";\nexport * from '../Header';\nconst Lazy = () => import('../Header.tsx');\n// import x from './Header'\nconst s = './Header';\n`,
  };
  const p = createProject(vfs, 'src/App.tsx');

  it('moves the contents and rewrites imports in other files, keeping quote style', () => {
    const next = renameFile(p, 'src/Header.tsx', 'src/components/Header.tsx');
    expect(next.files['src/Header.tsx']).toBeUndefined();
    expect(next.files['src/App.tsx']).toContain(`import Header from './components/Header';`);
    expect(next.files['src/App.tsx']).toContain(`import './Header.css';`);
    expect(next.files['src/pages/Home.tsx']).toContain(`import Header from "../components/Header";`);
    expect(next.files['src/pages/Home.tsx']).toContain(`export * from '../components/Header';`);
    expect(next.files['src/pages/Home.tsx']).toContain(`import('../components/Header.tsx')`);
    // comments and unrelated strings are untouched
    expect(next.files['src/pages/Home.tsx']).toContain(`// import x from './Header'`);
    expect(next.files['src/pages/Home.tsx']).toContain(`const s = './Header';`);
  });
  it('rewrites the moved file’s own relative imports', () => {
    const next = renameFile(p, 'src/Header.tsx', 'src/components/Header.tsx');
    expect(next.files['src/components/Header.tsx']).toContain(`from '../data'`);
  });
  it('keeps the file in the same folder working (pure rename)', () => {
    const next = renameFile(p, 'src/Header.tsx', 'src/TopBar.tsx');
    expect(next.files['src/App.tsx']).toContain(`from './TopBar'`);
    expect(next.files['src/TopBar.tsx']).toContain(`from './data'`);
  });
  it('rewrites imports of non-script files such as CSS', () => {
    const next = renameFile(p, 'src/Header.css', 'src/styles/header.css');
    expect(next.files['src/App.tsx']).toContain(`import './styles/header.css';`);
  });
  it('follows the entry when it is renamed', () => {
    expect(renameFile(p, 'src/App.tsx', 'src/Main.tsx').entry).toBe('src/Main.tsx');
  });
  it('allows a case-only rename of the same file but not a clash with another', () => {
    const next = renameFile(p, 'src/data.ts', 'src/Data.ts');
    expect(next.files['src/Header.tsx']).toContain(`from './Data'`);
    expect(code(() => renameFile(p, 'src/data.ts', 'src/header.tsx'))).toBe('case-clash');
    expect(code(() => renameFile(p, 'src/data.ts', 'src/Header.tsx'))).toBe('exists');
    expect(code(() => renameFile(p, 'src/nope.ts', 'src/x.ts'))).toBe('not-found');
    expect(code(() => renameFile(p, 'src/data.ts', '../data.ts'))).toBe('escapes-root');
  });
  it('is a no-op when the path does not change', () => {
    expect(renameFile(p, 'src/data.ts', './src/data.ts')).toBe(p);
  });
  it('rewrites index imports by pointing at the folder', () => {
    const q = createProject({ 'src/App.tsx': `import X from './ui';`, 'src/ui/index.ts': 'export default 1;' }, 'src/App.tsx');
    const moved = renameFolder(q, 'src/ui', 'src/widgets');
    expect(moved.files['src/App.tsx']).toBe(`import X from './widgets';`);
    const renamedIndex = renameFile(q, 'src/ui/index.ts', 'src/ui/main.ts');
    expect(renamedIndex.files['src/App.tsx']).toBe(`import X from './ui/main';`);
  });
  it('leaves unparsable files untouched', () => {
    const q = createProject({ 'src/App.tsx': 'import X from "./A"; <<<', 'src/A.tsx': '' }, 'src/App.tsx');
    expect(renameFile(q, 'src/A.tsx', 'src/B.tsx').files['src/App.tsx']).toBe('import X from "./A"; <<<');
  });
  it('does not change specifiers that already resolved elsewhere', () => {
    const q = createProject({ 'src/App.tsx': `import a from './a'; import b from './b';`, 'src/a.ts': '', 'src/b.ts': '' }, 'src/App.tsx');
    expect(renameFile(q, 'src/a.ts', 'src/c.ts').files['src/App.tsx']).toBe(`import a from './c'; import b from './b';`);
  });
});

describe('renameFolder', () => {
  const p = createProject({
    'src/App.tsx': `import Home from './pages/Home';\n`,
    'src/data.ts': '',
    'src/pages/Home.tsx': `import { rows } from '../data';\nimport Card from './parts/Card';\n`,
    'src/pages/parts/Card.tsx': `import { rows } from '../../data';\n`,
    'src/pagesExtra.ts': '',
  }, 'src/App.tsx');
  it('moves every file below the folder and fixes imports inside and outside', () => {
    const next = renameFolder(p, 'src/pages', 'src/views/screens');
    expect(files(next)).toEqual(['src/App.tsx', 'src/data.ts', 'src/pagesExtra.ts', 'src/views/screens/Home.tsx', 'src/views/screens/parts/Card.tsx']);
    expect(next.files['src/App.tsx']).toContain(`from './views/screens/Home'`);
    expect(next.files['src/views/screens/Home.tsx']).toContain(`from '../../data'`);
    expect(next.files['src/views/screens/Home.tsx']).toContain(`from './parts/Card'`);
    expect(next.files['src/views/screens/parts/Card.tsx']).toContain(`from '../../../data'`);
  });
  it('validates the folder move', () => {
    expect(code(() => renameFolder(p, 'src/nope', 'src/x'))).toBe('not-found');
    expect(code(() => renameFolder(p, 'src/pages', 'src/pages/inner'))).toBe('into-itself');
    expect(code(() => renameFolder(p, 'src/pages', 'src/Pages'))).toBe('none');
    expect(code(() => renameFolder(p, 'src/pages', 'src/data.ts'))).toBe('file-is-folder');
    expect(code(() => renameFolder(p, 'src/pages', 'src/bad name'))).toBe('invalid-segment');
    const q = createProject({ 'a/x.ts': '', 'b/x.ts': '' });
    expect(code(() => renameFolder(q, 'a', 'b'))).toBe('exists');
  });
  it('moves the entry with its folder', () => {
    expect(renameFolder(p, 'src', 'app').entry).toBe('app/App.tsx');
  });
});

describe('findImportSpecifiers', () => {
  it('finds import/export/dynamic import/require sources with offsets', () => {
    const text = `import a from './a';\nexport { b } from "./b";\nconst c = import('./c');\nconst d = require('./d');\nimport type { T } from './t';\n`;
    const specs = findImportSpecifiers(text, 'x.tsx')!.map((s) => s.value);
    expect(specs).toEqual(['./a', './b', './c', './d', './t']);
    for (const s of findImportSpecifiers(text, 'x.tsx')!) expect(text.slice(s.start + 1, s.end - 1)).toBe(s.value);
  });
  it('returns [] for non-script files and null on parse errors', () => {
    expect(findImportSpecifiers('.a{}', 'a.css')).toEqual([]);
    expect(findImportSpecifiers('import ( from', 'a.ts')).toBeNull();
  });
});

describe('listTree', () => {
  it('builds sorted folders-first tree', () => {
    const tree = listTree({ 'src/b.ts': '', 'src/a/z.ts': '', 'README.md': '', 'src/A.ts': '' });
    expect(tree.map((n) => n.name)).toEqual(['src', 'README.md']);
    const src = tree[0];
    expect(src.kind).toBe('folder');
    expect(src.kind === 'folder' && src.children.map((n) => `${n.kind}:${n.path}`)).toEqual(['folder:src/a', 'file:src/A.ts', 'file:src/b.ts']);
  });
  it('handles an empty VFS', () => { expect(listTree({})).toEqual([]); });
});

describe('commands ({ do, undo })', () => {
  const p = createProject({ 'src/App.tsx': `import H from './H';`, 'src/H.tsx': 'h' }, 'src/App.tsx');
  it('every operation can return a reversible command', () => {
    const ops = [
      (q: typeof p) => createFile(q, 'src/N.tsx', 'n', { command: true }),
      (q: typeof p) => renameFile(q, 'src/H.tsx', 'src/x/H.tsx', { command: true }),
      (q: typeof p) => deleteFile(q, 'src/H.tsx', { command: true }),
      (q: typeof p) => renameFolder(q, 'src', 'app', { command: true }),
      (q: typeof p) => writeFile(q, 'src/H.tsx', 'changed', { command: true }),
    ];
    for (const op of ops) {
      const cmd = op(p);
      const after = applyCommand(p, cmd);
      expect(after).not.toEqual(p);
      const back = revertCommand(after, cmd);
      expect(back.files).toEqual(p.files);
      expect(back.entry).toBe(p.entry);
      expect(applyCommand(back, cmd).files).toEqual(after.files);
      expect(cmd.label).toBeTruthy();
    }
  });
  it('undo restores rewritten imports', () => {
    const cmd = renameFile(p, 'src/H.tsx', 'src/Head.tsx', { command: true });
    expect(cmd.touched).toEqual(expect.arrayContaining(['src/H.tsx', 'src/Head.tsx', 'src/App.tsx']));
    const after = applyCommand(p, cmd);
    expect(after.files['src/App.tsx']).toBe(`import H from './Head';`);
    expect(revertCommand(after, cmd).files['src/App.tsx']).toBe(`import H from './H';`);
  });
});
