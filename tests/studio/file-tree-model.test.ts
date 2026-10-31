import { describe, expect, it } from 'vitest';
import {
  buildTreeNodes, copyName, deleteFocusTarget, fileKind, folderId, importersOf, newFilePrefill, newFolderPrefill, removedFolders, rewrittenFiles,
  starterContent, targetFolder, unrewritable, validateEntry,
} from '../../studio/src/files/fileTreeModel';
import { renameFile } from '../../studio/src/model/project';

const files = {
  'src/App.tsx': "import Header from './components/Header';\nexport default function App() { return <Header />; }\n",
  'src/components/Header.tsx': 'export default function Header() { return null; }\n',
  'src/item10.ts': '',
  'src/item2.ts': '',
  'src/Zeta.css': '',
  'README.md': '',
};

describe('buildTreeNodes', () => {
  it('sorts folders first, numeric A–Z, and pins the entry first in its folder', () => {
    const nodes = buildTreeNodes(files, 'src/App.tsx');
    expect(nodes.map((n) => n.id)).toEqual(['dir:src', 'README.md']);
    const src = nodes[0].children!;
    expect(src.map((n) => n.label)).toEqual(['components', 'App.tsx', 'item2.ts', 'item10.ts', 'Zeta.css']);
  });
  it('pins a non-alphabetical entry first', () => {
    const src = buildTreeNodes({ 'src/A.tsx': '', 'src/Main.tsx': '' }, 'src/Main.tsx')[0].children!;
    expect(src.map((n) => n.label)).toEqual(['Main.tsx', 'A.tsx']);
  });
  it('uses dir: ids for folders and full paths for files', () => {
    const src = buildTreeNodes(files, 'src/App.tsx')[0];
    expect(src.id).toBe(folderId('src'));
    expect(src.children![0].children![0].id).toBe('src/components/Header.tsx');
  });
});

describe('fileKind', () => {
  it.each([
    ['a/B.tsx', 'FileCode'], ['B.jsx', 'FileCode'], ['b.ts', 'FileCode2'], ['b.js', 'FileCode2'], ['B.test.tsx', 'FlaskConical'],
    ['a.css', 'FileType'], ['a.json', 'FileJson'], ['a.md', 'FileText'],
  ])('%s → %s', (path, icon) => expect(fileKind(path)).toBe(icon));
});

describe('validateEntry', () => {
  const ctx = { files, folder: 'src/components', kind: 'file' as const, mode: 'create' as const };
  it.each([
    ['', 'Enter a file name.'],
    ['   ', 'Enter a file name.'],
    ['Héader.tsx', 'Use letters, numbers, dots, hyphens or underscores.'],
    ['a b.tsx', 'Use letters, numbers, dots, hyphens or underscores.'],
    ['../X.tsx', "Paths can't go outside the project."],
    ['/X.tsx', "Paths can't go outside the project."],
    ['a//X.tsx', "Paths can't go outside the project."],
    ['X.png', 'Studio supports .tsx, .ts, .jsx, .js, .css, .json and .md files.'],
    ['Header', 'Add a file extension, for example .tsx.'],
    ['Header.tsx', '“Header.tsx” already exists in src/components.'],
    ['header.tsx', '“header.tsx” differs from “Header.tsx” only in letter case. This breaks on macOS and Windows.'],
  ])('%j → %s', (name, message) => expect(validateEntry(name, ctx).error).toBe(message));
  it('accepts nested names and returns the full path', () => {
    expect(validateEntry('pages/Home.tsx', ctx)).toEqual({ path: 'src/components/pages/Home.tsx', error: null });
  });
  it('keeps new files under src/ except .md and .json at the root', () => {
    expect(validateEntry('Root.tsx', { ...ctx, folder: '' }).error).toBe('Only .md and .json files can go at the root. Put other files in src/.');
    expect(validateEntry('notes.md', { ...ctx, folder: '' }).error).toBeNull();
  });
  it('enforces the 200-file and 10 MB limits on create', () => {
    const many = Object.fromEntries(Array.from({ length: 200 }, (_, i) => [`src/f${i}.ts`, '']));
    expect(validateEntry('New.ts', { ...ctx, files: many }).error).toBe('Projects can have up to 200 files.');
    const big = { 'src/a.ts': 'x'.repeat(10 * 1024 * 1024) };
    expect(validateEntry('New.ts', { ...ctx, files: big }).error).toBe('This project has reached 10 MB.');
  });
  it('ignores the item being renamed and allows a case-only rename of itself', () => {
    expect(validateEntry('header.tsx', { ...ctx, mode: 'rename', self: 'src/components/Header.tsx' }).error).toBeNull();
  });
  it('validates folder names without an extension', () => {
    expect(validateEntry('widgets', { ...ctx, kind: 'folder', mode: 'rename', self: 'src/components', folder: 'src' }).error).toBeNull();
  });
  it('reports a move clash with the move message', () => {
    expect(validateEntry('Header.tsx', { ...ctx, mode: 'move', self: 'src/Other/Header.tsx' }).error).toBe('A file with this name already exists there.');
  });
});

