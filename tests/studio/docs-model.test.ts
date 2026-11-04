import { describe, expect, it } from 'vitest';
import { exampleJsx, inferControl, initialValues, libraryPage, NOT_DOCUMENTED, projectPage, BUILD_ID } from '../../studio/src/docs/api-metadata/pageModel';
import { buildIndex, search } from '../../studio/src/docs/search';
import { draftDocs, findUsages, regenerate } from '../../studio/src/docs/project-markdown/generate';
import { componentAt } from '../../studio/src/docs/cursorComponent';
import { docsNavReducer, EMPTY_NAV } from '../../studio/src/docs/DocsPanel';
import { exampleEntry } from '../../studio/src/docs/LiveExample';
import { updateCatalog, createCache } from '../../studio/src/components/catalog/cache';
import { libraryItems } from '../../studio/src/components/catalog/library';
import { componentFiles, DEFAULT_OPTIONS } from '../../studio/src/components/generator/templates';
import { createCompiler } from '../../studio/src/preview/compiler';

const gen = Object.fromEntries(Object.entries(componentFiles('ExampleCard', DEFAULT_OPTIONS)).map(([k, v]) => [`src/components/ExampleCard/${k}`, v]));
const bare = { 'src/components/Bare/Bare.tsx': "export interface BareProps {\n  /** Main heading. */\n  heading: string;\n  tone?: 'info' | 'warn';\n  count?: number;\n}\nexport function Bare({ heading, tone = 'info', count = 2 }: BareProps) { return <h2>{heading}{tone}{count}</h2>; }\n" };
const files = { 'src/App.tsx': "import { Bare } from './components/Bare/Bare';\nexport default function App() { return <main>\n  <Bare heading=\"Hi\" />\n</main>; }\n", ...gen, ...bare };
const items = updateCatalog(createCache(), files);
const item = (n: string) => items.find((i) => i.name === n)!;

