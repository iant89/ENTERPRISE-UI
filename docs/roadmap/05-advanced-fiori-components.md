## Advanced / Fiori components

### [BarcodeScannerDialog](https://ui5.github.io/webcomponents/nightly/components/fiori/BarcodeScannerDialog/)

- Tag: `ui5-barcode-scanner-dialog`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/BarcodeScannerDialog.d.ts).
- Local implementation: `src/components/barcode-scanner-dialog` (React adaptation: getUserMedia rear camera, vendored, lazily loaded `@zxing/library` decoder by default with opt-in native BarcodeDetector, manual entry; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `BarcodeScannerDialog` component provides barcode scanning functionality for all devices that support the `MediaDevices.getUserMedia()` native API.
Opening the dialog launches the device camera and scans for known barcode formats.

A `scanSuccess` event fires whenever a barcode is identified
and a `scanError` event fires when the scan failed (for example, due to missing permissions).

Internally, the component  uses the zxing-js/library third party OSS.

For a list of supported barcode formats, see the [zxing-js/library](https://github.com/zxing-js/library) documentation.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Indicates whether the dialog is open. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `footer` | `Slot<HTMLElement>` | Defines the footer HTML Element.<br><br>**Note:** When you provide custom content for the `footer` slot, the default close button is not rendered.<br>This means you need to include your own mechanism within the custom `footer` to close the dialog,<br>such as a button with an event listener that closes the dialog.<br><br>**Note:** If the `footer` slot is not provided, a default footer with a close button is rendered automatically,<br>allowing users to close the dialog without any additional implementation. |
| `header` | `Slot<HTMLElement>` | Defines the header HTML Element.<br><br>**Note:** If `header` slot is provided, the labelling of the dialog is a responsibility of the application developer.<br>`accessibleName` should be used. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `close` | `CustomEvent` | true | false | Fired when the user closes the component. |
| `scan-error` | `CustomEvent<BarcodeScannerDialogScanErrorEventDetail>` | true | false | Fires when the scan fails with error. |
| `scan-success` | `CustomEvent<BarcodeScannerDialogScanSuccessEventDetail>` | true | false | Fires when the scan is completed successfully. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/BarcodeScannerDialog/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/BarcodeScannerDialog/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/BarcodeScannerDialog/Basic/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `open`.
- [ ] Verify `close`, `scan-error`, `scan-success` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [DynamicPage](https://ui5.github.io/webcomponents/nightly/components/fiori/DynamicPage/)

- Tag: `ui5-dynamic-page`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/DynamicPage.d.ts).
- Local implementation: `src/components/dynamic-page` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

A layout component, representing a web page, consisting of a title, header with dynamic behavior, a content area, and an optional floating footer.

The component consist of several components:

- `DynamicPageTitle` - a component, holding the title of the page, the navigation actions and the content. The displayed content changes based on the current mode of the `DynamicPageHeader`.
- `DynamicPageHeader` - a generic container, which can contain a single layout component and any other HTML elements. The header works in two modes - expanded and snapped and its behavior can be adjusted with the help of different properties.
- `Content area` - a generic container, which can have a single UI5 layout.
- `Footer` - positioned at the bottom with a small offset and used for additional actions, the footer floats above the content.

##### Usage

Use the `DynamicPage` if you need to have a title, that is always visible
and a header, that has configurable Expanding/Snapping functionality.
If you don't need the Expanding/Snapping functionality it is better to use the
`ui5-page` as a lighter component.

The app can add to the `default` slot of the ui5-dynamic-page either content that is designed to fit its container (e.g. has 100% height),
or content with own height that may overflow its container. In the second case the `DynamicPage` will show a scrollbar that allows the user
scroll through the content.

##### Notes:

- Snapping of the `DynamicPageTitle` is not supported in the following case:
 - When the `DynamicPage` has a scroll bar, the component usually scrolls to the snapping point - the point, where the `DynamicPageHeader` is scrolled out completely. However, when there is a scroll bar, but not enough content to reach the snapping point, the snapping is not possible using scrolling.

##### Responsive Behavior

Dynamic page web component implements the responsive paddings design.

##### Keyboard Handling


##### Basic Navigation

- [SPACE, ENTER, RETURN] - If focus is on a button inside DynamicPageTitle its action is being triggered, once activated.
If focus is on the snap header button (arrow button), or on the header itself, once activated, it triggers the associated action (such as snap/expand the header).
If focus is on pin button (the button with pin icon on the bottom of the header), once activated, it triggers the associated action (pinning of the header).

##### Fast Navigation
- This component provides a build in fast navigation group which can be used via `F6 / Shift + F6` or ` Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up`.
In order to use this functionality, you need to import the following module:

- `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/DynamicPage.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `DynamicPageAccessibilityAttributes` | `{}` | Defines additional accessibility attributes on different areas of the component.<br><br>The accessibilityAttributes object has the following fields,<br>where each field is an object supporting one or more accessibility attributes:<br><br> - **root**: `root.role` and `root.name`.<br> - **header**: `header.role` and `header.name`.<br> - **content**: `content.role` and `content.name`.<br> - **footer**: `footer.role` and `footer.name`.<br><br>The accessibility attributes support the following values:<br><br>- **role**: Defines the accessible ARIA landmark role of the area.<br>Accepts the following values per section:<br>`root` — `none`, `main`, `region`;<br>`header` — `none`, `banner`, `region`;<br>`content` — `none`, `main`, `region`, `form`;<br>`footer` — `none`, `contentinfo`, `region`.<br><br>- **name**: Defines the accessible ARIA name of the area.<br>Accepts any string. |
| `headerPinned` | `boolean` | `false` | Defines if the header is pinned. |
| `headerSnapped` | `boolean` | `false` | Defines if the header is snapped. |
| `hidePinButton` | `boolean` | `false` | Defines if the pin button is hidden. |
| `showFooter` | `boolean` | `false` | Defines if the footer is shown. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the Dynamic Page. |
| `footerArea` | `Slot<HTMLElement>` | Defines the footer HTML Element. |
| `headerArea` | `Slot<DynamicPageHeader>` | Defines the header HTML Element. |
| `titleArea` | `Slot<DynamicPageTitle>` | Defines the title HTML Element. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `pin-button-toggle` | `CustomEvent` | true | false | Fired when the pin header button is toggled. |
| `title-toggle` | `CustomEvent` | true | false | Fired when the expand/collapse area of the title is toggled. |

#### CSS parts

- `content`: Used to style the content of the component
- `fit-content`: Used to style the fit content container of the component.
- `footer`: Used to style the footer of the component

#### Samples

- [Basic Usage](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicPage/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicPage/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicPage/Basic/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `headerPinned`, `headerSnapped`.
- [ ] Verify `pin-button-toggle`, `title-toggle` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states

### [DynamicPageHeader](https://ui5.github.io/webcomponents/nightly/components/fiori/DynamicPageHeader/)

- Tag: `ui5-dynamic-page-header`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/DynamicPageHeader.d.ts).
- Local implementation: `src/components/dynamic-page` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

Header of the DynamicPage.

##### Overview

The DynamicPageHeader `ui5-dynamic-page-header` is part of the DynamicPage family
and is used to serve as header of the `DynamicPage`.

##### Usage

The `DynamicPageHeader` can hold any layout control and has two states - expanded
and collapsed (snapped). The switching between these states happens when:
- the user scrolls below its bottom margin
- the user clicks on the `DynamicPageTitle`
- through the `DynamicPage` property `headerSnapped`

##### Responsive Behavior

The responsive behavior of the `DynamicPageHeader` depends on the behavior of the
content that is displayed.

##### Accessibility

The `DynamicPageHeader` provides an accessible label for the header region.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA label for the header region.<br>Overrides the default "Header Expanded" / "Header Snapped" text. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the Dynamic Page Header. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [DynamicPageTitle](https://ui5.github.io/webcomponents/nightly/components/fiori/DynamicPageTitle/)

- Tag: `ui5-dynamic-page-title`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/DynamicPageTitle.d.ts).
- Local implementation: `src/components/dynamic-page` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

Title of the `DynamicPage`.

The `DynamicPageTitle` component is part of the `DynamicPage`
family and is used to serve as title of the `DynamicPage`.

##### Usage

The `DynamicPageTitle` can hold any component and displays the most important
information regarding the object that will always remain visible while scrolling.

**Note:** The `actions` slot accepts any UI5 web component, but it's
recommended to use `ui5-toolbar`.

The user can switch between the expanded/collapsed states of the
`DynamicPage` by clicking on the `DynamicPageTitle`
or by using the expand/collapse visual indicators, positioned at the bottom of the
`DynamicPageTitle` and the `DynamicPageHeader` inside `ui5-dynamic-page-header-actions`.

##### Responsive Behavior

The responsive behavior of the `DynamicPageTitle` depends on the behavior of the
content that is displayed.

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `actionsBar` | `Slot<HTMLElement>` | Defines the bar with actions in the Dynamic page title. |
| `breadcrumbs` | `Slot<HTMLElement>` | Defines the content of the breadcrumbs inside Dynamic Page Title. |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the Dynamic page title. |
| `heading` | `Slot<HTMLElement>` | Defines the content of the Heading of the Dynamic Page.<br><br>The font size of the title within the `heading` slot can be adjusted to the recommended values using the following CSS variables:<br><br>**Expanded:** `var(--sapObjectHeader_Title_FontSize)`<br><br>**Collapsed:** `var(--sapObjectHeader_Title_SnappedFontSize)` |
| `navigationBar` | `Slot<Toolbar>` | Defines the bar with navigation actions in the Dynamic page title. |
| `snappedHeading` | `Slot<HTMLElement>` | Defines the heading that is shown only when the header is snapped. |
| `snappedSubheading` | `Slot<HTMLElement>` | Defines the content of the title that is shown only when the header is snapped. |
| `snappedTitleOnMobile` | `Slot<Title>` | Defines the content of the snapped title on mobile devices.<br><br>This slot is displayed only when the `DynamicPageTitle` is in the snapped state on mobile devices.<br>It should be used to provide a simplified, single-line title that takes up less space on smaller screens.<br><br>**Note:**<br>- The content set in this slot **overrides** all other content set in the `DynamicPageTitle` slots when displayed.<br>- The slot is intended for a single `ui5-title` component. |
| `subheading` | `Slot<HTMLElement>` | Defines the content of the title that is shown only when the header is not snapped. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.

#### Empty documentation fields

- TypeScript properties
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [DynamicSideContent](https://ui5.github.io/webcomponents/nightly/components/fiori/DynamicSideContent/)

- Tag: `ui5-dynamic-side-content`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/DynamicSideContent.d.ts).
- Local implementation: `src/components/dynamic-side-content` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The DynamicSideContent (`ui5-dynamic-side-content`) is a layout component that allows additional content
to be displayed in a way that flexibly adapts to different screen sizes. The side
content appears in a container next to or directly below the main content
(it doesn't overlay). When the side content is triggered, the main content becomes
narrower (if appearing side-by-side). The side content contains a separate scrollbar
when appearing next to the main content.

##### Usage

*When to use?*

Use this component if you want to display relevant information that is not critical
for users to complete a task. Users should have access to all the key functions and
critical information in the app even if they do not see the side content. This is
important because on smaller screen sizes it may be difficult to display the side
content in a way that is easily accessible for the user.

*When not to use?*

Don't use it if you want to display navigation or critical information that prevents
users from completing a task when they have no access to the side content.

##### Responsive Behavior

Screen width \> 1440px

- Main vs. side content ratio is 75 vs. 25 percent (with a minimum of 320px
each).
- If the application defines a trigger, the side content can be hidden.

Screen width \<\= 1440px and \> 1024px

- Main vs. side content ratio is 66.666 vs. 33.333 percent (with a minimum of
320px each). If the side content width falls below 320 px, it automatically slides
under the main content, unless the app development team specifies that it should
disappear.

Screen width \<\= 1024px and \> 720px

- The side content ratio is fixed to 340px, and the main content takes the rest
of the width. Only if the `sideContentFallDown` is set to `OnMinimumWidth`
and screen width is \<\= 960px and \> 720px the side content falls below the main content.

Screen width \<\= 720px (for example on a mobile device)

- In this case, the side content automatically disappears from the screen (unless
specified to stay under the content by setting of `sideContentVisibility`
property to `AlwaysShow`) and can be triggered from a pre-set trigger
(specified within the app). When the side content is triggered, it replaces the main
content. We recommend that you always place the trigger for the side content in the
same location, such as in the app footer.

A special case allows switching the comparison mode between the main and side content.
In this case, the screen is split into 50:50 percent for main vs. side content. The
responsive behavior of the equal split is the same as in the standard view - the
side content disappears on screen widths of less than 720 px and can only be
viewed by triggering it.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/DynamicSideContent.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `DynamicSideContentAccessibilityAttributes` | `{}` | Defines additional accessibility attributes on different areas of the component.<br><br>The accessibilityAttributes object has the following fields:<br><br>- **mainContent**:<br>  - **ariaLabel**: defines the aria-label of the main content area. Accepts any string.<br>  - **role**: defines the role of the main content area. When not set, defaults to `"main"`. Set to `undefined` to remove the role attribute.<br><br>- **sideContent**:<br>  - **ariaLabel**: defines the aria-label of the side content area. Accepts any string.<br>  - **role**: defines the role of the side content area. When not set, defaults to `"complementary"`. Set to `undefined` to remove the role attribute. |
| `equalSplit` | `boolean` | `false` | Defines whether the component is in equal split mode. In this mode, the side and<br>the main content take 50:50 percent of the container on all screen sizes<br>except for phone, where the main and side contents are switching visibility<br>using the toggle method. |
| `hideMainContent` | `boolean` | `false` | Defines the visibility of the main content. |
| `hideSideContent` | `boolean` | `false` | Defines the visibility of the side content. |
| `sideContentFallDown` | `` `${SideContentFallDown}` `` | `"OnMinimumWidth"` | Defines on which breakpoints the side content falls down below the main content. |
| `sideContentPosition` | `` `${SideContentPosition}` `` | `"End"` | Defines whether the side content is positioned before the main content (left side<br>in LTR mode), or after the the main content (right side in LTR mode). |
| `sideContentVisibility` | `` `${SideContentVisibility}` `` | `"ShowAboveS"` | Defines on which breakpoints the side content is visible. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the main content. |
| `sideContent` | `Slot<HTMLElement>` | Defines the side content. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `layout-change` | `CustomEvent<DynamicSideContentLayoutChangeEventDetail>` | true | false | Fires when the current breakpoint has been changed. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `toggleContents` | `toggleContents(): void;` | Toggles visibility of main and side contents on S screen size (mobile device). |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicSideContent/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicSideContent/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicSideContent/Basic/main.js).
- [Side Content Position](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicSideContent/SideContentPosition/sample.tsx) — The side content can be placed at the "Start" or at the "End" via the `sideContentPosition` property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicSideContent/SideContentPosition/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicSideContent/SideContentPosition/main.js).
- [Equal Split](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicSideContent/EqualSplit/sample.tsx) — When `equalSplit` property is set, the main and side contents take equal space.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicSideContent/EqualSplit/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/DynamicSideContent/EqualSplit/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `equalSplit`, `hideMainContent`.
- [ ] Verify `layout-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- CSS parts
- CSS custom states

### [FilterItem](https://ui5.github.io/webcomponents/nightly/components/fiori/FilterItem/)

- Tag: `ui5-filter-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/FilterItem.d.ts).
- Local implementation: `src/components/view-settings-dialog` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-filter-item` component defines the filtering criteria for data in `ui5-view-settings-dialog`.
It represents a single filter category that contains multiple filter options that users can select.

##### Usage

The `ui5-filter-item` is used within the `ui5-view-settings-dialog` to provide filtering options.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/FilterItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `additionalText` | `string \| undefined` | `undefined` | Defines the additional text of the filter item.<br>This text is typically used to show the number of selected filter options within this category. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the filter item. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `values` | `Slot<FilterItemOption>` | Defines the filter options available for this filter category. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `additionalText`, `text`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [FilterItemOption](https://ui5.github.io/webcomponents/nightly/components/fiori/FilterItemOption/)

- Tag: `ui5-filter-item-option`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/FilterItemOption.d.ts).
- Local implementation: `src/components/view-settings-dialog` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-filter-item-option` component defines individual filter values within a `ui5-filter-item`.
It represents a single selectable option that users can choose to filter data.

##### Usage

The `ui5-filter-item-option` is used as a child component within `ui5-filter-item` in the context
of `ui5-view-settings-dialog`. Each option represents a specific value that can be used for filtering

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/FilterItemOption.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `selected` | `boolean` | `false` | Defines if the filter option is selected. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the filter option. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `selected`, `text`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [FlexibleColumnLayout](https://ui5.github.io/webcomponents/nightly/components/fiori/FlexibleColumnLayout/)

- Tag: `ui5-flexible-column-layout`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/FlexibleColumnLayout.d.ts).
- Local implementation: `src/components/flexible-column-layout` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `FlexibleColumnLayout` implements the list-detail-detail paradigm by displaying up to three pages in separate columns.
There are several possible layouts that can be changed either with the component API, or by dragging the column separators.

##### Usage

Use this component for applications that need to display several logical levels of related information side by side (e.g. list of items, item, sub-item, etc.).
The Component is flexible in a sense that the application can focus the user's attention on one particular column.

##### Responsive Behavior

The `FlexibleColumnLayout` automatically displays the maximum possible number of columns based on `layout` property and the window size.
The component would display 1 column for window size smaller than 599px, up to two columns between 599px and 1023px,
and 3 columns for sizes bigger than 1023px.

**Note:** When the component displays more than one column, the minimal width of each column is 248px. Consequently, when the user drags a column separator to resize the columns, the minimal allowed width of any resized column is 248px.

##### Keyboard Handling

##### Basic Navigation

When a column separator is focused,  the following keyboard
shortcuts allow the user to resize the columns and change the layout:

- [Shift] + [Left] or [Shift] + [Right] - Moves the separator to the left or right, which resizes the columns accordingly.
- [Left] or [Right] - Moves the separator to the left or right with a bigger step, which resizes the columns accordingly.
- [Home] - Moves the separator to the start position.
- [End] - Moves the separator to the end position.
- This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/FlexibleColumnLayout.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `FCLAccessibilityAttributes` | `{}` | Defines additional accessibility attributes on different areas of the component.<br><br>The accessibilityAttributes object has the following fields,<br>where each field is an object supporting one or more accessibility attributes:<br><br> - **startColumn**: `startColumn.role` and `startColumn.name`.<br> - **midColumn**: `midColumn.role` and `midColumn.name`.<br> - **endColumn**: `endColumn.role` and `endColumn.name`.<br> - **startSeparator**: `startSeparator.role` and `startSeparator.name`.<br> - **endSeparator**: `endSeparator.role` and `endSeparator.name`.<br><br>The accessibility attributes support the following values:<br><br>- **role**: Defines the accessible ARIA landmark role of the area.<br>Accepts the following values: `none`, `complementary`, `contentinfo`, `main` or `region`.<br><br>- **name**: Defines the accessible ARIA name of the area.<br>Accepts any string. |
| `columnLayout` | `FlexibleColumnLayoutColumnLayout \| undefined` | `undefined` | Returns the current column layout, based on both the `layout` property and the screen size.<br><br>**For example:** ["67%", "33%", 0], ["100%", 0, 0], ["25%", "50%", "25%"], etc,<br>where the numbers represents the width of the start, middle and end columns. |
| `disableResizing` | `boolean` | `false` | Specifies if the user is allowed to change the columns layout by dragging the separator between the columns. |
| `endColumnVisible` | `boolean` | `false` | Returns if the `end` column is visible. |
| `layout` | `` `${FCLLayout}` `` | `"OneColumn"` | Defines the columns layout and their proportion.<br><br>**Note:** The layout also depends on the screen size - one column for screens smaller than 599px,<br>two columns between 599px and 1023px and three columns for sizes bigger than 1023px.<br><br>**For example:** layout=`TwoColumnsStartExpanded` means the layout will display up to two columns<br>in 67%/33% proportion. |
| `layoutsConfiguration` | `LayoutConfiguration` | `{}` | Allows to customize the column proportions per screen size and layout.<br>If no custom proportion provided for a specific layout, the default will be used.<br><br>**Notes:**<br><br>- The proportions should be given in percentages. For example ["30%", "40%", "30%"], ["70%", "30%", 0], etc.<br>- The proportions should add up to 100%.<br>- Hidden columns are marked as "0px", e.g. ["0px", "70%", "30%"]. Specifying 0 or "0%" for hidden columns is also valid.<br>- If the proportions do not match the layout (e.g. if provided proportions ["70%", "30%", "0px"] for "OneColumn" layout), then the default proportions will be used instead.<br>- Whenever the user drags the columns separator to resize the columns, the `layoutsConfiguration` object will be updated with the user-specified proportions for the given layout (and the `layout-configuration-change` event will be fired).<br>- No custom configuration available for the phone screen size, as the default of 100% column width is always used there. |
| `midColumnVisible` | `boolean` | `false` | Returns if the `middle` column is visible. |
| `startColumnVisible` | `boolean` | `true` | Returns if the `start` column is visible. |
| `visibleColumns` | `number` | `1` | Returns the number of currently visible columns. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `endColumn` | `Slot<HTMLElement>` | Defines the content in the end column. |
| `midColumn` | `Slot<HTMLElement>` | Defines the content in the middle column. |
| `startColumn` | `Slot<HTMLElement>` | Defines the content in the start column. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `layout-change` | `CustomEvent<FlexibleColumnLayoutLayoutChangeEventDetail>` | true | false | Fired when the layout changes via user interaction by dragging the separators<br>or by changing the component size due to resizing. |
| `layout-configuration-change` | `CustomEvent<FlexibleColumnLayoutLayoutConfigurationChangeEventDetail>` | true | false | Fired when the `layoutsConfiguration` changes via user interaction by dragging the separators.<br><br>**Note:** The `layout-configuration-change` event is in an experimental state and is a subject to change. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/FlexibleColumnLayout/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/FlexibleColumnLayout/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/FlexibleColumnLayout/Basic/main.js).
- [Layouts Configuration](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/FlexibleColumnLayout/LayoutsConfiguration/sample.tsx) — The FlexibleColumnLayout supports customization of the column sizes within the limits of the current layout.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/FlexibleColumnLayout/LayoutsConfiguration/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/FlexibleColumnLayout/LayoutsConfiguration/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `columnLayout`, `disableResizing`.
- [ ] Verify `layout-change`, `layout-configuration-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [GroupItem](https://ui5.github.io/webcomponents/nightly/components/fiori/GroupItem/)

- Tag: `ui5-group-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/GroupItem.d.ts).
- Local implementation: `src/components/view-settings-dialog` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-group-item` component defines the grouping criteria for data in `ui5-view-settings-dialog`.
It represents a single group option that users can select to organize data into logical groups.

##### Usage

The `ui5-group-item` is used within the `ui5-view-settings-dialog` to provide grouping options.
Each group item represents a column or field by which data can be grouped.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/GroupItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `selected` | `boolean` | `false` | Defines if the group item is selected. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the group item. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `selected`, `text`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [HeroBanner](https://ui5.github.io/webcomponents/nightly/components/fiori/HeroBanner/)

- Tag: `ui5-hero-banner`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/HeroBanner.d.ts).
- Local implementation: `src/components/hero-banner` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-hero-banner` is a flexible, full-width banner designed for placement at the top of a page.
It provides a personalized greeting and quick access to key information or actions.

##### Structure

The HeroBanner consists of the following building blocks:

- **Banner Canvas** - the visual base with a background color, optional background image and shadow.
- **Overline** (optional) - contextual text at the top, e.g. the current date or a status message.
- **Header** (optional) - the main greeting header below the overline, e.g. "Hello, John".
- **Free Slots** (optional) - customizable content areas that can contain KPI cards, search components, text, buttons, etc.

The banner is not sticky — it scrolls away with the page content when the user scrolls down.

##### Usage

Place the `ui5-hero-banner` at the top of a page to welcome the user and surface relevant
information or shortcuts at a glance.

The hero banner itself is non-interactive. However, interactive elements such as buttons, cards,
or search fields can be placed inside the free content slots and will follow their own
interactive states.

##### Responsive Behavior

The hero banner adapts to different screen sizes:
- On smaller screens, split layouts (Equal, FirstWider) collapse to a single stacked column.
- The heading text wraps to multiple lines as needed.
- Buttons in the headerAction slot will wrap.
- On screens ≤1024px, the header text is wrapped to a maximum of 3 lines.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/HeroBanner.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `actionsPlacement` | `` `${HeroBannerActionsPlacement}` `` | `"TopEnd"` | Defines the placement of the actions slot within the hero banner header.<br><br>- **TopEnd** (default) - Actions are displayed to the right of the header text, at the top of the header row.<br>- **BottomStart** - Actions are displayed below the header text, left-aligned, regardless of `columnsRatio` or slot usage. |
| `columnsRatio` | `` `${HeroBannerColumnsRatio}` `` | `"FirstWider"` | Defines the ratio between the two content columns inside the hero banner.<br><br>Takes effect only when `endContent` is provided. When no `endContent` is present, the content spans the full width (single column).<br><br>- **Equal** - Two equal columns. Both content blocks share the available width equally.<br>  On smaller screens, both slots stack vertically.<br>- **FirstWider** - Two unequal columns. The start content takes two-thirds of the width, the end content one-third.<br>  On smaller screens, both slots stack vertically. |
| `headerBlockPlacement` | `` `${HeroBannerHeaderBlockPlacement}` `` | `"Top"` | Defines the vertical placement of the header block within the content area.<br><br>- **Top** (default) - Header block is placed at the top of the content area.<br>- **Bottom** - Header block is pushed to the bottom of column 1. Only takes effect when `columnsRatio`<br>  is `Equal` or `FirstWider` and only `endContent` is provided (no default slot content).<br>  When `actionsPlacement` is also `BottomStart`, the `endContent` slot spans the full height. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text displayed in the hero banner.<br><br>This is the main greeting header, typically a personalized message<br>such as "Hello, John". |
| `overlineText` | `string \| undefined` | `undefined` | Defines text displayed above the heading as an overline.<br>Can be used to show the current date, a status message, or any other relevant contextual information. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `actions` | `Slot<HTMLElement>` | Defines action buttons displayed to the right of the header area.<br>Typically used to display actions buttons in the top right corner.<br><br>Can contain buttons, links, or other interactive elements that provide<br>quick access to relevant actions directly from the hero banner header. |
| `default` | `DefaultSlot<HTMLElement>` | Defines the first (default) free content block of the hero banner.<br><br>This is the default slot — content placed directly inside `<ui5-hero-banner>`<br>without a slot attribute lands here.<br>Can contain KPI cards, search input fields, text, buttons, and more. |
| `endContent` | `Slot<HTMLElement>` | Defines the second free content block of the hero banner.<br><br>Used alongside `startContent` when `columnsRatio` is set (`Equal`, `FirstWider`).<br>Can contain cards, buttons, and other interactive elements. |

#### CSS parts

- `canvas`: Used to style the banner canvas container
- `content`: Used to style the content area of the banner
- `endContent`: Used to style the end content block
- `header`: Used to style the header area (salutation, date, header actions)
- `startContent`: Used to style the start (default) content block

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/Basic/main.js).
- [Columns Ratio](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/ColumnsRatio/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/ColumnsRatio/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/ColumnsRatio/main.js).
- [Header Block and Actions Placement](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/HeaderBlockAndActionsPlacement/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/HeaderBlockAndActionsPlacement/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/HeaderBlockAndActionsPlacement/main.js).
- [Custom Background Image](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/BackgroundImage/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/BackgroundImage/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/BackgroundImage/main.js).
- [Different Use Cases](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/UseCases/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/UseCases/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/HeroBanner/UseCases/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `actionsPlacement`, `columnsRatio`, `headerBlockPlacement`.

#### Empty documentation fields

- Events
- Public methods
- CSS custom states

### [IllustratedMessage](https://ui5.github.io/webcomponents/nightly/components/fiori/IllustratedMessage/)

- Tag: `ui5-illustrated-message`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/IllustratedMessage.d.ts).
- Local implementation: covered by `src/patterns/empty-state` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
An IllustratedMessage is a recommended combination of a solution-oriented message, an engaging
illustration, and conversational tone to better communicate an empty or a success state than just show
a message alone.

Each illustration has default internationalised title and subtitle texts. Also they can be managed with
`titleText` and `subtitleText` properties.

To display the desired illustration, use the `name` property, where you can find the list of all available illustrations.

**Note:** By default the “BeforeSearch” illustration is loaded. To use other illustrations, make sure you import them in addition, for example:

`import "@ui5/webcomponents-fiori/dist/illustrations/NoData.js"`

**Note:** Illustrations starting with the “Tnt” prefix are part of another illustration set. For example to use the “TntSuccess” illustration, add the following import::

`import "@ui5/webcomponents-fiori/dist/illustrations/tnt/Success.js"`

##### Structure
The IllustratedMessage consists of the following elements, which are displayed below each other in the following order:

- Illustration
- Title
- Subtitle
- Actions

##### Usage
`ui5-illustrated-message` is meant to be used inside container component, for example a `ui5-card`,
a `ui5-dialog` or a `ui5-page`

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/IllustratedMessage.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `decorative` | `boolean` | `false` | Defines whether the illustration is decorative.<br><br>When set to `true`, the attributes `role="presentation"` and `aria-hidden="true"` are applied to the SVG element. |
| `design` | `` `${IllustrationMessageDesign}` `` | `"Auto"` | Determines which illustration breakpoint variant is used.<br><br>As `IllustratedMessage` adapts itself around the `Illustration`, the other<br>elements of the component are displayed differently on the different breakpoints/illustration designs. |
| `name` | `string` | `"BeforeSearch"` | Defines the illustration name that will be displayed in the component.<br><br>Example:<br><br>`name='BeforeSearch'`, `name='UnableToUpload'`, etc..<br><br>**Note:** To use the TNT illustrations,<br>you need to set the `tnt` or `Tnt` prefix in front of the icon's name.<br><br>Example:<br><br>`name='tnt/Avatar'` or `name='TntAvatar'`.<br><br>**Note:** By default the `BeforeSearch` illustration is loaded.<br>When using an illustration type, other than the default, it should be loaded in addition:<br><br>`import "@ui5/webcomponents-fiori/dist/illustrations/NoData.js";`<br><br>For TNT illustrations:<br><br>`import "@ui5/webcomponents-fiori/dist/illustrations/tnt/SessionExpired.js";` |
| `subtitleText` | `string \| undefined` | `undefined` | Defines the subtitle of the component.<br><br>**Note:** Using this property, the default subtitle text of illustration will be overwritten.<br><br>**Note:** Using `subtitle` slot, the default of this property will be overwritten. |
| `titleText` | `string \| undefined` | `undefined` | Defines the title of the component.<br><br>**Note:** Using this property, the default title text of illustration will be overwritten. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IButton>` | Defines the component actions.<br><br>**Note:** Not displayed when the `design` property is set to `Base`. |
| `subtitle` | `Slot<HTMLElement>` | Defines the subtitle of the component.<br><br>**Note:** Using this slot, the default subtitle text of illustration and the value of `subtitleText` property will be overwritten. |
| `title` | `Slot<HTMLElement> & string` | Defines the title of the component.<br><br>**Note:** Using this slot, the default title text of illustration and the value of `title` property will be overwritten. |

#### CSS parts

- `subtitle`: Used to style the subtitle wrapper of the `ui5-illustrated-message`

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/IllustratedMessage/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/IllustratedMessage/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/IllustratedMessage/Basic/main.js).
- [Custom Title](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/IllustratedMessage/CustomTitle/sample.tsx) — By default the IllustratedMessage displays built-in title, but a custom title can be also set.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/IllustratedMessage/CustomTitle/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/IllustratedMessage/CustomTitle/main.js).
- [IllustratedMessage in Dialog](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/IllustratedMessage/WithDialog/sample.tsx) — In general IllustratedMessage can be displayed in many places and cases - one of them is inside Dialog.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/IllustratedMessage/WithDialog/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/IllustratedMessage/WithDialog/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleNameRef`, `decorative`, `design`.

#### Empty documentation fields

- Events
- Public methods
- CSS custom states

### [MediaGallery](https://ui5.github.io/webcomponents/nightly/components/fiori/MediaGallery/)

- Tag: `ui5-media-gallery`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/MediaGallery.d.ts).
- Local implementation: `src/components/media-gallery` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-media-gallery` component allows the user to browse through multimedia items. Currently,
the supported items are images and videos. The items should be defined using the `ui5-media-gallery-item`
component.

The items are initially displayed as thumbnails. When the user selects a thumbnail, the corresponding item
is displayed in larger size.

The component is responsive by default and adjusts the position of the menu with respect to viewport size,
but the application is able to further customize the layout via the provided API.

##### Keyboard Handling
The `ui5-media-gallery` provides advanced keyboard handling.

When the thumbnails menu is focused the following keyboard
shortcuts allow the user to navigate through the thumbnail items:

- [Up] or [Down] - Navigates up and down the items
- [Home] - Navigates to first item
- [End] - Navigates to the last item
- [Space], [Enter] - Selects an item

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/MediaGallery.js";`

`import "@ui5/webcomponents-fiori/dist/MediaGalleryItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `interactiveDisplayArea` | `boolean` | `false` | If enabled, a `display-area-click` event is fired<br>when the user clicks or taps on the display area.<br><br>The display area is the central area that contains<br>the enlarged content of the currently selected item. |
| `layout` | `` `${MediaGalleryLayout}` `` | `"Auto"` | Determines the layout of the component. |
| `menuHorizontalAlign` | `` `${MediaGalleryMenuHorizontalAlign}` `` | `"Left"` | Determines the horizontal alignment of the thumbnails menu<br>vs. the central display area. |
| `menuVerticalAlign` | `` `${MediaGalleryMenuVerticalAlign}` `` | `"Bottom"` | Determines the vertical alignment of the thumbnails menu<br>vs. the central display area. |
| `showAllThumbnails` | `boolean` | `false` | If set to `true`, all thumbnails are rendered in a scrollable container.<br>If `false`, only up to five thumbnails are rendered, followed by<br>an overflow button that shows the count of the remaining thumbnails. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IMediaGalleryItem>` | Defines the component items.<br><br>**Note:** Only one selected item is allowed.<br><br>**Note:** Use the `ui5-media-gallery-item` component to define the desired items. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `display-area-click` | `CustomEvent` | true | false | Fired when the display area is clicked.<br>The display area is the central area that contains<br>the enlarged content of the currently selected item. |
| `overflow-click` | `CustomEvent` | true | false | Fired when the thumbnails overflow button is clicked. |
| `selection-change` | `CustomEvent<MediaGallerySelectionChangeEventDetail>` | true | false | Fired when selection is changed by user interaction. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Basic/main.js).
- [Vertical Layout](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Vertical/sample.tsx) — The thumbnails and selected item are vertically placed. To enable this layout - set `layout="Vertical"`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Vertical/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Vertical/main.js).
- [Horizontal Layout](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Horizontal/sample.tsx) — The thumbnails and selected item are horizontally placed. To enable this layout - set `layout="Horizontal"`. You can also define on which side of the selected item to place the thumbnails.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Horizontal/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Horizontal/main.js).
- [Custom Thumbnail](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/ThumbnailCustom/sample.tsx) — By default the image passed to the MediaGalleryItem is reused as a thumbnail. You can display another image as thumbnail via the `thumbnail` slot of the `MediaGalleryItem`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/ThumbnailCustom/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/ThumbnailCustom/main.js).
- [Selected Item](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/WithSelectedItem/sample.tsx) — You can predefine the selected item.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/WithSelectedItem/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/WithSelectedItem/main.js).
- [Disabled Item](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/WithDisabledItem/sample.tsx) — The MediaGallery can show disabled items as well.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/WithDisabledItem/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/WithDisabledItem/main.js).
- [Interactive Display Area](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Interactive/sample.tsx) — Setting `interactiveDisplayArea` property makes the display area interactive, e.g. clickable.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Interactive/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/Interactive/main.js).
- [Show Video Content](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/VideoContent/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/VideoContent/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/MediaGallery/VideoContent/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `interactiveDisplayArea`, `layout`, `menuHorizontalAlign`.
- [ ] Verify `display-area-click`, `overflow-click`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [MediaGalleryItem](https://ui5.github.io/webcomponents/nightly/components/fiori/MediaGalleryItem/)

- Tag: `ui5-media-gallery-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/MediaGalleryItem.d.ts).
- Local implementation: `src/components/media-gallery` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-media-gallery-item` web component represents the items displayed in the
`ui5-media-gallery` web component.

**Note:** `ui5-media-gallery-item` is not supported when used outside of `ui5-media-gallery`.

##### Keyboard Handling
The `ui5-media-gallery` provides advanced keyboard handling.
When focused, the user can use the following keyboard
shortcuts in order to perform a navigation:

- [Space] / [Enter] or [Return] - Trigger `ui5-click` event

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/MediaGalleryItem.js";` (comes with `ui5-media-gallery`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state. |
| `layout` | `` `${MediaGalleryItemLayout}` `` | `"Square"` | Determines the layout of the item container. |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the component. |
| `thumbnail` | `Slot<HTMLElement>` | Defines the content of the thumbnail. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `disabled`, `layout`, `selected`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [NavigationLayout](https://ui5.github.io/webcomponents/nightly/components/fiori/NavigationLayout/)

- Tag: `ui5-navigation-layout`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/NavigationLayout.d.ts).
- Local implementation: covered by `src/layouts/app-shell` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-navigation-layout` is a container component that can be used to
create a layout with a header, a side navigation and a content area.

##### Usage

Use the `ui5-navigation-layout` to create whole screen of an application with vertical navigation.

##### Responsive Behavior

On larger screens with a width of 600px or more, excluding mobile phone devices, the side navigation is visible
by default and can be expanded or collapsed using the `mode` property.
On mobile phone devices and screens with a width of 599px or less, the side navigation is hidden by
default and can be displayed using the `mode` property.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/NavigationLayout.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `` `${NavigationLayoutMode}` `` | `"Auto"` | Specifies the navigation layout mode. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content. |
| `header` | `Slot<HTMLElement>` | Defines the header. |
| `sideContent` | `Slot<SideNavigation>` | Defines the side content. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `isSideCollapsed` | `isSideCollapsed(): boolean;` | Gets whether the side navigation is collapsed. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NavigationLayout/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NavigationLayout/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NavigationLayout/Basic/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `mode`.

#### Empty documentation fields

- Events
- CSS parts
- CSS custom states

### [NotificationList](https://ui5.github.io/webcomponents/nightly/components/fiori/NotificationList/)

- Tag: `ui5-notification-list`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/NotificationList.d.ts).
- Local implementation: `src/components/notification-center` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-notification-list` web component represents
a container for `ui5-li-notification-group` and `ui5-li-notification`.

##### Keyboard Handling

##### Basic Navigation
The `ui5-notification-list` provides advanced keyboard handling.
When a list is focused the user can use the following keyboard
shortcuts in order to perform a navigation:

- [Up] or [Left] - Navigates up the items
- [Down] or [Right] - Navigates down the items
- [Home] - Navigates to first item
- [End] - Navigates to the last item

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/NotificationList.js";``

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `noDataText` | `string \| undefined` | `undefined` | Defines the text that is displayed when the component contains no items. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<NotificationListItemBase>` | Defines the items of the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `item-click` | `CustomEvent<NotificationItemClickEventDetail>` | true | true | Fired when an item is clicked. |
| `item-close` | `CustomEvent<NotificationItemCloseEventDetail>` | true | true | Fired when the `Close` button of any item is clicked. |
| `item-toggle` | `CustomEvent<NotificationItemToggleEventDetail>` | true | true | Fired when an item is toggled. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NotificationList/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NotificationList/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NotificationList/Basic/main.js).
- [Notification List with Group Items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NotificationList/GroupItems/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NotificationList/GroupItems/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NotificationList/GroupItems/main.js).
- [Notifications in ShellBar](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NotificationList/InShellBar/sample.tsx) — The main usage of the Notifications is in the ShellBar. Press the "notifications" icon on the right side of the ShellBar to show the Notifications.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NotificationList/InShellBar/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/NotificationList/InShellBar/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `noDataText`.
- [ ] Verify `item-click`, `item-close`, `item-toggle` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/notification-center` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [NotificationListGroupItem](https://ui5.github.io/webcomponents/nightly/components/fiori/NotificationListGroupItem/)

- Tag: `ui5-li-notification-group`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/NotificationListGroupItem.d.ts).
- Local implementation: covered by `NotificationCenter` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-li-notification-group` is a special type of list item,
that unlike others can group items within self, usually `ui5-li-notification` items.

The component consists of:

- `Toggle` button to expand and collapse the group
- `TitleText` to entitle the group
- Items of the group

##### Usage
The component should be used inside a `ui5-notification-list`.

##### Keyboard Handling
The `ui5-li-notification-group` provides advanced keyboard handling.
This component provides fast navigation when the header is focused using the following keyboard shortcuts:

- [Space] - toggles expand / collapse of the group
- [Plus] - expands the group
- [Minus] - collapses the group
- [Right] - expands the group
- [Left] - collapses the group

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/NotificationListGroupItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `collapsed` | `boolean` | `false` | Defines if the group is collapsed or expanded. |
| `growing` | `` `${NotificationListGrowingMode}` `` | `"None"` | Defines whether the component will have growing capability by pressing a `More` button.<br>When button is pressed `load-more` event will be fired. |
| `loading` | `boolean` | `false` | Defines if a busy indicator would be displayed over the item. |
| `loadingDelay` | `number` | `1000` | Defines the delay in milliseconds, after which the busy indicator will show up for this component. |
| `read` | `boolean` | `false` | Defines if the `notification` is new or has been already read.<br><br>**Note:** if set to `false` the `titleText` has bold font,<br>if set to true - it has a normal font. |
| `titleText` | `string \| undefined` | `undefined` | Defines the `titleText` of the item. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<NotificationListItem>` | Defines the items of the `ui5-li-notification-group`,<br>usually `ui5-li-notification` items. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `load-more` | `CustomEvent` | true | false | Fired when additional items are requested. |
| `toggle` | `CustomEvent` | true | false | Fired when the `ui5-li-notification-group` is expanded/collapsed by user interaction. |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `collapsed`, `growing`, `loading`.
- [ ] Verify `load-more`, `toggle`, `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [NotificationListItem](https://ui5.github.io/webcomponents/nightly/components/fiori/NotificationListItem/)

- Tag: `ui5-li-notification`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/NotificationListItem.d.ts).
- Local implementation: covered by `NotificationCenter` `notifications` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-li-notification` is a type of list item, meant to display notifications.

The component has a rich set of various properties that allows the user to set `avatar`, `menu`, `titleText`, descriptive `content`
and `footnotes` to fully describe a notification.

The user can:

- display a `Close` button
- can control whether the `titleText` and `description` should wrap or truncate
and display a `ShowMore` button to switch between less and more information
- add actions by using the `ui5-menu` component

**Note:** Adding custom actions by using the `ui5-notification-action` component is deprecated as of version 2.0!

##### Usage
The component should be used inside a `ui5-notification-list`.

##### Keyboard Handling

##### Basic Navigation
The user can use the following keyboard shortcuts to perform actions (such as select, delete):

- [Enter] - select an item (trigger "item-click" event)
- [Delete] - close an item (trigger "item-close" event)

##### Fast Navigation
This component provides a fast navigation using the following keyboard shortcuts:

- [Shift] + [Enter] - 'More'/'Less' link will be triggered
- [Shift] + [F10] - 'Menu' (Actions) button will be triggered (clicked)

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/NotificationListItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `importance` | `` `${NotificationListItemImportance}` `` | `"Standard"` | Defines the `Important` label of the item. |
| `loading` | `boolean` | `false` | Defines if a busy indicator would be displayed over the item. |
| `loadingDelay` | `number` | `1000` | Defines the delay in milliseconds, after which the busy indicator will show up for this component. |
| `read` | `boolean` | `false` | Defines if the `notification` is new or has been already read.<br><br>**Note:** if set to `false` the `titleText` has bold font,<br>if set to true - it has a normal font. |
| `showClose` | `boolean` | `false` | Defines if the `Close` button would be displayed. |
| `state` | `` `${ValueState}` `` | `"None"` | Defines the status indicator of the item. |
| `titleText` | `string \| undefined` | `undefined` | Defines the `titleText` of the item. |
| `wrappingType` | `` `${WrappingType}` `` | `"None"` | Defines if the `titleText` and `description` should wrap,<br>they truncate by default.<br><br>**Note:** by default the `titleText` and `description`,<br>and a `ShowMore/Less` button would be displayed. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `avatar` | `Slot<HTMLElement>` | Defines the avatar, displayed in the `ui5-li-notification`.<br><br>**Note:** Consider using the `ui5-avatar` to display icons, initials or images.<br><br>**Note:** In order to be complaint with the UX guidelines and for best experience,<br>we recommend using avatars with 2rem X 2rem in size (32px X 32px). In case you are using the `ui5-avatar`<br>you can set its `size` property to `XS` to get the required size - `<ui5-avatar size="XS"></ui5-avatar>`. |
| `default` | `DefaultSlot<Node>` | Defines the content of the `ui5-li-notification`,<br>usually a description of the notification.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |
| `footnotes` | `Slot<HTMLElement>` | Defines the elements, displayed in the footer of the of the component. |
| `menu` | `Slot<HTMLElement>` | Defines the menu, displayed in the `ui5-li-notification`.<br><br>**Note:** Use this for implementing actions.<br><br>**Note:** Should be used instead `u5-notification-action`, which is deprecated as of version 2.0. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<NotificationListItemClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key. |
| `close` | `CustomEvent<NotificationListItemCloseEventDetail>` | false | false | Fired when the `Close` button is pressed. |

#### CSS parts

- `title-text`: Used to style the titleText of the notification list item

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `importance`, `loading`, `loadingDelay`.
- [ ] Verify `click`, `close` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [Page](https://ui5.github.io/webcomponents/nightly/components/fiori/Page/)

- Tag: `ui5-page`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/Page.d.ts).
- Local implementation: `src/layouts/page` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-page` is a container component that holds one whole screen of an application.
The page has three distinct areas that can hold content - a header, content area and a footer.
##### Structure
##### Header
The top most area of the page is occupied by the header. The standard header includes a navigation button and a title.
##### Content
The content occupies the main part of the page. Only the content area is scrollable by default.
This can be prevented by setting `noScrolling` to `true`.
##### Footer
The footer is optional and occupies the part above the bottom part of the content. Alternatively, the footer can be fixed at the bottom of the page by enabling the `fixedFooter` property.

**Note:** `ui5-page` occipues the whole available space of its parent. In order to achieve the intended design you have to make sure
that there is enough space for the `ui5-page` to be rendered.
**Note:** In order for the `ui5-page` to be displayed, the parent element should have fixed height.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/Page.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `backgroundDesign` | `` `${PageBackgroundDesign}` `` | `"Solid"` | Defines the background color of the `ui5-page`.<br><br>**Note:** When a ui5-list is placed inside the page, we recommend using “List” to ensure better color contrast. |
| `fixedFooter` | `boolean` | `false` | Defines if the footer is fixed at the very bottom of the page.<br><br>**Note:** When set to true the footer is fixed at the very bottom of the page, otherwise it floats over the content with a slight offset from the bottom. |
| `hideFooter` | `boolean` | `false` | Defines the footer visibility. |
| `noScrolling` | `boolean` | `false` | Disables vertical scrolling of page content.<br>If set to true, there will be no vertical scrolling at all. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the content HTML Element. |
| `footer` | `Slot<HTMLElement>` | Defines the footer HTML Element. |
| `header` | `Slot<HTMLElement>` | Defines the header HTML Element. |

#### CSS parts

- `content`: Used to style the content section of the component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Page/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Page/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Page/Basic/main.js).
- [Fixed Footer](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Page/FixedFooter/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Page/FixedFooter/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Page/FixedFooter/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `backgroundDesign`, `fixedFooter`, `hideFooter`.
- [ ] Compare the existing `src/layouts/page` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Events
- Public methods
- CSS custom states

### [ProductSwitch](https://ui5.github.io/webcomponents/nightly/components/fiori/ProductSwitch/)

- Tag: `ui5-product-switch`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/ProductSwitch.d.ts).
- Local implementation: `src/components/product-switch` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-product-switch` is an SAP Fiori specific web component that is used in `ui5-shellbar`
and allows the user to easily switch between products.

##### Keyboard Handling
The `ui5-product-switch` provides advanced keyboard handling.
When focused, the user can use the following keyboard
shortcuts in order to perform a navigation:

- [Tab] - Move focus to the next interactive element after the `ui5-product-switch`
- [Up] or [Down] - Navigates up and down the items
- [Left] or [Right] - Navigates left and right the items

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/ProductSwitch.js";`

`import "@ui5/webcomponents-fiori/dist/ProductSwitchItem.js";` (for `ui5-product-switch-item`)

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IProductSwitchItem>` | Defines the items of the `ui5-product-switch`. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ProductSwitch/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ProductSwitch/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ProductSwitch/Basic/main.js).
- [ProductSwitch in ShellBar](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ProductSwitch/WithShellBar/sample.tsx) — Press the "grid" on the right-most part of the ShellBar to show the ProductSwitch.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ProductSwitch/WithShellBar/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ProductSwitch/WithShellBar/main.js).
- [ProductSwitchItem with "image" slot](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ProductSwitch/WithImageSlot/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ProductSwitch/WithImageSlot/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ProductSwitch/WithImageSlot/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.

#### Empty documentation fields

- TypeScript properties
- Events
- Public methods
- CSS parts
- CSS custom states

### [ProductSwitchItem](https://ui5.github.io/webcomponents/nightly/components/fiori/ProductSwitchItem/)

- Tag: `ui5-product-switch-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/ProductSwitchItem.d.ts).
- Local implementation: `src/components/product-switch` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-product-switch-item` web component represents the items displayed in the
`ui5-product-switch` web component.

**Note:** `ui5-product-switch-item` is not supported when used outside of `ui5-product-switch`.

##### Keyboard Handling
The `ui5-product-switch` provides advanced keyboard handling.
When focused, the user can use the following keyboard
shortcuts in order to perform a navigation:

- [Space] / [Enter] or [Return] - Trigger `ui5-click` event

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/ProductSwitchItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string \| undefined` | `undefined` | Defines the icon to be displayed as a graphical element within the component.<br><br>Example:<br><br>`<ui5-product-switch-item icon="palette">`<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `subtitleText` | `string \| undefined` | `undefined` | Defines the subtitle of the component. |
| `target` | `string \| undefined` | `undefined` | Defines a target where the `targetSrc` content must be open.<br><br>Available options are:<br><br>- `_self`<br>- `_top`<br>- `_blank`<br>- `_parent`<br>- `_search`<br><br>**Note:** By default target will be open in the same frame as it was clicked. |
| `targetSrc` | `string \| undefined` | `undefined` | Defines the component target URI. Supports standard hyperlink behavior. |
| `titleText` | `string \| undefined` | `undefined` | Defines the title of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `image` | `Slot<HTMLElement>` | Defines an image to be displayed instead of the standard icon.<br><br>**Note:** The image slot takes precedence over the icon property.<br>**Note:** We recommend using non-interactive ui5-avatar with size S, Square shape and Transparent colorScheme for best alignment. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | true | false | Fired when the `ui5-product-switch-item` is activated either with a<br>click/tap or by using the Enter or Space key. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `icon`, `subtitleText`, `target`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [Search](https://ui5.github.io/webcomponents/nightly/components/fiori/Search/)

- Tag: `ui5-search`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/Search.d.ts).
- Local implementation: `src/components/search-field` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

A `ui5-search` is an input with suggestions, used for user search.

The `ui5-search` consists of several elements parts:
- Scope - displays a select in the beginning of the component, used for filtering results by their scope.
- Input field - for user input value
- Clear button - gives the possibility for deleting the entered value
- Search button - a primary button for performing search, when the user has entered a search term
- Suggestions - a list with available search suggestions

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/Search.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible ARIA description of the field. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `fieldLoading` | `boolean` | `false` | Indicates whether a loading indicator should be shown in the input field. |
| `loading` | `boolean` | `false` | Indicates whether a loading indicator should be shown in the popup. |
| `noTypeahead` | `boolean` | `false` | Defines whether the value will be autcompleted to match an item. |
| `open` | `boolean` | `false` | Indicates whether the items picker is open. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the<br>component has no value.<br><br>**Note:** When `scopes` are defined and no custom placeholder is provided,<br>the placeholder automatically displays "Search in: \{selected scope name\}".<br>Setting a custom placeholder will override this automatic behavior. |
| `scopeValue` | `string \| undefined` | `""` | Defines the value of the component:<br><br>Applications are responsible for setting the correct scope value.<br><br>**Note:** If the given value does not match any existing scopes,<br>no scope will be selected and the SearchField scope component will be displayed as empty. |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the search will be shown. |
| `value` | `string` | `""` | Defines the value of the component.<br><br>**Note:** The property is updated upon typing. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `action` | `Slot<Button>` | Defines the popup footer action button. |
| `default` | `DefaultSlot<SearchItem \| SearchItemGroup>` | Defines the Search suggestion items. |
| `filterButton` | `Slot<Button>` | Defines the filter button slot, used to display an additional filtering button.<br>This slot is intended for passing a `ui5-button` with a filter icon to provide extended filtering options.<br><br>**Note:** Scope button and Filter button are mutually exclusive. |
| `illustration` | `Slot<IllustratedMessage>` | Defines the illustrated message to be shown in the popup. |
| `messageArea` | `Slot<SearchMessageArea>` | Defines the illustrated message to be shown in the popup. |
| `scopes` | `Slot<ISearchScope>` | Defines the component scope options. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `close` | `CustomEvent` | false | false | Fired when the popup is closed. |
| `input` | `CustomEvent` | true | false | Fired when typing in input or clear icon is pressed. |
| `open` | `CustomEvent` | false | false | Fired when the popup is opened. |
| `scope-change` | `CustomEvent<SearchFieldScopeSelectionChangeDetails>` | true | false | Fired when the scope has changed. |
| `search` | `CustomEvent` | true | true | Fired when the user has triggered search with Enter key or Search Button press. |

#### CSS parts

- `popover`: Used to style the suggestions popup

#### Samples

- [Basic Sample](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Basic/sample.tsx) — A Search component with enabled scope and items and filtering by scope.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Basic/main.js).
- [Filtering](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Advanced/sample.tsx) — The examples show the search message area, the search action, filtering per user input, typeahead and highlighting suggestions per user input.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Advanced/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Advanced/main.js).
- [Advanced Filtering Button](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/AdvancedFilter/sample.tsx) — This example shows how to use a custom advanced filtering button via the `filterButton` slot.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/AdvancedFilter/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/AdvancedFilter/main.js).
- [Byline items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Byline/sample.tsx) — The example shows how to display byline items with an image and description.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Byline/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Byline/main.js).
- [Show More Item](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/ShowMore/sample.tsx) — This example shows how to use a Show More Item.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/ShowMore/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/ShowMore/main.js).
- [Actions](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Actions/sample.tsx) — This example shows how to use interactive elements in search items.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Actions/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Actions/main.js).
- [Loading State](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Loading/sample.tsx) — This example shows the loading indicator during async search operations.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Loading/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Search/Loading/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleName`, `fieldLoading`.
- [ ] Verify `close`, `input`, `open`, `scope-change`, `search` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/search-field` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [SearchItem](https://ui5.github.io/webcomponents/nightly/components/fiori/SearchItem/)

- Tag: `ui5-search-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SearchItem.d.ts).
- Local implementation: covered by `SearchField` / `CommandPalette` results (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

A `ui5-search-item` is a list item, used for displaying search suggestions

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/SearchItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `deletable` | `boolean` | `false` | Defines whether the search item is deletable. |
| `description` | `string \| undefined` | `undefined` | Defines the description that appears right under the item text, if available. |
| `icon` | `string \| undefined` | `undefined` | Defines the icon name of the search item.<br>**Note:** If provided, the image slot will be ignored. |
| `scopeName` | `string \| undefined` | `undefined` | Defines the scope of the search item |
| `selected` | `boolean` | `false` | Defines whether the search item is selected. |
| `text` | `string \| undefined` | `undefined` | Defines the heading text of the search item. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `actions` | `Slot<HTMLElement>` | Defines the actionable elements.<br>This slot allows placing additional interactive elements (such as buttons, icons, or tags)<br>next to the delete button, providing flexible customization for various user actions.<br><br>**Note:** While the slot is flexible, for consistency with design guidelines,<br>it's recommended to use `ui5-button` with `Transparent` design or `ui5-icon` elements. |
| `image` | `Slot<HTMLElement>` | **Note:** While the slot allows the option of setting a custom avatar, to comply with the<br>design guidelines, use the `ui5-avatar` with size - XS. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `delete` | `CustomEvent` | false | false | Fired when delete button is pressed. |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `deletable`, `description`, `icon`.
- [ ] Verify `delete`, `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [SearchItemGroup](https://ui5.github.io/webcomponents/nightly/components/fiori/SearchItemGroup/)

- Tag: `ui5-search-item-group`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SearchItemGroup.d.ts).
- Local implementation: covered by `CommandPalette` groups (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-search-item-group` is type of suggestion item,
that can be used to split the `ui5-search-item` suggestions into groups.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `headerAccessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the header. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text of the group. |
| `wrappingType` | `` `${WrappingType}` `` | `"None"` | Defines if the text of the component should wrap when it's too long.<br>When set to "Normal", the content (title, description) will be wrapped<br>using the `ui5-expandable-text` component.<br/><br><br>The text can wrap up to 100 characters on small screens (size S) and<br>up to 300 characters on larger screens (size M and above). When text exceeds<br>these limits, it truncates with an ellipsis followed by a text expansion trigger.<br><br>Available options are:<br>- `None` (default) - The text will truncate with an ellipsis.<br>- `Normal` - The text will wrap (without truncation). |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ListItemBase>` | Defines the items of the group. |
| `header` | `Slot<ListItemBase>` | Defines the header of the component.<br><br>**Note:** Using this slot, the default header text of group and the value of `headerText` property will be overwritten. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `move` | `CustomEvent<ListItemGroupMoveEventDetail>` | true | false | Fired when a movable list item is dropped onto a drop target.<br><br>**Note:** `move` event is fired only if there was a preceding `move-over` with prevented default action. |
| `move-over` | `CustomEvent<ListItemGroupMoveEventDetail>` | true | true | Fired when a movable list item is moved over a potential drop target during a dragging operation.<br><br>If the new position is valid, prevent the default action of the event using `preventDefault()`. |

#### CSS parts

- `header`: Used to style the header item of the group
- `title`: Used to style the title of the group header

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `headerAccessibleName`, `headerText`, `wrappingType`.
- [ ] Verify `move`, `move-over` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [SearchItemShowMore](https://ui5.github.io/webcomponents/nightly/components/fiori/SearchItemShowMore/)

- Tag: `ui5-search-item-show-more`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SearchItemShowMore.d.ts).
- Local implementation: covered by `CommandPalette` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

A `ui5-search-item-show-more` is a special type of ui5-li that acts as a button to progressively reveal additional (overflow) items within a group.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/SearchItemShowMore.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `itemsToShowCount` | `number \| undefined` | `undefined` | Specifies the number of additional items available to show.<br>If no value is defined, the control shows "Show more" (without any counter).<br>If a number is provided, it displays "Show more (N)", where N is that number. |
| `selected` | `boolean` | `false` | Defines whether the show more item is selected. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ShowMoreItemClickEventDetail>` | true | true | Fired when the component is activated, either with a mouse/tap<br>or by pressing the Enter or Space keys. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `itemsToShowCount`, `selected`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [SearchMessageArea](https://ui5.github.io/webcomponents/nightly/components/fiori/SearchMessageArea/)

- Tag: `ui5-search-message-area`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SearchMessageArea.d.ts).
- Local implementation: covered by `SearchField` status text (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

Module import: `import "@ui5/webcomponents-fiori/dist/SearchMessageArea.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `description` | `string \| undefined` | `undefined` | Defines the description text to be displayed. |
| `text` | `string \| undefined` | `undefined` | Defines the text to be displayed. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `description`, `text`.

#### Empty documentation fields

- Description and keyboard interaction
- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [SearchScope](https://ui5.github.io/webcomponents/nightly/components/fiori/SearchScope/)

- Tag: `ui5-search-scope`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SearchScope.d.ts).
- Local implementation: covered by `SearchField` + `Select` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-search-scope` represents the options for the scope in `ui5-search`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | `""` | Defines the text of the component. |
| `value` | `string \| undefined` | `undefined` | Defines the value of the `ui5-search-scope`.<br>Used for selection in Search scopes. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `text`, `value`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [ShellBar](https://ui5.github.io/webcomponents/nightly/components/fiori/ShellBar/)

- Tag: `ui5-shellbar`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/ShellBar.d.ts).
- Local implementation: `src/components/application-header` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-shellbar` is meant to serve as an application header
and includes numerous built-in features, such as: logo, profile image/icon, title, search field, notifications and so on.

##### Stable DOM Refs

You can use the following stable DOM refs for the `ui5-shellbar`:

- logo
- notifications
- overflow
- profile
- product-switch

##### Keyboard Handling

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/ShellBar.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `ShellBarAccessibilityAttributes` | `{}` | Defines additional accessibility attributes on different areas of the component.<br><br>The accessibilityAttributes object has the following fields,<br>where each field is an object supporting one or more accessibility attributes:<br><br>- **logo** - `logo.role` and `logo.name`.<br>- **notifications** - `notifications.expanded` and `notifications.hasPopup`.<br>- **profile** - `profile.expanded`, `profile.hasPopup` and `profile.name`.<br>- **product** - `product.expanded` and `product.hasPopup`.<br>- **search** - `search.hasPopup`.<br>- **overflow** - `overflow.expanded` and `overflow.hasPopup`.<br>- **branding** - `branding.name`.<br><br>The accessibility attributes support the following values:<br><br>- **role**: Defines the accessible ARIA role of the logo area.<br>Accepts the following string values: `button` or `link`.<br><br>- **expanded**: Indicates whether the button, or another grouping element it controls,<br>is currently expanded or collapsed.<br>Accepts the following string values: `true` or `false`.<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element,<br>such as menu or dialog, that can be triggered by the button.<br><br>Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.<br>- **name**: Defines the accessible ARIA name of the area.<br>Accepts any string. |
| `disableSearchCollapse` | `boolean` | `false` | Disables the automatic search field expansion/collapse when the available space is not enough.<br><br>**Note:** The `disableSearchCollapse` property is in an experimental state and is a subject to change. |
| `hideSearchButton` | `boolean` | `false` | Defines the visibility state of the search button.<br><br>**Note:** The `hideSearchButton` property is in an experimental state and is a subject to change. |
| `logoDomRef` | `HTMLElement \| null` | `null` | Returns the `logo` DOM ref. |
| `notificationsCount` | `string \| undefined` | `undefined` | Defines the `notificationsCount`,<br>displayed in the notification icon top-right corner. |
| `notificationsDomRef` | `HTMLElement \| null` | `null` | Returns the `notifications` icon DOM ref. |
| `overflowDomRef` | `HTMLElement \| null` | `null` | Returns the `overflow` icon DOM ref. |
| `primaryTitle` | `string \| undefined` | `undefined` | Defines the `primaryTitle`.<br><br>**Note:** The `primaryTitle` would be hidden on S screen size (less than approx. 700px). |
| `productSwitchDomRef` | `HTMLElement \| null` | `null` | Returns the `product-switch` icon DOM ref. |
| `profileDomRef` | `HTMLElement \| null` | `null` | Returns the `profile` icon DOM ref. |
| `secondaryTitle` | `string \| undefined` | `undefined` | Defines the `secondaryTitle`.<br><br>**Note:** The `secondaryTitle` would be hidden on S and M screen sizes (less than approx. 1300px). |
| `showNotifications` | `boolean` | `false` | Defines, if the notification icon would be displayed. |
| `showProductSwitch` | `boolean` | `false` | Defines, if the product switch icon would be displayed. |
| `showSearchField` | `boolean` | `false` | Defines, if the Search Field would be displayed when there is a valid `searchField` slot.<br><br>**Note:** By default the Search Field is not displayed. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `assistant` | `Slot<IButton>` | Defines the assistant slot. |
| `branding` | `Slot<ShellBarBranding>` | Defines the branding slot.<br>The `ui5-shellbar-branding` component is intended to be placed inside this slot.<br>Content placed here takes precedence over the `primaryTitle` property and the `logo` content slot.<br><br>**Note:** The `branding` slot is in an experimental state and is a subject to change. |
| `content` | `Slot<HTMLElement>` | Define the items displayed in the content area.<br><br>Use the `data-hide-order` attribute with numeric value to specify the order of the items to be hidden when the space is not enough.<br>Lower values will be hidden first.<br><br>**Note:** The `content` slot is in an experimental state and is a subject to change. |
| `default` | `DefaultSlot<ShellBarItem>` | Defines the `ui5-shellbar` additional items.<br><br>**Note:**<br>You can use the `<ui5-shellbar-item></ui5-shellbar-item>`. |
| `logo` | `Slot<HTMLElement>` | Defines the logo of the `ui5-shellbar`.<br>For example, you can use `ui5-avatar` or `img` elements as logo. |
| `menuItems` | `Slot<ListItemBase>` | Defines the items displayed in menu after a click on a start button.<br><br>**Note:** You can use the  `<ui5-li></ui5-li>` and its ancestors. |
| `profile` | `Slot<HTMLElement>` | You can pass `ui5-avatar` to set the profile image/icon.<br>If no profile slot is set - profile will be excluded from actions.<br><br>**Note:** We recommend not using the `size` attribute of `ui5-avatar` because<br>it should have specific size by design in the context of `ui5-shellbar` profile. |
| `searchField` | `Slot<IShellBarSearchField>` | Defines the `ui5-input`, that will be used as a search field. |
| `startButton` | `Slot<IButton>` | Defines a `ui5-button` in the bar that will be placed in the beginning.<br>We encourage this slot to be used for a menu button.<br>It gets overstyled to match ShellBar's styling. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `content-item-visibility-change` | `CustomEvent<ShellBarContentItemVisibilityChangeEventDetail>` | true | false | Fired, when an item from the content slot is hidden or shown.<br>**Note:** The `content-item-visibility-change` event is in an experimental state and is a subject to change. |
| `logo-click` | `CustomEvent<ShellBarLogoClickEventDetail>` | true | false | Fired, when the logo is activated. |
| `menu-item-click` | `CustomEvent<ShellBarMenuItemClickEventDetail>` | true | true | Fired, when a menu item is activated<br><br>**Note:** You can prevent closing of overflow popover by calling `event.preventDefault()`. |
| `notifications-click` | `CustomEvent<ShellBarNotificationsClickEventDetail>` | true | true | Fired, when the notification icon is activated. |
| `product-switch-click` | `CustomEvent<ShellBarProductSwitchClickEventDetail>` | true | true | Fired, when the product switch icon is activated.<br><br>**Note:** You can prevent closing of overflow popover by calling `event.preventDefault()`. |
| `profile-click` | `CustomEvent<ShellBarProfileClickEventDetail>` | true | false | Fired, when the profile slot is present. |
| `search-button-click` | `CustomEvent<ShellBarSearchButtonEventDetail>` | true | true | Fired, when the search button is activated.<br><br>**Note:** You can prevent expanding/collapsing of the search field by calling `event.preventDefault()`. |
| `search-field-clear` | `CustomEvent<ShellBarSearchFieldClearEventDetail>` | true | true | Fired, when the search cancel button is activated.<br><br>**Note:** You can prevent the default behavior (clearing the search field value) by calling `event.preventDefault()`. The search will still be closed.<br>**Note:** The `search-field-clear` event is in an experimental state and is a subject to change. |
| `search-field-toggle` | `CustomEvent<ShellBarSearchFieldToggleEventDetail>` | true | false | Fired, when the search field is expanded or collapsed. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `closeOverflow` | `closeOverflow(): void;` | Closes the overflow popover. |
| `getSearchButtonDomRef` | `getSearchButtonDomRef(): Promise<HTMLElement \| null>;` | Returns the search button DOM reference. |

#### CSS parts

- `root`: Used to style the outermost wrapper of the `ui5-shellbar`

#### Samples

- [Basic Sample](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/Basic/sample.tsx) — The ShellBar includes Back button, Logo, Title and Profile image.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/Basic/main.js).
- [All Features](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/Advanced/sample.tsx) — A comprehensive ShellBar demonstrating all available features including notifications, search, content items, and profile.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/Advanced/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/Advanced/main.js).
- [Embedded Back Navigation](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/EmbeddedBackNavigation/sample.tsx) — ShellBar with embedded back navigation button in the start area.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/EmbeddedBackNavigation/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/EmbeddedBackNavigation/main.js).
- [Trial Example](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/TrialExample/sample.tsx) — ShellBar configured for trial environments with trial tags and remaining days indicator.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/TrialExample/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/TrialExample/main.js).
- [Multiple Productive Instances](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/MultipleProductiveInstances/sample.tsx) — ShellBar setup for multiple productive system instances with region indicators.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/MultipleProductiveInstances/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/MultipleProductiveInstances/main.js).
- [Multiple Non-Productive Instances](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/MultipleNonProductiveInstances/sample.tsx) — ShellBar setup for multiple non-productive system instances with system and region tags.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/MultipleNonProductiveInstances/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/MultipleNonProductiveInstances/main.js).
- [Application-Level Overflow](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/Overflow/sample.tsx) — This sample demonstrates how applications can implement custom overflow handling for content items.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/Overflow/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ShellBar/Overflow/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `disableSearchCollapse`, `hideSearchButton`.
- [ ] Verify `content-item-visibility-change`, `logo-click`, `menu-item-click`, `notifications-click`, `product-switch-click`, `profile-click`, `search-button-click`, `search-field-clear`, `search-field-toggle` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/application-header` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- CSS custom states

### [ShellBarBranding](https://ui5.github.io/webcomponents/nightly/components/fiori/ShellBarBranding/)

- Tag: `ui5-shellbar-branding`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/ShellBarBranding.d.ts).
- Local implementation: covered by `ApplicationHeader` `logo`/`productName` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-shellbar-branding` component is intended to be placed inside the branding slot of the
`ui5-shellbar` component. Its content has higher priority than the `primaryTitle` property
and the `logo` slot of `ui5-shellbar`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the text alternative of the component.<br>If not provided a default text alternative will be set, if present. |
| `href` | `string \| undefined` | `undefined` | Defines the component href.<br><br>**Note:** Standard hyperlink behavior is supported. |
| `target` | `string \| undefined` | `undefined` | Defines the component target.<br><br>**Notes:**<br><br>- `_self`<br>- `_top`<br>- `_blank`<br>- `_parent`<br>- `_search`<br><br>**This property must only be used when the `href` property is set.** |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the title for the ui5-shellbar-branding component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |
| `logo` | `Slot<HTMLElement>` | Defines the logo of the `ui5-shellbar`.<br>For example, you can use `ui5-avatar` or `img` elements as logo. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | true | false | Fired, when the logo is activated. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `href`, `target`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [ShellBarItem](https://ui5.github.io/webcomponents/nightly/components/fiori/ShellBarItem/)

- Tag: `ui5-shellbar-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/ShellBarItem.d.ts).
- Local implementation: covered by `ApplicationHeader` actions (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-shellbar-item` represents a custom item for `ui5-shellbar`.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/ShellBarItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `ShellBarItemAccessibilityAttributes` | `{}` | Defines additional accessibility attributes on Shellbar Items.<br><br>The accessibility attributes support the following values:<br><br>- **expanded**: Indicates whether the button, or another grouping element it controls,<br>is currently expanded or collapsed.<br>Accepts the following string values: `true` or `false`.<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element,<br>such as menu or dialog, that can be triggered by the button.<br><br>- **controls**: Identifies the element (or elements) whose contents<br>or presence are controlled by the component.<br>Accepts a lowercase string value, referencing the ID of the element it controls. |
| `count` | `string \| undefined` | `undefined` | Defines the count displayed in badge. |
| `icon` | `string \| undefined` | `undefined` | Defines the item's icon. |
| `text` | `string \| undefined` | `undefined` | Defines the item text.<br><br>**Note:** The text is only displayed inside the overflow popover list view. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ShellBarItemClickEventDetail>` | true | true | Fired when the item is clicked. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `count`, `icon`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [ShellBarSearch](https://ui5.github.io/webcomponents/nightly/components/fiori/ShellBarSearch/)

- Tag: `ui5-shellbar-search`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/ShellBarSearch.d.ts).
- Local implementation: covered by `ApplicationHeader` `search` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

Search field for the ShellBar component.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `autoOpen` | `boolean` | `false` | Indicates whether the suggestions popover should be opened on focus. |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible ARIA description of the field. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `fieldLoading` | `boolean` | `false` | Indicates whether a loading indicator should be shown in the input field. |
| `loading` | `boolean` | `false` | Indicates whether a loading indicator should be shown in the popup. |
| `noTypeahead` | `boolean` | `false` | Defines whether the value will be autcompleted to match an item. |
| `open` | `boolean` | `false` | Indicates whether the items picker is open. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the<br>component has no value.<br><br>**Note:** When `scopes` are defined and no custom placeholder is provided,<br>the placeholder automatically displays "Search in: \{selected scope name\}".<br>Setting a custom placeholder will override this automatic behavior. |
| `scopeValue` | `string \| undefined` | `""` | Defines the value of the component:<br><br>Applications are responsible for setting the correct scope value.<br><br>**Note:** If the given value does not match any existing scopes,<br>no scope will be selected and the SearchField scope component will be displayed as empty. |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the search will be shown. |
| `value` | `string` | `""` | Defines the value of the component.<br><br>**Note:** The property is updated upon typing. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `action` | `Slot<Button>` | Defines the popup footer action button. |
| `default` | `DefaultSlot<SearchItem \| SearchItemGroup>` | Defines the Search suggestion items. |
| `filterButton` | `Slot<Button>` | Defines the filter button slot, used to display an additional filtering button.<br>This slot is intended for passing a `ui5-button` with a filter icon to provide extended filtering options.<br><br>**Note:** Scope button and Filter button are mutually exclusive. |
| `illustration` | `Slot<IllustratedMessage>` | Defines the illustrated message to be shown in the popup. |
| `messageArea` | `Slot<SearchMessageArea>` | Defines the illustrated message to be shown in the popup. |
| `scopes` | `Slot<ISearchScope>` | Defines the component scope options. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `close` | `CustomEvent` | false | false | Fired when the popup is closed. |
| `input` | `CustomEvent` | true | false | Fired when typing in input or clear icon is pressed. |
| `open` | `CustomEvent` | false | false | Fired when the popup is opened. |
| `scope-change` | `CustomEvent<SearchFieldScopeSelectionChangeDetails>` | true | false | Fired when the scope has changed. |
| `search` | `CustomEvent` | true | true | Fired when the user has triggered search with Enter key or Search Button press. |

#### CSS parts

- `popover`: Used to style the suggestions popup

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `autoOpen`, `accessibleDescription`, `accessibleName`.
- [ ] Verify `close`, `input`, `open`, `scope-change`, `search` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [ShellBarSpacer](https://ui5.github.io/webcomponents/nightly/components/fiori/ShellBarSpacer/)

- Tag: `ui5-shellbar-spacer`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/ShellBarSpacer.d.ts).
- Local implementation: covered by `ApplicationHeader` layout (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-shellbar-spacer` is an element, used for visual separation between the two content parts of the `ui5-shellbar`.
**Note:** The `ui5-shellbar-spacer` component is in an experimental state and is a subject to change.

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.

#### Empty documentation fields

- TypeScript properties
- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [SideNavigation](https://ui5.github.io/webcomponents/nightly/components/fiori/SideNavigation/)

- Tag: `ui5-side-navigation`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SideNavigation.d.ts).
- Local implementation: `src/components/side-navigation` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `SideNavigation` is used as a standard menu in applications.
It consists of three containers: header (top-aligned), main navigation section (top-aligned) and the secondary section (bottom-aligned).

 - The header is meant for displaying user related information - profile data, avatar, etc.
 - The main navigation section is related to the user's current work context.
 - The secondary section is mostly used to link additional information that may be of interest (legal information, developer communities, external help, contact information and so on).

##### Usage

Use the available `ui5-side-navigation-group`, `ui5-side-navigation-item`
and `ui5-side-navigation-sub-item` components to build your menu.
The items can consist of text only or an icon with text. The use or non-use of icons must be consistent for all items on one level.
You must not combine entries with and without icons on the same level. We strongly recommend that you do not use icons on the second level.

The `ui5-side-navigation` component is designed to be used within a `ui5-navigation-layout` component to ensure an optimal user experience.

Using it standalone may not match the intended design and functionality.
For example, the side navigation may not exhibit the correct behavior on smaller screens.
Additionally, the padding of the `ui5-shellbar` will not match the padding of the side navigation.

##### Keyboard Handling

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`


##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/SideNavigation.js"`

`import "@ui5/webcomponents-fiori/dist/SideNavigationGroup.js";` (for `ui5-side-navigation-group`)

`import "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";` (for `ui5-side-navigation-item`)

`import "@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js";` (for `ui5-side-navigation-sub-item`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `collapsed` | `boolean` | `false` | Defines whether the `ui5-side-navigation` is expanded or collapsed.<br><br>**Note:** On small screens (screen width of 599px or less) the collapsed mode is not supported, and in<br>expanded mode the side navigation will take the whole width of the screen.<br>The `ui5-side-navigation` component is intended to be used within a `ui5-navigation-layout`<br>component to ensure proper responsive behavior. If you choose not to use the<br>`ui5-navigation-layout`, you will need to implement the appropriate responsive patterns yourself,<br>particularly for smaller screens where the collapsed mode should not be used. |
| `highlightedText` | `string \| undefined` | `undefined` | Specifies a term to be highlighted in the navigation items' text.<br>When set, matching portions of item and group texts are visually emphasized during rendering. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<SideNavigationItemBase>` | Defines the main items of the component. |
| `filterSection` | `Slot<HTMLElement>` | Defines the filter section of the `ui5-side-navigation`.<br><br>**Note:** The filter section is displayed when the component is expanded - the property `collapsed` is false; |
| `fixedItems` | `Slot<SideNavigationItemBase>` | Defines the fixed items at the bottom of the component.<br><br>**Note:** In order to achieve the best user experience, it is recommended that you keep the fixed items "flat" (do not pass sub-items) |
| `header` | `Slot<HTMLElement>` | Defines the header of the `ui5-side-navigation`.<br><br>**Note:** The header is displayed when the component is expanded - the property `collapsed` is false; |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `item-click` | `CustomEvent<SideNavigationItemClickEventDetail>` | true | true | Fired when an item is clicked. |
| `item-toggle` | `CustomEvent<SideNavigationItemToggleEventDetail>` | true | true | Fired when a `ui5-side-navigation-item` or `ui5-side-navigation-group` is expanded or collapsed.<br><br>**Note:** You can call `preventDefault()` on the event to suppress the expand/collapse.<br>The `expanded` state stays unchanged. This is handy, for example, if you want to<br>dynamically load child items before allowing a parent item to expand. |
| `selection-change` | `CustomEvent<SideNavigationSelectionChangeEventDetail>` | true | true | Fired when the selection has changed via user interaction. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `announceSearchMatchCount` | `announceSearchMatchCount(count: number): void;` | Announces the number of search matches found in the side navigation to assistive technologies.<br><br>This method uses an invisible live region message so screen readers can inform users<br>about the current number of search matches. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/Basic/main.js).
- [Unselectable Parent Items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/UnselectableParentItems/sample.tsx) — When a parent item is selected, it will expand or collapse the list of child items, instead of the parent being selected itself.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/UnselectableParentItems/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/UnselectableParentItems/main.js).
- [Quick Action](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/QuickAction/sample.tsx) — Quick action items allow for providing access to frequent functionality.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/QuickAction/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/QuickAction/main.js).
- [Overlay Mode](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/OverlayMode/sample.tsx) — SideNavigation is enabled to be used inside a responsive popover. This example shows how to achieve overlay mode with correct design and interaction.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/OverlayMode/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/OverlayMode/main.js).
- [Defining Custom Width](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/CustomWidth/sample.tsx) — The width of the side navigation panel can be customized using CSS. The panel must be at least 16 rem wide to maintain readability and layout stability.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/CustomWidth/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/CustomWidth/main.js).
- [Indication Tags](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/Tags/sample.tsx) — Navigation items can display indication tags to highlight status or phases such as "New", "Beta", or "Deprecated".; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/Tags/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/Tags/main.js).
- [Search](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/Search/sample.tsx) — A search field in the filter section and filterable navigation items.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/Search/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/SideNavigation/Search/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `collapsed`, `highlightedText`.
- [ ] Verify `item-click`, `item-toggle`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/side-navigation` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- CSS parts
- CSS custom states

### [SideNavigationGroup](https://ui5.github.io/webcomponents/nightly/components/fiori/SideNavigationGroup/)

- Tag: `ui5-side-navigation-group`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SideNavigationGroup.d.ts).
- Local implementation: covered by `NavigationGroup` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

Represents a group of navigation actions within `ui5-side-navigation`.
The `ui5-side-navigation-group` can only be used inside a `ui5-side-navigation`.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/SideNavigationGroup.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br>A disabled component can't be pressed or<br>focused, and it is not in the tab chain. |
| `expanded` | `boolean` | `false` | Defines if the item is expanded |
| `text` | `string \| undefined` | `undefined` | Defines the text of the item. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component.<br><br>A tooltip attribute should be provided, in order to represent meaning/function,<br>when the component is collapsed ("icon only" design is visualized) or the item text is truncated. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<SideNavigationItem>` | Defines nested items by passing `ui5-side-navigation-item` to the default slot. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `disabled`, `expanded`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [SideNavigationItem](https://ui5.github.io/webcomponents/nightly/components/fiori/SideNavigationItem/)

- Tag: `ui5-side-navigation-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SideNavigationItem.d.ts).
- Local implementation: covered by `NavigationItem` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

Represents a navigation action. It can provide sub items.
The `ui5-side-navigation-item` is used within `ui5-side-navigation` or `ui5-side-navigation-group` only.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `SideNavigationItemAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.<br>Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.<br><br>**Note:** Do not use it on parent items, as it will be overridden if the item is in the overflow menu. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `design` | `` `${SideNavigationItemDesign}` `` | `"Default"` | Item design.<br><br>**Note:** Items with "Action" design must not have sub-items. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br>A disabled component can't be pressed or<br>focused, and it is not in the tab chain. |
| `expanded` | `boolean` | `false` | Defines if the item is expanded |
| `href` | `string \| undefined` | `undefined` | Defines the link target URI. Supports standard hyperlink behavior.<br>If a JavaScript action should be triggered,<br>this should not be set, but instead an event handler<br>for the `click` event should be registered. |
| `icon` | `string \| undefined` | `undefined` | Defines the icon of the item.<br><br>**Note:** Icons on second-level (child) navigation items are not recommended according to the design specification.<br><br>The SAP-icons font provides numerous options.<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `selected` | `boolean` | `false` | Defines whether the item is selected.<br><br>**Note:** Items that have a set `href` and `target` set to `_blank` should not be selectable. |
| `target` | `string \| undefined` | `undefined` | Defines the component target.<br><br>Possible values:<br><br>- `_self`<br>- `_top`<br>- `_blank`<br>- `_parent`<br>- `framename`<br><br>**Note:** Items that have a defined `href` and `target`<br>attribute set to `_blank` should not be selectable. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the item. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component.<br><br>A tooltip attribute should be provided, in order to represent meaning/function,<br>when the component is collapsed ("icon only" design is visualized) or the item text is truncated. |
| `unselectable` | `boolean` | `false` | Indicates whether the navigation item is selectable. By default, all items are selectable unless specifically marked as unselectable.<br><br>When a parent item is marked as unselectable, selecting it will only expand or collapse its sub-items.<br>To improve user experience do not mix unselectable parent items with selectable parent items in a single side navigation.<br><br><br>**Guidelines**:<br>- Items with an assigned `href` and a target of `_blank` should be marked as unselectable.<br>- Items that trigger actions (with design "Action") should be marked as unselectable. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<SideNavigationSubItem>` | Defines nested items by passing `ui5-side-navigation-sub-item` to the default slot. |
| `tag` | `Slot<HTMLElement>` | Defines the tag to be displayed.<br><br>**Note:** Tags are visible when the <code>NavigationList</code> is in expanded mode,<br>and hidden when collapsed, but they are visible in the overflow of the collapsed mode.<br><br>**Note:** Only one `ui5-tag` is allowed. The tag should use `design="Set2"`, `hide-state-icon`,<br>and `colorScheme` values 5-10 to avoid confusion with semantic colors (1-4).<br><br>**Note:** It is recommended to limit tag width to 64px (4rem). If tag text exceeds this,<br>use shortened forms or abbreviations (e.g., "Experimental" → "Exp").<br><br>**Important:** The <code>ui5-tag</code> must never be interactive (i.e., <code>active</code> must not be set to <code>true</code>),<br>as this would lead to nesting of interactive elements, which is not allowed. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<SideNavigationItemClickEventDetail>` | true | true | Fired when the component is activated either with a click/tap or by using the [Enter] or [Space] keys. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `design`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [SideNavigationSearchField](https://ui5.github.io/webcomponents/nightly/components/fiori/SideNavigationSearchField/)

- Tag: `ui5-side-navigation-search-field`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SideNavigationSearchField.d.ts).
- Local implementation: covered by `SearchField` in `SideNavigation` children (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

A `ui5-side-navigation-search-field` is a search field,
used to filter the items of a `ui5-side-navigation`.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/SideNavigationSearchField.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id (or many ids) of the elements that describe the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id (or many ids) of the elements that label the component. |
| `hideClearIcon` | `boolean` | `false` | Defines whether the clear icon of the search will be hidden.<br><br>**Note:** When not set, the clear icon is displayed while the component has a value. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the<br>component has no value. |
| `value` | `string` | `""` | Defines the value of the component.<br><br>**Note:** The property is updated upon typing. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `input` | `CustomEvent` | true | false | Fired when typing in input or clear icon is pressed. |
| `search` | `CustomEvent` | true | true | Fired when the user has triggered search with Enter key or Search Button press. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescriptionRef`, `accessibleName`, `accessibleNameRef`.
- [ ] Verify `input`, `search` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [SideNavigationSubItem](https://ui5.github.io/webcomponents/nightly/components/fiori/SideNavigationSubItem/)

- Tag: `ui5-side-navigation-sub-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SideNavigationSubItem.d.ts).
- Local implementation: covered by nested `NavigationItem` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
Represents a single navigation action within `ui5-side-navigation-item`.
The `ui5-side-navigation-sub-item` is intended to be used inside a `ui5-side-navigation-item` only.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `SideNavigationItemAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.<br>Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.<br><br>**Note:** Do not use it on parent items, as it will be overridden if the item is in the overflow menu. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `design` | `` `${SideNavigationItemDesign}` `` | `"Default"` | Item design.<br><br>**Note:** Items with "Action" design must not have sub-items. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br>A disabled component can't be pressed or<br>focused, and it is not in the tab chain. |
| `href` | `string \| undefined` | `undefined` | Defines the link target URI. Supports standard hyperlink behavior.<br>If a JavaScript action should be triggered,<br>this should not be set, but instead an event handler<br>for the `click` event should be registered. |
| `icon` | `string \| undefined` | `undefined` | Defines the icon of the item.<br><br>**Note:** Icons on second-level (child) navigation items are not recommended according to the design specification.<br><br>The SAP-icons font provides numerous options.<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `selected` | `boolean` | `false` | Defines whether the item is selected.<br><br>**Note:** Items that have a set `href` and `target` set to `_blank` should not be selectable. |
| `target` | `string \| undefined` | `undefined` | Defines the component target.<br><br>Possible values:<br><br>- `_self`<br>- `_top`<br>- `_blank`<br>- `_parent`<br>- `framename`<br><br>**Note:** Items that have a defined `href` and `target`<br>attribute set to `_blank` should not be selectable. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the item. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component.<br><br>A tooltip attribute should be provided, in order to represent meaning/function,<br>when the component is collapsed ("icon only" design is visualized) or the item text is truncated. |
| `unselectable` | `boolean` | `false` | Indicates whether the navigation item is selectable. By default, all items are selectable unless specifically marked as unselectable.<br><br>When a parent item is marked as unselectable, selecting it will only expand or collapse its sub-items.<br>To improve user experience do not mix unselectable parent items with selectable parent items in a single side navigation.<br><br><br>**Guidelines**:<br>- Items with an assigned `href` and a target of `_blank` should be marked as unselectable.<br>- Items that trigger actions (with design "Action") should be marked as unselectable. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `tag` | `Slot<HTMLElement>` | Defines the tag to be displayed.<br><br>**Note:** Tags are visible when the <code>NavigationList</code> is in expanded mode,<br>and hidden when collapsed, but they are visible in the overflow of the collapsed mode.<br><br>**Note:** Only one `ui5-tag` is allowed. The tag should use `design="Set2"`, `hide-state-icon`,<br>and `colorScheme` values 5-10 to avoid confusion with semantic colors (1-4).<br><br>**Note:** It is recommended to limit tag width to 64px (4rem). If tag text exceeds this,<br>use shortened forms or abbreviations (e.g., "Experimental" → "Exp").<br><br>**Important:** The <code>ui5-tag</code> must never be interactive (i.e., <code>active</code> must not be set to <code>true</code>),<br>as this would lead to nesting of interactive elements, which is not allowed. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<SideNavigationItemClickEventDetail>` | true | true | Fired when the component is activated either with a click/tap or by using the [Enter] or [Space] keys. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `design`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [SortItem](https://ui5.github.io/webcomponents/nightly/components/fiori/SortItem/)

- Tag: `ui5-sort-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/SortItem.d.ts).
- Local implementation: `src/components/view-settings-dialog` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-sort-item` component defines the sorting criteria for data in `ui5-view-settings-dialog`.
It represents a single sort option that users can select to organize data in ascending or descending order.

##### Usage

The `ui5-sort-item` is used within the `ui5-view-settings-dialog` to provide sorting options.
Each sort item represents a column or field by which data can be sorted.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/SortItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `selected` | `boolean` | `false` | Defines if the sort item is selected. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the sort item. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `selected`, `text`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [Timeline](https://ui5.github.io/webcomponents/nightly/components/fiori/Timeline/)

- Tag: `ui5-timeline`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/Timeline.d.ts).
- Local implementation: `src/components/timeline` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-timeline` component shows entries (such as objects, events, or posts) in chronological order.
A common use case is to provide information about changes to an object, or events related to an object.
These entries can be generated by the system (for example, value XY changed from A to B), or added manually.
There are two distinct variants of the timeline: basic and social. The basic timeline is read-only,
while the social timeline offers a high level of interaction and collaboration, and is integrated within SAP Jam.

##### Header and Info Bar Slots

The Timeline exposes two named slots above the items area:

- `header` — for a controls bar (search field, filter trigger, sort toggle, etc.).
The most common pattern is to place a `ui5-toolbar` containing a search input and buttons that open
a filter dialog or toggle sort direction. The Timeline itself performs no filtering, sorting, or
searching — the application listens for events from its own controls and reorders, hides, or
adds items in the default slot accordingly.

- `infoBar` — for a status bar that reflects the result of the controls (active filters,
applied sort, current search query). Typically contains tokens, labels, or a `ui5-bar`.

The Timeline itself does not filter, sort, or search — the application owns that logic.
Use `stickyHeader` to pin both bars while the Timeline's items scroll. Give the Timeline
a constrained height in this mode so it owns its scrollbar.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `growing` | `` `${TimelineGrowingMode}` `` | `"None"` | Defines whether the Timeline will have growing capability either by pressing a "More" button,<br>or via user scroll. In both cases a `load-more` event is fired.<br><br>Available options:<br><br>`Button` - Displays a button at the end of the Timeline, which when pressed triggers the `load-more` event.<br><br>`Scroll` -Triggers the `load-more` event when the user scrolls to the end of the Timeline.<br><br>`None` (default) - The growing functionality is off. |
| `layout` | `` `${TimelineLayout}` `` | `"Vertical"` | Defines the items orientation. |
| `loading` | `boolean` | `false` | Defines if the component should display a loading indicator over the Timeline. |
| `loadingDelay` | `number` | `1000` | Defines the delay in milliseconds, after which the loading indicator will show up for this component. |
| `stickyHeader` | `boolean` | `false` | Defines whether the content of the `header` and `infoBar` slots remains visible when the user scrolls the Timeline.<br><br>**Note:** The bars pin to the Timeline's own scrollport. Give the Timeline a<br>constrained height (for example `style="height: 32rem"`) so its items scroll<br>inside it. Placing the Timeline inside an externally scrolling ancestor while<br>leaving the Timeline itself unsized is not supported in this mode — the bars<br>will scroll away with the ancestor. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ITimelineItem>` | Determines the content of the `ui5-timeline`. |
| `header` | `Slot<HTMLElement>` | Defines the content of the Timeline's header area, displayed above the items.<br>Typically a `ui5-toolbar` with search, sort, and filter controls. |
| `infoBar` | `Slot<HTMLElement>` | Defines the content of the Timeline's info bar area, displayed below the header<br>and above the items. Use for status display (applied filters, sort direction, counts). |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `load-more` | `CustomEvent` | true | false | Fired when the user presses the `More` button or scrolls to the Timeline's end.<br><br>**Note:** The event will be fired if `growing` is set to `Button` or `Scroll`. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/Basic/main.js).
- [Horizontal layout](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/Horizontal/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/Horizontal/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/Horizontal/main.js).
- [Timeline with State](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithState/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithState/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithState/main.js).
- [Timeline in Card](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/InCard/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/InCard/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/InCard/main.js).
- [Timeline with Groups](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithGroups/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithGroups/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithGroups/main.js).
- [Timeline with Growing](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithGrowing/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithGrowing/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithGrowing/main.js).
- [Timeline with Header and Info Bar](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithHeader/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithHeader/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithHeader/main.js).
- [Timeline with Filter](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithFilter/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithFilter/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/WithFilter/main.js).
- [Sticky in Page](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/StickyInPage/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/StickyInPage/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Timeline/StickyInPage/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `growing`, `layout`.
- [ ] Verify `load-more` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/timeline` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [TimelineGroupItem](https://ui5.github.io/webcomponents/nightly/components/fiori/TimelineGroupItem/)

- Tag: `ui5-timeline-group-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/TimelineGroupItem.d.ts).
- Local implementation: covered by `Timeline` items (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

An entry posted on the timeline.
It is intended to represent a group of `<ui5-timeline-item>`s.

**Note**: Please do not use empty groups in order to preserve the intended design.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `collapsed` | `boolean` | `false` | Determines if the group is collapsed or expanded. |
| `groupName` | `string \| undefined` | `undefined` | Defines the text of the button that expands and collapses the group. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ITimelineItem>` | Determines the content of the `ui5-timeline-group-item`. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `toggle` | `CustomEvent` | true | false | Fired when the group item is expanded or collapsed. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `collapsed`, `groupName`.
- [ ] Verify `toggle` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [TimelineItem](https://ui5.github.io/webcomponents/nightly/components/fiori/TimelineItem/)

- Tag: `ui5-timeline-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/TimelineItem.d.ts).
- Local implementation: covered by `Timeline` items (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

An entry posted on the timeline.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string \| undefined` | `undefined` | Defines the icon to be displayed as graphical element within the `ui5-timeline-item`.<br>SAP-icons font provides numerous options.<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `iconTooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the graphical icon. |
| `name` | `string \| undefined` | `undefined` | Defines the name of the item, displayed before the `title-text`. |
| `nameClickable` | `boolean` | `false` | Defines if the `name` is clickable. |
| `state` | `` `${ValueState}` `` | `"None"` | Defines the state of the icon displayed in the `ui5-timeline-item`. |
| `subtitleText` | `string \| undefined` | `undefined` | Defines the subtitle text of the component. |
| `titleText` | `string \| undefined` | `undefined` | Defines the title text of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the content of the `ui5-timeline-item`. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `name-click` | `CustomEvent` | true | false | Fired when the item name is pressed either with a<br>click/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `name-clickable`<br>attribute is not set. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `icon`, `iconTooltip`, `name`.
- [ ] Verify `name-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [UploadCollection](https://ui5.github.io/webcomponents/nightly/components/fiori/UploadCollection/)

- Tag: `ui5-upload-collection`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UploadCollection.d.ts).
- Local implementation: `src/components/upload-collection` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
This component allows you to represent files before uploading them to a server, with the help of `ui5-upload-collection-item`.
It also allows you to show already uploaded files.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UploadCollection.js";`

`import "@ui5/webcomponents-fiori/dist/UploadCollectionItem.js";` (for `ui5-upload-collection-item`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `hideDragOverlay` | `boolean` | `false` | By default there will be drag and drop overlay shown over the `ui5-upload-collection` when files<br>are dragged. If you don't intend to use drag and drop, set this property.<br><br>**Note:** It is up to the application developer to add handler for `drop` event and handle it.<br>`ui5-upload-collection` only displays an overlay. |
| `noDataDescription` | `string \| undefined` | `undefined` | Allows you to set your own text for the 'No data' description. |
| `noDataHeaderLevel` | `` `${TitleLevel}` `` | `"H2"` | Defines the header level of the 'No data' text. |
| `noDataText` | `string \| undefined` | `undefined` | Allows you to set your own text for the 'No data' text. |
| `selectionMode` | `` `${UploadCollectionSelectionMode}` `` | `"None"` | Defines the selection mode of the `ui5-upload-collection`. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<UploadCollectionItem>` | Defines the items of the `ui5-upload-collection`.<br><br>**Note:** Use `ui5-upload-collection-item` for the intended design. |
| `header` | `Slot<HTMLElement>` | Defines the `ui5-upload-collection` header.<br><br>**Note:** If `header` slot is provided,<br>the labelling of the `UploadCollection` is a responsibility of the application developer.<br>`accessibleName` should be used. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `item-delete` | `CustomEvent<UploadCollectionItemDeleteEventDetail>` | true | false | Fired when an element is dropped inside the drag and drop overlay.<br><br>**Note:** The `drop` event is fired only when elements are dropped within the drag and drop overlay and ignored for the other parts of the `ui5-upload-collection`. |
| `selection-change` | `CustomEvent<UploadCollectionSelectionChangeEventDetail>` | true | false | Fired when selection is changed by user interaction<br>in `Single` and `Multiple` modes. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/Basic/main.js).
- [Renaming Files](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/RenamingFiles/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/RenamingFiles/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/RenamingFiles/main.js).
- [Upload States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/VariousUploadStates/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/VariousUploadStates/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/VariousUploadStates/main.js).
- [Drag and Drop](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/DragAndDrop/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/DragAndDrop/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UploadCollection/DragAndDrop/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `hideDragOverlay`, `noDataDescription`.
- [ ] Verify `item-delete`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [UploadCollectionItem](https://ui5.github.io/webcomponents/nightly/components/fiori/UploadCollectionItem/)

- Tag: `ui5-upload-collection-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UploadCollectionItem.d.ts).
- Local implementation: `src/components/upload-collection` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
A component to be used within the `ui5-upload-collection`.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/UploadCollectionItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `disableDeleteButton` | `boolean` | `false` | Disables the delete button. |
| `file` | `File \| null` | `null` | Holds an instance of `File` associated with this item. |
| `fileName` | `string` | `""` | The name of the file. |
| `fileNameClickable` | `boolean` | `false` | If set to `true` the file name will be clickable and it will fire `file-name-click` event upon click. |
| `hideDeleteButton` | `boolean` | `false` | Hides the delete button. |
| `hideRetryButton` | `boolean` | `false` | Hides the retry button when `uploadState` property is `Error`. |
| `hideTerminateButton` | `boolean` | `false` | Hides the terminate button when `uploadState` property is `Uploading`. |
| `progress` | `number` | `0` | The upload progress in percentage.<br><br>**Note:** Expected values are in the interval [0, 100]. |
| `uploadState` | `` `${UploadState}` `` | `"Ready"` | Upload state.<br><br>Depending on this property, the item displays the following:<br><br>- `Ready` - progress indicator is displayed.<br>- `Uploading` - progress indicator and terminate button are displayed. When the terminate button is pressed, `terminate` event is fired.<br>- `Error` - progress indicator and retry button are displayed. When the retry button is pressed, `retry` event is fired.<br>- `Complete` - progress indicator is not displayed. |
| `accessibilityAttributes` | `ListItemAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **ariaSetsize**: Defines the number of items in the current set  when not all items in the set are present in the DOM.<br>**Note:** The value is an integer reflecting the number of items in the complete set. If the size of the entire set is unknown, set `-1`.<br><br>	- **ariaPosinset**: Defines an element's number or position in the current set when not all items are present in the DOM.<br>	**Note:** The value is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known. |
| `accessibleRole` | `` `${ListItemAccessibleRole}` \| undefined `` | `undefined` | Used to define the role of the list item.<br><br>**Note:** If not set, the role is automatically inherited from the parent `ui5-list` based on its `accessible-role` property<br>(e.g. `Menu` -> `MenuItem`, `Tree` -> `TreeItem`, `ListBox` -> `Option`).<br>An explicitly set `accessible-role` on the list item takes precedence over the inherited role. |
| `highlight` | `` `${Highlight}` `` | `"None"` | Defines the highlight state of the list items.<br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `navigated` | `boolean` | `false` | The navigated state of the list item.<br>If set to `true`, a navigation indicator is displayed at the end of the list item. |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the text of the tooltip that would be displayed for the list item. |
| `type` | `` `${ListItemType}` `` | `"Active"` | Defines the visual indication and behavior of the list items.<br>Available options are `Active` (by default), `Inactive`, `InactiveSelectable`, `Detail` and `Navigation`.<br><br>**Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,<br>while with type `Inactive`, `InactiveSelectable` and `Detail` - will not.<br><br>**Note:** `InactiveSelectable` behaves like `Inactive` (no active press/hover feedback and the<br>`item-click` event is not fired), but the item can still be selected. Clicking the item body,<br>pressing Space/Enter, or interacting with the selection component (checkbox in Multi mode, radio<br>button in Single modes) toggles the selection when the list has a selection mode. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Hold the description of the `ui5-upload-collection-item`. Will be shown below the file name. |
| `thumbnail` | `Slot<HTMLElement>` | A thumbnail, which will be shown in the beginning of the `ui5-upload-collection-item`.<br><br>**Note:** Use `ui5-icon` or `img` for the intended design. |
| `deleteButton` | `Slot<IButton>` | Defines the delete button, displayed in "Delete" mode.<br>**Note:** While the slot allows custom buttons, to match<br>design guidelines, please use the `ui5-button` component.<br>**Note:** When the slot is not present, a built-in delete button will be displayed. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `file-name-click` | `CustomEvent` | true | false | Fired when the file name is clicked.<br><br>**Note:** This event is only available when `fileNameClickable` property is `true`. |
| `rename` | `CustomEvent` | true | false | Fired when the `fileName` property gets changed.<br><br>**Note:** An edit button is displayed on each item,<br>when the `ui5-upload-collection-item` `type` property is set to `Detail`. |
| `retry` | `CustomEvent` | true | false | Fired when the retry button is pressed.<br><br>**Note:** Retry button is displayed when `uploadState` property is set to `Error`. |
| `terminate` | `CustomEvent` | true | false | Fired when the terminate button is pressed.<br><br>**Note:** Terminate button is displayed when `uploadState` property is set to `Uploading`. |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |
| `detail-click` | `CustomEvent` | true | false | Fired when the user clicks on the detail button when type is `Detail`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `disableDeleteButton`, `file`, `fileName`.
- [ ] Verify `file-name-click`, `rename`, `retry`, `terminate`, `click`, `detail-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [UserMenu](https://ui5.github.io/webcomponents/nightly/components/fiori/UserMenu/)

- Tag: `ui5-user-menu`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserMenu.d.ts).
- Local implementation: `src/components/user-menu` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-menu` is an SAP Fiori specific web component that is used in `ui5-shellbar`
and allows the user to easily see information and settings for the current user and all other logged in accounts.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserMenu.js";`

`import "@ui5/webcomponents-fiori/dist/UserMenuItem.js";` (for `ui5-user-menu-item`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `avatarInteractive` | `boolean` | `false` | Defines whether the avatar of the selected account is interactive (focusable and pressable).<br><br>When `false` (default), the avatar is rendered as a non-interactive image<br>and is not announced as a button by screen readers.<br><br>**Note:** When `showEditButton` is set to `true`, the avatar is treated as interactive<br>regardless of this property's value, to preserve the edit affordance. |
| `open` | `boolean` | `false` | Defines if the User Menu is opened. |
| `opener` | `HTMLElement \| string \| null \| undefined` | `undefined` | Defines the ID or DOM Reference of the element at which the user menu is shown.<br>When using this attribute in a declarative way, you must only use the `id` (as a string) of the element at which you want to show the popover.<br>You can only set the `opener` attribute to a DOM Reference when using JavaScript. |
| `showEditAccounts` | `boolean` | `false` | Defines if the User Menu shows the Edit Accounts option. |
| `showEditButton` | `boolean` | `false` | Defines if the User menu shows edit button. |
| `showManageAccount` | `boolean` | `false` | Defines if the User Menu shows the Manage Account option. |
| `showOtherAccounts` | `boolean` | `false` | Defines if the User Menu shows the Other Accounts option. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `accounts` | `Slot<UserMenuAccount>` | Defines the user accounts.<br><br>**Note:** If one item is used, it will be shown as the selected one. If more than one item is used, the first one will be shown as selected unless<br>there is an item with `selected` property set to `true`. |
| `default` | `DefaultSlot<UserMenuItem>` | Defines the menu items. |
| `footer` | `Slot<HTMLElement>` | Defines custom footer content.<br><br>**Note:** When provided, replaces the default "Sign Out" button. Use an empty element to hide the footer completely. |
| `infoArea` | `Slot<HTMLElement>` | Defines the content of the info area inside the User Menu's account block.<br><br>**Note:** When empty, the User Menu renders unchanged. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `avatar-click` | `CustomEvent` | false | false | Fired when the account avatar is selected. |
| `change-account` | `CustomEvent<UserMenuOtherAccountClickEventDetail>` | false | true | Fired when the account is switched to a different one. |
| `close` | `CustomEvent` | false | false | Fired when a user menu is close. |
| `edit-accounts-click` | `CustomEvent` | false | false | Fired when the "Edit Accounts" button is selected. |
| `item-click` | `CustomEvent<UserMenuItemClickEventDetail>` | false | true | Fired when a menu item is selected. |
| `manage-account-click` | `CustomEvent` | false | false | Fired when the "Manage Account" button is selected. |
| `open` | `CustomEvent` | false | false | Fired when a user menu is open. |
| `sign-out-click` | `CustomEvent` | false | true | Fired when the "Sign Out" button is selected. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserMenu/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserMenu/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserMenu/Basic/main.js).
- [Advanced](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserMenu/Advanced/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserMenu/Advanced/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserMenu/Advanced/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `avatarInteractive`, `open`, `opener`.
- [ ] Verify `avatar-click`, `change-account`, `close`, `edit-accounts-click`, `item-click`, `manage-account-click`, `open`, `sign-out-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [UserMenuAccount](https://ui5.github.io/webcomponents/nightly/components/fiori/UserMenuAccount/)

- Tag: `ui5-user-menu-account`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserMenuAccount.d.ts).
- Local implementation: `src/components/user-menu` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-menu-account` represents an account in the `ui5-user-menu`.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserMenuAccount.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `additionalInfo` | `string` | `""` | Defines additional information for the user. |
| `avatarColorScheme` | `` `${AvatarColorScheme}` `` | `"Auto"` | Defines the background color of the desired image.<br>If `avatarColorScheme` is set to `Auto`, the avatar will be displayed with the `Accent6` color. |
| `avatarInitials` | `string \| undefined` | `undefined` | Defines the avatar initials of the user. |
| `avatarSrc` | `string \| undefined` | `""` | Defines the avatar image url of the user. |
| `description` | `string` | `""` | Defines description of the user. |
| `loading` | `boolean` | `false` | Indicates whether a loading indicator should be shown. |
| `selected` | `boolean` | `false` | Defines if the user is selected. |
| `subtitleText` | `string` | `""` | Defines additional text of the user. |
| `titleText` | `string` | `""` | Defines the title text of the user. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `additionalInfo`, `avatarColorScheme`, `avatarInitials`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [UserMenuItem](https://ui5.github.io/webcomponents/nightly/components/fiori/UserMenuItem/)

- Tag: `ui5-user-menu-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserMenuItem.d.ts).
- Local implementation: `src/components/user-menu` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

`ui5-user-menu-item` is the item to use inside a `ui5-user-menu`.
An arbitrary hierarchy structure can be represented by recursively nesting menu items.

##### Usage

`ui5-user-menu-item` represents a node in a `ui5-user-menu`. The user menu itself is rendered as a list,
and each `ui5-menu-item` is represented by a menu item in that menu. Therefore, you should only use
`ui5-user-menu-item` directly in your apps. The `ui5-menu` menu item is internal for the menu, and not intended for public use.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/UserMenuItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `showSelection` | `boolean` | `false` | When set, a second line appears below the menu item text showing the text<br>of the currently selected sub-item. Intended for use with a single-select<br>ui5-menu-item-group (check-mode="Single").<br>When enabled, the checked sub-item cannot be unchecked,<br>ensuring the selection text is always displayed. |
| `accessibilityAttributes` | `MenuItemAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **ariaKeyShortcuts**: Indicated the availability of a keyboard shortcuts defined for the menu item.<br><br>- **role**: Defines the role of the menu item. If not set, menu item will have default role="menuitem". |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleRole` | `` `${ListItemAccessibleRole}` \| undefined `` | `undefined` | Used to define the role of the list item.<br><br>**Note:** If not set, the role is automatically inherited from the parent `ui5-list` based on its `accessible-role` property<br>(e.g. `Menu` -> `MenuItem`, `Tree` -> `TreeItem`, `ListBox` -> `Option`).<br>An explicitly set `accessible-role` on the list item takes precedence over the inherited role. |
| `additionalText` | `string \| undefined` | `undefined` | Defines the `additionalText`, displayed in the end of the menu item.<br><br>**Note:** The additional text will not be displayed if there are items added in `items` slot or there are<br>components added to `endContent` slot.<br><br>The priority of what will be displayed at the end of the menu item is as follows:<br>sub-menu arrow (if there are items added in `items` slot) -> components added in `endContent` -> text set to `additionalText`. |
| `checked` | `boolean` | `false` | Defines whether menu item is in checked state.<br><br>**Note:** checked state is only taken into account when menu item is added to menu item group<br>with `checkMode` other than `None`.<br><br>**Note:** A checked menu item has a checkmark displayed at its end. |
| `disabled` | `boolean` | `false` | Defines whether menu item is in disabled state.<br><br>**Note:** A disabled menu item is noninteractive. |
| `highlight` | `` `${Highlight}` `` | `"None"` | Defines the highlight state of the list items.<br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `icon` | `string \| undefined` | `undefined` | Defines the icon to be displayed as graphical element within the component.<br>The SAP-icons font provides numerous options.<br><br>**Example:**<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `loading` | `boolean` | `false` | Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding menu popover.<br><br>**Note:** If set to `true` a busy indicator component will be displayed into the related one to the current menu item sub-menu popover. |
| `loadingDelay` | `number` | `1000` | Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding menu popover. |
| `navigated` | `boolean` | `false` | The navigated state of the list item.<br>If set to `true`, a navigation indicator is displayed at the end of the list item. |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the tree item. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the text of the tooltip for the menu item. |
| `type` | `` `${ListItemType}` `` | `"Active"` | Defines the visual indication and behavior of the list items.<br>Available options are `Active` (by default), `Inactive`, `InactiveSelectable`, `Detail` and `Navigation`.<br><br>**Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,<br>while with type `Inactive`, `InactiveSelectable` and `Detail` - will not.<br><br>**Note:** `InactiveSelectable` behaves like `Inactive` (no active press/hover feedback and the<br>`item-click` event is not fired), but the item can still be selected. Clicking the item body,<br>pressing Space/Enter, or interacting with the selection component (checkbox in Multi mode, radio<br>button in Single modes) toggles the selection when the list has a selection mode. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<UserMenuItem>` | Defines the items of this component.<br><br>**Note:** Use `ui5-user-menu-item` for the intended design. |
| `deleteButton` | `Slot<IButton>` | Defines the delete button, displayed in "Delete" mode.<br>**Note:** While the slot allows custom buttons, to match<br>design guidelines, please use the `ui5-button` component.<br>**Note:** When the slot is not present, a built-in delete button will be displayed. |
| `endContent` | `Slot<HTMLElement>` | Defines the components that should be displayed at the end of the menu item.<br><br>**Note:** It is highly recommended to slot only components of type `ui5-button`,`ui5-link`<br>or `ui5-icon` in order to preserve the intended design. If there are components added to this slot,<br>and there is text set in `additionalText`, it will not be displayed. If there are items added to `items` slot,<br>nether `additionalText` nor components added to this slot would be displayed.<br><br>The priority of what will be displayed at the end of the menu item is as follows:<br>sub-menu arrow (if there are items added in `items` slot) -> components added in `endContent` -> text set to `additionalText`.<br><br>Application developers are responsible for ensuring that interactive elements placed in the `endContent` slot<br>have the correct accessibility behaviour, including their enabled or disabled states.<br>The menu does not manage these aspects when the menu item state changes. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `before-close` | `CustomEvent<MenuBeforeCloseEventDetail>` | false | true | Fired before the menu is closed. This event can be cancelled, which will prevent the menu from closing. |
| `before-open` | `CustomEvent<MenuBeforeOpenEventDetail>` | false | true | Fired before the menu is opened. This event can be cancelled, which will prevent the menu from opening.<br><br>**Note:** Since 1.14.0 the event is also fired before a sub-menu opens. |
| `check` | `CustomEvent` | true | false | Fired when an item is checked or unchecked. |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |
| `close` | `CustomEvent` | false | false | Fired after the menu is closed. |
| `detail-click` | `CustomEvent` | true | false | Fired when the user clicks on the detail button when type is `Detail`. |
| `open` | `CustomEvent` | false | false | Fired after the menu is opened. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `showSelection`, `accessibilityAttributes`, `accessibleName`.
- [ ] Verify `before-close`, `before-open`, `check`, `click`, `close`, `detail-click`, `open` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [UserMenuItemGroup](https://ui5.github.io/webcomponents/nightly/components/fiori/UserMenuItemGroup/)

- Tag: `ui5-user-menu-item-group`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserMenuItemGroup.d.ts).
- Local implementation: `src/components/user-menu` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-menu-item-group` component represents a group of items designed for use inside a `ui5-user-menu`.
Items belonging to the same group should be wrapped by a `ui5-user-menu-item-group`.
Each group can have an `itemCheckMode` property, which defines the check mode for the items within the group.
The possible values for `itemCheckMode` are:
- 'None' (default) - no items can be checked
- 'Single' - Only one item can be checked at a time
- 'Multiple' - Multiple items can be checked simultaneously

**Note:** If the `itemCheckMode` property is set to 'Single', only one item can remain checked at any given time.
If multiple items are marked as checked, the last checked item will take precedence.

##### Usage

`ui5-user-menu-item-group` represents a collection of `ui5-user-menu-item` components that can have the same check mode.
The items are added to the group's `items` slot.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/UserMenuItemGroup.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `checkMode` | `` `${MenuItemGroupCheckMode}` `` | `"None"` | Defines the component's check mode. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IMenuItem>` | Defines the items of this component.<br>**Note:** The slot can hold any combination of components of type `ui5-menu-item` or `ui5-menu-separator` or both. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `checkMode`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [UserSettingsAccountView](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsAccountView/)

- Tag: `ui5-user-settings-account-view`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsAccountView.d.ts).
- Local implementation: covered by `UserSettingsDialog` view `content` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-account-view` represents a view displayed in the `ui5-user-settings-item`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `secondary` | `boolean` | `false` | Indicates whether the view is secondary. It is relevant only if the view is used in `pages` slot of `ui5-user-settings-item`<br>and controls the visibility of the back button. |
| `selected` | `boolean` | `false` | Defines whether the view is selected. There can be just one selected view at a time. |
| `showEditButton` | `boolean` | `false` | Defines if the User Settings Account View shows the edit button on the avatar. |
| `showManageAccount` | `boolean` | `false` | Defines if the User Menu shows the `Manage Account` option. |
| `text` | `string \| undefined` | `undefined` | Defines the title text of the user settings view. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `account` | `Slot<UserMenuAccount>` | Defines the user account. |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the view. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `edit-accounts-click` | `CustomEvent` | false | false | Fired when the `Edit Accounts` button is selected. |
| `manage-account-click` | `CustomEvent` | false | false | Fired when the `Manage Account` button is selected. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `secondary`, `selected`, `showEditButton`.
- [ ] Verify `edit-accounts-click`, `manage-account-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [UserSettingsAppearanceView](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsAppearanceView/)

- Tag: `ui5-user-settings-appearance-view`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsAppearanceView.d.ts).
- Local implementation: covered by `UserSettingsDialog` view `content` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-appearance-view` represents a view displayed in the `ui5-user-settings-item`.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserSettingsAppearanceView.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `secondary` | `boolean` | `false` | Indicates whether the view is secondary. It is relevant only if the view is used in `pages` slot of `ui5-user-settings-item`<br>and controls the visibility of the back button. |
| `selected` | `boolean` | `false` | Defines whether the view is selected. There can be just one selected view at a time. |
| `text` | `string \| undefined` | `undefined` | Defines the title text of the user settings view. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `additionalContent` | `Slot<HTMLElement>` | Defines additional content displayed below the items list. |
| `default` | `Not identified; inspect declaration` | Defines the items of the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `selection-change` | `CustomEvent<UserSettingsAppearanceViewItemSelectEventDetail>` | false | true | Fired when an item is selected. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `secondary`, `selected`, `text`.
- [ ] Verify `selection-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [UserSettingsAppearanceViewGroup](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsAppearanceViewGroup/)

- Tag: `ui5-user-settings-appearance-view-group`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsAppearanceViewGroup.d.ts).
- Local implementation: covered by `UserSettingsDialog` view `content` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-appearance-view-group` is a special list item group used to group appearance view items.

This is the item to use inside a `ui5-user-settings-appearance-view`.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserSettingsAppearanceViewGroup.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `headerAccessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the header. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text of the group. |
| `wrappingType` | `` `${WrappingType}` `` | `"None"` | Defines if the text of the component should wrap when it's too long.<br>When set to "Normal", the content (title, description) will be wrapped<br>using the `ui5-expandable-text` component.<br/><br><br>The text can wrap up to 100 characters on small screens (size S) and<br>up to 300 characters on larger screens (size M and above). When text exceeds<br>these limits, it truncates with an ellipsis followed by a text expansion trigger.<br><br>Available options are:<br>- `None` (default) - The text will truncate with an ellipsis.<br>- `Normal` - The text will wrap (without truncation). |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<UserSettingsAppearanceViewItem>` | Defines the items of the <code>ui5-user-settings-appearance-view-group</code>. |
| `header` | `Slot<ListItemBase>` | Defines the header of the component.<br><br>**Note:** Using this slot, the default header text of group and the value of `headerText` property will be overwritten. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `move` | `CustomEvent<ListItemGroupMoveEventDetail>` | true | false | Fired when a movable list item is dropped onto a drop target.<br><br>**Note:** `move` event is fired only if there was a preceding `move-over` with prevented default action. |
| `move-over` | `CustomEvent<ListItemGroupMoveEventDetail>` | true | true | Fired when a movable list item is moved over a potential drop target during a dragging operation.<br><br>If the new position is valid, prevent the default action of the event using `preventDefault()`. |

#### CSS parts

- `header`: Used to style the header item of the group
- `title`: Used to style the title of the group header

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `headerAccessibleName`, `headerText`, `wrappingType`.
- [ ] Verify `move`, `move-over` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [UserSettingsAppearanceViewItem](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsAppearanceViewItem/)

- Tag: `ui5-user-settings-appearance-view-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsAppearanceViewItem.d.ts).
- Local implementation: covered by `UserSettingsDialog` view `content` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-appearance-view-item` represents a theme/appearance option item
within the `ui5-user-settings-appearance-view`.

It displays a theme with an avatar icon, text label, and can be selected.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserSettingsAppearanceViewItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `colorScheme` | `string` | `"Accent7"` | Defines the color scheme of the avatar. |
| `icon` | `string` | `"product"` | Defines the icon of the appearance item. |
| `itemKey` | `string` | `""` | Defines the unique identifier of the item. |
| `text` | `string` | `""` | Defines the text label displayed for the appearance item. |
| `accessibilityAttributes` | `ListItemAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **ariaSetsize**: Defines the number of items in the current set  when not all items in the set are present in the DOM.<br>**Note:** The value is an integer reflecting the number of items in the complete set. If the size of the entire set is unknown, set `-1`.<br><br>	- **ariaPosinset**: Defines an element's number or position in the current set when not all items are present in the DOM.<br>	**Note:** The value is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the text alternative of the component.<br><br>**Note**: If not provided a default text alternative will be set, if present. |
| `accessibleRole` | `` `${ListItemAccessibleRole}` \| undefined `` | `undefined` | Used to define the role of the list item.<br><br>**Note:** If not set, the role is automatically inherited from the parent `ui5-list` based on its `accessible-role` property<br>(e.g. `Menu` -> `MenuItem`, `Tree` -> `TreeItem`, `ListBox` -> `Option`).<br>An explicitly set `accessible-role` on the list item takes precedence over the inherited role. |
| `highlight` | `` `${Highlight}` `` | `"None"` | Defines the highlight state of the list items.<br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `movable` | `boolean` | `false` | Defines whether the item is movable. |
| `navigated` | `boolean` | `false` | The navigated state of the list item.<br>If set to `true`, a navigation indicator is displayed at the end of the list item. |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the text of the tooltip that would be displayed for the list item. |
| `type` | `` `${ListItemType}` `` | `"Active"` | Defines the visual indication and behavior of the list items.<br>Available options are `Active` (by default), `Inactive`, `InactiveSelectable`, `Detail` and `Navigation`.<br><br>**Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,<br>while with type `Inactive`, `InactiveSelectable` and `Detail` - will not.<br><br>**Note:** `InactiveSelectable` behaves like `Inactive` (no active press/hover feedback and the<br>`item-click` event is not fired), but the item can still be selected. Clicking the item body,<br>pressing Space/Enter, or interacting with the selection component (checkbox in Multi mode, radio<br>button in Single modes) toggles the selection when the list has a selection mode. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the content of the component. |
| `deleteButton` | `Slot<IButton>` | Defines the delete button, displayed in "Delete" mode.<br>**Note:** While the slot allows custom buttons, to match<br>design guidelines, please use the `ui5-button` component.<br>**Note:** When the slot is not present, a built-in delete button will be displayed. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |
| `detail-click` | `CustomEvent` | true | false | Fired when the user clicks on the detail button when type is `Detail`. |

#### CSS parts

- `checkbox`: Used to style the checkbox rendered when the list item is in multiple selection mode
- `content`: Used to style the content area of the list item
- `delete-button`: Used to style the button rendered when the list item is in delete mode
- `detail-button`: Used to style the button rendered when the list item is of type detail
- `native-li`: Used to style the main li tag of the list item
- `radio`: Used to style the radio button rendered when the list item is in single selection mode

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `colorScheme`, `icon`, `itemKey`.
- [ ] Verify `click`, `detail-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [UserSettingsDialog](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsDialog/)

- Tag: `ui5-user-settings-dialog`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsDialog.d.ts).
- Local implementation: `src/components/user-settings-dialog` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-dialog` is an SAP Fiori-specific web component used in the `ui5-user-menu`.
It allows the user to easily view information and settings for an account.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserSettingsDialog.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `headerText` | `string \| undefined` | `undefined` | Defines the headerText of the item. |
| `open` | `boolean` | `false` | Defines, if the User Settings Dialog is opened. |
| `saveMode` | `boolean` | `false` | Defines whether the dialog offers Save and Cancel actions in its footer.<br><br>When true, the footer renders a Save (Emphasized) and a Cancel button<br>instead of the default Close button. Save and Cancel each fire a<br>corresponding event; the application is responsible for closing the<br>dialog (typically after persisting or discarding the changes). |
| `showSearchField` | `boolean` | `false` | Defines if the Search Field would be displayed.<br><br>**Note:** By default the Search Field is not displayed. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<UserSettingsItem>` | Defines the user settings items.<br><br>**Note:**  If no setting item is set as `selected`, the first one will be selected. |
| `fixedItems` | `Slot<UserSettingsItem>` | Defines the fixed user settings items. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `before-close` | `CustomEvent` | false | true | Fired before the settings dialog is closed.<br><br>**Note:** This event is cancelable via `preventDefault()`, allowing the application to keep the<br>dialog open — for example, to prompt the user about unsaved changes before dismissal. |
| `cancel` | `CustomEvent` | false | false | Fired when the Cancel button in the footer is clicked.<br>The dialog does not close automatically — the application is responsible<br>for closing it after discarding the changes. |
| `close` | `CustomEvent` | false | false | Fired when the settings dialog is closed. |
| `open` | `CustomEvent` | false | false | Fired when the settings dialog is opened. |
| `save` | `CustomEvent` | false | false | Fired when the Save button in the footer is clicked.<br>The dialog does not close automatically — the application is responsible<br>for closing it after persisting the changes. |
| `selection-change` | `CustomEvent<UserSettingsItemSelectEventDetail>` | false | true | Fired when an item is selected. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserSettingsDialog/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserSettingsDialog/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserSettingsDialog/Basic/main.js).
- [Save Mode](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserSettingsDialog/SaveMode/sample.tsx) — By default the dialog shows a single **Close** button and follows an implicit-save flow. Setting `saveMode` replaces the footer with **Save** and **Cancel** buttons.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserSettingsDialog/SaveMode/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/UserSettingsDialog/SaveMode/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `headerText`, `open`, `saveMode`.
- [ ] Verify `before-close`, `cancel`, `close`, `open`, `save`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [UserSettingsItem](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsItem/)

