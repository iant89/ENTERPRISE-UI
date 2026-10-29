# Examples

Each folder holds runnable examples for one component page of the documentation site. The folder name matches the page slug.

- Every file default-exports a React component. The documentation renders it live and shows its source as the usage example.
- A file can also export these optional metadata fields:
  - `title`
  - `description` (inline code in backticks is supported)
  - `frame` (render the preview without padding)
- `data.ts` holds the shared sample business data.
- `apps/InventoryApp.tsx` is a complete application built only from library components. It is shown on the Layouts page and at `#/demo`.

Examples import from `@enterprise-ui/react`, which resolves to `src/` during development. `tests/unit/examples.test.tsx` renders every example and checks it with axe-core.
