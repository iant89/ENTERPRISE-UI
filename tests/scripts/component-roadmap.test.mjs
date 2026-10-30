import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactRoadmap } from '../../scripts/compact-component-roadmap.mjs';

const roadmap = readFileSync('Component-Impl-Roadmap.md', 'utf8');
const requested = JSON.parse(readFileSync('scripts/ui5-requested-components.json', 'utf8'));
const groups = { main: 'Core components', fiori: 'Advanced / Fiori components', compat: 'Compatibility components', ai: 'AI components' };
const sections = ['Description and keyboard interaction', 'TypeScript properties', 'Slots', 'Events', 'Public methods', 'CSS parts', 'CSS custom states', 'Samples', 'Acceptance and possible tests'];

test('all requested components have distinct entries and complete section scaffolding', () => {
  let count = 0;
  for (const [group, title] of Object.entries(groups)) {
    const content = roadmap.split(`## ${title}\n\n`)[1]?.split(/^## /m)[0];
    assert.ok(content, `missing ${group} section`);
    const entries = [...content.matchAll(/^### \[([^\]]+)\]\(([^)]+)\)\n([\s\S]*?)(?=^### \[|(?![\s\S]))/gm)];
    const names = requested[group].split(/\s+/);
    assert.equal(entries.length, names.length, group);
    assert.deepEqual(entries.map((entry) => entry[1]), names);
    for (const [, name, url, body] of entries) {
      assert.ok(url.includes(`/components/${group === 'main' ? '' : `${group}/`}${name}/`), `${group}/${name} URL`);
      assert.match(body, /- Tag: `ui5-[^`]+`/);
      const emptyBlock = body.split('#### Empty documentation fields\n\n')[1] ?? '';
      for (const section of sections) {
        const present = body.includes(`#### ${section}\n`);
        const empty = emptyBlock.split('\n').includes(`- ${section}`);
        assert.notEqual(present, empty, `${group}/${name}: ${section} must be present or listed empty`);
      }
      assert.doesNotMatch(body, /None listed in the pinned manifest; inherited or runtime behavior requires verification\.|No component-specific playground samples listed in the pinned samples index/);
      if (emptyBlock) assert.ok(!emptyBlock.includes('#### '), `${group}/${name}: empty fields must be last`);
      assert.match(body, /- \[ \] Test|- \[ \] Verify/);
    }
    count += entries.length;
  }
  assert.equal(count, 183);
  assert.equal(compactRoadmap(roadmap), roadmap, 'the roadmap should already be compacted');
});

test('records a concrete playground and does not conflate core and compat tables', () => {
  assert.match(roadmap, /## Playground parsed: Avatar \/ Basic/);
  assert.match(roadmap, /<Avatar initials="FJ" \/>/);
  assert.ok(roadmap.includes('https://ui5.github.io/webcomponents/components/Table/'));
  assert.ok(roadmap.includes('https://ui5.github.io/webcomponents/nightly/components/compat/Table/'));
  assert.match(roadmap, /\| `click` \| `CustomEvent` \| true \| false \|/);
});


test('compacts blank and placeholder sections without losing meaningful content', () => {
  const input = `# Roadmap

### [Example](https://example.com)

#### Description and keyboard interaction

#### Slots

None listed in the pinned manifest; inherited or runtime behavior requires verification.

#### Events

| Name | Description |
| --- | --- |
| click | Useful |

#### Samples

No component-specific playground samples listed in the pinned samples index; check parent examples and the linked documentation.

#### Acceptance and possible tests

- [ ] Test click

## Summary
`;
  const actual = compactRoadmap(input);
  assert.ok(actual.includes('#### Events\n\n| Name'));
  assert.ok(actual.includes('#### Empty documentation fields\n\n- Description and keyboard interaction\n- Slots\n- Samples\n\n## Summary'));
  assert.ok(!actual.includes('#### Slots\n'));
  assert.equal(compactRoadmap(actual), actual);
});