- Tag: `ui5-user-settings-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsItem.d.ts).
- Local implementation: `src/components/user-settings-dialog` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-item` represents an item in the `ui5-user-settings-dialog`.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserSettingsItem.js";`

You can disable the <code>UserSettingsItem</code> by setting the <code>enabled</code> property to <code>false</code>,
or use the <code>UserSettingsItem</code> in read-only mode by setting the <code>editable</code> property to false.

<b>Note:</b> Disabled and read-only states shouldn't be used together.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state.<br><br>**Note:** A disabled component is completely noninteractive. |
| `headerText` | `string \| undefined` | `""` | Defines the headerText of the item. |
| `icon` | `string` | `"globe"` | Defines the icon of the component. |
| `loading` | `boolean` | `false` | Indicates whether a loading indicator should be shown. |
| `loadingReason` | `string \| undefined` | `undefined` | Indicates why the control is in loading state. |
| `selected` | `boolean` | `false` | Shows item tab. |
| `text` | `string` | `""` | Defines the text of the user settings item. |
| `tooltip` | `string` | `""` | Defines the tooltip of the component.<br><br>A tooltip attribute should be provided to represent the meaning or function when the component is collapsed and only the icon is visible. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<UserSettingsView>` | Defines the page views of the user settings item.<br><br>If there are no tab views, the first page view will be shown unless there is selected one. If there is selected page<br>view it will be shown no matter if there are tab views.<br><br>The page views are displayed by default if there is no selected tab view. |
| `tabs` | `Slot<UserSettingsView>` | Defines the tab views of the user settings item. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `selection-change` | `CustomEvent<UserSettingsItemViewSelectEventDetail>` | false | true | Fired when a selected view changed. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `disabled`, `headerText`.
- [ ] Verify `selection-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [UserSettingsNotificationsView](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsNotificationsView/)

