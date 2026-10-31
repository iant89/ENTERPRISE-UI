# Enterprise UI Studio M3: technical design (multi-file projects and templates)

Status: **draft for review** (task M3-01). Nothing here merges without Ian's approval.
Parent plan: [`ide-design.md`](./ide-design.md) §5.1, §5.5, §5.7 and milestone M3. Handoff: [`studio-handoff.md`](./studio-handoff.md).

M3 scope from the plan: virtual file system (VFS), file tree, relative imports in the sandbox, pattern templates, ZIP export and import.

## 0. Decisions

Relayed by the Project Manager from Ian on 2026-10-31.

| # | Decision |
|---|---|
| T1 | Keep the React reducer (`useReducer`); no Zustand |
| T2 | No cross-file selection on the canvas; double-click opens the component's file instead |
| T3 | Text files only in the VFS (no binary assets in M3) |
| T4 | Undo history is not kept after a reload |
| T5 | CI builds an exported ZIP: a new CI job (network access allowed) installs and builds it (task M3-16) |
| T6 | An imported project's `package.json` is kept as-is; export never regenerates an existing one |
| T7 | Keep text splicing in `model/jsx.ts` (no recast) |
| Templates | M3-10 ships six pattern templates: List Report, Object Page, Wizard, Master-Detail, Dashboard, Object Editor |
| New Project dialog | Templates are shown with icons only, no thumbnails |

## 1. Where M0–M2 leaves us (inspected on `main` @ `64fcbd0`)

| Area | Today | M3 consequence |
|---|---|---|
| Project state | `Studio.tsx` holds one `History` (`model/history.ts`) whose `present` is the code of a single page. `STARTER` in `src/template.ts` | Replace the single string with a project of many files |
| Persistence | `src/storage.ts`: IndexedDB `eui-studio` v1, store `projects`, one key `current` holding `{ code, updatedAt }` | Schema v2 plus a migration of `current` |
| Visual model | `model/jsx.ts` parses with `@babel/parser` and edits by **text splicing** (not recast, unlike the plan §5.3). Node ids are child-index paths (`0.1.2`). Only the default export's returned JSX is modelled | The model is per file; it stays as it is. Only the *active* file is shown visually |
| Preview | `studio/src/preview.tsx` imports `docs/src/playground-frame.tsx`. It compiles one module with sucrase (`imports` transform → CommonJS) and resolves `require` from a fixed `modules` map (`react`, `@enterprise-ui/react`, `lucide-react`, `../data`, `./internal/InventoryViews`, `../apps/InventoryApp`). Messages: `init`, `render {code, theme, density, design}`, `scroll`; replies `ready`, `success`, `error`, `layout` | Add a multi-file `render` (module graph) without breaking the docs Playground, which shares this frame |
| Instrumentation | `instrument()` inserts `data-studio-id="0.1"` into the active file before sending it | Ids must be scoped per file once other files render too |
| Editor | `editor/CodeEditor.tsx` creates one Monaco model at `file:///src/App.tsx`; the library types come from `virtual:studio-types` (`build/studio-types.ts`) | One Monaco model per VFS file so the TS worker resolves relative imports |
| Undo | One linear history of the page code, typing grouped in 1 s windows (`GROUP_MS`), limit 200 | Project-level history (see §6) |
| Export | "Download App.tsx" only; `studio/template/` (package.json, README, LICENSE) is not bundled into the app yet | ZIP with fflate (not yet a dependency) |
| Examples | `examples/<slug>/NN-name.tsx`, 172 imports of `@enterprise-ui/react`, plus `../data` (20 files), `./internal/InventoryViews`, `../apps/InventoryApp`. Pattern folders exist: `list-report`, `object-page`, `wizard`, `master-detail`, `dashboard`, `object-editor`. `docs/src/examples.ts` loads them with `import.meta.glob` | Templates come from here, including the shared `examples/data.ts` |
| Open in Studio | `#?code=` decoded by `docs/src/playgroundLink.ts` (`z.`/`u.`/`s.` prefixes) | Keeps working: it creates a one-file project (`src/App.tsx`) |

## 2. Virtual file system and project store

### 2.1 Data model (`studio/src/model/project.ts`, new)

