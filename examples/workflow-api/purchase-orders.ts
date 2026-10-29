import { ObjectSaveError, type ApprovalDecision, type BulkActionResult } from '@enterprise-ui/react';

export interface PurchaseOrder { id: string; supplier: string }
export interface SavedOrder { value: PurchaseOrder; version: string }

/** Illustrative same-origin API contract. The server must authenticate, authorize and validate each request. */
export async function savePurchaseOrder(order: PurchaseOrder, version: string | undefined, signal: AbortSignal): Promise<SavedOrder> {
  if (!version) throw new ObjectSaveError('A current version is required before saving.', {}, true);
  const response = await fetch(`/api/purchase-orders/${encodeURIComponent(order.id)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', 'If-Match': version }, body: JSON.stringify(order), signal,
  });
  if (response.status === 409 || response.status === 412) throw new ObjectSaveError('The order has changed.', {}, true);
  if (response.status === 422) {
    const body: unknown = await response.json();
    const fieldErrors: Record<string, string> = {};
    if (isRecord(body) && isRecord(body.fieldErrors)) {
      for (const [name, value] of Object.entries(body.fieldErrors)) if (typeof value === 'string') fieldErrors[name] = value;
    }
    throw new ObjectSaveError('Correct the order fields.', fieldErrors);
  }
  if (!response.ok) throw new Error(`Save failed (${response.status}).`);
  const body: unknown = await response.json();
  if (!isRecord(body) || !isRecord(body.value) || body.value.id !== order.id || typeof body.value.supplier !== 'string' || typeof body.version !== 'string') throw new Error('Invalid save response.');
  return { value: { id: body.value.id, supplier: body.value.supplier }, version: body.version };
}

/** The server returns an outcome per submitted ID. A rejected request can have an unknown outcome. */
export async function archiveOrders(ids: string[], signal: AbortSignal): Promise<BulkActionResult> {
  const response = await fetch('/api/purchase-orders/archive', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }), signal });
  if (!response.ok) throw new Error(`Archive request failed (${response.status}).`);
  const body: unknown = await response.json();
  if (!isRecord(body) || !Array.isArray(body.succeeded) || !body.succeeded.every((id: unknown) => typeof id === 'string') || !Array.isArray(body.failed) || !body.failed.every((item: unknown) => isRecord(item) && typeof item.id === 'string' && typeof item.message === 'string' && (item.outcomeUnknown === undefined || typeof item.outcomeUnknown === 'boolean'))) throw new Error('Invalid archive response.');
  return { succeeded: body.succeeded, failed: body.failed.map((item: { id: string; message: string; outcomeUnknown?: boolean }) => ({ id: item.id, message: item.message, ...(item.outcomeUnknown ? { outcomeUnknown: true } : {}) })) };
}

/** The caller reloads the authoritative approval status and history after success. */
export async function decidePurchaseOrder(id: string, decision: ApprovalDecision, comment: string, signal: AbortSignal): Promise<void> {
  const response = await fetch(`/api/purchase-orders/${encodeURIComponent(id)}/decision`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, comment }), signal,
  });
  if (!response.ok) throw new Error(`Decision failed (${response.status}).`);
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
