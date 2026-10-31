# Enterprise UI Studio: design plan

Status: **approved** by the captain on 2026-10-30. Implementation of M0–M2 (the MVP) is on the `studio` branch.

## 0. Decisions

| # | Question | Decision |
|---|---|---|
| 1 | Name and URL | `/studio`, named **Enterprise UI Studio** |
| 2 | Code editor | **Monaco** (lazy-loaded, behind an `EditorAdapter`) |
| 3 | Hosting | **Static page inside the docs only** (`docs-dist/studio/`); no npm package or desktop app |
| 4 | MVP scope | **Single pages first**; routing and data come later |
| 5 | License | **MIT** for the Studio and for exported projects, scoped to `studio/LICENSE` and the export template. The library's `package.json` license field is left unchanged |

## 1. Goal

A browser-based WYSIWYG IDE for building web applications with `@enterprise-ui/react`:

- drag components from a palette onto a visual canvas;
- edit every file in a proper code editor with syntax highlighting, autocompletion, line numbers and formatting;
- preview live in any of the 7 themes;
- run tests and accessibility checks;
- save, export and launch from the docs.

## 2. What exists today (inspected)

| Area | Current state | What the Studio reuses |
|---|---|---|
| Docs | Vite app in `docs/` (`docs/vite.config.ts`, `base: './'`, output `docs-dist/`), hash router, deployed to GitHub Pages by `.github/workflows/pages.yml` | Hosting, theme settings (`eui-docs-theme`), navigation |
| Playground | `docs/src/pages/PlaygroundPage.tsx` with a textarea editor, and a sandboxed `playground-frame.html` that compiles code with **sucrase** and renders it in an iframe (`postMessage`). It now runs whole example modules and accepts code from `#/playground?code=` (`docs/src/playgroundLink.ts`) | The preview sandbox, the message protocol and the code-link format |
| API metadata | `scripts/extract-api.mjs` writes `docs/generated/api.json`: 160 components and 19 hooks, with props (type, default, required, description), events, states and CSS variables. `ApiTables.tsx` groups these into Properties, Events and States | Palette, inspector and autocompletion hints |
| Examples | 181 examples in `examples/**`, loaded with `import.meta.glob` | Starter snippets and templates |
| Types | `build:lib` emits `.d.ts` files into `dist/` | Typings for the editor's language service |
| CI | `.github/workflows/ci.yml` runs check (typecheck, lint, contrast, unit, docs:check), consumer-package, e2e (Chromium), and phase3-browser (3 browsers plus the docs audit) | New Studio jobs plug into the existing jobs |

## 3. Folder, build and deployment

- **Folder:** `/studio` at the repo root (name open, see Q1). It is a separate Vite app with its own `studio/vite.config.ts` and `studio/index.html`.
- **Packaging:** keep it in the single root `package.json` (no workspaces) so there is one `npm ci` and the existing tooling keeps working. Studio-only dependencies are devDependencies, so they never reach library consumers. Check this with the existing `test:consumer` job.
- **Scripts:**
  - `dev:studio` and `build:studio`. The build writes to `docs-dist/studio/`, so Pages deploys both apps from one artifact with no workflow change beyond the build step.
  - `build:docs` triggers `build:studio`, or `pages.yml` runs both.
- **Library source:** Studio imports `@enterprise-ui/react` through the same source alias the docs use, so it always matches the current code.
- **Shared code:** the preview runtime (`playground-frame`), theme list and api.json move to a small shared module, `docs/shared/` or `studio/shared/`, so the docs and the Studio don't drift.

## 4. Launching from the docs

- A "Studio" item in the docs navigation, plus a "Build an app in Studio" button on the home page and in the Playground header. It links to `./studio/`.
- **Open in Studio:** a second action next to "Open in Playground" in each example, or a menu item in the Playground. It reuses the `?code=` format, so `studio/#/new?code=z.…` creates a new project from the example. The Playground stays as the lightweight single-file tool.
- The docs theme and density are passed along (`&theme=sap-horizon-dark`).

## 5. Architecture