- Tag: `ui5-user-settings-notifications-view`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsNotificationsView.d.ts).
- Local implementation: covered by `UserSettingsDialog` view `content` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-notifications-view` represents a view displayed in the
`ui5-user-settings-item` that lists notification preferences. Individual settings
are represented by `ui5-user-settings-notifications-view-item` elements, optionally
grouped by `ui5-user-settings-notifications-view-group`.

When a navigable item is clicked, the view drills into a sibling secondary view of
its parent `ui5-user-settings-item`. When an item's `item-key` matches a target
view's `id`, that view is opened and keeps its own `text`. Otherwise the first
sibling marked as `secondary` is opened and its `text` is set to the clicked
item's `text` so the drill-in header reflects the origin.

Apps can override this behavior by preventing the `item-click` event.

Applications should listen to the item's `switch-change` event (which bubbles) to
be notified when a switch is toggled.

Additional content (e.g. an information message strip) can be placed via the
`additionalContent` slot, which is rendered above the list.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserSettingsNotificationsView.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `secondary` | `boolean` | `false` | Indicates whether the view is secondary. It is relevant only if the view is used in `pages` slot of `ui5-user-settings-item`<br>and controls the visibility of the back button. |
| `selected` | `boolean` | `false` | Defines whether the view is selected. There can be just one selected view at a time. |
| `text` | `string \| undefined` | `undefined` | Defines the title text of the user settings view. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `additionalContent` | `Slot<HTMLElement>` | Defines additional content displayed above the items list. |
| `default` | `Not identified; inspect declaration` | Defines the items of the component. Can be a mix of<br>`ui5-user-settings-notifications-view-item` and<br>`ui5-user-settings-notifications-view-group` elements. |
| `headerItems` | `Slot<UserSettingsNotificationsViewItem>` | Defines header items rendered above the grouped items list.<br>Each item is wrapped in a `role="form"` landmark — a separate Tab stop.<br>Use this slot for product-level toggles (e.g. "Allow Notifications") that appear<br>above the notification-type groups. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `item-click` | `CustomEvent<UserSettingsNotificationsViewItemClickEventDetail>` | false | true | Fired when a navigable item in the list is clicked.<br><br>The event is cancelable: preventing it skips the built-in drill-in to the<br>parent's secondary view, allowing the application to take over. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `secondary`, `selected`, `text`.
- [ ] Verify `item-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [UserSettingsNotificationsViewGroup](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsNotificationsViewGroup/)