describe('targetFolder', () => {
  it('uses the focused folder, the parent of a focused file, or src', () => {
    expect(targetFolder('dir:src/components')).toBe('src/components');
    expect(targetFolder('src/components/Header.tsx')).toBe('src/components');
    expect(targetFolder(null)).toBe('src');
    expect(targetFolder('README.md')).toBe('');
  });
});

describe('starter content and prefills', () => {
  it('names the starter component in PascalCase and imports @enterprise-ui/react', () => {
    const text = starterContent('src/my-header.tsx');
    expect(text).toContain("from '@enterprise-ui/react'");
    expect(text).toContain('export default function MyHeader()');
    expect(starterContent('src/2col.tsx')).toContain('function Component2col()');
    expect(starterContent('src/a.css')).toBe('');
  });
  it('prefills names with the right selection', () => {
    expect(newFilePrefill()).toEqual({ value: 'Component.tsx', select: [0, 9] });
    expect(newFolderPrefill()).toEqual({ value: 'components/Component.tsx', select: [0, 10] });
  });
});

describe('copyName', () => {
  it('adds "-copy", then "-copy-2"', () => {
    expect(copyName('src/Header.tsx', { 'src/Header.tsx': '' })).toBe('src/Header-copy.tsx');
    expect(copyName('src/Header.tsx', { 'src/Header.tsx': '', 'src/Header-copy.tsx': '' })).toBe('src/Header-copy-2.tsx');
    expect(copyName('src/Header-copy.tsx', { 'src/Header.tsx': '', 'src/Header-copy.tsx': '' })).toBe('src/Header-copy-2.tsx');
    const three = { 'src/Header.tsx': '', 'src/Header-copy.tsx': '', 'src/Header-copy-2.tsx': '' };
    expect(copyName('src/Header.tsx', three)).toBe('src/Header-copy-3.tsx');
    expect(copyName('src/Header-copy-2.tsx', three)).toBe('src/Header-copy-3.tsx');
    expect(copyName('src/Header-copy.tsx', three)).not.toContain('copy-copy');
  });
});

describe('import bookkeeping', () => {
  it('counts files whose imports were rewritten by a rename', () => {
    const after = renameFile({ id: '1', name: 'p', files, entry: 'src/App.tsx', createdAt: 0, updatedAt: 0 }, 'src/components/Header.tsx', 'src/Header.tsx');
    expect(rewrittenFiles(files, after.files, new Map([['src/components/Header.tsx', 'src/Header.tsx']]))).toEqual(['src/App.tsx']);
  });
  it('lists unparseable files that mention the old name as not updated', () => {
    const broken = { ...files, 'src/Broken.tsx': "import Header from './components/Header'\nexport default (" };
    expect(unrewritable(broken, ['src/components/Header.tsx'])).toEqual(['src/Broken.tsx']);
  });
  it('finds importers of a file', () => {
    expect(importersOf(files, 'src/components/Header.tsx')).toEqual(['src/App.tsx']);
  });
  it('lists folders that disappeared', () => {
    expect(removedFolders(files, { 'src/App.tsx': '' })).toEqual(['src/components']);
  });
});

describe('deleteFocusTarget', () => {
  it('prefers the next sibling, then the previous, then the parent', () => {
    const nodes = buildTreeNodes(files, 'src/App.tsx');
    expect(deleteFocusTarget(nodes, 'src/item2.ts')).toBe('src/item10.ts');
    expect(deleteFocusTarget(nodes, 'src/Zeta.css')).toBe('src/item10.ts');
    expect(deleteFocusTarget(nodes, 'src/components/Header.tsx')).toBe('src/App.tsx');
    expect(deleteFocusTarget(buildTreeNodes({ 'src/App.tsx': '', 'src/a/B.ts': '' }, 'src/App.tsx'), 'src/a/B.ts')).toBe('src/App.tsx');
  });
});
