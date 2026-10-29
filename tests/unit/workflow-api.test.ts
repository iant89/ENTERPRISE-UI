import { afterEach, describe, expect, it, vi } from 'vitest';
import { archiveOrders, decidePurchaseOrder, savePurchaseOrder } from '../../examples/workflow-api/purchase-orders';
import { ObjectSaveError } from '../../src/patterns/object-editor';

afterEach(() => vi.unstubAllGlobals());
const signal = () => new AbortController().signal;

describe('example backend contracts', () => {
  it('sends versioned saves and validates the authoritative response', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ value: { id: 'PO/1', supplier: 'Acme' }, version: 'v2' }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const order = { id: 'PO/1', supplier: 'Acme' };
    await expect(savePurchaseOrder(order, 'v1', signal())).resolves.toEqual({ value: order, version: 'v2' });
    expect(fetch.mock.calls[0][0]).toBe('/api/purchase-orders/PO%2F1');
    expect(fetch.mock.calls[0][1].headers['If-Match']).toBe('v1');
    await expect(savePurchaseOrder(order, undefined, signal())).rejects.toMatchObject({ conflict: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('maps conflicts and server field errors while preserving the editor contract', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('', { status: 412 })).mockResolvedValueOnce(new Response(JSON.stringify({ fieldErrors: { supplier: 'Required', invalid: 5 } }), { status: 422 }));
    vi.stubGlobal('fetch', fetch);
    await expect(savePurchaseOrder({ id: '1', supplier: '' }, 'v1', signal())).rejects.toMatchObject({ conflict: true });
    await expect(savePurchaseOrder({ id: '1', supplier: '' }, 'v1', signal())).rejects.toEqual(new ObjectSaveError('Correct the order fields.', { supplier: 'Required' }));
  });

  it('validates bulk responses and propagates authorization errors', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ succeeded: ['1'], failed: [{ id: '2', message: 'Unknown', outcomeUnknown: true }] }), { status: 200 })).mockResolvedValueOnce(new Response('', { status: 403 }));
    vi.stubGlobal('fetch', fetch);
    await expect(archiveOrders(['1', '2'], signal())).resolves.toEqual({ succeeded: ['1'], failed: [{ id: '2', message: 'Unknown', outcomeUnknown: true }] });
    await expect(decidePurchaseOrder('1', 'approve', '', signal())).rejects.toThrow('403');
  });
});
