# Changelog

## Unreleased

### Enterprise UI Studio

- Added Enterprise UI Studio (`/studio`, milestones M0–M2), a browser IDE built into the docs (`docs-dist/studio/`) and opened from the docs navigation or "Open in Studio" on any example. MIT licensed; the library's license is unchanged.
- Code editing: lazy-loaded Monaco with the library's TypeScript types, Prettier formatting (Shift+Alt+F) and a live sandboxed preview in all 7 themes.
- Visual editing: palette generated from the API metadata (drag or Enter to insert), outline, canvas selection, Inspector (Properties, Events, States), move, duplicate and delete, and one undo/redo history for visual and code edits.
- IndexedDB autosave and a single-file Download App.tsx. Single page only for now.
- Studio: projects are now stored in IndexedDB `eui-studio` version 2 (stores `projects` and `meta`). The M2 single-page record migrates to a project named "My application". **Downgrading the Studio after M3 isn't supported:** an M2 build can't open a v2 database, so it shows its starter page and can't save. The v1 record is kept in `meta.v1Backup` and in `projects/current`, so it can be recovered manually (see `studio/README.md`).
- Studio: if browser storage can't be read or opened, autosave and Ctrl+S stop and a notice is shown, so a saved project is never overwritten. "Open in Studio" examples open as a separate new project that is saved only after an edit.

### Library

- Added charts with no chart dependency: LineChart, BarChart (grouped, stacked, horizontal, value labels, reference lines), DonutChart and Heatmap. They share a keyboard model (arrow keys move between points with polite announcements), hover and focus tooltips, a legend for two or more series, direct end labels and a data-table view that is always in the DOM.
- Added micro charts: Sparkline (line, area, bar), BulletChart (actual, target, forecast and qualitative ranges), RadialChart (a `meter`) and ProportionBar (a 100% stacked bar).
- Added `--eui-color-chart-1…7`, `--eui-color-chart-other`, `--eui-color-chart-grid` and `--eui-color-chart-axis`. The series order is validated for color-vision deficiency on the light and dark surfaces, with adjacent CVD ΔE ≥ 15. A single `light-dark()` definition serves the built-in light and dark themes, and high contrast has its own values. The SAP themes are regenerated with the same values, because SAP's `sapChart_OrderedColor` sequence fails the colour-vision check. An eighth series uses the neutral "other" color instead of reusing a hue.
- Added DescriptionList (read-only term/value pairs) and DualListSelector (choose and order a subset between two panes).
- Added enterprise patterns: AnalyticalCard (KPI header, trend, target and deviation over a chart), KanbanBoard (WIP limits, `canMove` transition rules, drag and drop with a full keyboard alternative) and ProcessFlow (document flow across stages, stacking vertically on phones).
- Added dashboard infrastructure:
  - `DashboardCard`: a widget frame with standard loading, error (with Retry), empty and no-access states. It shows "Updated … ago" freshness, flags data older than `staleAfter` as out of date, offers a refresh button that keeps content visible, and announces errors.
  - `ChartContainer`, also available as `DashboardCard chartTools`: switches every chart inside between chart and table and toggles legends. Its download menu offers a PNG or JPEG image (2× resolution, in the current theme, with title and legends) and one CSV of all the charts (with CSV-injection guarding). Full screen measures the available space, so charts fill it and follow window resizes.
  - `RefreshControl`: a refresh button, freshness text and an auto-refresh interval. Auto-refresh pauses in hidden tabs and is not announced.
  - `DashboardFilterProvider`, `useDashboardFilters` and `DashboardFilterBar`: cross-filtering between widgets and a drill-down path. State can be controlled and kept in the URL, filter tokens are removable, and every change is announced.
- Charts: `onSelect` (click, Enter or Space) and `selectedCategory` (dims the other categories) on LineChart, BarChart and DonutChart. A `view` prop shows the data table in place of the plot.
- LineChart and BarChart legends are toggle buttons that hide or show a series (`legendToggle`, `hiddenSeries`, `defaultHiddenSeries`, `onHiddenSeriesChange`). The other series keep their colors, the value axis rescales, stacks re-stack, and the data table and CSV keep every series. The last visible series cannot be hidden.
- Added the `formatRelativeTime` and `useNow` hooks.
- Fixed: the chart gridline and axis tokens now resolve against each theme. They were bright in the dark themes because their `var()` references resolved at `:root`.
- Added `docs/component-gap-analysis.md`, which compares the library with SAP Fiori/UI5, Ant Design, Mantine, PatternFly, Carbon and Tremor and ranks the remaining gaps.

- Documented every component property and redesigned the API reference, with generated API metadata (`scripts/extract-api.mjs`) and a description check (`scripts/check-api-descriptions.mjs`).
- Fixed: a polite screen-reader announcement no longer clears an earlier assertive one before its 7-second window, and pending announcements are cancelled on unmount.
- Fixed: a toast with keyboard focus is no longer auto-dismissed when the pointer leaves it.
- Fixed: Tooltip closes when `disabled` becomes true while it is open.
- Fixed: generated ids contain only `[A-Za-z0-9_-]` (React 19 ids such as `«r1»` are no longer passed through), so they are safe in CSS selectors.
- Fixed: `useMediaQuery` subscribes through `addListener` on browsers without `MediaQueryList.addEventListener` (Safari before 14).
- Fixed: outside-click dismissal recognises popups rendered inside shadow roots.
- Fixed: `getInitials` no longer splits emoji and other astral characters.
- Documentation and comments now consistently use US English spelling (color, behavior, gray) and several typos were corrected.
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
