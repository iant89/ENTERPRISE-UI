# Contributing to Enterprise UI

Thanks for helping out. This repo uses **GitHub Flow off `main`**.

## Workflow

1. Create a fresh branch from the latest `main`.
2. Branch names:
   - `m3/<ticket>-<slug>` for milestone work (for example `m3/m3-04-repo-health`)
   - `fix/<slug>` for bug fixes
   - `docs/<slug>` for documentation-only changes
   - `chore/<slug>` for tooling, CI and maintenance
3. Open a pull request against `main` using the PR template.
   - PR title format: `[M3-xx] summary` (for example `[M3-04] Add community health files`).
4. PRs are **squash merged**. Do **not** force-push to `main` or rewrite shared history.

## Required checks

These CI jobs (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)) must be green before merging:

- `check`
- `consumer-package`
- `e2e`
- `phase3-browser`

## Merge requirements

A PR may only be merged when **all** of the following are true:

- Tech Lead review is approved
- QA sign-off is recorded
- CI is green (all required checks above)
- **Ian has explicitly approved the merge**

## Running checks locally

Scripts are defined in [`package.json`](package.json):

```sh
npm ci
npm run check            # typecheck + lint + unit tests
npm run lint             # ESLint only
npm test                 # Vitest unit tests
npm run test:e2e         # Playwright end-to-end tests
npm run test:e2e:phase3  # Phase 3 browser tests
npm run test:consumer    # build the library and verify the consumer package
npm run docs:check       # API docs and link checks
npm run build            # library + docs + studio build
```

## Security issues

Please don't open public issues for vulnerabilities; see [SECURITY.md](SECURITY.md).