```ts
export type FilePath = string;              // normalised POSIX, no leading slash: 'src/App.tsx'
export interface ProjectFile { path: FilePath; text: string }  // M3 is text-only (decision T3)
export interface Project {
  id: string;                               // crypto.randomUUID()
  name: string;
  files: Record<FilePath, string>;          // the VFS: path -> contents
  entry: FilePath;                          // rendered by the preview, default 'src/App.tsx'
  createdAt: number; updatedAt: number;
  template?: string;                        // e.g. 'examples/list-report/01-basic'
}
```

- A flat `Record<path, text>`; folders are implied by paths (no empty folders in M3; see UX-4).
- Pure functions, no React: `normalize`, `dirname`, `resolveRelative(from, spec)`, `createFile`, `renameFile` (also rewrites relative import specifiers in other files that point at it), `deleteFile`, `listTree`. All are unit-tested.
- Path rules: `[A-Za-z0-9._-]` segments, no `..` escaping the root, case-sensitive but rejects a second path that differs only in case (exported projects must work on macOS/Windows). Allowed extensions in M3: `.tsx .ts .jsx .js .css .json .md`.
- `studio.json` (plan §5.1) holds `{ entry, theme?, density? }` and is generated on export; inside the app those fields live on `Project`.
- Limits: 200 files, 1 MB per file, 10 MB per project (guards IndexedDB and the preview).

### 2.2 Store

Keep React's `useReducer` (no Zustand; nothing in M2 needs it). `StudioApp` state becomes:

```ts
interface StudioState {
  project: Project;          // present
  activePath: FilePath;      // file shown in canvas / editor
  openTabs: FilePath[];
  history: ProjectHistory;   // §6
}
```

Actions: `openFile`, `closeTab`, `editFile(path, text, source)`, `createFile`, `renameFile`, `deleteFile`, `undo`, `redo`, `loadProject`. Existing visual-edit helpers (`insertElement`, `setAttribute`, …) still take and return a string; the reducer applies them to `files[activePath]`. `selectedId` is reset when `activePath` changes.

### 2.3 Persistence (`studio/src/storage.ts`)

- Bump the DB to version 2. Stores: `projects` (key `project.id`, value `Project`) and `meta` (key `lastOpened`).
- `onupgradeneeded` migration: if v1 key `current` exists, wrap its `code` as `{ files: { 'src/App.tsx': code }, entry: 'src/App.tsx', name: 'My application' }`, then delete `current`.
- Autosave stays debounced at 400 ms and writes the whole project (small; simplest). Ctrl+S keeps forcing a save.
- Project list (open, rename, duplicate, delete) per plan §5.7. Delete asks for confirmation (UX-6).
- Multi-tab: two tabs on the same project would overwrite each other. M3 uses a `BroadcastChannel('eui-studio')` notice and shows "This project is open in another tab" (UX-7); no merging.
- Undo history is **not** persisted (decision T4).

## 3. Relative imports in the sandboxed preview

### 3.1 Protocol

Add a message without changing the existing one (the docs Playground keeps sending `render {code}`):

```ts
{ source: 'eui-docs', type: 'render-project',
  files: Record<string, string>, entry: string, theme, density, design: boolean }
```

The frame validates as today (theme and density allowlist, `event.source === window.parent`), plus: `files` is a plain object of strings, `entry` is a key of `files`, total size ≤ 10 MB.

### 3.2 Module loader inside `docs/src/playground-frame.tsx`

- Factor today's `run()` into `compile(path, code)` (sucrase `typescript`, `jsx`, `imports`) and a `require` factory.
- `requireFrom(importer)(spec)`:
  1. Bare spec → the existing `modules` allowlist (`react`, `@enterprise-ui/react`, `lucide-react`). Unknown bare spec → error naming the spec and the importing file.
  2. Relative spec (`./`, `../`) → resolved against `dirname(importer)`; try exact, then `.tsx .ts .jsx .js`, then `/index.tsx`, `/index.ts`. Not found → `Cannot find './Foo' from 'src/pages/Home.tsx'`.
  3. The existing docs-only relative keys (`../data`, `./internal/InventoryViews`, `../apps/InventoryApp`) are consulted **only after** VFS resolution fails, so a project file named `src/data.ts` wins. Templates copy `examples/data.ts` into the VFS anyway (§8), so Studio projects don't depend on these keys.