- Tag: `ui5-user-settings-notifications-view-group`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsNotificationsViewGroup.d.ts).
- Local implementation: covered by `UserSettingsDialog` view `content` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-notifications-view-group` groups `ui5-user-settings-notifications-view-item`
elements inside a `ui5-user-settings-notifications-view`. Its header renders as a plain bold
section title with a separator line below, per the notifications design spec.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserSettingsNotificationsViewGroup.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `headerAccessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the header. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text of the group. |
| `wrappingType` | `` `${WrappingType}` `` | `"None"` | Defines if the text of the component should wrap when it's too long.<br>When set to "Normal", the content (title, description) will be wrapped<br>using the `ui5-expandable-text` component.<br/><br><br>The text can wrap up to 100 characters on small screens (size S) and<br>up to 300 characters on larger screens (size M and above). When text exceeds<br>these limits, it truncates with an ellipsis followed by a text expansion trigger.<br><br>Available options are:<br>- `None` (default) - The text will truncate with an ellipsis.<br>- `Normal` - The text will wrap (without truncation). |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<UserSettingsNotificationsViewItem>` | Defines the items of the `ui5-user-settings-notifications-view-group`. |
| `header` | `Slot<ListItemBase>` | Defines the header of the component.<br><br>**Note:** Using this slot, the default header text of group and the value of `headerText` property will be overwritten. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `move` | `CustomEvent<ListItemGroupMoveEventDetail>` | true | false | Fired when a movable list item is dropped onto a drop target.<br><br>**Note:** `move` event is fired only if there was a preceding `move-over` with prevented default action. |
| `move-over` | `CustomEvent<ListItemGroupMoveEventDetail>` | true | true | Fired when a movable list item is moved over a potential drop target during a dragging operation.<br><br>If the new position is valid, prevent the default action of the event using `preventDefault()`. |

