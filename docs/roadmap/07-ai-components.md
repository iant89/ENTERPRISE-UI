## AI components

### [Button](https://ui5.github.io/webcomponents/nightly/components/ai/Button/)

- Tag: `ui5-ai-button`
- Package: `@ui5/webcomponents-ai@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-ai@2.28.1/dist/Button.d.ts).
- Local implementation: `src/components/button` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-ai-button` component serves as a button for AI-related scenarios. Users can trigger actions by clicking or tapping the `ui5-ai-button`
or by pressing keyboard keys like [Enter] or [Space].

##### Usage

For the `ui5-ai-button` user interface, you can define one or more button states by placing `ui5-ai-button-state` components in their default slot.
Each state has a name for identification and can include text, an icon, and an end icon, as needed for its purpose.
You can define a split mode for the `ui5-ai-button`, which will results in displaying an arrow button for additional actions.

You can choose from a set of predefined designs for `ui5-ai-button` (as in `ui5-button`) to match the desired styling.

The `ui5-ai-button` can be activated by clicking or tapping it. You can change the button state in the click event handler. When the button is
in split mode, you can activate the default button action by clicking or tapping it, or by pressing keyboard keys like [Enter] or [Space].
You can activate the arrow button by clicking or tapping it, or by pressing keyboard keys like [Arrow Up], [Arrow Down], or [F4].
To display additional actions, you can attach a menu to the arrow button.

##### ES6 Module Import

