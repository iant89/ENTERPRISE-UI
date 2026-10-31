## Compatibility components

### [Table](https://ui5.github.io/webcomponents/nightly/components/compat/Table/)

- Tag: `ui5-table`
- Package: `@ui5/webcomponents-compat@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-compat@2.28.1/dist/Table.d.ts).
- Local implementation: `src/components/table` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table` component provides a set of sophisticated and convenient functions for responsive table design.
It provides a comprehensive set of features for displaying and dealing with vast amounts of data.

To render the `Table` properly, the order of the `columns` should match with the
order of the item `cells` in the `rows`.

Desktop and tablet devices are supported.
On tablets, special consideration should be given to the number of visible columns
and rows due to the limited performance of some devices.

##### Selection
To benefit from the selection mechanism of `ui5-table` component, you can use the available selection modes:
`SingleSelect` and `MultiSelect`.

In additition to the used mode, you can also specify the `ui5-table-row` type choosing between
`Active` or `Inactive`.

In `SingleSelect` mode, you can select both an `Active` and `Inactive` row via mouse or
by pressing the `Space` or `Enter` keys.

In `MultiSelect` mode, you can select both an `Active` and `Inactive` row by pressing the
`Space` key when a row is on focus or via mouse click over the selection checkbox of the row.
In order to select all the available rows at once, you can use the selection checkbox presented in the table's header.

**Note:** Currently, when a column is shown as a pop-in, the visual indication for selection is not presented over it.

##### Keyboard Handling

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

Furthermore, you can interact with `ui5-table` via the following keys.

- [F7] - If focus is on an interactive control inside an item, moves focus to the corresponding item.
- [Ctrl]+[A] - Selects all items, if MultiSelect mode is enabled.
- [Home]/[End] - Focuses the first/last item.
- [Page Up]/[Page Down] - Moves focus up/down by page size (20 items by default).
- [Alt]+[Down]/[Up] - Switches focus between header, last focused item, and More button (if applies) in either direction.
- [Shift]+[Down]/[Up] - Selects the next/previous item in a MultiSelect table, if the current item is selected (Range selection). Otherwise, deselects them (Range deselection).
- [Shift]+[Home]/[End] - Range selection to the first/last item of the List.
- [Ctrl]+[Home]/[End] - Same behavior as HOME & END.

##### ES6 Module Import

