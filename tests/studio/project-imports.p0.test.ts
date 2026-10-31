import { describe, expect, it } from 'vitest';
import { createProject, renameFile, renameFolder, resolveImport, findImportSpecifiers } from '../../studio/src/model/project';

const files = {
  'src/App.tsx': "import H from './Header';\nimport { d } from '../shared/data';\nimport W from './widgets';\n",
  'src/Header.tsx': 'export default () => null;',
  'src/Header.css': '',
  'src/widgets/index.tsx': "export { default } from './Button';",
  'src/widgets/Button.tsx': "import '../Header.css';",
  'src/widgets/index.ts': '',
  'shared/data.ts': 'export const d = 1;',
  'src/pages/Home.tsx': "import x from '..';",
  'src/index.ts': '',
};

describe('P0 relative import resolution', () => {
  it('./ resolves with implied extensions, exact match first', () => {
    expect(resolveImport(files, 'src/App.tsx', './Header')).toBe('src/Header.tsx');
    expect(resolveImport(files, 'src/App.tsx', './Header.css')).toBe('src/Header.css');
    expect(resolveImport(files, 'src/App.tsx', './Header.tsx')).toBe('src/Header.tsx');
  });
  it('../ climbs folders', () => {
    expect(resolveImport(files, 'src/App.tsx', '../shared/data')).toBe('shared/data.ts');
    expect(resolveImport(files, 'src/widgets/Button.tsx', '../Header.css')).toBe('src/Header.css');
    expect(resolveImport(files, 'src/widgets/Button.tsx', '../../shared/data')).toBe('shared/data.ts');
  });
  it('folder index files, .tsx preferred over .ts, bare ./ and ..', () => {
    expect(resolveImport(files, 'src/App.tsx', './widgets')).toBe('src/widgets/index.tsx');
    expect(resolveImport(files, 'src/App.tsx', './widgets/')).toBe('src/widgets/index.tsx');
    expect(resolveImport(files, 'src/widgets/Button.tsx', '.')).toBe('src/widgets/index.tsx');
    expect(resolveImport(files, 'src/pages/Home.tsx', '..')).toBe('src/index.ts');
  });
  it('missing file / escaping root / bare specifiers give null without throwing', () => {
    expect(resolveImport(files, 'src/App.tsx', './Nope')).toBeNull();
    expect(resolveImport(files, 'src/App.tsx', './empty-dir')).toBeNull();
    expect(resolveImport(files, 'src/App.tsx', '../../outside')).toBeNull();
    expect(resolveImport(files, 'App.tsx', '..')).toBeNull();
    expect(resolveImport(files, 'src/App.tsx', 'react')).toBeNull();
    expect(resolveImport({}, 'src/App.tsx', './x')).toBeNull();
  });
  it('circular imports resolve per edge and renames terminate and rewrite both sides', () => {
    const cyc = { 'src/a.tsx': "import b from './b';\nexport default 1;", 'src/b.tsx': "import a from './a';\nexport default 2;", 'src/App.tsx': "import a from './a';" };
    expect(resolveImport(cyc, 'src/a.tsx', './b')).toBe('src/b.tsx');
    expect(resolveImport(cyc, 'src/b.tsx', './a')).toBe('src/a.tsx');
    const p = renameFile(createProject(cyc), 'src/a.tsx', 'src/lib/a.tsx');
    expect(p.files['src/lib/a.tsx']).toContain("from '../b'");
    expect(p.files['src/b.tsx']).toContain("from './lib/a'");
    expect(p.files['src/App.tsx']).toContain("from './lib/a'");
    // self-import cycle
    const self = renameFile(createProject({ 'src/App.tsx': '', 's/x.ts': "import './x';" }), 's/x.ts', 's/y.ts');
    expect(self.files['s/y.ts']).toBe("import './y';");
  });
  it('folder rename keeps index-style specifiers', () => {
    const p = renameFolder(createProject(files), 'src/widgets', 'src/ui');
    expect(p.files['src/App.tsx']).toContain("from './ui'");
    expect(p.files['src/ui/Button.tsx']).toBe("import '../Header.css';");
  });
  it('specifier offsets point at the quoted literal', () => {
    const t = "import a from './a';";
    const [s] = findImportSpecifiers(t, 'x.ts')!;
    expect(t.slice(s.start, s.end)).toBe("'./a'");
  });
});
