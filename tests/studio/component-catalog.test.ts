import { describe, expect, it } from 'vitest';
import { fastPass, resolveImportedProps, signature, tsPass, withSiblings } from '../../studio/src/components/catalog/discover';
import { createCache, updateCatalog } from '../../studio/src/components/catalog/cache';
import { libraryItems, LIBRARY_VERSION } from '../../studio/src/components/catalog/library';
import { importSpecifier, offsetOf, planInsert, snippetFor } from '../../studio/src/components/catalog/insert';
import { matches } from '../../studio/src/panels/components/ComponentsPanel';
import { componentFiles, DEFAULT_OPTIONS } from '../../studio/src/components/generator/templates';
import type { CatalogItem } from '../../studio/src/components/catalog/types';

const card = componentFiles('ExampleCard', DEFAULT_OPTIONS);
const gen = Object.fromEntries(Object.entries(card).map(([k, v]) => [`src/components/ExampleCard/${k}`, v]));

describe('fast pass', () => {
  it('finds named, default, aliased; arrow and function; defaults and JSDoc; ignores non-components', () => {
    const code = `
import type { ReactNode } from 'react';
/** A badge. */
export interface BadgeProps {
  /** Label text. */
  label: string;
  tone?: 'info' | 'warn';
}
export function Badge({ label, tone = 'info' }: BadgeProps) { return <span>{label}</span>; }
const Inner = ({ n = 2 }: { n?: number }) => <i>{n}</i>;
export { Inner as Outer };
export default function Page() { return <main />; }
export const Colors = { red: '#f00' };
export const Helper = () => 42;
`;
    const r = fastPass('src/a.tsx', code);
    expect(r.items.map((i) => [i.name, i.exportName])).toEqual([['Badge', 'Badge'], ['Outer', 'Outer'], ['Page', 'default']]);
    const b = r.items[0];
    expect(b.props).toEqual([
      { name: 'label', type: 'string', required: true, description: 'Label text.' },
      { name: 'tone', type: "'info' | 'warn'", required: false, description: undefined, default: "'info'" },
    ]);
    expect(b.location).toEqual({ line: 9, column: 8 });
    expect(r.items[1].props).toEqual([{ name: 'n', type: 'number', required: false, description: undefined, default: '2' }]);
    expect(signature(b)).toBe("label: string · tone?: 'info' | 'warn' = 'info'");
  });
  it('re-exports through index are not duplicated; tests/examples are skipped; parse errors flagged', () => {
    const cache = createCache();
    const items = updateCatalog(cache, gen);
    expect(items.map((i) => i.name)).toEqual(['ExampleCard']);
    expect(fastPass('x.tsx', 'export function A( {').parsed).toBe(false);
  });
});

describe('siblings and cache', () => {
  it('associates css/test/docs/example by folder + base name', () => {
    const files = { ...gen, 'src/components/ExampleCard/ExampleCard.example.tsx': 'x' };
    const [i] = updateCatalog(createCache(), files);
    expect(i).toMatchObject({ stylesheet: 'src/components/ExampleCard/ExampleCard.css', tests: 'src/components/ExampleCard/ExampleCard.test.tsx', docs: 'src/components/ExampleCard/ExampleCard.docs.md', examples: ['src/components/ExampleCard/ExampleCard.example.tsx'] });
    const noDocs = withSiblings(i, { 'src/components/ExampleCard/ExampleCard.tsx': '' });
    expect(noDocs.docs).toBeUndefined();
  });
  it('invalidates by hash and through module-graph dependents; deletion removes', () => {
    const files: Record<string, string> = {
      'src/types.ts': 'export interface P { /** T. */ a: string }\n',
      'src/A.tsx': "import type { P } from './types';\nexport function A({ a }: P) { return <b>{a}</b>; }\n",
      'src/B.tsx': 'export function B() { return <i />; }\n',
    };
    const cache = createCache();
    updateCatalog(cache, files);
    updateCatalog(cache, files);
    expect(cache.lastInvalidated.size).toBe(0);
    updateCatalog(cache, { ...files, 'src/types.ts': 'export interface P { a: number }\n' });
    expect([...cache.lastInvalidated].sort()).toEqual(['src/A.tsx', 'src/types.ts']);
    expect(updateCatalog(cache, { 'src/B.tsx': files['src/B.tsx'] }).map((i) => i.name)).toEqual(['B']);
  });
});

