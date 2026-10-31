import { describe, expect, it } from 'vitest';
import { duplicateNode, ensureImports, findNode, idAfterRemoval, insertElement, instrument, moveNode, parseDocument, removeNode, setAttribute, setText } from '../../studio/src/model/jsx';
import { commit, createHistory, redo, undo } from '../../studio/src/model/history';
import { widgetFor, groupInspectorProps } from '../../studio/src/model/inspector';
import { catalog, defaultSnippet } from '../../studio/src/model/catalog';

const page = `import { Button, Stack } from '@enterprise-ui/react';

// A comment that must survive edits.
export default function Page() {
  return (
    <Stack gap={3}>
      <Button variant="primary">Save</Button>
      <Button disabled>Cancel</Button>
      {items.map((i) => <span key={i}>{i}</span>)}
    </Stack>
  );
}
`;

describe('jsx model', () => {
  it('parses the returned JSX into a tree with locked expressions', () => {
    const { root } = parseDocument(page);
    expect(root?.name).toBe('Stack');
    expect(root?.children.map((c) => c.id)).toEqual(['0.0', '0.1']);
    expect(root?.locked).toHaveLength(1);
    expect(findNode(root, '0.0')?.text).toBe('Save');
    expect(findNode(root, '0.1')?.attributes[0]).toMatchObject({ name: 'disabled', value: { kind: 'boolean', value: true } });
  });

  it('reports pages it cannot edit visually', () => {
    expect(parseDocument('export default function X() {').error).toBeTruthy();
    expect(parseDocument('export const x = 1;').root).toBeNull();
    expect(parseDocument('const App = () => <div />;\nexport default App;').root?.name).toBe('div');
  });

  it('sets, replaces and removes attributes, keeping the rest of the file', () => {
    let code = setAttribute(page, '0.0', 'variant', 'secondary');
    expect(code).toContain('<Button variant="secondary">Save</Button>');
    code = setAttribute(code, '0.0', 'size', 'sm');
    expect(code).toContain('<Button variant="secondary" size="sm">Save</Button>');
    code = setAttribute(code, '0.1', 'disabled', null);
    expect(code).toContain('<Button>Cancel</Button>');
    code = setAttribute(code, '0', 'gap', 5);
    expect(code).toContain('<Stack gap={5}>');
    expect(code).toContain('// A comment that must survive edits.');
  });

  it('edits text content', () => {
    expect(setText(page, '0.0', 'Save all')).toContain('<Button variant="primary">Save all</Button>');
  });

  it('inserts, removes, duplicates and moves elements', () => {
    const inserted = insertElement(page, '0', 99, '<Card>\n  <Text>Hi</Text>\n</Card>');
    expect(inserted).toContain('      {items.map((i) => <span key={i}>{i}</span>)}\n      <Card>\n        <Text>Hi</Text>\n      </Card>\n    </Stack>');
    expect(parseDocument(inserted).root?.children).toHaveLength(3);
    const first = insertElement(page, '0', 0, '<Badge>New</Badge>');
    expect(findNode(parseDocument(first).root, '0.0')?.name).toBe('Badge');
    const removed = removeNode(page, '0.0');
    expect(removed).not.toContain('Save');
    expect(removed).toContain('    <Stack gap={3}>\n      <Button disabled>Cancel</Button>');
    expect(parseDocument(duplicateNode(page, '0.1')).root?.children.map((c) => c.text)).toEqual(['Save', 'Cancel', 'Cancel']);
    const moved = moveNode(page, '0.0', '0', 2);
    expect(parseDocument(moved.code).root?.children.map((c) => c.text)).toEqual(['Cancel', 'Save']);
    expect(moved.id).toBe('0.1');
    const nested = moveNode(page, '0.1', '0.0', 0);
    expect(nested.id).toBe('0.0.0');
    expect(nested.code).toContain('<Button variant="primary">');
    expect(moveNode(page, '0', '0.0', 0).code).toBe(page);
  });

  it('expands self-closing parents when inserting', () => {
    const code = 'export default () => (\n  <div>\n    <Card />\n  </div>\n);\n';
    expect(insertElement(code, '0.0', 0, '<Text>A</Text>')).toContain('    <Card>\n      <Text>A</Text>\n    </Card>');
  });

  it('tracks ids after removal', () => {
    expect(idAfterRemoval('0.2.1', '0.1')).toBe('0.1.1');
    expect(idAfterRemoval('0.0', '0.1')).toBe('0.0');
    expect(idAfterRemoval('0.1.3', '0.1')).toBeNull();
  });

  it('adds imports and instruments elements', () => {
    expect(ensureImports(page, ['Card', 'Button'])).toContain("import { Button, Stack, Card } from '@enterprise-ui/react';");
    expect(ensureImports('export default () => <div />;', ['Card'])).toMatch(/^import \{ Card \} from '@enterprise-ui\/react';/);
    const out = instrument(page, parseDocument(page).root);
    expect(out).toContain('<Stack data-studio-id="0" gap={3}>');
    expect(out).toContain('<Button data-studio-id="0.1" disabled>');
    expect(out).toContain('<span key={i}>');
  });
});

describe('history', () => {
  it('undoes and redoes, grouping rapid typing', () => {
    let h = createHistory('a');
    h = commit(h, 'b', 'visual', 0);
    h = commit(h, 'bc', 'editor', 10);
    h = commit(h, 'bcd', 'editor', 500);
    expect(h.past).toEqual(['a', 'b']);
    h = undo(h);
    expect(h.present).toBe('b');
    h = redo(h);
    expect(h.present).toBe('bcd');
    expect(undo(undo(undo(h))).present).toBe('a');
  });
});

describe('inspector and catalog', () => {
  it('infers widgets from property types', () => {
    expect(widgetFor('boolean')).toEqual({ kind: 'boolean' });
    expect(widgetFor('"primary" | "secondary" | undefined')).toEqual({ kind: 'select', options: ['primary', 'secondary'], numeric: false });
    expect(widgetFor('2 | 3 | 4')).toMatchObject({ kind: 'select', numeric: true });
    expect(widgetFor('number')).toEqual({ kind: 'number' });
    expect(widgetFor('ReactNode')).toEqual({ kind: 'text' });
    expect(widgetFor('(() => void)')).toEqual({ kind: 'code' });
    const groups = groupInspectorProps([{ name: 'onClick', type: '() => void' }, { name: 'disabled', type: 'boolean' }, { name: 'variant', type: '"a"' }]);
    expect([groups.properties, groups.events, groups.states].map((g) => g.map((p) => p.name))).toEqual([['variant'], ['onClick'], ['disabled']]);
  });

  it('builds the palette from the API metadata', () => {
    expect(catalog.length).toBeGreaterThan(100);
    expect(catalog.find((c) => c.name === 'Button')).toMatchObject({ category: 'Buttons', container: false });
    for (const entry of catalog) expect(parseDocument(`export default () => (<div>${entry.snippet}</div>);`).error, entry.name).toBeNull();
    expect(defaultSnippet('Tree')).toContain('nodes={[]}');
    expect(catalog.find((c) => c.name === 'Card')?.container).toBe(true);
  });
});