#### CSS parts

- `header`: Used to style the header item of the group
- `title`: Used to style the title of the group header

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `headerAccessibleName`, `headerText`, `wrappingType`.
- [ ] Verify `move`, `move-over` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [UserSettingsNotificationsViewItem](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsNotificationsViewItem/)

- Tag: `ui5-user-settings-notifications-view-item`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsNotificationsViewItem.d.ts).
- Local implementation: covered by `UserSettingsDialog` view `content` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-notifications-view-item` represents a single notification setting
within the `ui5-user-settings-notifications-view`.

It displays a title and an optional byline. By default a trailing switch reflects
the `checked` state. Applications can override the trailing control by providing content
in the `endContent` slot (e.g. a `ui5-select` for a value picker); the built-in switch and
its `switch-change` event are then suppressed. Items can additionally be flagged as
`navigable` to display a navigation arrow and behave as clickable list rows.

**Note:** The default switch and the `endContent` slot are mutually exclusive.
When any content is provided in `endContent`, the trailing switch is not rendered
and no `switch-change` event is fired.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/UserSettingsNotificationsViewItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `bylineText` | `string` | `""` | Defines the byline text of the item, rendered below the title. |
| `checked` | `boolean` | `false` | Defines whether the trailing switch is on.<br><br>Ignored when the `endContent` slot is used. |
| `itemKey` | `string` | `""` | Defines the unique identifier of the item.<br><br>When the item is navigable, `itemKey` is also used to route to a matching sibling<br>`secondary` view by id. |
| `navigable` | `boolean` | `false` | Defines whether the item is navigable. When true, a navigation arrow is rendered<br>and the whole row becomes clickable (fires the parent view's `item-click` event). |
| `text` | `string` | `""` | Defines the title text of the item. |
| `accessibilityAttributes` | `ListItemAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **ariaSetsize**: Defines the number of items in the current set  when not all items in the set are present in the DOM.<br>**Note:** The value is an integer reflecting the number of items in the complete set. If the size of the entire set is unknown, set `-1`.<br><br>	- **ariaPosinset**: Defines an element's number or position in the current set when not all items are present in the DOM.<br>	**Note:** The value is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the text alternative of the component.<br><br>**Note**: If not provided a default text alternative will be set, if present. |
| `accessibleRole` | `` `${ListItemAccessibleRole}` \| undefined `` | `undefined` | Used to define the role of the list item.<br><br>**Note:** If not set, the role is automatically inherited from the parent `ui5-list` based on its `accessible-role` property<br>(e.g. `Menu` -> `MenuItem`, `Tree` -> `TreeItem`, `ListBox` -> `Option`).<br>An explicitly set `accessible-role` on the list item takes precedence over the inherited role. |
| `highlight` | `` `${Highlight}` `` | `"None"` | Defines the highlight state of the list items.<br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `movable` | `boolean` | `false` | Defines whether the item is movable. |
| `navigated` | `boolean` | `false` | The navigated state of the list item.<br>If set to `true`, a navigation indicator is displayed at the end of the list item. |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the text of the tooltip that would be displayed for the list item. |
| `type` | `` `${ListItemType}` `` | `"Active"` | Defines the visual indication and behavior of the list items.<br>Available options are `Active` (by default), `Inactive`, `InactiveSelectable`, `Detail` and `Navigation`.<br><br>**Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,<br>while with type `Inactive`, `InactiveSelectable` and `Detail` - will not.<br><br>**Note:** `InactiveSelectable` behaves like `Inactive` (no active press/hover feedback and the<br>`item-click` event is not fired), but the item can still be selected. Clicking the item body,<br>pressing Space/Enter, or interacting with the selection component (checkbox in Multi mode, radio<br>button in Single modes) toggles the selection when the list has a selection mode. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `endContent` | `Slot<HTMLElement>` | Defines custom content rendered at the trailing end of the item, replacing the<br>default switch. Use this to place a `ui5-select`, `ui5-input`, or any other<br>control instead of a boolean toggle. |
| `default` | `Not identified; inspect declaration` | Defines the content of the component. |
| `deleteButton` | `Slot<IButton>` | Defines the delete button, displayed in "Delete" mode.<br>**Note:** While the slot allows custom buttons, to match<br>design guidelines, please use the `ui5-button` component.<br>**Note:** When the slot is not present, a built-in delete button will be displayed. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `switch-change` | `CustomEvent<UserSettingsNotificationsViewItemSwitchChangeEventDetail>` | true | false | Fired when the switch state changes.<br><br>Not fired when the `endContent` slot is used to override the trailing control. |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |
| `detail-click` | `CustomEvent` | true | false | Fired when the user clicks on the detail button when type is `Detail`. |