```
┌────────── Studio shell (EUI components: AppShell, SplitView, Tabs, Toolbar) ─────────┐
│ Palette │ Outline tree │        Canvas / Code editor (tabs, split)       │ Inspector │
│         │              │                                                  │ (Props/   │
│         │              │  sandboxed preview iframe  ◀── postMessage ──▶  │  Events/  │
│         │              │                                                  │  States)  │
├──────────────────────────── Bottom panel: Problems │ Tests │ Accessibility │ Console ─┤
└────────────────────────────────────────────────────────────────────────────────────────┘
State: project store (virtual file system) ─▶ document model per file (AST) ─▶ undo/redo history
```

### 5.1 Project and virtual file system

- A project is a map from path to contents (`src/App.tsx`, `src/pages/*.tsx`, `src/*.test.tsx`, `studio.json`).
- It lives in a single store, Zustand or a plain reducer. Zustand is MIT-licensed, about 1 KB and optional.
- Every change is a command (`{ do, undo }`), which gives undo/redo across visual and code edits. Text edits inside the editor use the editor's own history; switching files or making a visual edit records a checkpoint.

### 5.2 Code editor: Monaco vs CodeMirror 6

| | Monaco (VS Code editor) | CodeMirror 6 |
|---|---|---|
| TS autocompletion and type errors | Built-in TS worker; load the library's `.d.ts` with `addExtraLib` and it works immediately | Needs `@valtown/codemirror-ts` or a hand-made TS worker with `@typescript/vfs` |
| Syntax highlighting, line numbers, folding, minimap, multi-cursor | All built in | Built in except the minimap, added through extensions |
| Bundle size | Large (about 3–5 MB including workers); needs worker config in Vite | Small and modular (about 300–600 KB plus the TS worker if used) |
| Accessibility | Good screen-reader mode; keyboard focus traps need care | Strong a11y focus; plain DOM; easier to theme |
| Theming to 7 EUI themes | Theme JSON per theme, mapped from tokens | CSS variables, so EUI tokens apply directly |
| Mobile | Weak | Good |
| License | MIT | MIT |

**Recommendation: Monaco** for the IDE. "VS Code-grade" TypeScript completion against the library's real types is the core feature, and Monaco gives it with the least custom code. Load it lazily, only when the code view opens, so the visual canvas starts fast. The plan keeps the editor behind a small `EditorAdapter` interface (open, change, markers, format, setTheme) so switching to CodeMirror 6 later is contained.

- **Formatting:** Prettier standalone with the TypeScript and Babel plugins, run in a worker (MIT). Format on demand (Shift+Alt+F) and optionally on save.
- **Linting (later):** surface TS diagnostics in the Problems panel first; ESLint in the browser is optional and comes later.

### 5.3 Visual canvas and two-way sync

- **Source of truth is the code.** Each `.tsx` file is parsed with `@babel/parser` (typescript and jsx), MIT, into an AST. The visual model is a view of the JSX tree in the file's default-exported component.
- **Visual edits** (insert, move, delete, change a prop) are AST transforms applied with **recast**, which reprints only the changed nodes so the user's formatting and comments survive. Prettier then runs on the changed range. Each JSX node gets a stable id from its source location, re-mapped after each edit.
- **Code edits:** the file is re-parsed with a debounce (about 300 ms), and the outline and canvas update. On a parse error the canvas keeps the last good tree and shows a banner.
- **Editable vs locked nodes:** only JSX elements whose tag is an EUI component or an intrinsic element are visually editable. Expressions such as `{items.map(...)}`, conditionals or spread props show as locked "code blocks" with an "Edit in code" link. This keeps the round-trip honest.
- **Canvas rendering:** the canvas is the preview iframe running in "design mode".
  - The Studio's compile step passes the code through a Babel plugin that adds `data-studio-id` attributes to EUI elements.
  - The iframe draws selection and hover outlines and drop indicators, and reports hits back over `postMessage`.
  - Real components render exactly as they do in production.
- **Drag and drop:**
  - From the palette to the canvas or outline: HTML5 drag plus pointer fallbacks, through the iframe overlay.
  - Within the outline: `@dnd-kit` (MIT), whose keyboard sensor gives accessible reordering.
  - Every drag has a keyboard alternative: "Insert…" command, arrow keys to move, Ctrl+X and Ctrl+V.
  - Containment rules (for example `TabItem` only inside `Tabs`) come from a small hand-curated `studio/catalog.ts` layered over api.json.

