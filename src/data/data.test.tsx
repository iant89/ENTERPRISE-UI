import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createInMemoryAdapter, useDataAdapter, type DataAdapter, type DataPage, type DataRequest } from './index';

const rows = [
  { id: 1, name: 'Bolt', category: 'Hardware', quantity: 12 },
  { id: 2, name: 'bolt cutter', category: 'Tools', quantity: 3 },
  { id: 3, name: 'Nut', category: 'Hardware', quantity: 2 },
  { id: 4, name: 'Big bolt', category: 'Hardware', quantity: 1 },
];
const adapter = createInMemoryAdapter(rows, { fields: {
  name: (row) => row.name, category: (row) => row.category, quantity: (row) => row.quantity,
}, searchFields: ['name'] });
const signal = () => new AbortController().signal;
const request: DataRequest = { pagination: { page: 0, pageSize: 1 } };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

describe('data adapters', () => {
  it('filters, searches, sorts and pages without mutating the source', async () => {
    const result = await adapter.load({
      pagination: { page: 1, pageSize: 1 }, search: ' BOLT ',
      filters: [{ field: 'category', operator: 'equals', value: 'Hardware' }],
      sort: [{ field: 'quantity', direction: 'asc' }],
    }, signal());
    expect(result).toEqual({ items: [rows[0]], total: 2 });
    expect(rows.map((row) => row.id)).toEqual([1, 2, 3, 4]);
  });

  it('supports inclusive ordered range filters', async () => {
    const result = await adapter.load({ pagination: { page: 0, pageSize: 10 }, filters: [
      { field: 'quantity', operator: 'gte', value: 2 },
      { field: 'quantity', operator: 'lte', value: 3 },
    ] }, signal());
    expect(result.items.map((row) => row.id)).toEqual([2, 3]);
  });

  it('validates pagination and fields, and honors cancellation', async () => {
    await expect(adapter.load({ pagination: { page: -1, pageSize: 1 } }, signal())).rejects.toThrow(RangeError);
    await expect(adapter.load({ ...request, sort: [{ field: 'missing', direction: 'asc' }] }, signal())).rejects.toThrow('Unknown data field');
    const controller = new AbortController(); controller.abort();
    await expect(adapter.load(request, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('ignores stale results even when an adapter ignores cancellation', async () => {
    const first = deferred<DataPage<number>>();
    const second = deferred<DataPage<number>>();
    const load = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const remote: DataAdapter<number> = { load };
    const nextRequest = { pagination: { page: 1, pageSize: 1 } };
    const { result, rerender } = renderHook(({ query }) => useDataAdapter(remote, query), { initialProps: { query: request } });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    rerender({ query: nextRequest });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(load.mock.calls[0][1].aborted).toBe(true);
    await act(async () => second.resolve({ items: [2], total: 2 }));
    await act(async () => first.resolve({ items: [1], total: 2 }));
    expect(result.current).toMatchObject({ status: 'success', data: { items: [2] } });
  });

  it('preserves stale data on refresh failure and retries', async () => {
    const failure = deferred<DataPage<number>>();
    const load = vi.fn().mockResolvedValueOnce({ items: [1], total: 1 }).mockReturnValueOnce(failure.promise).mockResolvedValueOnce({ items: [2], total: 1 });
    const remote: DataAdapter<number> = { load };
    const { result } = renderHook(() => useDataAdapter(remote, request));
    await waitFor(() => expect(result.current.status).toBe('success'));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('refreshing'));
    await act(async () => failure.reject(new Error('offline')));
    expect(result.current).toMatchObject({ status: 'error', data: { items: [1] }, error: { message: 'offline' } });
    act(() => result.current.retry());
    await waitFor(() => expect(result.current).toMatchObject({ status: 'success', data: { items: [2] } }));
  });

  it('aborts on unmount and handles synchronous adapter errors', async () => {
    const pending = deferred<DataPage<number>>();
    const load = vi.fn((_request: DataRequest, _signal: AbortSignal) => pending.promise);
    const stableAdapter = { load };
    const { unmount } = renderHook(() => useDataAdapter(stableAdapter, request));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    const passedSignal = load.mock.calls[0][1];
    unmount();
    expect(passedSignal.aborted).toBe(true);
    const remote: DataAdapter<number> = { load: () => { throw new Error('bad request'); } };
    const { result } = renderHook(() => useDataAdapter(remote, request));
    await waitFor(() => expect(result.current).toMatchObject({ status: 'error', error: { message: 'bad request' } }));
  });
});