#### CSS parts

- `checkbox`: Used to style the checkbox rendered when the list item is in multiple selection mode
- `content`: Used to style the content area of the list item
- `delete-button`: Used to style the button rendered when the list item is in delete mode
- `detail-button`: Used to style the button rendered when the list item is of type detail
- `native-li`: Used to style the main li tag of the list item
- `radio`: Used to style the radio button rendered when the list item is in single selection mode

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `bylineText`, `checked`, `itemKey`.
- [ ] Verify `switch-change`, `click`, `detail-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [UserSettingsView](https://ui5.github.io/webcomponents/nightly/components/fiori/UserSettingsView/)

- Tag: `ui5-user-settings-view`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/UserSettingsView.d.ts).
- Local implementation: `src/components/user-settings-dialog` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-user-settings-view` represents a view displayed in the `ui5-user-settings-item`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `secondary` | `boolean` | `false` | Indicates whether the view is secondary. It is relevant only if the view is used in `pages` slot of `ui5-user-settings-item`<br>and controls the visibility of the back button. |
| `selected` | `boolean` | `false` | Defines whether the view is selected. There can be just one selected view at a time. |
| `text` | `string \| undefined` | `undefined` | Defines the title text of the user settings view. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the view. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `secondary`, `selected`, `text`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [ViewSettingsDialog](https://ui5.github.io/webcomponents/nightly/components/fiori/ViewSettingsDialog/)

- Tag: `ui5-view-settings-dialog`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/ViewSettingsDialog.d.ts).
- Local implementation: `src/components/view-settings-dialog` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-view-settings-dialog` component helps the user to sort data within a list or a table.
It consists of several lists like `Sort order` which is built-in and `Sort By` and `Filter By` lists,
for which you must be provide items(`ui5-sort-item` & `ui5-filter-item` respectively)
These options can be used to create sorters for a table.

The `ui5-view-settings-dialog` interrupts the current application processing as it is the only focused UI element and
the main screen is dimmed/blocked.
The `ui5-view-settings-dialog` is modal, which means that user action is required before returning to the parent window is possible.

##### Structure
A `ui5-view-settings-dialog` consists of a header, content, and a footer for action buttons.
The `ui5-view-settings-dialog` is usually displayed at the center of the screen.

##### Responsive Behavior
`ui5-view-settings-dialog` stretches on full screen on phones.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/ViewSettingsDialog.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `groupDescending` | `boolean` | `false` | Defines the initial group order. |
| `open` | `boolean` | `false` | Indicates if the dialog is open. |
| `resetEnabled` | `boolean` | `false` | Controls whether the Reset button is always enabled.<br><br>By default, the Reset button is enabled only when the built-in settings (Sort, Filter, Group)<br>differ from their initial state — the component can detect these changes automatically.<br>However, when the dialog contains custom tabs, the component has no way to detect<br>whether the custom tab content has been modified by the user.<br><br>Set this property to `true` when the user has made changes inside a custom tab, so that<br>the Reset button becomes enabled and the user can trigger a reset.<br>Set it back to `false` once the custom tab content is back to its initial state<br>(e.g. after the user confirms or after a reset is applied). |
| `sortDescending` | `boolean` | `false` | Defines the initial sort order. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `customTabs` | `Slot<ViewSettingsDialogCustomTab>` | Defines custom tabs for the dialog.<br><br>The custom tabs are rendered after the built-in tabs (`Sort`, `Filter`, `Group`).<br><br>**Note:** If you want to use this slot, you need to import the item: `import "@ui5/webcomponents-fiori/dist/ViewSettingsDialogCustomTab.js";` |
| `filterItems` | `Slot<FilterItem>` | Defines the `filterItems` list.<br><br>**Note:** If you want to use this slot, you need to import used item: `import "@ui5/webcomponents-fiori/dist/FilterItem.js";` |
| `groupItems` | `Slot<GroupItem>` | Defines the list of items against which the user could group data.<br><br>**Note:** If you want to use this slot, you need to import used item: `import "@ui5/webcomponents-fiori/dist/GroupItem.js";` |
| `sortItems` | `Slot<SortItem>` | Defines the list of items against which the user could sort data.<br><br>**Note:** If you want to use this slot, you need to import used item: `import "@ui5/webcomponents-fiori/dist/SortItem.js";` |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `before-open` | `CustomEvent` | false | true | Fired before the component is opened. |
| `cancel` | `CustomEvent<ViewSettingsDialogCancelEventDetail>` | true | false | Fired when cancel button is activated. |
| `close` | `CustomEvent` | true | false | Fired after the dialog is closed. |
| `confirm` | `CustomEvent<ViewSettingsDialogConfirmEventDetail>` | true | false | Fired when confirmation button is activated. |
| `open` | `CustomEvent` | true | false | Fired after the dialog is opened. |
| `reset` | `CustomEvent` | true | false | Fired when the Reset button is clicked.<br><br>**Note:** This event is particularly relevant when the dialog contains custom tabs.<br>By default, the Reset button resets all built-in settings (sort, filter, group) to their<br>initial values. However, the component has no knowledge of the content or state inside<br>custom tabs — it cannot detect what has changed or what the "default" values are.<br>Therefore, when this event is fired, it is the application developer's responsibility<br>to listen for it and manually reset the custom tab content to its initial state. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `setConfirmedSettings` | `setConfirmedSettings(settings: VSDSettings): void;` | Sets a JavaScript object, as settings to the `ui5-view-settings-dialog`.<br>This method can be used after the dialog is initially open, as the dialog needs<br>to set its initial settings.<br>The `ui5-view-settings-dialog` throws an event called "before-open",<br>which can be used as a trigger point.<br>The object should have the following format: |

#### CSS parts

- `header`: Used to style the header.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ViewSettingsDialog/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ViewSettingsDialog/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ViewSettingsDialog/Basic/main.js).
- [Custom Tabs](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ViewSettingsDialog/CustomTabs/sample.tsx) — The ViewSettingsDialog supports custom tabs alongside the built-in Sort, Filter, and Group tabs.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ViewSettingsDialog/CustomTabs/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/ViewSettingsDialog/CustomTabs/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `groupDescending`, `open`, `resetEnabled`.
- [ ] Verify `before-open`, `cancel`, `close`, `confirm`, `open`, `reset` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- CSS custom states

### [ViewSettingsDialogCustomTab](https://ui5.github.io/webcomponents/nightly/components/fiori/ViewSettingsDialogCustomTab/)

- Tag: `ui5-view-settings-dialog-custom-tab`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/ViewSettingsDialogCustomTab.d.ts).
- Local implementation: `src/components/view-settings-dialog` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-view-settings-dialog-custom-tab` component allows defining custom tabs for the `ui5-view-settings-dialog`.

