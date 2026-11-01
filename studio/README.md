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
