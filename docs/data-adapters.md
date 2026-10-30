# Data adapter foundation

`DataAdapter<T>` separates data loading from the UI and transport. A request contains a zero-based `pagination` page and positive page size, optional ordered sort rules, ANDed filters and a global search string. A response contains the current page and the total number of matching records before pagination. Field names and their meaning are application-defined. Adapters should reject unsupported fields or operators rather than silently return misleading results. The in-memory adapter supports `equals`, case-insensitive `contains`, and inclusive `gte`/`lte` filters (numbers or lexically ordered strings such as ISO dates); search is trimmed and case-insensitive. Sorting is stable, respects the order of sort rules, and places nullish values last.

```tsx
import { useMemo, useState } from 'react';
import { createInMemoryAdapter, useDataAdapter, type DataRequest } from '@enterprise-ui/react';

const inventory = [{ id: '1', name: 'Bolt', quantity: 12 }];
const adapter = createInMemoryAdapter(inventory, {
  fields: { name: item => item.name, quantity: item => item.quantity },
  searchFields: ['name'],
});

function Inventory() {
  const [page, setPage] = useState(0);
  const request = useMemo<DataRequest>(() => ({ pagination: { page, pageSize: 10 } }), [page]);
  const result = useDataAdapter(adapter, request);
  return <section>
    {result.status === 'loading' && <p>Loading…</p>}
    {result.status === 'refreshing' && <p>Refreshing (showing previous results)…</p>}
    {result.status === 'error' && <p>Could not load data. <button onClick={result.retry}>Retry</button></p>}
    {result.data && <ul>{result.data.items.map(item => <li key={item.id}>{item.name}</li>)}</ul>}
    <button onClick={() => setPage(p => p + 1)}>Next page</button>
  </section>;
}
```

Memoize both the adapter and request: changing either reference triggers a new load. The hook exposes `loading`, `refreshing`, `success`, and `error` states and a `retry` function. During refresh or after an error it retains the previous successful page, which may belong to an older query; applications should label it as stale and avoid treating it as the current result. A replacement request or unmount aborts the previous signal. Results and errors from superseded requests are ignored even if the adapter does not support cancellation. Retrying does not automatically back off or classify errors.

For a transport example see [`examples/data-adapter/rest.ts`](../examples/data-adapter/rest.ts). It illustrates a JSON POST contract; the server must implement and validate that contract, enforce authorization, and return `{ items, total }`. Production applications should validate response bodies, decide which filters and sort fields are allowed, and handle authentication and error messages. Neither the adapter nor the hook performs authorization. The in-memory adapter copies the input array at creation but does not deep-clone items; create a new adapter when the collection changes.

## DataGrid server mode

Pass `server` to render a supplied page without client-side filtering, sorting, or slicing. Its page is **one-based**, while `DataRequest.pagination.page` is zero-based. The application controls page, page size and column filters via `server`, and controls search and sort through the existing `search`, `onSearchChange`, `sort` and `onSortChange` props. Reset the page to 1 when changing the query or page size. Map column IDs to the server's allowed field names. The server returns a total count after filtering. Set `stale` while displaying an older page and supply an `error` node with a retry action when appropriate; use `loading` for the initial load, not for refreshing stale rows. See the working [inventory example](../examples/phase2/inventory.tsx).

Always provide `getRowId` with a stable, unique ID for paged or changing data. Select-all affects the currently rendered page only; selection IDs persist across pages until cleared. Application code is responsible for authorization and for validating selections against current backend data. Column visibility can be controlled using `visibleColumnIds` and `onVisibleColumnIdsChange`. With `resizableColumns`, the Column widths panel offers keyboard-operable sliders (80–600 px) that set widths and minimum widths; browser table layout may expand a column further. Widths are currently local to the grid and are not part of saved view configuration.

## Other Phase 2 controls

`DateRangePicker` emits ISO local calendar dates, with both endpoints inclusive. An empty string is an open boundary. Its native date inputs use browser locale and keyboard behavior; preset labels are configurable, while other labels currently use English. Presets are clamped to `min` and `max`; supply valid ISO dates with min no later than max. Applications must reject an invalid draft before applying it; `isDateRangeValid` validates ISO dates, ordering and bounds. For timestamps, convert an inclusive end date to the start of the following day in the intended time zone and use an exclusive upper bound; don't add 24 hours across daylight-saving transitions. The inventory example composes the picker and `FilterTokenGroup` with `FilterBar`; it keeps draft and applied values separate. `FilterTokenGroup` delegates individual removal and clear-all to its owner.

`SavedViews` is controlled by the application. It delegates save, rename, delete and selection, including default-view selection, to the host; `SavedViewPersistence` is an optional transport-neutral interface. The saved configuration carries filters, search, sort, grouping, visible columns and page size. `createInMemorySavedViewPersistence` is a volatile example with one default per scope; `getDefaultSavedView` prefers a personal default over a shared default. The inventory example demonstrates loading a default, saving, selecting, renaming, setting a default, deleting, and applying supported fields to the grid. It supports a single sort and does not apply grouping: applications must define their own mapping and persistence for those features. `canModify` and `canSaveShared` are UI affordances, not security controls. Shared-view ownership, conflict handling, confirmation, persistence and authorization belong to the application/backend.

## Large data strategy and limitations

Use server pagination to bound rendered rows today. The grid does not virtualize rows; virtualization is planned separately and must preserve selection, keyboard navigation and accessibility, with measured performance tests and a non-virtualized alternative. Cursor pagination is not included. The inventory example wires saved views to its query explicitly; the grid does not automatically apply arbitrary saved configurations.

## ListReport foundation

`ListReport` composes `FilterBar`, `FilterTokenGroup`, and an adapter-backed `DataGrid`, managing search, single-column sorting and page navigation. The application owns the applied `filters` array and filter controls; the report removes individual tokens or clears the array through `onFiltersChange`. Use a stable filter-array reference between changes, and provide a stable adapter and `getRowId`. Column IDs must match adapter field names. The [ListReport example](../examples/list-report/01-basic.tsx) demonstrates the contract. The `header` slot can host `SavedViews`. Use the controlled `view` and `onViewChange` props to capture and restore search, one sort rule, visible columns and page size; applied filters remain controlled separately. See the [saved-view example](../examples/list-report/02-saved-views.tsx). Applications map `SavedViewConfiguration` to those two states and own persistence, authorization and default selection. Grouping and multiple sort rules are not supported by ListReport. Without a controlled `view`, the report manages these settings itself; `pageSize` supplies its initial size. Query changes reset paging to the first page before loading.

Selection can be controlled with `selectedIds` and `onSelectionChange`, and `selectionMode` can explicitly enable single or multiple selection. Select-all operates on the current page; selected IDs persist across pages and queries until cleared. Results may be stale during refresh or after an error, so applications should check current records and permissions before executing bulk actions. See the [enterprise workflow guide](enterprise-workflows.md) for bulk actions and other patterns.

## Localizing DataGrid

Use `messages` for built-in search, filter, selection, settings, empty and stale-data text; `paginationMessages` and `paginationLabel` customize its pagination. Translate column headers, filter option labels, rendered cells, row labels and server errors in the host. `locale` controls case conversion for local substring search; it is not accent-insensitive or a complete linguistic search, and server search remains host-owned. Pass `dir` and `lang` when the grid and its portaled menus need a direction or language different from their surrounding theme layer. See the [localized grid example](../examples/data-grid/04-localized.tsx). This is representative support, not a guarantee that every layout, assistive-technology or RTL scenario is verified.