- `import "@ui5/webcomponents-compat/dist/Table.js";`
- `import "@ui5/webcomponents-compat/dist/TableColumn.js";` (`ui5-table-column`)
- `import "@ui5/webcomponents-compat/dist/TableRow.js";` (`ui5-table-row`)
- `import "@ui5/webcomponents-compat/dist/TableGroupRow.js";` (`ui5-table-group-row`)
- `import "@ui5/webcomponents-compat/dist/TableCell.js";` (`ui5-table-cell`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `busy` | `boolean` | `false` | Defines if the table is in busy state.<br><br>In this state the component's opacity is reduced<br>and busy indicator is displayed at the bottom of the table. |
| `busyDelay` | `number` | `1000` | Defines the delay in milliseconds, after which the busy indicator will show up for this component. |
| `growing` | `` `${TableGrowingMode}` `` | `"None"` | Defines whether the table will have growing capability either by pressing a `More` button,<br>or via user scroll. In both cases `load-more` event is fired.<br><br>Available options:<br><br>`Button` - Shows a `More` button at the bottom of the table, pressing of which triggers the `load-more` event.<br><br>`Scroll` - The `load-more` event is triggered when the user scrolls to the bottom of the table;<br><br>`None` (default) - The growing is off.<br><br>**Restrictions:** `growing="Scroll"` is not supported for Internet Explorer,<br>and the component will fallback to `growing="Button"`. |
| `growingButtonSubtext` | `string \| undefined` | `undefined` | Defines the subtext that will be displayed under the `growingButtonText`.<br><br>**Note:** This property takes effect if `growing` is set to `Button`. |
| `growingButtonText` | `string \| undefined` | `undefined` | Defines the text that will be displayed inside the growing button at the bottom of the table,<br>meant for loading more rows upon press.<br><br>**Note:** If not specified a built-in text will be displayed.<br><br>**Note:** This property takes effect if `growing` is set to `Button`. |
| `hideNoData` | `boolean` | `false` | Defines if the value of `noDataText` will be displayed when there is no rows present in the table. |
| `mode` | `` `${TableMode}` `` | `"None"` | Defines the mode of the component. |
| `noDataText` | `string \| undefined` | `undefined` | Defines the text that will be displayed when there is no data and `hideNoData` is not present. |
| `stickyColumnHeader` | `boolean` | `false` | Determines whether the column headers remain fixed at the top of the page during<br>vertical scrolling as long as the Web Component is in the viewport.<br><br>**Restrictions:**<br><br>- Browsers that do not support this feature:<br><br>- Internet Explorer<br>- Microsoft Edge lower than version 41 (EdgeHTML 16)<br>- Mozilla Firefox lower than version 59<br><br>- Scrolling behavior:<br><br>- If the Web Component is placed in layout containers that have the `overflow: hidden`<br>or `overflow: auto` style definition, this can<br>prevent the sticky elements of the Web Component from becoming fixed at the top of the viewport. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `columns` | `Slot<TableColumn>` | Defines the configuration for the columns of the component.<br><br>**Note:** Use `ui5-table-column` for the intended design. |
| `default` | `DefaultSlot<ITableRow>` | Defines the component rows.<br><br>**Note:** Use `ui5-table-row` for the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `load-more` | `CustomEvent` | true | false | Fired when the user presses the `More` button or scrolls to the table's end.<br><br>**Note:** The event will be fired if `growing` is set to `Button` or `Scroll`. |
| `popin-change` | `CustomEvent<TablePopinChangeEventDetail>` | true | false | Fired when `ui5-table-column` is shown as a pop-in instead of hiding it. |
| `row-click` | `CustomEvent<TableRowClickEventDetail>` | true | false | Fired when a row in `Active` mode is clicked or `Enter` key is pressed. |
| `selection-change` | `CustomEvent<TableSelectionChangeEventDetail>` | true | false | Fired when selection is changed by user interaction<br>in `SingleSelect` and `MultiSelect` modes. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/Basic/main.js).
- [Active Rows](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/ActiveRows/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/ActiveRows/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/ActiveRows/main.js).
- [Columns Popin](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/Popin/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/Popin/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/Popin/main.js).
- [Single Selection](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/SingleSelection/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/SingleSelection/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/SingleSelection/main.js).
- [Multiple Selection](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/MultipleSelection/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/MultipleSelection/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/MultipleSelection/main.js).
- [Grouping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/Grouping/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/Grouping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/Grouping/main.js).
- [Growing on Button Press](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/GrowingOnButtonPress/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/GrowingOnButtonPress/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/GrowingOnButtonPress/main.js).
- [Growing on Scroll](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/GrowingOnScroll/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/GrowingOnScroll/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/GrowingOnScroll/main.js).
- [No Data](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/NoData/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/NoData/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/NoData/main.js).
- [Sticky Header](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/StickyHeader/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/StickyHeader/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/compat/Table/StickyHeader/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `busy`.
- [ ] Verify `load-more`, `popin-change`, `row-click`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/table` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [TableCell](https://ui5.github.io/webcomponents/nightly/components/compat/TableCell/)

- Tag: `ui5-table-cell`
- Package: `@ui5/webcomponents-compat@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-compat@2.28.1/dist/TableCell.d.ts).
- Local implementation: covered by `Table` `columns` render functions (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-cell` component defines the structure of the data in a single `ui5-table` cell.

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Specifies the content of the component. |

#### CSS parts

- `cell`: Used to style the native `td` element

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.

#### Empty documentation fields

- TypeScript properties
- Events
- Public methods
- CSS custom states
- Samples

### [TableColumn](https://ui5.github.io/webcomponents/nightly/components/compat/TableColumn/)

- Tag: `ui5-table-column`
- Package: `@ui5/webcomponents-compat@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-compat@2.28.1/dist/TableColumn.d.ts).
- Local implementation: covered by `Table` `columns` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-column` component allows to define column specific properties that are applied
when rendering the `ui5-table` component.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `demandPopin` | `boolean` | `false` | According to your `minWidth` settings, the component can be hidden<br>in different screen sizes.<br><br>Setting this property to `true`, shows this column as pop-in instead of hiding it. |
| `minWidth` | `number` | `Infinity` | Defines the minimum table width required to display this column. By default it is always displayed.<br><br>The responsive behavior of the `ui5-table` is determined by this property. As an example, by setting<br>`minWidth` property to `400` sets the minimum width to 400 pixels, and	shows this column on tablet (and desktop) but hides it on mobile.<br><br>For further responsive design options, see `demandPopin` property. |
| `popinDisplay` | `` `${TableColumnPopinDisplay}` `` | `"Block"` | Defines how the popin row is displayed.<br><br>**The available values are:**<br><br>- `Block`<br>- `Inline` |
| `popinText` | `string \| undefined` | `undefined` | The text for the column when it pops in. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the content of the column header |

#### CSS parts

- `column`: Used to style the native `th` element

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `demandPopin`, `minWidth`, `popinDisplay`.

#### Empty documentation fields

- Events
- Public methods
- CSS custom states
- Samples

### [TableGroupRow](https://ui5.github.io/webcomponents/nightly/components/compat/TableGroupRow/)

- Tag: `ui5-table-group-row`
- Package: `@ui5/webcomponents-compat@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-compat@2.28.1/dist/TableGroupRow.d.ts).
- Local implementation: covered by `DataGrid` grouping (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-group-row` component represents a group row in the `ui5-table`.

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### CSS parts

- `group-row`: Used to style the native `tr` element

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.

#### Empty documentation fields

- TypeScript properties
- Events
- Public methods
- CSS custom states
- Samples

### [TableRow](https://ui5.github.io/webcomponents/nightly/components/compat/TableRow/)

- Tag: `ui5-table-row`
- Package: `@ui5/webcomponents-compat@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-compat@2.28.1/dist/TableRow.d.ts).
- Local implementation: covered by `Table` `rows` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-row` component represents a row in the `ui5-table`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `navigated` | `boolean` | `false` | Indicates if the table row is navigated. |
| `selected` | `boolean` | `false` | Defines the row's selected state. |
| `type` | `` `${TableRowType}` `` | `"Inactive"` | Defines the visual indication and behavior of the component.<br><br>**Note:** When set to `Active`, the item will provide visual response upon press,<br>while with type `Inactive`-will not. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<TableCell>` | Defines the cells of the component.<br><br>**Note:** Use `ui5-table-cell` for the intended design. |

#### CSS parts

- `popin-row`: Used to style the `tr` element when a row pops in
- `row`: Used to style the native `tr` element

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `navigated`, `selected`, `type`.

#### Empty documentation fields

- Events
- Public methods
- CSS custom states
- Samples