### 5.4 Palette, outline and inspector

- **Palette:** generated from `api.json` and grouped by the docs categories, with search. Each entry has a default insert snippet taken from the first example of that component, or a curated snippet. There are also pattern templates (List Report, Object Page, Wizard, Master-Detail) built from `examples/`.
- **Outline:** a `Tree` of the JSX model with keyboard navigation, rename-free, and context menu actions (wrap in, duplicate, delete, move up and down).
- **Inspector:** reuses the `groupProps` logic from `ApiTables.tsx`.
  - **Properties tab:** widgets are inferred from the TS type: string literal unions become a `Select` or `SegmentedButton`, `boolean` a `Switch`, `number` a `NumberInput`, `string` an `Input`, and `ReactNode` and functions become "Edit in code".
  - **Events tab:** creates a handler stub in the component and jumps to it in the editor.
  - **States tab:** toggles state props (for example `disabled`, `loading`, `invalid`) or lets you preview them.
  - Descriptions and defaults come from the JSDoc that is already in api.json.

### 5.5 Live preview sandbox

- Reuse `playground-frame` and generalise it to multiple files: a module graph compiled with sucrase in the iframe, with relative imports resolved from the virtual file system and bare imports from a fixed allowlist (`react`, `@enterprise-ui/react`, `lucide-react`; more by request).
- It keeps the `sandbox="allow-scripts"` isolation, an origin check and the existing theme and density whitelist.
- Error overlay; console capture into the Console panel.
- **Device widths:** desktop, tablet and phone presets, plus a cozy/compact toggle.

### 5.6 Testing workflows

- **Tests panel:** runs `*.test.tsx` files from the project in a second hidden sandbox iframe.
  - The runner is a small in-browser, Jest-compatible harness (`describe`, `it`, `expect`) built on `@vitest/expect` (MIT) and `@testing-library/react` with `user-event` (MIT).
  - Full Vitest in the browser expects a Node or Vite server and isn't practical on static Pages, so it is out of scope for in-IDE use.
- **"Generate test"** creates a starter Testing Library test for the selected component (render, find by role, click).
- **Accessibility panel:** runs `axe-core` (MPL-2.0, already used in CI through `@axe-core/playwright`) against the preview in the current theme or across all 7 themes. Violations link back to the canvas node and the code line.
- **Exported projects** include a real `vitest` and Playwright setup, so the same tests run in the user's own CI.

### 5.7 Persistence and export

- Projects autosave to IndexedDB (`idb-keyval`, Apache-2.0, or plain IDB), with a project list, rename, duplicate and delete.
- **Export ZIP** (`fflate`, MIT): a ready-to-run Vite and React project (`package.json` with `@enterprise-ui/react`, `vite.config.ts`, `src/`, tests).
- **Import ZIP or folder:** File System Access API where it is available, upload otherwise.
- **Share link:** the existing compressed `?code=` hash for small single-file projects.

### 5.8 Themes, shortcuts and the IDE's own accessibility

