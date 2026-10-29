import { performance } from 'node:perf_hooks';
import { cleanup } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataGrid } from '../../src';
import { renderWithTheme } from '../utils';

// A repeatable DOM-size regression benchmark, not a browser frame-rate benchmark.
const data = Array.from({ length: 3000 }, (_, i) => ({ id: `${i}`, name: `Item ${i}` }));
const columns = [{ id: 'name', header: 'Name', accessor: 'name' as const }];
const measure = (virtual: boolean) => {
  const heapBefore = process.memoryUsage().heapUsed;
  const start = performance.now();
  const result = renderWithTheme(<DataGrid title="Benchmark" columns={columns} data={data} getRowId={(row) => row.id} pageSize={0} searchable={false} virtualization={virtual ? { rowHeight: 40, height: 320, overscan: 3 } : undefined} />);
  const time = performance.now() - start;
  const rowCount = result.container.querySelectorAll('tbody tr').length;
  const heapDelta = process.memoryUsage().heapUsed - heapBefore;
  cleanup();
  return { rowCount, timeMs: Math.round(time), heapDeltaMiB: Math.round(heapDelta / 1024 / 1024) };
};
describe('DataGrid windowing benchmark', () => {
  it('keeps rendered rows bounded compared with an unwindowed 3,000-row grid', () => {
    const baseline = measure(false); const windowed = measure(true);
    console.info('DataGrid DOM benchmark (jsdom, 3,000 rows):', { baseline, windowed });
    expect(baseline.rowCount).toBe(3000);
    expect(windowed.rowCount).toBeLessThanOrEqual(16);
  });
});
