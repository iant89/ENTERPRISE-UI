import type { DataAdapter, DataPage } from '@enterprise-ui/react';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

/** Example API: POST /api/inventory/query with a DataRequest JSON body. */
export const inventoryAdapter: DataAdapter<InventoryItem> = {
  async load(request, signal) {
    const response = await fetch('/api/inventory/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!response.ok) throw new Error(`Inventory request failed (${response.status})`);
    // Validate untrusted API responses at the application boundary in production.
    return await response.json() as DataPage<InventoryItem>;
  },
};
