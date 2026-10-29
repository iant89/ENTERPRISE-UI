# Pre-release checklist (draft)

Do not publish or claim a stable release until the maintainers have approved these items and selected a license and support policy. This is guidance, not evidence that checks were completed.

1. Confirm ownership, license, supported Node/React/browser versions, security reporting, versioning, deprecation and support policy. Do not invent these decisions on behalf of the project owner.
2. Review the public API and release notes; document behavioral and type changes, migration steps and known accessibility, localization, browser and backend limitations.
3. Run `npm ci`, `npm run typecheck`, `npm run lint`, `node scripts/contrast.mjs`, `npm test`, `npm run build`, and `npm run test:consumer`. Record the commit, Node version and results.
4. Run browser suites with installed dependencies: `npx playwright install --with-deps chromium firefox webkit`, `npm run test:e2e`, `npm run test:e2e:phase3`, and `npm run test:e2e:docs`. Review failures and artifacts, not merely the test list. Perform manual keyboard, screen-reader, zoom, reduced-motion, forced-colors, RTL and localization testing on the support matrix.
5. Inspect `npm pack --dry-run` and the actual tarball; install the exact artifact into clean consumer apps using each supported React version and representative bundlers. Verify JS exports, CSS, types, production behavior and upgrades. Consumer smoke tests are representative, not exhaustive.
6. Verify examples, documentation links and deployed docs; review third-party licenses and security advisories. Ensure backend authorization, persistence and audit responsibilities are clear.
7. Only authorized maintainers should publish the verified artifact, tag it, publish release notes, and monitor regressions. Keep a rollback or deprecation plan.

## Migration from source checkout to the 0.1 pre-release

Build the exact revision with `npm ci && npm run build:lib && npm pack`; install that generated tarball in the consumer. Import `@enterprise-ui/react/styles.css` once and wrap the application in `ThemeProvider`. Replace local imports with public `@enterprise-ui/react` exports. Update consumers of any changed controlled-state, data-adapter, selection or async-operation contracts using [data-adapters.md](data-adapters.md), [enterprise-workflows.md](enterprise-workflows.md) and [advanced-components.md](advanced-components.md). Test each application and review breaking changes before deployment. There is no published stable version or guaranteed compatibility policy yet.
