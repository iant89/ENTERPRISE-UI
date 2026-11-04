# Enterprise UI Studio

A browser IDE for building pages with `@enterprise-ui/react`: drag components onto a live canvas,
edit properties in an inspector driven by the generated API metadata, and edit every line in a
Monaco code editor with the library's TypeScript types. Design: [`docs/plans/ide-design.md`](../docs/plans/ide-design.md).

- `npm run dev:studio` starts it on <http://localhost:5174>.
- `npm run build:docs` builds the docs and the Studio; the Studio is published at `docs-dist/studio/`
  and linked from the docs navigation and from every example ("Open in Studio").

The Studio and projects exported from it are MIT licensed (see `LICENSE` and `template/LICENSE`).
The library's own license is not changed by this folder.

## Features (milestones M0–M2)

- **M0, app and delivery:** a separate Vite app (`studio/vite.config.ts`) that shares the sandboxed
  preview build with the docs (`scripts/sandbox-bundle.ts`).
- **M1, code-first editing:** a lazy-loaded Monaco editor with the library's TypeScript declarations
  (autocomplete, diagnostics, folding, find), Prettier formatting, and a live sandboxed preview in
  all 7 themes.
- **M2, visual editing:** a Babel-parsed page model in which edits are text splices, so formatting and
  comments are preserved. A palette generated from the API metadata (drag onto the canvas, or press
  Enter to insert at the selection), an outline tree, canvas selection with drop indicators, an
  Inspector with Properties, Events and States tabs, move up/down, duplicate and delete actions, and
  one undo/redo history for visual and code edits.

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| Ctrl/Cmd+S | Save the project |
| Shift+Alt+F | Format the code with Prettier |
| Ctrl/Cmd+Z | Undo |
| Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y | Redo |
| Alt+Up / Alt+Down | Move the selected element |
| Delete or Backspace (in the outline) | Delete the selected element |
| Enter (in the palette) | Insert the component at the selection |

Inside the code editor, and in form fields, undo and redo are handled by the editor or field itself,
and the move and delete shortcuts don't apply.

## Saving and export

- The project is autosaved in the browser's IndexedDB (see "Saved projects and upgrading from M2").
- **Download App.tsx** downloads the page as a single `App.tsx` file. There is no multi-file or ZIP
  export yet.

## Saved projects and upgrading from M2

Projects are saved in the browser's IndexedDB database `eui-studio`, version 2, which has two stores: `projects` and `meta`.
The first time an M3 build opens a browser that has M2 data, it copies the single M2 page
(the `current` record in the `projects` store) into a project named "My application". The raw M2 value, even an unreadable one, is also
copied to the `meta` store under `v1Backup` as `{ value, migratedAt }`. The original `current` record
stays unchanged in `projects`. Neither copy is ever read again.

**Downgrading to an M2 build is not supported.** M2 opens the database as version 1, so on a v2 database
opening it fails (`VersionError`): the Studio shows its default page and cannot save. To recover the M2 page by hand:

1. Open DevTools → Application (Chrome/Edge) or Storage (Firefox) → IndexedDB → `eui-studio`.
2. Open the `meta` store, select `v1Backup` and copy `value.code`. You can also use the `current` entry in `projects`.
   This is the page source as it was at the upgrade.
   Newer work is in the project records (look for `files["src/App.tsx"]`).
3. Paste the code into the M2 Studio, or into `src/App.tsx` of an exported project.

Deleting the `eui-studio` database removes all saved projects and both copies of the M2 page.

### When saving is unavailable, and examples from the docs

- If browser storage can't be opened (another tab still runs an older Studio version, private mode,
  or a read error), the Studio shows "Couldn't save to browser storage" and **stops autosave and
  Ctrl+S**, so the saved project is never overwritten. Download App.tsx to keep your work, then
  reload.
- If the upgrade had to change anything (unreadable files left out, a missing entry file restored or
  replaced), a dismissible warning explains what changed. The original record is kept in `meta.v1Backup`.