describe('library page model', () => {
  it('Button: every available §7.2 field from api.json, nothing invented', () => {
    const p = libraryPage('Button')!;
    expect(p.description).toBe('Triggers an action.');
    expect(p.importStatement).toBe("import { Button } from '@enterprise-ui/react';");
    expect(p.props.find((x) => x.name === 'fullWidth')).toMatchObject({ type: 'boolean', default: 'false', descriptionFrom: 'api' });
    expect(p.events.every((e) => /^on[A-Z]/.test(e.name))).toBe(true);
    expect(p.docsUrl).toMatch(/^\.\.\/#\/components\//);
    expect(p.example).toBeTruthy();
    expect(libraryPage('Nope')).toBeNull();
    expect(BUILD_ID).toMatch(/^\d+\.\d+\.\d+ · api /);
  });
  it('missing metadata stays undefined (rendered as Not documented yet)', () => {
    const p = libraryPage('Portal')!;
    expect(p.props.filter((x) => !x.description).every((x) => x.descriptionFrom === undefined)).toBe(true);
    expect(NOT_DOCUMENTED).toBe('Not documented yet');
  });
});

describe('project page precedence (§7.5)', () => {
  it('docs file → JSDoc → TS types → Not documented', () => {
    const withDocs = projectPage(item('ExampleCard'), files);
    expect(withDocs.docsFile).toBe('src/components/ExampleCard/ExampleCard.docs.md');
    // The C5 template's props table describes title → from docs.
    expect(withDocs.props.find((p) => p.name === 'title')).toMatchObject({ description: 'Main heading displayed by the card.', descriptionFrom: 'docs' });
    const b = projectPage(item('Bare'), files);
    expect(b.docsFile).toBeUndefined();
    expect(b.props.find((p) => p.name === 'heading')).toMatchObject({ description: 'Main heading.', descriptionFrom: 'jsdoc' });
    expect(b.props.find((p) => p.name === 'tone')).toMatchObject({ type: "'info' | 'warn'", description: undefined, descriptionFrom: undefined });
    expect(b.importStatement).toBe("import { Bare } from './components/Bare/Bare';");
  });
});

describe('controls', () => {
  it('infers from types; initial values from defaults; JSX', () => {
    expect(inferControl('string')).toEqual({ kind: 'text' });
    expect(inferControl('boolean | undefined')).toEqual({ kind: 'switch' });
    expect(inferControl('number')).toEqual({ kind: 'number' });
    expect(inferControl("'a' | 'b'")).toEqual({ kind: 'select', options: ['a', 'b'] });
    expect(inferControl('() => void')).toBeNull();
    const p = projectPage(item('Bare'), files);
    const v = initialValues(p.props);
    expect(v).toEqual({ heading: 'Sample heading', tone: 'info', count: 2 });
    expect(exampleJsx('Bare', v)).toBe('<Bare heading="Sample heading" tone="info" count={2} />');
  });
  it('the live example entry compiles in the C4 runtime without touching the VFS', () => {
    const p = projectPage(item('ExampleCard'), files);
    const entry = exampleEntry(p, exampleJsx('ExampleCard', initialValues(p.props)));
    const r = createCompiler().compile({ ...files, 'src/__docs_example__.tsx': entry }, 'src/__docs_example__.tsx');
    expect(r.diagnostics).toEqual([]);
    expect(Object.keys(files)).not.toContain('src/__docs_example__.tsx');
  });
});

describe('search', () => {
  const index = buildIndex(libraryItems(), items, files);
  it('finds library components, project docs text, JSDoc and prop names, grouped', () => {
    expect(search(index, 'button').Library[0].title).toBe('Button');
    expect(search(index, 'heading displayed').Project.some((h) => h.target === item('ExampleCard').id)).toBe(true);
    expect(search(index, 'Main heading.').Project.some((h) => h.title === 'Bare · heading')).toBe(true);
    expect(search(index, 'emphasized').Project[0].title).toMatch(/ExampleCard/);
    expect(search(index, '')).toEqual({ Library: [], Project: [] });
  });
});

describe('generator', () => {
  it('drafts with markers and the C5 headings; finds usages', () => {
    const d = draftDocs(item('Bare'), files, './components/Bare/Bare');
    expect(d).toMatch(/^---\ntitle: Bare\ncomponent: Bare\n---\n\n# Bare\n\n## Overview/);
    expect(d).toContain('## Props\n\n<!-- generated -->\n| Prop | Type | Required | Default | Description |');
    expect(d).toContain("| `tone` | `'info' \\| 'warn'` | no | `'info'` | TODO |");
    expect(d).toContain('<Bare heading="Hi" />');
    expect(findUsages('Bare', files, 'src/components/Bare/Bare.tsx')).toEqual([{ path: 'src/App.tsx', line: 3 }]);
  });
  it('regenerate keeps prose byte-for-byte and refreshes generated sections only', () => {
    const d = draftDocs(item('Bare'), files, './x');
    const edited = d.replace('TODO: describe Bare.', 'My **own** prose.\n\nSecond paragraph.').replace('| TODO |', '| stale |');
    const r = regenerate(edited, { ...item('Bare'), props: [...item('Bare').props, { name: 'extra', type: 'string', required: false }] }, files, './x');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const proseStart = edited.indexOf('## Overview');
    const proseEnd = edited.indexOf('## Props');
    expect(r.text.slice(proseStart, r.text.indexOf('## Props'))).toBe(edited.slice(proseStart, proseEnd));
    expect(r.text).toContain('`extra`');
    expect(r.text).not.toContain('stale');
  });
  it('malformed markers are rejected', () => {
    expect(regenerate('<!-- generated -->\nx', item('Bare'), files, './x').ok).toBe(false);
    expect(regenerate('<!-- /generated -->', item('Bare'), files, './x').ok).toBe(false);
    expect(regenerate('<!-- generated -->\n<!-- generated -->\n<!-- /generated -->\n<!-- /generated -->', item('Bare'), files, './x').ok).toBe(false);
  });
});

describe('cursor component and history', () => {
  it('finds the JSX element at the caret', () => {
    const code = '<main>\n  <Card title="x">\n    <Button>Go</Button>\n  </Card>\n</main>';
    expect(componentAt(code, 3, 7)).toBe('Button');
    expect(componentAt(code, 2, 4)).toBe('Card');
    expect(componentAt(code, 3, 24)).toBe('Card');
    expect(componentAt('const a = 1;', 1, 3)).toBeNull();
  });
  it('back/forward', () => {
    let s = docsNavReducer(EMPTY_NAV, { type: 'open', id: 'a' });
    s = docsNavReducer(s, { type: 'open', id: 'b' });
    s = docsNavReducer(s, { type: 'back' });
    expect(s.stack[s.index]).toBe('a');
    s = docsNavReducer(s, { type: 'forward' });
    expect(s.stack[s.index]).toBe('b');
    s = docsNavReducer(docsNavReducer(s, { type: 'back' }), { type: 'open', id: 'c' });
    expect(s.stack).toEqual(['a', 'c']);
  });
});
