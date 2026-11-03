# Component gap analysis

This document compares Enterprise UI with the component sets of other design systems used for business software. It records what the comparison added to the library and ranks what is still missing. It was last updated in November 2026.

## Method and sources

The survey covered the component sets of six systems:

- SAP Fiori and UI5 Web Components for React, including the chart package and the Fiori micro chart guidelines.
- Ant Design 5.
- Mantine, including `@mantine/charts`.
- PatternFly.
- Carbon and Carbon for IBM Products.
- Tremor, a React dashboard kit.

The documentation sites could not be fetched from the build environment because of its network policy. The comparison is therefore based on web search results and on prior knowledge of these libraries. Before acting on any item that depends on a vendor's current API, check that vendor's documentation.

Relevant findings:

- **UI5 Web Components for React charts are deprecated.** The `@ui5/webcomponents-react-charts` package will be discontinued with v3 because it is not backed by SAP global design or accessibility specifications. It contained BarChart, BulletChart, ColumnChart, ColumnChartWithTrend, ComposedChart, DonutChart, LineChart, PieChart, RadarChart, RadialChart and ScatterChart. A Fiori-style library therefore cannot rely on that package for charts, which makes its own accessible chart set more valuable.
- **Fiori micro charts** each have a narrow job:
  - Bullet: actual versus target and forecast at one point in time.
  - Harvey ball: one value against its total.
  - Radial: a single percentage.
  - Delta: the difference between two values.
  - Comparison: labelled parts compared with each other.
  - Stacked bar: parts of a whole.
  - They are non-interactive apart from an optional click. For interactive analysis, Fiori uses the analytical card.
- **Mantine charts** add BarsList, RadialBarChart, FunnelChart, BubbleChart, BulletChart and CandlestickChart to the usual area, bar, line, donut and pie charts.
- **Tremor** offers small dashboard visualizations: BarList, CategoryBar (a 100% stacked bar), Tracker (status blocks), DeltaBar, ProgressCircle and spark charts.
- **Ant Design 5** includes Transfer, Cascader, Descriptions, Statistic, Result, Tour, Watermark, QRCode and Splitter.
- **PatternFly** includes a dual list selector (recommended over a select list from about 20 options), a notification drawer, a description list and a log viewer.
- **Carbon for IBM Products** includes a Tearsheet, a side panel, a Coachmark, a Datagrid and EditInPlace.

## What this round added

| Gap | Added | Comparable in |
| --- | --- | --- |
| No charts at all | `LineChart`, `BarChart`, `DonutChart`, `Heatmap` | UI5 charts (deprecated), Mantine charts, Carbon Charts |
| No micro charts (MetricCard had a private sparkline) | `Sparkline`, `BulletChart`, `RadialChart`, `ProportionBar` | Fiori micro charts, Tremor spark charts and CategoryBar |
| No chart palette | `--eui-color-chart-1…7`, `-other`, `-grid`, `-axis` | Carbon and Fiori categorical palettes |
| No overview-page card | `AnalyticalCard` | Fiori analytical card |
| No stage or board view | `KanbanBoard` | Carbon, Atlassian and Jira boards |
| No document-flow view | `ProcessFlow` | Fiori ProcessFlow |
| No transfer list | `DualListSelector` | Ant Transfer, PatternFly dual list selector |
| No read-only facts list | `DescriptionList` | Ant Descriptions, PatternFly description list |

### Chart design decisions

- **No dependency.** The charts are SVG built from design tokens, which keeps the single runtime dependency (`lucide-react`). All of the chart code, styles included, is under 2,000 lines, while Recharts or ECharts would add several hundred kilobytes for features most business screens do not use.
- **Accessibility.**
  - Each chart is a focusable `group` with `aria-roledescription="chart"`.
  - The arrow keys move between data points and every move is announced politely.
  - A data table with the same values is always in the DOM. "Show table" makes it visible.
  - Two to four line series are labelled at their ends, so color is never the only cue.
- **Color.**
  - Series hues are assigned in a fixed order and never cycled; an eighth series uses the neutral "other" color.
  - The order was chosen with a palette validator. Every adjacent pair has a colorblind ΔE of at least 15 against the light, dark and Fiori 3 dark surfaces, and every hue has 3:1 contrast.
  - The existing `--eui-color-accent-*` order put orange next to green (protan ΔE 4.9), so the charts do not use it.
- **Theming.** Chart tokens use CSS `light-dark()`, so they resolve from each theme's `color-scheme`, and custom themes inherit the right steps. High contrast has its own values. The SAP themes write the library palette explicitly, through `scripts/generate-sap-themes.mjs`. SAP's own `sapChart_OrderedColor_*` sequence puts olive next to amber in Horizon (deutan ΔE 3.0), and no reordering of SAP's eleven colors did better than the library palette when all pairs were checked.
- **One value axis.** There is no dual-axis option. Two measures on different scales belong in two charts.

## Dashboard round

A follow-up compared dashboards with Fiori overview pages, Grafana, Power BI and Tremor. Before it, `Dashboard` was a responsive grid and `DashboardWidget` set only a column span. Added:

| Gap | Added |
| --- | --- |
| No standard widget states | `DashboardCard`: loading, error with Retry, empty and no access; "Updated … ago" with an out-of-date flag; refresh that keeps content visible |
| No chart frame | `ChartContainer` and `DashboardCard chartTools`: chart or table view, legend toggle, CSV download, full screen with charts resized to fill it |
| No refresh model | `RefreshControl`: manual refresh, auto-refresh intervals that pause in hidden tabs, and announcements for manual refreshes only |
| No interaction between widgets | `DashboardFilterProvider`, `useDashboardFilters` and `DashboardFilterBar`; chart `onSelect` and `selectedCategory` for cross-filtering and drill-down |