##### ES6 Module Import

`import "@ui5/webcomponents-fiori/dist/ViewSettingsDialogCustomTab.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string` | `"action-settings"` | Defines the icon of the custom tab button in the segmented button. |
| `titleText` | `string` | `""` | Defines the title text of the custom tab.<br><br>**Note:** It is displayed in the dialog header when this tab is selected. |
| `tooltip` | `string` | `""` | Defines the tooltip of the custom tab button.<br><br>**Note:** It is shown on the segmented button item. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the custom tab content. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `icon`, `titleText`, `tooltip`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [Wizard](https://ui5.github.io/webcomponents/nightly/components/fiori/Wizard/)

- Tag: `ui5-wizard`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/Wizard.d.ts).
- Local implementation: `src/patterns/wizard` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-wizard` helps users to complete a complex task by dividing it into sections and guiding them through it.
It has two main areas - a navigation area at the top showing the step sequence and a content area below it.

##### Structure
##### Navigation area
The top most area of the `ui5-wizard` is occupied by the navigation area.
It shows the sequence of steps, where the recommended number of steps is between 3 and 8 steps.

-  Steps can have different visual representations - numbers or icons.
-  Steps might have labels for better readability - titleText and subTitleText.
-  Steps are defined by using the `ui5-wizard-step` as slotted element within the `ui5-wizard`.

**Note:** If no selected step is defined, the first step will be auto selected.

**Note:** If multiple selected steps are defined, the last step will be selected.

##### Keyboard Handling
The user can navigate using the following keyboard shortcuts:

##### Wizard Progress Navigation

	- [Left] or [Down] - Focus moves backward to the WizardProgressNavAnchors.
	- [Up] or [Right] - Focus moves forward to the WizardProgressNavAnchor.
	- [Space] / [Enter] or [Return] - Selects an active step
	- [Home] or [PAGE UP] - Focus goes to the first step
	- [End] or [PAGE DOWN] - Focus goes to the last step

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### Content
The content occupies the main part of the page. It can hold any type of HTML elements.
It's defined by using the `ui5-wizard-step` as slotted element within the `ui5-wizard`.

##### Scrolling
The component handles user scrolling by selecting the closest step, based on the current scroll position
and scrolls to particular place, when the user clicks on the step within the navigation area.

**Important:** In order the component's scrolling behaviour to work, it has to be limited from the outside parent element in terms of height.
The component or its parent has to be given percentage or absolute height. Otherwise, the component will be scrolled out with the entire page.

**For example:**

```html
<ui5-dialog style="height: 80%">
	<ui5-wizard></ui5-wizard>