- Module cache per render: `Map<path, {exports}>`, with the partially filled `exports` returned on a cycle (CommonJS semantics, same as Vite dev for most cases).
- Compile cache across renders keyed by `path + text` (sucrase output), so editing one file recompiles one file.
- `.css` files: injected as `<style data-path>` elements, replaced on each render. `.json`: `JSON.parse`. Other extensions: error.
- Errors carry the file path; the frame sends `{ type: 'error', message, path?, line? }` (sucrase errors include `loc`). Studio uses `path` to open the file (UX-9).
- Security is unchanged: code still only runs in the `sandbox="allow-scripts"` opaque-origin frame, no network imports, bare imports on the allowlist.

### 3.3 Design mode across files

Only the active file is instrumented. Ids are prefixed per file: `data-studio-id="src/pages/Home.tsx#0.1"`, and `Canvas` filters `layout` boxes to the active file's prefix. Elements rendered by other files (for example `<Header />` from `./Header`) appear as one box for the `<Header>` element in the active file; double-click on it opens `Header.tsx` (decision T2, UX-3). If the active file is not reachable from `entry`, the canvas renders the active file itself as the entry when it default-exports a component (UX-2).

### 3.4 Editor (Monaco)

`CodeEditor` gains a `path` prop. Every VFS file gets a Monaco model at `file:///<path>`; models are created, updated (`executeEdits` as today, so cursor and Monaco undo survive) and disposed with the VFS. `typescriptDefaults.setEagerModelSync(true)` is already on, so the TS worker sees all models and relative imports type-check and autocomplete. View state (cursor, scroll) is stored per path when switching tabs.

## 4. Integration with the Babel page model (`model/jsx.ts`)

- No change to the parsing or splice logic. Each file is parsed on demand with the existing `parseDocument`; results are memoised by text.
- Files with no default-exported JSX (`data.ts`, hooks, utils) are "code only": the canvas shows the entry preview without selection, outline shows "This file has no page component" (UX-2).
- `ensureImports` already supports a custom `source`; M3 adds an "Insert component from project" palette group: project files that default-export a component, inserted as `<Name />` with `ensureImports(code, [], …)` extended to default imports (`import Name from './Name'`). Small new helper `ensureDefaultImport`.
- Rename/move rewrites relative import specifiers using `parseModule` to find `ImportDeclaration` / `ExportNamedDeclaration` sources, and the same splice approach.
- Tests: extend `tests/studio/jsx-model.test.ts` style with a VFS round-trip corpus from `examples/` (every example loaded into a VFS and rendered via the new loader in a jsdom unit test).

## 5. Two-way sync

Code remains the source of truth, per file. The sync loop from M2 is unchanged, scoped to `activePath`:

