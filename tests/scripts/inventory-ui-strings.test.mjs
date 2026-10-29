import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inventory, scan } from '../../scripts/inventory-ui-strings.mjs';

test('finds JSX, accessible labels, default messages and dynamic message templates', () => {
  const items = inventory(`import x from './other';
    type Choice = 'visible' | 'hidden';
    const message = 'No records found.';
    const status = \`Saved \${count} records.\`;
    export function Demo() { return <button aria-label="Close dialog" title={'Details'} className="layout-class">Save</button>; }
  `);
  assert.deepEqual(items.map(({ kind, text }) => [kind, text]), [
    ['literal', 'No records found.'], ['literal', 'Saved ${count} records.'],
    ['attribute', 'Close dialog'], ['attribute', 'Details'], ['jsx-text', 'Save'],
  ]);
  assert.deepEqual(items.map(({ line }) => line), [3, 4, 5, 5, 5]);
});

test('scans production component sources in stable order without test files', () => {
  const result = scan();
  assert.ok(result.some(({ file, text }) => file.endsWith('DataGrid.tsx') && /select/i.test(text)));
  assert.ok(result.every(({ file }) => !/\.(?:test|spec)\.[jt]sx?$/.test(file)));
  assert.deepEqual([...new Set(result.map(({ file }) => file))], [...new Set(result.map(({ file }) => file))].sort());
});