Still open for dashboards:
- Rearrangeable and personalizable layouts, persisted through the `SavedViews` adapter.
- Chart annotations.
- Dashboard export (PDF/PNG) and shareable filtered links.
- A TV / kiosk mode.

## Data entry round

The library already covered basic entry: inputs, selects, date and time pickers, uploads and InlineEdit. What it lacked were the heavier patterns ERP screens depend on. All three tiers were added:

| Tier | Added |
| --- | --- |
| P1 | `useForm` + `FormErrorSummary` + `MessagePopover`; `AmountInput` / `QuantityInput` with locale parsing; `EditableGrid`; `ValueHelpDialog` / `ValueHelpInput` |
| P2 | `MaskedInput`, `PeriodPicker`, `TreeSelect`, `DurationInput`, `TimeZonePicker`, `RecurrencePicker`, `PasswordInput`, `OtpInput`, `DraftIndicator` / `useAutosave` |
| P3 | `RichTextEditor`, `SignaturePad`, `AddressInput`, `MentionInput` |

Design decisions:
- **Numbers are never guessed.** Grouping separators are accepted only between groups of three digits, so "1.5" typed in German is an error rather than 15.
- **One validation model for fields and grids.** EditableGrid reports its errors through `onValidationChange`, so the same summary and popover can show field and line-item problems together.
- **The editor is deliberately small.** RichTextEditor uses the browser's editing commands and an allowlist sanitizer, and is suited to notes and comments. Documents with tables, images or collaboration should use a dedicated editor.
- **Every pointer-only input has an alternative.** SignaturePad has a typed mode, and EditableGrid paste has keyboard entry.

Still open: EditableGrid virtualization and undo/redo, and screen reader and touch verification of the new components.

## Roadmap patterns round

| Gap | Added |
| --- | --- |
| Planning calendar | `PlanningCalendar`: resource rows over day, week and month; stacked overlaps; drag to move or resize with a full keyboard alternative (M, arrow keys, Enter / Escape); `canChange` and locked appointments. Dependencies between bars (a full Gantt) are still open. |
| Tour / Coachmark | `Tour` and `Coachmark`: non-modal anchored cards with a spotlight, focus moved to each step and restored at the end, and a centered fallback for missing targets. |
| Dashboard strips | `KpiStrip`, `RankedBarList` and `StatusHistory` (a tracker of status blocks with height cues and a counted legend). |

## Remaining gaps, ranked

The priority reflects how often each item is needed in ERP, inventory, fleet and admin screens, and how hard it is to build well outside the library.

### P1: build next

| Component or pattern | Why it matters | Reference |
| --- | --- | --- |
| **Import wizard pattern** | Upload a CSV or Excel file, map columns, validate rows with inline fixes, preview, and import with partial-success reporting. It can compose Wizard, FileUploader, DataGrid and BulkActionBar. | Carbon ImportModal, Salesforce data import |
| **ScatterChart and ComboChart** | Scatter shows correlation (price against volume, lead time against defect rate). ComboChart is bars and a line on one shared axis, for example actual bars against a plan line. These are the two chart forms most often asked for after this round. | UI5 ScatterChart and ComposedChart, Mantine |

### P2: valuable

| Component or pattern | Notes |
| --- | --- |
| **Delta and comparison micro charts** | Fiori delta (difference between two values) and comparison (labelled bars). BarChart with `layout="horizontal"` and `valueLabels` partly covers comparison; a compact variant without axes would fit tables. |
| **Funnel and Waterfall charts** | Funnel for pipeline conversion; Waterfall for finance bridges such as budget to actual. |
| **Treemap** | Hierarchical part-to-whole, for spend by category and supplier. |
| **Cascader** | Selection from a hierarchy, such as a material group or cost center tree. ComboBox and Tree cover part of this today. |
| **Tearsheet** | A large modal workspace between a Dialog and a page, for creation flows. DetailPanel `overlay` is close but narrower. |
| **LogViewer / CodeSnippet** | Virtualized, searchable logs and copyable code for integration and admin screens. VirtualList and CopyButton exist to build on. |
| **Result page** | Success and failure end states after a flow. EmptyState covers some of this. |

### P3: niche or covered elsewhere

| Item | Status |
| --- | --- |
| Accordion | `Panel` is collapsible; a grouped single-open variant is a small addition. |
| Splitter | Covered by `ResizablePanel` and `SplitView`. |
| Statistic | Covered by `MetricCard`. |
| Notification drawer | Covered by `NotificationCenter`. |
| QRCode, Watermark, Mentions | Low reuse in data-heavy business screens; leave to applications. |
| Rich text editor | Needs a large editing engine. Document an integration recipe instead of shipping one. |
| Radar and pie variants | Radar charts are hard to read; a pie is available through `DonutChart variant="pie"`. |
| Network or org chart | Valuable but needs a layout engine; consider it only with a concrete consumer. |

## Follow-up verification

- Add the chart pages to the Playwright visual and axe suites (`tests/e2e/visual.spec.ts`, `a11y.spec.ts`), including forced-colors mode.
- Test chart announcements with VoiceOver and NVDA. The live-region model is verified only in jsdom and Chromium.
- Add the chart tokens to `scripts/contrast.mjs` so the 3:1 contrast of each hue against its surface is checked for every theme.
- Decide whether `MetricCard` should use the public `Sparkline` instead of its private copy.