- The Studio UI is built with EUI itself and follows the docs theme picker (all 7 themes). The preview theme can be set separately from the IDE theme.
- The Monaco theme is generated from EUI tokens for each theme.
- **Command palette** (EUI `CommandPalette`, Ctrl/Cmd+K or Ctrl/Cmd+Shift+P). Default shortcuts:

  | Action | Shortcut |
  |---|---|
  | Save | Ctrl+S |
  | Undo / redo | Ctrl+Z / Ctrl+Shift+Z |
  | Format | Shift+Alt+F |
  | Run tests | Ctrl+; |
  | Toggle code/design | Ctrl+\` |
  | Quick open file | Ctrl+P |
  | Delete node | Del |
  | Move node | Alt+↑/↓ |

  Shortcuts are listed in a help dialog and don't override screen-reader keys.
- **Accessibility of the IDE itself:**
  - Landmarks and regions for each panel, with F6 to cycle between them.
  - Every drag has a keyboard equivalent.
  - Live-region announcements for inserts and moves and for test results.
  - Visible focus, and an axe run in CI over the Studio's own pages in every theme.
  - The goal is WCAG 2.2 AA, matching the library.

## 6. Dependencies and licenses

All are permissive and compatible with publishing. They are devDependencies or Studio-only, never library runtime dependencies.

| Dependency | Purpose | License |
|---|---|---|
| monaco-editor (+ vite worker config) | Code editor | MIT |
| prettier (standalone + plugins) | Formatting | MIT |
| @babel/parser, @babel/traverse, @babel/types, recast | AST and two-way sync | MIT |
| sucrase (already present) | Fast in-iframe compile | MIT |
| @dnd-kit/core, sortable | Accessible drag and drop | MIT |
| @vitest/expect, @testing-library/react / user-event (TL already present) | Tests panel | MIT |
| axe-core (already present via @axe-core/playwright) | A11y panel | MPL-2.0 (file-level copyleft; unmodified use is fine) |
| fflate | ZIP export | MIT |
| idb-keyval (optional) | IndexedDB | Apache-2.0 |
| zustand (optional) | State store | MIT |

Third-party notices are added to the Studio's "About" dialog and its build output. Nothing goes into `vendor/`, and existing license files are untouched.

## 7. CI impact

- `check` job: typecheck and lint cover `studio/`, `studio/**` unit tests run in Vitest (AST transforms, sync round-trips, inspector type inference, VFS, encode/decode), and `build:studio` runs. Adds about 1–2 minutes.
- e2e job: a new `tests/studio/*.spec.ts` Playwright project (Chromium) covers:
  - drag a Button onto the canvas, then check the code updates;
  - edit code, then check the canvas updates;
  - change a prop in the inspector;
  - format, run tests, export;
  - axe across the 7 themes.

  Adds about 3–5 minutes. Firefox and WebKit smoke checks join phase3-browser later.
- Bundle-size budget check for the Studio entry: Monaco is lazy-loaded, and the shell stays under about 500 KB gzip.
- `pages.yml`: adds `build:studio` (or it is chained from `build:docs`).

## 8. Milestones (MVP first)

Sizes: S ≈ 1–3 days, M ≈ 1 week, L ≈ 2+ weeks, for one engineer.

| # | Milestone | Scope | Size |
|---|---|---|---|
| M0 | Skeleton | `/studio` Vite app, shared runtime extraction, docs nav link, Pages deploy, CI build and smoke e2e | S |
| M1 | **MVP: code-first IDE** | Monaco with EUI types (autocomplete, diagnostics, line numbers), Prettier, single-file project, live preview in 7 themes, IndexedDB autosave, "Open in Studio" from examples | M |
| M2 | **MVP: visual editing** | Babel/recast model, outline tree, selection overlay in the preview, palette drag-drop and keyboard insert, inspector Properties tab, undo/redo, two-way sync with locked nodes | L |
| M3 | Multi-file and templates | VFS, file tree, relative imports in the sandbox, pattern templates, ZIP export and import | M |
| M4 | Testing workflows | Tests panel (in-browser runner + Testing Library), Generate test, A11y panel with axe across themes, Problems panel | M |
| M5 | Polish | Events and States inspector tabs, containment rules, command palette and shortcuts help, device presets, share links, IDE a11y audit, cross-browser e2e | M |

The MVP is M0–M2, about 4–5 weeks.

## 9. Risks

- **Two-way sync fidelity:** arbitrary user code can't always be shown visually. Mitigation: code is the source of truth, non-trivial expressions are locked nodes, recast keeps formatting, and there is a large round-trip test corpus built from the 181 examples.
- **Monaco size and workers in Vite:** lazy loading, a manual worker setup and a size budget. Fallback through the `EditorAdapter` to CodeMirror 6.
- **TS language service cost:** loading the full `.d.ts` bundle (about 160 components) may be slow. Ship one pre-bundled `index.d.ts` built at Studio build time.
- **Sandbox security:** user code runs in the sandboxed iframe only. Bare imports stay on a strict allowlist, with no network imports in the MVP.
- **Testing in the browser:** this is a subset of Vitest semantics. Exported projects get real Vitest for full fidelity.
- **Scope creep:** routing, data binding, backend and state management are explicitly out of scope until after M5 (see Q4).
- **Maintenance:** the palette and inspector depend on api.json, so the JSDoc quality enforced by `check-api-descriptions` becomes a product dependency.

## 10. Open questions

All five questions were answered on 2026-10-30; see section 0.
