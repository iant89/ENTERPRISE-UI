# Changelog

## Unreleased

- Added BarcodeScannerDialog: camera scanning with a vendored, lazily loaded `@zxing/library` 0.23.0 (Apache-2.0) decoder by default and an opt-in native BarcodeDetector (`decoder`), clear permission/camera/HTTPS error states and manual entry.
- Added roadmap components: Slider, RangeSlider, SegmentedButton, Title, Text, Token, Tokenizer, MultiInput, ResponsivePopover, DynamicDateRange, DynamicPage, DynamicSideContent, FlexibleColumnLayout, HeroBanner, MediaGallery, ProductSwitch, UserMenu, UserSettingsDialog, ViewSettingsDialog, UploadCollection, AIButton and PromptInput.
- Carousel, RatingIndicator, CopyButton, AppBreadcrumbBar and DiffViewer now forward refs and accept `className` and native attributes; added documentation pages for Calendar, DateRangePicker, FilterToken and SavedViews.
- Added composition APIs: CalendarDate, CalendarDateRange and SpecialCalendarDate markers; ListItemStandard, ListItemCustom and ListItemGroup; MenuItem, MenuItemGroup and MenuSeparator; Option, OptionGroup, OptionCustom and ComboBoxItem children for Select and ComboBox; and StepInput. Upstream UI5 behavior is not yet verified.
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
