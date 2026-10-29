# Localization and accessibility audit

The library is not yet fully localizable or verified for right-to-left use. Do not represent it as production-ready for translated or RTL applications without an application-specific audit. This report records an initial source review; it is not a complete string inventory.

## Findings

- Many components and patterns contain English labels and live announcements without override props. Examples include DataGrid selection and settings, FileUploader validation and progress, NotificationCenter, ApprovalWorkflow, ObjectEditor and BulkActionBar. `CommandPalette` supports translated labels, empty messages, locale-sensitive case matching, and explicit portal direction and language; see [advanced-components.md](advanced-components.md#commandpalette-localization). `Dialog` also accepts a close label, direction and language. Translate accessible names, errors, status messages and confirmation dialogs as well as visible text when adding localization support.
- Some controls accept `locale`, and ApprovalWorkflow, ActivityFeed and AuditTrail format dates with `Intl`; DateRangePicker uses browser-native date inputs; this does not translate their labels. Applications own currency, number and business text formatting. Date-only values and time zones require explicit policy.
- CSS logical properties are used in parts of the library, but physical `left`, `right` and positioning remain, particularly in overlays, controls, layout and virtualization. Merely setting `dir="rtl"` is not proof of RTL compatibility. Mixed-direction identifiers should use explicit isolation (`bdi`/`dir="auto"`) where appropriate.
- Long labels can wrap, truncate or overflow depending on the component; fixed-height virtualization clips content by design. Check translated content at narrow widths and both densities. RTL focus order, arrow keys, scroll position and overlays need cross-browser and assistive-technology testing.
- Automated axe and token contrast checks do not test actual screen-reader speech, all states or WCAG conformance. The application is responsible for its own landmarks, route-focus management, labels, permissions and custom content.

The localized CommandPalette example is covered by unit tests and compact-layout desktop/mobile Chromium checks, including long Arabic labels, mixed-direction text and focus restoration. This is representative coverage, not a library-wide RTL audit; Firefox, WebKit and screen readers have not been verified locally.

## Recommended completion work

Design and implement a consistent typed message catalog/provider with per-component overrides and pluralization; inventory all visible and accessible strings, including live messages; migrate physical layout to logical properties where suitable; add automated RTL, bidirectional text and long-label coverage plus manual testing with supported browsers and screen readers. Translate the documentation separately. See [release-quality.md](release-quality.md) and [advanced-components.md](advanced-components.md) for validation scope and virtualized alternatives.
