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

- **Icons:** the library now uses the SAP icon set, stored as SVG files in `src/assets/icons` (704 icons; each file carries its font code point in `data-code` and `data-rtl="flip"` when it mirrors in right-to-left layouts; `SAP-icons.json` keeps the search tags and groups for the docs). The `IconProvider` class serves them: `IconProvider.getIcon('bell', { size, color, title })` returns an icon element, `getIconNames()` lists every name, and icons can also be looked up by `sap-icon://` URI or font code point (`&#xe08d;`); `registerIcon` adds custom icons and `<Icon name="…" />` renders one. Direction-dependent icons mirror in right-to-left layouts. Every `lucide-react` import in the library, examples, docs and Studio was replaced. `lucide-react` stays in `dependencies` and is still available to playground code. The whole icon set is bundled with the library (about 100 kB gzip). A new docs page, Foundations › Icons, shows every icon with search and group filters.
- The Studio initial-download budget (`scripts/check-studio-size.mjs`) is raised from 350 kB to 450 kB gzip for the bundled icon set.
- Added `BarcodeScannerButton`: an icon-only button with the SAP `bar-code` icon that opens `BarcodeScannerDialog` and returns the scanned code.
- Added `FooterToolbar`: a floating page footer for closing and finalizing actions that never scrolls away. It shows only when there are actions, messages or a draft indicator; buttons are text-only or icon-only, right-aligned and sorted by use, so the least-used overflow first.
- Added `Lightbox` and `LightboxImage`: an image at its original size in a dimmed popup (scaled down to fit when larger than the screen), with a zoom-icon thumbnail, a busy indicator after one second, an error message for missing files or loads over ten seconds, and close by button, Escape or a click outside.
- Added `Tag`: a non-interactive label with color schemes 1–10 in a solid and a light set, used for trial, productive and non-productive system tags.
- **Breaking:** `ApplicationHeader` is now a Fiori shell bar. `user` is required and Help and the profile are always shown; `onSettingsClick` adds a Settings entry to the user menu instead of a header button. New: `onBack`, `context` (additional context area with priorities and `onContextVisibilityChange`), `onAssistantClick`, `additionalActions` (with counts), `onHelpClick`, `productSwitchItems` and `labels`. The bar measures its space and collapses search first, then moves actions into an overflow menu (one count, or an attention dot for several), then hides context items by priority and the product name, and finally moves search into the overflow.
- `MaskedInput` follows the Fiori mask input: the mask appears on focus with a `placeholderSymbol` (default `_`), deleting keeps the other characters in place, invalid characters are rejected, pasted text is reformatted, and custom `rules` and backslash-escaped fixed characters are supported. The raw value keeps the placeholder symbol for gaps, and the default placeholder attribute was removed.
- `RangeSlider` has one track with both handles (white pills with direction arrows), end dots, a highlighted range and optional `tickInterval` / `showTickLabels`.
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
- Added data entry components:
  - **Validation:** `useForm` and `validators` (sync and async rules with stale results discarded, cross-field validation, touched and dirty tracking, server errors, and a `field()` binding that accepts value callbacks or events), `FormErrorSummary` (focused, linked errors per WCAG 3.3.1) and `MessagePopover` (Fiori message handling).
  - **Numbers:** `AmountInput` and `QuantityInput`, plus `parseLocaleNumber` and `formatLocaleNumber`. They handle locale separators, currency minor units and unit-of-measure decimals. Ambiguous input such as "1.5" in German is rejected, never guessed. `NumberInput` has an opt-in `locale`.
  - **Grid editing:** `EditableGrid`, with spreadsheet keyboard model, in-cell editors (text, number, select, checkbox, date), per-cell validation, add/duplicate/delete rows and paste of tab-separated blocks.
  - **Value help:** `ValueHelpDialog` and `ValueHelpInput` (F4): local or debounced server search with stale requests aborted, filters, and single or multiple selection.
  - **Specialised inputs:** `MaskedInput`, `PasswordInput`, `OtpInput`, `DurationInput`, `PeriodPicker` (month, quarter, year, fiscal period, ISO week), `TreeSelect`, `TimeZonePicker` and `RecurrencePicker` (RRULE).
  - **Drafts:** `DraftIndicator` with the `useAutosave` hook.
  - **Rich and specialised entry:** `RichTextEditor` (allowlist-sanitized HTML, including pasted content), `SignaturePad` (with a typed alternative), `AddressInput` (per-country layout, postal-code checks, autofill tokens and lookup) and `MentionInput`.
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
