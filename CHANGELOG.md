# Changelog

## Unreleased

- Added React adaptations for calendar markers, list and menu composition, select and combo-box items, slider, range slider, step input, segmented button and responsive popover. Upstream UI5 behavior is not yet verified.
- Added DataGrid message overrides, locale-sensitive local search, and explicit direction and language for grid popups.
- Added localized pagination messages and number formatting with RTL chevrons; DataGrid can pass pagination translations.

These notes describe work in the current development branch, not a published or stable release.

- Added a transport-neutral data adapter, server-driven DataGrid, filtering controls, saved views and ListReport.
- Added business workflow patterns for bulk operations, object editing, approvals, activity and authoritative audit display. Applications must provide backend authorization and persistence.
- Added command search, fixed-height virtual lists, trees and grid rows, upload queue, structured diff viewer and supporting interface components.
- Added a mock enterprise cookbook, documentation integrity checks, packed React consumer smoke tests and browser interaction checks.
- Stop spinner and indeterminate progress animation when reduced motion is requested, and fail contrast checks on missing theme tokens.
- Improved responsive wizard step names, keyboard access to scroll regions and narrow master–detail focus behavior.
- Added bulk action message overrides and portaled confirmation direction and language.
- Added localized file upload queue messages and accessible progress labels.
- Added localized inline-edit and clipboard action and status messages.
- Added localized notification messages, plural-aware counts, accessible action names, and timestamp display formatting.
- Added localized command palette messages, locale-aware case matching and explicit dialog portal direction and language.

### Adoption notes and limitations

The package remains a pre-release. Review [migration and release checklist](docs/release-checklist.md), [data-adapter contracts](docs/data-adapters.md), [workflow integration](docs/enterprise-workflows.md), [virtualization and upload limitations](docs/advanced-components.md), and [localization audit](docs/localization-audit.md). Translations, complete RTL support, screen-reader verification and the full browser compatibility matrix are not complete. Virtualized content is absent from the accessibility tree when offscreen. No production backend or authorization system is included. These changes have not been published to npm as part of this work.
