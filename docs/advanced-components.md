# Advanced components: integration notes

## VirtualList

`VirtualList` is a fixed-height, single-column listbox. Supply unique, stable item IDs and a positive `itemHeight` matching the rendered row. Selection is controlled by `selectedIds` and `onSelectionChange`. Arrow keys and Home/End move the active item; Space or Enter toggles it. Do not put interactive descendants in listbox options. `virtualized={false}` renders all rows as an alternative for environments where windowed listbox semantics are unsuitable. Test your specific browser and screen-reader combinations. Variable-height rows are not supported. `VirtualTree` uses the same fixed-height window calculation and `TreeNode` data contract; its keyboard behavior excludes Tree type-ahead and sibling expansion. DataGrid offers its own table-aware row windowing. Use pagination or server-side filtering for very large datasets where client-side processing itself is costly.

## DataGrid windowing

Set `virtualization={{ rowHeight: 40, height: 320, overscan: 3 }}` and supply a stable `getRowId`. Row height must be at least 32 CSS pixels; cells are clipped to a fixed height, so do not use wrapped or variable-height content. Windowing is disabled in stacked responsive mode. The selection header still selects the entire current page, not merely the rendered rows. Focused rows remain mounted when scrolling, and Up/Down move between rows; Tab and Shift+Tab move to adjacent rows across window boundaries for standard focusable controls. Offscreen rows are not in the accessibility tree. For assistive technology workflows requiring the full table or native Tab traversal, omit `virtualization` and use pagination. Test with your browser and screen readers; desktop and mobile Chromium checks pass, while Firefox, WebKit, and screen-reader verification remain outstanding.

Run `npm test -- tests/unit/datagrid-benchmark.test.tsx` for the repeatable jsdom DOM-size regression measurement. On one local run with 3,000 one-cell rows it rendered 3,000 baseline rows versus 12 windowed rows, with approximate render times of 751 ms and 24 ms and heap deltas of 61 MiB and 4 MiB respectively. Those numbers are single noisy jsdom observations, not browser, retained-memory, or frame-rate benchmarks; garbage collection and machine load affect them. No time or heap threshold is enforced. Benchmark realistic cells, scrolling and accessibility in target browsers before deployment.

## CommandPalette localization

Supply `title`, `searchLabel`, `resultsLabel`, `defaultGroupLabel`, `recentLabel`, `emptyMessage` and `closeLabel` to translate built-in text, including accessible names and the empty-result announcement. Translate command labels, groups, descriptions and keywords in the host. `locale` is an optional valid BCP 47 locale used for case conversion in search; matching is substring-based, not accent-insensitive or full linguistic search. Set `dir` and `lang` on the palette when its portal should differ from the document or theme layer; an ancestor around the trigger does not necessarily apply to the portal. Labels and descriptions are direction-isolated, and keyboard shortcut hints are displayed left-to-right. See the localized example; this support does not imply other components are fully localized or RTL-ready.

## FileUploader

The queue runs one upload at a time; implement `upload(file, { signal, onProgress })` using your own transport. Progress is a fraction from 0 to 1. Client-side size and type checks are usability aids, not security validation. Authorize and validate content on the server. An aborted or rejected request can still have been processed by the server; cancellation is not rollback and retry is hidden by default; set `retrySafe` only if the application uses idempotency or checks server state. The example uses a mock and does not send files anywhere. A transport that ignores AbortSignal may continue running after cancellation.

## DiffViewer

Use `compareDiffValues` with acyclic JSON-shaped data (null, booleans, numbers, strings, arrays, and plain objects). Objects are traversed recursively; arrays are compared as whole values; paths use JSON Pointer escaping. Missing values and null are distinct. To preview editor changes, compare the `baseline` and `value` exposed to ObjectEditor's render function. For audit records, use `AuditTrail.renderChanges` to render a DiffViewer using only authoritative changes returned by the audit service. Review sensitive data before displaying it; neither component performs redaction.

## Supporting components

InlineEdit manages a temporary draft while the host owns persistence, concurrency checks and the controlled value; rejected saves preserve the draft. NotificationCenter is controlled and does not deliver or persist notifications. OverflowMenu and AppBreadcrumbBar compose existing accessible primitives. PermissionGate only controls presentation; it must never replace server-side authorization. CopyButton reports clipboard failures, including when the browser does not grant access.
