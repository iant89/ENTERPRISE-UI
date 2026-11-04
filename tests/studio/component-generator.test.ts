import { describe, expect, it } from 'vitest';
import { createProject } from '../../studio/src/model/project';
import { createStore, storeReducer, type StoreState } from '../../studio/src/model/store';
import { createCompiler } from '../../studio/src/preview/compiler';
import { componentFiles, DEFAULT_OPTIONS, fileNames, kebab, type ComponentOptions } from '../../studio/src/components/generator/templates';
import { applyComponent, destinationFor, destinationFromActive, planComponent, validateName } from '../../studio/src/components/generator/generate';
import { folderOptions } from '../../studio/src/components/generator/CreateComponentDialog';

const base = () => createStore(createProject({ 'src/App.tsx': 'export default function App() { return <div />; }\n' }, 'src/App.tsx', 'p'));
const input = (name = 'ExampleCard', options: Partial<ComponentOptions> = {}, destination = 'src/components/') => ({ name, destination, options: { ...DEFAULT_OPTIONS, ...options } });
const ok = (s: StoreState, ...a: Parameters<typeof input>) => { const p = planComponent(s.project, input(...a)); if (!p.ok) throw new Error(JSON.stringify(p.errors)); return p; };

describe('templates', () => {
  it('default ExampleCard: the 5 §6.2 files and the spec example shape', () => {
    const f = componentFiles('ExampleCard', DEFAULT_OPTIONS);
    expect(Object.keys(f)).toEqual(['ExampleCard.tsx', 'ExampleCard.css', 'ExampleCard.test.tsx', 'ExampleCard.docs.md', 'index.ts']);
    expect(f['ExampleCard.tsx']).toMatchSnapshot();
    expect(f['ExampleCard.tsx']).toContain("export interface ExampleCardProps {\n  /** Main heading displayed by the card. */");
    expect(f['ExampleCard.tsx']).toContain("export function ExampleCard({");
    expect(f['index.ts']).toBe("export { ExampleCard } from './ExampleCard';\nexport type { ExampleCardProps } from './ExampleCard';\n");
    expect(f['ExampleCard.docs.md']).toMatch(/^---\ntitle: ExampleCard\n/);
    expect(f['ExampleCard.docs.md']).toContain('## Props');
    expect(f['ExampleCard.css']).toContain('.example-card__title');
  });
  it.each([
    [{ language: 'js' as const }, ['X.jsx', 'X.css', 'X.test.jsx', 'X.docs.md', 'index.js']],
    [{ styling: 'none' as const }, ['X.tsx', 'X.test.tsx', 'X.docs.md', 'index.ts']],
    [{ example: true }, ['X.tsx', 'X.css', 'X.test.tsx', 'X.docs.md', 'X.example.tsx', 'index.ts']],
    [{ tests: false, docs: false, index: false }, ['X.tsx', 'X.css']],
  ])('options %j', (o, names) => {
    expect(Object.keys(componentFiles('X', { ...DEFAULT_OPTIONS, ...o }))).toEqual(names);
    expect(fileNames('X', { ...DEFAULT_OPTIONS, ...o })).toEqual(names);
  });
  it('JS has no types; default export re-exports default; no CSS import without styling', () => {
    const js = componentFiles('X', { ...DEFAULT_OPTIONS, language: 'js' });
    expect(js['X.jsx']).not.toMatch(/interface|: XProps|import type/);
    const d = componentFiles('X', { ...DEFAULT_OPTIONS, exportStyle: 'default', example: true });
    expect(d['X.tsx']).toContain('export default function X(');
    expect(d['index.ts']).toContain("export { default, default as X } from './X';");
    expect(d['X.example.tsx']).toContain("import X from './X';");
    expect(componentFiles('X', { ...DEFAULT_OPTIONS, styling: 'none' })['X.tsx']).not.toContain('.css');
    expect(kebab('HTTPStatusBadge')).toBe('http-status-badge');
  });
});

describe('validation', () => {
  it('names', () => {
    expect(validateName('')).toMatch(/Enter/);
    expect(validateName('exampleCard')).toMatch(/PascalCase/);
    expect(validateName('Example-Card')).toMatch(/PascalCase/);
    expect(validateName('Object')).toMatch(/reserved/);
    expect(validateName('ExampleCard')).toBeUndefined();
  });
  it('destination normalisation and escapes', () => {
    const s = base();
    expect(ok(s, 'A', {}, 'src//components/').folder).toBe('src/components/A');
    const bad = planComponent(s.project, input('A', {}, '../x'));
    expect(!bad.ok && bad.errors.destination).toBeTruthy();
    expect(destinationFor('src/App.tsx', s.project.files)).toBe('src/');
    expect(destinationFor('src/pages', {})).toBe('src/pages/');
    expect(destinationFromActive('src/App.tsx', s.project.files)).toBe('src/components/');
    expect(folderOptions({ 'src/a/b.ts': '' }, 'x/')).toEqual(['src/', 'src/a/', 'src/components/', 'x/']);
  });
  it('conflicts: existing folder, file or case clash → error on name', () => {
    const s = applyComponent(base(), 'ExampleCard', ok(base())).state;
    const p = planComponent(s.project, input());
    expect(!p.ok && p.errors.name).toMatch(/already exists/);
    const c = planComponent(s.project, input('Examplecard'));
    expect(!c.ok && c.errors.name).toMatch(/letter case/);
  });
});

describe('atomic apply and undo', () => {
  it('writes exactly the files, opens the .tsx, one undo removes all and closes tabs; redo restores', () => {
    const s0 = base();
    const s1 = applyComponent(s0, 'ExampleCard', ok(s0)).state;
    const added = Object.keys(s1.project.files).filter((p) => !(p in s0.project.files)).sort();
    expect(added).toEqual(['src/components/ExampleCard/ExampleCard.css', 'src/components/ExampleCard/ExampleCard.docs.md', 'src/components/ExampleCard/ExampleCard.test.tsx', 'src/components/ExampleCard/ExampleCard.tsx', 'src/components/ExampleCard/index.ts']);
    expect(s1.activePath).toBe('src/components/ExampleCard/ExampleCard.tsx');
    expect(s1.openTabs).toContain(s1.activePath);
    expect(s1.past.at(-1)!.label).toBe('Create component ExampleCard');
    const u = storeReducer(s1, { type: 'undo' });
    expect(u.project.files).toEqual(s0.project.files);
    expect(u.openTabs).toEqual(['src/App.tsx']);
    expect(storeReducer(u, { type: 'redo' }).project.files).toEqual(s1.project.files);
  });
  it('an injected failure mid-generation leaves the project unchanged with no undo step', () => {
    const s0 = base();
    const plan = ok(s0);
    const broken = { ...plan, files: { ...plan.files, 'src/components/ExampleCard/bad.exe': 'x' } };
    const r = applyComponent(s0, 'ExampleCard', broken);
    expect(r.error).toBeTruthy();
    expect(r.state).toBe(s0);
    expect(r.state.past).toHaveLength(0);
  });
  it('generated TS compiles with zero diagnostics and renders from a page', () => {
    const s0 = base();
    const s1 = applyComponent(s0, 'ExampleCard', ok(s0)).state;
    const files = { ...s1.project.files, 'src/App.tsx': "import { ExampleCard } from './components/ExampleCard';\nexport default function App() { return <ExampleCard title=\"Hi\" />; }\n" };
    const r = createCompiler().compile(files, 'src/App.tsx');
    expect(r.diagnostics).toEqual([]);
    expect(r.artifact).toBeTruthy();
  });
});
