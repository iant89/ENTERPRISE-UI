# Enterprise UI Studio: handoff notes

Status as of Oct 30, 2026, 7:40 PM EDT, when work was paused on the captain's request. Merge and CI status refreshed Oct 31, 2026.

## Where things stand
- Plan: `docs/plans/ide-design.md` (captain's decisions are recorded there).
- Decisions: folder `/studio`, name "Enterprise UI Studio"; Monaco editor; static page in the docs only; single pages first; MIT license (scoped to `studio/` and `studio/template/`; the library's `package.json` license was not changed).
- Code: commit `dbf74e5` "Add Enterprise UI Studio (milestones M0–M2)", PR #15. Merged to `main` on Oct 30, 2026, 8:22 PM EDT (merge commit `64fcbd0`).
- CI on PR #15: check, consumer-package, e2e and phase3-browser all passed. CI and the GitHub Pages deploy also passed on `main` at `64fcbd0`.

## PR stack (merged)
All three were retargeted to `main` and merged in order on Oct 30, 2026:
1. #13 `qa-cleanup`: 8:21 PM EDT (merge commit `2e7e2d1`)
2. #14 `api-docs`: 8:21 PM EDT (merge commit `5248213`)
3. #15 `studio`: 8:22 PM EDT (merge commit `64fcbd0`)

## What's in the Studio commit
- `studio/src/Studio.tsx`: app shell; `Canvas.tsx`, `Palette.tsx`, `Outline.tsx`, `Inspector.tsx`.
- `studio/src/editor/`: Monaco setup with library types and Prettier formatting.
- `studio/src/model/jsx.ts`: two-way code and visual sync; `history.ts`: undo and redo; `catalog.ts`: palette data from the docs metadata.
- `studio/src/storage.ts`: autosave; `studio/template/`: exported project template.
- Shared preview frame with the docs (`docs/src/playground-frame.tsx`); "Open in Studio" in `docs/src/components/ExampleBlock.tsx`.
- Tests: `tests/studio/jsx-model.test.ts`, `tests/e2e/studio.spec.ts`; size check in `scripts/check-studio-size.mjs`.

## Next steps
1. Check the M0–M2 scope against the plan, especially drag and drop, Inspector edits updating the code, and undo and redo.
2. M3 (multi-file projects, templates, ZIP import and export) has not started yet; the Studio Tech Lead is writing its design. After M3: M4 (testing panels), M5 (polish), per the plan.

## Rules
Nothing merges without Ian's explicit approval. Don't force-push. Keep CI green.