1. Editor change → `editFile(activePath, text, 'editor')` → re-parse (the M2 code re-parses on every commit via `useMemo`; keep that, it is fast for single files) → outline/canvas update; preview render debounced 150 ms (`Canvas.tsx`).
2. Visual edit → splice helper on `files[activePath]` → commit `'visual'` → editor receives the new value through `executeEdits`.
3. Edits to a non-active file (in the editor's other tab) re-render the preview, so a changed `Header.tsx` shows up on the `App.tsx` canvas.
4. Parse error in the active file: keep the last good tree for that file (the `lastGood` ref becomes a `Map<path, StudioDocument>`). Compile error in another file: the preview shows the error strip with the file name.

## 6. Undo history

Plan §5.1 says commands with `{do, undo}`. M2 implemented snapshots of the whole code, which works well and is simple. M3 keeps snapshots but makes them project-wide with structural sharing:

```ts
interface Snapshot { files: Record<FilePath, string>; activePath: FilePath; label: string }
interface ProjectHistory { past: Snapshot[]; present: Snapshot; future: Snapshot[]; lastSource?; lastTime?; lastPath? }
```

- Unchanged file strings are shared between snapshots, so a 200-step history costs roughly the edited text only.
- Every action (edit, create, rename, delete, template insert, ZIP import into the current project) is one step. Typing coalesces as now (1 s window) and only while `path === lastPath`.
- Undo restores `activePath` to the file the step touched, so the user sees what changed (UX-8).
- Inside Monaco, Ctrl+Z still uses Monaco's per-model undo (as today); the toolbar Undo/Redo and Ctrl+Z outside the editor use the project history. This is today's behaviour, extended.
- Loading or importing a whole project resets history (`reset`), like `loadProject` today.
- `history.ts` is retired. It is replaced by the project-wide undo in `store.ts` (M3-04, #25); its undo tests move to the store tests.

## 7. ZIP export and import with fflate

Add `fflate` (MIT) as a devDependency. Load it with `import()` on first use so it stays out of the initial chunk (`scripts/check-studio-size.mjs`, 350 KB budget).

### Export (`studio/src/zip.ts`)

- Template files: bundle `studio/template/**` with `import.meta.glob('../template/**', { query: '?raw', import: 'default', eager: false })`. The template currently has only `package.json`, `README.md`, `LICENSE`; M3 adds the missing runnable files: `index.html`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx` (imports `@enterprise-ui/react` styles and renders `App` inside `ThemeProvider`), `.gitignore`. CI builds an exported ZIP (decision T5, task M3-16).
- Output layout: `<project-name>/` + template files + `src/**` from the VFS + `studio.json`. VFS files win over template files of the same path. If the project already has a `package.json` (for example from an import) it is exported unchanged; the template `package.json` is used only when the project has none (decision T6).
- `zipSync` with `{ level: 6 }`, `mtime` = project `updatedAt`, downloaded via a Blob URL (same as the current `download()`).

### Import

- Input: `.zip` upload (all browsers), and folder pick with `showDirectoryPicker` where available (plan §5.7), else hidden.
- `unzipSync` with a `filter` that drops `node_modules/`, `dist/`, `.git/`, dotfiles other than `.gitignore`, and files over 1 MB; strip a single common top folder.
- Validation: path rules from §2.1, limits (200 files, 10 MB uncompressed; reject when the declared uncompressed size is above the limit to stop zip bombs), UTF-8 decode with `strFromU8`; binary files are skipped and listed in the result (UX-5).
- Entry detection: `studio.json.entry`, else `src/App.tsx`, else the first `src/**/*.tsx` with a default export.
- Import creates a **new project** (no merge into the current one in M3).

## 8. Template loading from `examples/`

- `studio/src/templates.ts` builds a catalog with `import.meta.glob('../../examples/{list-report,object-page,wizard,master-detail,dashboard,object-editor}/*.tsx', { query: '?raw', import: 'default' })` (lazy, not eager, so templates don't grow the initial chunk), plus `examples/data.ts`.
- Titles and descriptions: the examples export `title`/`description` metadata; read them by regex on the raw source (the same fields `docs/src/examples.ts` uses) to avoid eagerly importing modules. Strip the metadata exports with the same rules as `cleanSource`.
- Turning an example into a project: example → `src/App.tsx`; rewrite `'../data'` to `'./data'` and add `src/data.ts` from `examples/data.ts` when referenced; `'./internal/…'` and `'../apps/…'` imports are not supported as templates in M3 (`phase2/inventory.tsx` is excluded).
- Six pattern templates, one per folder (default example in brackets): List Report (`list-report/01-basic.tsx`), Object Page (`object-page/01-basic.tsx`), Wizard (`wizard/01-basic.tsx`), Master-Detail (`master-detail/01-basic.tsx`), Dashboard (`dashboard/01-basic.tsx`, imports `../data`, so it gets `src/data.ts`), Object Editor (`object-editor/01-object-page.tsx`, which exists and uses the library's `ObjectEditor` from `src/patterns/object-editor/`; no new example needs writing).
- "New project" dialog: Blank (`STARTER`) + the six templates, shown as **icons only, no thumbnails** (UX-1). The palette's "Patterns" group can insert a template's JSX into the current page later (M5).
- Unit test: every template turns into a project that the new loader renders without errors (jsdom), and axe passes as `tests/unit/examples.test.tsx` does.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Changing the shared `playground-frame.tsx` breaks the docs Playground | New `render-project` message only; existing `render` path untouched; docs e2e + `tests/e2e/studio.spec.ts` must stay green |
| Two writers to the same file (Monaco tab and visual edit) | Single reducer, single `files[path]` source; Monaco updated via `executeEdits` as in M2 |
| Undo across files confuses users | Undo switches to the affected file and announces it (live region) |
| IndexedDB migration loses an M2 user's page | Migration tested with a v1 fixture in a unit test; on failure keep the old key |
| ZIP bombs / path traversal on import | Size checks before inflate, path normalisation, reject `..` and absolute paths |
| Monaco model leaks with many files | Dispose models on delete and on project switch |
| Bundle budget (350 KB gzip) | fflate, templates and file-tree code are lazy; check with `npm run test:studio-size` |
| Module cycles / ordering differ from Vite | Document CommonJS-style semantics; exported project uses real Vite |
| Text-splice model (no recast) on renamed imports | Rename edits only import string literals by AST offsets; covered by tests |

## 10. Open technical questions

All seven questions from the first draft (Q-T1 to Q-T7) were decided on 2026-10-31; see section 0. No technical questions are open.

## 11. Task breakdown for the Studio Front-End Developer

Sizes: S ≈ 1–3 days, M ≈ 1 week. All tasks: typecheck, lint and unit tests pass; no change to the docs Playground behaviour; Studio initial download within budget.

| # | Task | Scope | Depends on | Acceptance criteria |
|---|---|---|---|---|
| M3-02 | VFS model | `studio/src/model/project.ts`: types, path normalisation, `resolveRelative`, create/rename/delete, import-specifier rewrite on rename | – | Unit tests for path rules, case clashes, `..` rejection, rename rewriting imports in other files |
| M3-03 | Storage v2 + migration | `storage.ts` DB v2, `projects` + `meta` stores, migration from `current`, project list API, BroadcastChannel notice | M3-02 | Unit test (fake-indexeddb or IDB in Playwright) migrates a v1 record; autosave and Ctrl+S still work |
| M3-04 | Project store + history | Reducer in `Studio.tsx` (or `model/store.ts`), project-wide snapshot history generalised from `history.ts` | M3-02 | Existing undo tests updated; new tests for cross-file undo restoring `activePath`, typing coalescing per file |
| M3-05 | Multi-file preview loader | `render-project` message and module loader in `docs/src/playground-frame.tsx`; CSS/JSON; errors with path/line; compile cache | M3-02 | Unit tests: relative + index resolution, missing-module error text, cycle, CSS injection; docs Playground e2e unchanged |
| M3-06 | Canvas per-file instrumentation | Prefixed `data-studio-id`, filter layout boxes, render non-entry active file, double-click to open component file | M3-04, M3-05 | Selection/drag-drop e2e still green; new e2e: edit `Header.tsx`, App canvas updates |
| M3-19 | Inline text editing on canvas | In M3 scope at Ian's request. Static `JSXText` children only (text with `{expressions}` is not editable). Editing happens inside the preview frame with `contenteditable="plaintext-only"`; on Firefox before 136, normal `contenteditable` with formatting stripped. Double-click, or Enter/F2 on the selected node, starts editing. Blur or Enter saves; Escape cancels. Single-line. Empty text saves as an empty element. Escape `{` `}` `<` `>` as `{'{'}` `{'}'}` `&lt;` `&gt;`. Splice only the trimmed core of the text; leading or trailing spaces the user adds are written as `{' '}`. A save is one text splice and one undo step. A hash of the file text is taken when editing starts; if it no longer matches at save, the edit is dropped and a warning MessageStrip shows. The Inspector 'Text content' field saves on blur or Enter instead of every keystroke. Visuals per the Designer's M3-19 spec (`studio-m3-19-inline-text-spec.md`). Owner: FE Dev; tests: QA Engineer. Estimate 3–4 days. Branch from `main` after #26 merges (not from #25) | M3-04 (#25), M3-05, M3-06 | Unit tests for escaping, whitespace `{' '}`, empty text, hash mismatch drop; e2e: double-click edit, Enter/blur save, Escape cancel, single undo step; Firefox fallback covered |
| M3-07 | Monaco multi-model | `CodeEditor` `path` prop, one model per file, dispose, view-state per tab, editor tabs | M3-04 | Go-to-definition and autocomplete across a relative import work in e2e; no model leak on delete |
| M3-08 | File tree UI | Explorer pane (new/rename/delete/move, keyboard, context menu) using EUI `Tree`, per UX spec | M3-04, UX-4 | Keyboard-only create/rename/delete; axe clean in all 7 themes |
| M3-09 | Project list UI | Open/rename/duplicate/delete projects, "New project" dialog shell | M3-03, UX-1, UX-6 | e2e: create two projects, switch, reload, both persist |
| M3-10 | Templates from examples | `templates.ts` (lazy glob) for six templates: list-report, object-page, wizard, master-detail, dashboard, object-editor (all exist in `examples/`); metadata parsing, `../data` rewrite, New-project dialog content with icons only (no thumbnails) | M3-09, UX-1 | Dialog lists Blank + exactly six templates, each with an icon and no thumbnail; unit test turns each of the six into a project and renders it via the loader with no errors; axe passes; Dashboard project includes `src/data.ts` |
| M3-11 | Export template completion | Add `index.html`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `.gitignore` to `studio/template/`. Template files are defaults only: a file already in the project (including `package.json`) is never overwritten or regenerated | – | Template typechecks against local types; a project with its own `package.json` exports it byte-for-byte |
| M3-12 | ZIP export | `zip.ts` with lazy fflate, layout, `studio.json`; template `package.json` only when the project has none, an existing one is exported unchanged | M3-02, M3-11 | Unit test unzips the output and checks the file list, including an unchanged imported `package.json`; e2e downloads a ZIP; size budget passes |
| M3-13 | ZIP / folder import | `unzipSync` with filter, validation, limits, entry detection, new project; File System Access where supported. The imported `package.json` is kept unchanged | M3-02, M3-03, UX-5 | Unit tests: traversal paths, oversized, binary skipped, single top folder stripped; export→import round-trip equals; imported `package.json` is byte-identical |
| M3-14 | Palette: project components | "From this project" group, `ensureDefaultImport` | M3-04 | Inserting `<Header />` adds `import Header from './Header'` once |
| M3-16 | CI job: build an exported ZIP | New job in `.github/workflows/ci.yml` (network allowed): produce a ZIP from a fixture project with the M3-12 code, unzip, `npm install`, `npm run build` | M3-11, M3-12 | Job runs on PRs and fails when the exported project does not install or build |
| M3-15 | E2E + docs | `tests/e2e/studio.spec.ts` M3 flows, README and `ide-design.md` M3 status | all | CI check + e2e green |

Suggested order: M3-02 → (M3-03, M3-04, M3-05, M3-11 in parallel) → M3-06, M3-12 → M3-19 → M3-07 → M3-08, M3-09, M3-13, M3-14 → M3-10 → M3-16 → M3-15.

### Backlog (not M3 scope)

| # | Task | Scope | Acceptance criteria |
|---|---|---|---|
| M3-17 | `npm test` on a fresh clone | `npm test` (`vitest run`) fails when `docs/generated/api.json` is missing (Studio and docs code import it). Add `"pretest": "npm run docs:api"` (`docs:api` = `node scripts/extract-api.mjs`), as `dev`, `typecheck` and `build:docs` already do | On a fresh clone without `docs/generated/`, `npm ci && npm test` passes |
| M3-18 | Studio e2e on Firefox and WebKit | `tests/e2e/studio.spec.ts` runs only via `playwright.config.ts` (projects `desktop` = Desktop Chrome, `mobile` = Pixel 7; CI `e2e` job installs Chromium only). `playwright.phase3.config.ts` has `firefox` and `webkit` projects and the `phase3-browser` job installs them. Run the Studio spec there (or add Firefox/WebKit projects scoped to it) and fix browser-specific failures (e.g. HTML5 drag and drop) | CI runs the Studio spec on Chromium, Firefox and WebKit, all green |

## 12. Items that need UX/UI Designer specs

- **UX-1** "New project" dialog: blank plus six pattern templates, icons only (no thumbnails, decided); spec the icon per template, labels, layout and where the dialog opens from (header button, project list).
- **UX-2** Canvas when the active file is not a page (data/utils) or not reachable from the entry: message, preview the entry, or render the file alone?
- **UX-3** How a component from another project file looks on the canvas (one locked box? badge?) and how to open it.
- **UX-4** File tree: position in the left `nav` (tab beside Components/Outline, or its own pane), new file/folder flows, inline rename, validation messages, empty folders.
- **UX-5** ZIP import result: skipped files report, errors, confirmation before creating a project.
- **UX-6** Project list: location, metadata shown, delete confirmation, duplicate naming.
- **UX-7** "Open in another tab" warning.
- **UX-8** Undo that switches file: announcement wording and visual cue.
- **UX-9** Preview error strip with file name and "Open file" link; Problems panel is M4.
- **UX-10** Editor tabs: dirty/saved indicator (autosave means "saved" nearly always), close behaviour, overflow.
- **UX-11** Export dialog: name the project/ZIP, include tests checkbox (M4), license note (MIT template).
