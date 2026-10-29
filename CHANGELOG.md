# Changelog

## Unreleased

These notes describe work in the current development branch, not a published or stable release.

- Added a transport-neutral data adapter, server-driven DataGrid, filtering controls, saved views and ListReport.
- Added business workflow patterns for bulk operations, object editing, approvals, activity and authoritative audit display. Applications must provide backend authorization and persistence.
- Added command search, fixed-height virtual lists, trees and grid rows, upload queue, structured diff viewer and supporting interface components.
- Added a mock enterprise cookbook, documentation integrity checks, packed React consumer smoke tests and browser interaction checks.
- Improved responsive wizard step names, keyboard access to scroll regions and narrow master–detail focus behavior.
- Added localized command palette messages, locale-aware case matching and explicit dialog portal direction and language.

### Adoption notes and limitations

The package remains a pre-release. Review [migration and release checklist](docs/release-checklist.md), [data-adapter contracts](docs/data-adapters.md), [workflow integration](docs/enterprise-workflows.md), [virtualization and upload limitations](docs/advanced-components.md), and [localization audit](docs/localization-audit.md). Translations, complete RTL support, screen-reader verification and the full browser compatibility matrix are not complete. Virtualized content is absent from the accessibility tree when offscreen. No production backend or authorization system is included. These changes have not been published to npm as part of this work.