- **Open in Studio** from the docs opens the example as a separate, new project ("Example from the
  docs"). It isn't saved until you edit it, never replaces your saved project, and never becomes
  the project that opens next time: reloading brings back your own project, and **Back to my
  project** in the example strip switches without a reload.
- While storage is down, **Download project files** saves every file as one `<name>.studio.json`
  (`{ name, entry, files }`). ZIP export comes with M3-12.

## Known limits

- Single page only. Multi-file projects, templates and ZIP export/import are planned for M3; test
  runner and accessibility panels for M4.
- The Inspector covers only documented props, so inherited HTML events such as Button `onClick`
  don't appear in the Events tab.
- Elements inside expressions such as `{items.map(...)}` are locked and must be edited in code.

## Tests and size budget

- Unit: `tests/studio/jsx-model.test.ts` (parsing, edits, moves, imports, history, widget inference,
  catalog), `tests/studio/storage.test.ts` (storage v2, migration, project list, tab channel).
- End-to-end: `tests/e2e/studio.spec.ts`.
- Size: `npm run test:studio-size` (after `npm run build:docs`) fails if the initial download goes
  over 350 kB gzip, or if Monaco, the TypeScript worker or Prettier end up in it. Measured at
  `64fcbd0`: 237.1 kB gzip.

## Code Studio (C1: IDE shell)

The Studio has two workspaces that share one project and one undo history. Switch between them with the centred
**Design Studio / Code Studio** switch (a radiogroup, so arrow keys work too). Design Studio stays the default. A project
opens in Code Studio only if its saved layout says so.

### Layout
- **Menu bar:** Project, File, Edit, View, Run and Tools menus wired to existing actions (save, undo/redo, format, download, panel toggles, preview refresh/pause). On the right: undo/redo, download, save state, the Studio theme and Settings.
- **Activity tabs** above the sidebar: Explorer (the file tree, with entry badge and unsaved dots), Search, Components and Docs. Docs has a **Pin** button that moves it into its own column between the editor and the preview. Opening or pinning Docs keeps focus in the editor.
- **Editor tabs** with the Monaco editor. An unsaved tab (not yet written to IndexedDB) shows a dot in place of the close button; hovering or focusing the tab shows the close button. Tabs are announced as "name, unsaved".
- **Preview** with viewport presets, a "W × H · Fit (n%)" label, a preview theme (all seven themes, independent of the Studio theme), density, refresh, pause and fullscreen. When the code doesn't parse, the preview turns **stale**: the last good frame is dimmed and outlined, a warning strip offers Go to error / Retry, and the bottom panel switches to Problems.
- **Bottom panel:** Problems, Console, Tests, Component Docs, Output, Preview Events.
- **Status bar:** problem counts, file, cursor position, language, preview state, theme, save state.

Layout (sizes, collapsed panels, activity, bottom tab, pinned Docs, tablet layout, editor groups and their tabs) is saved per project
behind the `LayoutStore` interface (`studio/src/app/workspace/layout.ts`); since C3 it lives on the project record (see "Layout storage" below). The preview theme and density are saved separately.

### Keyboard
- Splitters: Tab to focus, arrow keys resize (Shift for bigger steps), Home/End go to min/max.
- Ctrl/Cmd+S saves, Shift+Alt+F formats.
- Activity, bottom-panel and editor tabs move with Left/Right arrows. Delete on an editor tab closes it.

### Breakpoints
- **Desktop (≥1280 px):** sidebar, editor, preview and bottom panel are all visible, resizable and collapsible.
- **Tablet (768–1279 px):** icon-only activity tabs that open the sidebar as an overlay, a Split / Editor / Preview layout switch, extra editor tabs collapsed into "+N", and the bottom panel shown as a summary strip.
- **Mobile (<768 px):** four full-screen tabs (Files / Code / Preview / Panel, with a dot on Code while anything is unsaved), menus behind ☰, short switch labels.

### Stubbed until C2–C7
Find-and-replace, compiler, console logs and preview events (C4; stale is currently driven by parse and preview errors), Components and Docs content (C5), Tests (C6) and Settings (C7).

### Shortcuts

| Shortcut | Where | Action |
|---|---|---|
| Ctrl/Cmd+P | Code Studio, everywhere including the editor | Quick Open. Overrides the browser's Print. |
| Ctrl/Cmd+B | Code Studio, everywhere including the editor | Toggle the sidebar. Overrides Monaco's default for this key. |
| Ctrl/Cmd+J | Code Studio, everywhere including the editor | Toggle the bottom panel. Overrides Monaco's default and the browser's Downloads shortcut (Ctrl+J). |
| Ctrl/Cmd+S | Studio | Save now |
| Shift+Alt+F | Studio | Format code |
| F2 | Explorer item | Rename |
| Delete | Explorer item | Delete (a non-empty folder asks first) |
| Shift+F10 / Menu key | Explorer item | Open the context menu |
| Alt+N / Alt+Shift+N | Explorer | New file / new folder |
| Arrow keys, Home/End | Splitters, tabs | Resize / move between tabs |

## Multi-file VFS (C2)

### Explorer file operations
New file, new folder, rename (F2), move (drag-and-drop or **Move to…**), duplicate (`Name-copy.tsx`, then `Name-copy-2.tsx`) and delete, from the context menu or the keyboard. A new folder can be empty: it shows in the Explorer until you add a file to it or leave the page, and it is never saved, because folders only exist through their files. Deleting a non-empty folder asks for confirmation with the file count. The entry file, and any folder holding it, can't be deleted.

### Path rules
Paths are relative to the project root, use `/`, and have no `.`/`..` segments or duplicate slashes. Names use letters, digits, `.`, `_` and `-`, with an allowed extension (`.tsx .ts .jsx .js .css .json .md`). Paths that would leave the project (`../x`), exact duplicates and names that differ only in letter case are rejected with an announced message. See `studio/src/core/vfs/paths.ts`.

### Import rewriting
Renaming or moving a file or folder rewrites relative specifiers in every importer and in the moved files themselves: `import`/`export … from`, `import()`, `require()` and CSS `@import`. Only the specifier text changes, and the extension style (`./A` or `./A.tsx`, folder `index` imports) is kept. Limits:
- Bare and package imports are never touched.
- Template-literal specifiers (`` import(`./x`) ``) are not rewritten.
- A script that doesn't parse is skipped and reported, and so is a relative specifier that didn't resolve before the move. Nothing is guessed.
- Files nothing changed in stay byte-identical.

### Undo
Every operation, including its import rewrites, is one undo step labelled "Rename file", "Move folder", "Duplicate file" and so on. Undo and redo restore the files and the open tabs and switch to the file the step touched. Open tabs and the active file follow renames and moves, and deleting an open file closes its tab.

### Search, Quick Open and Recent files
The logic ships in `core/vfs/search.ts` (literal or regex, case, whole word, result cap, line/column ranges), `core/vfs/fuzzy.ts` (Quick Open ranking) and the store's `recent` list (most recent first, 20 entries, pruned on delete, following renames). 
- **Search activity:** live search (300 ms debounce) with Match case / Whole word / Regex toggles (Alt+C / Alt+W / Alt+R), a Files to include field, and Files to exclude behind the filter toggle (globs: `*`, `**`, `?`, comma-separated). Results are grouped by file with counts, can be collapsed, and open the file at the matching line. The cap is 1,000 results, with a warning strip. An invalid regex shows an inline error. No replace yet.
- **Quick Open (Ctrl/Cmd+P, or File › Quick Open…):** fuzzy file search. Append `:line` to jump to a line. An empty query shows the 10 most recent files with the current one tagged, and each can be removed. Recent files are saved per project in the layout record.
- **Rename/move feedback:** in the Code workspace a bottom-right strip says what changed. Success strips list the rewritten importers under *Show changes*, offer *Undo*, and dismiss after 8 s. Imports that could not be updated (unresolved, dynamic, or `@/`/`~/` aliases) show in a warning strip that stays until dismissed, as file:line links. They also appear in Problems as warnings. The Design workspace keeps its toasts.

### Layout storage
Since C3 a saved project's layout is stored in an optional `layout` field on its IndexedDB project record, written in the same
transaction-safe way as the project (saving code never drops it). A never-saved starter still uses only the
`eui-studio-layout:__unsaved__` localStorage key until its first save, when the layout moves onto the record and the key is removed.
An older `eui-studio-layout:<id>` key is migrated onto the record the first time the project opens, then removed. Deleting a project
deletes its record and so its layout, and orphaned keys are still swept on start.

## Monaco editor: tabs, split and navigation (C3)

Each VFS file has its own Monaco model (`file:///src/…`), so undo history, selection and scroll position are kept per file and
per group, and the TypeScript service sees every file for cross-file navigation. The editor's accessible name follows the active
file: "Code editor, src/Header.tsx", plus ", group 1" or ", group 2" when split.

### Tabs
- Up to 15 open tabs across both groups; opening a 16th closes the least recently used clean tab.
- Tabs that don't fit go into a **⌄ +N** menu, which also has **Close all tabs in group**.
- Middle-click or Delete closes a tab. Drag a tab to reorder it (an insertion bar shows where it lands) or drop it on the other group.
- **Ctrl+Shift+PgUp / PgDn** moves the focused tab left or right, into the other group at the ends; each move is announced.

### Split
- **Ctrl/Cmd+\**, the split button or View › Split editor right opens the current file in a second group (at most two, side by side, desktop only).
- **Ctrl/Cmd+Enter** in Quick Open or on an Explorer file, or **Open to the side** in its context menu, opens the file in the other group.
- Closing a group's last tab collapses the split. The split and its tabs are restored with the project.

### Navigation and refactoring
| Shortcut | Action |
| --- | --- |
| F12 | Go to definition, across files |
| Alt+F12 | Peek definition |
| Shift+F12 | Peek references. **Pin** in the peek header copies them to the **References** tab |
| F2 (editor) | Rename symbol inline: Enter renames, Shift+Enter previews, Esc cancels. F2 in the Explorer still renames the file |
| Shift+Alt+F | Format the active file with Prettier |

A symbol rename across files is one undo step ("Rename symbol"). The result strip lists the edited files, offers **Undo**, and,
when the symbol matches its file's name, **Also rename the file?** (imports are rewritten as for any file rename).

The **References** bottom tab (View › Show References panel) keeps the pinned results grouped by file: arrow keys, Home and End
move through them, Enter opens one, and **Clear** empties the list. The editor theme follows the Studio theme.

## Code Studio preview pipeline (C4)

`module graph → compiler → bridge → sandbox`

- **Module graph** (`src/core/module-graph/`): built from the VFS starting at the project entry (`project.entry`, else `src/main.tsx`, `src/App.tsx`, …). Relative imports (`./`, `../`) resolve exact, then `.tsx/.ts/.jsx/.js/.json`, then `.css`, then `index.*`. Type-only imports are ignored. Nodes carry a content hash; an edit invalidates only that file and its dependents, and every build emits a `graphEvents` change event (C6 catalog invalidation).
- **Supported imports**: project files and these packages only — `react`, `react-dom`, `react-dom/client`, `react/jsx-runtime`, `@enterprise-ui/react`, `lucide-react` (`PACKAGE_ALLOWLIST`). Any other bare import, Node built-in (`node:fs`) or URL is an error; nothing is ever fetched from npm or the network (§9.3).
- **Compiler** (`src/preview/compiler/`): `resolveEntry`, `buildGraph`, `transform`, `compile(files) → { artifact, diagnostics }`. Sucrase per module (TS + JSX, line-preserving), cached by content hash, so only edited modules are re-transformed. CSS imports become style tags in module order. The artifact is deep-frozen and hashed. It is lazy-loaded with Sucrase, outside the initial download.
- **Debounce**: builds run 300 ms after the last edit (`usePreviewBuild(files, entry, { debounceMs })`), and not at all while the preview is paused.
- **Bridge** (`src/preview/bridge/`): `{ source: 'eui-preview', v: 1, type, payload }` messages with a validator per type, shared by Studio, the docs playground and the frame runtime (`docs/src/playground-frame.tsx`). Hosts accept messages only from their frame's window; unknown types, bad payloads and frame messages over 64 kB are dropped. Console arguments are truncated (2,000 chars each, marked `… [truncated]`). The iframe is `sandbox="allow-scripts"` only (opaque origin, never `allow-same-origin`).
- **Problems tab**: one diagnostics shape (`src/core/diagnostics/`) for parser (Sucrase/Babel), TypeScript (Monaco markers), compiler (module graph) and runtime errors; grouped by file, counts in the tab label and status bar; Enter or click opens the location in the focused group.
- **Console tab**: `console.log/info/warn/error`, uncaught errors and unhandled rejections from the preview, with level filter, Clear, a count badge and `path:line` links. Capped at 500 entries; cleared on each successful reload.
- **Stale / last good** (§9.6): a failed build keeps the previous artifact running, dims it with a dashed outline and shows the "Preview is stale" strip (Go to error, Retry). The next successful build returns to Live. A runtime error after a good build shows an overlay with a source link and keeps the artifact.
- **Custom size**: the "W × H · Fit (n%)" label opens a popover: Width and Height (320–3840 × 320–2160 px, validated inline; Apply is disabled when invalid), an aspect-ratio lock, Zoom (Fit/50/75/100%), Reset to Desktop and Apply. Enter applies, Esc closes without changes, and focus returns to the label. The last custom size and zoom are kept per project in the layout (`previewSize`).