`import "@ui5/webcomponents-ai/dist/Button.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `AIButtonAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br><br>This property allows for fine-tuned control of ARIA attributes for screen reader support.<br>It accepts an object with the following optional fields:<br><br>- **root**: Accessibility attributes that will be applied to the root element.<br> - **hasPopup**: Indicates the availability and type of interactive popup element (such as a menu or dialog).<br>   Accepts string values: `"dialog"`, `"grid"`, `"listbox"`, `"menu"`, or `"tree"`.<br> - **roleDescription**: Defines a human-readable description for the button's role.<br>   Accepts any string value.<br> - **title**: Specifies a tooltip or description for screen readers.<br>   Accepts any string value.<br>- **ariaKeyShortcuts**: Defines keyboard shortcuts that activate or focus the button.<br><br>- **arrowButton**: Accessibility attributes that will be applied to the arrow (split) button element.<br> - **hasPopup**: Indicates the type of popup triggered by the arrow button.<br>   Accepts string values: `"dialog"`, `"grid"`, `"listbox"`, `"menu"`, or `"tree"`.<br> - **expanded**: Indicates whether the popup controlled by the arrow button is currently expanded.<br>   Accepts boolean values: `true` or `false`. |
| `arrowButtonPressed` | `boolean` | `false` | Defines the active state of the arrow button in split mode.<br>Set to true when the button is in split mode and a menu with additional options<br>is opened by the arrow button. Set back to false when the menu is closed. |
| `design` | `` `${ButtonDesign}` \| undefined `` | `"Default"` | Defines the component design. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br>A disabled component can't be pressed or<br>focused, and it is not in the tab chain. |
| `state` | `string \| undefined` | `undefined` | Defines the current state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ButtonState>` | Defines the available states of the component.<br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that<br>you only use `ui5-ai-button-state` components in order to preserve the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `arrow-button-click` | `CustomEvent` | true | false | Fired when the component is in split mode and after the arrow button<br>is activated either by clicking or tapping it or by using the [Arrow Up] / [Arrow Down],<br>[Alt] + [Arrow Up]/ [Arrow Down], or [F4] keyboard keys. |
| `click` | `CustomEvent` | true | false | Fired when the component is activated either with a<br>mouse/tap or by using the Enter or Space key. |

#### Samples

- [AI Button With Menu](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Button/ButtonMenu/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Button/ButtonMenu/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Button/ButtonMenu/main.js).
- [AI Button With Split Mode State](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Button/ButtonSplitMenu/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Button/ButtonSplitMenu/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Button/ButtonSplitMenu/main.js).
- [Icon-only AI Button With Menu](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Button/IconOnlyButton/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Button/IconOnlyButton/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Button/IconOnlyButton/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `arrowButtonPressed`, `design`.
- [ ] Verify `arrow-button-click`, `click` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/button` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [ButtonState](https://ui5.github.io/webcomponents/nightly/components/ai/ButtonState/)

- Tag: `ui5-ai-button-state`
- Package: `@ui5/webcomponents-ai@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-ai@2.28.1/dist/ButtonState.d.ts).
- Local implementation: `src/components/ai-button` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

`ui5-ai-button-state` is the item to use for defining states of `ui5-ai-button` components.

##### Usage

`ui5-ai-button-state` is an abstract element, representing a state of `ui5-ai-button`. It is meant to be used in the `default` slot
of `ui5-ai-button` and should not be used as standalone component.

##### ES6 Module Import

`import "@ui5/webcomponents-ai/dist/ButtonState.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `endIcon` | `string \| undefined` | `undefined` | Defines the icon to be displayed as graphical element within the component after the text.<br>The SAP-icons font provides numerous options.<br><br>**Example:**<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `icon` | `string \| undefined` | `undefined` | Defines the icon to be displayed as graphical element within the component before the text.<br>The SAP-icons font provides numerous options.<br><br>**Example:**<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `name` | `string \| undefined` | `undefined` | Defines the name of the button state. |
| `showArrowButton` | `boolean` | `false` | Defines if the component is in split button mode. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the button in this state. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `endIcon`, `icon`, `name`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [Input](https://ui5.github.io/webcomponents/nightly/components/ai/Input/)

- Tag: `ui5-ai-input`
- Package: `@ui5/webcomponents-ai@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-ai@2.28.1/dist/Input.d.ts).
- Local implementation: `src/components/input` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-ai-input` component extends the standard `ui5-input` with **AI Writing Assistant** capabilities.

##### Structure

The `ui5-ai-input` consists of the following main parts:

- **Input Field** – Inherits all standard Input behaviors.
- **AI Action Button** – Appears when focused or loading, providing access to AI-related actions or stopping generation.

The component automatically determines which elements to render based on its internal state:
- The AI Button is only shown when there are available `actions`.
- The version navigation appears only when `totalVersions > 1`.

##### Keyboard Support

- **Shift + F4** — Opens the AI menu.
- **Ctrl + Shift + Z / Y** — Navigates backward/forward between AI-generated versions.

##### ES6 Module Import

`import "@ui5/webcomponents-ai/dist/Input.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `currentVersion` | `number` | `0` | Indicates the index of the currently displayed version. |
| `loading` | `boolean` | `false` | Defines whether the AI Writing Assistant is currently loading.<br><br>When `true`, indicates that an AI action is in progress. |
| `totalVersions` | `number` | `0` | Indicates the total number of result versions available.<br><br>When not set or set to 0, the versioning will be hidden. |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the input. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the input. |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state.<br><br>**Note:** A disabled component is completely noninteractive. |
| `filter` | `` `${InputSuggestionsFilter}` `` | `"None"` | Defines the filter type of the component. |
| `maxlength` | `number \| undefined` | `undefined` | Sets the maximum number of characters available in the input field.<br><br>**Note:** This property is not compatible with the ui5-input type InputType.Number. If the ui5-input type is set to Number, the maxlength value is ignored. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `noTypeahead` | `boolean` | `false` | Defines whether the value will be autcompleted to match an item |
| `open` | `boolean` | `false` | Defines whether the suggestions picker is open.<br>The picker will not open if the `showSuggestions` property is set to `false`, the input is disabled or the input is readonly.<br>The picker will close automatically and `close` event will be fired if the input is not in the viewport. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the<br>component has no value. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the input will be shown. |
| `showSuggestions` | `boolean` | `false` | Defines whether the component should show suggestions, if such are present. |
| `type` | `` `${InputType}` `` | `"Text"` | Defines the HTML type of the component.<br><br>**Notes:**<br><br>- The particular effect of this property differs depending on the browser<br>and the current language settings, especially for type `Number`.<br>- The property is mostly intended to be used with touch devices<br>that use different soft keyboard layouts depending on the given input type.<br>- Type `Number` does not support suggestions. |
| `value` | `string` | `""` | Defines the value of the component.<br><br>**Note:** The property is updated upon typing. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `actions` | `Slot<HTMLElement>` | Defines the items of the menu for the component. |
| `default` | `DefaultSlot<IInputSuggestionItem>` | Defines the suggestion items.<br><br>**Note:** The suggestions would be displayed only if the `showSuggestions`<br>property is set to `true`.<br><br>**Note:** The `<ui5-suggestion-item>`, `<ui5-suggestion-item-group>` and `ui5-suggestion-item-custom` are recommended to be used as suggestion items.<br><br>**Note:** Input with type `Number` does not support suggestions. |
| `icon` | `Slot<IIcon>` | Defines the icon to be displayed in the component. |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br>The value state message slot should contain only one root element.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state.<br><br>**Note:** If the component has `suggestionItems`,<br>the `valueStateMessage` would be displayed as part of the same popover, if used on desktop, or dialog - on phone. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `button-click` | `CustomEvent` | false | true | Fired when the user selects the AI button. |
| `item-click` | `CustomEvent<InputItemClickEventDetail>` | false | false | Fired when an item from the AI actions menu is clicked. |
| `stop-generation` | `CustomEvent` | false | false | Fired when the user selects the "Stop" button to stop ongoing AI text generation. |
| `version-change` | `CustomEvent<InputVersionChangeEventDetail>` | false | false | Fired when the user selects the version navigation buttons. |
| `change` | `CustomEvent` | true | false | Fired when the input operation has finished by pressing Enter or on focusout. |
| `close` | `CustomEvent` | false | false | Fired when the suggestions picker is closed. |
| `input` | `CustomEvent` | true | true | Fired when the value of the component changes at each keystroke,<br>and when a suggestion item has been selected. |
| `open` | `CustomEvent` | true | false | Fired when the suggestions picker is open. |
| `select` | `CustomEvent` | true | false | Fired when some text has been selected. |
| `selection-change` | `CustomEvent<InputSelectionChangeEventDetail>` | true | false | Fired when the user navigates to a suggestion item via the ARROW keys,<br>as a preview, before the final selection. |

#### CSS parts

- `clear-icon`: Used to style the clear icon, which can be pressed to clear user input text
- `input`: Used to style the native input element
- `root`: Used to style the root DOM element of the Input component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Input/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Input/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/Input/Basic/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `currentVersion`, `loading`, `totalVersions`.
- [ ] Verify `button-click`, `item-click`, `stop-generation`, `version-change`, `change`, `close`, `input`, `open`, `select`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/input` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [PromptInput](https://ui5.github.io/webcomponents/nightly/components/ai/PromptInput/)

- Tag: `ui5-ai-prompt-input`
- Package: `@ui5/webcomponents-ai@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-ai@2.28.1/dist/PromptInput.d.ts).
- Local implementation: `src/components/prompt-input` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-ai-prompt-input` component allows the user to write custom instructions in natural language, so that AI is guided to generate content tailored to user needs.

**Note:** The web component is in an experimental state

##### ES6 Module Import

`import "@ui5/webcomponents-ai/dist/PromptInput.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state.<br><br>**Note:** A disabled component is completely noninteractive. |
| `label` | `string \| undefined` | `undefined` | Defines the label of the input field. |
| `maxlength` | `number \| undefined` | `undefined` | Sets the maximum number of characters available in the input field. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the<br>component has no value. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the input will be shown. |
| `showExceededText` | `boolean` | `false` | Determines whether the characters exceeding the maximum allowed character count are visible<br>in the component.<br><br>If set to `false`, the user is not allowed to enter more characters than what is set in the<br>`maxlength` property.<br>If set to `true` the characters exceeding the `maxlength` value are selected on<br>paste and the counter below the component displays their number. |
| `showSuggestions` | `boolean` | `false` | Defines whether the component should show suggestions, if such are present. |
| `value` | `string` | `""` | Defines the value of the component. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IInputSuggestionItem>` | Defines the suggestion items.<br><br>**Note:** The suggestions would be displayed only if the `showSuggestions`<br>property is set to `true`.<br><br>**Note:** The `<ui5-suggestion-item>`, `<ui5-suggestion-item-group>` and `ui5-suggestion-item-custom` are recommended to be used as suggestion items. |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br>The value state message slot should contain only one root element.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the input operation has finished by pressing Enter<br>or on focusout. |
| `input` | `CustomEvent` | true | false | Fired when the value of the component changes at each keystroke,<br>and when a suggestion item has been selected. |
| `submit` | `CustomEvent` | true | false | Fired when the input operation has finished by pressing Enter<br>or AI button is clicked. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/PromptInput/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/PromptInput/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/PromptInput/Basic/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `disabled`, `label`, `maxlength`.
- [ ] Verify `change`, `input`, `submit` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [TextArea](https://ui5.github.io/webcomponents/nightly/components/ai/TextArea/)

- Tag: `ui5-ai-textarea`
- Package: `@ui5/webcomponents-ai@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents-ai@2.28.1/dist/TextArea.d.ts).
- Local implementation: `src/components/text-area` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-ai-textarea` component extends the standard TextArea with Writing Assistant capabilities.
It provides AI-powered text generation, editing suggestions, and version management functionality.

##### Structure
The `ui5-ai-textarea` consists of the following elements:
- TextArea: The main text input area with all standard textarea functionality
- WritingAssistant: Dedicated toolbar containing:
  - Versioning: A component with left/right navigation buttons and a label for browsing AI-generated versions
  - AI Button: Opens a menu that can be extended with custom AI generation options through slotting

##### ES6 Module Import

`import "@ui5/webcomponents-ai/dist/TextArea.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `currentVersion` | `number` | `0` | Indicates the index of the currently displayed version. |
| `loading` | `boolean` | `false` | Defines whether the `ui5-ai-textarea` is currently in a loading(processing) state. |
| `promptDescription` | `string` | `""` | Defines the prompt description of the current action. |
| `totalVersions` | `number` | `0` | Indicates the total number of result versions available.<br><br>Notes:<br>Versioning is hidden if the value is `0` |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the textarea. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the textarea. |
| `counterMode` | `` `${TextAreaCounterMode}` `` | `"None"` | Determines when the character counter of the component is displayed.<br><br>Available options are:<br><br>- `None` - The counter is never shown and `maxlength` acts as a hard cap.<br>- `Always` - The counter is always visible below the component.<br>- `Auto` - The counter is shown only when the component is focused, when the character limit<br>is exceeded, or when `valueState` is `Critical` or `Negative`. Space is always reserved to<br>prevent layout shifts.<br><br>**Note:** When set to a value other than `None`, this property takes precedence over the<br>deprecated `showExceededText` property. |
| `disabled` | `boolean` | `false` | Indicates whether the user can interact with the component or not.<br><br>**Note:** A disabled component is completely noninteractive. |
| `growing` | `boolean` | `false` | Enables the component to automatically grow and shrink dynamically with its content. |
| `growingMaxRows` | `number` | `0` | Defines the maximum number of rows that the component can grow. |
| `maxlength` | `number \| undefined` | `undefined` | Defines the maximum number of characters that the `value` can have. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the component has no value. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `rows` | `number` | `0` | Defines the number of visible text rows for the component.<br><br>**Notes:**<br><br>- If the `growing` property is enabled, this property defines the minimum rows to be displayed<br>in the textarea.<br>- The CSS `height` property wins over the `rows` property, if both are set. |
| `showExceededText` | `boolean` | `false` | Determines whether the characters exceeding the maximum allowed character count are visible<br>in the component.<br><br>If set to `false`, the user is not allowed to enter more characters than what is set in the<br>`maxlength` property.<br>If set to `true` the characters exceeding the `maxlength` value are selected on<br>paste and the counter below the component displays their number.<br>**Deprecated:** Use `counterMode="Always"` instead. |
| `value` | `string` | `""` | Defines the value of the component. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component.<br><br>**Note:** If `maxlength` property is set,<br>the component turns into "Critical" state once the characters exceeds the limit.<br>In this case, only the "Negative" state is considered and can be applied. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `menu` | `Slot<HTMLElement>` | Defines a slot for `ui5-menu` integration. This slot allows you to pass a `ui5-menu` instance that will be associated with the assistant. |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br>The value state message slot should contain only one root element.<br> <br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed if the component has<br>`valueState` of type `Information`, `Critical` or `Negative`. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `stop-generation` | `CustomEvent` | false | false | Fired when the user requests to stop AI text generation. |
| `version-change` | `CustomEvent<TextAreaVersionChangeEventDetail>` | false | false | Fired when the user clicks on version navigation buttons. |
| `change` | `CustomEvent` | true | false | Fired when the text has changed and the focus leaves the component. |
| `input` | `CustomEvent<TextAreaInputEventDetail>` | true | true | Fired when the value of the component changes at each keystroke or when<br>something is pasted. |
| `scroll` | `CustomEvent` | true | false | Fired when textarea is scrolled. |
| `select` | `CustomEvent` | true | false | Fired when some text has been selected. |

#### CSS parts

- `textarea`: Used to style the native textarea

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/TextArea/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/TextArea/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/TextArea/Basic/main.js).
- [Extended Sample](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/TextArea/Extended/sample.tsx) — This extended sample showcases advanced AI TextArea features including multiple AI actions and version management.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/TextArea/Extended/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/ai/TextArea/Extended/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `currentVersion`, `loading`, `promptDescription`.
- [ ] Verify `stop-generation`, `version-change`, `change`, `input`, `scroll`, `select` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/text-area` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