</ui5-dialog>
```

##### Moving to next step
The `ui5-wizard-step` provides the necessary API and it's up to the user of the component to use it to move to the next step.
You have to set its `selected` property (and remove the `disabled` one if set) to `true`.
The `ui5-wizard` will automatically scroll to the content of the newly selected step.

The Fiori 3 guidelines recommends having a "nextStep" button in the content area.
You can place a button, or any other type of element to trigger step change, inside the `ui5-wizard-step`,
and show/hide it when certain fields are filled or user defined criteria is met.

##### Usage
##### When to use:
When the user has to accomplish a long or unfamiliar task.

##### When not to use:
When the task has less than 3 steps.

##### Responsive Behavior
On small widths the step's titleText, subtitleText and separators in the navigation area shrink and from particular point the steps are grouped together and overlap.
Tapping on them will show a popover to select the step to navigate to. On mobile device, the grouped steps are presented within a dialog.

##### ES6 Module Import
`import "@ui5/webcomponents-fiori/dist/Wizard.js";` (includes <ui5-wizard-step/>)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `contentLayout` | `` `${WizardContentLayout}` `` | `"MultipleSteps"` | Defines how the content of the `ui5-wizard` would be visualized. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<WizardStep>` | Defines the steps.<br><br>**Note:** Use the available `ui5-wizard-step` component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `step-change` | `CustomEvent<WizardStepChangeEventDetail>` | true | false | Fired when the step is changed by user interaction - either with scrolling,<br>or by clicking on the steps within the component header. |

#### CSS parts

- `navigator`: Used to style the progress navigator of the `ui5-wizard`.
- `step-content`: Used to style a `ui5-wizard-step` container.

#### Samples

- [Basic Sample](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Wizard/Basic/sample.tsx) — By default the navigation to another step happens with scrolling or pressing the given step in the Wizard header.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Wizard/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Wizard/Basic/main.js).
- [Page Mode](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Wizard/PageMode/sample.tsx) — Instead of scrolling each step is shown as a separate page.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Wizard/PageMode/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/fiori/Wizard/PageMode/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `contentLayout`.
- [ ] Verify `step-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/patterns/wizard` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [WizardStep](https://ui5.github.io/webcomponents/nightly/components/fiori/WizardStep/)

- Tag: `ui5-wizard-step`
- Package: `@ui5/webcomponents-fiori@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-fiori@2.28.1/dist/WizardStep.d.ts).
- Local implementation: covered by `Wizard` steps (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

A component that represents a logical step as part of the `ui5-wizard`.
It is meant to aggregate arbitrary HTML elements that form the content of a single step.

##### Structure

- Each wizard step has arbitrary content.
- Each wizard step might have texts - defined by the `titleText` and `subtitleText` properties.
- Each wizard step might have an icon - defined by the `icon` property.
- Each wizard step might display a number in place of the `icon`, when it's missing.

##### Usage
The `ui5-wizard-step` component should be used only as slot of the `ui5-wizard` component
and should not be used standalone.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `branching` | `boolean` | `false` | When `branching` is enabled a dashed line would be displayed after the step,<br>meant to indicate that the next step is not yet known and depends on user choice in the current step.<br><br>**Note:** It is recommended to use `branching` on the last known step<br>and later add new steps when it becomes clear how the wizard flow should continue. |
| `disabled` | `boolean` | `false` | Defines if the step is `disabled`. When disabled the step is displayed,<br>but the user can't select the step by clicking or navigate to it with scrolling.<br><br>**Note:** Step can't be `selected` and `disabled` at the same time.<br>In this case the `selected` property would take precedence. |
| `icon` | `string \| undefined` | `undefined` | Defines the `icon` of the step.<br><br>**Note:** The icon is displayed in the `ui5-wizard` navigation header.<br><br>The SAP-icons font provides numerous options.<br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `selected` | `boolean` | `false` | Defines the step's `selected` state - the step that is currently active.<br><br>**Note:** Step can't be `selected` and `disabled` at the same time.<br>In this case the `selected` property would take precedence. |
| `subtitleText` | `string \| undefined` | `undefined` | Defines the `subtitleText` of the step.<br><br>**Note:** the text is displayed in the `ui5-wizard` navigation header. |
| `titleText` | `string \| undefined` | `undefined` | Defines the `titleText` of the step.<br><br>**Note:** The text is displayed in the `ui5-wizard` navigation header. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the step content. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `branching`, `disabled`, `icon`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

