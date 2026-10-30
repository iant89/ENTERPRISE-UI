# Enterprise UI Studio: handoff notes

Status as of Oct 30, 2026, 7:40 PM EDT. Work was paused on the captain's request.

## Where things stand
- Plan: `docs/plans/ide-design.md` (captain's decisions are recorded there).
- Decisions: folder `/studio`, name "Enterprise UI Studio"; Monaco editor; static page in the docs only; single pages first; MIT license (scoped to `studio/` and `studio/template/`; the library's `package.json` license was not changed).
- Code: branch `studio`, commit `dbf74e5` "Add Enterprise UI Studio (milestones M0–M2)", PR #15 (base `api-docs`). Not merged.
- CI on PR #15: check, consumer-package and e2e passed; phase3-browser was still running when paused.

## PR stack (merge in order, only with the captain's approval)
1. #13 `qa-cleanup` -> main
2. #14 `api-docs` -> qa-cleanup (retarget to main after #13)
3. #15 `studio` -> api-docs (retarget after #14)

## What's in the Studio commit
- `studio/src/Studio.tsx`: app shell; `Canvas.tsx`, `Palette.tsx`, `Outline.tsx`, `Inspector.tsx`.
- `studio/src/editor/`: Monaco setup with library types and Prettier formatting.
- `studio/src/model/jsx.ts`: two-way code and visual sync; `history.ts`: undo and redo; `catalog.ts`: palette data from the docs metadata.
- `studio/src/storage.ts`: autosave; `studio/template/`: exported project template.
- Shared preview frame with the docs (`docs/src/playground-frame.tsx`); "Open in Studio" in `docs/src/components/ExampleBlock.tsx`.
- Tests: `tests/studio/jsx-model.test.ts`, `tests/e2e/studio.spec.ts`; size check in `scripts/check-studio-size.mjs`.

## Next steps
1. Confirm phase3-browser passes on PR #15; fix it if it fails.
2. Check the M0–M2 scope against the plan, especially drag and drop, Inspector edits updating the code, and undo and redo.
3. Then M3 (multi-file projects, ZIP import and export), M4 (testing panels), M5 (polish), per the plan.

## Rules
Nothing merges without the captain's explicit word. Don't force-push. Keep CI green.
