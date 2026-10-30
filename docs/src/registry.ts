/** Documentation metadata for every component page. Props tables come from docs/generated/api.json. */

export type Category = 'Layout' | 'Navigation' | 'Buttons' | 'Forms' | 'Data display' | 'Feedback' | 'Patterns';

export const categories: { id: Category; description: string }[] = [
  { id: 'Layout', description: 'Application frame and layout primitives.' },
  { id: 'Navigation', description: 'Move between pages, views and actions.' },
  { id: 'Buttons', description: 'Trigger actions with the right emphasis.' },
  { id: 'Forms', description: 'Labelled, validated data entry controls.' },
  { id: 'Data display', description: 'Tables, lists, trees and business objects.' },
  { id: 'Feedback', description: 'Dialogs, messages and progress.' },
  { id: 'Patterns', description: 'Higher-level enterprise floorplans composed from components.' },
];

export interface KeyboardRow {
  keys: string;
  action: string;
}

export interface ComponentDoc {
  slug: string;
  name: string;
  category: Category;
  summary: string;
  /** Components whose props are documented on this page. */
  components: string[];
  /** Examples folder (defaults to slug). */
  examples?: string;
  keyboard?: KeyboardRow[];
  a11y: string[];
  /** Related pages. */
  related?: string[];
}

const k = (keys: string, action: string): KeyboardRow => ({ keys, action });