describe('TS pass', () => {
  const files = {
    'src/types.ts': "export type { CardProps } from './props';\n",
    'src/props.ts': 'export interface CardProps {\n  /** Heading. */\n  title: string;\n  dense?: boolean;\n}\n',
    'src/Card.tsx': "import type { CardProps } from './types';\nexport function Card({ title, dense = false }: CardProps) { return <h2>{title}</h2>; }\n",
  };
  it('resolves an imported props interface (through a re-export) and keeps defaults', async () => {
    const [fast] = fastPass('src/Card.tsx', files['src/Card.tsx']).items;
    expect(fast.propsFrom).toBe('./types');
    expect(resolveImportedProps(fast, files)?.map((p) => p.name)).toEqual(['title', 'dense']);
    const [full] = await tsPass([fast], files);
    expect(full.propsFrom).toBeUndefined();
    expect(full.props).toMatchObject([{ name: 'title', type: 'string', required: true, description: 'Heading.' }, { name: 'dense', type: 'boolean', required: false, default: 'false' }]);
  });
  it('merges results from a mocked worker resolver; failures keep the fast pass', async () => {
    const [fast] = fastPass('src/Card.tsx', files['src/Card.tsx']).items;
    const [m] = await tsPass([fast], files, async () => [{ name: 'title', type: 'string', required: true }]);
    expect(m.props).toEqual([{ name: 'title', type: 'string', required: true }]);
    const [f] = await tsPass([fast], files, async () => { throw new Error('worker not ready'); });
    expect(f).toBe(fast);
  });
});

describe('library adapter', () => {
  it('maps api.json read-only with categories', () => {
    const lib = libraryItems();
    const button = lib.find((i) => i.name === 'Button')!;
    expect(button.origin).toBe('library');
    expect(button.category).toBeTruthy();
    expect(button.props.some((p) => p.name === 'variant')).toBe(true);
    expect(lib.length).toBeGreaterThan(99);
    expect(LIBRARY_VERSION).toMatch(/^\d+\.\d+\.\d+/);
    expect(matches(button, 'varia')).toBe(true);
    expect(matches(button, 'zzz')).toBe(false);
  });
});

describe('insert plan', () => {
  const item: CatalogItem = { id: 'p', name: 'ExampleCard', exportName: 'ExampleCard', origin: 'project', source: 'src/components/ExampleCard/index.ts', props: [{ name: 'title', type: 'string', required: true }, { name: 'children', required: false }] };
  it('snippet + relative import, no duplicate import', () => {
    const code = "export default function App() {\n  return <main>\n  </main>;\n}\n";
    const at = offsetOf(code, 2, 16);
    const once = planInsert(code, at, item, 'src/App.tsx');
    expect(planInsert(code, at, { ...item, source: 'src/components/ExampleCard/ExampleCard.tsx' }, 'src/App.tsx', gen)).toContain("from './components/ExampleCard';");
    expect(snippetFor(item)).toBe('<ExampleCard title="Title" />');
    expect(once).toContain("import { ExampleCard } from './components/ExampleCard';");
    expect(once).toContain('<main><ExampleCard title="Title" />');
    const twice = planInsert(once, offsetOf(once, 1, 1), item, 'src/App.tsx');
    expect(twice.match(/import \{ ExampleCard \}/g)).toHaveLength(1);
    expect(importSpecifier({ ...item, origin: 'library' }, 'src/App.tsx')).toBe('@enterprise-ui/react');
    const d = planInsert('', 0, { ...item, exportName: 'default', source: 'src/X.tsx' }, 'src/App.tsx');
    expect(d).toContain("import ExampleCard from './X';");
  });
});

describe('entry file exclusion', () => {
  const files = { 'src/App.tsx': 'export default function App() { return <main />; }', 'src/components/Card.tsx': 'export function Card({ title }: { title: string }) { return <h2>{title}</h2>; }' };
  it('omits the default entry (src/App.tsx, App)', () => {
    const names = updateCatalog(createCache(), files).map((i) => i.name);
    expect(names).toEqual(['Card']);
  });
  it('honours a custom entry and lists App when it is not the entry', () => {
    const names = updateCatalog(createCache(), { ...files, 'src/main.tsx': 'export function Main() { return null; }' }, 'src/main.tsx').map((i) => i.name);
    expect(names).toEqual(['App', 'Card']);
  });
});
