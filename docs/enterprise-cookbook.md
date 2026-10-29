# Enterprise pattern cookbook

These runnable, in-memory examples are available on the documentation site's **Enterprise patterns** page and on their component pages. Mock changes are lost on reload. They are starting points, not production backends.

| Recipe | Source | Main patterns and states |
| --- | --- | --- |
| Purchase-order list report | [example](../examples/list-report/03-purchase-orders.tsx) | Adapter, saved views, filtering, bulk archive, partial failure. |
| Inventory dashboard | [example](../examples/dashboard/02-inventory.tsx) | KPI cards, empty data and a simulated refresh failure with stale data. |
| Customer master–detail | [example](../examples/master-detail/02-customers.tsx) | Customer selection, responsive detail and mobile back navigation. |
| Purchase-order wizard | [example](../examples/wizard/02-purchase-order.tsx) | Step validation, review and mock completion. |
| Approval inbox | [example](../examples/approval-workflow/02-inbox.tsx) | Decision confirmation, failure, retry and an empty inbox. |
| Asset management | [example](../examples/data-grid/03-assets.tsx) | Searchable asset table and empty state. |
| Editable object page | [example](../examples/object-editor/01-object-page.tsx) | Drafts, save, validation and unsaved-change confirmation. |

Run `npm run dev` for the interactive documentation, or `npm test -- tests/unit/cookbook.test.tsx tests/unit/examples.test.tsx` for the rendering and interaction checks. Real applications must implement authorization, persistence, audit history, error recovery, router guards, and localization appropriate to their environment. The approval example simulates service failures; no decisions or audit records are sent to a server.