export const docs: ComponentDoc[] = [
  { slug: 'calendar', name: 'Calendar', category: 'Forms', components: ['Calendar'], summary: 'A standalone month grid for selecting one date.', keyboard: [k('Arrow keys', 'Previous / next day or week'), k('Page Up / Page Down', 'Previous / next month'), k('Enter / Space', 'Selects the date')], a11y: ['A `grid` labelled by the visible month; each day has a full date label.', 'Today is marked with `aria-current="date"`.'], related: ['date-picker', 'calendar-legend'] },
  { slug: 'date-range-picker', name: 'DateRangePicker', category: 'Forms', components: ['DateRangePicker'], summary: 'Start and end date inputs with quick presets.', a11y: ['Native date inputs are grouped and labelled.', 'Localize the preset labels.'], related: ['date-picker'] },
  { slug: 'filter-token', name: 'FilterToken', category: 'Forms', components: ['FilterToken', 'FilterTokenGroup'], summary: 'Removable applied-filter tokens.', a11y: ['Each remove button names the filter it removes.', 'The group is a labelled region.'], related: ['filter-bar'] },
  { slug: 'saved-views', name: 'SavedViews', category: 'Data display', components: ['SavedViews'], summary: 'Select and manage application-persisted views.', a11y: ['Uses native controls; persistence errors are announced.', 'Permissions are UI hints only; enforce authorization on the backend.'], related: ['list-report'] },
  { slug: 'slider', name: 'Slider', category: 'Forms', components: ['Slider'], summary: 'Select one value from a numeric range.', keyboard: [k('← / → or ↑ / ↓', 'Decrease / increase by one step'), k('Page Up / Page Down', 'Larger steps'), k('Home / End', 'Minimum / maximum')], a11y: ['Native range input (`role="slider"`) with a visible label.', 'Use `formatValue` so `aria-valuetext` includes units.'], related: ['range-slider', 'number-input'] },
  { slug: 'range-slider', name: 'RangeSlider', category: 'Forms', components: ['RangeSlider'], summary: 'Select a numeric range with two thumbs.', keyboard: [k('Tab', 'Moves between the start and end thumbs'), k('Arrow keys', 'Adjust the focused thumb')], a11y: ['A `fieldset` groups two native range inputs, each with its own localized name.', 'The current range is announced politely.'], related: ['slider'] },
  { slug: 'segmented-button', name: 'SegmentedButton', category: 'Buttons', components: ['SegmentedButton'], summary: 'Toggle buttons for one or several closely related options.', keyboard: [k('← / →', 'Move focus between segments'), k('Home / End', 'First / last segment'), k('Enter / Space', 'Toggle the focused segment')], a11y: ['A labelled `group` of native buttons exposing `aria-pressed`.', 'Selection is indicated by more than color (weight and background).'], related: ['button-group', 'toggle-button'] },
  { slug: 'title', name: 'Title', category: 'Data display', components: ['Title'], summary: 'Semantic headings with independent visual size.', a11y: ['Renders a native `h1`–`h6`; keep levels sequential on the page.', 'Use `size` instead of skipping levels for visual reasons.'], related: ['text'] },
  { slug: 'text', name: 'Text', category: 'Data display', components: ['Text'], summary: 'Body text with tone, size and line clamping.', a11y: ['Clamped text stays in the DOM; provide another way to read it in full when it matters.', 'Tone colors are paired with wording; do not use color alone.'], related: ['title', 'expandable-text'] },
  { slug: 'token', name: 'Token', category: 'Forms', components: ['Token', 'Tokenizer'], summary: 'Compact removable values and a list of them.', keyboard: [k('← / →', 'Move between tokens'), k('Backspace / Delete', 'Remove the focused token')], a11y: ['Tokenizer is a labelled list; each delete button names its token.', 'Read-only tokens have no delete button.'], related: ['multi-input', 'multi-select'] },
  { slug: 'multi-input', name: 'MultiInput', category: 'Forms', components: ['MultiInput'], summary: 'Free-text entry of several values as tokens.', keyboard: [k('Enter / ,', 'Adds the typed value'), k('Backspace (empty input)', 'Removes the last value'), k('← / → (token focused)', 'Move between tokens')], a11y: ['The input keeps its label and description; tokens are a separate labelled list.', 'Each token delete button names its value.'], related: ['token', 'multi-select'] },
  { slug: 'responsive-popover', name: 'ResponsivePopover', category: 'Feedback', components: ['ResponsivePopover'], summary: 'A popover that becomes a full-screen dialog on phones.', keyboard: [k('Escape', 'Closes and returns focus to the trigger')], a11y: ['Non-modal popover semantics on larger screens; a modal dialog with focus trap on phones.', 'Provide a `title` so both presentations are named.'], related: ['popover', 'dialog'] },
  { slug: 'dynamic-date-range', name: 'DynamicDateRange', category: 'Forms', components: ['DynamicDateRange'], summary: 'Relative or custom date ranges for filters.', a11y: ['Built on the labelled Select and DateRangePicker.', 'Localize option labels; resolved dates are local calendar dates.'], related: ['date-range-picker'] },
  { slug: 'dynamic-page', name: 'DynamicPage', category: 'Layout', components: ['DynamicPage'], summary: 'Page with a collapsible, pinnable header and sticky footer.', keyboard: [k('Enter / Space (header toggle)', 'Collapse or expand the header')], a11y: ['The title is the page `h1`; the toggle exposes `aria-expanded`/`aria-controls`.', 'The pin button exposes `aria-pressed`.', 'The application controls collapsing on scroll to avoid unexpected focus loss.'], related: ['page', 'object-page'] },
  { slug: 'dynamic-side-content', name: 'DynamicSideContent', category: 'Layout', components: ['DynamicSideContent'], summary: 'Main content with responsive supplementary side content.', a11y: ['Side content is a labelled `complementary` landmark.', 'Visual order follows DOM order on phones (main first).'], related: ['split-view'] },
  { slug: 'flexible-column-layout', name: 'FlexibleColumnLayout', category: 'Layout', components: ['FlexibleColumnLayout'], summary: 'List, detail and detail-detail columns that adapt to screen size.', a11y: ['Each visible column is a labelled region; hidden columns are not rendered.', 'Move focus into a newly opened column from the application.'], related: ['master-detail', 'split-view'] },
  { slug: 'hero-banner', name: 'HeroBanner', category: 'Data display', components: ['HeroBanner'], summary: 'A prominent introduction with title, text and actions.', a11y: ['A section with a real heading; pick `headingLevel` to fit the page outline.', 'Background images and media are decorative; keep essential information in text.'] },
  { slug: 'media-gallery', name: 'MediaGallery', category: 'Data display', components: ['MediaGallery'], summary: 'A large image with a selectable thumbnail strip.', keyboard: [k('← / → (↑ / ↓ when vertical)', 'Move between thumbnails'), k('Home / End', 'First / last thumbnail'), k('Enter / Space', 'Show the focused image')], a11y: ['Every image requires `alt` text; thumbnails expose `aria-pressed`.', 'Video and full-screen viewing are application responsibilities.'], related: ['carousel'] },
  { slug: 'product-switch', name: 'ProductSwitch', category: 'Navigation', components: ['ProductSwitch'], summary: 'A grid of applications to switch between.', keyboard: [k('Arrow keys', 'Move between tiles in two dimensions'), k('Home / End', 'First / last tile'), k('Enter', 'Open the product')], a11y: ['A labelled `navigation` list of native links or buttons.', 'The current product is marked with `aria-current="page"`.'], related: ['application-header'] },
  { slug: 'user-menu', name: 'UserMenu', category: 'Navigation', components: ['UserMenu'], summary: 'Signed-in account, account switching and personal actions.', keyboard: [k('Escape', 'Closes and returns focus to the trigger'), k('↑ / ↓ (menu)', 'Move between actions')], a11y: ['A named non-modal popover; account switch buttons name the target account.', 'Sign-out and account management are performed by the application.'], related: ['application-header', 'user-settings-dialog'] },
  { slug: 'user-settings-dialog', name: 'UserSettingsDialog', category: 'Feedback', components: ['UserSettingsDialog'], summary: 'A modal settings dialog with categories and views.', keyboard: [k('Tab', 'Moves between categories and settings'), k('Escape', 'Closes the dialog')], a11y: ['Built on Dialog: focus is trapped and restored.', 'Categories are a labelled navigation; the current category has `aria-current`.', 'Persisting settings is an application responsibility.'], related: ['dialog', 'user-menu'] },
  { slug: 'view-settings-dialog', name: 'ViewSettingsDialog', category: 'Feedback', components: ['ViewSettingsDialog'], summary: 'Sort, group and filter settings confirmed as a whole.', keyboard: [k('← / →', 'Switch between Sort, Group and Filter tabs'), k('Escape', 'Cancels and closes')], a11y: ['Built on Dialog and Tabs; options use native radio buttons and checkboxes.', 'Changes apply only on OK; Cancel discards the draft.'], related: ['dialog', 'table', 'data-grid'] },
  { slug: 'upload-collection', name: 'UploadCollection', category: 'Data display', components: ['UploadCollection'], summary: 'A list of uploaded files with drag and drop and per-file actions.', a11y: ['A labelled region; status is text, not color alone, and progress bars are named per file.', 'Drag and drop has a keyboard alternative (Add files).', 'Upload transport, virus scanning and authorization are application responsibilities.'], related: ['file-uploader'] },
  { slug: 'ai-button', name: 'AIButton', category: 'Buttons', components: ['AIButton'], summary: 'A button for AI actions with application-driven states.', a11y: ['A native button whose name follows the current state.', 'Busy states set `aria-busy` and are announced politely; animation respects reduced motion.', 'Label AI-generated content and keep the user in control of applying it.'], related: ['button', 'prompt-input'] },
  { slug: 'prompt-input', name: 'PromptInput', category: 'Forms', components: ['PromptInput'], summary: 'A prompt field for AI features with send, stop and suggestions.', keyboard: [k('Enter', 'Send the prompt'), k('Shift + Enter', 'New line')], a11y: ['Built on the labelled TextArea; send and stop are named icon buttons.', 'IME composition is respected so Enter does not send mid-composition.'], related: ['ai-button', 'text-area'] },
  { slug: 'barcode-scanner-dialog', name: 'BarcodeScannerDialog', category: 'Feedback', components: ['BarcodeScannerDialog'], summary: 'Scan a barcode with the device camera in a modal dialog, with manual entry as a fallback.', keyboard: [k('Tab', 'Moves between the manual entry field and actions'), k('Escape', 'Closes the dialog and stops the camera')], a11y: ['Built on Dialog: focus is trapped and restored; scanning status is announced politely.', 'Manual entry gives a non-camera alternative; permission, missing-camera and insecure-context errors are explained in text.', 'The camera stream stops on success, close and unmount. Requires HTTPS.', 'Decoding uses the vendored zxing build by default (consistent across browsers); `decoder="native"` or `"auto"` opts into the browser BarcodeDetector.'], related: ['dialog', 'input'] },
  // Layout
  { slug: 'date-time-picker', name: 'DateTimePicker', category: 'Forms', components: ['DateTimePicker'], summary: 'Native local date and time input.', a11y: ['Provide a visible label; the browser supplies the date and time picker.', 'Values are local date-time strings without timezone information.'], related: ['date-picker'] },
  { slug: 'expandable-text', name: 'ExpandableText', category: 'Data display', components: ['ExpandableText'], summary: 'A text excerpt with an in-place disclosure.', a11y: ['Uses a native disclosure button with expanded state.', 'Localize the control labels and do not hide critical information.'] },
  { slug: 'form', name: 'Form', category: 'Forms', components: ['Form'], summary: 'Native form container for controls and groups.', a11y: ['Associate each control with a visible label.', 'Native form submission and validation are preserved.'], related: ['form-group', 'form-item'] },
  { slug: 'form-item', name: 'FormItem', category: 'Forms', components: ['FormItem'], summary: 'A labelled form control with helper and validation text.', a11y: ['Uses FormField context to link supported controls and messages.', 'Place one supported control in each item.'], related: ['form-field', 'form'] },
  { slug: 'icon', name: 'Icon', category: 'Data display', components: ['Icon'], summary: 'A decorative or named icon wrapper.', a11y: ['Provide a label for informative icons; omit it for decorative icons.', 'Use an IconButton for actions.'], related: ['icon-button'] },
  { slug: 'input-icon', name: 'InputIcon', category: 'Forms', components: ['InputIcon'], summary: 'A named action button for an input adornment.', a11y: ['Uses a native button and requires an accessible label.'], related: ['input'] },
  { slug: 'label', name: 'Label', category: 'Forms', components: ['Label'], summary: 'A visible label for a form control.', a11y: ['Connect htmlFor to the control id; required must also be set on the control.'], related: ['form-field'] },
  { slug: 'link', name: 'Link', category: 'Navigation', components: ['Link'], summary: 'A native navigation hyperlink.', a11y: ['Native links work with keyboard and preserve browser navigation behavior.'] },
  { slug: 'panel', name: 'Panel', category: 'Layout', components: ['Panel'], summary: 'A fixed or collapsible section.', a11y: ['The heading labels the section and its button exposes expanded state.', 'Content is hidden when collapsed.'] },
  { slug: 'rating-indicator', name: 'RatingIndicator', category: 'Forms', components: ['RatingIndicator'], summary: 'An integer rating using native radio buttons.', a11y: ['Native radio keyboard behavior supports arrow-key selection.', 'Read-only ratings are announced as a labelled image.', 'Localize option labels.'] },
  { slug: 'color-picker', name: 'ColorPicker', category: 'Forms', components: ['ColorPicker'], summary: 'A native browser color input for hexadecimal colors.', a11y: ['Associate a visible label with the input.', 'The picker interface and keyboard behavior are provided by the browser.'], related: ['color-palette'] },
  { slug: 'color-palette-popover', name: 'ColorPalettePopover', category: 'Forms', components: ['ColorPalettePopover'], summary: 'A color palette in a non-modal popover.', a11y: ['The popover has a name and restores focus to its trigger on close.', 'Each color has a text label and is a native button.'], related: ['color-palette', 'popover'] },
  { slug: 'busy-indicator', name: 'BusyIndicator', category: 'Feedback', components: ['BusyIndicator'], summary: 'A delayed, non-blocking loading indicator for a region.', a11y: ['Announces the operation with a status; localize its text.', 'The overlay does not block interaction; disable actions explicitly if required.'], related: ['spinner'] },
  { slug: 'button-badge', name: 'ButtonBadge', category: 'Buttons', components: ['ButtonBadge'], summary: 'A decorative count or attention dot for a button.', a11y: ['The visual badge is hidden from assistive technology; set `label` (for example "3 new") so its meaning is announced after the visible button text.', 'Avoid an `aria-label` that differs from the visible text (WCAG 2.5.3 Label in Name).'], related: ['button'] },
  { slug: 'calendar-legend', name: 'CalendarLegend', category: 'Data display', components: ['CalendarLegend', 'CalendarLegendItem'], summary: 'A labelled list explaining calendar date markings.', a11y: ['Labels communicate meaning independently of color.', 'This is a display legend; the application owns date marking and interactions.'] },
  { slug: 'card-header', name: 'CardHeader', category: 'Data display', components: ['CardHeader'], summary: 'A composable heading for a card with optional actions.', a11y: ['Interactive titles use a native button; actions remain separate keyboard targets.'], related: ['card'] },
  { slug: 'carousel', name: 'Carousel', category: 'Data display', components: ['Carousel'], summary: 'A manually navigated, one-item-per-page carousel.', a11y: ['Does not rotate automatically; navigation controls use native buttons.', 'Only the current slide is mounted. Localize navigation and page labels.'] },
  { slug: 'color-palette', name: 'ColorPalette', category: 'Forms', components: ['ColorPalette', 'ColorPaletteItem'], summary: 'A group of labelled color selection buttons.', a11y: ['Each swatch has a text alternative and exposes its selected state.', 'Swatches use ordinary native button tab navigation.'] },
  { slug: 'calendar-date', name: 'CalendarDate', category: 'Data display', components: ['CalendarDate'], summary: 'Marks a selected day inside Calendar.', a11y: ['Marked days expose pressed state in addition to the calendar value.', 'Dates use YYYY-MM-DD. Invalid dates are ignored.'], related: ['date-picker', 'calendar-date-range'] },
  { slug: 'calendar-date-range', name: 'CalendarDateRange', category: 'Data display', components: ['CalendarDateRange'], summary: 'Marks an inclusive day range inside Calendar.', a11y: ['Days in the range include that fact in their accessible name.', 'A reversed range is normalized.'], related: ['calendar-date', 'date-picker'] },
  { slug: 'special-calendar-date', name: 'SpecialCalendarDate', category: 'Data display', components: ['SpecialCalendarDate'], summary: 'Marks a calendar day with a text label and tone.', a11y: ['The label is added to the day name so meaning is not conveyed by color alone.'], related: ['calendar-legend', 'calendar-date'] },
  { slug: 'combo-box-item', name: 'ComboBoxItem', category: 'Forms', components: ['ComboBoxItem'], summary: 'A labelled choice for ComboBox.', a11y: ['The label is the accessible name. Additional text is visible secondary text.'], related: ['combo-box'] },
  { slug: 'combo-box-item-custom', name: 'ComboBoxItemCustom', category: 'Forms', components: ['ComboBoxItemCustom'], summary: 'A ComboBox choice with custom content.', a11y: ['The label remains the accessible name and the filtering text.'], related: ['combo-box-item'] },
  { slug: 'combo-box-item-group', name: 'ComboBoxItemGroup', category: 'Forms', components: ['ComboBoxItemGroup'], summary: 'Groups ComboBox choices under a heading.', a11y: ['The heading names the group and is not a choice.'], related: ['combo-box-item'] },
  { slug: 'option', name: 'Option', category: 'Forms', components: ['Option'], summary: 'A labelled choice for Select.', a11y: ['The label is the accessible name. Disabled options are skipped by keyboard navigation.'], related: ['select'] },
  { slug: 'option-custom', name: 'OptionCustom', category: 'Forms', components: ['OptionCustom'], summary: 'A Select choice with custom content.', a11y: ['The label remains the accessible name and type-ahead text.'], related: ['option', 'select'] },
  { slug: 'option-group', name: 'OptionGroup', category: 'Forms', components: ['OptionGroup'], summary: 'Groups Select choices under a heading.', a11y: ['The heading names the group and is not a choice.'], related: ['option'] },
  { slug: 'list-item-standard', name: 'ListItemStandard', category: 'Data display', components: ['ListItemStandard'], summary: 'A text row for List.', a11y: ['Selection and keyboard behavior come from the parent list.', 'Highlight state includes visible text.'], related: ['list'] },
  { slug: 'list-item-custom', name: 'ListItemCustom', category: 'Data display', components: ['ListItemCustom'], summary: 'A List row with custom content.', a11y: ['The text prop is the accessible name and type-ahead value.'], related: ['list-item-standard'] },
  { slug: 'list-item-group', name: 'ListItemGroup', category: 'Data display', components: ['ListItemGroup'], summary: 'Groups list rows under a heading.', a11y: ['The heading is not a selectable row.'], related: ['list'] },
  { slug: 'menu-item', name: 'MenuItem', category: 'Navigation', components: ['MenuItem'], summary: 'An action inside Menu.', a11y: ['Keyboard behavior comes from the parent menu.', 'Disabled items are skipped.'], related: ['menu'] },
  { slug: 'menu-item-group', name: 'MenuItemGroup', category: 'Navigation', components: ['MenuItemGroup'], summary: 'Groups menu actions under a label.', a11y: ['The label is not an action and is skipped by arrow keys.'], related: ['menu-item'] },
  { slug: 'menu-separator', name: 'MenuSeparator', category: 'Navigation', components: ['MenuSeparator'], summary: 'A non-focusable divider between menu actions.', a11y: ['Exposed as a separator and skipped by keyboard navigation.'], related: ['menu'] },
  { slug: 'step-input', name: 'StepInput', category: 'Forms', components: ['StepInput'], summary: 'Numeric entry with decrease and increase buttons.', keyboard: [k('↑ / ↓', 'Change by one step'), k('Page Up / Page Down', 'Change by ten steps'), k('Home / End', 'Jump to the minimum or maximum'), k('Enter', 'Commit typed text')], a11y: ['The input is a spinbutton with a visible label.', 'Stepper buttons are available to pointer users and are labelled.'] },
  { slug: 'bar', name: 'Bar', category: 'Layout', components: ['Bar'], summary: 'A structural bar with start, center and end content.', a11y: ['Uses native tab order; it is not a toolbar and does not implement arrow-key navigation.', 'Provide a landmark role and accessible name when needed by the surrounding page.'] },
  {
    slug: 'app-shell', name: 'AppShell', category: 'Layout', components: ['AppShell'],
    summary: 'The responsive application frame: header, side navigation and main content. Collapses navigation to icons on tablets and to a drawer on phones.',
    keyboard: [k('Tab (first)', 'Reveals the “Skip to main content” link'), k('Escape', 'Closes the mobile navigation drawer')],
    a11y: ['Renders `banner`, `navigation` and `main` landmarks.', 'The skip link moves focus to `<main>` (WCAG 2.4.1).', 'The mobile drawer is a modal dialog: focus is trapped and restored, and the page behind does not scroll.'],
    related: ['application-header', 'side-navigation', 'page'],
  },
  {
    slug: 'page', name: 'Page', category: 'Layout', components: ['Page'],
    summary: 'Page header with breadcrumbs, title, subtitle, actions, header content and a filter/toolbar area, followed by a responsive content region.',
    a11y: ['The title renders as the page’s only `<h1>`.', 'Breadcrumbs render as a labelled `navigation` landmark.', 'Actions keep their DOM order on all screen sizes, matching the visual order.'],
  },
  { slug: 'container', name: 'Container', category: 'Layout', components: ['Container'], summary: 'Centres content with a maximum width and responsive side padding.', a11y: ['Purely presentational; use the `as` prop to render a landmark such as `section` when appropriate.'] },
  { slug: 'grid', name: 'Grid', category: 'Layout', components: ['Grid', 'GridItem'], summary: 'Responsive CSS grid with per-breakpoint column counts or auto-fit columns.', a11y: ['Visual order follows DOM order; do not use spans to reorder meaningful content.'] },
  { slug: 'flex', name: 'Flex', category: 'Layout', components: ['Flex'], summary: 'Flexbox layout primitive with token-based gaps.', a11y: ['Avoid `row-reverse`/`column-reverse` for content whose reading order matters (WCAG 1.3.2).'] },
  { slug: 'stack', name: 'Stack', category: 'Layout', components: ['Stack'], summary: 'One-dimensional layout with consistent spacing and optional dividers.', a11y: ['Dividers are decorative borders and are not announced.'] },
  {
    slug: 'split-view', name: 'SplitView', category: 'Layout', components: ['SplitView'],
    summary: 'Two panes side by side or stacked, optionally resizable.',
    keyboard: [k('← / →', 'Resize the start pane (handle focused)'), k('Shift + arrows', 'Resize in larger steps'), k('Home / End', 'Minimum / maximum size')],
    a11y: ['Panes can be labelled regions via `startLabel` / `endLabel`.', 'The resize handle is a focusable `separator` with `aria-valuenow`.'],
  },
  {
    slug: 'resizable-panel', name: 'ResizablePanel', category: 'Layout', components: ['ResizablePanel'],
    summary: 'A panel with a draggable, keyboard-operable edge.',
    keyboard: [k('Arrow keys', 'Grow or shrink by `step` px'), k('Shift + arrows', 'Five times the step'), k('Home / End', 'Jump to min / max size')],
    a11y: ['Handle uses `role="separator"` with `aria-valuenow/min/max` and an accessible label.', 'Dragging uses pointer events and works with touch.'],
  },
  {
    slug: 'command-palette', name: 'CommandPalette', category: 'Patterns', components: ['CommandPalette'],
    summary: 'Search grouped commands and recent destinations from a keyboard-first modal. The host owns routing, recent history, and authorization.',
    keyboard: [k('Ctrl / Command + K', 'Open when globalShortcut is enabled'), k('↑ / ↓', 'Move through results'), k('Enter', 'Select the active result'), k('Escape', 'Close and restore focus')],
    a11y: ['A labelled dialog contains a combobox and grouped listbox; focus remains on the search input.', 'Permission filtering is presentation only; enforce authorization in the application and backend.', 'Provide unique stable IDs, and mount only one palette with the global shortcut enabled.'],
    related: ['command-toolbar', 'dialog'],
  },
  {
    slug: 'virtual-list', name: 'VirtualList', category: 'Data display', components: ['VirtualList'],
    summary: 'A fixed-height windowed listbox for large collections; stable IDs and controlled selection preserve identity across scrolling.',
    keyboard: [k('↑ / ↓', 'Move active item'), k('Home / End', 'Move to first / last item'), k('Space / Enter', 'Toggle selection')],
    a11y: ['Uses listbox options with position and set size. Items must not contain interactive controls.', 'Set virtualized to false for an unwindowed alternative; test with your target assistive technologies.', 'Fixed item height is required; variable heights and tree/grid integration are not supported.'],
  },
  {
    slug: 'diff-viewer', name: 'DiffViewer', category: 'Data display', components: ['DiffViewer'],
    summary: 'A structured, accessible before-and-after comparison for JSON-shaped values.',
    a11y: ['A labelled table identifies changes with text, not color alone.', 'compareDiffValues compares nested objects and treats arrays as atomic values. Paths use JSON Pointer escaping.', 'Compose with ObjectEditor baseline or AuditTrail renderChanges; audit data must originate from the authoritative service.'],
    related: ['audit-trail', 'object-editor'],
  },
  {
    slug: 'file-uploader', name: 'FileUploader', category: 'Forms', components: ['FileUploader'],
    summary: 'A sequential upload queue with file validation, progress, cancellation and explicit retry; transport is supplied by the application.',
    keyboard: [k('Tab', 'Reach the file picker and each queue action')],
    a11y: ['Native file input provides a keyboard alternative to drag and drop.', 'Progress is available through labelled progress bars and a live summary.', 'The server must validate files and authorize uploads; cancellation cannot guarantee server rollback. Use idempotent upload operations before retrying uncertain outcomes.'],
  },
  { slug: 'copy-button', name: 'CopyButton', category: 'Buttons', components: ['CopyButton'], summary: 'Copies a text value with success and failure feedback.', a11y: ['Uses a native button and politely announces the outcome.', 'Clipboard access may be unavailable outside secure contexts; failures are surfaced.'] },
  { slug: 'virtual-tree', name: 'VirtualTree', category: 'Data display', components: ['VirtualTree'], summary: 'Windowed, fixed-height hierarchical navigation using the TreeNode contract.', keyboard: [k('↑ / ↓', 'Move through visible nodes'), k('← / →', 'Collapse, expand or move to parent/child'), k('Home / End', 'Move to first / last node'), k('Enter / Space', 'Select')], a11y: ['A tree with explicit level, position and set size; focus stays on the tree using aria-activedescendant.', 'Set virtualized to false for a full-render alternative. Verify with target screen readers.', 'Nodes have fixed heights. Do not include interactive descendants in node content.'], related: ['tree', 'virtual-list'] },
  { slug: 'inline-edit', name: 'InlineEdit', category: 'Forms', components: ['InlineEdit'], summary: 'Controlled text editing with validation and asynchronous save.', keyboard: [k('Escape', 'Cancel while not saving')], a11y: ['The edit input has an associated label and validation errors are announced.', 'Focus moves to the input on edit and returns to the edit button on cancel or save.'] },
  { slug: 'overflow-menu', name: 'OverflowMenu', category: 'Navigation', components: ['OverflowMenu'], summary: 'A compact trigger for secondary actions, built on DropdownMenu.', a11y: ['The trigger has an accessible name and uses the existing keyboard-accessible menu.'], related: ['dropdown-menu'] },
  { slug: 'notification-center', name: 'NotificationCenter', category: 'Feedback', components: ['NotificationCenter'], summary: 'A controlled list of notifications with read and dismiss actions.', a11y: ['Unread state is expressed in text, and actions include the notification title.', 'Delivery, persistence, localization and authorization are host responsibilities.'] },
  { slug: 'app-breadcrumb-bar', name: 'AppBreadcrumbBar', category: 'Navigation', components: ['AppBreadcrumbBar'], summary: 'Breadcrumbs with a responsive contextual action slot.', a11y: ['Uses the existing labelled Breadcrumbs navigation and native actions.'], related: ['breadcrumbs'] },
  { slug: 'permission-gate', name: 'PermissionGate', category: 'Patterns', components: ['PermissionGate'], summary: 'Conditionally renders permitted interface elements or a fallback.', a11y: ['A presentation helper only: always enforce authorization on the backend.'] },
  // Navigation
  {
    slug: 'application-header', name: 'ApplicationHeader', category: 'Navigation', components: ['ApplicationHeader'],
    summary: 'The top application bar: branding, global search, notifications, help, settings and the user menu.',
    keyboard: [k('Tab', 'Moves through header actions'), k('Enter / Space / ↓', 'Opens the help or user menu'), k('Escape', 'Closes menus and popovers')],
    a11y: ['Rendered as a `<header>` (banner landmark) with the search in a `search` landmark.', 'The notification button’s name includes the unread count.', 'The navigation toggle exposes `aria-expanded` and controls the side navigation.'],
  },
  {
    slug: 'side-navigation', name: 'SideNavigation', category: 'Navigation', components: ['SideNavigation', 'NavigationItem', 'NavigationGroup'],
    summary: 'Vertical navigation with icons, groups, expandable sections, active-route indicators and an icon-only collapsed mode.',
    keyboard: [k('Tab', 'Moves between items'), k('Enter / Space', 'Follows a link or toggles a section'), k('↓ / Enter (collapsed)', 'Opens the flyout menu of a section')],
    a11y: ['A labelled `navigation` landmark of nested lists.', 'The current page has `aria-current="page"`; sections expose `aria-expanded`.', 'In collapsed mode items keep their accessible names and show tooltips.'],
  },
  {
    slug: 'navigation-item', name: 'NavigationItem', category: 'Navigation', components: ['NavigationItem', 'NavigationGroup'], examples: 'side-navigation',
    summary: 'A link or expandable section inside SideNavigation. Nest NavigationItems to create sub-navigation.',
    a11y: ['Renders a link when `href` is set, otherwise a button.', 'Badge counts are announced as “N new”.'],
  },
  {
    slug: 'breadcrumbs', name: 'Breadcrumbs', category: 'Navigation', components: ['Breadcrumbs', 'BreadcrumbsItem'],
    summary: 'Shows the location in a hierarchy and links to parent pages.',
    a11y: ['A `navigation` landmark labelled “Breadcrumb” containing an ordered list.', 'The current page has `aria-current="page"`.', 'Separators are hidden from assistive technology.', 'A standalone `BreadcrumbsItem` belongs inside an ordered list in a labelled navigation landmark.', 'Localize the overflow menu and trigger labels when needed.'],
  },
  {
    slug: 'tabs', name: 'Tabs', category: 'Navigation', components: ['Tabs', 'TabList', 'Tab', 'TabPanel'],
    summary: 'Organises related content into panels, one visible at a time.',
    keyboard: [k('← / →', 'Previous / next tab (skips disabled tabs)'), k('Home / End', 'First / last tab'), k('Enter / Space', 'Activates the focused tab (manual activation)'), k('Tab', 'Moves into the active panel')],
    a11y: ['Implements the WAI-ARIA tabs pattern with roving tabindex.', 'Tabs and panels are linked via `aria-controls` / `aria-labelledby`.', 'Right-to-left layouts reverse arrow keys automatically.'],
  },
  {
    slug: 'menu', name: 'Menu', category: 'Navigation', components: ['Menu'],
    summary: 'A list of actions with icons, shortcuts, checkable items and groups.',
    keyboard: [k('↑ / ↓', 'Previous / next item (wraps, skips disabled)'), k('Home / End', 'First / last item'), k('Enter / Space', 'Activates the item'), k('Letters', 'Type-ahead to an item'), k('Escape / Tab', 'Closes the menu')],
    a11y: ['`role="menu"` with `menuitem` / `menuitemcheckbox` items and roving focus.', 'Group labels and separators are presentational.'],
  },
  {
    slug: 'dropdown-menu', name: 'DropdownMenu', category: 'Navigation', components: ['DropdownMenu'],
    summary: 'A trigger that opens a menu of actions.',
    keyboard: [k('Enter / Space / ↓', 'Opens and focuses the first item'), k('↑', 'Opens and focuses the last item'), k('Escape', 'Closes and returns focus to the trigger')],
    a11y: ['The trigger gets `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`.', 'The menu is labelled by its trigger unless `aria-label` is given.'],
  },
  {
    slug: 'pagination', name: 'Pagination', category: 'Navigation', components: ['Pagination'],
    summary: 'Navigates between pages of a data set, with an optional page-size selector.',
    a11y: ['A labelled `navigation` landmark; the current page has `aria-current="page"`.', 'Every page button has an explicit name (“Page 3”).', 'On phones a condensed “Page X of Y” label is shown.'],
  },
  // Buttons
  {
    slug: 'button', name: 'Button', category: 'Buttons', components: ['Button'],
    summary: 'Triggers an action. Primary, secondary, tertiary and destructive variants communicate emphasis.',
    keyboard: [k('Enter / Space', 'Activates the button')],
    a11y: ['Native `<button>` with `type="button"` by default.', 'Loading buttons set `aria-busy` and ignore clicks while keeping focus.', 'Touch devices get a 44 × 44 px minimum hit area.'],
  },
  { slug: 'icon-button', name: 'IconButton', category: 'Buttons', components: ['IconButton'], summary: 'A square, icon-only button.', keyboard: [k('Enter / Space', 'Activates the button')], a11y: ['`label` is required and becomes the accessible name.', 'The icon is hidden from assistive technology.'] },
  {
    slug: 'split-button', name: 'SplitButton', category: 'Buttons', components: ['SplitButton'],
    summary: 'A default action plus a menu of related alternatives.',
    keyboard: [k('Tab', 'Moves between the action and the menu button'), k('↓ (menu button)', 'Opens the menu')],
    a11y: ['Two separate buttons in a group; the menu button has its own label (“More options”).'],
  },
  { slug: 'toggle-button', name: 'ToggleButton', category: 'Buttons', components: ['ToggleButton'], summary: 'A two-state button.', keyboard: [k('Enter / Space', 'Toggles the pressed state')], a11y: ['Exposes `aria-pressed`. Keep the label constant so the state, not the name, changes.'] },
  { slug: 'button-group', name: 'ButtonGroup', category: 'Buttons', components: ['ButtonGroup'], summary: 'Groups related buttons, optionally as a joined segmented control.', a11y: ['`role="group"`; provide `aria-label` when the purpose is not obvious.'] },
  // Forms
  {
    slug: 'input', name: 'Input', category: 'Forms', components: ['Input'],
    summary: 'Single-line text input with label, helper text, adornments and validation states.',
    a11y: ['Label is a real `<label for>`; helper text and messages are linked with `aria-describedby`.', 'Errors set `aria-invalid`, are prefixed “Error:” for screen readers and announced via a polite live region.', 'Required fields show an asterisk and set `required`.'],
  },
  { slug: 'text-area', name: 'TextArea', category: 'Forms', components: ['TextArea'], summary: 'Multi-line text input with optional auto-resize and character counter.', a11y: ['The counter is linked via `aria-describedby`.', 'Shares labelling and validation behavior with Input.'] },
  {
    slug: 'number-input', name: 'NumberInput', category: 'Forms', components: ['NumberInput'],
    summary: 'Numeric entry with stepping, clamping, precision and units.',
    keyboard: [k('↑ / ↓', 'Increase / decrease by step'), k('Page Up / Page Down', 'Change by ten steps'), k('Home / End', 'Minimum / maximum'), k('Enter', 'Commit typed value')],
    a11y: ['`role="spinbutton"` with `aria-valuenow/min/max`.', 'Stepper buttons are mouse/touch helpers and are skipped in the Tab order.'],
  },
  {
    slug: 'search-field', name: 'SearchField', category: 'Forms', components: ['SearchField'],
    summary: 'Search input with icon, clear button and Enter-to-search.',
    keyboard: [k('Enter', 'Runs `onSearch`'), k('Escape', 'Clears the field')],
    a11y: ['`role="searchbox"` with a default “Search” label.', 'The clear button has an accessible name.'],
  },
  {
    slug: 'select', name: 'Select', category: 'Forms', components: ['Select'],
    summary: 'Choose one option from a list (select-only combobox).',
    keyboard: [k('Enter / Space / ↓ / ↑', 'Opens the list'), k('↑ / ↓', 'Moves the active option'), k('Home / End / Page Up / Page Down', 'Jump in the list'), k('Enter / Space', 'Selects and closes'), k('Letters', 'Type-ahead (also while closed)'), k('Escape', 'Closes without selecting')],
    a11y: ['WAI-ARIA select-only combobox: focus stays on the combobox and `aria-activedescendant` tracks the option.', 'Options expose `aria-selected`; grouped options use labelled `group`s.'],
  },
  {
    slug: 'combo-box', name: 'ComboBox', category: 'Forms', components: ['ComboBox'],
    summary: 'Editable combobox that filters options as you type.',
    keyboard: [k('Typing', 'Filters and opens the list'), k('↓ / ↑', 'Opens / moves the active option'), k('Enter', 'Selects the active option'), k('Escape', 'Closes the list, then clears the value'), k('Alt + ↑', 'Closes the list')],
    a11y: ['ARIA 1.2 combobox with `aria-autocomplete="list"`.', 'Matches are highlighted with `<mark>`; the empty message is part of the listbox.'],
  },
  {
    slug: 'multi-select', name: 'MultiSelect', category: 'Forms', components: ['MultiSelect'],
    summary: 'Select several options; values appear as removable tokens.',
    keyboard: [k('↓ / ↑', 'Opens / moves the active option'), k('Enter', 'Toggles the active option'), k('Backspace', 'Removes the last token'), k('Escape', 'Closes the list')],
    a11y: ['`aria-multiselectable` listbox; the current selection is summarised in the description.', 'Additions and removals are announced via the live region.'],
  },
  { slug: 'checkbox', name: 'Checkbox', category: 'Forms', components: ['Checkbox'], summary: 'A binary choice, with an indeterminate state for parent checkboxes.', keyboard: [k('Space', 'Toggles the checkbox')], a11y: ['Native checkbox input; the indeterminate state is reported as “mixed”.', 'Errors set `aria-invalid` and are linked with `aria-describedby`.'] },
  {
    slug: 'radio-group', name: 'RadioGroup', category: 'Forms', components: ['RadioGroup'],
    summary: 'Choose exactly one of a few options.',
    keyboard: [k('Tab', 'Moves into / out of the group'), k('Arrow keys', 'Select the previous / next option')],
    a11y: ['A `fieldset` with `legend`, exposed as a labelled `radiogroup`.', 'Uses native radio inputs for full assistive-technology support.'],
  },
  { slug: 'switch', name: 'Switch', category: 'Forms', components: ['Switch'], summary: 'An on/off toggle that takes effect immediately.', keyboard: [k('Space', 'Toggles the switch')], a11y: ['Native checkbox with `role="switch"`.', 'The thumb position is reinforced by color and optional On/Off text.'] },
  {
    slug: 'date-picker', name: 'DatePicker', category: 'Forms', components: ['DatePicker', 'Calendar'],
    summary: 'Date entry by typing or choosing from a calendar popup.',
    keyboard: [k('Alt + ↓', 'Opens the calendar'), k('Arrow keys', 'Previous / next day or week'), k('Home / End', 'Start / end of week'), k('Page Up / Page Down', 'Previous / next month'), k('Shift + Page Up / Down', 'Previous / next year'), k('Enter / Space', 'Selects the date'), k('Escape', 'Closes the calendar')],
    a11y: ['The calendar is a `grid` labelled by the visible month; each day has a full date label.', 'Today is marked with `aria-current="date"`; disabled dates are not selectable.', 'Invalid typed input produces an inline error message.'],
  },
  {
    slug: 'time-picker', name: 'TimePicker', category: 'Forms', components: ['TimePicker'],
    summary: 'Type a time or pick from suggested times.',
    keyboard: [k('Typing', 'Free-form entry, normalised on blur'), k('↓ / ↑', 'Moves through suggestions'), k('Enter', 'Selects')],
    a11y: ['Built on ComboBox, so it shares its combobox semantics.'],
  },
  { slug: 'form-field', name: 'FormField', category: 'Forms', components: ['FormField'], summary: 'Label, description and validation layout that connects any nested control.', a11y: ['Provides ids through context so custom controls can set `aria-describedby` and `aria-invalid` correctly.'] },
  { slug: 'form-group', name: 'FormGroup', category: 'Forms', components: ['FormGroup'], summary: 'Groups related fields under a heading in a responsive column layout.', a11y: ['A `fieldset` with `legend`, so the group name is announced with each field.'] },
  // Data display
  {
    slug: 'table', name: 'Table', category: 'Data display', components: ['Table'],
    summary: 'Semantic data table with sorting, selection, row highlights, loading/empty states, density and responsive modes.',
    keyboard: [k('Tab', 'Moves through sort buttons, checkboxes and activatable rows'), k('Enter (row)', 'Activates the row (`onRowClick`)'), k('Space (row)', 'Toggles row selection')],
    a11y: ['Native `<table>` semantics with a caption and optional row headers.', 'Sortable columns expose `aria-sort`; sort controls are real buttons.', 'Selection checkboxes are labelled per row; loading sets `aria-busy`.'],
  },
  {
    slug: 'data-grid', name: 'DataGrid', category: 'Data display', components: ['DataGrid'],
    summary: 'Feature-complete table: search, filters, sorting, selection with bulk actions, pagination, column visibility, density and opt-in fixed-height row windowing.',
    a11y: ['A labelled region whose title includes the result count.', 'Result counts are announced after searching or filtering.', 'Composed of accessible primitives: SearchField, Select, Table, Pagination and DropdownMenu.', 'Virtualized rows use arrow-key navigation and Tab traversal across row boundaries; offscreen controls are not in the accessibility tree. Disable virtualization or use pagination when this is unsuitable.'],
  },
  {
    slug: 'list', name: 'List', category: 'Data display', components: ['List'],
    summary: 'Vertical list of items: static, navigable or selectable.',
    keyboard: [k('↑ / ↓ / Home / End', 'Moves between items (selectable lists)'), k('Space', 'Toggles selection'), k('Ctrl/⌘ + A', 'Selects all (multiple)'), k('Letters', 'Type-ahead')],
    a11y: ['Selectable lists are `listbox`es with `aria-selected` options.', 'Navigable items are buttons or links with `aria-current` for the current item.'],
  },
  {
    slug: 'tree', name: 'Tree', category: 'Data display', components: ['Tree'],
    summary: 'Hierarchical list with expandable nodes.',
    keyboard: [k('↑ / ↓', 'Previous / next visible node'), k('→', 'Expands, or moves to the first child'), k('←', 'Collapses, or moves to the parent'), k('Home / End', 'First / last node'), k('Enter / Space', 'Selects'), k('*', 'Expands all siblings'), k('Letters', 'Type-ahead')],
    a11y: ['WAI-ARIA treeview with `aria-level`, `aria-setsize`, `aria-posinset` and `aria-expanded`.', 'Single tab stop with roving focus.'],
  },
  {
    slug: 'tree-table', name: 'TreeTable', category: 'Data display', components: ['TreeTable'],
    summary: 'A table whose rows form a hierarchy.',
    keyboard: [k('↑ / ↓', 'Previous / next row'), k('→', 'Expands, or moves to the first child row'), k('←', 'Collapses, or moves to the parent row'), k('Home / End', 'First / last row'), k('Enter', 'Activates the row')],
    a11y: ['`role="treegrid"` with `aria-level`, `aria-expanded`, `aria-posinset` and `aria-setsize` on rows.'],
  },
  { slug: 'card', name: 'Card', category: 'Data display', components: ['Card'], summary: 'Groups content and actions about one subject.', a11y: ['An `<article>` with a heading (configurable level).', 'Clickable cards use a single button in the title that covers the card, so inner actions remain usable.'] },
  { slug: 'avatar-group', name: 'AvatarGroup', category: 'Data display', components: ['AvatarGroup'], summary: 'Related avatars shown together with responsive overflow.', keyboard: [k('← / →', 'Move between individually interactive avatars'), k('Home / End', 'Move to first / last avatar'), k('Enter / Space', 'Activate an avatar or overflow button')], a11y: ['Give the group and each item an accessible name.', 'Provide an overflow callback to make hidden items available, and localize its label.', 'Group and individual modes have separate callbacks; the host owns any resulting popover.'], related: ['avatar'] },
  { slug: 'avatar-badge', name: 'AvatarBadge', category: 'Data display', components: ['AvatarBadge'], summary: 'A decorative icon badge composed with an Avatar.', a11y: ['The badge is not interactive and is hidden from assistive technology.', 'Set `badgeLabel` on the Avatar when the badge communicates meaning; do not rely on color alone.', 'Do not put focusable content inside the badge.'], related: ['avatar'] },
  { slug: 'avatar', name: 'Avatar', category: 'Data display', components: ['Avatar'], summary: 'A person or object as image, initials or icon.', a11y: ['Exposed as an image named after the person (plus presence).', 'Use `decorative` when the name is already visible next to it.'] },
  { slug: 'badge', name: 'Badge', category: 'Data display', components: ['Badge'], summary: 'Compact labels and counters.', a11y: ['Counters without visible context need an `aria-label` (e.g. “7 new”).', 'Colors are paired with text, never used alone.'] },
  { slug: 'status-indicator', name: 'StatusIndicator', category: 'Data display', components: ['StatusIndicator'], summary: 'Object status shown with semantic color, icon and text.', a11y: ['Status always includes text, so meaning does not rely on color (WCAG 1.4.1).', 'Text colors meet 4.5:1 contrast in all themes.'] },
  { slug: 'timeline', name: 'Timeline', category: 'Data display', components: ['Timeline'], summary: 'Chronological list of events.', a11y: ['An ordered list; Date timestamps render as `<time datetime>`.'] },
  { slug: 'object-identifier', name: 'ObjectIdentifier', category: 'Data display', components: ['ObjectIdentifier'], summary: 'Names a business object with its ID.', a11y: ['When interactive, the title is a link or button with the object name as its accessible name.'] },
  { slug: 'metric-card', name: 'MetricCard', category: 'Data display', components: ['MetricCard'], summary: 'KPI tile with value, unit, trend and sparkline.', a11y: ['Trend direction is announced as text (“Up +8.2%”), not just shown by an arrow.', 'The sparkline is decorative; put essential numbers in text.'] },
  // Feedback
  {
    slug: 'dialog', name: 'Dialog', category: 'Feedback', components: ['Dialog'],
    summary: 'Modal dialog for focused tasks.',
    keyboard: [k('Tab / Shift + Tab', 'Cycles focus within the dialog'), k('Escape', 'Closes the dialog')],
    a11y: ['`role="dialog"` with `aria-modal` and a title as its name.', 'Focus moves inside on open, is trapped, and is restored to the trigger on close.', 'Background scrolling is locked; full screen on phones.'],
  },
  {
    slug: 'alert-dialog', name: 'AlertDialog', category: 'Feedback', components: ['AlertDialog'],
    summary: 'Confirms important or destructive actions.',
    keyboard: [k('Tab', 'Cycles between Confirm and Cancel'), k('Escape', 'Cancels')],
    a11y: ['`role="alertdialog"`; the message is the accessible description.', 'Initial focus is on the least destructive action (Cancel).'],
  },
  {
    slug: 'toast', name: 'Toast', category: 'Feedback', components: ['ToastProvider'],
    summary: 'Brief, non-blocking notifications.',
    a11y: ['Announced through the ThemeProvider live region (errors assertively).', 'Timers pause while hovered or focused (WCAG 2.2.1); errors persist until dismissed.', 'Do not put the only path to an action in a toast.'],
  },
  { slug: 'message-strip', name: 'MessageStrip', category: 'Feedback', components: ['MessageStrip'], summary: 'Inline message about the current page or section.', a11y: ['Tone is announced as a hidden prefix (“Warning:”).', 'Use `announce` for messages that appear dynamically.'] },
  {
    slug: 'tooltip', name: 'Tooltip', category: 'Feedback', components: ['Tooltip'],
    summary: 'Short contextual help on hover and focus.',
    keyboard: [k('Tab (focus trigger)', 'Shows the tooltip'), k('Escape', 'Hides the tooltip')],
    a11y: ['Linked with `aria-describedby` (or `aria-labelledby` for icon-only triggers).', 'Dismissible and hoverable per WCAG 1.4.13; not shown for touch.'],
  },
  {
    slug: 'popover', name: 'Popover', category: 'Feedback', components: ['Popover'],
    summary: 'Non-modal dialog anchored to a trigger.',
    keyboard: [k('Enter / Space', 'Opens (on the trigger)'), k('Escape', 'Closes and returns focus')],
    a11y: ['`role="dialog"` named by its title; the trigger exposes `aria-expanded`.', 'Focus moves into the popover on open.'],
  },
  { slug: 'progress-bar', name: 'ProgressBar', category: 'Feedback', components: ['ProgressBar'], summary: 'Progress of a task or utilisation of a quantity.', a11y: ['`role="progressbar"` with `aria-valuenow` and a human-readable `aria-valuetext`.', 'Indeterminate bars omit the value.'] },
  { slug: 'spinner', name: 'Spinner', category: 'Feedback', components: ['Spinner'], summary: 'Indeterminate busy indicator.', a11y: ['`role="status"` with a visually hidden label.', 'Animation slows down when reduced motion is requested.'] },
  { slug: 'skeleton', name: 'Skeleton', category: 'Feedback', components: ['Skeleton'], summary: 'Placeholder that mirrors the layout of loading content.', a11y: ['Hidden from assistive technology; set `aria-busy` on the loading region.', 'Shimmer animation is disabled for reduced motion.'] },
  // Patterns
  { slug: 'filter-bar', name: 'FilterBar', category: 'Patterns', components: ['FilterBar'], summary: 'Search and filter area for list reports.', keyboard: [k('Enter', 'Applies filters (Go)')], a11y: ['A `search` landmark form; the toggle exposes `aria-expanded` and `aria-controls`.'] },
  { slug: 'master-detail', name: 'MasterDetail', category: 'Patterns', components: ['MasterDetail'], summary: 'List and details side by side, or one at a time on small screens.', a11y: ['Panes are labelled regions; on phones a back button returns to the list.'] },
  { slug: 'object-page', name: 'ObjectPage', category: 'Patterns', components: ['ObjectPage'], summary: 'Displays one business object with a rich header and sections.', a11y: ['Sections are labelled regions with `<h2>` headings.', 'The anchor bar marks the visible section with `aria-current` and moves focus to the section heading.', 'Smooth scrolling is disabled for reduced motion.'] },
  { slug: 'detail-panel', name: 'DetailPanel', category: 'Patterns', components: ['DetailPanel'], summary: 'Side panel with details of a selected object.', keyboard: [k('Escape', 'Closes the panel')], a11y: ['Overlay mode is a modal dialog with focus trapping and restoration; inline mode is a labelled region.'] },
  { slug: 'wizard', name: 'Wizard', category: 'Patterns', components: ['Wizard'], summary: 'Guides users through a multi-step task.', a11y: ['The step list marks the current step with `aria-current="step"` and completed steps in text.', 'Focus moves to the step heading on navigation; validation errors are announced.'] },
  { slug: 'dashboard', name: 'Dashboard', category: 'Patterns', components: ['Dashboard', 'DashboardWidget'], summary: 'A responsive grid of KPI tiles and cards.', a11y: ['A labelled region; widgets keep DOM order on all breakpoints.'] },
  {
    slug: 'command-toolbar', name: 'CommandToolbar', category: 'Patterns', components: ['CommandToolbar'],
    summary: 'Action toolbar that overflows into a “More” menu.',
    keyboard: [k('← / →', 'Moves between toolbar buttons'), k('Enter / Space', 'Activates')],
    a11y: ['`role="toolbar"` with a name; overflowed actions remain reachable in the menu.'],
  },
  {
    slug: 'list-report', name: 'ListReport', category: 'Patterns', components: ['ListReport'],
    summary: 'An adapter-backed record listing with filters, saved-view state, selection, sorting and pagination.',
    a11y: ['Filter tokens have named removal buttons; select-all applies to the current page.', 'Loading, error and stale-data states are exposed in the grid.', 'Applications must validate backend permissions before bulk operations.'],
    related: ['filter-bar', 'data-grid', 'bulk-action-bar'],
  },
  {
    slug: 'bulk-action-bar', name: 'BulkActionBar', category: 'Patterns', components: ['BulkActionBar'],
    summary: 'Runs selection-scoped actions with confirmation, partial results, retry and optional backend-supported undo.',
    keyboard: [k('Tab', 'Moves between actions'), k('Escape', 'Cancels a confirmation')],
    a11y: ['Destructive actions require an alert dialog.', 'Results identify each failed or unconfirmed record; uncertain outcomes are not automatically retried.'],
    related: ['list-report', 'alert-dialog'],
  },
  {
    slug: 'object-editor', name: 'ObjectEditor', category: 'Patterns', components: ['ObjectEditor'],
    summary: 'Edit an immutable record snapshot with validation, version conflicts, unsaved-change protection and explicit conflict resolution.',
    keyboard: [k('Tab', 'Moves between editor controls'), k('Escape', 'Cancels the discard confirmation')],
    a11y: ['Applications must associate field errors with their controls.', 'Unsaved changes and errors are announced; in-app routing must call requestNavigation.'],
    related: ['object-page', 'alert-dialog'],
  },
  {
    slug: 'approval-workflow', name: 'ApprovalWorkflow', category: 'Patterns', components: ['ApprovalWorkflow'],
    summary: 'Controlled presentation for approval decisions, due dates and backend-provided decision history.',
    keyboard: [k('Tab', 'Moves through comment and decision controls'), k('Escape', 'Cancels confirmation')],
    a11y: ['Decision errors are announced.', 'Authorization and workflow history must be enforced by the backend.'],
    related: ['object-page', 'alert-dialog'],
  },
  {
    slug: 'activity-feed', name: 'ActivityFeed', category: 'Patterns', components: ['ActivityFeed'],
    summary: 'Chronological business activity with host-managed filtering and incremental loading.',
    a11y: ['Events use ordered lists and time elements.', 'Loading and errors are announced; filtering and pagination are supplied by the host.'],
    related: ['object-page', 'audit-trail'],
  },
  {
    slug: 'audit-trail', name: 'AuditTrail', category: 'Patterns', components: ['AuditTrail'],
    summary: 'Displays authoritative audit records and before-and-after field values.',
    a11y: ['Each change table has a caption and labelled headers.', 'Applications must obtain audit data from an authoritative service, not client events.'],
    related: ['activity-feed', 'object-page'],
  },
  { slug: 'empty-state', name: 'EmptyState', category: 'Patterns', components: ['EmptyState'], summary: 'Explains missing content and offers next steps.', a11y: ['The illustration is decorative; the title is a heading at a configurable level.'] },
];

export const docsBySlug = new Map(docs.map((d) => [d.slug, d]));
