# Component implementation roadmap

## Purpose and completion gate

This is a **reference-derived implementation backlog**, not a claim of UI5 compatibility or a completed implementation. Every entry requires a TypeScript/React API design compatible with this library, implementation, unit and interaction tests, accessibility and keyboard tests, responsive/RTL review where relevant, and documentation before it can be marked complete. Existing components are **candidates for comparison**, not verified matches. Do not mechanically copy web-component APIs into React or equate UI5 slots/events with React props. Preserve application-owned transport, authorization and routing.

## Source and interpretation

- Snapshot: [Apache-2.0 licensed](https://github.com/UI5/webcomponents/blob/v2.28.1/LICENSE.txt) [UI5 Web Components v2.28.1](https://github.com/UI5/webcomponents/tree/v2.28.1), npm manifests `@ui5/webcomponents`, `@ui5/webcomponents-fiori`, `@ui5/webcomponents-compat` and `@ui5/webcomponents-ai`, all **2.28.1**. The supplied Fiori, compat and AI URLs refer to **nightly**; this pinned stable snapshot is not a claim that the moving nightly site has identical APIs. Reconcile against the linked nightly docs before implementation. The main/compat table names and tags collide; they are separate entries and must not be registered together.
- Types come from published TypeScript declarations where available, falling back to custom-elements manifest types. Named types can require their imported declarations; links to the published declaration files are included. Slot names come from the manifest and slot types from matching declaration fields where identifiable; unknown means verify upstream, not no restriction. Properties list public manifest fields; missing defaults are **not specified**, not inferred.
- Event payload types and descriptions come from the manifest. Bubbles/cancelable flags are taken only from statically identifiable UI5 event decorators (including a resolvable same-package superclass), whose omitted flags default to false; otherwise they are explicitly not specified. Native events, event dispatch variants and inheritance need separate verification. CSS parts and custom states are the published manifest, not a complete CSS contract. Empty documentation fields indicate missing information in the snapshot, not proof that a feature does not exist at runtime.
- Regenerate from the four pinned npm package tarballs and `@ui5/webcomponents-base@2.28.1` extracted under a metadata root, plus the v2.28.1 GitHub source archive extracted separately; run `node scripts/generate-component-roadmap.mjs <metadata-root> <extracted-source-root>`. The folder names expected by the generator match `npm pack` tarball names; the base package goes under `base/package`. The requested component list is in `scripts/ui5-requested-components.json`.
- Sample links and descriptions point to the pinned source. Some child components are illustrated only in their parent samples; absence here does not prove no sample exists. Examples are reference material, not runnable examples in this library. Long descriptions include upstream keyboard guidance where supplied; missing guidance must be researched and tested, not treated as no keyboard behavior.

## Playground parsed: Avatar / Basic

The upstream playground presents HTML, JavaScript and React/TypeScript tabs backed by [sample.html](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Basic/sample.html), [main.js](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Basic/main.js) and [sample.tsx](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Basic/sample.tsx). The sample creates a React wrapper for the UI5 custom element and renders initials; this project should implement its own React component rather than assume the wrapper is the desired integration. The complete TypeScript playground sample is:

```tsx
import createReactComponent from "@ui5/webcomponents-base/dist/createReactComponent.js";
import AvatarClass from "@ui5/webcomponents/dist/Avatar.js";

const Avatar = createReactComponent(AvatarClass);

function App() {
  return <Avatar initials="FJ" />;
}

export default App;
```

## Core components

### [Avatar](https://ui5.github.io/webcomponents/components/Avatar/)

- Tag: `ui5-avatar`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Avatar.d.ts).
- Local implementation: `src/components/avatar` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

An image-like component that has different display options for representing images and icons
in different shapes and sizes, depending on the use case.

The shape can be circular or square. There are several predefined sizes, as well as an option to
set a custom size.

##### Keyboard Handling

- [Space] / [Enter] or [Return] - Fires the `click` event if the `mode` is set to `Interactive` or the deprecated `interactive` property is set to true.
- [Shift] - If [Space] is pressed, pressing [Shift] releases the component without triggering the click event.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/Avatar.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `AvatarAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following field is supported:<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.<br>Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the text alternative of the component.<br>If not provided a default text alternative will be set, if present. |
| `colorScheme` | `` `${AvatarColorScheme}` `` | `"Auto"` | Defines the background color of the desired image.<br>If `colorScheme` is set to `Auto`, the avatar will be displayed with the `Accent6` color. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br>A disabled component can't be pressed or<br>focused, and it is not in the tab chain. |
| `fallbackIcon` | `string` | `"employee"` | Defines the name of the fallback icon, which should be displayed in the following cases:<br><br>	- If the initials are not valid (more than 3 letters or empty initials).<br>	- If the initials do not fit in the shape at the current size (e.g. WWW at size XS).<br>	- If the image src is wrong.<br><br>**Note:** If not set, a default fallback icon "employee" is displayed.<br><br>**Note:** You should import the desired icon first, then use its name as "fallback-icon".<br><br>`import "@ui5/webcomponents-icons/dist/{icon_name}.js"`<br><br>`<ui5-avatar fallback-icon="alert">`<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `icon` | `string \| undefined` | `undefined` | Defines the name of the UI5 Icon, that will be displayed.<br><br>**Note:** If `image` slot is provided, the property will be ignored.<br><br>**Note:** You should import the desired icon first, then use its name as "icon".<br><br>`import "@ui5/webcomponents-icons/dist/{icon_name}.js"`<br><br>`<ui5-avatar icon="employee">`<br><br>**Note:** If no icon or an empty one is provided, by default the "employee" icon should be displayed.<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `initials` | `string \| undefined` | `undefined` | Defines the displayed initials.<br><br>Up to three letters from an alphabetic script can be displayed as initials.<br>All scripts used in SAP-supported languages are accepted, except logographic and<br>pure syllabic scripts where the concept of initials does not apply: Han (Chinese,<br>Japanese kanji), Hiragana, and Katakana. Korean (Hangul) is supported.<br>If the letters do not fit inside the avatar shape at the current size, the fallback<br>icon is shown instead. |
| `interactive` | `boolean` | `false` | Defines if the avatar is interactive (focusable and pressable).<br><br>**Note:** When set to `true`, this property takes precedence over the `mode` property,<br>and the avatar will be rendered as interactive (role="button", focusable) regardless of the `mode` value.<br><br>**Note:** This property won't have effect if the `disabled`<br>property is set to `true`.<br>**Deprecated:** Set `mode="Interactive"` instead for the same functionality with proper accessibility. |
| `mode` | `` `${AvatarMode}` `` | `"Image"` | Defines the mode of the component.<br><br>**Note:**<br>- `Image` (default) - renders with role="img"<br>- `Decorative` - renders with role="presentation" and aria-hidden="true", making it purely decorative<br>- `Interactive` - renders with role="button", focusable (tabindex="0"), and supports keyboard interaction<br><br>**Note:** This property is ignored when the `interactive` property is set to `true`.<br>In that case, the avatar will always be rendered as interactive. |
| `shape` | `` `${AvatarShape}` `` | `"Circle"` | Defines the shape of the component. |
| `size` | `` `${AvatarSize}` `` | `"S"` | Defines predefined size of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `badge` | `Slot<HTMLElement>` | Defines the optional badge that will be used for visual affordance.<br><br>**Recommendation:** While badges are supported on all avatars, it is recommended<br>to use them with interactive avatars (via `mode="Interactive"` or `interactive` attribute)<br>to provide better user experience and accessibility.<br><br>**Note:** While the slot allows for custom badges, to achieve<br>the Fiori design, use the `ui5-avatar-badge` component. |
| `default` | `DefaultSlot<HTMLElement>` | Receives the desired `<img>` tag<br><br>**Note:** If you experience flickering of the provided image, you can hide the component until it is defined with the following CSS:<br/><br>`ui5-avatar:not(:defined) {`<br/><br>&nbsp;&nbsp;&nbsp;&nbsp;`visibility: hidden;`<br/><br>`}` |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | true | false | Fired on mouseup, space and enter if avatar is interactive<br><br>**Note:** The event will not be fired if the `disabled`<br>property is set to `true`. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Basic/main.js).
- [Shapes](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Shapes/sample.tsx) — The Avatar comes in two shapes (Square and Circle).; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Shapes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Shapes/main.js).
- [Sizes](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Sizes/sample.tsx) — The Avatar comes in several sizes (S to XL).; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Sizes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Sizes/main.js).
- [Interactive Mode](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Interactive/sample.tsx) — The Avatar can be made interactive via `mode="Interactive"` or the `interactive` property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Interactive/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Interactive/main.js).
- [Decorative Mode](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Decorative/sample.tsx) — The Avatar can be set to decorative mode with `mode="Decorative"`, making it purely visual without semantic content.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Decorative/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Decorative/main.js).
- [Color Schemes](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/ColorSchemes/sample.tsx) — The Avatar can be displayed in multiple color schemes.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/ColorSchemes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/ColorSchemes/main.js).
- [With Icon](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/WithIcon/sample.tsx) — The Avatar can show icons.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/WithIcon/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/WithIcon/main.js).
- [With Image](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/WithImage/sample.tsx) — The Avatar can show images.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/WithImage/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/WithImage/main.js).
- [With Badge](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/WithBadge/sample.tsx) — The Avatar supports visual affordance through badges using the `ui5-avatar-badge` component.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/WithBadge/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/WithBadge/main.js).
- [All Variants](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Variants/sample.tsx) — A comprehensive overview of all Avatar variants with their recommended use cases and accessibility annotations.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Variants/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Variants/main.js).
- [Custom Styling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Styles/sample.tsx) — The Avatar allows customization with pure CSS on tag level.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Styles/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Avatar/Styles/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `colorScheme`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/avatar` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [AvatarBadge](https://ui5.github.io/webcomponents/components/AvatarBadge/)

- Tag: `ui5-avatar-badge`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/AvatarBadge.d.ts).
- Local implementation: `src/components/avatar-badge`, composed via `Avatar.badge` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; verify UI5 behavior, accessibility and visual/RTL integration before completion.

#### Description and keyboard interaction

##### Overview

The `ui5-avatar-badge` component is used to display a badge on top of `ui5-avatar` component.
The badge can display an icon and supports different states for visual affordance.

##### Usage

The badge should be used as a child element of `ui5-avatar` in the `badge` slot.

```html
<ui5-avatar>
  <ui5-avatar-badge icon="edit" slot="badge"></ui5-avatar-badge>
</ui5-avatar>
```

##### Keyboard Handling

The badge does not receive keyboard focus.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/AvatarBadge.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `colorScheme` | `string \| undefined` | `undefined` | Defines the color scheme of the badge using the indication color palette.<br><br>Available options are `"1"` through `"10"`, matching the indication colors.<br><br>**Note:** `state` takes precedence - when `state` is set to any value other than `None`,<br>the semantic state styling applies and `colorScheme` is ignored. |
| `icon` | `string \| undefined` | `undefined` | Defines the icon name to be displayed inside the badge.<br><br>**Note:** You should import the desired icon first, then use its name as "icon".<br><br>`import "@ui5/webcomponents-icons/dist/{icon_name}.js"` |
| `state` | `` `${ValueState}` `` | `"None"` | Defines the state of the badge, which determines its styling.<br><br>Available options:<br>- `None` (default) - Standard appearance<br>- `Positive` - Green, used for success/approved states<br>- `Critical` - Orange, used for warning states<br>- `Negative` - Red, used for error/rejected states<br>- `Information` - Blue, used for informational states<br><br>**Note:** `state` takes precedence over `colorScheme`. When `state` is set<br>to any value other than `None`, the semantic styling applies and `colorScheme` is ignored. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip text of the badge icon.<br><br>**Note:** If not provided, the badge uses the icon accessible name.<br>If no icon accessible name is available, a generic fallback text is used. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarBadge/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarBadge/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarBadge/Basic/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarBadge/ValueStates/sample.tsx) — The AvatarBadge supports different states to indicate status or notifications.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarBadge/ValueStates/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarBadge/ValueStates/main.js).
- [Extended Color Palette](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarBadge/ColorSchemes/sample.tsx) — The AvatarBadge supports an extended color palette via the `colorScheme` property. Use values `"1"` through `"10"` to apply indication colors.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarBadge/ColorSchemes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarBadge/ColorSchemes/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `colorScheme`, `icon`, `state`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states

### [AvatarGroup](https://ui5.github.io/webcomponents/components/AvatarGroup/)

- Tag: `ui5-avatar-group`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/AvatarGroup.d.ts).
- Local implementation: `src/components/avatar-group` (React adaptation; parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; verify upstream behavior and accessibility before completion.

#### Description and keyboard interaction

##### Overview

Displays a group of avatars arranged horizontally. It is useful to visually
showcase a group of related avatars, such as, project team members or employees.

The component allows you to display the avatars in different sizes,
depending on your use case.

The `AvatarGroup` component has two group types:

- `Group` type: The avatars are displayed as partially overlapped on
top of each other and the entire group has one click/tap area.
- `Individual` type: The avatars are displayed side-by-side and each
avatar has its own click/tap area.

##### Usage

Use the `AvatarGroup` if:

- You want to display a group of avatars.
- You want to display several avatars which have something in common.

Do not use the `AvatarGroup` if:

- You want to display a single avatar.
- You want to display a gallery for simple images.
- You want to use it for other visual content than avatars.

##### Responsive Behavior

When the available space is less than the width required to display all avatars,
an overflow visualization appears as a button placed at the end with the same shape
and size as the avatars. The visualization displays the number of avatars that have overflowed
and are not currently visible.

##### Keyboard Handling
The component provides advanced keyboard handling.
When focused, the user can use the following keyboard
shortcuts in order to perform a navigation:

`type` Individual:

- [Tab] - Move focus to the overflow button
- [Left] - Navigate one avatar to the left
- [Right] - Navigate one avatar to the right
- [Home] - Navigate to the first avatar
- [End] - Navigate to the last avatar
- [Space] / [Enter] or [Return] - Trigger `ui5-click` event

`type` Group:

- [Tab] - Move focus to the next interactive element after the component
- [Space] / [Enter] or [Return] - Trigger `ui5-click` event

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `AvatarGroupAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following field is supported:<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.<br>Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the AvatarGroup.<br>When provided, this will override the default aria-label text. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(s) of the elements that describe the AvatarGroup.<br>When provided, this will be used as aria-labelledby instead of aria-label. |
| `colorScheme` | `AvatarColorScheme[]` | `[]` | Returns an array containing the `AvatarColorScheme` values that correspond to the avatars in the component. |
| `hiddenItems` | `IAvatarGroupItem[]` | `[]` | Returns an array containing the `ui5-avatar` instances that are currently not displayed due to lack of space. |
| `type` | `` `${AvatarGroupType}` `` | `"Group"` | Defines the mode of the `AvatarGroup`. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IAvatarGroupItem>` | Defines the items of the component. Use the `ui5-avatar` component as an item.<br><br>**Note:** The UX guidelines recommends using avatars with "Circle" shape.<br><br>Moreover, if you use avatars with "Square" shape, there will be visual inconsistency<br>as the built-in overflow action has "Circle" shape. |
| `overflowButton` | `Slot<IButton>` | Defines the overflow button of the component.<br><br>**Note:** We recommend using the `ui5-button` component.<br><br>**Note:** If this slot is not used, the component will display the built-in overflow button. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<AvatarGroupClickEventDetail>` | false | false | Fired when the component is activated either with a<br>click/tap or by using the Enter or Space key. |
| `overflow` | `CustomEvent` | false | false | Fired when the count of visible `ui5-avatar` elements in the<br>component has changed |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/Basic/main.js).
- [Types And Sizes](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/TypesAndSizes/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/TypesAndSizes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/TypesAndSizes/main.js).
- [Individual](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/IndividualWithPopover/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/IndividualWithPopover/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/IndividualWithPopover/main.js).
- [Grouping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/GroupWithPopover/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/GroupWithPopover/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/AvatarGroup/GroupWithPopover/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `accessibleNameRef`.
- [ ] Verify `click`, `overflow` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [Bar](https://ui5.github.io/webcomponents/components/Bar/)

- Tag: `ui5-bar`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Bar.d.ts).
- Local implementation: `src/layouts/bar` (React adaptation; parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; verify upstream behavior and accessibility before completion.

#### Description and keyboard interaction

##### Overview
The Bar is a container which is primarily used to hold titles, buttons and input elements
and its design and functionality is the basis for page headers and footers.
The component consists of three areas to hold its content - startContent slot, default slot and endContent slot.
It has the capability to center content, such as a title, while having other components on the left and right side.

##### Usage
With the use of the design property, you can set the style of the Bar to appear designed like a Header, Subheader, Footer and FloatingFooter.

**Note:** Do not place a Bar inside another Bar or inside any bar-like component. Doing so may cause unpredictable behavior.

**Note:** The Bar is a structural layout component for organizing page areas (header, footer, subheader) and not an action-oriented toolbar. To group action controls with full keyboard navigation support, use the Toolbar component instead.

##### Responsive Behavior
The default slot will be centered in the available space between the startContent and the endContent areas,
therefore it might not always be centered in the entire bar.

##### Keyboard Handling

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Bar.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the bar. |
| `accessibleRole` | `` `${BarAccessibleRole}` `` | `"None"` | Specifies the ARIA role applied to the component for accessibility purposes.<br><br>**Note:** By default, no ARIA role is applied ("None"). The Bar derives its semantics<br>from the container it is placed in, such as a page header or footer.<br><br>**Note:** The "Toolbar" value is deprecated. The Bar is a structural layout container and does not<br>support toolbar keyboard interactions (such as arrow-key navigation between components). When 3 or more<br>interactive elements are needed, use the `ui5-toolbar` component instead, which provides the correct<br>toolbar role and arrow-key navigation between components. |
| `design` | `` `${BarDesign}` `` | `"Header"` | Defines the component's design. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content in the middle of the bar. |
| `endContent` | `Slot<HTMLElement>` | Defines the content at the end of the bar. |
| `startContent` | `Slot<HTMLElement>` | Defines the content at the start of the bar. |

#### CSS parts

- `bar`: Used to style the wrapper of the content of the component
- `endContent`: Used to style the wrapper of the end content of the component
- `midContent`: Used to style the wrapper of the middle content of the component
- `startContent`: Used to style the wrapper of the start content of the component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Bar/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Bar/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Bar/Basic/main.js).
- [Bar with accessible role](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Bar/AccessibleRole/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Bar/AccessibleRole/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Bar/AccessibleRole/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `accessibleRole`.

#### Empty documentation fields

- Events
- Public methods
- CSS custom states

### [Breadcrumbs](https://ui5.github.io/webcomponents/components/Breadcrumbs/)

- Tag: `ui5-breadcrumbs`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Breadcrumbs.d.ts).
- Local implementation: `src/components/breadcrumbs` (candidate only; parity unverified)
- Status: [ ] Existing React implementation extended with item composition and focused regression tests; responsive overflow and upstream keyboard/behavior parity remain unverified.

#### Description and keyboard interaction

##### Overview
Enables users to navigate between items by providing a list of links to previous steps in the user's navigation path.
It helps the user to be aware of their location within the application and allows faster navigation.

The last three steps can be accessed as links directly, while the remaining links prior to them are available
in a drop-down menu.

You can choose the type of separator to be used from a number of predefined options.

##### Keyboard Handling
The `ui5-breadcrumbs` provides advanced keyboard handling.

- [F4], [Alt] + [Up], [Alt] + [Down], [Space], or [Enter] - If the dropdown arrow is focused - opens/closes the drop-down.
- [Space],[Enter] - Activates the focused item and triggers the `item-click` event.
- [Escape] - Closes the drop-down.
- [Left] - If the drop-down is closed - navigates one item to the left.
- [Right] - If the drop-down is closed - navigates one item to the right.
- [Up] - If the drop-down is open - moves focus to the next item.
- [Down] - If the drop-down is open - moves focus to the previous item.
- [Home] - Navigates to the first item.
- [End] - Navigates to the last item.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `design` | `` `${BreadcrumbsDesign}` `` | `"Standard"` | Defines the visual appearance of the last BreadcrumbsItem.<br><br>The Breadcrumbs supports two visual appearances for the last BreadcrumbsItem:<br>- "Standard" - displaying the last item as "current page" (bold and without separator)<br>- "NoCurrentPage" - displaying the last item as a regular BreadcrumbsItem, followed by separator |
| `separators` | `` `${BreadcrumbsSeparator}` `` | `"Slash"` | Determines the visual style of the separator between the breadcrumb items. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<BreadcrumbsItem>` | Defines the component items.<br><br>**Note:** Use the `ui5-breadcrumbs-item` component to define the desired items. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `item-click` | `CustomEvent<BreadcrumbsItemClickEventDetail>` | true | true | Fires when a `BreadcrumbsItem` is clicked.<br><br>**Note:** You can prevent browser location change by calling `event.preventDefault()`. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/Basic/main.js).
- [Overflow](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/BreadcrumbsOverflow/sample.tsx) — When the links don't fit the available space, they overflow.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/BreadcrumbsOverflow/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/BreadcrumbsOverflow/main.js).
- [Separator Styles](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/BreadcrumbsStyles/sample.tsx) — Separator between the links can be easily changed.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/BreadcrumbsStyles/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/BreadcrumbsStyles/main.js).
- [Current Page Appearance](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/NoCurrentPage/sample.tsx) — The Breadcrumbs supports two visual appearances for the last BreadcrumbsItem - as "current page" and as a regular link.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/NoCurrentPage/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/NoCurrentPage/main.js).
- [Item Click Event](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/ClickEvent/sample.tsx) — Each `ui5-breadcrumbs-item` fires its own `click` event, allowing framework consumers to attach handlers directly on the item.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/ClickEvent/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Breadcrumbs/ClickEvent/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `design`, `separators`.
- [ ] Verify `item-click` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/breadcrumbs` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [BreadcrumbsItem](https://ui5.github.io/webcomponents/components/BreadcrumbsItem/)

- Tag: `ui5-breadcrumbs-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/BreadcrumbsItem.d.ts).
- Local implementation: `src/components/breadcrumbs/BreadcrumbsItem.tsx` (React adaptation; parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; verify upstream behavior and accessibility before completion.

#### Description and keyboard interaction

##### Overview

The `ui5-breadcrumbs-item` component defines the content of an item in `ui5-breadcrumbs`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the item. |
| `href` | `string \| undefined` | `undefined` | Defines the link href.<br><br>**Note:** Standard hyperlink behavior is supported. |
| `target` | `string \| undefined` | `undefined` | Defines the link target.<br><br>Available options are:<br><br>- `_self`<br>- `_top`<br>- `_blank`<br>- `_parent`<br>- `_search`<br><br>**Note:** This property must only be used when the `href` property is set. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<BreadcrumbsItemClickEventDetail>` | true | true | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event is also fired for the current page location item (the last item), which is not a link by design. |

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

### [BusyIndicator](https://ui5.github.io/webcomponents/components/BusyIndicator/)

- Tag: `ui5-busy-indicator`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/BusyIndicator.d.ts).
- Local implementation: `src/components/busy-indicator`, built on Spinner (React adaptation; UI5 parity unverified)
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The `ui5-busy-indicator` signals that some operation is going on and that the
user must wait. It does not block the current UI screen so other operations could be triggered in parallel.
It displays 3 dots and each dot expands and shrinks at a different rate, resulting in a cascading flow of animation.

##### Usage
For the `ui5-busy-indicator` you can define the size, the text and whether it is shown or hidden.
In order to hide it, use the "active" property.

In order to show busy state over an HTML element, simply nest the HTML element in a `ui5-busy-indicator` instance.

**Note:** Since `ui5-busy-indicator` has `display: inline-block;` by default and no width of its own,
whenever you need to wrap a block-level element, you should set `display: block` to the busy indicator as well.

##### When to use:

- The user needs to be able to cancel the operation.
- Only part of the application or a particular component is affected.

##### When not to use:

- The operation takes less than one second.
- You need to block the screen and prevent the user from starting another activity.
- Do not show multiple busy indicators at once.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/BusyIndicator.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `active` | `boolean` | `false` | Defines if the busy indicator is visible on the screen. By default it is not. |
| `delay` | `number` | `1000` | Defines the delay in milliseconds, after which the busy indicator will be visible on the screen. |
| `size` | `` `${BusyIndicatorSize}` `` | `"M"` | Defines the size of the component. |
| `text` | `string \| undefined` | `undefined` | Defines text to be displayed below the component. It can be used to inform the user of the current operation. |
| `textPlacement` | `` `${BusyIndicatorTextPlacement}` `` | `"Bottom"` | Defines the placement of the text. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Determines the content over which the component will appear. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/Basic/main.js).
- [Sizes](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/Sizes/sample.tsx) — The BusyIndicator comes in several sizes - S, M and L.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/Sizes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/Sizes/main.js).
- [Text Placement with display text](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/TextPlacement/sample.tsx) — The BusyIndicator can display text either above (via `text-placement="Top"`) or below the animated dots (by default).; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/TextPlacement/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/TextPlacement/main.js).
- [Busy component](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/WithComponent/sample.tsx) — The BusyIndicator can be placed over another web component.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/WithComponent/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/BusyIndicator/WithComponent/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `active`, `delay`, `size`.
- [ ] Compare the existing `src/components/spinner` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states

### [Button](https://ui5.github.io/webcomponents/components/Button/)

- Tag: `ui5-button`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Button.d.ts).
- Local implementation: `src/components/button` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-button` component represents a simple push button.
It enables users to trigger actions by clicking or tapping the `ui5-button`, or by pressing
certain keyboard keys, such as Enter.

##### Usage

For the `ui5-button` UI, you can define text, icon, or both. You can also specify
whether the text or the icon is displayed first.

You can choose from a set of predefined types that offer different
styling to correspond to the triggered action.

You can set the `ui5-button` as enabled or disabled. An enabled
`ui5-button` can be pressed by clicking or tapping it. The button changes
its style to provide visual feedback to the user that it is pressed or hovered over with
the mouse cursor. A disabled `ui5-button` appears inactive and cannot be pressed.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Button.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `ButtonAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.<br>Accepts the following string values: `true` or `false`<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.<br>Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.<br><br>- **ariaLabel**: Defines the accessible ARIA name of the component.<br>Accepts any string value.<br><br> - **ariaKeyShortcuts**: Defines keyboard shortcuts that activate or give focus to the button.<br><br>- **controls**: Identifies the element (or elements) whose contents or presence are controlled by the button element.<br>Accepts a lowercase string value. |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `accessibleRole` | `` `${ButtonAccessibleRole}` `` | `"Button"` | Describes the accessibility role of the button.<br><br>**Note:** Use <code>ButtonAccessibleRole.Link</code> role only with a press handler, which performs a navigation. In all other scenarios the default button semantics are recommended. |
| `design` | `` `${ButtonDesign}` `` | `"Default"` | Defines the component design. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br>A disabled component can't be pressed or<br>focused, and it is not in the tab chain. |
| `endIcon` | `string \| undefined` | `undefined` | Defines the icon, displayed as graphical element within the component after the button text.<br><br>**Note:** It is highly recommended to use `endIcon` property only together with `icon` and/or `text` properties.<br>Usage of `endIcon` only should be avoided.<br><br>The SAP-icons font provides numerous options.<br><br>Example:<br>See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `form` | `string \| undefined` | `undefined` | Associates the button with a form element by the form's `id` attribute.<br>When set, the button can submit or reset the specified form even if the button<br>is not a descendant of that form.<br><br>**Note:** This property takes effect only when the button's "type" property is set to "Submit" or "Reset". |
| `icon` | `string \| undefined` | `undefined` | Defines the icon, displayed as graphical element within the component.<br>The SAP-icons font provides numerous options.<br><br>Example:<br>See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `loading` | `boolean` | `false` | Defines whether the button shows a loading indicator.<br><br>**Note:** If set to `true`, a busy indicator component will be displayed on the related button. |
| `loadingDelay` | `number` | `1000` | Specifies the delay in milliseconds before the loading indicator appears within the associated button. |
| `submits` | `boolean` | `false` | When set to `true`, the component will<br>automatically submit the nearest HTML form element on `press`.<br><br>**Note:** This property is only applicable within the context of an HTML Form element.`<br>**Deprecated:** Set the "type" property to "Submit" to achieve the same result. The "submits" property is ignored if "type" is set to any value other than "Button". |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component.<br><br>**Note:** A tooltip attribute should be provided for icon-only buttons, in order to represent their exact meaning/function. |
| `type` | `` `${ButtonType}` `` | `"Button"` | Defines whether the button has special form-related functionality.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `badge` | `Slot<ButtonBadge>` | Adds a badge to the button. |
| `default` | `Not identified; inspect declaration` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ButtonClickEventDetail>` | true | true | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### CSS parts

- `button`: Used to style the native button element
- `endIcon`: Used to style the end icon in the native button element
- `icon`: Used to style the icon in the native button element

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/Basic/main.js).
- [Design](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/Design/sample.tsx) — The Button supports several designs to indicate the priority or the nature of the action.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/Design/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/Design/main.js).
- [Icon Only](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/IconOnly/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/IconOnly/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/IconOnly/main.js).
- [Text and Icon](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/TextAndIcon/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/TextAndIcon/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/TextAndIcon/main.js).
- [Icon at the End](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/EndIcon/sample.tsx) — Button allows adding of second Icon at the end.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/EndIcon/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/EndIcon/main.js).
- [Custom Styling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/CustomStyling/sample.tsx) — To some extent, the Button allows customization with pure CSS as shown in the sample.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/CustomStyling/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/CustomStyling/main.js).
- [Menu Button](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/MenuButton/sample.tsx) — Achieve Menu Button functionality.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/MenuButton/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/MenuButton/main.js).
- [Button with badge](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/ButtonBadge/sample.tsx) — Add a badge to the button.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/ButtonBadge/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/ButtonBadge/main.js).
- [Button with Loading](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/Loading/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/Loading/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Button/Loading/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleDescription`, `accessibleName`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/button` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [ButtonBadge](https://ui5.github.io/webcomponents/components/ButtonBadge/)

- Tag: `ui5-button-badge`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ButtonBadge.d.ts).
- Local implementation: `src/components/button-badge` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

The `ui5-button-badge` component defines a badge that appears in the `ui5-button`.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/ButtonBadge.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `design` | `` `${ButtonBadgeDesign}` `` | `"AttentionDot"` | Defines the badge placement and appearance.<br>- **InlineText** - displayed inside the button after its text, and recommended for **compact** density.<br>- **OverlayText** - displayed at the top-end corner of the button, and recommended for **cozy** density.<br>- **AttentionDot** - displayed at the top-end corner of the button as a dot, and suitable for both **cozy** and **compact** densities. |
| `text` | `string` | `""` | Defines the text of the component.<br><br>**Note:** Text is not applied when the `design` property is set to `AttentionDot`.<br><br>**Note:** The badge component only accepts numeric values and the "+" symbol. Using other characters or formats may result in unpredictable behavior, which is not guaranteed or supported. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `design`, `text`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [Calendar](https://ui5.github.io/webcomponents/components/Calendar/)

- Tag: `ui5-calendar`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Calendar.d.ts).
- Local implementation: `src/components/calendar` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-calendar` component allows users to select one or more dates.

Currently selected dates are represented with instances of `ui5-date` as
children of the `ui5-calendar`. The value property of each `ui5-date` must be a
date string, correctly formatted according to the `ui5-calendar`'s `formatPattern` property.
Whenever the user changes the date selection, `ui5-calendar` will automatically create/remove instances
of `ui5-date` in itself, unless you prevent this behavior by calling `preventDefault()` for the
`selection-change` event. This is useful if you want to control the selected dates externally.

##### Usage

The user can navigate to a particular date by:

- Pressing over a month inside the months view
- Pressing over an year inside the years view

The user can confirm a date selection by pressing over a date inside the days view.

##### Keyboard Handling
The `ui5-calendar` provides advanced keyboard handling.
When a picker is showed and focused the user can use the following keyboard
shortcuts in order to perform a navigation:

- Day picker:

- [F4] - Shows month picker
- [Shift] + [F4] - Shows year picker
- [Page Up] - Navigate to the previous month
- [Page Down] - Navigate to the next month
- [Shift] + [Page Up] - Navigate to the previous year
- [Shift] + [Page Down] - Navigate to the next year
- [Ctrl] + [Shift] + [Page Up] - Navigate ten years backwards
- [Ctrl] + [Shift] + [Page Down] - Navigate ten years forwards
- [Home] - Navigate to the first day of the week
- [End] - Navigate to the last day of the week
- [Ctrl] + [Home] - Navigate to the first day of the month
- [Ctrl] + [End] - Navigate to the last day of the month

- Month picker:

- [Page Up] - Navigate to the previous year
- [Page Down] - Navigate to the next year
- [Home] - Navigate to the first month of the current row
- [End] - Navigate to the last month of the current row
- [Ctrl] + [Home] - Navigate to the first month of the current year
- [Ctrl] + [End] - Navigate to the last month of the year

- Year picker:

- [Page Up] - Navigate to the previous year range
- [Page Down] - Navigate the next year range
- [Home] - Navigate to the first year of the current row
- [End] - Navigate to the last year of the current row
- [Ctrl] + [Home] - Navigate to the first year of the current year range
- [Ctrl] + [End] - Navigate to the last year of the current year range

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### Calendar types
The component supports several calendar types - Gregorian, Buddhist, Islamic, Japanese and Persian.
By default the Gregorian Calendar is used. In order to use the Buddhist, Islamic, Japanese or Persian calendar,
you need to set the `primaryCalendarType` property and import one or more of the following modules:

`import "@ui5/webcomponents-localization/dist/features/calendar/Buddhist.js";`

`import "@ui5/webcomponents-localization/dist/features/calendar/Islamic.js";`

`import "@ui5/webcomponents-localization/dist/features/calendar/Japanese.js";`

`import "@ui5/webcomponents-localization/dist/features/calendar/Persian.js";`

Or, you can use the global configuration and set the `calendarType` key:

```html
<script data-id="sap-ui-config" type="application/json">
	{
		"calendarType": "Japanese"
	}
</script>
```

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Calendar.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `calendarWeekNumbering` | `` `${CalendarWeekNumbering}` `` | `"Default"` | Defines how to calculate calendar weeks and first day of the week.<br>If not set, the calendar will be displayed according to the currently set global configuration. |
| `displayFormat` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field. |
| `formatPattern` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field.<br>**Deprecated:** Use displayFormat and valueFormat instead |
| `hideWeekNumbers` | `boolean` | `false` | Defines the visibility of the week numbers column.<br><br>**Note:** For calendars other than Gregorian,<br>the week numbers are not displayed regardless of what is set. |
| `maxDate` | `string` | `""` | Determines the maximum date available for selection.<br><br>**Note:** If the formatPattern property is not set, the maxDate value must be provided in the ISO date format (yyyy-MM-dd). |
| `minDate` | `string` | `""` | Determines the minimum date available for selection.<br><br>**Note:** If the formatPattern property is not set, the minDate value must be provided in the ISO date format (yyyy-MM-dd). |
| `primaryCalendarType` | `` `${CalendarType}` \| undefined `` | `undefined` | Sets a calendar type used for display.<br>If not set, the calendar type of the global configuration is used. |
| `secondaryCalendarType` | `` `${CalendarType}` \| undefined `` | `undefined` | Defines the secondary calendar type.<br>If not set, the calendar will only show the primary calendar type. |
| `selectionMode` | `` `${CalendarSelectionMode}` `` | `"Single"` | Defines the type of selection used in the calendar component.<br>Accepted property values are:<br><br>- `CalendarSelectionMode.Single` - enables a single date selection.(default value)<br>- `CalendarSelectionMode.Range` - enables selection of a date range.<br>- `CalendarSelectionMode.Multiple` - enables selection of multiple dates. |
| `valueFormat` | `string \| undefined` | `undefined` | Determines the format, used for the value attribute. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `calendarLegend` | `Slot<CalendarLegend>` | Defines the calendar legend of the component. |
| `default` | `DefaultSlot<ICalendarSelectedDates>` | Defines the selected date or dates (depending on the `selectionMode` property)<br>for this calendar as instances of `ui5-date` or `ui5-date-range`.<br>Use `ui5-date` for single or multiple selection, and `ui5-date-range` for range selection. |
| `disabledDates` | `Slot<CalendarDateRange>` | Defines the disabled date ranges that cannot be selected in the calendar.<br>Use `ui5-date-range` elements to specify ranges of disabled dates.<br>Each range can define a start date, an end date, or both. |
| `specialDates` | `Slot<SpecialCalendarDate>` | Defines the special dates, visually emphasized in the calendar. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `selection-change` | `CustomEvent<CalendarSelectionChangeEventDetail>` | true | true | Fired when the selected dates change.<br><br>**Note:** If you call `preventDefault()` for this event, the component will not<br>create instances of `ui5-date` for the newly selected dates. In that case you should do this manually. |

#### CSS parts

- `calendar-header-arrow-button`: Used to style the calendar header navigation arrow buttons (previous/next buttons).
- `calendar-header-middle-button`: Used to style the calendar header middle buttons (month/year/year-range buttons).
- `day-cell`: Used to style the day cells.
- `day-cell-selected`: Used to style the day cells when selected.
- `day-cell-selected-between`: Used to style the day cells in between of selected dates in range.
- `month-cell`: Used to style the month cells.
- `month-cell-selected`: Used to style the month cells when selected.
- `month-cell-selected-between`: Used to style the day cells in between of selected months in range.
- `month-picker-root`: Used to style the month picker root container.
- `year-cell`: Used to style the year cells.
- `year-cell-selected`: Used to style the year cells when selected.
- `year-cell-selected-between`: Used to style the year cells in between of selected years in range.
- `year-picker-root`: Used to style the year picker root container.
- `year-range-cell`: Used to style the year range cells.
- `year-range-cell-selected`: Used to style the year range cells when selected.
- `year-range-cell-selected-between`: Used to style the year range cells in between of selected year ranges.
- `year-range-picker-root`: Used to style the year range picker root container.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/Basic/main.js).
- [Selection Modes](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/SelectionModes/sample.tsx) — The Calendar supports **Single**, **Multiple** and **Range** selection.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/SelectionModes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/SelectionModes/main.js).
- [Min and Max Dates](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/Bounds/sample.tsx) — Define min and max date boundaries to constrain user choice.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/Bounds/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/Bounds/main.js).
- [Calendar Types](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarTypes/sample.tsx) — Several calendars are supported: Gregorian, Islamic, Persian and Japanese.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarTypes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarTypes/main.js).
- [Calendar with Legend](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarWithLegend/sample.tsx) — You can use the CalendarLegend component in addition to the Calendar to highlight specific days.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarWithLegend/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarWithLegend/main.js).
- [Timezones](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarInDifferentTimezone/sample.tsx) — You can set to the configuration the preferred time zone, such as: Asia/Tokyo, Pacific/Apia, Asia/Kolkata, Europe/Sofia and etc.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarInDifferentTimezone/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarInDifferentTimezone/main.js).
- [CalendarWeekNumbering](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarWeekNumbering/sample.tsx) — You can use the component, the preferred week numbering and first day of week.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarWeekNumbering/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarWeekNumbering/main.js).
- [Calendar with Disabled Dates](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarWithDisabledDates/sample.tsx) — Define disabled dates.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarWithDisabledDates/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Calendar/CalendarWithDisabledDates/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `calendarWeekNumbering`, `displayFormat`, `formatPattern`.
- [ ] Verify `selection-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/calendar` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [CalendarDate](https://ui5.github.io/webcomponents/components/CalendarDate/)

- Tag: `ui5-date`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/CalendarDate.d.ts).
- Local implementation: covered by `Calendar` value / `DatePicker` (dates are props, not child elements) (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-date` component defines a calendar date to be used inside `ui5-calendar`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `""` | The date formatted according to the `formatPattern` property<br>of the `ui5-calendar` that hosts the component. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `value`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [CalendarDateRange](https://ui5.github.io/webcomponents/components/CalendarDateRange/)

- Tag: `ui5-date-range`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/CalendarDateRange.d.ts).
- Local implementation: covered by `DateRangePicker` value (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-date-range` component defines a range of dates to be used inside `ui5-calendar`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `endValue` | `string` | `""` | End of date range formatted according to the `formatPattern` property<br>of the `ui5-calendar` that hosts the component. |
| `startValue` | `string` | `""` | Start of date range formatted according to the `formatPattern` property<br>of the `ui5-calendar` that hosts the component. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `endValue`, `startValue`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [CalendarLegend](https://ui5.github.io/webcomponents/components/CalendarLegend/)

- Tag: `ui5-calendar-legend`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/CalendarLegend.d.ts).
- Local implementation: `src/components/calendar-legend` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The `ui5-calendar-legend` component is designed for use within the `ui5-calendar` to display a legend.
Each `ui5-calendar-legend-item` represents a unique date type, specifying its visual style
and a corresponding textual label.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/CalendarLegend.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `hideNonWorkingDay` | `boolean` | `false` | Hides the Non-Working day item in the legend. |
| `hideSelectedDay` | `boolean` | `false` | Hides the Selected day item in the legend. |
| `hideToday` | `boolean` | `false` | Hides the Today item in the legend. |
| `hideWorkingDay` | `boolean` | `false` | Hides the Working day item in the legend. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<CalendarLegendItem>` | Defines the items of the component. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CalendarLegend/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CalendarLegend/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CalendarLegend/Basic/main.js).
- [CalendarLegendItem Types](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CalendarLegend/ItemTypes/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CalendarLegend/ItemTypes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CalendarLegend/ItemTypes/main.js).
- [Hide CalendarLegendItems](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CalendarLegend/HideToday/sample.tsx) — By default, the CalendarLegend shows **Today**, **SelectedDay**, **WorkingDay** and **NonWorkingDay** items. However, you can hide them as shown in the sample.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CalendarLegend/HideToday/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CalendarLegend/HideToday/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `hideNonWorkingDay`, `hideSelectedDay`, `hideToday`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states

### [CalendarLegendItem](https://ui5.github.io/webcomponents/components/CalendarLegendItem/)

- Tag: `ui5-calendar-legend-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/CalendarLegendItem.d.ts).
- Local implementation: `src/components/calendar-legend` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

Each `ui5-calendar-legend-item` represents a legend item, displaying a color with a label.
The color is determined by the `type` property and the label by the `text` property.
If a `ui5-special-date` is used within the `ui5-calendar` and a type is set, clicking on a `ui5-calendar-legend-item`
with the same type will emphasize the respective date(s) in the calendar.

##### Usage
The `ui5-calendar-legend-item` is intended to be used within the `ui5-calendar-legend` component.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/CalendarLegendItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string \| undefined` | `undefined` | Defines the text content of the Calendar Legend Item. |
| `type` | `` `${CalendarLegendItemType}` `` | `"None"` | Defines the type of the Calendar Legend Item. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `text`, `type`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [Card](https://ui5.github.io/webcomponents/components/Card/)

- Tag: `ui5-card`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Card.d.ts).
- Local implementation: `src/components/card` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-card` is a component that represents information in the form of a
tile with separate header and content areas.
The content area of a `ui5-card` can be arbitrary HTML content.
The header can be used through slot `header`. For which there is a `ui5-card-header` component to achieve the card look and feel.

Note: We recommend the usage of `ui5-card-header` for the header slot, so advantage can be taken for keyboard handling, styling and accessibility.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Card.js";`

`import "@ui5/webcomponents/dist/CardHeader.js";` (for `ui5-card-header`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component, which is used as the name of the card region and should be unique per card.<br><br>**Note:** `accessibleName` should be always set, unless `accessibleNameRef` is set. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that label the component. |
| `loading` | `boolean` | `false` | Defines if a loading indicator would be displayed over the card. |
| `loadingDelay` | `number` | `1000` | Defines the delay in milliseconds, after which the loading indicator will show up for this card. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the component. |
| `header` | `Slot<CardHeader>` | Defines the header of the component.<br><br>**Note:** Use `ui5-card-header` for the intended design. |

#### CSS parts

- `content`: Used to style the content of the card
- `root`: Used to style the root DOM element of the card component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/Basic/main.js).
- [List Card](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/WithList/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/WithList/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/WithList/main.js).
- [Table Card](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/WithTable/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/WithTable/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/WithTable/main.js).
- [Timeline Card](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/WithTimeline/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/WithTimeline/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/WithTimeline/main.js).
- [Object Card](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/MoreCards/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/MoreCards/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Card/MoreCards/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `loading`.
- [ ] Compare the existing `src/components/card` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Events
- Public methods
- CSS custom states

### [CardHeader](https://ui5.github.io/webcomponents/components/CardHeader/)

- Tag: `ui5-card-header`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/CardHeader.d.ts).
- Local implementation: `src/components/card-header` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The `ui5-card-header` is a component, meant to be used as a header of the `ui5-card` component.
It displays valuable information, that can be defined with several properties, such as: `titleText`, `subtitleText`, `additionalText`
and two slots: `avatar` and `action`.

##### Keyboard handling
In case you enable `interactive` property, you can press the `ui5-card-header` by Space and Enter keys.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/CardHeader";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `additionalText` | `string \| undefined` | `undefined` | Defines the additional text. |
| `interactive` | `boolean` | `false` | Defines if the component would be interactive,<br>e.g gets hover effect and `click` event is fired, when pressed. |
| `subtitleText` | `string \| undefined` | `undefined` | Defines the subtitle text. |
| `titleText` | `string \| undefined` | `undefined` | Defines the title text. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `action` | `Slot<HTMLElement>` | Defines an action, displayed in the right most part of the header. |
| `avatar` | `Slot<HTMLElement>` | Defines an avatar image, displayed in the left most part of the header. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | true | false | Fired when the component is activated by mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event would be fired only if the `interactive` property is set to true. |

#### CSS parts

- `additional-text`: Used to style the additional text of the CardHeader
- `root`: Used to style the root DOM element of the CardHeader
- `subtitle`: Used to style the subtitle of the CardHeader
- `title`: Used to style the title of the CardHeader

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `additionalText`, `interactive`, `subtitleText`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [Carousel](https://ui5.github.io/webcomponents/components/Carousel/)

- Tag: `ui5-carousel`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Carousel.d.ts).
- Local implementation: `src/components/carousel` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview
The Carousel allows the user to browse through a set of items.
The component is mostly used for showing a gallery of images, but can hold any other HTML element.

There are several ways to perform navigation:

- on desktop - the user can navigate using the navigation arrows or with keyboard shortcuts.
- on touch devices - the user can navigate using the navigation arrows (always visible) or can use swipe gestures.

##### Usage

##### When to use:

- The items you want to display are very different from each other.
- You want to display the items one after the other.

##### When not to use:

- The items you want to display need to be visible at the same time.
- The items you want to display are uniform and very similar.

##### Hidden Items

Carousel items can be conditionally hidden by adding the `hidden` attribute to any child element.
Hidden items are automatically excluded from carousel navigation and will not be displayed or counted in pagination.
This allows for dynamic showing or hiding of carousel items without affecting the overall carousel behavior.

##### Keyboard Handling

##### Basic Navigation
When the `ui5-carousel` is focused the user can navigate between the items
with the following keyboard shortcuts:

- [Up] or [Down] - Navigates to previous and next item
- [Left] or [Right] - Navigates to previous and next item

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:

`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Carousel.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that label the input. |
| `arrowsPlacement` | `` `${CarouselArrowsPlacement}` `` | `"Content"` | Defines the position of arrows.<br><br>Available options are:<br><br>- `Content` - the arrows are placed on the sides of the current page.<br>- `Navigation` - the arrows are placed on the sides of the page indicator. |
| `backgroundDesign` | `` `${BackgroundDesign}` `` | `"Translucent"` | Defines the carousel's background design. |
| `cyclic` | `boolean` | `false` | Defines whether the carousel should loop, i.e show the first page after the last page is reached and vice versa. |
| `hideNavigationArrows` | `boolean` | `false` | Defines the visibility of the navigation arrows.<br>If set to true the navigation arrows will be hidden. |
| `hidePageIndicator` | `boolean` | `false` | Defines the visibility of the page indicator.<br>If set to true the page indicator will be hidden. |
| `itemsPerPage` | `string` | `"S1 M1 L1 XL1"` | Defines the number of items per page depending on the carousel width.<br><br>- 'S' for screens smaller than 600 pixels.<br>- 'M' for screens greater than or equal to 600 pixels and smaller than 1024 pixels.<br>- 'L' for screens greater than or equal to 1024 pixels and smaller than 1440 pixels.<br>- 'XL' for screens greater than or equal to 1440 pixels.<br><br>One item per page is shown by default. |
| `pageIndicatorBackgroundDesign` | `` `${BackgroundDesign}` `` | `"Solid"` | Defines the page indicator background design. |
| `pageIndicatorBorderDesign` | `` `${BorderDesign}` `` | `"Solid"` | Defines the page indicator border design. |
| `pageIndicatorType` | `` `${CarouselPageIndicatorType}` `` | `"Default"` | Defines the style of the page indicator.<br>Available options are:<br><br>- `Default` - The page indicator will be visualized as dots if there are fewer than 9 pages. If there are more pages, the page indicator will switch to displaying the current page and the total number of pages. (e.g. X of Y)<br>- `Numeric` - The page indicator will display the current page and the total number of pages. (e.g. X of Y) |
| `visibleItemsIndices` | `Array<number>` | `[]` | The indices of the currently visible items of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the component.<br><br>**Note:** Items with the `hidden` attribute will be automatically excluded from carousel navigation and page calculations.<br>They will not be displayed or accessible via keyboard navigation. See [sample](./#carousel-with-hidden-items). |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `navigate` | `CustomEvent<CarouselNavigateEventDetail>` | true | false | Fired whenever the page changes due to user interaction,<br>when the user clicks on the navigation arrows or while resizing,<br>based on the `items-per-page` property. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `navigateTo` | `navigateTo(itemIndex: number): void;` | Changes the currently displayed page. |

#### CSS parts

- `content`: Used to style the content of the component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/Basic/main.js).
- [Cyclic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/Cyclic/sample.tsx) — When the last page is reached, pressing "Forward" will navigate to the start.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/Cyclic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/Cyclic/main.js).
- [Arrows Placement](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/ArrowsPlacement/sample.tsx) — When `arrowsPlacement` is set to "Content", the arrows are placed on the sides of the current page. When set to "Navigation", the arrows are placed on the sides of the page indicator.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/ArrowsPlacement/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/ArrowsPlacement/main.js).
- [Page Indicator](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/PageIndicatorType/sample.tsx) — When `pageIndicatorType` is set to "Default", the page indicator appear as dots. When set to "Numeric" - as numbers.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/PageIndicatorType/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/PageIndicatorType/main.js).
- [Multiple Items per Page](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/MultipleItemsPerPage/sample.tsx) — The `items-per-page` property defines the number of items per page for given breakpoint.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/MultipleItemsPerPage/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/MultipleItemsPerPage/main.js).
- [Accessible name](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/AccessibleName/sample.tsx) — Use the `accessibleName` or the `accessibleNameRef` properties to label the Carousel and improve its accessibility.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/AccessibleName/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/AccessibleName/main.js).
- [Carousel with Hidden Items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/CardsWithHidden/sample.tsx) — A Carousel containing cards where some are hidden using the `hidden` attribute. Hidden items will not be included in the carousel navigation.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/CardsWithHidden/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Carousel/CardsWithHidden/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `arrowsPlacement`.
- [ ] Verify `navigate` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- CSS custom states

### [CheckBox](https://ui5.github.io/webcomponents/components/CheckBox/)

- Tag: `ui5-checkbox`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/CheckBox.d.ts).
- Local implementation: `src/components/checkbox` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

Allows the user to set a binary value, such as true/false or yes/no for an item.

The `ui5-checkbox` component consists of a box and a label that describes its purpose.
If it's checked, an indicator is displayed inside the box.
To check/uncheck the `ui5-checkbox`, the user has to click or tap the square
box or its label.

The `ui5-checkbox` component only has 2 states - checked and unchecked.
Clicking or tapping toggles the `ui5-checkbox` between checked and unchecked state.

##### Usage

You can define the checkbox text with via the `text` property. If the text exceeds the available width, it is truncated by default.
In case you prefer text to truncate, set the `wrappingType` property to "None".
The touchable area for toggling the `ui5-checkbox` ends where the text ends.

You can disable the `ui5-checkbox` by setting the `disabled` property to
`true`,
or use the `ui5-checkbox` in read-only mode by setting the `readonly`
property to `true`.

##### Keyboard Handling

The user can use the following keyboard shortcuts to toggle the checked state of the `ui5-checkbox`.

- [Space],[Enter] - Toggles between different states: checked, not checked.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/CheckBox.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component |
| `checked` | `boolean` | `false` | Defines if the component is checked.<br><br>**Note:** The property can be changed with user interaction,<br>either by cliking/tapping on the component, or by<br>pressing the Enter or Space key. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br><br>**Note:** A disabled component is completely noninteractive. |
| `displayOnly` | `boolean` | `false` | Determines whether the `ui5-checkbox` is in display only state.<br><br>When set to `true`, the `ui5-checkbox` is not interactive, not editable, not focusable<br>and not in the tab chain. This setting is used for forms in review mode.<br><br>**Note:** When the property `disabled` is set to `true` this property has no effect. |
| `indeterminate` | `boolean` | `false` | Defines whether the component is displayed as partially checked.<br><br>**Note:** The indeterminate state can be set only programmatically and can’t be achieved by user<br>interaction and the resulting visual state depends on the values of the `indeterminate`<br>and `checked` properties:<br><br>-  If the component is checked and indeterminate, it will be displayed as partially checked<br>-  If the component is checked and it is not indeterminate, it will be displayed as checked<br>-  If the component is not checked, it will be displayed as not checked regardless value of the indeterminate attribute |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `required` | `boolean` | `false` | Defines whether the component is required.<br><br>**Note:** We advise against using the text property of the checkbox when there is a<br>label associated with it to avoid having two required asterisks. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the component. |
| `value` | `string` | `"on"` | Defines the form value of the component that is submitted when the checkbox is checked.<br><br>When a form containing `ui5-checkbox` elements is submitted, only the values of the<br>**checked** checkboxes are included in the form data sent to the server. Unchecked<br>checkboxes do not contribute any data to the form submission.<br><br>This property is particularly useful for **checkbox groups**, where multiple checkboxes with the same `name` but different `value` properties can be used to represent a set of related options. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |
| `wrappingType` | `` `${WrappingType}` `` | `"Normal"` | Defines whether the component text wraps when there is not enough space.<br><br>**Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.<br>**Note:** for option "None" the text will be truncated with an ellipsis. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | true | Fired when the component checked state changes. |

#### CSS parts

- `icon`: Used to style the icon of the `ui5-checkbox`
- `label`: Used to style the label of the `ui5-checkbox`
- `root`: Used to style the outermost wrapper of the `ui5-checkbox`

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/Basic/main.js).
- [Indeterminate](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/Indeterminate/sample.tsx) — The CheckBox can also display an indeterminate state. It's useful to indicate that not all tasks/items are done/checked.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/Indeterminate/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/Indeterminate/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/States/sample.tsx) — CheckBox supports several semantic value states, readonly, disabled, etc.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/States/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/States/main.js).
- [Text Truncation and Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/TextWrapping/sample.tsx) — The CheckBox text wraps by default. To make it truncate - set `wrapping-type="None"`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/TextWrapping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/TextWrapping/main.js).
- [Group of Checkboxes in a Form](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/Group/sample.tsx) — Checkboxes can be logically grouped using the same `name` attribute to create a multi-selection form field.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/Group/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/CheckBox/Group/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `checked`.
- [ ] Verify `change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/checkbox` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Slots
- Public methods
- CSS custom states

### [ColorPalette](https://ui5.github.io/webcomponents/components/ColorPalette/)

- Tag: `ui5-color-palette`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ColorPalette.d.ts).
- Local implementation: `src/components/color-palette` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview
The `ui5-color-palette` provides the users with a range of predefined colors. The colors are fixed and do not change with the theme.

##### Usage

The `ui5-color-palette` is meant for users that need to select a color from a predefined set.
To define the colors, use the `ui5-color-palette-item` component inside the default slot of the `ui5-color-palette`.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/ColorPalette.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ColorPaletteItem>` | Defines the `ui5-color-palette-item` elements. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `item-click` | `CustomEvent<ColorPaletteItemClickEventDetail>` | false | false | Fired when the user selects a color. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalette/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalette/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalette/Basic/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`.
- [ ] Verify `item-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [ColorPaletteItem](https://ui5.github.io/webcomponents/components/ColorPaletteItem/)

- Tag: `ui5-color-palette-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ColorPaletteItem.d.ts).
- Local implementation: `src/components/color-palette` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The `ui5-color-palette-item` component represents a color in the the `ui5-color-palette`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `selected` | `boolean` | `false` | Defines if the component is selected.<br><br>**Note:** Only one item must be selected per <code>ui5-color-palette</code>.<br>If more than one item is defined as selected, the last one would be considered as the selected one. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component. When not set, the color value is used as the tooltip. |
| `value` | `string` | `""` | Defines the colour of the component.<br><br>**Note:** The value should be a valid CSS color. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ColorPaletteItemNativeClickEventDetail>` | true | true | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `selected`, `tooltip`, `value`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [ColorPalettePopover](https://ui5.github.io/webcomponents/components/ColorPalettePopover/)

- Tag: `ui5-color-palette-popover`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ColorPalettePopover.d.ts).
- Local implementation: `src/components/color-palette-popover` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview
Represents a predefined range of colors for easier selection.

Overview
The ColorPalettePopover provides the users with a slot to predefine colors.

You can customize them with the use of the colors property. You can specify a defaultColor and display a "Default color" button for the user to choose directly.
You can display a "More colors..." button that opens an additional color picker for the user to choose specific colors that are not present in the predefined range.

##### Usage

The palette is intended for users, who don't want to check and remember the different values of the colors and spend large amount of time to configure the right color through the color picker.

For the `ui5-color-palette-popover`
##### ES6 Module Import

`import @ui5/webcomponents/dist/ColorPalettePopover.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `defaultColor` | `string \| undefined` | `undefined` | Defines the default color of the component.<br><br>**Note:** The default color should be a part of the ColorPalette colors` |
| `open` | `boolean` | `false` | Defines the open \| closed state of the popover. |
| `opener` | `HTMLElement \| string \| null \| undefined` | `undefined` | Defines the ID or DOM Reference of the element that the popover is shown at.<br>When using this attribute in a declarative way, you must only use the `id` (as a string) of the element at which you want to show the popover.<br>You can only set the `opener` attribute to a DOM Reference when using JavaScript. |
| `placement` | `` `${PopoverPlacement}` `` | `"Bottom"` | Determines on which side the component is placed at. |
| `showDefaultColor` | `boolean` | `false` | Defines whether the user can choose the default color from a button. |
| `showMoreColors` | `boolean` | `false` | Defines whether the user can choose a custom color from a component. |
| `showRecentColors` | `boolean` | `false` | Defines whether the user can see the last used colors in the bottom of the component |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IColorPaletteItem>` | Defines the content of the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `close` | `CustomEvent` | true | false | Fired when the `ui5-color-palette-popover` is closed due to user interaction. |
| `item-click` | `CustomEvent<ColorPalettePopoverItemClickEventDetail>` | true | false | Fired when the user selects a color. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalettePopover/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalettePopover/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalettePopover/Basic/main.js).
- [Show Default Color](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalettePopover/DefaultColor/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalettePopover/DefaultColor/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalettePopover/DefaultColor/main.js).
- [Show More & Recent Colors](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalettePopover/MoreColors/sample.tsx) — Recent colors shows the last five colors that have been selected. More colors opens a dialog to manually choose a color from a ColorPicker.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalettePopover/MoreColors/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPalettePopover/MoreColors/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `defaultColor`.
- [ ] Verify `close`, `item-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [ColorPicker](https://ui5.github.io/webcomponents/components/ColorPicker/)

- Tag: `ui5-color-picker`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ColorPicker.d.ts).
- Local implementation: `src/components/color-picker` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview
The `ui5-color-picker` allows users to choose any color and provides different input options for selecting colors.

##### Usage

##### When to use
Use the color picker if:

-  users need to select any color freely.

##### When not to use

-  Users need to select one color from a predefined set of colors. Use the ColorPalette component instead.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/ColorPicker.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `simplified` | `boolean` | `false` | When set to `true`, the alpha slider and inputs for RGB values will not be displayed. |
| `value` | `string` | `"rgba(255,255,255,1)"` | Defines the currently selected color of the component.<br><br>**Note**: use HEX, RGB, RGBA, HSV formats or a CSS color name when modifying this property. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the the selected color is changed |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPicker/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPicker/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPicker/Basic/main.js).
- [Simplified Picker](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPicker/Simplified/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPicker/Simplified/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ColorPicker/Simplified/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `name`.
- [ ] Verify `change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states

### [ComboBox](https://ui5.github.io/webcomponents/components/ComboBox/)

- Tag: `ui5-combobox`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ComboBox.d.ts).
- Local implementation: `src/components/combo-box` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-combobox` component represents a drop-down menu with a list of the available options and a text input field to narrow down the options.

It is commonly used to enable users to select an option from a predefined list.

##### Structure
The `ui5-combobox` consists of the following elements:

-  Input field - displays the selected option or a custom user entry. Users can type to narrow down the list or enter their own value.
-  Drop-down arrow - expands\collapses the option list.
-  Option list - the list of available options.

##### Working with Values

The ComboBox offers two ways to work with item selection:

**1. Display Text Only (using `value`):**
```html
<ui5-combobox value="Germany">
  <ui5-cb-item text="Germany"></ui5-cb-item>
  <ui5-cb-item text="France"></ui5-cb-item>
</ui5-combobox>
```
Use this approach when the displayed text is sufficient for your needs.

**2. Unique Identifiers - Recommended (using `selectedValue` and item `value`):**
```html
<ui5-combobox value="Germany" selected-value="DE">
  <ui5-cb-item text="Germany" value="DE"></ui5-cb-item>
  <ui5-cb-item text="France" value="FR"></ui5-cb-item>
</ui5-combobox>
```
This is the recommended approach when you need to work with unique identifiers (IDs, codes) separate from display text.
The `selectedValue` property references the `value` property of the selected item.
In forms, the item's `value` (e.g., "DE") will be submitted instead of the display text.

**Important:** Do not mix the `selectedValue` approach with the deprecated `selected` property on items.

##### Keyboard Handling

The `ui5-combobox` provides advanced keyboard handling.

- [F4], [Alt]+[Up], or [Alt]+[Down] - Toggles the picker.
- [Escape] - Closes the picker, if open. If closed, cancels changes and reverts the typed in value.
- [Enter] or [Return] - If picker is open, takes over the currently selected item and closes it.
- [Down] - Selects the next matching item in the picker.
- [Up] - Selects the previous matching item in the picker.
- [Page Down] - Moves selection down by page size (10 items by default).
- [Page Up] - Moves selection up by page size (10 items by default).
- [Home] - If focus is in the ComboBox, moves cursor at the beginning of text. If focus is in the picker, selects the first item.
- [End] - If focus is in the ComboBox, moves cursor at the end of text. If focus is in the picker, selects the last item.
- [Ctrl]+[Alt]+[F8] or [Command]+[Option]+[F8] - Focuses the first link in the value state message, if available. Pressing [Tab] moves the focus to the next link in the value state message, or closes the value state message if there are no more links.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/ComboBox.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state.<br><br>**Note:** A disabled component is completely noninteractive. |
| `filter` | `` `${ComboBoxFilter}` `` | `"StartsWithPerTerm"` | Defines the filter type of the component. |
| `loading` | `boolean` | `false` | Indicates whether a loading indicator should be shown in the picker. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `noTypeahead` | `boolean` | `false` | Defines whether the value will be autocompleted to match an item |
| `open` | `boolean` | `false` | Indicates whether the items picker is open. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the<br>component has no value. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `selectedValue` | `string \| undefined` | `undefined` | Defines the value of the selected item (references the `value` property of `ui5-cb-item`).<br><br>Use this property to work with unique identifiers (IDs, codes) instead of display text.<br>When set, the ComboBox finds and selects the item whose `value` property matches this property.<br><br>**Benefits:**<br>- Select items programmatically by their unique identifier<br>- Handle items with identical display text but different underlying values<br>- Submit machine-readable values in forms (the item's `value` is submitted instead of the display text)<br><br>**When to use `selectedValue` vs `value`:**<br>- **Recommended:** Use `selectedValue` + item `value` when you need unique identifiers separate from display text (e.g., country codes "DE", "FR" with display names "Germany", "France")<br>- Use only the ComboBox `value` property when the display text itself is sufficient for your use case |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the combobox will be shown. |
| `value` | `string` | `""` | Defines the value of the component. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IComboBoxItem>` | Defines the component items. |
| `icon` | `Slot<IIcon>` | Defines the icon to be displayed in the input field. |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br>The value state message slot should contain only one root element.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the `ui5-combobox` is in `Information`, `Critical` or `Negative` value state. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the input operation has finished by pressing Enter, focusout or an item is selected. |
| `close` | `CustomEvent` | false | false | Fired when the dropdown is closed. |
| `input` | `CustomEvent` | true | false | Fired when typing in input or clear icon is pressed.<br><br>**Note:** filterValue property is updated, input is changed. |
| `load-items` | `CustomEvent<ComboBoxLoadItemsEventDetail>` | true | false | Fired when the application should provide items for the component to render.<br>The event is fired either when text is input or when the user presses arrow down on a combo-box with no items. |
| `open` | `CustomEvent` | true | false | Fired when the dropdown is opened. |
| `selection-change` | `CustomEvent<ComboBoxSelectionChangeEventDetail>` | true | false | Fired when selection is changed by user interaction |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/Basic/main.js).
- [Clear Icon](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/ClearIcon/sample.tsx) — The ComboBox can show a clear icon, visible when there is a value typed by the user.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/ClearIcon/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/ClearIcon/main.js).
- [Filters](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/Filters/sample.tsx) — You can choose a Filter that the items will be matched against on user input (StartsWith, Contains, etc.); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/Filters/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/Filters/main.js).
- [Items with additional text](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/TwoColumnsLayout/sample.tsx) — The ComboBox items can show additional text.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/TwoColumnsLayout/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/TwoColumnsLayout/main.js).
- [Items Grouping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/Grouping/sample.tsx) — Grouping of items can be implemented via the `ui5-cb-group-item` web component.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/Grouping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/Grouping/main.js).
- [Items Text Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/SuggestionsWrapping/sample.tsx) — The sample demonstrates how the text of the items wrap when too long.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/SuggestionsWrapping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/SuggestionsWrapping/main.js).
- [Selected Value](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/SelectedValue/sample.tsx) — Use the `value` property on items and `selected-value` on the ComboBox to decouple the display text from the underlying selection value.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/SelectedValue/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/SelectedValue/main.js).
- [Items with Same Text but Different Values](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/SameTextDifferentValues/sample.tsx) — When you have multiple items with identical display text, use the `value` property to uniquely identify each item.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/SameTextDifferentValues/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/SameTextDifferentValues/main.js).
- [Custom Items with Rich Content](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/CustomItems/sample.tsx) — Use `ui5-cb-item-custom` to create custom item templates with complex layouts, multiple icons, images, or any HTML content.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/CustomItems/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/CustomItems/main.js).
- [Lazy Loaded Items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/LazyLoading/sample.tsx) — Use the `load-items` event to load items on demand. Its detail carries the `reason` (`"open"` when the picker is opened with no items, `"input"` when the user types) and the current `value`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/LazyLoading/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ComboBox/LazyLoading/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `disabled`.
- [ ] Verify `change`, `close`, `input`, `load-items`, `open`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/combo-box` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [ComboBoxItem](https://ui5.github.io/webcomponents/components/ComboBoxItem/)

- Tag: `ui5-cb-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ComboBoxItem.d.ts).
- Local implementation: covered by `ComboBox` `options` (`SelectOption`) (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-cb-item` represents the item for a `ui5-combobox`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `additionalText` | `string \| undefined` | `undefined` | Defines the additional text of the component. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the component. |
| `value` | `string \| undefined` | `undefined` | Defines the value of the `ui5-cb-item`.<br><br>Use this property to associate a unique identifier or machine-readable value with the item,<br>separate from the display text. This enables:<br>- Selecting items programmatically via `selectedValue` on the ComboBox<br>- Submitting machine-readable values in forms<br>- Distinguishing between items with identical display text<br><br>**When to use:**<br>- **Recommended:** Use the `value` property on items together with `selectedValue` on the ComboBox when you need unique identifiers<br>- Omit `value` if the display text (`text` property) is sufficient for your use case<br><br>**Example:**<br>```html<br><ui5-combobox selected-value="DE"><br>  <ui5-cb-item text="Germany" value="DE"></ui5-cb-item><br>  <ui5-cb-item text="France" value="FR"></ui5-cb-item><br></ui5-combobox><br>``` |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `additionalText`, `text`, `value`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [ComboBoxItemCustom](https://ui5.github.io/webcomponents/components/ComboBoxItemCustom/)

- Tag: `ui5-cb-item-custom`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ComboBoxItemCustom.d.ts).
- Local implementation: covered by `SelectOption` `description`/`icon` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-cb-item-custom` is a combobox item component
that allows placing custom content inside a combobox item.
The `text` property is used for filtering and auto-complete.
For highlighting functionality, see `@ui5/webcomponents-base/dist/util/generateHighlightedMarkup.js`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string \| undefined` | `undefined` | Defines the text of the component.<br>Used for filtering, autocomplete, and mobile rendering. |
| `value` | `string \| undefined` | `undefined` | Defines the value of the component.<br>Used for programmatic selection via the `selectedValue` property. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the content of the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ComboBoxItemCustomClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `text`, `value`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [ComboBoxItemGroup](https://ui5.github.io/webcomponents/components/ComboBoxItemGroup/)

- Tag: `ui5-cb-item-group`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ComboBoxItemGroup.d.ts).
- Local implementation: covered by `SelectOption.group` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-cb-group-item` is type of suggestion item,
that can be used to split the `ui5-combobox` suggestions into groups.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `headerAccessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the header. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text of the group. |
| `wrappingType` | `` `${WrappingType}` `` | `"None"` | Defines if the text of the component should wrap when it's too long.<br>When set to "Normal", the content (title, description) will be wrapped<br>using the `ui5-expandable-text` component.<br/><br><br>The text can wrap up to 100 characters on small screens (size S) and<br>up to 300 characters on larger screens (size M and above). When text exceeds<br>these limits, it truncates with an ellipsis followed by a text expansion trigger.<br><br>Available options are:<br>- `None` (default) - The text will truncate with an ellipsis.<br>- `Normal` - The text will wrap (without truncation). |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ComboBoxItem>` | Defines the items of the <code>ui5-cb-item-group</code>. |
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

### [DatePicker](https://ui5.github.io/webcomponents/components/DatePicker/)

- Tag: `ui5-date-picker`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/DatePicker.d.ts).
- Local implementation: `src/components/date-picker` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-date-picker` component provides an input field with assigned calendar which opens on user action.
The `ui5-date-picker` allows users to select a localized date using touch,
mouse, or keyboard input. It consists of two parts: the date input field and the
date picker.

##### Usage

The user can enter a date by:

- Using the calendar that opens in a popup
- Typing it in directly in the input field

When the user makes an entry and presses the enter key, the calendar shows the corresponding date.
When the user directly triggers the calendar display, the actual date is displayed.

##### Formatting

If a date is entered by typing it into
the input field, it must fit to the used date format.

Supported format options are pattern-based on Unicode LDML Date Format notation.
For more information, see [UTS #35: Unicode Locale Data Markup Language](https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).

For example, if the valueFormat is "yyyy-MM-dd", the displayFormat is "MMM d, y", and the used locale is English, a valid value string is "2015-07-30", which leads to an output of "Jul 30, 2015".
If no placeholder is set to the DatePicker, the used displayFormat is displayed as a placeholder. If another placeholder is needed, it must be set.

##### Relative date input

The input field also accepts locale-aware relative date expressions sourced from the Unicode CLDR.
The following expressions are supported in English:

- Day: "today", "yesterday", "tomorrow", "in N days", "N days ago"
- Week: "this week", "last week", "next week", "in N weeks", "N weeks ago"
- Month: "this month", "last month", "next month", "in N months", "N months ago"
- Year: "this year", "last year", "next year", "in N years", "N years ago"

The recognized expressions are locale-specific — the equivalent terms in the user's language are used (for example, "heute" in German, "bugün" in Turkish).
Week, month, and year expressions resolve to an offset from today (for example, "next week" = today + 7 days).
For the full list of supported fields and patterns, see [CLDR Date Fields](https://unicode.org/reports/tr35/tr35-dates.html#Calendar_Fields).

##### Keyboard Handling
The `ui5-date-picker` provides advanced keyboard handling.
If the `ui5-date-picker` is focused,
you can open or close the drop-down by pressing [F4], [Alt] + [Up] or [Alt] + [Down] keys.
Once the drop-down is opened, you can use the [Up], [Down], [Left] or [Right] arrow keys
to navigate through the dates and select one by pressing the `Space` or `Enter` keys. Moreover you can
use TAB to reach the buttons for changing month and year.

If the `ui5-date-picker` input field is focused and its corresponding picker dialog is not opened,
then users can increment or decrement the date referenced by `dateValue` property
by using the following shortcuts:

- [Page Down] - Decrements the corresponding day of the month by one
- [Shift] + [Page Down] - Decrements the corresponding month by one
- [Shift] + [Ctrl] + [Page Down] - Decrements the corresponding year by one
- [Page Up] - Increments the corresponding day of the month by one
- [Shift] + [Page Up] - Increments the corresponding month by one
- [Shift] + [Ctrl] + [Page Up] - Increments the corresponding year by one

##### Calendar types
The component supports several calendar types - Gregorian, Buddhist, Islamic, Japanese and Persian.
By default the Gregorian Calendar is used. In order to use the Buddhist, Islamic, Japanese or Persian calendar,
you need to set the `primaryCalendarType` property and import one or more of the following modules:

`import "@ui5/webcomponents-localization/dist/features/calendar/Buddhist.js";`

`import "@ui5/webcomponents-localization/dist/features/calendar/Islamic.js";`

`import "@ui5/webcomponents-localization/dist/features/calendar/Japanese.js";`

`import "@ui5/webcomponents-localization/dist/features/calendar/Persian.js";`

Or, you can use the global configuration and set the `calendarType` key:

```html
<script data-id="sap-ui-config" type="application/json">
	{
		"calendarType": "Japanese"
	}
<script>
```

##### ES6 Module Import

`import "@ui5/webcomponents/dist/DatePicker.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the input. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the aria-label attribute for the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `calendarWeekNumbering` | `` `${CalendarWeekNumbering}` `` | `"Default"` | Defines how to calculate calendar weeks and first day of the week.<br>If not set, the calendar will be displayed according to the currently set global configuration. |
| `dateValue` | `Date \| null` | `null` | Currently selected date represented as a Local JavaScript Date instance.<br>Note: this getter can only be reliably used after the component is fully defined. Use dateValueAsync which resolves only when this condition is met.<br>**Deprecated:** Use dateValueAsync instead |
| `dateValueAsync` | `Promise<Date \| null>` | `Promise` | Promise that resolves to the currently selected date represented as a Local JavaScript Date instance. |
| `disabled` | `boolean` | `false` | Determines whether the component is displayed as disabled. |
| `displayFormat` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field. |
| `formatPattern` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field.<br>**Deprecated:** Use displayFormat and valueFormat instead |
| `hideWeekNumbers` | `boolean` | `false` | Defines the visibility of the week numbers column.<br><br>**Note:** For calendars other than Gregorian,<br>the week numbers are not displayed regardless of what is set. |
| `maxDate` | `string` | `""` | Determines the maximum date available for selection.<br><br>**Note:** If the formatPattern property is not set, the maxDate value must be provided in the ISO date format (yyyy-MM-dd). |
| `minDate` | `string` | `""` | Determines the minimum date available for selection.<br><br>**Note:** If the formatPattern property is not set, the minDate value must be provided in the ISO date format (yyyy-MM-dd). |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `open` | `boolean` | `false` | Defines the open or closed state of the popover. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint, intended to aid the user with data entry when the<br>component has no value.<br><br>**Note:** When no placeholder is set, the format pattern is displayed as a placeholder.<br>Passing an empty string as the value of this property will make the component appear empty - without placeholder or format pattern. |
| `primaryCalendarType` | `` `${CalendarType}` \| undefined `` | `undefined` | Sets a calendar type used for display.<br>If not set, the calendar type of the global configuration is used. |
| `readonly` | `boolean` | `false` | Determines whether the component is displayed as read-only. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `secondaryCalendarType` | `` `${CalendarType}` \| undefined `` | `undefined` | Defines the secondary calendar type.<br>If not set, the calendar will only show the primary calendar type. |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the input will be shown. |
| `value` | `string` | `""` | Defines a formatted date value. |
| `valueFormat` | `string \| undefined` | `undefined` | Determines the format, used for the value attribute. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent<DatePickerChangeEventDetail>` | true | true | Fired when the input operation has finished by pressing Enter or on focusout. |
| `close` | `CustomEvent` | false | false | Fired after the component's picker is closed. |
| `input` | `CustomEvent<DatePickerInputEventDetail>` | true | true | Fired when the value of the component is changed at each key stroke. |
| `open` | `CustomEvent` | false | false | Fired after the component's picker is opened. |
| `value-state-change` | `CustomEvent<DatePickerValueStateChangeEventDetail>` | true | true | Fired before the value state of the component is updated internally.<br>The event is preventable, meaning that if it's default action is<br>prevented, the component will not update the value state. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `formatValue` | `formatValue(date: Date): string;` | Formats a Java Script date object into a string representing a locale date<br>according to the `formatPattern` property of the DatePicker instance |
| `isInValidRange` | `isInValidRange(value: string): boolean;` | Checks if a date is between the minimum and maximum date. |
| `isValid` | `isValid(value: string): boolean;` | Checks if a value is valid against the current date format of the DatePicker. |
| `isValidDisplayValue` | `isValidDisplayValue(value: string): boolean;` | Checks if a value is valid against the current date format of the DatePicker. |
| `isValidValue` | `isValidValue(value: string): boolean;` | Checks if a value is valid against the current date format of the DatePicker. |

#### CSS parts

- `input`: Used to style the input element. This part is forwarded to the underlying ui5-input element.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/Basic/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/State/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/State/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/State/main.js).
- [Min and Max Dates](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/MinMax/sample.tsx) — Define min and max date boundaries to constrain user choice.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/MinMax/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/MinMax/main.js).
- [Calendar Types](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/CalendarTypes/sample.tsx) — You can set the preferred calendar, such as: Gregorian, Islamic, Japanese and Persian.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/CalendarTypes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/CalendarTypes/main.js).
- [Timezones](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/DatePickerInDifferentTimezone/sample.tsx) — You can set to the configuration the preferred time zone, such as: Asia/Tokyo, Pacific/Apia, Asia/Kolkata, Europe/Sofia and etc.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/DatePickerInDifferentTimezone/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/DatePickerInDifferentTimezone/main.js).
- [CalendarWeekNumbering](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/CalendarWeekNumbering/sample.tsx) — You can use the component, the preferred week numbering and first day of week.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/CalendarWeekNumbering/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/CalendarWeekNumbering/main.js).
- [CustomFormatting](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/CustomFormatting/sample.tsx) — You can have custom formatting for the display value and the value property. Supported format options are pattern-based on Unicode LDML Date Format notation.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/CustomFormatting/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/CustomFormatting/main.js).
- [Clear Icon](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/ClearIcon/sample.tsx) — This sample demonstrates the component with the `show-clear-icon` property enabled, which displays a clear button to reset the selected date.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/ClearIcon/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DatePicker/ClearIcon/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `change`, `close`, `input`, `open`, `value-state-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/date-picker` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- CSS custom states

### [DateRangePicker](https://ui5.github.io/webcomponents/components/DateRangePicker/)

- Tag: `ui5-daterange-picker`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/DateRangePicker.d.ts).
- Local implementation: `src/components/date-range-picker` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The DateRangePicker enables the users to enter a localized date range using touch, mouse, keyboard input, or by selecting a date range in the calendar.

##### Usage
The user can enter a date by:
Using the calendar that opens in a popup or typing it in directly in the input field (not available for mobile devices).
For the `ui5-daterange-picker`:

**Note:** Relative date values such as "today", "yesterday", or "tomorrow" are not supported.
Entering a relative date sets the component to an error state.
##### ES6 Module Import

`import "@ui5/webcomponents/dist/DateRangePicker.js";`

##### Keyboard Handling
The `ui5-daterange-picker` provides advanced keyboard handling.

When the `ui5-daterange-picker` input field is focused the user can
increment or decrement respectively the range start or end date, depending on where the cursor is.
The following shortcuts are available:

- [Page Down] - Decrements the corresponding day of the month by one
- [Shift] + [Page Down] - Decrements the corresponding month by one
- [Shift] + [Ctrl] + [Page Down] - Decrements the corresponding year by one
- [Page Up] - Increments the corresponding day of the month by one
- [Shift] + [Page Up] - Increments the corresponding month by one
- [Shift] + [Ctrl] + [Page Up] - Increments the corresponding year by one

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the input. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the aria-label attribute for the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `calendarWeekNumbering` | `` `${CalendarWeekNumbering}` `` | `"Default"` | Defines how to calculate calendar weeks and first day of the week.<br>If not set, the calendar will be displayed according to the currently set global configuration. |
| `dateValue` | `Date \| null` | `null` | **Note:** The getter method is inherited and not supported. If called it will return an empty value.<br>**Deprecated:** Use dateValueAsync instead |
| `dateValueAsync` | `Promise<Date \| null>` | `Promise` | Promise that resolves to the currently selected date represented as a Local JavaScript Date instance. |
| `dateValueUTC` | `Date \| null` | `null` | **Note:** The getter method is inherited and not supported. If called it will return an empty value. |
| `delimiter` | `string` | `"-"` | Determines the symbol which separates the dates.<br>If not supplied, the default time interval delimiter for the current locale will be used. |
| `disabled` | `boolean` | `false` | Determines whether the component is displayed as disabled. |
| `displayFormat` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field. |
| `endDateValue` | `Date \| null` | `null` | Returns the end date of the currently selected range as JavaScript Date instance. |
| `formatPattern` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field.<br>**Deprecated:** Use displayFormat and valueFormat instead |
| `hideWeekNumbers` | `boolean` | `false` | Defines the visibility of the week numbers column.<br><br>**Note:** For calendars other than Gregorian,<br>the week numbers are not displayed regardless of what is set. |
| `maxDate` | `string` | `""` | Determines the maximum date available for selection.<br><br>**Note:** If the formatPattern property is not set, the maxDate value must be provided in the ISO date format (yyyy-MM-dd). |
| `minDate` | `string` | `""` | Determines the minimum date available for selection.<br><br>**Note:** If the formatPattern property is not set, the minDate value must be provided in the ISO date format (yyyy-MM-dd). |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `open` | `boolean` | `false` | Defines the open or closed state of the popover. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint, intended to aid the user with data entry when the<br>component has no value.<br><br>**Note:** When no placeholder is set, the format pattern is displayed as a placeholder.<br>Passing an empty string as the value of this property will make the component appear empty - without placeholder or format pattern. |
| `primaryCalendarType` | `` `${CalendarType}` \| undefined `` | `undefined` | Sets a calendar type used for display.<br>If not set, the calendar type of the global configuration is used. |
| `readonly` | `boolean` | `false` | Determines whether the component is displayed as read-only. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `secondaryCalendarType` | `` `${CalendarType}` \| undefined `` | `undefined` | Defines the secondary calendar type.<br>If not set, the calendar will only show the primary calendar type. |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the input will be shown. |
| `showTwoMonths` | `boolean` | `false` | Defines whether the component displays two months side by side in the picker popup.<br><br>When enabled, two consecutive months are shown, making it easier to select date ranges<br>that span multiple months without the need to navigate between months.<br><br>**Note:** On mobile devices only a single month<br>will be displayed regardless of this setting. |
| `startDateValue` | `Date \| null` | `null` | Returns the start date of the currently selected range as JavaScript Date instance. |
| `value` | `string` | `""` | Defines a formatted date value. |
| `valueFormat` | `string \| undefined` | `undefined` | Determines the format, used for the value attribute. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent<DatePickerChangeEventDetail>` | true | true | Fired when the input operation has finished by pressing Enter or on focusout. |
| `close` | `CustomEvent` | false | false | Fired after the component's picker is closed. |
| `input` | `CustomEvent<DatePickerInputEventDetail>` | true | true | Fired when the value of the component is changed at each key stroke. |
| `open` | `CustomEvent` | false | false | Fired after the component's picker is opened. |
| `value-state-change` | `CustomEvent<DatePickerValueStateChangeEventDetail>` | true | true | Fired before the value state of the component is updated internally.<br>The event is preventable, meaning that if it's default action is<br>prevented, the component will not update the value state. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `formatValue` | `formatValue(date: Date): string;` | Formats a Java Script date object into a string representing a locale date<br>according to the `formatPattern` property of the DatePicker instance |
| `isInValidRange` | `isInValidRange(value: string): boolean;` | Checks if a date is between the minimum and maximum date. |
| `isValid` | `isValid(value: string): boolean;` | Checks if a value is valid against the current date format of the DatePicker. |
| `isValidDisplayValue` | `isValidDisplayValue(value: string): boolean;` | Checks if a value is valid against the current date format of the DatePicker. |
| `isValidValue` | `isValidValue(value: string): boolean;` | Checks if a value is valid against the current date format of the DatePicker. |

#### CSS parts

- `input`: Used to style the input element. This part is forwarded to the underlying ui5-input element.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/Basic/main.js).
- [Date Formats](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/DateFormat/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/DateFormat/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/DateFormat/main.js).
- [Min and Max Dates](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/MinMax/sample.tsx) — Define min and max date boundaries to constrain user choice.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/MinMax/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/MinMax/main.js).
- [CustomFormatting](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/CustomFormatting/sample.tsx) — You can have custom formatting for the display value and the value property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/CustomFormatting/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/CustomFormatting/main.js).
- [Clear Icon](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/ClearIcon/sample.tsx) — This sample demonstrates the component with the `show-clear-icon` property enabled.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/ClearIcon/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/ClearIcon/main.js).
- [Show Two Months](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/ShowTwoMonths/sample.tsx) — This sample demonstrates the component with the `show-two-months` property enabled, which displays two consecutive months.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/ShowTwoMonths/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateRangePicker/ShowTwoMonths/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `change`, `close`, `input`, `open`, `value-state-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/date-range-picker` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- CSS custom states

### [DateTimePicker](https://ui5.github.io/webcomponents/components/DateTimePicker/)

- Tag: `ui5-datetime-picker`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/DateTimePicker.d.ts).
- Local implementation: `src/components/date-time-picker` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview
The `DateTimePicker` component alows users to select both date (day, month and year) and time (hours, minutes and seconds)
and for the purpose it consists of input field and Date/Time picker.

##### Usage

Use the `DateTimePicker` if you need a combined date and time input component.
Don't use it if you want to use either date, or time value.
In this case, use the `DatePicker` or the `TimePicker` components instead.

The user can set date/time by:

- using the calendar and the time selectors
- typing in the input field

Programmatically, to set date/time for the `DateTimePicker`, use the `value` property

##### Formatting

The value entered by typing into the input field must fit to the used date/time format.

Supported format options are pattern-based on Unicode LDML Date Format notation.
For more information, see [UTS #35: Unicode Locale Data Markup Language](https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).

**Example:** the following format `dd/MM/yyyy, hh:mm:ss aa`
corresponds the `13/04/2020, 03:16:16 AM` value.

The small 'h' defines "12" hours format and the "aa" symbols - "AM/PM" time periods.

**Example:** the following format `dd/MM/yyyy, HH:mm:ss`
corresponds the `13/04/2020, 15:16:16` value.

The capital 'H' indicates "24" hours format.

**Note:** If the `formatPattern` does NOT include time,
the `DateTimePicker` will fallback to the default time format according to the locale.

**Note:** If no placeholder is set to the `DateTimePicker`,
the current `formatPattern` is displayed as a placeholder.
If another placeholder is needed, it must be set or in case no placeholder is needed - it can be set to an empty string.

**Note:** If the user input does NOT match the `formatPattern`,
the `DateTimePicker` makes an attempt to parse it based on the
locale settings.

##### Responsive behavior

The `DateTimePicker` is responsive and fully adapts to all devices.
For larger screens, such as tablet or desktop, it is displayed as a popover, while
on phone devices, it is displayed full screen.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/DateTimePicker.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the input. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the aria-label attribute for the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `calendarWeekNumbering` | `` `${CalendarWeekNumbering}` `` | `"Default"` | Defines how to calculate calendar weeks and first day of the week.<br>If not set, the calendar will be displayed according to the currently set global configuration. |
| `dateValue` | `Date \| null` | `null` | Currently selected date represented as a Local JavaScript Date instance.<br>Note: this getter can only be reliably used after the component is fully defined. Use dateValueAsync which resolves only when this condition is met.<br>**Deprecated:** Use dateValueAsync instead |
| `dateValueAsync` | `Promise<Date \| null>` | `Promise` | Promise that resolves to the currently selected date represented as a Local JavaScript Date instance. |
| `disabled` | `boolean` | `false` | Determines whether the component is displayed as disabled. |
| `displayFormat` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field. |
| `formatPattern` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field.<br>**Deprecated:** Use displayFormat and valueFormat instead |
| `hideWeekNumbers` | `boolean` | `false` | Defines the visibility of the week numbers column.<br><br>**Note:** For calendars other than Gregorian,<br>the week numbers are not displayed regardless of what is set. |
| `maxDate` | `string` | `""` | Determines the maximum date available for selection.<br><br>**Note:** If the formatPattern property is not set, the maxDate value must be provided in the ISO date format (yyyy-MM-dd). |
| `minDate` | `string` | `""` | Determines the minimum date available for selection.<br><br>**Note:** If the formatPattern property is not set, the minDate value must be provided in the ISO date format (yyyy-MM-dd). |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `open` | `boolean` | `false` | Defines the open or closed state of the popover. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint, intended to aid the user with data entry when the<br>component has no value.<br><br>**Note:** When no placeholder is set, the format pattern is displayed as a placeholder.<br>Passing an empty string as the value of this property will make the component appear empty - without placeholder or format pattern. |
| `primaryCalendarType` | `` `${CalendarType}` \| undefined `` | `undefined` | Sets a calendar type used for display.<br>If not set, the calendar type of the global configuration is used. |
| `readonly` | `boolean` | `false` | Determines whether the component is displayed as read-only. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `secondaryCalendarType` | `` `${CalendarType}` \| undefined `` | `undefined` | Defines the secondary calendar type.<br>If not set, the calendar will only show the primary calendar type. |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the input will be shown. |
| `value` | `string` | `""` | Defines a formatted date value. |
| `valueFormat` | `string \| undefined` | `undefined` | Determines the format, used for the value attribute. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent<DatePickerChangeEventDetail>` | true | true | Fired when the input operation has finished by pressing Enter or on focusout. |
| `close` | `CustomEvent` | false | false | Fired after the component's picker is closed. |
| `input` | `CustomEvent<DatePickerInputEventDetail>` | true | true | Fired when the value of the component is changed at each key stroke. |
| `open` | `CustomEvent` | false | false | Fired after the component's picker is opened. |
| `value-state-change` | `CustomEvent<DatePickerValueStateChangeEventDetail>` | true | true | Fired before the value state of the component is updated internally.<br>The event is preventable, meaning that if it's default action is<br>prevented, the component will not update the value state. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `formatValue` | `formatValue(date: Date): string;` | Formats a Java Script date object into a string representing a locale date<br>according to the `formatPattern` property of the DatePicker instance |
| `isInValidRange` | `isInValidRange(value: string): boolean;` | Checks if a date is between the minimum and maximum date. |
| `isValid` | `isValid(value: string): boolean;` | Checks if a value is valid against the current date format of the DatePicker. |
| `isValidDisplayValue` | `isValidDisplayValue(value: string): boolean;` | Checks if a value is valid against the current date format of the DatePicker. |
| `isValidValue` | `isValidValue(value: string): boolean;` | Checks if a value is valid against the current date format of the DatePicker. |

#### CSS parts

- `input`: Used to style the input element. This part is forwarded to the underlying ui5-input element.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/Basic/main.js).
- [Min and Max Dates](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/MinMax/sample.tsx) — Define min and max date-time boundaries to constrain user choice.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/MinMax/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/MinMax/main.js).
- [Timezones](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/DateTimePickerInDifferentTimezone/sample.tsx) — You can set to the configuration the preferred time zone.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/DateTimePickerInDifferentTimezone/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/DateTimePickerInDifferentTimezone/main.js).
- [CustomFormatting](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/CustomFormatting/sample.tsx) — You can have custom formatting for the display value and the value property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/CustomFormatting/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/CustomFormatting/main.js).
- [Clear Icon](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/ClearIcon/sample.tsx) — This sample demonstrates the component with the `show-clear-icon` property enabled.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/ClearIcon/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DateTimePicker/ClearIcon/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `change`, `close`, `input`, `open`, `value-state-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- CSS custom states

### [Dialog](https://ui5.github.io/webcomponents/components/Dialog/)

- Tag: `ui5-dialog`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Dialog.d.ts).
- Local implementation: `src/components/dialog` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-dialog` component is used to temporarily display some information in a
size-limited window in front of the regular app screen.
It is used to prompt the user for an action or a confirmation.
The `ui5-dialog` interrupts the current app processing as it is the only focused UI element and
the main screen is dimmed/blocked.
The dialog combines concepts known from other technologies where the windows have
names such as dialog box, dialog window, pop-up, pop-up window, alert box, or message box.

The `ui5-dialog` is modal, which means that a user action is required before it is possible to return to the parent window.
To open multiple dialogs, each dialog element should be separate in the markup. This will ensure the correct modal behavior. Avoid nesting dialogs within each other.
The content of the `ui5-dialog` is fully customizable.

##### Structure
A `ui5-dialog` consists of a header, content, and a footer for action buttons.
The `ui5-dialog` is usually displayed at the center of the screen.
Its position can be changed by the user. To enable this, you need to set the property `draggable` accordingly.


##### Responsive Behavior
The `stretch` property can be used to stretch the `ui5-dialog` to full screen. For better usability, it's recommended to stretch the dialog to full screen on phone devices.

**Note:** When a `ui5-bar` is used in the header or in the footer, you should remove the default dialog's paddings.

For more information see the sample "Bar in Header/Footer".

##### Keyboard Handling

##### Basic Navigation
When the `ui5-dialog` has the `draggable` property set to `true`, the user can move the dialog
with the following keyboard shortcuts:

- [Up] or [Down] arrow keys - Move the dialog up/down.
- [Left] or [Right] arrow keys - Move the dialog left/right.

##### Resizing
When the `ui5-dialog` has the `resizable` property set to `true`, the user can change the size of the dialog
with the following keyboard shortcuts:

- [Shift] + [Up] or [Down] - Decrease/Increase the height of the dialog.
- [Shift] + [Left] or [Right] - Decrease/Increase the width of the dialog.

##### Fullscreen
When the `ui5-dialog` has the `showFullscreenButton` property set to `true`, the user can toggle fullscreen mode
with the following keyboard shortcut:

- [Shift] + [Ctrl] + [F] - Toggle fullscreen mode.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Dialog";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that label the component. |
| `accessibleRole` | `` `${PopupAccessibleRole}` `` | `"Dialog"` | Allows setting a custom role. |
| `draggable` | `boolean` | `false` | Determines whether the component is draggable.<br>If this property is set to true, the Dialog will be draggable by its header.<br><br>**Note:** The component can be draggable only in desktop mode.<br><br>**Note:** This property overrides the default HTML "draggable" attribute native behavior.<br>When "draggable" is set to true, the native browser "draggable"<br>behavior is prevented and only the Dialog custom logic ("draggable by its header") works. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text.<br><br>**Note:** If `header` slot is provided, the `headerText` is ignored. |
| `initialFocus` | `string \| undefined` | `undefined` | Defines the ID of the HTML Element, which will get the initial focus.<br><br>**Note:** If an element with `autofocus` attribute is added inside the component,<br>`initialFocus` won't take effect. |
| `open` | `boolean` | `false` | Indicates if the element is open |
| `preventFocusRestore` | `boolean` | `false` | Defines if the focus should be returned to the previously focused element,<br>when the popup closes. |
| `preventInitialFocus` | `boolean` | `false` | Indicates whether initial focus should be prevented. |
| `resizable` | `boolean` | `false` | Configures the component to be resizable.<br>If this property is set to true, the Dialog will have a resize handle in its bottom right corner in LTR languages.<br>In RTL languages, the resize handle will be placed in the bottom left corner.<br><br>**Note:** The component can be resizable only in desktop mode.<br><br>**Note:** Upon resizing, externally defined height and width styling will be ignored. |
| `showFullscreenButton` | `boolean` | `false` | Defines whether a fullscreen toggle button is shown in the dialog header.<br>When pressed, it toggles the `stretch` property.<br>The fullscreen button is not available on phone devices.<br><br>**Note:** The fullscreen button is not available on phone devices,<br>nor when a custom header slot is provided — the application is expected<br>to render its own toggle inside the custom header in those cases. |
| `state` | `` `${ValueState}` `` | `"None"` | Defines the state of the `Dialog`.<br><br>**Note:** If `"Negative"` and `"Critical"` states is set, it will change the<br>accessibility role to "alertdialog", if the accessibleRole property is set to `"Dialog"`. |
| `stretch` | `boolean` | `false` | Determines if the dialog will be stretched to full screen on mobile. On desktop,<br>the dialog will be stretched to approximately 90% of the viewport.<br><br>**Note:** For better usability of the component it is recommended to set this property to "true" when the dialog is opened on phone. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the Popup. |
| `footer` | `Slot<HTMLElement>` | Defines the footer HTML Element. |
| `header` | `Slot<HTMLElement>` | Defines the header HTML Element.<br><br>**Note:** If `header` slot is provided, the labelling of the dialog is a responsibility of the application developer.<br>`accessibleName` should be used. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `before-close` | `CustomEvent<PopupBeforeCloseEventDetail>` | false | true | Fired before the component is closed. This event can be cancelled, which will prevent the popup from closing. |
| `before-open` | `CustomEvent` | false | true | Fired before the component is opened. This event can be cancelled, which will prevent the popup from opening. |
| `close` | `CustomEvent` | false | false | Fired after the component is closed. |
| `open` | `CustomEvent` | false | false | Fired after the component is opened. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `applyFocus` | `applyFocus(): Promise<void>;` | Focuses the element denoted by `initialFocus`, if provided,<br>or the first focusable element otherwise. |

#### CSS parts

- `content`: Used to style the content of the component
- `footer`: Used to style the footer of the component
- `header`: Used to style the header of the component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/Basic/main.js).
- [Draggable and Resizable](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/DraggableAndResizable/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/DraggableAndResizable/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/DraggableAndResizable/main.js).
- [Fullscreen](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/Fullscreen/sample.tsx) — Users can toggle between standard and full screen size. The full screen button is positioned top-right in the dialog's title bar.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/Fullscreen/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/Fullscreen/main.js).
- [Usage of Bar as header/footer](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/BarInDialog/sample.tsx) — The Bar component can be used as header and/or footer of the Dialog.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/BarInDialog/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/BarInDialog/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/WithState/sample.tsx) — The Dialog supports "Positive", "Critical", "Negative" and "None" states via the "state" property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/WithState/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Dialog/WithState/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `before-close`, `before-open`, `close`, `open` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/dialog` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- CSS custom states

### [DynamicDateRange](https://ui5.github.io/webcomponents/components/DynamicDateRange/)

- Tag: `ui5-dynamic-date-range`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/DynamicDateRange.d.ts).
- Local implementation: `src/components/dynamic-date-range` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-dynamic-date-range` component provides a flexible interface to define date ranges using a combination of absolute dates, relative intervals, and preset ranges (e.g., "Today", "Yesterday", etc.).
It allows users to select a date range from a predefined set of options or enter custom dates.

##### Usage

The component is typically used in scenarios where users need to filter data based on date ranges, such as in reports, dashboards, or data analysis tools.
It can be used with the predefined options or extended with custom options to suit specific requirements. You can create your own options by extending the `IDynamicDateRangeOption` interface.
Every option should be registered using the `DynamicDateRange.register` method.

If needed, you can also create a range of dates based on specific option using the `toDates` method.

##### Standard Options

The component comes with a set of standard options, including:
- "TODAY" - Represents the current date. An example value is `{ operator: "TODAY"}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/Today.js";`
- "YESTERDAY" - Represents the previous date. An example value is `{ operator: "YESTERDAY"}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/Yesterday.js";`
- "TOMORROW" - Represents the next date. An example value is `{ operator: "TOMORROW"}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/Tomorrow.js";`
- "DATE" - Represents a single date. An example value is `{ operator: "DATE", values: [new Date()]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/SingleDate.js";`
- "DATERANGE" - Represents a range of dates. An example value is `{ operator: "DATERANGE", values: [new Date(), new Date()]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/DateRange.js";`
- "DATETIMERANGE" - Represents a range of dates with times. An example value is `{ operator: "DATETIMERANGE", values: [new Date(), new Date()]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/DateTimeRange.js";`
- "FROMDATETIME" - Represents a range from date and time. An example value is `{ operator: "FROMDATETIME", values: [new Date()]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/FromDateTime.js";`
- "TODATETIME" - Represents a range to date and time. An example value is `{ operator: "TODATETIME", values: [new Date()]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/ToDateTime.js";`
- "LASTDAYS" - Represents Last X Days from today. An example value is `{ operator: "LASTDAYS", values: [2]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/LastOptions.js";`
- "LASTWEEKS" - Represents Last X Weeks from today. An example value is `{ operator: "LASTWEEKS", values: [3]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/LastOptions.js";`
- "LASTMONTHS" - Represents Last X Months from today. An example value is `{ operator: "LASTMONTHS", values: [6]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/LastOptions.js";`
- "LASTQUARTERS" - Represents Last X Quarters from today. An example value is `{ operator: "LASTQUARTERS", values: [2]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/LastOptions.js";`
- "LASTYEARS" - Represents Last X Years from today. An example value is `{ operator: "LASTYEARS", values: [1]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/LastOptions.js";`
- "NEXTDAYS" - Represents Next X Days from today. An example value is `{ operator: "NEXTDAYS", values: [2]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/NextOptions.js";`
- "NEXTWEEKS" - Represents Next X Weeks from today. An example value is `{ operator: "NEXTWEEKS", values: [3]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/NextOptions.js";`
- "NEXTMONTHS" - Represents Next X Months from today. An example value is `{ operator: "NEXTMONTHS", values: [6]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/NextOptions.js";`
- "NEXTQUARTERS" - Represents Next X Quarters from today. An example value is `{ operator: "NEXTQUARTERS", values: [2]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/NextOptions.js";`
- "NEXTYEARS" - Represents Next X Years from today. An example value is `{ operator: "NEXTYEARS", values: [1]}`. Import: `import "@ui5/webcomponents/dist/dynamic-date-range-options/NextOptions.js";`

##### ES6 Module Import

`import "@ui5/webcomponents/dist/DynamicDateRange.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `options` | `string` | `""` | Defines the options listed as a string, separated by commas and using capital case.<br>Example: "TODAY, YESTERDAY, DATERANGE" |
| `value` | `DynamicDateRangeValue \| undefined` | `undefined` | Defines the value object. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | true | Fired when the input operation has finished by pressing Enter or on focusout or a value is selected in the popover. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `toDates` | `toDates(value: DynamicDateRangeValue): Array<Date>;` | Converts a `value` into concrete `startDate` and `endDate` JavaScript `Date` objects. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DynamicDateRange/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DynamicDateRange/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DynamicDateRange/Basic/main.js).
- [DynamicDateRangeValueSample](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DynamicDateRange/DynamicDateRangeValueSample/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DynamicDateRange/DynamicDateRangeValueSample/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/DynamicDateRange/DynamicDateRangeValueSample/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleNameRef`, `options`, `value`.
- [ ] Verify `change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- CSS parts
- CSS custom states

### [ExpandableText](https://ui5.github.io/webcomponents/components/ExpandableText/)

- Tag: `ui5-expandable-text`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ExpandableText.d.ts).
- Local implementation: `src/components/expandable-text` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The `ui5-expandable-text` component allows displaying a large body of text in a small space. It provides an "expand/collapse" functionality, which shows/hides potentially truncated text.

##### Usage

##### When to use:
- To accommodate long texts in limited space, for example in list items, table cell texts, or forms

##### When not to use:
- The content is critical for the user. In this case use short descriptions that can fit in
- Strive to provide short and meaningful texts to avoid excessive number of "Show More" links on the page

##### Responsive Behavior

On phones, if the component is configured to display the full text in a popover, the popover will appear in full screen.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/ExpandableText";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `emptyIndicatorMode` | `` `${TextEmptyIndicatorMode}` `` | `"Off"` | Specifies if an empty indicator should be displayed when there is no text. |
| `maxCharacters` | `number` | `100` | Maximum number of characters to be displayed initially. If the text length exceeds this limit, the text will be truncated with an ellipsis, and the "More" link will be displayed. |
| `overflowMode` | `` `${ExpandableTextOverflowMode}` `` | `"InPlace"` | Determines how the full text will be displayed. |
| `text` | `string \| undefined` | `undefined` | Text of the component. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ExpandableText/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ExpandableText/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ExpandableText/Basic/main.js).
- [Overflow Mode Popover](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ExpandableText/OverflowModePopover/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ExpandableText/OverflowModePopover/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ExpandableText/OverflowModePopover/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `emptyIndicatorMode`, `maxCharacters`, `overflowMode`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states

### [FileUploader](https://ui5.github.io/webcomponents/components/FileUploader/)

- Tag: `ui5-file-uploader`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/FileUploader.d.ts).
- Local implementation: `src/components/file-uploader` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-file-uploader` opens a file explorer dialog and enables users to upload files.
The component consists of input field, but you can provide an HTML element by your choice
to trigger the file upload, by using the default slot.
Furthermore, you can set the property "hideInput" to "true" to hide the input field.

To get all selected files, you can simply use the read-only "files" property.
To restrict the types of files the user can select, you can use the "accept" property.

And, similar to all input based components, the FileUploader supports "valueState", "placeholder", "name", and "disabled" properties.

For the `ui5-file-uploader`
##### ES6 Module Import

`import "@ui5/webcomponents/dist/FileUploader.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accept` | `string \| undefined` | `undefined` | Comma-separated list of file types that the component should accept.<br><br>**Note:** Please make sure you are adding the `.` in front on the file type, e.g. `.png` in case you want to accept png's only. |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the input. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the input. |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state.<br><br>**Note:** A disabled component is completely noninteractive. |
| `files` | `FileList \| null` | `null` | FileList of all selected files. |
| `hideInput` | `boolean` | `false` | If set to "true", the input field of component will not be rendered. Only the default slot that is passed will be rendered.<br><br>**Note:** Use this property in combination with the default slot to achieve a button-only file uploader design. |
| `maxFileSize` | `number \| undefined` | `undefined` | Defines the maximum file size in megabytes which prevents the upload if at least one file exceeds it. |
| `multiple` | `boolean` | `false` | Allows multiple files to be chosen. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the component has no value. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `value` | `string` | `""` | Defines the name/names of the file/files to upload. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | This slot allows you to add custom content to the component, such as a button or any other interactive element to trigger the file selection dialog.<br><br>**Note:** For best accessibility experience, set a `tabindex` of "-1" on your interactive element, or it will be set automatically.<br>This slot is intended for use cases where you want a button-only file uploader.<br>It is recommended to set `hideInput` property to "true" when using this slot.<br>Not setting `hideInput` may negatively impact the screen reader users. |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent<FileUploaderChangeEventDetail>` | true | false | Event is fired when the value of the file path has been changed.<br><br>**Note:** Keep in mind that because of the HTML input element of type file, the event is also fired in Chrome browser when the Cancel button of the uploads window is pressed. |
| `file-size-exceed` | `CustomEvent<FileUploaderFileSizeExceedEventDetail>` | true | false | Event is fired when the size of a file is above the `maxFileSize` property value. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/Basic/main.js).
- [Upload Multiple Files](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/MultipleFiles/sample.tsx) — By default, only one file can be selected. To allow multiple files to be uploaded - set the `multiple` property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/MultipleFiles/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/MultipleFiles/main.js).
- [Files Filter](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/FilesFilter/sample.tsx) — You can define the files allowed for uploading via the `accept` property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/FilesFilter/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/FilesFilter/main.js).
- [File Size Upload Limit](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/FileSizeLimit/sample.tsx) — You can define the maximum file size the uploader will accept.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/FileSizeLimit/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/FileSizeLimit/main.js).
- [Button Only](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/WithoutInput/sample.tsx) — You can hide the input part via the `hide-input` property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/WithoutInput/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/FileUploader/WithoutInput/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accept`, `accessibleDescription`, `accessibleDescriptionRef`.
- [ ] Verify `change`, `file-size-exceed` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/file-uploader` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [Form](https://ui5.github.io/webcomponents/components/Form/)

- Tag: `ui5-form`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Form.d.ts).
- Local implementation: `src/components/form` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The Form is a layout component that arranges labels and form fields (like input fields) pairs
into a specific number of columns.

**Note:** The Form web component is a layout component, it isn't a replacement for the native `form` HTML element.
The Form web component does not provide any APIs for form submission.

##### Structure

- **Form** (`ui5-form`) is the top-level container component, responsible for the content layout and responsiveness.
- **FormGroup** (`ui5-form-group`) enables the grouping of the Form content.
- **FormItem** (`ui5-form-item`) is a pair of label and form fields and can be used directly in a Form, or as part of a FormGroup.

The simplest Form (`ui5-form`) consists of a header area on top,
displaying a header text (see the `headingText` property) and content below - an arbitrary number of FormItems (ui5-form-item),
representing the pairs of label and form fields.

And, there is also "grouping" available to assist the implementation of richer UIs.
This is enabled by the FormGroup (`ui5-form-group`) component.
In this case, the Form is structured into FormGroups and each FormGroup consists of FormItems.

##### Responsiveness

The Form component reacts and changes its layout on predefined breakpoints.
Depending on its size, the Form content (FormGroups and FormItems) gets divided into one or more columns as follows:
- **S** (0 - 599px) – 1 column is recommended (default: 1)
- **M** (600px - 1023px) – up to 2 columns are recommended (default: 1)
- **L** (1024px - 1439px) - up to 3 columns are recommended (default: 2)
- **XL** (>= 1440px) – up to 6 columns are recommended (default: 3)

To change the layout, use the `layout` property - f.e. layout="S1 M2 L3 XL6".

##### Groups

To make better use of screen space, there is built-in logic to determine how many columns should a FormGroup occupy.

- **Example #1** (perfect match):
4 columns and 4 groups: each group will use 1 column.

- **Example #2** (balanced distribution):
4 columns and 2 groups: each group will use 2 columns.
6 columns and 2 groups: each group will use 3 columns.

- **Example #3** (unbalanced distribution):
3 columns and 2 groups: the larger one will use 2 columns, the smaller 1 column.
5 columns and 3 groups: two of the groups will use 2 columns each, the smallest 1 column.

**Note:** The size of a group element is determined by the number of FormItems assigned to it.
In the case of equality, the first in the DOM will use more columns, and the last - fewer columns.

- **Example #4** (more groups than columns):
3 columns and 4 groups: each FormGroup uses only 1 column, the last FormGroup will wrap on the second row.

##### Groups Column Span

To influence the built-in group distribution, described in the previous section,
you can use the FormGroup's `columnSpan` property, that defines how many columns the group should expand to.

##### Items Column Span

FormItem's columnSpan property defines how many columns the form item should expand to inside a form group or the form.

##### Items Label Span

The placement of the labels depends on the size of the used column.
If there is enough space, the labels are next to their associated fields, otherwise  - above the fields.
By default, the labels take 4/12 of the FormItem, leaving 8/12 parts to associated fields.
You can control what space the labels should take via the `labelSpan` property.

**For example:** To always place the labels on top set: `labelSpan="S12 M12 L12 XL12"` property.

##### Items Empty Span

By default, a form item spans 12 cells, fully divided between its label and field, with no empty space at the end:
- **Label:** occupies 4 cells.
- **Field:** occupies 8 cells.

The `emptySpan` property provides additional layout flexibility by defining empty space at the form item’s end.

**For example:** Setting "S0 M0 L3 XL3" (or just "L3 XL3") adjusts the layout as follows:
- **Label:** remains 4 cells.
- **Field:** is reduced to 5 cells.
- **Empty space:** 3 cells are added at the end.

Greater values increase the empty space at the end of the form item, reducing the space available for the label and its field.
However, setting `emptySpan` to 1 cell is recommended and typically sufficient to achieve a balanced layout.

##### Navigation flow

Items are grouped into `ui5-form-group` elements, allowing the following navigation:

- **Single-Column Group**: Focus moves vertically down from one item to the next.
  ```
  | 1 |
  | 2 |
  | 3 |
  ```

- **Multi-Column Group**: Focus moves horizontally within each row, advancing to the next row after completing the current one.
  ```
  | 1 | 4 |
  | 2 | 5 |
  | 3 | 6 |
  ```

##### Keyboard Handling

- [Tab] - Moves the focus to the next interactive element within the Form/FormGroup (if available) or to the next element in the tab chain outside the Form
- [Shift] + [Tab] - Moves the focus to the previous interactive element within the Form/FormGroup (if available) or to the previous element in the tab chain outside the Form
- [F6] - Moves the focus to the first interactive element of the next FormGroup (if available) or to the next element in the tab chain outside the Form
- [Shift] + [F6] - Moves the focus to the first interactive element of the previous FormGroup (if available) or to the previous element in the tab chain outside the Form

##### ES6 Module Import

- import @ui5/webcomponents/dist/Form.js";
- import @ui5/webcomponents/dist/FormGroup.js";
- import @ui5/webcomponents/dist/FormItem.js";

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleMode` | `` `${FormAccessibleMode}` `` | `"Display"` | Defines the accessibility mode of the component in "edit" and "display" use-cases.<br><br>Based on the mode, the component renders different HTML elements and ARIA attributes,<br>which are appropriate for the use-case.<br><br>**Usage:**<br>- Set this property to "Display", when the form consists of non-editable (e.g. texts) form items.<br>- Set this property to "Edit", when the form consists of editable (e.g. input fields) form items. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines id (or many ids) of the element (or elements) that label the component. |
| `emptySpan` | `string` | `"S0 M0 L0 XL0"` | Defines the number of cells that are empty at the end of each form item, configurable by breakpoint.<br><br>By default, a form item spans 12 cells, fully divided between its label (4 cells) and field (8 cells), with no empty space at the end.<br>The `emptySpan` provides additional layout flexibility by defining empty space at the form item’s end.<br><br>**Note:**<br>- The maximum allowable empty space is 10 cells. At least 1 cell each must remain for the label and the field.<br>- When `emptySpan` is specified (greater than 0), ensure that the combined value of `emptySpan` and `labelSpan` does not exceed 11. This guarantees a minimum of 1 cell for the field. |
| `headerLevel` | `` `${TitleLevel}` `` | `"H2"` | Defines the compoennt heading level,<br>set by the `headerText`. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text of the component.<br><br>**Note:** The property gets overridden by the `header` slot. |
| `itemSpacing` | `` `${FormItemSpacing}` `` | `"Normal"` | Defines the vertical spacing between form items.<br><br>**Note:** If the Form is meant to be switched between "display"("non-edit") and "edit" modes,<br>we recommend using "Large" item spacing in "display"("non-edit") mode, and "Normal" - for "edit" mode,<br>to avoid "jumping" effect, caused by the hight difference between texts in "display"("non-edit") mode and the input fields in "edit" mode. |
| `labelSpan` | `string` | `"S12 M4 L4 XL4"` | Defines the width proportion of the labels and fields of a form item by breakpoint.<br><br>By default, the labels take 4/12 (or 1/3) of the form item in M,L and XL sizes,<br>and 12/12 in S size, e.g in S the label is on top of its associated field.<br><br>The supported values are between 1 and 12. Greater the number, more space the label will use.<br><br>**Note:** If "12" is set, the label will be displayed on top of its assosiated field. |
| `layout` | `string` | `"S1 M1 L2 XL3"` | Defines the number of columns to distribute the form content by breakpoint.<br><br>Supported values:<br>- `S` - 1 column by default (1 column is recommended)<br>- `M` - 1 column by default (up to 2 columns are recommended)<br>- `L` - 2 columns by default (up to 3 columns are recommended)<br>- `XL` - 3 columns by default (up to 6 columns  are recommended) |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IFormItem>` | Defines the component content - FormGroups or FormItems.<br><br>**Note:** Mixing FormGroups and standalone FormItems (not belonging to a group) is not supported.<br>Either use FormGroups and make sure all FormItems are part of a FormGroup, or use just FormItems without any FormGroups.<br><br>**Note:** As of version 2.23.0 the support for standalone FormItems (not belonging to a group) is deprecated.<br>We recommend using FormGroups, as they provide better accessibility and layout options. |
| `header` | `Slot<HTMLElement>` | Defines the component header area.<br><br>**Note:** When a `header` is provided, the `headerText` property is ignored. |

#### CSS parts

- `column`: Used to style a single column of the form column layout.
- `header`: Used to style the wrapper of the header.
- `layout`: Used to style the element defining the form column layout.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Basic/main.js).
- [Layout](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Layout/sample.tsx) — Use the Form `layout` property to define the number of columns to distribute the form content by breakpoint.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Layout/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Layout/main.js).
- [Groups](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Groups/sample.tsx) — You can define groups via the `ui5-form-group` web component.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Groups/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Groups/main.js).
- [Label Span](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/LabelSpan/sample.tsx) — Use the `labelSpan` property to define the width proportion of the labels and fields of a FormItem by breakpoint.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/LabelSpan/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/LabelSpan/main.js).
- [Empty Span](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/EmptySpan/sample.tsx) — Use the `emptySpan` property to define the empty space at the FormItem's end.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/EmptySpan/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/EmptySpan/main.js).
- [Labels On Top](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/LabelsOnTop/sample.tsx) — Force labels always on top with `Form#labelSpan=S12 M12 L12 XL12`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/LabelsOnTop/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/LabelsOnTop/main.js).
- [Edit](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Edit/sample.tsx) — The Form has no built-in functionality to transform texts into inputs to implement editable forms. This is delegated to the consumers as shown in the sample.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Edit/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/Edit/main.js).
- [Column Span](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/GroupColumnSpan/sample.tsx) — The `FormGroup#columnSpan` and `FormItem#columnSpan` properties define how many columns the form group or item should expand to.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/GroupColumnSpan/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/GroupColumnSpan/main.js).
- [Header Text Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/HeaderTextWrapping/sample.tsx) — The Form header text **is wrapping** when it doesn't fit the available space.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/HeaderTextWrapping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/HeaderTextWrapping/main.js).
- [Custom Header](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/CustomHeader/sample.tsx) — The Form provides a `header` slot that allows the usage of custom form header.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/CustomHeader/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/CustomHeader/main.js).
- [Freestyle Form](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/FreeStyleForm/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/FreeStyleForm/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Form/FreeStyleForm/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleMode`, `accessibleName`, `accessibleNameRef`.

#### Empty documentation fields

- Events
- Public methods
- CSS custom states

### [FormGroup](https://ui5.github.io/webcomponents/components/FormGroup/)

- Tag: `ui5-form-group`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/FormGroup.d.ts).
- Local implementation: `src/components/form-group` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The FormGroup (ui5-form-group) represents a group inside the Form (ui5-form) component
and it consists of FormItem (ui5-form-item) components.

The layout of the FormGroup is mostly defined and controlled by the overarching Form (ui5-form) component.
Still, one can influence the layout via the FormGroup's `columnSpan` property,
that defines how many columns the group should expand to.

##### Usage

Тhe FormGroup (ui5-form-group) allows to split a Form into groups,
e.g to group FormItems that logically belong together.

##### ES6 Module Import

- import @ui5/webcomponents/dist/FormGroup.js";

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines id (or many ids) of the element (or elements) that label the component. |
| `colSpan` | `string \| undefined` | `undefined` | Defines the number of columns to distribute the form content by breakpoint (S1 M2 L3 XL4 for example).<br><br>**Note:** This property is ignored if `columnSpan` is set, as it is expected that the column span is defined. |
| `columnSpan` | `number \| undefined` | `undefined` | Defines column span of the component,<br>e.g how many columns the group should span to.<br><br>**Note:** If this property is set, it has higher priority than `colSpan` and `colSpan` will be ignored. |
| `headerLevel` | `` `${TitleLevel}` `` | `"H3"` | Defines the compoennt heading level,<br>set by the `headerText`. |
| `headerText` | `string \| undefined` | `undefined` | Defines header text of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<FormItem>` | Defines the items of the component. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `colSpan`.
- [ ] Compare the existing `src/components/form-group` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [FormItem](https://ui5.github.io/webcomponents/components/FormItem/)

- Tag: `ui5-form-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/FormItem.d.ts).
- Local implementation: `src/components/form-item` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The FormItem (ui5-form-item) represents pair of a label and
one or more components (text or text fields), associated to it.

##### Usage

The FormItem is being used in FormGroup (ui5-form-group) or directly in Form (ui5-form).

##### ES6 Module Import

- import @ui5/webcomponents/dist/FormItem.js";

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `columnSpan` | `number \| undefined` | `undefined` | Defines the column span of the component,<br>e.g how many columns the component should span to.<br><br>**Note:** The column span should be a number between 1 and the available columns of the FormGroup (when items are placed in a group)<br>or the Form. The available columns can be affected by the FormGroup#columnSpan and/or the Form#layout.<br>A number bigger than the available columns won't take effect.<br>**Deprecated:** As of version 2.23.0, this property is deprecated.<br>**Note:** This property will not have any effect on the layout of the form item |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the component,<br>associated to `labelContent`. |
| `labelContent` | `Slot<HTMLElement>` | Defines the label of the component. |

#### CSS parts

- `content`: Used to style the content part of the form item.
- `label`: Used to style the label part of the form item.
- `layout`: Used to style the parent element of the label and content parts.

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `columnSpan`.

#### Empty documentation fields

- Events
- Public methods
- CSS custom states
- Samples

### [Icon](https://ui5.github.io/webcomponents/components/Icon/)

- Tag: `ui5-icon`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Icon.d.ts).
- Local implementation: `src/components/icon` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The `ui5-icon` component represents an SVG icon.
There are two main scenarios how the `ui5-icon` component is used:
as a purely decorative element,
or as an interactive element that can be focused and clicked.

##### Usage

1. **Get familiar with the icons collections.**

Before displaying an icon, you need to explore the icons collections to find and import the desired icon.

Currently there are 3 icons collection, available as 3 npm packages:

- [@ui5/webcomponents-icons](https://www.npmjs.com/package/@ui5/webcomponents-icons) represents the "SAP-icons" collection and includes the following
[icons](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons).
- [@ui5/webcomponents-icons-tnt](https://www.npmjs.com/package/@ui5/webcomponents-icons-tnt) represents the "tnt" collection and includes the following
[icons](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons-TNT).
- [@ui5/webcomponents-icons-business-suite](https://www.npmjs.com/package/@ui5/webcomponents-icons-business-suite) represents the "business-suite" collection and includes the following
[icons](https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/BusinessSuiteInAppSymbols).

2. **After exploring the icons collections, add one or more of the packages as dependencies to your project.**

`npm i @ui5/webcomponents-icons`
`npm i @ui5/webcomponents-icons-tnt`
`npm i @ui5/webcomponents-icons-business-suite`

3. **Then, import the desired icon**.

`import "@ui5/\{package_name\}/dist/\{icon_name\}.js";`

**For Example**:

For the standard "SAP-icons" icon collection, import an icon from the `@ui5/webcomponents-icons` package:

`import "@ui5/webcomponents-icons/dist/employee.js";`

For the "tnt" (SAP Fiori Tools) icon collection, import an icon from the `@ui5/webcomponents-icons-tnt` package:

`import "@ui5/webcomponents-icons-tnt/dist/antenna.js";`

For the "business-suite" (SAP Business Suite) icon collection, import an icon from the `@ui5/webcomponents-icons-business-suite` package:

`import "@ui5/webcomponents-icons-business-suite/dist/ab-testing.js";`

4. **Display the icon using the `ui5-icon` web component.**
Set the icon collection ("SAP-icons", "tnt" or "business-suite" - "SAP-icons" is the default icon collection and can be skipped)
and the icon name to the `name` property.

`<ui5-icon name="employee"></ui5-icon>`
`<ui5-icon name="tnt/antenna"></ui5-icon>`
`<ui5-icon name="business-suite/ab-testing"></ui5-icon>`

##### Keyboard Handling

- [Space] / [Enter] or [Return] - Fires the `click` event if the `mode` property is set to `Interactive`.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Icon.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the text alternative of the component.<br>If not provided a default text alternative will be set, if present.<br><br>**Note:** Every icon should have a text alternative in order to<br>calculate its accessible name. |
| `design` | `` `${IconDesign}` `` | `"Default"` | Defines the component semantic design. |
| `mode` | `` `${IconMode}` `` | `"Decorative"` | Defines the mode of the component. |
| `name` | `string \| undefined` | `undefined` | Defines the unique identifier (icon name) of the component.<br><br>To browse all available icons, see the<br>[SAP Icons](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html),<br>[SAP Fiori Tools](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons-TNT) and<br>[SAP Business Suite](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html)<br><br>Example:<br>`name='add'`, `name='delete'`, `name='employee'`.<br><br>**Note:** To use the SAP Fiori Tools icons,<br>you need to set the `tnt` prefix in front of the icon's name.<br><br>Example:<br>`name='tnt/antenna'`, `name='tnt/actor'`, `name='tnt/api'`.<br><br>**Note:** To use the SAP Business Suite icons,<br>you need to set the `business-suite` prefix in front of the icon's name.<br><br>Example:<br>`name='business-suite/3d'`, `name='business-suite/1x2-grid-layout'`, `name='business-suite/4x4-grid-layout'`. |
| `showTooltip` | `boolean` | `false` | Defines whether the component should have a tooltip.<br><br>**Note:** The tooltip text should be provided via the `accessible-name` property. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `fontIcon` | `Slot<HTMLElement>` | Defines the font icon to be used as an icon.<br>Intended for font-based icon libraries where<br>the application loads the font and provides a slotted element with the unicode character.<br>When this slot is used, the component renders a `<span>` instead of an `<svg>`.<br>Accessibility is fully delegated to the application — set `accessible-name` and `mode` explicitly.<br><br>**Note:** To control the glyph size, set `font-size` on the `ui5-icon` host element.<br><br>**Example:**<br>```html<br><ui5-icon mode="Image" accessible-name="Home"><br>  <i class="fa fa-home" slot="fontIcon"></i><br></ui5-icon><br>``` |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | true | false | Fired when the component is activated by mouse/touch, keyboard (Enter or Space),<br>or screen reader virtual cursor activation.<br><br>**Note:** The event will not be fired if the `mode` property is set to `Decorative` or `Image`. |

#### CSS parts

- `root`: Used to style the outermost wrapper of the `ui5-icon`.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/Basic/main.js).
- [Design](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/Design/sample.tsx) — The Icon supports multiple designs.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/Design/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/Design/main.js).
- [Custom Styling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/CustomStyling/sample.tsx) — The Icon allows style customization via pure CSS, applied on the tag.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/CustomStyling/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/CustomStyling/main.js).
- [Interactive](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/Interactive/sample.tsx) — The Icon can be interactive - clickable and focusable.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/Interactive/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/Interactive/main.js).
- [SAP Fiori Tools Icons](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/TntIcons/sample.tsx) — The SAP Fiori Tools Icons are available in the `@ui5/webcomponents-icons-tnt` package.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/TntIcons/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/TntIcons/main.js).
- [SAP Business Suite Icons](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/BSIcons/sample.tsx) — The SAP Business Suite Icons are available in the `@ui5/webcomponents-icons-business-suite` package.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/BSIcons/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Icon/BSIcons/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `design`, `mode`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states

### [Input](https://ui5.github.io/webcomponents/components/Input/)

- Tag: `ui5-input`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Input.d.ts).
- Local implementation: `src/components/input` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-input` component allows the user to enter and edit text or numeric values in one line.

Additionally, you can provide `suggestionItems`
that are displayed in a popover right under the input. Keep in mind that `ui5-input` with type `Number` does not support suggestions.

The text field can be editable or read-only (`readonly` property),
and it can be enabled or disabled (`disabled` property).
To visualize semantic states, such as "Negative" or "Critical", the `valueState` property is provided.
When the user makes changes to the text, the change event is fired,
which enables you to react on any text change.

##### Keyboard Handling
The `ui5-input` provides the following keyboard shortcuts:

- [Escape] - Closes the suggestion list, if open. If closed or not enabled, cancels changes and reverts to the value which the Input field had when it got the focus.
- [Enter] or [Return] - If suggestion list is open takes over the current matching item and closes it. If value state or group header is focused, does nothing.
- [Down] - Focuses the next matching item in the suggestion list. Selection-change event is fired.
- [Up] - Focuses the previous matching item in the suggestion list. Selection-change event is fired.
- [Home] - If focus is in the text input, moves caret before the first character. If focus is in the list, highlights the first item and updates the input accordingly.
- [End] - If focus is in the text input, moves caret after the last character. If focus is in the list, highlights the last item and updates the input accordingly.
- [Page Up] - If focus is in the list, moves highlight up by page size (10 items by default). If focus is in the input, does nothing.
- [Page Down] - If focus is in the list, moves highlight down by page size (10 items by default). If focus is in the input, does nothing.
- [Ctrl]+[Alt]+[F8] or [Command]+[Option]+[F8] - Focuses the first link in the value state message, if available. Pressing [Tab] moves the focus to the next link in the value state message, or closes the value state message if there are no more links.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Input.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
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
| `default` | `DefaultSlot<IInputSuggestionItem>` | Defines the suggestion items.<br><br>**Note:** The suggestions would be displayed only if the `showSuggestions`<br>property is set to `true`.<br><br>**Note:** The `<ui5-suggestion-item>`, `<ui5-suggestion-item-group>` and `ui5-suggestion-item-custom` are recommended to be used as suggestion items.<br><br>**Note:** Input with type `Number` does not support suggestions. |
| `icon` | `Slot<IIcon>` | Defines the icon to be displayed in the component. |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br>The value state message slot should contain only one root element.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state.<br><br>**Note:** If the component has `suggestionItems`,<br>the `valueStateMessage` would be displayed as part of the same popover, if used on desktop, or dialog - on phone. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
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

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/Basic/main.js).
- [Clear Icon](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/ClearIcon/sample.tsx) — The Input can show a clear icon, visible when there is a value typed by the user.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/ClearIcon/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/ClearIcon/main.js).
- [Interactive Icons](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/InteractiveIcons/sample.tsx) — The Input can display interactive icons that users can click. Use the `ui5-input-icon` component for interactive icons with hover, focus, and active states.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/InteractiveIcons/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/InteractiveIcons/main.js).
- [Input with Suggestions](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/Suggestions/sample.tsx) — The Input can show a dropdown with suggestions upon user input - see the `showSuggestions` property for more information.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/Suggestions/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/Suggestions/main.js).
- [Suggestions Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/SuggestionsWrapping/sample.tsx) — The sample demonstrates how the text of the suggestions wrap when too long.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/SuggestionsWrapping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/SuggestionsWrapping/main.js).
- [Dynamic Suggestion Control](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/DynamicSuggestions/sample.tsx) — This sample demonstrates how applications can control when suggestions appear by dynamically toggling the `showSuggestions` property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/DynamicSuggestions/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/DynamicSuggestions/main.js).
- [Input and Label](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/Label/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/Label/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/Label/main.js).
- [Value State Message](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/ValueStateMessage/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/ValueStateMessage/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/ValueStateMessage/main.js).
- [Value-help Dialog](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/ValueHelpDialog/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/ValueHelpDialog/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/ValueHelpDialog/main.js).
- [Custom Suggestions](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/CustomSuggestions/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/CustomSuggestions/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/CustomSuggestions/main.js).
- [Custom Styling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/CustomStyling/sample.tsx) — To some extent, the Input allows customization with pure CSS as shown in the sample.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/CustomStyling/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/CustomStyling/main.js).
- [Built-in Filtering](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/BuiltInFiltering/sample.tsx) — This input has built-in filtering of type Contains.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/BuiltInFiltering/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Input/BuiltInFiltering/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `change`, `close`, `input`, `open`, `select`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/input` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [InputIcon](https://ui5.github.io/webcomponents/components/InputIcon/)

- Tag: `ui5-input-icon`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/InputIcon.d.ts).
- Local implementation: `src/components/input-icon` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview
The `ui5-input-icon` component represents an interactive icon that can be placed inside an `ui5-input` component.
Unlike the standard `ui5-icon`, this component provides button-like behavior with hover, focus, and active states,
matching the visual style of the input's built-in clear icon.

##### Usage
Use `ui5-input-icon` for interactive icons that users can click (e.g., search, voice input, camera).
For decorative icons, use the standard `ui5-icon` component instead.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/InputIcon.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the icon.<br><br>**Note:** This property is used for accessibility purposes and will be announced by screen readers.<br>When set, it is also rendered as a native `title` tooltip, unless `hideTooltip` is set. |
| `name` | `string \| undefined` | `undefined` | Defines the icon name to be displayed.<br><br>**Note:** Make sure you import the desired icon before using it. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | true | false | Fired when the `ui5-input-icon` is activated either with a click/tap or by using the Enter or Space key. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `name`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [Label](https://ui5.github.io/webcomponents/components/Label/)

- Tag: `ui5-label`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Label.d.ts).
- Local implementation: `src/components/label` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The `ui5-label` is a component used to represent a label for elements like input, textarea, select.
The `for` property of the `ui5-label` must be the same as the id attribute of the related input element.
Screen readers read out the label, when the user focuses the labelled control.

The `ui5-label` appearance can be influenced by properties,
such as `required` and `wrappingType`.
The appearance of the Label can be configured in a limited way by using the design property.
For a broader choice of designs, you can use custom styles.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Label";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `for` | `string \| undefined` | `undefined` | Defines the labeled input by providing its ID.<br><br>**Note:** Can be used with both `ui5-input` and native input. |
| `required` | `boolean` | `false` | Defines whether an asterisk character is added to the component text.<br><br>**Note:** Usually indicates that user input (bound with the `for` property) is required.<br>In that case the `required` property of<br>the corresponding input should also be set. |
| `showColon` | `boolean` | `false` | Defines whether colon is added to the component text.<br><br>**Note:** Usually used in forms. |
| `wrappingType` | `` `${WrappingType}` `` | `"Normal"` | Defines how the text of a component will be displayed when there is not enough space.<br><br>**Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/Basic/main.js).
- [Text Truncation and Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/TextWrapping/sample.tsx) — The `ui5-label` wraps by default. To truncate it - set `wrapping-type="None"`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/TextWrapping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/TextWrapping/main.js).
- [Label with Input](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/UsageWithInputs/sample.tsx) — The labels `for`, `required` and `showColon` properties can be used to reference inputs.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/UsageWithInputs/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/UsageWithInputs/main.js).
- [Custom Styling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/CustomStyling/sample.tsx) — The labels can be customized with pure CSS, applied on the tag.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/CustomStyling/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Label/CustomStyling/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `for`, `required`, `showColon`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states

### [Link](https://ui5.github.io/webcomponents/components/Link/)

- Tag: `ui5-link`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Link.d.ts).
- Local implementation: `src/components/link` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview
The `ui5-link` is a hyperlink component that is used to navigate to other
apps and web pages, or to trigger actions.
It is a clickable text element, visualized in such a way that it stands out
from the standard text.
On hover, it changes its style to an underlined text to provide additional feedback to the user.

##### Usage

You can set the `ui5-link` to be enabled or disabled.

To create a visual hierarchy in large lists of links, you can set the less important links as
`Subtle` or the more important ones as `Emphasized`,
by using the `design` property.

If the `href` property is set, the link behaves as the HTML
anchor tag (`<a></a>`) and opens the specified URL in the given target frame (`target` property).
To specify where the linked content is opened, you can use the `target` property.

##### Navigation vs. Action

The `ui5-link` supports two distinct use cases. Choosing the right one is important for accessibility:

- **Navigation**: set the `href` property (and optionally `target`). The component behaves as a
standard anchor tag, and the browser handles navigation, which also enables native
affordances such as open-in-new-tab, copy link, and hover preview.
- **Action**: when the link triggers an in-page action (for example, opening a dialog) instead of
navigating, leave `href` unset and set `accessibleRole` to `"Button"`. This exposes the component
with a `button` role, which assistive technologies activate reliably.

**Note:** A link that triggers an action but keeps the default `"Link"` role (with no `href`) cannot be
activated by some screen readers, such as JAWS in browse mode, because a link without `href` has
no destination to navigate to. Always set `accessibleRole="Button"` for action-only links.

##### Responsive behavior

If there is not enough space, the text of the `ui5-link` becomes truncated.
If the `wrappingType` property is set to `"Normal"`, the text is displayed
on several lines instead of being truncated.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Link";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `LinkAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.<br>Accepts the following string values: `true` or `false`.<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.<br>Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`. |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the input |
| `accessibleRole` | `` `${LinkAccessibleRole}` `` | `"Link"` | Defines the ARIA role of the component.<br><br>**Note:** Set the role to <code>LinkAccessibleRole.Button</code> when the link triggers an action instead of navigating (when the <code>href</code> property is not defined). Otherwise, the component keeps the default <code>"Link"</code> role, and some screen readers (for example, JAWS in browse mode) cannot activate it, as a link with no <code>href</code> has no destination to navigate to. |
| `design` | `` `${LinkDesign}` `` | `"Default"` | Defines the component design.<br><br>**Note:** Avaialble options are `Default`, `Subtle`, and `Emphasized`. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br><br>**Note:** When disabled, the click event cannot be triggered by the user. |
| `endIcon` | `string \| undefined` | `undefined` | Defines the icon, displayed as graphical element within the component after the link's text.<br>The SAP-icons font provides numerous options.<br><br>**Note:** Usage of icon-only link is not supported, the link must always have a text.<br><br>**Note:** We recommend using аn icon in the beginning or the end only, and with text.<br><br>See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `href` | `string \| undefined` | `undefined` | Defines the component href.<br><br>**Note:** Standard hyperlink behavior is supported. |
| `icon` | `string \| undefined` | `undefined` | Defines the icon, displayed as graphical element within the component before the link's text.<br>The SAP-icons font provides numerous options.<br><br>**Note:** Usage of icon-only link is not supported, the link must always have a text.<br><br>**Note:** We recommend using аn icon in the beginning or the end only, and with text.<br><br>See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `interactiveAreaSize` | `` `${InteractiveAreaSize}` `` | `"Normal"` | Defines the target area size of the link:<br>- **InteractiveAreaSize.Normal**: The default target area size.<br>- **InteractiveAreaSize.Large**: The target area size is enlarged to 24px in height.<br><br>**Note:**The property is designed to make links easier to activate and helps meet the WCAG 2.2 Target Size requirement. It is applicable only for the SAP Horizon themes.<br>**Note:**To improve <code>ui5-link</code>'s reliability and usability, it is recommended to use the <code>InteractiveAreaSize.Large</code> value in scenarios where the <code>ui5-link</code> component is placed inside another interactive component, such as a list item or a table cell.<br>Setting the <code>interactiveAreaSize</code> property to <code>InteractiveAreaSize.Large</code> increases the <code>ui5-link</code>'s invisible touch area. As a result, the user's intended one-time selection command is more likely to activate the desired <code>ui5-link</code>, with minimal chance of unintentionally activating the underlying component. |
| `target` | `string \| undefined` | `undefined` | Defines the component target.<br><br>**Notes:**<br><br>- `_self`<br>- `_top`<br>- `_blank`<br>- `_parent`<br>- `_search`<br><br>**This property must only be used when the `href` property is set.** |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component. |
| `wrappingType` | `` `${WrappingType}` `` | `"Normal"` | Defines how the text of a component will be displayed when there is not enough space.<br><br>**Note:** By default the text will wrap. If "None" is set - the text will truncate. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<LinkClickEventDetail>` | true | true | Fired when the component is triggered either with a mouse/tap<br>or by using the Enter key. |

#### CSS parts

- `endIcon`: Used to style the provided endIcon within the link
- `icon`: Used to style the provided icon within the link

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/Basic/main.js).
- [Design](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/Design/sample.tsx) — The Link supports **Default**, **Subtle** and **Emphasized** designs.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/Design/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/Design/main.js).
- [Text Truncation and Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/TextWrapping/sample.tsx) — The `ui5-link` wraps by default. To truncate it - set `wrapping-type="None"`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/TextWrapping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/TextWrapping/main.js).
- [Custom Styling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/CustomStyling/sample.tsx) — The links can be customized with pure CSS, applied on the tag.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/CustomStyling/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/CustomStyling/main.js).
- [Icons](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/WithIcons/sample.tsx) — You can add icons to the Link.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/WithIcons/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Link/WithIcons/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleDescription`, `accessibleName`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states

### [List](https://ui5.github.io/webcomponents/components/List/)

- Tag: `ui5-list`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/List.d.ts).
- Local implementation: `src/components/list` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-list` component allows displaying a list of items, advanced keyboard
handling support for navigating between items, and predefined modes to improve the development efficiency.

The `ui5-list` is a container for the available list items:

- `ui5-li`
- `ui5-li-custom`
- `ui5-li-group`

To benefit from the built-in selection mechanism, you can use the available
selection modes, such as
`Single`, `Multiple` and `Delete`.

Additionally, the `ui5-list` provides header, footer, and customization for the list item separators.

##### Keyboard Handling

The `ui5-list` follows the SAP Fiori "Intentional Edit Pattern" (forms-editing variant)
and exposes two interaction modes:

- **Navigation mode** (default) - Arrow keys move focus between items; [Tab] leaves the list.
- **Edit mode** (toggled by [F2] or [F7]) - [Tab] walks through the interactive elements
  inside items (buttons, links, inputs, checkboxes, etc.) and continues into the next item.

##### Basic Navigation
The `ui5-list` provides advanced keyboard handling for navigation between items.
When an item is focused the user can use the following keyboard shortcuts:

- [Up] or [Down] - Navigates up and down the items
- [Home] - Navigates to first item
- [End] - Navigates to the last item
- [Tab] or [Shift] + [Tab] - Moves focus out of the list, to the next/previous control in the tab chain

The user can use the following keyboard shortcuts to perform actions (such as select, delete),
when the `selectionMode` property is in use:

- [Space] - Select an item (if `type` is 'Active') when `selectionMode` is selection
- [Delete] - Delete an item if `selectionMode` property is `Delete`

##### Edit Mode - Reaching Interactive Elements Inside Items
Interactive elements inside a list item (buttons, links, inputs, etc.) are not reached
by [Tab] from navigation mode. To activate them, the user first enters edit mode.

- [F2] - While focus is on an item, moves focus to the first interactive element inside it.
  While focus is on an interactive element, moves focus back to the item level.
  Unlike [F7], [F2] does not remember the previous position — it always lands on the first interactive element.
- [F7] - While focus is on an item, moves focus to the last remembered internal element
  (or to the first interactive element if none is remembered).
  While focus is on an interactive element, saves its position and moves focus back to the item level.
- [Tab] or [Shift] + [Tab] - While in edit mode, moves focus through the interactive
  elements within an item, then continues into the next/previous item's interactive elements,
  and exits the list after the last/first element.
- [Up] or [Down] - While focus is on an interactive element inside an item, moves focus
  to the element at the same index in the previous/next item. Items with no interactive
  elements are skipped, and boundaries of `ui5-li-group` are crossed.

**Note:** In `selectionMode="Delete"`, the per-item delete button is reachable through
the edit-mode [Tab] flow described above, in addition to the [Delete] shortcut.

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import

`import "@ui5/webcomponents/dist/List.js";`

`import "@ui5/webcomponents/dist/ListItemStandard.js";` (for `ui5-li`)

`import "@ui5/webcomponents/dist/ListItemCustom.js";` (for `ui5-li-custom`)

`import "@ui5/webcomponents/dist/ListItemGroup.js";` (for `ui5-li-group`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `ListAccessibilityAttributes` | `{}` | Defines additional accessibility attributes on different areas of the component.<br><br>The accessibilityAttributes object has the following field:<br><br> - **growingButton**: `growingButton.name`, `growingButton.description`.<br><br> The accessibility attributes support the following values:<br><br>- **name**: Defines the accessible ARIA name of the growing button.<br>Accepts any string.<br><br>- **description**: Defines the accessible ARIA description of the growing button.<br>Accepts any string.<br><br> **Note:** The `accessibilityAttributes` property is in an experimental state and is a subject to change. |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that describe the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that label the component. |
| `accessibleRole` | `` `${ListAccessibleRole}` `` | `"List"` | Defines the accessible role of the component. |
| `footerText` | `string \| undefined` | `undefined` | Defines the footer text. |
| `growing` | `` `${ListGrowingMode}` `` | `"None"` | Defines whether the component will have growing capability either by pressing a `More` button,<br>or via user scroll. In both cases `load-more` event is fired.<br><br>**Restrictions:** `growing="Scroll"` is not supported for Internet Explorer,<br>on IE the component will fallback to `growing="Button"`. |
| `growingButtonText` | `string \| undefined` | `undefined` | Defines the text that will be displayed inside the growing button.<br><br>**Note:** If not specified a built-in text will be displayed.<br><br>**Note:** This property takes effect if the `growing` property is set to the `Button`. |
| `headerText` | `string \| undefined` | `undefined` | Defines the component header text.<br><br>**Note:** If `header` is set this property is ignored. |
| `indent` | `boolean` | `false` | Determines whether the component is indented. |
| `listItems` | `ListItemBase[]` | `[]` | Returns an array containing the list item instances without the groups in a flat structure. |
| `loading` | `boolean` | `false` | Defines if the component would display a loading indicator over the list. |
| `loadingDelay` | `number` | `1000` | Defines the delay in milliseconds, after which the loading indicator will show up for this component. |
| `noDataText` | `string \| undefined` | `undefined` | Defines the text that is displayed when the component contains no items. |
| `selectionMode` | `` `${ListSelectionMode}` `` | `"None"` | Defines the selection mode of the component. |
| `separators` | `` `${ListSeparator}` `` | `"All"` | Defines the item separator style that is used. |
| `stickyHeader` | `boolean` | `false` | Indicates whether the List header is sticky or not.<br>If stickyHeader is set to true, then whenever you scroll the content or<br>the application, the header of the list will be always visible. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ListItemBase \| ListItemGroup>` | Defines the items of the component.<br><br>**Note:** Use `ui5-li`, `ui5-li-custom`, and `ui5-li-group` for the intended design. |
| `header` | `Slot<HTMLElement>` | Defines the component header.<br><br>**Note:** When `header` is set, the<br>`headerText` property is ignored. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `item-click` | `CustomEvent<ListItemClickEventDetail>` | true | true | Fired when an item is activated, unless the item's `type` property<br>is set to `Inactive`.<br><br>**Note**: This event is not triggered by interactions with selection components such as the checkboxes and radio buttons,<br>associated with non-default `selectionMode` values, or if any other **interactive** component<br>(such as a button or input) within the list item is directly clicked. |
| `item-close` | `CustomEvent<ListItemCloseEventDetail>` | true | false | Fired when the `Close` button of any item is clicked<br><br>**Note:** This event is only applicable to list items that can be closed (such as notification list items),<br>not to be confused with `item-delete`. |
| `item-delete` | `CustomEvent<ListItemDeleteEventDetail>` | true | false | Fired when the Delete button of any item is pressed.<br><br>**Note:** A Delete button is displayed on each item,<br>when the component `selectionMode` property is set to `Delete`. |
| `item-toggle` | `CustomEvent<ListItemToggleEventDetail>` | true | false | Fired when the `Toggle` button of any item is clicked.<br><br>**Note:** This event is only applicable to list items that can be toggled (such as notification group list items). |
| `load-more` | `CustomEvent` | true | false | Fired when the user scrolls to the bottom of the list.<br><br>**Note:** The event is fired when the `growing='Scroll'` property is enabled. |
| `move` | `CustomEvent<ListMoveEventDetail>` | true | false | Fired when a movable list item is dropped onto a drop target.<br><br>**Note:** `move` event is fired only if there was a preceding `move-over` with prevented default action. |
| `move-over` | `CustomEvent<ListMoveEventDetail>` | true | true | Fired when a movable list item is moved over a potential drop target during a dragging operation.<br><br>If the new position is valid, prevent the default action of the event using `preventDefault()`. |
| `selection-change` | `CustomEvent<ListSelectionChangeEventDetail>` | true | true | Fired when selection is changed by user interaction<br>in `Single`, `SingleStart`, `SingleEnd` and `Multiple` selection modes. |

#### CSS parts

- `growing-button`: Used to style the button, that is used for growing of the component
- `growing-button-inner`: Used to style the button inner element

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/Basic/main.js).
- [Growing On Scroll](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/Growing/sample.tsx) — The List fires a `load-more` event when the user scrolls to the bottom. The event can be used for loading more data (items) as shown in the sample.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/Growing/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/Growing/main.js).
- [Growing On Button Press](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/GrowingOnButtonPress/sample.tsx) — The List fires a `load-more` event when the user clicks to the "Load More" button at the bottom.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/GrowingOnButtonPress/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/GrowingOnButtonPress/main.js).
- [Selection Modes](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/Modes/sample.tsx) — The List supports several selection modes: **None**, **Single**, **SingleStart**, **SingleEnd**, **SingleAuto**, **Multiple** and **Delete**.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/Modes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/Modes/main.js).
- [No data](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/NoData/sample.tsx) — You can show a text when there aren't items (data) via the `noDataText` property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/NoData/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/NoData/main.js).
- [Grouping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/GroupHeaders/sample.tsx) — The `ListItemGroup` can be used to start a group section and implement grouping.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/GroupHeaders/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/GroupHeaders/main.js).
- [Styling Group Headers](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/GroupHeaderStyling/sample.tsx) — You can customize the appearance of group headers using CSS Shadow Parts.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/GroupHeaderStyling/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/GroupHeaderStyling/main.js).
- [Separators](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/SeparationTypes/sample.tsx) — The `separators` options (**All**, **Inner**, **None**) allows the outer lines (Inner) or all the lines (None) to be hidden.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/SeparationTypes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/SeparationTypes/main.js).
- [Drag And Drop](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/DragAndDrop/sample.tsx) — The list items are draggable through the use of the `movable` property on `ListItem`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/DragAndDrop/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/DragAndDrop/main.js).
- [Multiple Item Drag](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/MultipleDrag/sample.tsx) — You can select and drag multiple items at once when using `selection-mode="Multiple"`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/MultipleDrag/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/MultipleDrag/main.js).
- [Wrapping Behavior](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/WrappingBehavior/sample.tsx) — The standard list item and the list item group support text wrapping through the `wrappingType` property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/WrappingBehavior/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/WrappingBehavior/main.js).
- [Sticky Header](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/StickyHeader/sample.tsx) — Use the `stickyHeader` property to keep the header visible during scrolling.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/StickyHeader/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/StickyHeader/main.js).
- [Accessible Role](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/AccessibleRole/sample.tsx) — Use the `accessibleRole` property on `ui5-list` to set the ARIA role of the list element.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/AccessibleRole/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/AccessibleRole/main.js).
- [Keyboard Handling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/KeyboardHandling/sample.tsx) — The `ui5-list` implements the SAP Fiori **Intentional Edit Pattern**. Interactive elements inside a list item are not reached by Tab from outside the list.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/KeyboardHandling/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/List/KeyboardHandling/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleDescription`, `accessibleDescriptionRef`.
- [ ] Verify `item-click`, `item-close`, `item-delete`, `item-toggle`, `load-more`, `move`, `move-over`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/list` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [ListItemCustom](https://ui5.github.io/webcomponents/components/ListItemCustom/)

- Tag: `ui5-li-custom`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ListItemCustom.d.ts).
- Local implementation: covered by `List` items (`leading`/`trailing`/`meta`) (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

A component to be used as custom list item within the `ui5-list`
the same way as the standard `ui5-li`.

The component accepts arbitrary HTML content to allow full customization.

##### Keyboard Handling

Interactive elements placed in the default slot (buttons, links, inputs, etc.)
are **not** reached by [Tab] from outside the list. This follows the SAP Fiori
"Intentional Edit Pattern" and preserves fast keyboard navigation between items.

To activate an interactive element inside a `ui5-li-custom`:

- [F2] on the focused item - moves focus to the first interactive element inside the item.
  Pressing [F2] again returns focus to the item level.
- [F7] on the focused item - moves focus to the last remembered interactive element
  inside the item (or to the first interactive element if none is remembered).
  Pressing [F7] again saves the current position and returns focus to the item level.
- [Tab] or [Shift] + [Tab] then walks through the interactive elements within the item
  and continues into the next/previous item.
- [Up] or [Down] while focused on an interactive element moves focus to the element
  at the same index in the previous/next item; items with no interactive elements
  are skipped and `ui5-li-group` boundaries are crossed.

See the `ui5-list` "Keyboard Handling" section for the full behavior.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
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
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `accessibleRole`.
- [ ] Verify `click`, `detail-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [ListItemGroup](https://ui5.github.io/webcomponents/components/ListItemGroup/)

- Tag: `ui5-li-group`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ListItemGroup.d.ts).
- Local implementation: covered by `List` `header` / multiple lists (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-li-group` is a special list item, used only to create groups of list items.

This is the item to use inside a `ui5-list`.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/ListItemGroup.js";`

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

### [ListItemStandard](https://ui5.github.io/webcomponents/components/ListItemStandard/)

- Tag: `ui5-li`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ListItemStandard.d.ts).
- Local implementation: covered by `List` `items` (`ListItemData`) (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-li` represents the simplest type of item for a `ui5-list`.

This is a list item,
providing the most common use cases such as `text`,
`image` and `icon`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `ListItemAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **ariaSetsize**: Defines the number of items in the current set  when not all items in the set are present in the DOM.<br>**Note:** The value is an integer reflecting the number of items in the complete set. If the size of the entire set is unknown, set `-1`.<br><br>	- **ariaPosinset**: Defines an element's number or position in the current set when not all items are present in the DOM.<br>	**Note:** The value is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the text alternative of the component.<br>Note: If not provided a default text alternative will be set, if present. |
| `accessibleRole` | `` `${ListItemAccessibleRole}` \| undefined `` | `undefined` | Used to define the role of the list item.<br><br>**Note:** If not set, the role is automatically inherited from the parent `ui5-list` based on its `accessible-role` property<br>(e.g. `Menu` -> `MenuItem`, `Tree` -> `TreeItem`, `ListBox` -> `Option`).<br>An explicitly set `accessible-role` on the list item takes precedence over the inherited role. |
| `additionalText` | `string \| undefined` | `undefined` | Defines the `additionalText`, displayed in the end of the list item. |
| `additionalTextState` | `` `${ValueState}` `` | `"None"` | Defines the state of the `additionalText`.<br><br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `description` | `string \| undefined` | `undefined` | Defines the description displayed right under the item text, if such is present. |
| `highlight` | `` `${Highlight}` `` | `"None"` | Defines the highlight state of the list items.<br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `icon` | `string \| undefined` | `undefined` | Defines the `icon` source URI.<br><br>**Note:**<br>SAP-icons font provides numerous built-in icons. To find all the available icons, see the<br>[Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `iconEnd` | `boolean` | `false` | Defines whether the `icon` should be displayed in the beginning of the list item or in the end. |
| `movable` | `boolean` | `false` | Defines whether the item is movable. |
| `navigated` | `boolean` | `false` | The navigated state of the list item.<br>If set to `true`, a navigation indicator is displayed at the end of the list item. |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the component. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the text of the tooltip that would be displayed for the list item. |
| `type` | `` `${ListItemType}` `` | `"Active"` | Defines the visual indication and behavior of the list items.<br>Available options are `Active` (by default), `Inactive`, `InactiveSelectable`, `Detail` and `Navigation`.<br><br>**Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,<br>while with type `Inactive`, `InactiveSelectable` and `Detail` - will not.<br><br>**Note:** `InactiveSelectable` behaves like `Inactive` (no active press/hover feedback and the<br>`item-click` event is not fired), but the item can still be selected. Clicking the item body,<br>pressing Space/Enter, or interacting with the selection component (checkbox in Multi mode, radio<br>button in Single modes) toggles the selection when the list has a selection mode. |
| `wrappingType` | `` `${WrappingType}` `` | `"None"` | Defines if the text of the component should wrap when it's too long.<br>When set to "Normal", the content (title, description) will be wrapped<br>using the `ui5-expandable-text` component.<br/><br><br>The text can wrap up to 100 characters on small screens (size S) and<br>up to 300 characters on larger screens (size M and above). When text exceeds<br>these limits, it truncates with an ellipsis followed by a text expansion trigger.<br><br>Available options are:<br>- `None` (default) - The text will truncate with an ellipsis.<br>- `Normal` - The text will wrap (without truncation). |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the custom formatted text of the component.<br><br>**Note:** For optimal text wrapping and a consistent layout, it is strongly recommended to use the `text` property.<br><br>Use the `default` slot only when custom formatting with HTML elements (e.g., `<b>`, `<i>`) is required.<br>Be aware that wrapping (via `wrappingType="Normal"`) may not function correctly with custom HTML content in the `default` slot.<br><br>If both `text` and `default` slot are used, the `text` property takes precedence. |
| `deleteButton` | `Slot<IButton>` | Defines the delete button, displayed in "Delete" mode.<br>**Note:** While the slot allows custom buttons, to match<br>design guidelines, please use the `ui5-button` component.<br>**Note:** When the slot is not present, a built-in delete button will be displayed. |
| `image` | `Slot<HTMLElement>` | **Note:** While the slot allows option for setting custom avatar, to match the<br>design guidelines, please use the `ui5-avatar` with it's default size - S.<br><br>**Note:** If bigger `ui5-avatar` needs to be used, then the size of the<br>`ui5-li` should be customized in order to fit. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |
| `detail-click` | `CustomEvent` | true | false | Fired when the user clicks on the detail button when type is `Detail`. |

#### CSS parts

- `additional-text`: Used to style the additionalText of the list item
- `checkbox`: Used to style the checkbox rendered when the list item is in multiple selection mode
- `content`: Used to style the content area of the list item
- `delete-button`: Used to style the button rendered when the list item is in delete mode
- `description`: Used to style the description of the list item
- `detail-button`: Used to style the button rendered when the list item is of type detail
- `icon`: Used to style the icon of the list item
- `native-li`: Used to style the main li tag of the list item
- `radio`: Used to style the radio button rendered when the list item is in single selection mode
- `title`: Used to style the title of the list item

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `accessibleRole`.
- [ ] Verify `click`, `detail-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states
- Samples

### [Menu](https://ui5.github.io/webcomponents/components/Menu/)

- Tag: `ui5-menu`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Menu.d.ts).
- Local implementation: `src/components/menu` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

`ui5-menu` component represents a hierarchical menu structure.

##### Structure

The `ui5-menu` can hold two types of entities:

- `ui5-menu-item` components
- `ui5-menu-separator` - used to separate menu items with a line

An arbitrary hierarchy structure can be represented by recursively nesting menu items.

##### Keyboard Handling

The `ui5-menu` provides advanced keyboard handling.
The user can use the following keyboard shortcuts in order to navigate trough the tree:

- `Arrow Up` / `Arrow Down` - Navigates up and down the menu items that are currently visible.
- `Arrow Right`, `Space` or `Enter` - Opens a sub-menu if there are menu items nested
in the currently clicked menu item.
- `Arrow Left` or `Escape` - Closes the currently opened sub-menu.

when there is `endContent` :
- `Arrow Left` or `ArrowRight` - Navigate between the menu item actions and the menu item itself
- `Arrow Up` / `Arrow Down` - Navigates up and down the currently visible menu items

**Note:** If the text direction is set to Right-to-left (RTL), `Arrow Right` and `Arrow Left` functionality is swapped.

Application developers are responsible for ensuring that interactive elements placed in the `endContent` slot
have the correct accessibility behaviour, including their enabled or disabled states.
The menu does not manage these aspects when the menu item state changes.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Menu.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text of the menu (displayed on mobile). |
| `horizontalAlign` | `` `${PopoverHorizontalAlign}` `` | `"Start"` | Determines the horizontal alignment of the menu relative to its opener control. |
| `loading` | `boolean` | `false` | Defines if a loading indicator would be displayed inside the corresponding ui5-menu popover. |
| `loadingDelay` | `number` | `1000` | Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding ui5-menu popover. |
| `open` | `boolean` | `false` | Indicates if the menu is open. |
| `opener` | `HTMLElement \| string \| null \| undefined` | `undefined` | Defines the ID or DOM Reference of the element at which the menu is shown.<br>When using this attribute in a declarative way, you must only use the `id` (as a string) of the element at which you want to show the popover.<br>You can only set the `opener` attribute to a DOM Reference when using JavaScript. |
| `placement` | `` `${PopoverPlacement}` `` | `"Bottom"` | Determines on which side the component is placed at. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IMenuItem>` | Defines the items of this component.<br><br>**Note:** Use `ui5-menu-item` and `ui5-menu-separator` for their intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `before-close` | `CustomEvent<MenuBeforeCloseEventDetail>` | true | true | Fired before the menu is closed. This event can be cancelled, which will prevent the menu from closing. |
| `before-open` | `CustomEvent<MenuBeforeOpenEventDetail>` | true | true | Fired before the menu is opened. This event can be cancelled, which will prevent the menu from opening.<br><br>**Note:** Since 1.14.0 the event is also fired before a sub-menu opens. |
| `close` | `CustomEvent` | false | false | Fired after the menu is closed. |
| `item-click` | `CustomEvent<MenuItemClickEventDetail>` | false | true | Fired when an item is being clicked.<br><br>**Note:** Since 1.17.0 the event is preventable, allowing the menu to remain open after an item is pressed. |
| `open` | `CustomEvent` | true | false | Fired after the menu is opened. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/Basic/main.js).
- [Sub-menu](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/SubMenu/sample.tsx) — You can nest menu items to create sub menus.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/SubMenu/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/SubMenu/main.js).
- [Menu Item with Additional Text](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/AditionalText/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/AditionalText/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/AditionalText/main.js).
- [Menu Item with End Content](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/MenuEndContent/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/MenuEndContent/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/MenuEndContent/main.js).
- [Handling focus behaviour when adding items dynamically](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/DynamicallyAddedItems/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/DynamicallyAddedItems/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/DynamicallyAddedItems/main.js).
- [Item Groups with Checkable Menu Items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/ItemGroups/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/ItemGroups/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Menu/ItemGroups/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `headerText`, `horizontalAlign`, `loading`.
- [ ] Verify `before-close`, `before-open`, `close`, `item-click`, `open` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/menu` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [MenuItem](https://ui5.github.io/webcomponents/components/MenuItem/)

- Tag: `ui5-menu-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/MenuItem.d.ts).
- Local implementation: covered by `Menu` `items` (`MenuItemDef`) (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

`ui5-menu-item` is the item to use inside a `ui5-menu`.
An arbitrary hierarchy structure can be represented by recursively nesting menu items.

##### Usage

`ui5-menu-item` represents a node in a `ui5-menu`. The menu itself is rendered as a list,
and each `ui5-menu-item` is represented by a list item in that list. Therefore, you should only use
`ui5-menu-item` directly in your apps. The `ui5-li` list item is internal for the list, and not intended for public use.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/MenuItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
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
| `default` | `DefaultSlot<IMenuItem>` | Defines the items of this component.<br><br>**Note:** The slot can hold menu item and menu separator items.<br><br>If there are items added to this slot, an arrow will be displayed at the end<br>of the item in order to indicate that there are items added. In that case components added<br>to `endContent` slot or `additionalText` content will not be displayed.<br><br>The priority of what will be displayed at the end of the menu item is as follows:<br>sub-menu arrow (if there are items added in `items` slot) -> components added in `endContent` -> text set to `additionalText`. |
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
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `accessibleRole`.
- [ ] Verify `before-close`, `before-open`, `check`, `click`, `close`, `detail-click`, `open` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [MenuItemGroup](https://ui5.github.io/webcomponents/components/MenuItemGroup/)

- Tag: `ui5-menu-item-group`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/MenuItemGroup.d.ts).
- Local implementation: covered by `Menu` `{ type: 'label' }` entries (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-menu-item-group` component represents a group of items designed for use inside a `ui5-menu`.
Items belonging to the same group should be wrapped by a `ui5-menu-item-group`.
Each group can have an `checkMode` property, which defines the check mode for the items within the group.
The possible values for `checkMode` are:
- 'None' (default) - no items can be checked
- 'Single' - Only one item can be checked at a time
- 'Multiple' - Multiple items can be checked simultaneously

**Note:** If the `checkMode` property is set to 'Single', only one item can remain checked at any given time.
If multiple items are marked as checked, the last checked item will take precedence.

##### Usage

`ui5-menu-item-group` represents a collection of `ui5-menu-item` components that can have the same check mode.
The items are addeed to the group's `items` slot.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/MenuItemGroup.js";`

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

### [MenuSeparator](https://ui5.github.io/webcomponents/components/MenuSeparator/)

- Tag: `ui5-menu-separator`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/MenuSeparator.d.ts).
- Local implementation: covered by `Menu` `{ type: 'separator' }` entries (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-menu-separator` represents a horizontal line to separate menu items inside a `ui5-menu`.

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

### [MessageStrip](https://ui5.github.io/webcomponents/components/MessageStrip/)

- Tag: `ui5-message-strip`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/MessageStrip.d.ts).
- Local implementation: `src/components/message-strip` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The ui5-message-strip component allows for the embedding of application-related messages.
It supports four semantic designs, each with its own color and icon: "Information", "Positive", "Critical", and "Negative".
Additionally, users can choose from two color sets ("ColorSet1" and "ColorSet2"), each containing 10 predefined color schemes.
Each message shows a "Close" button, so that it can be removed from the UI, if needed.

##### Usage

For the `ui5-message-strip` component, you can define whether it displays
an icon in the beginning and a close button. Moreover, its size and background
can be controlled with CSS.

##### Keyboard Handling

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import

`import "@ui5/webcomponents/dist/MessageStrip.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `colorScheme` | `string` | `"1"` | Defines the color scheme of the component.<br>There are 10 predefined schemes.<br>To use one you can set a number from `"1"` to `"10"`. The `colorScheme` `"1"` will be set by default. |
| `design` | `` `${MessageStripDesign}` `` | `"Information"` | Defines the component type. |
| `hideCloseButton` | `boolean` | `false` | Defines whether the MessageStrip renders close button. |
| `hideIcon` | `boolean` | `false` | Defines whether the MessageStrip will show an icon in the beginning.<br>You can directly provide an icon with the `icon` slot. Otherwise, the default icon for the type will be used.<br><br> * **Note:** If <code>MessageStripDesign.ColorSet1</code> or <code>MessageStripDesign.ColorSet2</code> value is set to the <code>design</code> property, default icon will not be presented. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |
| `icon` | `Slot<IIcon>` | Defines the content to be displayed as graphical element within the component.<br><br>**Note:** If no icon is given, the default icon for the component type will be used.<br>The SAP-icons font provides numerous options.<br><br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `close` | `CustomEvent` | false | false | Fired when the close button is pressed either with a<br>click/tap or by using the Enter or Space key. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/Basic/main.js).
- [Design](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/Design/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/Design/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/Design/main.js).
- [Hide Icon and Close Button](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/HideIconAndButton/sample.tsx) — Use `hideIcon` and `hideCloseButton` properties to hide some parts of the MessageStrip.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/HideIconAndButton/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/HideIconAndButton/main.js).
- [Custom Icon](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/Custom/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/Custom/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/Custom/main.js).
- [Custom visualisation](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/CustomColors/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/CustomColors/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MessageStrip/CustomColors/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `colorScheme`, `design`, `hideCloseButton`.
- [ ] Verify `close` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/message-strip` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [MultiComboBox](https://ui5.github.io/webcomponents/components/MultiComboBox/)

- Tag: `ui5-multi-combobox`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/MultiComboBox.d.ts).
- Local implementation: covered by `src/components/multi-select` (filterable multi-selection) (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-multi-combobox` component consists of a list box with items and a text field allowing the user to either type a value directly into the text field, or choose from the list of existing items.

The drop-down list is used for selecting and filtering values, it enables users to select one or more options from a predefined list. The control provides an editable input field to filter the list, and a dropdown arrow to expand/collapse the list of available options.
The options in the list have checkboxes that permit multi-selection. Entered values are displayed as tokens.
##### Structure
The `ui5-multi-combobox` consists of the following elements:

-  Tokenizer - a list of tokens with selected options.
-  Input field - displays the selected option/s as token/s. Users can type to filter the list.
-  Drop-down arrow - expands\collapses the option list.
-  Option list - the list of available options.

##### Keyboard Handling

The `ui5-multi-combobox` provides advanced keyboard handling.

##### Picker
If the `ui5-multi-combobox` is focused,
you can open or close the drop-down by pressing [F4], [Alt] + [Up] or [Alt] + [Down] keys.
Once the drop-down is opened, you can use the `UP` and `DOWN` arrow keys
to navigate through the available options and select one by pressing the `Space` or `Enter` keys.
[Ctrl]+[Alt]+[F8] or [Command]+[Option]+[F8] - Focuses the first link in the value state message, if available. Pressing [Tab] moves the focus to the next link in the value state message, or closes the value state message if there are no more links.

##### Tokens

-  Left/Right arrow keys - moves the focus selection form the currently focused token to the previous/next one (if available).
-  Delete -  deletes the token and focuses the previous token.
-  Backspace -  deletes the token and focus the next token.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/MultiComboBox.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state.<br><br>**Note:** A disabled component is completely noninteractive. |
| `filter` | `` `${ComboBoxFilter}` `` | `"StartsWithPerTerm"` | Defines the filter type of the component. |
| `loading` | `boolean` | `false` | Indicates whether a loading indicator should be shown in the picker. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element.<br>**Note:** When the component is used inside a form element,<br>the value is sent as the first element in the form data, even if it's empty. |
| `noTypeahead` | `boolean` | `false` | Defines whether the value will be autcompleted to match an item |
| `noValidation` | `boolean` | `false` | Defines if the user input will be prevented, if no matching item has been found |
| `open` | `boolean` | `false` | Indicates whether the items picker is open. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the<br>component has no value. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `selectedValues` | `Array<string>` | `[]` | Defines the values of the selected items.<br><br>Use this property to programmatically select items by their `value` property.<br>Each string in the array should match the `value` attribute of a `ui5-mcb-item`.<br><br>**Note:** If an item doesn't have a `value` attribute set, it cannot be selected via this property.<br><br>**Note:** The recommended approach is to set the `value` property on each `ui5-mcb-item`<br>and use `selectedValues` for programmatic selection. The `selected` property on items is<br>deprecated and should not be used together with `selectedValues`. |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the multi-combobox will be shown.<br><br>**Note:** The clear icon is only visible when there is text typed by the user<br>  and only clears the typed value, not the selected tokens. |
| `showSelectAll` | `boolean` | `false` | Determines if the select all checkbox is visible on top of suggestions. |
| `value` | `string` | `""` | Defines the value of the component.<br><br>**Note:** The property is updated upon typing. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IMultiComboBoxItem>` | Defines the component items. |
| `icon` | `Slot<IIcon>` | Defines the icon to be displayed in the component. |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br>The value state message slot should contain only one root element.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the input operation has finished by pressing Enter or on focusout. |
| `close` | `CustomEvent` | false | false | Fired when the dropdown is closed. |
| `input` | `CustomEvent` | true | false | Fired when the value of the component changes at each keystroke or clear icon is pressed. |
| `open` | `CustomEvent` | false | false | Fired when the dropdown is opened. |
| `selection-change` | `CustomEvent<MultiComboBoxSelectionChangeEventDetail>` | true | true | Fired when selection is changed by user interaction. |
| `value-state-change` | `CustomEvent<MultiComboBoxValueStateChangeEventDetail>` | true | true | Fired before the value state of the component is updated internally.<br>The event is preventable, meaning that if it's default action is<br>prevented, the component will not update the value state. |

#### CSS parts

- `token-\{index\}`: Used to style each token(where `token-0` corresponds to the first item)

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/Basic/main.js).
- [Programmatic Selection with selectedValues](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/SelectedValues/sample.tsx) — Use the `selectedValues` property to pre-select items by their `value` attribute.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/SelectedValues/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/SelectedValues/main.js).
- [Dynamic Selection Manipulation](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/SelectedValuesDynamic/sample.tsx) — The `selectedValues` property can be updated programmatically to change the selection.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/SelectedValuesDynamic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/SelectedValuesDynamic/main.js).
- [Clear Icon](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/ClearIcon/sample.tsx) — The MultiComboBox can show a clear icon, visible when there is a value typed by the user.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/ClearIcon/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/ClearIcon/main.js).
- [Custom values](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/MultiComboBoxCustomValue/sample.tsx) — Use `noValidation` to allow typing values that are not present as items.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/MultiComboBoxCustomValue/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/MultiComboBoxCustomValue/main.js).
- [Select All Items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/MultiComboBoxSelectAll/sample.tsx) — When `showSelectAll` is enabled, a "Select All" checkbox is displayed to allow users to select all items at once.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/MultiComboBoxSelectAll/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/MultiComboBoxSelectAll/main.js).
- [Items Grouping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/MultiComboBoxGrouping/sample.tsx) — The `ui5-mcb-item-group` can be used to implement grouping.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/MultiComboBoxGrouping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/MultiComboBoxGrouping/main.js).
- [Items Text Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/SuggestionsWrapping/sample.tsx) — The sample demonstrates how the text of the items wrap when too long.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/SuggestionsWrapping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/SuggestionsWrapping/main.js).
- [Custom Items with Rich Content](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/CustomItems/sample.tsx) — Use `ui5-mcb-item-custom` to create custom item templates with complex layouts, multiple icons, images, or any HTML content.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/CustomItems/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiComboBox/CustomItems/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `disabled`.
- [ ] Verify `change`, `close`, `input`, `open`, `selection-change`, `value-state-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states

### [MultiComboBoxItem](https://ui5.github.io/webcomponents/components/MultiComboBoxItem/)

- Tag: `ui5-mcb-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/MultiComboBoxItem.d.ts).
- Local implementation: covered by `MultiSelect` `options` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-mcb-item` represents the item for a `ui5-multi-combobox`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `additionalText` | `string \| undefined` | `undefined` | Defines the additional text of the component. |
| `selected` | `boolean` | `false` | Defines the selected state of the component.<br>**Deprecated:** Set the `value` property on items and use the `selectedValues` property on the parent `ui5-multi-combobox` instead for programmatic selection. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the component. |
| `value` | `string \| undefined` | `undefined` | Defines the value of the component.<br><br>Use this property to associate a unique identifier with the item,<br>separate from the display text. This enables selecting items<br>programmatically via `selectedValues` on the parent MultiComboBox. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `additionalText`, `selected`, `text`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [MultiComboBoxItemCustom](https://ui5.github.io/webcomponents/components/MultiComboBoxItemCustom/)

- Tag: `ui5-mcb-item-custom`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/MultiComboBoxItemCustom.d.ts).
- Local implementation: covered by `SelectOption` `description`/`icon` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-mcb-item-custom` is a multi-combobox item component
that allows placing custom content inside a multi-combobox item.
The `text` property is used for filtering and token display.
For highlighting functionality, see `@ui5/webcomponents-base/dist/util/generateHighlightedMarkup.js`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string \| undefined` | `undefined` | Defines the text of the component.<br>Used for filtering and token display. |
| `value` | `string \| undefined` | `undefined` | Defines the value of the component.<br>Used for programmatic selection via selectedValues property. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the content of the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<MultiComboBoxItemCustomClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `text`, `value`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [MultiComboBoxItemGroup](https://ui5.github.io/webcomponents/components/MultiComboBoxItemGroup/)

- Tag: `ui5-mcb-item-group`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/MultiComboBoxItemGroup.d.ts).
- Local implementation: covered by `SelectOption.group` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-mcb-item-group` is type of suggestion item,
that can be used to split the `ui5-multi-combobox` suggestions into groups.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `headerAccessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the header. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text of the group. |
| `wrappingType` | `` `${WrappingType}` `` | `"None"` | Defines if the text of the component should wrap when it's too long.<br>When set to "Normal", the content (title, description) will be wrapped<br>using the `ui5-expandable-text` component.<br/><br><br>The text can wrap up to 100 characters on small screens (size S) and<br>up to 300 characters on larger screens (size M and above). When text exceeds<br>these limits, it truncates with an ellipsis followed by a text expansion trigger.<br><br>Available options are:<br>- `None` (default) - The text will truncate with an ellipsis.<br>- `Normal` - The text will wrap (without truncation). |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<MultiComboBoxItem>` | Defines the items of the <code>ui5-mcb-item-group</code>. |
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

### [MultiInput](https://ui5.github.io/webcomponents/components/MultiInput/)

- Tag: `ui5-multi-input`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/MultiInput.d.ts).
- Local implementation: `src/components/multi-input` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
A `ui5-multi-input` field allows the user to enter multiple values, which are displayed as `ui5-token`.

User can choose interaction for creating tokens.
Fiori Guidelines say that user should create tokens when:

- Type a value in the input and press enter or focus out the input field (`change` event is fired)
- Move between suggestion items (`selection-change` event is fired)
- Clicking on a suggestion item (`selection-change` event is fired if the clicked item is different than the current value. Also `change` event is fired )

##### ES6 Module Import

`import "@ui5/webcomponents/dist/MultiInput.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the input. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the input. |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state.<br><br>**Note:** A disabled component is completely noninteractive. |
| `filter` | `` `${InputSuggestionsFilter}` `` | `"None"` | Defines the filter type of the component. |
| `maxlength` | `number \| undefined` | `undefined` | Sets the maximum number of characters available in the input field.<br><br>**Note:** This property is not compatible with the ui5-input type InputType.Number. If the ui5-input type is set to Number, the maxlength value is ignored. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element.<br>**Note:** When the component is used inside a form element,<br>the value is sent as the first element in the form data, even if it's empty. |
| `noTypeahead` | `boolean` | `false` | Defines whether the value will be autcompleted to match an item |
| `open` | `boolean` | `false` | Defines whether the suggestions picker is open.<br>The picker will not open if the `showSuggestions` property is set to `false`, the input is disabled or the input is readonly.<br>The picker will close automatically and `close` event will be fired if the input is not in the viewport. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint intended to aid the user with data entry when the<br>component has no value. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `showClearIcon` | `boolean` | `false` | Defines whether the clear icon of the input will be shown. |
| `showSuggestions` | `boolean` | `false` | Defines whether the component should show suggestions, if such are present. |
| `showValueHelpIcon` | `boolean` | `false` | Determines whether a value help icon will be visualized in the end of the input.<br>Pressing the icon will fire `value-help-trigger` event. |
| `type` | `` `${InputType}` `` | `"Text"` | Defines the HTML type of the component.<br><br>**Notes:**<br><br>- The particular effect of this property differs depending on the browser<br>and the current language settings, especially for type `Number`.<br>- The property is mostly intended to be used with touch devices<br>that use different soft keyboard layouts depending on the given input type.<br>- Type `Number` does not support suggestions. |
| `value` | `string` | `""` | Defines the value of the component.<br><br>**Note:** The property is updated upon typing. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IInputSuggestionItem>` | Defines the suggestion items.<br><br>**Note:** The suggestions would be displayed only if the `showSuggestions`<br>property is set to `true`.<br><br>**Note:** The `<ui5-suggestion-item>`, `<ui5-suggestion-item-group>` and `ui5-suggestion-item-custom` are recommended to be used as suggestion items.<br><br>**Note:** Input with type `Number` does not support suggestions. |
| `icon` | `Slot<IIcon>` | Defines the icon to be displayed in the component. |
| `tokens` | `Slot<IToken>` | Defines the component tokens. |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br>The value state message slot should contain only one root element.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state.<br><br>**Note:** If the component has `suggestionItems`,<br>the `valueStateMessage` would be displayed as part of the same popover, if used on desktop, or dialog - on phone. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the input operation has finished by pressing Enter or on focusout. |
| `close` | `CustomEvent` | false | false | Fired when the suggestions picker is closed. |
| `input` | `CustomEvent` | true | true | Fired when the value of the component changes at each keystroke,<br>and when a suggestion item has been selected. |
| `open` | `CustomEvent` | true | false | Fired when the suggestions picker is open. |
| `select` | `CustomEvent` | true | false | Fired when some text has been selected. |
| `selection-change` | `CustomEvent<InputSelectionChangeEventDetail>` | true | false | Fired when the user navigates to a suggestion item via the ARROW keys,<br>as a preview, before the final selection. |
| `token-delete` | `CustomEvent<MultiInputTokenDeleteEventDetail>` | true | false | Fired when tokens are being deleted. |
| `value-help-trigger` | `CustomEvent` | true | false | Fired when the value help icon is pressed<br>and F4 or ALT/OPTION + ARROW_UP/ARROW_DOWN keyboard keys are used. |

#### CSS parts

- `clear-icon`: Used to style the clear icon, which can be pressed to clear user input text
- `input`: Used to style the native input element
- `root`: Used to style the root DOM element of the Input component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiInput/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiInput/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiInput/Basic/main.js).
- [Add/Remove Tokens](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiInput/TokenCreation/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiInput/TokenCreation/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiInput/TokenCreation/main.js).
- [Items Text Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiInput/SuggestionsWrapping/sample.tsx) — The sample demonstrates how the text of the items wrap when too long.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiInput/SuggestionsWrapping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/MultiInput/SuggestionsWrapping/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `change`, `close`, `input`, `open`, `select`, `selection-change`, `token-delete`, `value-help-trigger` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states

### [NumericInput](https://ui5.github.io/webcomponents/components/NumericInput/)

- Tag: `ui5-numeric-input`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/NumericInput.d.ts).
- Local implementation: `src/components/number-input` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-numeric-input` component is a numeric input field. It allows users to enter, edit and select numeric values.

##### Usage

The default step is 1 but the app developer can set a different one.

App developers can set a maximum and minimum value for `ui5-numeric-input`.
The increase/decrease button and the up/down keyboard navigation become disabled when
the value reaches the max/min or a new value is entered from the input which is greater/less than the max/min.

##### When to use:

- To enter or adjust numeric values.
- To adjust values for a specific step.

##### When not to use:

- To enter a static number (for example, postal code, phone number, or ID). In this case,
use the regular `ui5-input` instead.
- To enter dates and times. In this case, use date/time related components instead.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/NumericInput.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives ID (or many IDs) of the elements that label the component. |
| `disabled` | `boolean` | `false` | Determines whether the component is displayed as disabled. |
| `max` | `number \| undefined` | `undefined` | Defines a maximum value of the component. |
| `min` | `number \| undefined` | `undefined` | Defines a minimum value of the component. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint, intended to aid the user with data entry when the<br>component has no value.<br><br>**Note:** When no placeholder is set, the format pattern is displayed as a placeholder.<br>Passing an empty string as the value of this property will make the component appear empty - without placeholder or format pattern. |
| `readonly` | `boolean` | `false` | Determines whether the component is displayed as read-only. |
| `step` | `number` | `1` | Defines a step of increasing/decreasing the value of the component. |
| `value` | `number` | `0` | Defines a value of the component. |
| `valuePrecision` | `number` | `0` | Determines the number of digits after the decimal point of the component. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the input operation has finished by pressing Enter or on focusout. |
| `input` | `CustomEvent` | true | true | Fired when the value of the component changes at each keystroke. |
| `value-state-change` | `CustomEvent<NumericInputValueStateChangeEventDetail>` | true | true | Fired before the value state of the component is updated internally.<br>The event is preventable, meaning that if its default action is<br>prevented, the component will not update the value state. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/Basic/main.js).
- [Min and Max](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/MinMax/sample.tsx) — Use the `min`, `max` and `step` properties to constrain the value and define the increment/decrement step.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/MinMax/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/MinMax/main.js).
- [Value Precision](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/ValuePrecision/sample.tsx) — Use the `value-precision` property to control the number of decimal places displayed.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/ValuePrecision/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/ValuePrecision/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/States/sample.tsx) — NumericInput supports disabled, readonly, and several semantic value states such as Positive, Negative, Critical and Information.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/States/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/NumericInput/States/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `disabled`.
- [ ] Verify `change`, `input`, `value-state-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/number-input` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [Option](https://ui5.github.io/webcomponents/components/Option/)

- Tag: `ui5-option`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Option.d.ts).
- Local implementation: covered by `Select` `options` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-option` component defines the content of an option in the `ui5-select`.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Option.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `additionalText` | `string \| undefined` | `undefined` | Defines the `additionalText`, displayed in the end of the option. |
| `icon` | `string \| undefined` | `undefined` | Defines the `icon` source URI.<br><br>**Note:**<br>SAP-icons font provides numerous built-in icons. To find all the available icons, see the<br>[Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `selected` | `boolean` | `false` | Defines the selected state of the component.<br>**Deprecated:** since 2.20.0, please use the parent Select's `value` property instead. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the option. |
| `value` | `string \| undefined` | `undefined` | Defines the value of the `ui5-select` inside an HTML Form element when this component is selected.<br>For more information on HTML Form support, see the `name` property of `ui5-select`. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `additionalText`, `icon`, `selected`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [OptionCustom](https://ui5.github.io/webcomponents/components/OptionCustom/)

- Tag: `ui5-option-custom`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/OptionCustom.d.ts).
- Local implementation: covered by `SelectOption` `description`/`icon` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-option-custom` component defines a custom content of an option in the `ui5-select`.
A component to be the same way as the standard `ui5-option`.
The component accepts arbitrary HTML content to allow full customization.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/OptionCustom.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `displayText` | `string \| undefined` | `undefined` | Defines the text, displayed inside the `ui5-select` input filed<br>when the option gets selected. |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the option. |
| `value` | `string \| undefined` | `undefined` | Defines the value of the `ui5-select` inside an HTML Form element when this component is selected.<br>For more information on HTML Form support, see the `name` property of `ui5-select`. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the content of the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `displayText`, `selected`, `tooltip`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [OptionGroup](https://ui5.github.io/webcomponents/components/OptionGroup/)

- Tag: `ui5-option-group`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/OptionGroup.d.ts).
- Local implementation: covered by `SelectOption.group` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-option-group` component is used to group options within a `ui5-select`.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/OptionGroup.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text of the group. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Option>` | Defines the options of the group.<br><br>**Note:** Use the `ui5-option` component to define the desired options. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `headerText`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [Panel](https://ui5.github.io/webcomponents/components/Panel/)

- Tag: `ui5-panel`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Panel.d.ts).
- Local implementation: `src/components/panel` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview

The `ui5-panel` component is a container which has a header and a
content area and is used
for grouping and displaying information. It can be collapsed to save space on the screen.

##### Guidelines:

- Nesting two or more panels is not recommended.
- Do not stack too many panels on one page.

##### Structure
The panel's header area consists of a title bar with a header text or custom header.

The header is clickable and can be used to toggle between the expanded and collapsed state. It includes an icon which rotates depending on the state.

The custom header can be set through the `header` slot and it may contain arbitraray content, such as: title, buttons or any other HTML elements.

The content area can contain an arbitrary set of controls.

**Note:** The custom header is not clickable out of the box, but in this case the icon is interactive and allows to show/hide the content area.

##### Responsive Behavior

- If the width of the panel is set to 100% (default), the panel and its children are
resized responsively,
depending on its parent container.
- If the panel has a fixed height, it will take up the space even if the panel is
collapsed.
- When the panel is expandable (the `fixed` property is set to `false`),
an arrow icon (pointing to the right) appears in front of the header.
- When the animation is activated, expand/collapse uses a smooth animation to open or
close the content area.
- When the panel expands/collapses, the arrow icon rotates 90 degrees
clockwise/counter-clockwise.

##### Keyboard Handling

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Panel.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleRole` | `` `${PanelAccessibleRole}` `` | `"Form"` | Sets the accessible ARIA role of the component.<br>Depending on the usage, you can change the role from the default `Form`<br>to `Region` or `Complementary`. |
| `collapsed` | `boolean` | `false` | Indicates whether the component is collapsed and only the header is displayed. |
| `fixed` | `boolean` | `false` | Determines whether the component is in a fixed state that is not<br>expandable/collapsible by user interaction. |
| `headerLevel` | `` `${TitleLevel}` `` | `"H2"` | Defines the "aria-level" of component heading,<br>set by the `headerText`. |
| `headerText` | `string \| undefined` | `undefined` | This property is used to set the header text of the component.<br>The text is visible in both expanded and collapsed states.<br><br>**Note:** This property is overridden by the `header` slot. |
| `noAnimation` | `boolean` | `false` | Indicates whether the transition between the expanded and the collapsed state of the component is animated. By default the animation is enabled. |
| `stickyHeader` | `boolean` | `false` | Indicates whether the Panel header is sticky or not.<br>If stickyHeader is set to true, then whenever you scroll the content or<br>the application, the header of the panel will be always visible and<br>a solid color will be used for its design. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the content of the component. The content is visible only when the component is expanded. |
| `header` | `Slot<HTMLElement>` | Defines the component header area.<br><br>**Note:** When a header is provided, the `headerText` property is ignored. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `toggle` | `CustomEvent` | true | false | Fired when the component is expanded/collapsed by user interaction. |

#### CSS parts

- `content`: Used to style the wrapper of the content.
- `header`: Used to style the header.
- `header-wrapper`: Used to style the outermost header wrapper, useful for adjusting sticky header position.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/Basic/main.js).
- [Fixed Panel](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/Fixed/sample.tsx) — The fixed panel can't be collapsed when expanded, and can't be expanded if collapsed.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/Fixed/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/Fixed/main.js).
- [Sticky Header](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/StickyHeader/sample.tsx) — The header remains visible upon scrolling the Panel's content.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/StickyHeader/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/StickyHeader/main.js).
- [Custom Header](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/CustomHeader/sample.tsx) — You can replace the built-in header using the `header` slot.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/CustomHeader/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Panel/CustomHeader/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleRole`, `collapsed`.
- [ ] Verify `toggle` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states

### [Popover](https://ui5.github.io/webcomponents/components/Popover/)

- Tag: `ui5-popover`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Popover.d.ts).
- Local implementation: `src/components/popover` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-popover` component displays additional information for an object
in a compact way and without leaving the page.
The Popover can contain various UI elements, such as fields, tables, images, and charts.
It can also include actions in the footer.

##### Structure

The popover has three main areas:

- Header (optional)
- Content
- Footer (optional)

**Note:** The `ui5-popover` is closed when the user clicks
or taps outside the popover
or selects an action within the popover. You can prevent this with the
`modal` property.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Popover.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that label the component. |
| `accessibleRole` | `` `${PopupAccessibleRole}` `` | `"Dialog"` | Allows setting a custom role. |
| `allowTargetOverlap` | `boolean` | `false` | Determines if there is no enough space, the component can be placed<br>over the target. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text.<br><br>**Note:** If `header` slot is provided, the `headerText` is ignored. |
| `hideArrow` | `boolean` | `false` | Determines whether the component arrow is hidden. |
| `horizontalAlign` | `` `${PopoverHorizontalAlign}` `` | `"Center"` | Determines the horizontal alignment of the component. |
| `initialFocus` | `string \| undefined` | `undefined` | Defines the ID of the HTML Element, which will get the initial focus.<br><br>**Note:** If an element with `autofocus` attribute is added inside the component,<br>`initialFocus` won't take effect. |
| `modal` | `boolean` | `false` | Defines whether the component should close when<br>clicking/tapping outside the popover.<br>If enabled, it blocks any interaction with the background. |
| `open` | `boolean` | `false` | Indicates if the element is open |
| `opener` | `HTMLElement \| string \| null \| undefined` | `undefined` | Defines the ID or DOM Reference of the element at which the popover is shown.<br>When using this attribute in a declarative way, you must only use the `id` (as a string) of the element at which you want to show the popover.<br>You can only set the `opener` attribute to a DOM Reference when using JavaScript. |
| `placement` | `` `${PopoverPlacement}` `` | `"End"` | Determines on which side the component is placed at. |
| `preventFocusRestore` | `boolean` | `false` | Defines if the focus should be returned to the previously focused element,<br>when the popup closes. |
| `preventInitialFocus` | `boolean` | `false` | Indicates whether initial focus should be prevented. |
| `resizable` | `boolean` | `false` | Determines whether the component is resizable.<br>**Note:** This property is effective only on desktop devices. |
| `verticalAlign` | `` `${PopoverVerticalAlign}` `` | `"Center"` | Determines the vertical alignment of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the Popup. |
| `footer` | `Slot<HTMLElement>` | Defines the footer HTML Element. |
| `header` | `Slot<HTMLElement>` | Defines the header HTML Element. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `before-close` | `CustomEvent<PopupBeforeCloseEventDetail>` | false | true | Fired before the component is closed. This event can be cancelled, which will prevent the popup from closing. |
| `before-open` | `CustomEvent` | false | true | Fired before the component is opened. This event can be cancelled, which will prevent the popup from opening. |
| `close` | `CustomEvent` | false | false | Fired after the component is closed. |
| `open` | `CustomEvent` | false | false | Fired after the component is opened. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `applyFocus` | `applyFocus(): Promise<void>;` | Focuses the element denoted by `initialFocus`, if provided,<br>or the first focusable element otherwise. |

#### CSS parts

- `content`: Used to style the content of the component
- `footer`: Used to style the footer of the component
- `header`: Used to style the header of the component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Popover/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Popover/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Popover/Basic/main.js).
- [Placement](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Popover/Placement/sample.tsx) — You can influence the placement of the popup. Note: if there is not enough space for the popup on the defined side, it will open on the side with enough space.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Popover/Placement/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Popover/Placement/main.js).
- [Resizable](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Popover/Resizable/sample.tsx) — The Resizable sample demonstrates how the Popover component can be resized by mouse and keyboard (Shift + arrow keys).; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Popover/Resizable/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Popover/Resizable/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `before-close`, `before-open`, `close`, `open` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/popover` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- CSS custom states

### [ProgressIndicator](https://ui5.github.io/webcomponents/components/ProgressIndicator/)

- Tag: `ui5-progress-indicator`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ProgressIndicator.d.ts).
- Local implementation: `src/components/progress-bar` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
Shows the progress of a process in a graphical way. To indicate the progress,
the inside of the component is filled with a color.

##### Responsive Behavior
You can change the size of the Progress Indicator by changing its `width` or `height` CSS properties.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/ProgressIndicator.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `displayValue` | `string \| undefined` | `undefined` | Specifies the text value to be displayed in the bar.<br><br>**Note:**<br><br>- If there is no value provided or the value is empty, the default percentage value is shown.<br>- If `hideValue` property is `true` both the `displayValue` and `value` property values are not shown. |
| `hideValue` | `boolean` | `false` | Defines whether the component value is shown. |
| `value` | `number` | `0` | Specifies the numerical value in percent for the length of the component.<br><br>**Note:**<br>If a value greater than 100 is provided, the percentValue is set to 100. In other cases of invalid value, percentValue is set to its default of 0. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### CSS parts

- `bar`: Used to style the main bar of the `ui5-progress-indicator`
- `remaining-bar`: Used to style the remaining bar of the `ui5-progress-indicator`

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ProgressIndicator/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ProgressIndicator/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ProgressIndicator/Basic/main.js).
- [Display Value](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ProgressIndicator/DisplayValue/sample.tsx) — Use the `displayValue` property to define an alternative of the value, that is actually displayed.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ProgressIndicator/DisplayValue/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ProgressIndicator/DisplayValue/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ProgressIndicator/States/sample.tsx) — ProgressIndicator supports several semantic value states.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ProgressIndicator/States/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ProgressIndicator/States/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `displayValue`, `hideValue`.
- [ ] Compare the existing `src/components/progress-bar` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS custom states

### [RadioButton](https://ui5.github.io/webcomponents/components/RadioButton/)

- Tag: `ui5-radio-button`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/RadioButton.d.ts).
- Local implementation: `src/components/radio-group` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-radio-button` component enables users to select a single option from a set of options.
When a `ui5-radio-button` is selected by the user, the
`change` event is fired.
When a `ui5-radio-button` that is within a group is selected, the one
that was previously selected gets automatically deselected. You can group radio buttons by using the `name` property.

**Note:** If `ui5-radio-button` is not part of a group, it can be selected once, but can not be deselected back.

##### Keyboard Handling

Once the `ui5-radio-button` is on focus, it might be selected by pressing the Space and Enter keys.

The Arrow Down/Arrow Up and Arrow Left/Arrow Right keys can be used to change selection between next/previous radio buttons in one group,
while TAB and SHIFT + TAB can be used to enter or leave the radio button group.

**Note:** On entering radio button group, the focus goes to the currently selected radio button.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/RadioButton";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that label the component. |
| `checked` | `boolean` | `false` | Defines whether the component is checked or not.<br><br>**Note:** The property value can be changed with user interaction,<br>either by clicking/tapping on the component,<br>or by using the Space or Enter key.<br><br>**Note:** Only enabled radio buttons can be checked.<br>Read-only radio buttons are not selectable, and therefore are always unchecked. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br><br>**Note:** A disabled component is completely noninteractive. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>Radio buttons with the same `name` will form a radio button group.<br><br>**Note:** By this name the component will be identified upon submission in an HTML form.<br><br>**Note:** The selection can be changed with `ARROW_UP/DOWN` and `ARROW_LEFT/RIGHT` keys between radio buttons in same group.<br><br>**Note:** Only one radio button can be selected per group. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component isn't editable or selectable.<br>However, because it's focusable, it still provides visual feedback upon user interaction. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the component. |
| `value` | `string` | `""` | Defines the form value of the component.<br>When a form with a radio button group is submitted, the group's value<br>will be the value of the currently selected radio button. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |
| `wrappingType` | `` `${WrappingType}` `` | `"Normal"` | Defines whether the component text wraps when there is not enough space.<br><br>**Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the component checked state changes. |

#### CSS parts

- `inner-ring`: Used to style the inner ring of the `ui5-radio-button`.
- `outer-ring`: Used to style the outer ring of the `ui5-radio-button`.
- `root`: Used to style the root DOM element of the component.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RadioButton/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RadioButton/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RadioButton/Basic/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RadioButton/States/sample.tsx) — The RadioButton supports several semantic value states, readonly, disabled, etc.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RadioButton/States/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RadioButton/States/main.js).
- [Text Truncation and Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RadioButton/TextWrapping/sample.tsx) — The RadioButton text wraps by default. To make it truncate - set `wrapping-type="None"`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RadioButton/TextWrapping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RadioButton/TextWrapping/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `checked`.
- [ ] Verify `change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/radio-group` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Slots
- Public methods
- CSS custom states

### [RangeSlider](https://ui5.github.io/webcomponents/components/RangeSlider/)

- Tag: `ui5-range-slider`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/RangeSlider.d.ts).
- Local implementation: `src/components/range-slider` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
Represents a numerical interval and two handles (grips) to select a sub-range within it.
The purpose of the component to enable visual selection of sub-ranges within a given interval.

##### Structure
The most important properties of the Range Slider are:

- min - The minimum value of the slider range.
- max - The maximum value of the slider range.
- value - The current value of the slider.
- step - Determines the increments in which the slider will move.
- showTooltip - Determines if a tooltip should be displayed above the handle.
- showTickmarks - Displays a visual divider between the step values.
- labelInterval - Labels some or all of the tickmarks with their values.

##### Notes:

- The right and left handle can be moved individually and their positions could therefore switch.
- The entire range can be moved along the interval.

##### Usage
The most common use case is to select and move sub-ranges on a continuous numerical scale.

##### Responsive Behavior
You can move the currently selected range by clicking on it and dragging it along the interval.

##### Keyboard Handling

- `Left or Down Arrow` - Moves a component's handle or the entire selection one step to the left;
- `Right or Up Arrow` - Moves a component's handle or the entire selection one step to the right;
- `Left or Down Arrow + Ctrl/Cmd` - Moves a component's handle to the left or the entire range with step equal to 1/10th of the entire range;
- `Right or Up Arrow + Ctrl/Cmd` - Moves a component's handle to the right or the entire range with step equal to 1/10th of the entire range;
- `Plus` - Same as `Right or Up Arrow`;
- `Minus` - Same as `Left or Down Arrow`;
- `Home` - Moves the entire selection or the selected handle to the beginning of the component's range;
- `End` - Moves the entire selection or the selected handle to the end of the component's range;
- `Page Up` - Same as `Right or Up Arrow + Ctrl/Cmd`;
- `Page Down` - Same as `Left or Down Arrow + Ctrl/Cmd`;
- `Escape` - Resets the `startValue` and `endValue` properties to the values prior the component focusing;

##### ES6 Module Import

`import "@ui5/webcomponents/dist/RangeSlider.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `disabled` | `boolean` | `false` | Defines whether the slider is in disabled state. |
| `editableTooltip` | `boolean` | `false` | <br>Indicates whether input fields should be used as tooltips for the handles.<br><br>**Note:** Setting this option to true will only work if showTooltip is set to true.<br>**Note:** In order for the component to comply with the accessibility standard, it is recommended to set the editableTooltip property to true. |
| `endValue` | `number` | `100` | Defines end point of a selection - position of a second handle on the slider. |
| `labelInterval` | `number` | `0` | Displays a label with a value on every N-th step.<br><br>**Note:** The step and tickmarks properties must be enabled.<br>Example - if the step value is set to 2 and the label interval is also specified to 2 - then every second<br>tickmark will be labelled, which means every 4th value number.<br><br>**Note:** This property is ignored when the `tickmarks` property is used.<br>In that case every custom tickmark is labelled with its own `label`. |
| `max` | `number` | `100` | Defines the maximum value of the slider. |
| `min` | `number` | `0` | Defines the minimum value of the slider. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `showTickmarks` | `boolean` | `false` | Enables tickmarks visualization for each step.<br><br>**Note:** The step must be a positive number. |
| `showTooltip` | `boolean` | `false` | Enables handle tooltip displaying the current value. |
| `startValue` | `number` | `0` | Defines start point of a selection - position of a first handle on the slider. |
| `step` | `number` | `1` | Defines the size of the slider's selection intervals (e.g. min = 0, max = 10, step = 5 would result in possible selection of the values 0, 5, 10).<br><br>**Note:** If set to 0 the slider handle movement is disabled. When negative number or value other than a number, the component fallbacks to its default value. |
| `tickmarks` | `Array<Tickmark>` | `[]` | Defines custom tickmarks with labels on the slider scale.<br>Each tickmark object has a numeric `value` and an optional `label` string.<br>Tickmarks are purely visual — they display labeled markers at specific positions<br>but do not affect the slider's movement behavior. The slider still moves<br>according to `min`, `max`, and `step`.<br><br>When the current value matches a tickmark value, the tickmark's label<br>is shown in the tooltip and announced via `aria-valuetext`.<br><br>**Note:** When `tickmarks` is provided, the scale is automatically shown<br>(equivalent to `showTickmarks`), and `labelInterval` is ignored - every<br>custom tickmark is rendered with its own `label`. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the value changes and the user has finished interacting with the slider. |
| `input` | `CustomEvent` | true | false | Fired when the value changes due to user interaction that is not yet finished - during mouse/touch dragging. |

#### CSS parts

- `handle`: Used to style the handles of the `ui5-range-slider`.
- `progress-bar`: Used to style the progress bar, which shows the progress of the `ui5-range-slider`.
- `progress-container`: Used to style the progress container, the horizontal bar that visually represents the range between the minimum and maximum values, of the `ui5-range-slider`.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/Basic/main.js).
- [Show Tickmarks](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/ShowTickmarks/sample.tsx) — Tickmarks, marking the step can be displayed on the Range Slider. In addition, labels with the given step can be displayed.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/ShowTickmarks/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/ShowTickmarks/main.js).
- [Show Tooltips](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/ShowTooltip/sample.tsx) — Tooltip with the current value can be displayed upon handles hover.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/ShowTooltip/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/ShowTooltip/main.js).
- [Custom Tickmarks](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/CustomTickmarks/sample.tsx) — Custom tickmarks with labels can be displayed at specific positions on the Range Slider scale.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/CustomTickmarks/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RangeSlider/CustomTickmarks/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `disabled`, `editableTooltip`.
- [ ] Verify `change`, `input` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS custom states

### [RatingIndicator](https://ui5.github.io/webcomponents/components/RatingIndicator/)

- Tag: `ui5-rating-indicator`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/RatingIndicator.d.ts).
- Local implementation: `src/components/rating-indicator` (React adaptation; UI5 parity unverified).
- Status: [ ] Initial React implementation, documentation and focused tests added; upstream behavior and accessibility parity remain unverified.

#### Description and keyboard interaction

##### Overview
The Rating Indicator is used to display a specific number of icons that are used to rate an item.
Additionally, it is also used to display the average and overall ratings.

##### Usage
The recommended number of icons is between 5 and 7.

##### Responsive Behavior
You can change the size of the Rating Indicator by changing its `font-size` CSS property.

Example: `<ui5-rating-indicator style="font-size: 3rem;"></ui5-rating-indicator>`

##### Keyboard Handling
When the `ui5-rating-indicator` is focused, the user can change the rating
with the following keyboard shortcuts:

- [RIGHT/UP] - Increases the value of the rating by one step. If the highest value is reached, does nothing
- [LEFT/DOWN] - Decreases the value of the rating by one step. If the lowest value is reached, does nothing.
- [Home] - Sets the lowest value.
- [End] - Sets the highest value.
- [SPACE/ENTER/RETURN] - Increases the value of the rating by one step. If the highest value is reached, sets the rating to the lowest value.
- Any number - Changes value to the corresponding number. If typed number is larger than the number of values, sets the highest value.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/RatingIndicator.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br><br>**Note:** A disabled component is completely noninteractive. |
| `displayOnly` | `boolean` | `false` | Defines whether the component is in display-only mode.<br><br>**Note:** A display-only component is visually identical to read-only<br>but cannot receive focus and is not announced by screen readers. |
| `max` | `number` | `5` | The number of displayed rating symbols. |
| `ratedIcon` | `string` | `"favorite"` | Defines the icon to be displayed for the selected (filled) rating symbol. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `size` | `` `${RatingIndicatorSize}` `` | `"M"` | Defines the size of the component. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component. |
| `unratedIcon` | `string` | `"unfavorite"` | Defines the icon to be displayed for the unselected (empty) rating symbol. |
| `value` | `number` | `0` | The indicated value of the rating.<br><br>**Note:** If you set a number which is not round, it would be shown as follows:<br><br>- 1.0 - 1.2 -> 1<br>- 1.3 - 1.7 -> 1.5<br>- 1.8 - 1.9 -> 2 |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | The event is fired when the value changes. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RatingIndicator/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RatingIndicator/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RatingIndicator/Basic/main.js).
- [Sizes](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RatingIndicator/Sizes/sample.tsx) — The RatingIndicator supports several sizes of the Icons (S, M and L).; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RatingIndicator/Sizes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RatingIndicator/Sizes/main.js).
- [Custom Icons](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RatingIndicator/CustomIcons/sample.tsx) — The RatingIndicator supports custom icons for both selected and unselected states using the `rated-icon` and `unrated-icon` properties.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RatingIndicator/CustomIcons/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/RatingIndicator/CustomIcons/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `disabled`.
- [ ] Verify `change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states

### [ResponsivePopover](https://ui5.github.io/webcomponents/components/ResponsivePopover/)

- Tag: `ui5-responsive-popover`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ResponsivePopover.d.ts).
- Local implementation: `src/components/responsive-popover` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-responsive-popover` acts as a Popover on desktop and tablet, while on phone it acts as a Dialog.
The component improves tremendously the user experience on mobile.

##### Usage
Use it when you want to make sure that all the content is visible on any device.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/ResponsivePopover.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that label the component. |
| `accessibleRole` | `` `${PopupAccessibleRole}` `` | `"Dialog"` | Allows setting a custom role. |
| `allowTargetOverlap` | `boolean` | `false` | Determines if there is no enough space, the component can be placed<br>over the target. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text.<br><br>**Note:** If `header` slot is provided, the `headerText` is ignored. |
| `hideArrow` | `boolean` | `false` | Determines whether the component arrow is hidden. |
| `horizontalAlign` | `` `${PopoverHorizontalAlign}` `` | `"Center"` | Determines the horizontal alignment of the component. |
| `initialFocus` | `string \| undefined` | `undefined` | Defines the ID of the HTML Element, which will get the initial focus.<br><br>**Note:** If an element with `autofocus` attribute is added inside the component,<br>`initialFocus` won't take effect. |
| `modal` | `boolean` | `false` | Defines whether the component should close when<br>clicking/tapping outside the popover.<br>If enabled, it blocks any interaction with the background. |
| `open` | `boolean` | `false` | Indicates if the element is open |
| `opener` | `HTMLElement \| string \| null \| undefined` | `undefined` | Defines the ID or DOM Reference of the element at which the popover is shown.<br>When using this attribute in a declarative way, you must only use the `id` (as a string) of the element at which you want to show the popover.<br>You can only set the `opener` attribute to a DOM Reference when using JavaScript. |
| `placement` | `` `${PopoverPlacement}` `` | `"End"` | Determines on which side the component is placed at. |
| `preventFocusRestore` | `boolean` | `false` | Defines if the focus should be returned to the previously focused element,<br>when the popup closes. |
| `preventInitialFocus` | `boolean` | `false` | Indicates whether initial focus should be prevented. |
| `resizable` | `boolean` | `false` | Determines whether the component is resizable.<br>**Note:** This property is effective only on desktop devices. |
| `verticalAlign` | `` `${PopoverVerticalAlign}` `` | `"Center"` | Determines the vertical alignment of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<HTMLElement>` | Defines the content of the Popup. |
| `footer` | `Slot<HTMLElement>` | Defines the footer HTML Element. |
| `header` | `Slot<HTMLElement>` | Defines the header HTML Element. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `before-close` | `CustomEvent<PopupBeforeCloseEventDetail>` | false | true | Fired before the component is closed. This event can be cancelled, which will prevent the popup from closing. |
| `before-open` | `CustomEvent` | false | true | Fired before the component is opened. This event can be cancelled, which will prevent the popup from opening. |
| `close` | `CustomEvent` | false | false | Fired after the component is closed. |
| `open` | `CustomEvent` | false | false | Fired after the component is opened. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `applyFocus` | `applyFocus(): Promise<void>;` | Focuses the element denoted by `initialFocus`, if provided,<br>or the first focusable element otherwise. |

#### CSS parts

- `content`: Used to style the content of the component
- `footer`: Used to style the footer of the component
- `header`: Used to style the header of the component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ResponsivePopover/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ResponsivePopover/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ResponsivePopover/Basic/main.js).
- [Placement](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ResponsivePopover/Placement/sample.tsx) — You can influence the placement of the popup. Note: if there is not enough space for the popup on the defined side, it will open on the side with enough space.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ResponsivePopover/Placement/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ResponsivePopover/Placement/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `before-close`, `before-open`, `close`, `open` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- CSS custom states

### [SegmentedButton](https://ui5.github.io/webcomponents/components/SegmentedButton/)

- Tag: `ui5-segmented-button`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/SegmentedButton.d.ts).
- Local implementation: `src/components/segmented-button` (React adaptation; UI5 parity unverified). `src/components/button-group` remains the non-selecting grouping primitive.
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-segmented-button` shows a group of items. When the user clicks or taps
one of the items, it stays in a pressed state. It automatically resizes the items
to fit proportionally within the component. When no width is set, the component uses the available width.


##### ES6 Module Import

`import "@ui5/webcomponents/dist/SegmentedButton.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Defines the IDs of the HTML Elements that describe the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines the IDs of the HTML Elements that label the component. |
| `itemsFitContent` | `boolean` | `false` | Determines whether the segmented button items should be sized to fit their content.<br><br>If set to `true`, each item will be sized to fit its content, with any extra space distributed after the last item.<br>If set to `false` (the default), all items will be equally sized to fill the available space. |
| `selectedItems` | `Array<ISegmentedButtonItem>` | `[]` | Returns an array of the currently selected items. |
| `selectionMode` | `` `${SegmentedButtonSelectionMode}` `` | `"Single"` | Defines the component selection mode. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ISegmentedButtonItem>` | Defines the items of `ui5-segmented-button`.<br><br>**Note:** Multiple items are allowed.<br><br>**Note:** Use the `ui5-segmented-button-item` for the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `selection-change` | `CustomEvent<SegmentedButtonSelectionChangeEventDetail>` | true | false | Fired when the selected item changes. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SegmentedButton/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SegmentedButton/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SegmentedButton/Basic/main.js).
- [Selection Modes](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SegmentedButton/SelectionModes/sample.tsx) — You can define if single or multiple buttons can be pressed.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SegmentedButton/SelectionModes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SegmentedButton/SelectionModes/main.js).
- [Items Fit Content](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SegmentedButton/ItemsFitContent/sample.tsx) — You can define a property that allows each item to be sized according to its content.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SegmentedButton/ItemsFitContent/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SegmentedButton/ItemsFitContent/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `selection-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/button-group` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [SegmentedButtonItem](https://ui5.github.io/webcomponents/components/SegmentedButtonItem/)

- Tag: `ui5-segmented-button-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/SegmentedButtonItem.d.ts).
- Local implementation: `src/components/segmented-button` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

Users can use the `ui5-segmented-button-item` as part of a `ui5-segmented-button`.

Clicking or tapping on a `ui5-segmented-button-item` changes its state to `selected`.
The item returns to its initial state when the user clicks or taps on it again.
By applying additional custom CSS-styling classes, apps can give a different style to any
`ui5-segmented-button-item`.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/SegmentedButtonItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Defines the IDs of the HTML Elements that describe the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br>A disabled component can't be selected or<br>focused, and it is not in the tab chain. |
| `icon` | `string \| undefined` | `undefined` | Defines the icon, displayed as graphical element within the component.<br>The SAP-icons font provides numerous options.<br><br>Example:<br>See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `selected` | `boolean` | `false` | Determines whether the component is displayed as selected. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component.<br><br>**Note:** A tooltip attribute should be provided for icon-only buttons, in order to represent their exact meaning/function. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<SegmentedButtonItemClickEventDetail>` | true | true | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [Select](https://ui5.github.io/webcomponents/components/Select/)

- Tag: `ui5-select`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Select.d.ts).
- Local implementation: `src/components/select` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-select` component is used to create a drop-down list.

##### Usage

There are two main usages of the `ui5-select>`.

- With Option (`ui5-option`) web component:

The available options of the Select are defined by using the Option component.
The Option comes with predefined design and layout, including `icon`, `text` and `additional-text`.

- With OptionCustom (`ui5-option-custom`) web component.

Options with custom content are defined by using the OptionCustom component.
The OptionCustom component comes with no predefined layout and it expects consumers to define it.

##### Selection

The options can be selected via user interaction (click or with the use of the Space and Enter keys)
and programmatically - the Select component supports two distinct selection APIs, though mixing them is not supported:
- The "value" property of the Select component
- The "selected" property on individual options

**Note:** If the "value" property is set but does not match any option,
no option will be selected and the Select component will be displayed as empty.

**Note:** when both "value" and "selected" are both used (although discouraged),
the "value" property will take precedence.

##### Keyboard Handling

The `ui5-select` provides advanced keyboard handling.

- [F4] / [Alt] + [Up] / [Alt] + [Down] / [Space] or [Enter] - Opens/closes the drop-down.
- [Up] or [Down] - If the drop-down is closed - changes selection to the next or the previous option. If the drop-down is opened - moves focus to the next or the previous option.
- [Space], [Enter] - If the drop-down is opened - selects the focused option.
- [Escape] - Closes the drop-down without changing the selection.
- [Home] - Navigates to first option
- [End] - Navigates to the last option

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Select";`

`import "@ui5/webcomponents/dist/Option";`
`import "@ui5/webcomponents/dist/OptionCustom";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the select. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the select. |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state.<br><br>**Note:** A disabled component is noninteractive. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `selectedOption` | `IOption \| undefined` | `undefined` | Currently selected `ui5-option` element. |
| `textSeparator` | `` `${SelectTextSeparator}` `` | `"Dash"` | Defines the separator type for the two columns layout when Select is in read-only mode. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the select. |
| `value` | `string` | `""` | Defines the value of the component:<br><br>- when get - returns the value of the component or the value/text content of the selected option.<br>- when set - selects the option with matching `value` property or text content.<br><br>**Note:** Use either the Select's value or the Options' selected property.<br>Mixed usage could result in unexpected behavior.<br><br>**Note:** If the given value does not match any existing option,<br>no option will be selected and the Select component will be displayed as empty. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IOption \| IOptionGroup>` | Defines the component options.<br><br>**Note:** Only one selected option is allowed.<br>If more than one option is defined as selected, the last one would be considered as the selected one.<br><br>**Note:** Use the `ui5-option` component to define the desired options.<br>Use the `ui5-option-group` component to group options. |
| `label` | `Slot<HTMLElement>` | Defines the HTML element that will be displayed in the component input part,<br>representing the selected option.<br><br>**Note:** If not specified and `ui5-option-custom` is used,<br>either the option's `display-text` or its textContent will be displayed.<br><br>**Note:** If not specified and `ui5-option` is used,<br>the option's textContent will be displayed. |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the component is in `Information`, `Critical` or `Negative` value state.<br><br>**Note:** If the component has `suggestionItems`,<br>the `valueStateMessage` would be displayed as part of the same popover, if used on desktop, or dialog - on phone. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent<SelectChangeEventDetail>` | true | true | Fired when the selected option changes. |
| `close` | `CustomEvent` | false | false | Fired after the component's dropdown menu closes. |
| `live-change` | `CustomEvent<SelectLiveChangeEventDetail>` | true | false | Fired when the user navigates through the options, but the selection is not finalized,<br>or when pressing the ESC key to revert the current selection. |
| `open` | `CustomEvent` | false | false | Fired after the component's dropdown menu opens. |

#### CSS parts

- `popover`: Used to style the popover element

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/Basic/main.js).
- [Selection](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/Selection/sample.tsx) — Use the `value` property on the Select component to control which option is selected. The value should match the `value` attribute of the desired Option or Option's text.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/Selection/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/Selection/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/States/sample.tsx) — Select supports several semantic value states, readonly, disabled, etc.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/States/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/States/main.js).
- [Options with additional text](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/AdditionalText/sample.tsx) — Options can display additional text.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/AdditionalText/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/AdditionalText/main.js).
- [Grouped Options](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/OptionGroups/sample.tsx) — Use the `ui5-option-group` component to group options inside a Select.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/OptionGroups/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/OptionGroups/main.js).
- [Custom Options](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/CustomOptions/sample.tsx) — You can define completely custom options via the `ui5-option-custom` component.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/CustomOptions/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Select/CustomOptions/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `change`, `close`, `live-change`, `open` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/select` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [Slider](https://ui5.github.io/webcomponents/components/Slider/)

- Tag: `ui5-slider`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Slider.d.ts).
- Local implementation: `src/components/slider` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The Slider component represents a numerical range and a handle (grip).
The purpose of the component is to enable visual selection of a value in
a continuous numerical range by moving an adjustable handle.

##### Structure
The most important properties of the Slider are:

- min - The minimum value of the slider range.
- max - The maximum value of the slider range.
- value - The current value of the slider range.
- step - Determines the increments in which the slider will move.
- showTooltip - Determines if a tooltip should be displayed above the handle.
- showTickmarks - Displays a visual divider between the step values.
- labelInterval - Labels some or all of the tickmarks with their values.

##### Usage
The most common use case is to select values on a continuous numerical scale (e.g. temperature, volume, etc. ).

##### Responsive Behavior
The `ui5-slider` component adjusts to the size of its parent container by recalculating and
resizing the width of the control. You can move the slider handle in several different ways:

- Drag and drop the handle to the desired value.
- Click/tap on the range bar to move the handle to that location.

##### Keyboard Handling

- `Left or Down Arrow` - Moves the handle one step to the left, effectively decreasing the component's value by `step` amount;
- `Right or Up Arrow` - Moves the handle one step to the right, effectively increasing the component's value by `step` amount;
- `Left or Down Arrow + Ctrl/Cmd` - Moves the handle to the left with step equal to 1/10th of the entire range, effectively decreasing the component's value by 1/10th of the range;
- `Right or Up Arrow + Ctrl/Cmd` - Moves the handle to the right with step equal to 1/10th of the entire range, effectively increasing the component's value by 1/10th of the range;
- `Plus` - Same as `Right or Up Arrow`;
- `Minus` - Same as `Left or Down Arrow`;
- `Home` - Moves the handle to the beginning of the range;
- `End` - Moves the handle to the end of the range;
- `Page Up` - Same as `Right or Up + Ctrl/Cmd`;
- `Page Down` - Same as `Left or Down + Ctrl/Cmd`;
- `Escape` - Resets the value property after interaction, to the position prior the component's focusing;

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Slider.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `disabled` | `boolean` | `false` | Defines whether the slider is in disabled state. |
| `editableTooltip` | `boolean` | `false` | <br>Indicates whether input fields should be used as tooltips for the handles.<br><br>**Note:** Setting this option to true will only work if showTooltip is set to true.<br>**Note:** In order for the component to comply with the accessibility standard, it is recommended to set the editableTooltip property to true. |
| `labelInterval` | `number` | `0` | Displays a label with a value on every N-th step.<br><br>**Note:** The step and tickmarks properties must be enabled.<br>Example - if the step value is set to 2 and the label interval is also specified to 2 - then every second<br>tickmark will be labelled, which means every 4th value number.<br><br>**Note:** This property is ignored when the `tickmarks` property is used.<br>In that case every custom tickmark is labelled with its own `label`. |
| `max` | `number` | `100` | Defines the maximum value of the slider. |
| `min` | `number` | `0` | Defines the minimum value of the slider. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `showTickmarks` | `boolean` | `false` | Enables tickmarks visualization for each step.<br><br>**Note:** The step must be a positive number. |
| `showTooltip` | `boolean` | `false` | Enables handle tooltip displaying the current value. |
| `step` | `number` | `1` | Defines the size of the slider's selection intervals (e.g. min = 0, max = 10, step = 5 would result in possible selection of the values 0, 5, 10).<br><br>**Note:** If set to 0 the slider handle movement is disabled. |
| `tickmarks` | `Array<Tickmark>` | `[]` | Defines custom tickmarks with labels on the slider scale.<br>Each tickmark object has a numeric `value` and an optional `label` string.<br>Tickmarks are purely visual — they display labeled markers at specific positions<br>but do not affect the slider's movement behavior. The slider still moves<br>according to `min`, `max`, and `step`.<br><br>When the current value matches a tickmark value, the tickmark's label<br>is shown in the tooltip and announced via `aria-valuetext`.<br><br>**Note:** When `tickmarks` is provided, the scale is automatically shown<br>(equivalent to `showTickmarks`), and `labelInterval` is ignored - every<br>custom tickmark is rendered with its own `label`. |
| `value` | `number` | `0` | Current value of the slider |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the value changes and the user has finished interacting with the slider. |
| `input` | `CustomEvent` | true | false | Fired when the value changes due to user interaction that is not yet finished - during mouse/touch dragging. |

#### CSS parts

- `handle`: Used to style the handle of the `ui5-slider`.
- `progress-bar`: Used to style the progress bar, which shows the progress of the `ui5-slider`.
- `progress-container`: Used to style the progress container, the horizontal bar that visually represents the range between the minimum and maximum values, of the `ui5-slider`.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/Basic/main.js).
- [Show Tickmarks](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/ShowTickmarks/sample.tsx) — Tickmarks, marking the step can be displayed on the slider. In addition, labels with the given step can be displayed.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/ShowTickmarks/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/ShowTickmarks/main.js).
- [Show Tooltip](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/ShowTooltip/sample.tsx) — Tooltip with the current value can be displayed upon handle hover.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/ShowTooltip/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/ShowTooltip/main.js).
- [Custom Tickmarks](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/CustomTickmarks/sample.tsx) — Custom tickmarks with labels can be displayed at specific positions on the slider scale.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/CustomTickmarks/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Slider/CustomTickmarks/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `disabled`, `editableTooltip`.
- [ ] Verify `change`, `input` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS custom states

### [SpecialCalendarDate](https://ui5.github.io/webcomponents/components/SpecialCalendarDate/)

- Tag: `ui5-special-date`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/SpecialCalendarDate.d.ts).
- Local implementation: covered by `Calendar` `isDateDisabled` + `CalendarLegend` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-special-date` component defines a special calendar date to be used inside `ui5-calendar`,
which is visually distinguished from the rest of the dates.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `type` | `` `${CalendarLegendItemType}` `` | `"None"` | Defines the type of the special date. |
| `value` | `string` | `""` | The date formatted according to the `formatPattern` property<br>of the `ui5-calendar` that hosts the component. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `type`, `value`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [SplitButton](https://ui5.github.io/webcomponents/components/SplitButton/)

- Tag: `ui5-split-button`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/SplitButton.d.ts).
- Local implementation: `src/components/split-button` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

`ui5-split-button` enables users to trigger actions. It is constructed of two separate actions -
default action and arrow action that can be activated by clicking or tapping, or by
pressing certain keyboard keys - `Space` or `Enter` for default action,
and `Arrow Down` or `Arrow Up` for arrow action.

##### Usage

`ui5-split-button` consists two separate buttons:

- for the first one (default action) you can define some `text` or an `icon`, or both.
- the second one (arrow action) contains only `slim-arrow-down` icon.

You can choose a `design` from a set of predefined types (the same as for ui5-button) that offer
different styling to correspond to the triggered action. Both text and arrow actions have the same design.

You can set the `ui5-split-button` as enabled or disabled. Both parts of an enabled
`ui5-split-button` can be pressed by clicking or tapping it, or by certain keys, which changes
the style to provide visual feedback to the user that it is pressed or hovered over with
the mouse cursor. A disabled `ui5-split-button` appears inactive and any of the two buttons
cannot be pressed.

##### Keyboard Handling

- `Space` or `Enter` - triggers the default action
- `Shift` or `Escape` - if `Space` is pressed, releases the default action button without triggering the click event.
- `Arrow Down`, `Arrow Up`, `Alt`+`Arrow Down`, `Alt`+`Arrow Up`, or `F4` - triggers the arrow action
There are separate events that are fired on activating of `ui5-split-button` parts:

- `click` for the first button (default action)
- `arrow-click` for the second button (arrow action)

##### ES6 Module Import

`import "@ui5/webcomponents/dist/SplitButton.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `SplitButtonAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The `accessibilityAttributes` property accepts an object with the following optional fields:<br><br>- **root**: Attributes that will be applied to the main (text) button.<br>  - **hasPopup**: Indicates the presence and type of popup triggered by the button.<br>    Accepts string values: `"dialog"`, `"grid"`, `"listbox"`, `"menu"`, or `"tree"`.<br>  - **title**: Specifies a tooltip or description for screen readers.<br>    Accepts any string value.<br>	- **ariaKeyShortcuts**: Defines keyboard shortcuts that activate or give focus to the button.<br><br>- **arrowButton**: Attributes applied specifically to the arrow (split) button.<br>  - **hasPopup**: Indicates the presence and type of popup triggered by the arrow button.<br>    Accepts string values: `"dialog"`, `"grid"`, `"listbox"`, `"menu"`, or `"tree"`.<br>  - **expanded**: Indicates whether the popup triggered by the arrow button is currently expanded.<br>    Accepts boolean values: `true` or `false`. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `activeArrowButton` | `boolean` | `false` | Defines whether the arrow button should have the active state styles or not. |
| `design` | `` `${ButtonDesign}` `` | `"Default"` | Defines the component design. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br>A disabled component can't be pressed or<br>focused, and it is not in the tab chain. |
| `icon` | `string \| undefined` | `undefined` | Defines the icon to be displayed as graphical element within the component.<br>The SAP-icons font provides numerous options.<br><br>Example:<br><br>See all available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `arrow-click` | `CustomEvent` | true | false | Fired when the user clicks on the arrow action. |
| `click` | `CustomEvent` | true | false | Fired when the user clicks on the default action. |

#### CSS parts

- `button`: Used to style the native button element
- `endIcon`: Used to style the end icon in the native button element
- `icon`: Used to style the icon in the native button element

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SplitButton/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SplitButton/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SplitButton/Basic/main.js).
- [Design](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SplitButton/Design/sample.tsx) — The SplitButton supports several designs to indicate the priority or the nature of the action.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SplitButton/Design/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SplitButton/Design/main.js).
- [Opening Menu](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SplitButton/OpeningMenu/sample.tsx) — The main use-case of SplitButton is to open a menu by clicking the arrow.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SplitButton/OpeningMenu/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/SplitButton/OpeningMenu/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `activeArrowButton`.
- [ ] Verify `arrow-click`, `click` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/split-button` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [StepInput](https://ui5.github.io/webcomponents/components/StepInput/)

- Tag: `ui5-step-input`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/StepInput.d.ts).
- Local implementation: covered by `src/components/number-input` (stepper buttons, keyboard stepping) (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-step-input` consists of an input field and buttons with icons to increase/decrease the value
with the predefined step.

The user can change the value of the component by pressing the increase/decrease buttons,
by typing a number directly, by using the keyboard up/down and page up/down,
or by using the mouse scroll wheel. Decimal values are supported.

##### Usage

The default step is 1 but the app developer can set a different one.

App developers can set a maximum and minimum value for the `StepInput`.
The increase/decrease button and the up/down keyboard navigation become disabled when
the value reaches the max/min or a new value is entered from the input which is greater/less than the max/min.

##### When to use:

- To adjust amounts, quantities, or other values quickly.
- To adjust values for a specific step.

##### When not to use:

- To enter a static number (for example, postal code, phone number, or ID). In this case,
use the regular `ui5-input` instead.
- To display a value that rarely needs to be adjusted and does not pertain to a particular step.
In this case, use the regular `ui5-input` instead.
- To enter dates and times. In this case, use date/time related components instead.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/StepInput.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `disabled` | `boolean` | `false` | Determines whether the component is displayed as disabled. |
| `max` | `number \| undefined` | `undefined` | Defines a maximum value of the component. |
| `min` | `number \| undefined` | `undefined` | Defines a minimum value of the component. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint, intended to aid the user with data entry when the<br>component has no value. |
| `readonly` | `boolean` | `false` | Determines whether the component is displayed as read-only. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `step` | `number` | `1` | Defines a step of increasing/decreasing the value of the component. |
| `value` | `number` | `0` | Defines a value of the component. |
| `valuePrecision` | `number` | `0` | Determines the number of digits after the decimal point of the component. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the input operation has finished by pressing Enter or on focusout. |
| `input` | `CustomEvent` | true | true | Fired when the value of the component changes at each keystroke. |
| `value-state-change` | `CustomEvent<StepInputValueStateChangeEventDetail>` | true | true | Fired before the value state of the component is updated internally.<br>The event is preventable, meaning that if it's default action is<br>prevented, the component will not update the value state. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/Basic/main.js).
- [Min Max](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/MinMax/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/MinMax/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/MinMax/main.js).
- [Value Precision](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/ValuePrecision/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/ValuePrecision/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/ValuePrecision/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/States/sample.tsx) — StepInput supports several semantic value states, readonly, disabled, etc.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/States/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/StepInput/States/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `disabled`.
- [ ] Verify `change`, `input`, `value-state-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [SuggestionItem](https://ui5.github.io/webcomponents/components/SuggestionItem/)

- Tag: `ui5-suggestion-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/SuggestionItem.d.ts).
- Local implementation: covered by `ComboBox` / `MultiInput` `suggestions` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-suggestion-item` represents the suggestion item of the `ui5-input`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `additionalText` | `string \| undefined` | `undefined` | Defines the `additionalText`, displayed in the end of the item. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `additionalText`, `text`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [SuggestionItemCustom](https://ui5.github.io/webcomponents/components/SuggestionItemCustom/)

- Tag: `ui5-suggestion-item-custom`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/SuggestionItemCustom.d.ts).
- Local implementation: covered by `SelectOption` `description`/`icon` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-suggestion-item-custom` is type of suggestion item,
that can be used to place suggestion items with custom content in the input.
The text property is considered only for autocomplete.
In case the user needs highlighting functionality, check "@ui5/webcomponents-base/dist/util/generateHighlightedMarkup.js"

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string \| undefined` | `undefined` | Defines the text of the `ui5-suggestion-item-custom`.<br>**Note:** The text property is considered only for autocomplete. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the content of the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `text`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states
- Samples

### [SuggestionItemGroup](https://ui5.github.io/webcomponents/components/SuggestionItemGroup/)

- Tag: `ui5-suggestion-item-group`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/SuggestionItemGroup.d.ts).
- Local implementation: covered by `SelectOption.group` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-suggestion-item-group` is type of suggestion item,
that can be used to split the `ui5-input` suggestions into groups.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `headerAccessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the header. |
| `headerText` | `string \| undefined` | `undefined` | Defines the header text of the group. |
| `wrappingType` | `` `${WrappingType}` `` | `"None"` | Defines if the text of the component should wrap when it's too long.<br>When set to "Normal", the content (title, description) will be wrapped<br>using the `ui5-expandable-text` component.<br/><br><br>The text can wrap up to 100 characters on small screens (size S) and<br>up to 300 characters on larger screens (size M and above). When text exceeds<br>these limits, it truncates with an ellipsis followed by a text expansion trigger.<br><br>Available options are:<br>- `None` (default) - The text will truncate with an ellipsis.<br>- `Normal` - The text will wrap (without truncation). |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<SuggestionListItem>` | Defines the items of the <code>ui5-suggestion-item-group</code>. |
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

### [Switch](https://ui5.github.io/webcomponents/components/Switch/)

- Tag: `ui5-switch`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Switch.d.ts).
- Local implementation: `src/components/switch` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-switch` component is used for changing between binary states.

The component can display texts, that will be switched, based on the component state, via the `textOn` and `textOff` properties,
but texts longer than 3 letters will be cutted off.

However, users are able to customize the width of `ui5-switch` with pure CSS (`<ui5-switch style="width: 200px">`), and set widths, depending on the texts they would use.

Note: the component would not automatically stretch to fit the whole text width.

##### Keyboard Handling
The state can be changed by pressing the Space and Enter keys.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Switch";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Sets the accessible ARIA name of the component.<br><br>**Note**: We recommend that you set an accessibleNameRef pointing to an external label or at least an `accessibleName`.<br>Providing an `accessibleNameRef` or an `accessibleName` is mandatory in the cases when `textOn` and `textOff` properties aren't set. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component.<br><br>**Note**: We recommend that you set an accessibleNameRef pointing to an external label or at least an `accessibleName`.<br>Providing an `accessibleNameRef` or an `accessibleName` is mandatory in the cases when `textOn` and `textOff` properties aren't set. |
| `checked` | `boolean` | `false` | Defines if the component is checked.<br><br>**Note:** The property can be changed with user interaction,<br>either by clicking the component, or by pressing the `Enter` or `Space` key. |
| `design` | `` `${SwitchDesign}` `` | `"Textual"` | Defines the component design.<br><br>**Note:** If `Graphical` type is set,<br>positive and negative icons will replace the `textOn` and `textOff`. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br><br>**Note:** A disabled component is noninteractive. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `readonly` | `boolean` | `false` | Defines whether the component is in readonly state.<br><br>**Note:** A readonly switch cannot be toggled by user interaction,<br>but can still be focused and its value read programmatically. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `textOff` | `string \| undefined` | `undefined` | Defines the text, displayed when the component is not checked.<br><br>**Note:** We recommend using short texts, up to 3 letters (larger texts would be cut off). |
| `textOn` | `string \| undefined` | `undefined` | Defines the text, displayed when the component is checked.<br><br>**Note:** We recommend using short texts, up to 3 letters (larger texts would be cut off). |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component.<br><br>**Note:** If applicable an external label reference should always be the preferred option to provide context to the `ui5-switch` component over a tooltip. |
| `value` | `string` | `""` | Defines the form value of the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | true | Fired when the component checked state changes. |

#### CSS parts

- `handle`: Used to style the handle of the switch
- `slider`: Used to style the track, where the handle is being slid
- `text-off`: Used to style the `textOff` property text
- `text-on`: Used to style the `textOn` property text

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Switch/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Switch/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Switch/Basic/main.js).
- [Design](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Switch/Design/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Switch/Design/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Switch/Design/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `checked`.
- [ ] Verify `change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/switch` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Slots
- Public methods
- CSS custom states

### [Tab](https://ui5.github.io/webcomponents/components/Tab/)

- Tag: `ui5-tab`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Tab.d.ts).
- Local implementation: `src/components/tabs` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-tab` represents a selectable item inside a `ui5-tabcontainer`.
It defines both the item in the tab strip (top part of the `ui5-tabcontainer`) and the
content that is presented to the user once the tab is selected.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `additionalText` | `string \| undefined` | `undefined` | Represents the "additionalText" text, which is displayed in the tab. In the cases when in the same time there are tabs with icons and tabs without icons, if a tab has no icon the "additionalText" is displayed larger. |
| `design` | `` `${SemanticColor}` `` | `"Default"` | Defines the component's design color.<br><br>The design is applied to:<br><br>- the component icon<br>- the `text` when the component overflows<br>- the tab selection line<br><br>Available designs are: `"Default"`, `"Neutral"`, `"Positive"`, `"Critical"` and `"Negative"`.<br><br>**Note:** The design depends on the current theme. |
| `disabled` | `boolean` | `false` | Disabled tabs can't be selected. |
| `icon` | `string \| undefined` | `undefined` | Defines the icon source URI to be displayed as graphical element within the component.<br>The SAP-icons font provides numerous built-in icons.<br>See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `movable` | `boolean` | `false` | Defines if the tab is movable. |
| `selected` | `boolean` | `false` | Specifies if the component is selected. |
| `text` | `string \| undefined` | `undefined` | The text to be displayed for the item. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Holds the content associated with this tab. |
| `items` | `Slot<ITab>` | Defines hierarchies with nested sub tabs.<br><br>**Note:** Use `ui5-tab` and `ui5-tab-separator` for the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<TabClickEventDetail>` | true | false | Fired when the tab is selected either with a mouse/tap or by using the Enter or Space key. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `getDomRefInStrip` | `getDomRefInStrip(): HTMLElement \| undefined;` | Returns the DOM reference of the tab that is placed in the header.<br><br>**Note:** Tabs, placed in the `items` slot of other tabs are not shown in the header. Calling this method on such tabs will return `undefined`.<br><br>**Note:** If you need a DOM ref to the tab content please use the `getDomRef` method. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `additionalText`, `design`, `disabled`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/tabs` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- CSS parts
- CSS custom states
- Samples

### [TabContainer](https://ui5.github.io/webcomponents/components/TabContainer/)

- Tag: `ui5-tabcontainer`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TabContainer.d.ts).
- Local implementation: `src/components/tabs` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-tabcontainer` represents a collection of tabs with associated content.
Navigation through the tabs changes the content display of the currently active content area.
A tab can be labeled with text only, or icons with text.

##### Structure

The `ui5-tabcontainer` can hold two types of entities:

- `ui5-tab` - contains all the information on an item (text and icon)
- `ui5-tab-separator` - used to separate tabs with a line

##### Hierarchies
Multiple sub tabs could be placed underneath one main tab. Nesting allows deeper hierarchies with indentations
to indicate the level of each nested tab. When a tab has both sub tabs and own content its click area is split
to allow the user to display the content or alternatively to expand / collapse the list of sub tabs.

##### Keyboard Handling

##### Fast Navigation
This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TabContainer.js";`

`import "@ui5/webcomponents/dist/Tab.js";` (for `ui5-tab`)

`import "@ui5/webcomponents/dist/TabSeparator.js";` (for `ui5-tab-separator`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `allItems` | `Array<ITab>` | `[]` | Returns all slotted tabs and their subTabs in a flattened array.<br>The order of tabs is depth-first. |
| `collapsed` | `boolean` | `false` | Defines whether the tab content is collapsed. |
| `contentBackgroundDesign` | `` `${BackgroundDesign}` `` | `"Solid"` | Sets the background color of the Tab Container's content as `Solid`, `Transparent`, or `Translucent`. |
| `headerBackgroundDesign` | `` `${BackgroundDesign}` `` | `"Solid"` | Sets the background color of the Tab Container's header as `Solid`, `Transparent`, or `Translucent`. |
| `noAutoSelection` | `boolean` | `false` | Defines if automatic tab selection is deactivated.<br><br>**Note:** By default, if none of the child tabs have the `selected` property set, the first tab will be automatically selected.<br>Setting this property to `true` allows preventing this behavior. |
| `overflowMode` | `` `${OverflowMode}` `` | `"End"` | Defines the overflow mode of the header (the tab strip). If you have a large number of tabs, only the tabs that can fit on screen will be visible.<br>All other tabs that can 't fit on the screen are available in an overflow tab "More".<br><br>**Note:**<br>Only one overflow at the end would be displayed by default,<br>but when set to `StartAndEnd`, there will be two overflows on both ends, and tab order will not change on tab selection. |
| `tabLayout` | `` `${TabLayout}` `` | `"Standard"` | Defines the alignment of the content and the `additionalText` of a tab.<br><br>**Note:**<br>The content and the `additionalText` would be displayed vertically by default,<br>but when set to `Inline`, they would be displayed horizontally. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ITab>` | Defines the tabs.<br><br>**Note:** Use `ui5-tab` and `ui5-tab-separator` for the intended design. |
| `overflowButton` | `Slot<IButton>` | Defines the button which will open the overflow menu. If nothing is provided to this slot,<br>the default button will be used. |
| `startOverflowButton` | `Slot<IButton>` | Defines the button which will open the start overflow menu if available. If nothing is provided to this slot,<br>the default button will be used. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `move` | `CustomEvent<TabContainerMoveEventDetail>` | true | false | Fired when element is moved to the tab container.<br><br>**Note:** `move` event is fired only if there was a preceding `move-over` with prevented default action. |
| `move-over` | `CustomEvent<TabContainerMoveEventDetail>` | true | true | Fired when element is being moved over the tab container.<br><br>If the new position is valid, prevent the default action of the event using `preventDefault()`. |
| `tab-select` | `CustomEvent<TabContainerTabSelectEventDetail>` | true | true | Fired when a tab is selected. |

#### CSS parts

- `content`: Used to style the content of the component
- `tabstrip`: Used to style the tabstrip of the component

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/Basic/main.js).
- [Tab Layout](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/TabLayout/sample.tsx) — The `tabLayout` is "Standard" by default and can be switched to "Inline".; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/TabLayout/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/TabLayout/main.js).
- [Text-only Tabs](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/TextOnlyTabs/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/TextOnlyTabs/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/TextOnlyTabs/main.js).
- [Nested Tabs](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/NestedTabs/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/NestedTabs/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/NestedTabs/main.js).
- [Tabs Overflow Mode](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/OverflowMode/sample.tsx) — The `overflowMode` is "End" by default and can be switched to "StartAndEnd".; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/OverflowMode/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/OverflowMode/main.js).
- [Reorder Tabs](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/ReorderTabs/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/ReorderTabs/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/ReorderTabs/main.js).
- [Reorder Tabs with Max Nesting Level](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/ReorderTabsMaxNestingLevel/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/ReorderTabsMaxNestingLevel/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/ReorderTabsMaxNestingLevel/main.js).
- [Reorder Tabs with Fixed Tabs](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/ReorderTabsFixedTabs/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/ReorderTabsFixedTabs/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/ReorderTabsFixedTabs/main.js).
- [Transparent design](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/TransparentDesign/sample.tsx) — The inner TabContainer has `headerBackgroundDesign` and `contentBackgroundDesign` set to "Transparent".; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/TransparentDesign/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TabContainer/TransparentDesign/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `allItems`, `collapsed`, `contentBackgroundDesign`.
- [ ] Verify `move`, `move-over`, `tab-select` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/tabs` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [Table](https://ui5.github.io/webcomponents/components/Table/)

- Tag: `ui5-table`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Table.d.ts).
- Local implementation: `src/components/table` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table` component provides a set of sophisticated features for displaying and dealing with vast amounts of data in a responsive manner.
To render the `ui5-table`, you need to define the columns and rows. You can use the provided `ui5-table-header-row` and `ui5-table-row` components for this purpose.

##### Features

The `ui5-table` can be enhanced in its functionalities by applying different features.
Features can be slotted into the `features` slot, to enable them in the component.
Features need to be imported separately, as they are not enabled by default.

The following features are currently available:

* [TableSelectionMulti](../TableSelectionMulti) - adds multi-selection capabilities to the table
* [TableSelectionSingle](../TableSelectionSingle) - adds single-selection capabilities to the table
* [TableGrowing](../TableGrowing) - provides growing capabilities to load more data
* [TableVirtualizer](../TableVirtualizer) - adds virtualization capabilities to the table

##### Keyboard Handling

This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
In order to use this functionality, you need to import the following module:
`import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`

Furthermore, you can interact with `ui5-table` via the following keys:

If the focus is on a row, the following keyboard shortcuts are available:
* <kbd>Down</kbd> - Navigates down
* <kbd>Up</kbd> - Navigates up
* <kbd>Right</kbd> - Selects the first cell of the row
* <kbd>Space</kbd> - Toggles the selection of the row
* <kbd>Ctrl/Cmd + A</kbd> - In multi selection mode, toggles the selection of all rows
* <kbd>Home</kbd> - Navigates to the first row, if the focus is on the first row, navigates to the header row
* <kbd>End</kbd> - Navigates to the last row, if the focus is on the last row, navigates to the growing button
* <kbd>Page Up</kbd> - Navigates one page up, if the focus is on the first row, navigates to the header row
* <kbd>Page Down</kbd> - Navigates one page down, if the focus is on the last row, navigates to the growing button
* <kbd>F2</kbd> - Focuses the first tabbable element in the row
* <kbd>F7</kbd> - If focus position is remembered, moves focus to the corresponding focus position row, otherwise to the first tabbable element within the row
* <kbd>[Shift]Tab</kbd> - Move focus to the element in the tab chain outside the table

If the focus is on a cell, the following keyboard shortcuts are available:
* <kbd>Down</kbd> - Navigates down
* <kbd>Up</kbd> - Navigates up
* <kbd>Right</kbd> - Navigates right
* <kbd>Left</kbd> - Navigates left, if the focus is on the first cell of the row, the focus is moved to the row.
* <kbd>Home</kbd> - Navigates to the first cell of the current row, if the focus is on the first cell, navigates to the corresponding row
* <kbd>End</kbd> - Navigates to the last cell of the current row, if the focus is on the last cell, navigates to the corresponding row
* <kbd>Page Up</kbd> - Navigates one page up while keeping the focus in same column
* <kbd>Page Down</kbd> - Navigates one page down while keeping the focus in same column
* <kbd>F2</kbd> - Toggles the focus between the first tabbable cell content and the cell
* <kbd>Enter</kbd> - Focuses the first tabbable cell content
* <kbd>F7</kbd> - If the focus is on an interactive element inside a row, moves focus to the corresponding row and remembers the focus position of the element within the row
* <kbd>[Shift]Tab</kbd> - Move focus to the element in the tab chain outside the table

If the focus is on an interactive cell content, the following keyboard shortcuts are available:
* <kbd>Down</kbd> - Move the focus to the interactive element in the same column of the previous row, unless the focused element prevents the default
* <kbd>Up</kbd> - Move the focus to the interactive element in the same column of the next row, unless the focused element prevents the default
* <kbd>[Shift]Tab</kbd> - Move the focus to the element in the tab chain

##### Accessibility

The `ui5-table` follows the [ARIA grid design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).
This pattern enables cell-based keyboard navigation and, as explained above, we also support row-based keyboard navigation.
Since the grid design pattern does not inherently provide row-based keyboard behavior, if the focus is on a row, not only the row information but also the corresponding column headers for each cell must be announced.
This can only be achieved through a custom accessibility announcement.
To support this, UI5 Web Components expose its own accessibility metadata via the `accessibilityInfo` property.
The `ui5-table` uses this information to create the required custom announcements dynamically.
If you include custom web components inside table cells that are not part of the standard UI5 Web Components set, their accessibility information can be provided using the `data-ui5-acc-text` attribute.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Table.js";` (`ui5-table`)\
`import "@ui5/webcomponents/dist/TableRow.js";` (`ui5-table-row`)\
`import "@ui5/webcomponents/dist/TableCell.js";` (`ui5-table-cell`)\
`import "@ui5/webcomponents/dist/TableHeaderRow.js";` (`ui5-table-header-row`)\
`import "@ui5/webcomponents/dist/TableHeaderCell.js";` (`ui5-table-header-cell`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Identifies the element (or elements) that labels the component. |
| `alternateRowColors` | `boolean` | `false` | Determines whether the table rows are displayed with alternating background colors. |
| `loading` | `boolean` | `false` | Defines if the loading indicator should be shown.<br><br>**Note:** When the component is loading, it is not interactive. |
| `loadingDelay` | `number` | `1000` | Defines the delay in milliseconds, after which the loading indicator will show up for this component. |
| `noDataText` | `string \| undefined` | `undefined` | Defines the text to be displayed when there are no rows in the component. |
| `overflowMode` | `` `${TableOverflowMode}` `` | `"Scroll"` | Defines the mode of the <code>ui5-table</code> overflow behavior.<br><br>Available options are:<br><br><code>Scroll</code> - Columns are shown as regular columns and horizontal scrolling is enabled.<br><code>Popin</code> - Columns are shown as pop-ins instead of regular columns. |
| `rowActionCount` | `number` | `0` | Defines the maximum number of row actions that is displayed, which determines the width of the row action column.<br><br>**Note:** It is recommended to use a maximum of 3 row actions, as exceeding this limit may take up too much space on smaller screens. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<TableRow>` | Defines the rows of the component.<br><br>**Note:** Use `ui5-table-row` for the intended design. |
| `features` | `Slot<ITableFeature>` | Defines the features of the component. |
| `headerRow` | `Slot<TableHeaderRow>` | Defines the header row of the component.<br><br>**Note:** Use `ui5-table-header-row` for the intended design. |
| `noData` | `Slot<HTMLElement>` | Defines the custom visualization if there is no data available. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `move` | `CustomEvent<TableMoveEventDetail>` | true | false | Fired when a movable list item is dropped onto a drop target.<br><br>**Notes:**<br><br>The `move` event is fired only if there was a preceding `move-over` with prevented default action.<br><br>If the dragging operation is a cross-browser operation or files are moved to a potential drop target,<br>the `source` parameter will be `null`. |
| `move-over` | `CustomEvent<TableMoveEventDetail>` | true | true | Fired when a movable item is moved over a potential drop target during a dragging operation.<br><br>If the new position is valid, prevent the default action of the event using `preventDefault()`.<br><br>**Note:** If the dragging operation is a cross-browser operation or files are moved to a potential drop target,<br>the `source` parameter will be `null`. |
| `row-action-click` | `CustomEvent<TableRowActionClickEventDetail>` | false | false | Fired when a row action is clicked. |
| `row-click` | `CustomEvent<TableRowClickEventDetail>` | false | false | Fired when an interactive row is clicked.<br><br>**Note:** This event is not fired if the `behavior` property of the selection component is set to `RowOnly`.<br>In that case, use the `change` event of the selection component instead. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Basic/main.js).
- [Overflow Mode - Scroll](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/ScrollMode/sample.tsx) — The table provides two horizontal overflow modes: Scroll (default) or Popin.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/ScrollMode/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/ScrollMode/main.js).
- [Overflow Mode - Popin](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Popin/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Popin/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Popin/main.js).
- [Sticky Header Row](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/StickyHeader/sample.tsx) — Enable a sticky header by utilizing the `sticky` and `sticky-top` properties of the `ui5-table-header-row`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/StickyHeader/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/StickyHeader/main.js).
- [No Data](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/NoDataSlot/sample.tsx) — You can provide an illustration or a custom text that is shown when the table has no data using the `noData` slot.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/NoDataSlot/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/NoDataSlot/main.js).
- [Interactive Rows](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Interactive/sample.tsx) — Create an interactive table by marking `ui5-table-row` components as `interactive`. Pressing on an interactive row will fire the `row-click` event.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Interactive/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Interactive/main.js).
- [Drag and Drop](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/DragAndDrop/sample.tsx) — Enable Drag and Drop by using the `move-over` and `move` events in combination with the `movable` property on the `ui5-table-row`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/DragAndDrop/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/DragAndDrop/main.js).
- [Row Grouping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Grouping/sample.tsx) — Use `ui5-table-group-row` to visually group rows.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Grouping/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Table/Grouping/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `alternateRowColors`.
- [ ] Verify `move`, `move-over`, `row-action-click`, `row-click` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/table` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [TableCell](https://ui5.github.io/webcomponents/components/TableCell/)

- Tag: `ui5-table-cell`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableCell.d.ts).
- Local implementation: covered by `Table` `columns` render functions (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-cell` represents a cell inside of a `ui5-table`.
It is tightly coupled to the `ui5-table` and thus should only be used in the table component.

##### ES6 Module Import

`import @ui5/webcomponents/dist/TableCell.js;`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `` `${TableCellHorizontalAlign}` \| undefined `` | `undefined` | Determines the horizontal alignment of table cells. |
| `merged` | `boolean` | `false` | Defines whether the cell is visually merged with the cell directly above it.<br><br>This is useful if consecutive cells in a column have the same value and should visually appear as a single merged cell.<br>Although the cell is visually merged with the previous one, its content must still be provided for accessibility purposes.<br>**Note:** This feature is disabled when cells are rendered as a popin, and should remain `false` for interactive cell content. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the content of the component. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `horizontalAlign`, `merged`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableGroupRow](https://ui5.github.io/webcomponents/components/TableGroupRow/)

- Tag: `ui5-table-group-row`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableGroupRow.d.ts).
- Local implementation: covered by `DataGrid` grouping (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-group-row` component represents a group header row in the `ui5-table`.
It is used to visually group rows and spans across all visible table columns.

##### Usage

The `ui5-table-group-row` is placed as a direct child of `ui5-table`, alongside `ui5-table-row` elements.
Rows following a group row are considered part of that group until the next group row.

```html
<ui5-table>
  <ui5-table-header-row>...</ui5-table-header-row>
  <ui5-table-group-row>Country: Germany</ui5-table-group-row>
  <ui5-table-row>...</ui5-table-row>
  <ui5-table-row>...</ui5-table-row>
  <ui5-table-group-row>Country: France</ui5-table-group-row>
  <ui5-table-row>...</ui5-table-row>
</ui5-table>
```

##### Unsupported Features

The following features of `ui5-table-row` are currently not supported by `ui5-table-group-row` and have no effect:

- **Cells** (`cells` slot): Group rows render a single spanning cell with a text. Any slotted `ui5-table-cell` elements are ignored.
- **Actions** (`actions` slot): Row actions such as `ui5-table-row-action` or `ui5-table-row-action-navigation` are not rendered.
- **Navigation** (`navigated` property): The navigated indicator is not rendered on group rows.
- **Interactive** (`interactive` property): Group rows do not support click/activation behavior.
- **Selection** (`rowKey` property`): Group rows cannot be selected. They are excluded from select all and range selection operations.
- **Virtualizer** (`position` property`): Group rows are not supported by the `ui5-table-virtualizer`.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableGroupRow.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `interactive` | `boolean` | `false` | Defines the interactive state of the row. |
| `movable` | `boolean` | `false` | Defines whether the row is movable. |
| `navigated` | `boolean` | `false` | Defines the navigated state of the row. |
| `position` | `number \| undefined` | `undefined` | Defines the 0-based position of the row related to the total number of rows within the table when the `ui5-table-virtualizer` feature is used. |
| `rowKey` | `string \| undefined` | `undefined` | Unique identifier of the row.<br><br>**Note:** For selection features to work properly, this property is mandatory, and its value must not contain spaces. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `actions` | `Slot<TableRowActionBase>` | Defines the actions of the component.<br><br>**Note:** Use `ui5-table-row-action` or `ui5-table-row-action-navigation` for the intended design. |
| `default` | `DefaultSlot<TableCell>` | Defines the cells of the component.<br><br>**Note:** Use `ui5-table-cell` for the intended design. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `interactive`, `movable`, `navigated`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableGrowing](https://ui5.github.io/webcomponents/components/TableGrowing/)

- Tag: `ui5-table-growing`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableGrowing.d.ts).
- Local implementation: covered by `Table`/`DataGrid` pagination and `VirtualList` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-growing` component is used inside the `ui5-table` to add a growing/data loading functionalities
to the table.

The component offers two options:
* Button - a More button is displayed, clicking it will load more data.
* Scroll - additional data is loaded automatically when the user scrolls to the end of the table.

##### Usage

The `ui5-table-growing` component is only used inside the `ui5-table` component as a feature.
It has to be slotted inside the `ui5-table` in the `features` slot.
The component is not intended to be used as a standalone component.

```html
<ui5-table>
	<ui5-table-growing mode="Button" text="More" slot="features"></ui5-table-growing>
</ui5-table>
```

**Notes**:
* When the `ui5-table-growing` component is used with the `Scroll` mode and the table is currently not scrollable,
the component will render a growing button instead to ensure growing capabilities until the table becomes scrollable.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableGrowing.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `` `${TableGrowingMode}` `` | `"Button"` | Defines the mode of the <code>ui5-table</code> growing.<br><br>Available options are:<br><br>Button - Shows a More button at the bottom of the table, pressing it will load more rows.<br><br>Scroll - The rows are loaded automatically by scrolling to the bottom of the table. If the table is not scrollable,<br>a growing button will be rendered instead to ensure growing functionality. |
| `subtext` | `string \| undefined` | `undefined` | Defines the text that will be displayed below the `text` inside the growing button.<br>Has no effect when mode is set to Scroll. |
| `text` | `string \| undefined` | `undefined` | Defines the text that will be displayed inside the growing button.<br>Has no effect when mode is set to `Scroll`.<br><br>**Note:** When not provided and the mode is set to Button, a default text is displayed, corresponding to the<br>current language. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `load-more` | `CustomEvent` | false | false | Fired when the growing button is pressed or the user scrolls to the end of the table. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `mode`, `subtext`, `text`.
- [ ] Verify `load-more` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableHeaderCell](https://ui5.github.io/webcomponents/components/TableHeaderCell/)

- Tag: `ui5-table-header-cell`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableHeaderCell.d.ts).
- Local implementation: covered by `Table` `columns` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-header-cell` component represents a column in the `ui5-table`.

As it is tightly coupled to the `ui5-table`, it should only be used in the `ui5-table-header-row`
to ensure correct layout and design.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableHeaderCell.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `` `${TableCellHorizontalAlign}` \| undefined `` | `undefined` | Determines the horizontal alignment of table cells. |
| `importance` | `number` | `0` | Defines the importance of the column.<br><br>This property affects the popin behaviour.<br>Columns with higher importance will move into the popin area later then less important<br>columns. |
| `minWidth` | `string \| undefined` | `undefined` | Defines the minimum width of the column.<br><br>If the table is in `Popin` mode and the minimum width does not fit anymore,<br>the column will move into the popin.<br><br>By default, the table prevents the column from becoming too small.<br>Changing this value to a small value might lead to accessibility issues.<br><br>**Note:** This property only takes effect for columns with a [\<percentage\>](https://developer.mozilla.org/en-US/docs/Web/CSS/percentage) value<br>or the default width. |
| `popinHidden` | `boolean` | `false` | Defines if the column is hidden in the popin.<br><br>**Note:** Please be aware that hiding the column in the popin might lead to accessibility issues as<br>users might not be able to access the content of the column on small screens. |
| `popinText` | `string \| undefined` | `undefined` | The text for the column when it pops in. |
| `sortIndicator` | `` `${SortOrder}` `` | `"None"` | Defines the sort indicator of the column. |
| `width` | `string \| undefined` | `undefined` | Defines the width of the column.<br><br>By default, the column will grow and shrink according to the available space.<br>This will distribute the space proportionally among all columns with no specific width set.<br><br>See [\<length\>](https://developer.mozilla.org/en-US/docs/Web/CSS/length) and<br>[\<percentage\>](https://developer.mozilla.org/en-US/docs/Web/CSS/percentage) for possible width values. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `action` | `Slot<TableHeaderCellActionBase>` | Defines the action of the column.<br><br>**Note:** While multiple actions are technically possible, this is not supported. |
| `default` | `DefaultSlot<Node>` | Defines the content of the component. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `horizontalAlign`, `importance`, `minWidth`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableHeaderCellActionAI](https://ui5.github.io/webcomponents/components/TableHeaderCellActionAI/)

- Tag: `ui5-table-header-cell-action-ai`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableHeaderCellActionAI.d.ts).
- Local implementation: not implemented — AI header action is application-specific; compose an `AIButton` in a `Table` column header.
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-header-cell-action-ai` component defines a dedicated AI action for the table column.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableHeaderCellActionAI.js";`

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<TableHeaderCellActionClickEventDetail>` | false | false | Fired when a header cell action is clicked. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- TypeScript properties
- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableHeaderRow](https://ui5.github.io/webcomponents/components/TableHeaderRow/)

- Tag: `ui5-table-header-row`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableHeaderRow.d.ts).
- Local implementation: covered by `Table` `columns` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-header-row` component represents the table headers of a `ui5-table`.

It is tightly coupled to the `ui5-table` and should therefore be used in the `ui5-table` only.
The header row is placed in the `headerRow` slot of the table.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableHeaderRow.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `sticky` | `boolean` | `false` | Sticks the `ui5-table-header-row` to the top of a table.<br><br>Note: If used in combination with overflowMode "Scroll", the table needs a defined height for the sticky header to work as expected. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<TableHeaderCell>` | Defines the cells of the component.<br><br>**Note:** Use `ui5-table-header-cell` for the intended design. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `sticky`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableRow](https://ui5.github.io/webcomponents/components/TableRow/)

- Tag: `ui5-table-row`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableRow.d.ts).
- Local implementation: covered by `Table` `rows` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-row` component represents a row in the `ui5-table`.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableRow.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `interactive` | `boolean` | `false` | Defines the interactive state of the row. |
| `movable` | `boolean` | `false` | Defines whether the row is movable. |
| `navigated` | `boolean` | `false` | Defines the navigated state of the row. |
| `position` | `number \| undefined` | `undefined` | Defines the 0-based position of the row related to the total number of rows within the table when the `ui5-table-virtualizer` feature is used. |
| `rowKey` | `string \| undefined` | `undefined` | Unique identifier of the row.<br><br>**Note:** For selection features to work properly, this property is mandatory, and its value must not contain spaces. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `actions` | `Slot<TableRowActionBase>` | Defines the actions of the component.<br><br>**Note:** Use `ui5-table-row-action` or `ui5-table-row-action-navigation` for the intended design. |
| `default` | `DefaultSlot<TableCell>` | Defines the cells of the component.<br><br>**Note:** Use `ui5-table-cell` for the intended design. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `interactive`, `movable`, `navigated`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableRowAction](https://ui5.github.io/webcomponents/components/TableRowAction/)

- Tag: `ui5-table-row-action`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableRowAction.d.ts).
- Local implementation: covered by `Table` row actions column (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-row-action` component defines an action for table rows.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableRowAction.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string` | `""` | Defines the icon of the row action.<br><br>**Note:** For row actions to work properly, this property is mandatory.<br><br>**Note:** SAP-icons font provides numerous built-in icons. To find all the available icons, see the<br>[Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `invisible` | `boolean` | `false` | Defines the visibility of the row action.<br><br>**Note:** Invisible row actions still take up space, allowing to hide the action while maintaining its position. |
| `text` | `string` | `""` | Defines the text of the row action.<br><br>**Note:** For row actions to work properly, this property is mandatory. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | false | false | Fired when a row action is clicked. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `icon`, `invisible`, `text`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableRowActionNavigation](https://ui5.github.io/webcomponents/components/TableRowActionNavigation/)

- Tag: `ui5-table-row-action-navigation`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableRowActionNavigation.d.ts).
- Local implementation: covered by `Table` row click / link column (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-row-action-navigation` component defines a navigation action for table rows.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableRowActionNavigation.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `interactive` | `boolean` | `false` | Defines the interactive state of the navigation action.<br>**Deprecated:** As of version 2.20.0, the navigation icon is deprecated.<br>For better accessibility, the interactive mode which renders a button, must be used instead. To handle the action, attach a listener to the `click` event.<br>If the navigation should be triggered when a row is pressed, set the row's `interactive` property and use the `row-click` event of the `ui5-table`.<br>This property will be removed in the next major version. |
| `invisible` | `boolean` | `false` | Defines the visibility of the row action.<br><br>**Note:** Invisible row actions still take up space, allowing to hide the action while maintaining its position. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | false | false | Fired when a row action is clicked. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `interactive`, `invisible`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableSelection](https://ui5.github.io/webcomponents/components/TableSelection/)

- Tag: `ui5-table-selection`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableSelection.d.ts).
- Local implementation: covered by `Table` selection props (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-selection` component is used inside the `ui5-table` to add key-based selection capabilities to the `ui5-table`.

The component offers three selection modes:
* Single - select a single row.
* Multiple - select multiple rows.
* None - no selection active.

As the selection is key-based, `ui5-table-row` components need to define a unique `row-key` property.

##### Usage

The `ui5-table-selection` component is only used inside the `ui5-table` component as a feature.
It has to be slotted inside the `ui5-table` in the `features` slot.
The component is not intended to be used as a standalone component.

```html
<ui5-table>
	<ui5-table-selection mode="Multiple" slot="features"></ui5-table-selection>
</ui5-table>
```

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableSelection.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `` `${TableSelectionMode}` `` | `"Multiple"` | Defines the selection mode. |
| `selected` | `string` | `""` | Defines the selected rows separated by a space. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the selection is changed by user interaction. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `mode`, `selected`.
- [ ] Verify `change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- CSS custom states
- Samples

### [TableSelectionMulti](https://ui5.github.io/webcomponents/components/TableSelectionMulti/)

- Tag: `ui5-table-selection-multi`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableSelectionMulti.d.ts).
- Local implementation: covered by `Table` multi selection (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-selection-multi` component is used inside the `ui5-table` to add multi-selection capabilities to the `ui5-table`.
Since selection is key-based, each `ui5-table-row` must define a unique `row-key` property.

##### Usage

The `ui5-table-selection-multi` component is a feature designed exclusively for use within the `ui5-table` component.
It must be placed inside the `features` slot of `ui5-table`.
This component is not intended for standalone use.

```html
<ui5-table>
	<ui5-table-selection-multi slot="features" selected="Row1 Row3"></ui5-table-selection-multi>
</ui5-table>
```

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableSelectionMulti.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `behavior` | `` `${TableSelectionBehavior}` `` | `"RowSelector"` | Defines the selection behavior. |
| `headerSelector` | `` `${TableSelectionMultiHeaderSelector}` `` | `"SelectAll"` | Defines the selector of the header row. |
| `selected` | `string \| undefined` | `undefined` | Defines the `row-key` values of selected rows, with each value separated by a space. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | false | false | Fired when the selection is changed by user interaction. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `getRowByKey` | `getRowByKey(rowKey: string): TableRow \| undefined;` | Returns the table row instance for the given row key. |
| `getSelectedAsSet` | `getSelectedAsSet(): Set<string>;` | Returns the `selected` property as a set of unique `row-key` values. |
| `getSelectedRows` | `getSelectedRows(): TableRow[];` | Returns an array of the selected rows. |
| `setSelectedAsSet` | `setSelectedAsSet(selectedSet: Set<string>): void;` | Sets the `selected` property using the provided set of unique `row-key` values. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `behavior`, `headerSelector`, `selected`.
- [ ] Verify `change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- CSS parts
- CSS custom states
- Samples

### [TableSelectionSingle](https://ui5.github.io/webcomponents/components/TableSelectionSingle/)

- Tag: `ui5-table-selection-single`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableSelectionSingle.d.ts).
- Local implementation: covered by `Table` single selection (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-selection-single` component is used inside the `ui5-table` to add single selection capabilities to the `ui5-table`.
Since selection is key-based, each `ui5-table-row` must define a unique `row-key` property.

##### Usage

The `ui5-table-selection-single` component is a feature designed exclusively for use within the `ui5-table` component.
It must be placed inside the `features` slot of `ui5-table`.
This component is not intended for standalone use.

```html
<ui5-table>
	<ui5-table-selection-single slot="features" selected="Row1"></ui5-table-selection-single>
</ui5-table>
```

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TableSelectionSingle.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `behavior` | `` `${TableSelectionBehavior}` `` | `"RowSelector"` | Defines the selection behavior. |
| `selected` | `string \| undefined` | `undefined` | Defines the `row-key` value of the selected row. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | false | false | Fired when the selection is changed by user interaction. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `getRowByKey` | `getRowByKey(rowKey: string): TableRow \| undefined;` | Returns the table row instance for the given row key. |
| `getSelectedRow` | `getSelectedRow(): TableRow \| undefined;` | Returns the selected row. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `behavior`, `selected`.
- [ ] Verify `change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- CSS parts
- CSS custom states
- Samples

### [TableVirtualizer](https://ui5.github.io/webcomponents/components/TableVirtualizer/)

- Tag: `ui5-table-virtualizer`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TableVirtualizer.d.ts).
- Local implementation: covered by `DataGrid` virtualization (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-table-virtualizer` component is used inside the `ui5-table` to virtualize the table rows, if the `overflowMode` property of the table is set to 'Scroll'.
It is responsible for rendering only the rows that are visible in the viewport and updating them on scroll.
This allows large numbers of rows to exist, but maintain high performance by only paying the cost for those that are currently visible.

**Note:** The maximum number of virtualized rows is limited by browser constraints, specifically the maximum supported height for a DOM element.
**Note:** The `ui5-table-group-row` component is not supported by the virtualizer. Only `ui5-table-row` elements can be virtualized.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/TableVirtualizer.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `extraRows` | `number` | `0` | Defines the count of extra rows to be rendered at the top and bottom of the table.<br><br>**Note:** This property is experimental and may be changed or deleted in the future. |
| `rowCount` | `number` | `100` | Defines the total count of rows in the table.<br><br>**Note:** For virtualization to work properly, this property is mandatory. |
| `rowHeight` | `number` | `45` | Defines the height of the rows in the table.<br><br>**Note:** For virtualization to work properly, this property is mandatory. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `range-change` | `CustomEvent<RangeChangeEventDetail>` | false | false | Fired when the virtualizer is changed by user interaction e.g. on scrolling. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `reset` | `reset(): void;` | Resets the virtualizer to its initial state and triggers the `range-change` event. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `extraRows`, `rowCount`, `rowHeight`.
- [ ] Verify `range-change` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- CSS parts
- CSS custom states
- Samples

### [TabSeparator](https://ui5.github.io/webcomponents/components/TabSeparator/)

- Tag: `ui5-tab-separator`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TabSeparator.d.ts).
- Local implementation: covered by `TabList` composition (separators rendered by the app) (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-tab-separator` represents a vertical line to separate tabs inside a `ui5-tabcontainer`.

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `getDomRefInStrip` | `getDomRefInStrip(): HTMLElement \| undefined;` | Returns the DOM reference of the separator that is placed in the header.<br><br>**Note:** Separators, placed in the `items` slot of other tabs are not shown in the header. Calling this method on such separators will return `undefined`. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.

#### Empty documentation fields

- TypeScript properties
- Slots
- Events
- CSS parts
- CSS custom states
- Samples

### [Tag](https://ui5.github.io/webcomponents/components/Tag/)

- Tag: `ui5-tag`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Tag.d.ts).
- Local implementation: covered by `src/components/badge` and `src/components/status-indicator` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-tag` is a component which serves
the purpose to attract the user attention to some piece
of information (state, quantity, condition, etc.).
It can contain icon and text information, and its design can be chosen from specific design types.

##### Usage Guidelines

- If the text is longer than the width of the component, it can wrap, or it can show ellipsis, depending on the `wrappingType` property.
- Colors can be semantic or not semantic.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Tag.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `colorScheme` | `string` | `"1"` | Defines the color scheme of the component.<br>There are 10 predefined schemes.<br>To use one you can set a number from `"1"` to `"10"`. The `colorScheme` `"1"` will be set by default. |
| `design` | `` `${TagDesign}` `` | `"Neutral"` | Defines the design type of the component. |
| `hideStateIcon` | `boolean` | `false` | Defines if the default state icon is shown. |
| `interactive` | `boolean` | `false` | Defines if the component is interactive (focusable and pressable). |
| `size` | `` `${TagSize}` `` | `"S"` | Defines predefined size of the component. |
| `wrappingType` | `` `${WrappingType}` `` | `"Normal"` | Defines how the text of a component will be displayed when there is not enough space.<br><br>**Note:** For option "Normal" the text will wrap and the<br>words will not be broken based on hyphenation. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |
| `icon` | `Slot<IIcon>` | Defines the icon to be displayed in the component. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | true | false | Fired when the user clicks on an interactive tag.<br><br>**Note:** The event will be fired if the `interactive` property is `true` |

#### CSS parts

- `root`: Used to style the root element.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Basic/main.js).
- [Designs](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Designs/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Designs/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Designs/main.js).
- [Interactive Tag](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Interactive/sample.tsx) — An Interactive tag responds to focus, hover and press.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Interactive/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Interactive/main.js).
- [Text Wrapping](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/WrappingTypes/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/WrappingTypes/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/WrappingTypes/main.js).
- [Color Scheme Set 1](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Set1/sample.tsx) — You can use color schemes from different sets, here is the set "1".; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Set1/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Set1/main.js).
- [Color Scheme Set 2](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Set2/sample.tsx) — You can use color schemes from different sets, here is the set "2".; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Set2/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Set2/main.js).
- [Size](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Size/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Size/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tag/Size/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `colorScheme`, `design`, `hideStateIcon`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS custom states

### [Text](https://ui5.github.io/webcomponents/components/Text/)

- Tag: `ui5-text`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Text.d.ts).
- Local implementation: `src/components/text` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-text` component displays text that can be used in any content area of an application.

##### Usage

- Use the `ui5-text` if you want to display text inside a form, table, or any other content area.
- Do not use the `ui5-text` if you need to reference input type of components (use ui5-label).

##### Responsive behavior

The `ui5-text` component is fully adaptive to all screen sizes.
By default, the text will wrap when the space is not enough.
In addition, the component supports truncation via the `max-lines` property,
by defining the number of lines the text should wrap before start truncating.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Text";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `emptyIndicatorMode` | `` `${TextEmptyIndicatorMode}` `` | `"Off"` | Specifies if an empty indicator should be displayed when there is no text. |
| `maxLines` | `number` | `Infinity` | Defines the number of lines the text should wrap before it truncates. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the text of the component. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/Basic/main.js).
- [Max Lines](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/MaxLines/sample.tsx) — The `maxLines` property defines the number of lines the text would wrap before start truncating.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/MaxLines/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/MaxLines/main.js).
- [Empty Indicator Mode](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/EmptyIndicatorMode/sample.tsx) — The `emptyIndicatorMode` property specifies if an empty indicator should be displayed when there is no text.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/EmptyIndicatorMode/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/EmptyIndicatorMode/main.js).
- [Custom Styling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/CustomStyling/sample.tsx) — The text can be customized with pure CSS, applied on the tag.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/CustomStyling/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/CustomStyling/main.js).
- [Render white space with custom styling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/RenderWhiteSpace/sample.tsx) — Handle white spaces in the text with standard CSS, applied on the tag.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/RenderWhiteSpace/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/RenderWhiteSpace/main.js).
- [Hyphenation with custom styling](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/Hyphenation/sample.tsx) — The text hyphenation can be customized with pure CSS, applied on the tag.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/Hyphenation/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Text/Hyphenation/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `emptyIndicatorMode`, `maxLines`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states

### [TextArea](https://ui5.github.io/webcomponents/components/TextArea/)

- Tag: `ui5-textarea`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TextArea.d.ts).
- Local implementation: `src/components/text-area` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-textarea` component is used to enter multiple rows of text.

When empty, it can hold a placeholder similar to a `ui5-input`.
You can define the rows of the `ui5-textarea` and also determine specific behavior when handling long texts.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TextArea.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
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
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the component.<br>The value state message slot should contain only one root element.<br> <br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed if the component has<br>`valueState` of type `Information`, `Critical` or `Negative`. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent` | true | false | Fired when the text has changed and the focus leaves the component. |
| `input` | `CustomEvent<TextAreaInputEventDetail>` | true | true | Fired when the value of the component changes at each keystroke or when<br>something is pasted. |
| `scroll` | `CustomEvent` | true | false | Fired when textarea is scrolled. |
| `select` | `CustomEvent` | true | false | Fired when some text has been selected. |

#### CSS parts

- `textarea`: Used to style the native textarea

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/Basic/main.js).
- [Growing](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/Growing/sample.tsx) — The TextArea can grow when entering new lines.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/Growing/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/Growing/main.js).
- [Max Length](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/MaxLength/sample.tsx) — You can use the `maxlength` and `counterMode` properties to define a characters limit and to indicate how many characters are remaining before or exceeding the limit. Set `counterMode` to `"Always"` to keep the counter permanently visible.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/MaxLength/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/MaxLength/main.js).
- [Exceeded Text](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/ExceededText/sample.tsx) — Set `counterMode` to `"Auto"` to show the character counter only when the TextArea is focused or when the character limit is exceeded.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/ExceededText/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/ExceededText/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/States/sample.tsx) — TextArea supports several semantic value states, readonly, disabled, etc.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/States/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TextArea/States/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `change`, `input`, `scroll`, `select` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/text-area` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [TimePicker](https://ui5.github.io/webcomponents/components/TimePicker/)

- Tag: `ui5-time-picker`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TimePicker.d.ts).
- Local implementation: `src/components/time-picker` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-time-picker` component provides an input field with assigned clocks which are opened on user action.
The `ui5-time-picker` allows users to select a localized time using touch, mouse, or keyboard input.
It consists of two parts: the time input field and the clocks.

##### Usage
The user can enter a time by:

- Using the clocks that are displayed in a popup
- Typing it in directly in the input field

When the user makes an entry and chooses the enter key, the clocks show the corresponding time (hours, minutes and seconds separately).
When the user directly triggers the clocks display, the actual time is displayed.
For the `ui5-time-picker`

##### Formatting

If a time is entered by typing it into
the input field, it must fit to the used time format.

Supported format options are pattern-based on Unicode LDML Date Format notation.
For more information, see [UTS #35: Unicode Locale Data Markup Language](https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).

For example, if the valueFormat is "HH:mm:ss", the displayFormat is "hh:mm: ss a", and the used locale is English, a valid value string is "11:42:35", which leads to an output of "11:42:35 AM".
If no placeholder is set to the TimePicker, the used displayFormat is displayed as a placeholder. If another placeholder is needed, it must be set.

##### Keyboard handling
[F4], [Alt]+[Up], [Alt]+[Down] Open/Close picker dialog and move focus to it.

When closed:

- [Page Up] - Increments hours by 1. If 12 am is reached, increment hours to 1 pm and vice versa.
- [Page Down] - Decrements the corresponding field by 1. If 1 pm is reached, decrement hours to 12 am and vice versa.
- [Shift]+[Page Up] - Increments minutes by 1.
- [Shift]+[Page Down] - Decrements minutes by 1.
- [Shift]+[Ctrl]+[Page Up] - Increments seconds by 1.
- [Shift]+[Ctrl]+[Page Down] - Decrements seconds by 1.
-

When opened:

- [Page Up] - Increments hours by 1. If 12 am is reached, increment hours to 1 pm and vice versa.
- [Page Down] - Decrements the corresponding field by 1. If 1 pm is reached, decrement hours to 12 am and vice versa.
- [Shift]+[Page Up] - Increments minutes by 1.
- [Shift]+[Page Down] - Decrements minutes by 1.
- [Shift]+[Ctrl]+[Page Up] - Increments seconds by 1.
- [Shift]+[Ctrl]+[Page Down] - Decrements seconds by 1.
- [A] or [P] - Selects AM or PM respectively.
- [0]-[9] - Allows direct time selecting (hours/minutes/seconds).
- [:] - Allows switching between hours/minutes/seconds clocks. If the last clock is displayed and [:] is pressed, the first clock is beind displayed.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/TimePicker.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that describe the input. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the aria-label attribute for the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id (or many ids) of the elements that label the component. |
| `dateValue` | `Date \| null` | `null` | Currently selected time represented as JavaScript Date instance |
| `disabled` | `boolean` | `false` | Defines the disabled state of the comonent. |
| `displayFormat` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field. |
| `formatPattern` | `string \| undefined` | `undefined` | Determines the format, displayed in the input field.<br><br>Example:<br>HH:mm:ss -> 11:42:35<br>hh:mm:ss a -> 2:23:15 PM<br>mm:ss -> 12:04 (only minutes and seconds)<br>**Deprecated:** Use displayFormat and valueFormat instead |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |
| `open` | `boolean` | `false` | Defines the open or closed state of the popover. |
| `placeholder` | `string \| undefined` | `undefined` | Defines a short hint, intended to aid the user with data entry when the<br>component has no value.<br><br>**Note:** When no placeholder is set, the format pattern is displayed as a placeholder.<br>Passing an empty string as the value of this property will make the component appear empty - without placeholder or format pattern. |
| `readonly` | `boolean` | `false` | Defines the readonly state of the comonent. |
| `required` | `boolean` | `false` | Defines whether the component is required. |
| `value` | `string` | `""` | Defines a formatted time value. |
| `valueFormat` | `string \| undefined` | `undefined` | Determines the format, used for the value attribute. |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `valueStateMessage` | `Slot<HTMLElement>` | Defines the value state message that will be displayed as pop up under the `ui5-time-picker`.<br><br>**Note:** If not specified, a default text (in the respective language) will be displayed.<br><br>**Note:** The `valueStateMessage` would be displayed,<br>when the `ui5-time-picker` is in `Information`, `Critical` or `Negative` value state. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent<TimePickerChangeEventDetail>` | true | false | Fired when the input operation has finished by clicking the "OK" button or<br>when the text in the input field has changed and the focus leaves the input field. |
| `close` | `CustomEvent` | true | false | Fired after the value-help dialog of the component is closed. |
| `input` | `CustomEvent<TimePickerInputEventDetail>` | true | false | Fired when the value of the `ui5-time-picker` is changed at each key stroke. |
| `open` | `CustomEvent` | true | false | Fired after the value-help dialog of the component is opened. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `formatValue` | `formatValue(date: Date): string;` | Formats a Java Script date object into a string representing a locale date and time<br>according to the `formatPattern` property of the TimePicker instance |
| `isValid` | `isValid(value: string \| undefined): boolean;` | Checks if a value is valid against the current `formatPattern` value.<br><br>**Note:** an empty string is considered as valid value. |
| `isValidValue` | `isValidValue(value: string \| undefined): boolean;` | Checks if a value is valid against the current `valueFormat` value.<br><br>**Note:** an empty string is considered as valid value. |

#### CSS parts

- `input`: Used to style the input element. This part is forwarded to the underlying ui5-input element.

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/Basic/main.js).
- [CustomFormatting](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/CustomFormatting/sample.tsx) — You can have custom formatting for the display value and the value property. Supported format options are pattern-based on Unicode LDML Date Format notation.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/CustomFormatting/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/CustomFormatting/main.js).
- [States](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/States/sample.tsx) — TimePicker supports several semantic value states, readonly, disabled, etc.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/States/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/States/main.js).
- [Timezones](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/TimePickerInDifferentTimezone/sample.tsx) — You can set to the configuration the preferred time zone.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/TimePickerInDifferentTimezone/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/TimePicker/TimePickerInDifferentTimezone/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `change`, `close`, `input`, `open` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/time-picker` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- CSS custom states

### [Title](https://ui5.github.io/webcomponents/components/Title/)

- Tag: `ui5-title`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Title.d.ts).
- Local implementation: `src/components/title` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-title` component is used to display titles inside a page.
It is a simple, large-sized text with explicit header/title semantics.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Title.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `level` | `` `${TitleLevel}` `` | `"H2"` | Defines the component level.<br>Available options are: `"H6"` to `"H1"`.<br>This property does not influence the style of the component.<br>Use the property `size` for this purpose instead. |
| `size` | `` `${TitleLevel}` `` | `"H5"` | Defines the visual appearance of the title.<br>Available options are: `"H6"` to `"H1"`. |
| `wrappingType` | `` `${WrappingType}` `` | `"Normal"` | Defines how the text of a component will be displayed when there is not enough space.<br><br>**Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the text of the component.<br>This component supports nesting a `Link` component inside.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Title/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Title/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Title/Basic/main.js).
- [WrappingType](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Title/WrappingType/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Title/WrappingType/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Title/WrappingType/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `level`, `size`, `wrappingType`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states

### [Toast](https://ui5.github.io/webcomponents/components/Toast/)

- Tag: `ui5-toast`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Toast.d.ts).
- Local implementation: `src/components/toast` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-toast` is a small, non-disruptive popup for success or information messages that
disappears automatically after a few seconds.

##### Usage

##### When to use:

- You want to display a short success or information message.
- You do not want to interrupt users while they are performing an action.
- You want to confirm a successful action.

##### When not to use:

- You want to display error or warning message.
- You want to interrupt users while they are performing an action.
- You want to make sure that users read the message before they leave the page.
- You want users to be able to copy some part of the message text.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Toast.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `duration` | `number` | `3000` | Defines the duration in milliseconds for which component<br>remains on the screen before it's automatically closed.<br><br>**Note:** The minimum supported value is `500` ms<br>and even if a lower value is set, the duration would remain `500` ms. |
| `open` | `boolean` | `false` | Indicates whether the component is open (visible). |
| `placement` | `` `${ToastPlacement}` `` | `"BottomCenter"` | Defines the placement of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `Not identified; inspect declaration` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `close` | `CustomEvent` | false | false | Fired after the component is auto closed. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toast/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toast/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toast/Basic/main.js).
- [Duration](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toast/Duration/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toast/Duration/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toast/Duration/main.js).
- [Placement](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toast/Placement/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toast/Placement/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toast/Placement/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `duration`, `open`, `placement`.
- [ ] Verify `close` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/toast` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [ToggleButton](https://ui5.github.io/webcomponents/components/ToggleButton/)

- Tag: `ui5-toggle-button`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ToggleButton.d.ts).
- Local implementation: `src/components/toggle-button` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-toggle-button` component is an enhanced `ui5-button`
that can be toggled between pressed and normal states.
Users can use the `ui5-toggle-button` as a switch to turn a setting on or off.
It can also be used to represent an independent choice similar to a check box.

Clicking or tapping on a `ui5-toggle-button` changes its state to `pressed`. The button returns to
its initial state when the user clicks or taps on it again.
By applying additional custom CSS-styling classes, apps can give a different style to any `ui5-toggle-button`.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/ToggleButton.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `ButtonAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.<br>Accepts the following string values: `true` or `false`<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.<br>Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.<br><br>- **ariaLabel**: Defines the accessible ARIA name of the component.<br>Accepts any string value.<br><br> - **ariaKeyShortcuts**: Defines keyboard shortcuts that activate or give focus to the button.<br><br>- **controls**: Identifies the element (or elements) whose contents or presence are controlled by the button element.<br>Accepts a lowercase string value. |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `accessibleRole` | `` `${ButtonAccessibleRole}` `` | `"Button"` | Describes the accessibility role of the button.<br><br>**Note:** Use <code>ButtonAccessibleRole.Link</code> role only with a press handler, which performs a navigation. In all other scenarios the default button semantics are recommended. |
| `design` | `` `${ButtonDesign}` `` | `"Default"` | Defines the component design. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br>A disabled component can't be pressed or<br>focused, and it is not in the tab chain. |
| `endIcon` | `string \| undefined` | `undefined` | Defines the icon, displayed as graphical element within the component after the button text.<br><br>**Note:** It is highly recommended to use `endIcon` property only together with `icon` and/or `text` properties.<br>Usage of `endIcon` only should be avoided.<br><br>The SAP-icons font provides numerous options.<br><br>Example:<br>See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `form` | `string \| undefined` | `undefined` | Associates the button with a form element by the form's `id` attribute.<br>When set, the button can submit or reset the specified form even if the button<br>is not a descendant of that form.<br><br>**Note:** This property takes effect only when the button's "type" property is set to "Submit" or "Reset". |
| `icon` | `string \| undefined` | `undefined` | Defines the icon, displayed as graphical element within the component.<br>The SAP-icons font provides numerous options.<br><br>Example:<br>See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `loading` | `boolean` | `false` | Defines whether the button shows a loading indicator.<br><br>**Note:** If set to `true`, a busy indicator component will be displayed on the related button. |
| `loadingDelay` | `number` | `1000` | Specifies the delay in milliseconds before the loading indicator appears within the associated button. |
| `pressed` | `boolean` | `false` | Determines whether the component is displayed as pressed. |
| `submits` | `boolean` | `false` | When set to `true`, the component will<br>automatically submit the nearest HTML form element on `press`.<br><br>**Note:** This property is only applicable within the context of an HTML Form element.`<br>**Deprecated:** Set the "type" property to "Submit" to achieve the same result. The "submits" property is ignored if "type" is set to any value other than "Button". |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component.<br><br>**Note:** A tooltip attribute should be provided for icon-only buttons, in order to represent their exact meaning/function. |
| `type` | `` `${ButtonType}` `` | `"Button"` | Defines whether the button has special form-related functionality.<br><br>**Note:** This property is only applicable within the context of an HTML Form element. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `badge` | `Slot<ButtonBadge>` | Adds a badge to the button. |
| `default` | `Not identified; inspect declaration` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ButtonClickEventDetail>` | true | true | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |

#### CSS parts

- `button`: Used to style the native button element
- `endIcon`: Used to style the end icon in the native button element
- `icon`: Used to style the icon in the native button element

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ToggleButton/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ToggleButton/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ToggleButton/Basic/main.js).
- [Design](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ToggleButton/Design/sample.tsx) — Toggle Buttons have a `design` property with several options that defines their visual appearance.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ToggleButton/Design/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ToggleButton/Design/main.js).
- [Icon Only](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ToggleButton/IconOnly/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ToggleButton/IconOnly/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/ToggleButton/IconOnly/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleDescription`, `accessibleName`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/toggle-button` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Public methods
- CSS custom states

### [Token](https://ui5.github.io/webcomponents/components/Token/)

- Tag: `ui5-token`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Token.d.ts).
- Local implementation: `src/components/token` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

Tokens are small items of information (similar to tags) that mainly serve to visualize previously selected items.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Token.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `selected` | `boolean` | `false` | Defines whether the component is selected or not. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the token. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `closeIcon` | `Slot<IIcon>` | Defines the close icon for the token. If nothing is provided to this slot, the default close icon will be used.<br>Accepts `ui5-icon`. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Token/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Token/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Token/Basic/main.js).
- [Token in MultiInput](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Token/TokenInMultiInput/sample.tsx) — You can remove tokens by clicking the "X" button and add tokens by typing something in the input field, followed by "ENTER".; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Token/TokenInMultiInput/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Token/TokenInMultiInput/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `selected`, `text`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states

### [Tokenizer](https://ui5.github.io/webcomponents/components/Tokenizer/)

- Tag: `ui5-tokenizer`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Tokenizer.d.ts).
- Local implementation: `src/components/token` (React adaptation added in the roadmap-components batch; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

A `ui5-tokenizer` is an invisible container for `ui5-token`s that supports keyboard navigation and token selection.

The `ui5-tokenizer` consists of two parts:
- Tokens - displays the available tokens.
- N-more indicator - contains the number of the remaining tokens that cannot be displayed due to the limited space.

##### Keyboard Handling

##### Basic Navigation
The `ui5-tokenizer` provides advanced keyboard handling.
When a token is focused the user can use the following keyboard
shortcuts in order to perform a navigation:

- [Left] or [Right] / [Up] or [Down] - Navigates left and right through the tokens.
- [Home] - Navigates to the first token.
- [End] - Navigates to the last token.

The user can use the following keyboard shortcuts to perform actions (such as select, delete):

- [Space] - Selects a token.
- [Backspace] / [Delete] - Deletes a token.
**Note:** The deletion of a token is handled by the application with the use of the `token-delete` event.

##### ES6 Module Import

`import "@ui5/webcomponents/dist/Tokenizer.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `disabled` | `boolean` | `false` | Defines whether the component is disabled.<br><br>**Note:** A disabled component is completely noninteractive. |
| `multiLine` | `boolean` | `false` | Defines whether tokens are displayed on multiple lines.<br><br>**Note:** The `multiLine` property is in an experimental state and is a subject to change. |
| `name` | `string \| undefined` | `undefined` | Determines the name by which the component will be identified upon submission in an HTML form.<br><br>**Note:** This property is only applicable within the context of an HTML Form element.<br>**Note:** When the component is used inside a form element,<br>the value is sent as the first element in the form data, even if it's empty. |
| `readonly` | `boolean` | `false` | Defines whether the component is read-only.<br><br>**Note:** A read-only component is not editable,<br>but still provides visual feedback upon user interaction. |
| `showClearAll` | `boolean` | `false` | Defines whether "Clear All" button is present. Ensure `multiLine` is enabled, otherwise `showClearAll` will have no effect.<br><br>**Note:** The `showClearAll` property is in an experimental state and is a subject to change. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Token>` | Defines the tokens to be displayed. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `selection-change` | `CustomEvent<TokenizerSelectionChangeEventDetail>` | true | false | Fired when token selection is changed by user interaction |
| `token-delete` | `CustomEvent<TokenizerTokenDeleteEventDetail>` | true | false | Fired when tokens are being deleted (delete icon, delete or backspace is pressed) |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tokenizer/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tokenizer/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tokenizer/Basic/main.js).
- [Multi-line and Clear All](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tokenizer/MultiLine/sample.tsx) — With `multiLine` enabled, tokens are displayed across multiple lines. The `showClearAll` option adds a "Clear All" button, allowing users to remove all tokens at once.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tokenizer/MultiLine/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tokenizer/MultiLine/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `disabled`.
- [ ] Verify `selection-change`, `token-delete` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- CSS custom states

### [Toolbar](https://ui5.github.io/webcomponents/components/Toolbar/)

- Tag: `ui5-toolbar`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Toolbar.d.ts).
- Local implementation: `src/patterns/command-toolbar` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-toolbar` component is used to create a horizontal layout with items.
The items can be overflowing in a popover, when the space is not enough to show all of them.

##### Grouped Overflow

Items that share the same non-empty `overflowGroup` string are treated as one atomic
unit during overflow distribution: when any member must move into the overflow
popover, all members move together. The visible bar always preserves slot order;
the group becomes adjacent only inside the popover. See the `overflowGroup` property
on `ToolbarItemBase` for the full contract.

##### Keyboard Handling
The `ui5-toolbar` provides advanced keyboard handling.

- [Left]/[Right] - navigate among toolbar items
- [Home]/[End] - move to first/last toolbar item
- [Tab] / [Shift]+[Tab] - exit the toolbar

##### ES6 Module Import
`import "@ui5/webcomponents/dist/Toolbar.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component.<br><br>**Note:** It is strongly recommended to always set this property or `accessibleNameRef`<br>when the toolbar has `role="toolbar"` (i.e. when it contains more than one interactive item).<br>Without an accessible name, screen readers will announce the toolbar without any context,<br>making it harder for keyboard-only and AT users to understand its purpose. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the input.<br><br>**Note:** When the toolbar has `role="toolbar"`, at least one of `accessibleName` or<br>`accessibleNameRef` should be provided to satisfy WCAG 2.1 success criterion 4.1.2. |
| `alignContent` | `` `${ToolbarAlign}` `` | `"End"` | Indicated the direction in which the Toolbar items will be aligned. |
| `design` | `` `${ToolbarDesign}` `` | `"Solid"` | Defines the toolbar design. |
| `overflowButtonAccessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the overflow button of the component.<br><br>**Note:** When not set, the built-in translation for "Additional Options" is used. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ToolbarItemBase>` | Defines the items of the component.<br><br>**Note:** Use `ui5-toolbar-button`, `ui5-toolbar-select`, `ui5-toolbar-separator` and `ui5-toolbar-spacer` for the most common toolbar actions. To place any other UI5 Web Component into the toolbar and have it participate in overflow handling, wrap it in a `ui5-toolbar-item`. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `isOverflowOpen` | `isOverflowOpen(): boolean;` | Returns if the overflow popup is open. |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/Basic/main.js).
- [Always Overflowing Items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/AlwaysOverflowingItems/sample.tsx) — To force items into the overflow, set `overflow-priority='AlwaysOverflow'` on the Toolbar items.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/AlwaysOverflowingItems/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/AlwaysOverflowingItems/main.js).
- [Never Overflowing Items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/NeverOverflowingItems/sample.tsx) — To force items staying always visible and never overflow, set `overflow-priority='NeverOverflow'` on the Toolbar items.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/NeverOverflowingItems/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/NeverOverflowingItems/main.js).
- [Spacers and Separators](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/SpacerAndSeparator/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/SpacerAndSeparator/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/SpacerAndSeparator/main.js).
- [Items Alignment](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/ItemsAlignment/sample.tsx) — You can align items to the Start, or to the End via the `align-content` property.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/ItemsAlignment/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/ItemsAlignment/main.js).
- [ToolbarItem](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/ToolbarItem/sample.tsx) — ToolbarItem wrapper used to add any component to Toolbar.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/ToolbarItem/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/ToolbarItem/main.js).
- [Grouped Overflow](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/GroupedOverflow/sample.tsx) — Items that share the same non-empty `overflow-group` string overflow together as one atomic unit — either all visible in the bar or all in the overflow popover, never split.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/GroupedOverflow/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Toolbar/GroupedOverflow/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `alignContent`.
- [ ] Compare the existing `src/patterns/command-toolbar` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- Events
- CSS parts
- CSS custom states

### [ToolbarButton](https://ui5.github.io/webcomponents/components/ToolbarButton/)

- Tag: `ui5-toolbar-button`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ToolbarButton.d.ts).
- Local implementation: covered by `CommandToolbar` `actions` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-toolbar-button` represents an abstract action,
used in the `ui5-toolbar`.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/ToolbarButton.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `ToolbarButtonAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br><br>The following fields are supported:<br><br>- **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.<br>Accepts the following string values: `true` or `false`<br><br>- **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.<br>Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.<br><br>- **controls**: Identifies the element (or elements) whose contents or presence are controlled by the button element.<br>Accepts a lowercase string value. |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the component. |
| `accessibleRole` | `` `${ButtonAccessibleRole}` `` | `"Button"` | Defines the ARIA role of the component.<br><br>**Note:** Use `ButtonAccessibleRole.Link` role only with a press handler that performs navigation.<br>In all other scenarios the default button semantics are recommended. |
| `design` | `` `${ButtonDesign}` `` | `"Default"` | Defines the action design. |
| `disabled` | `boolean` | `false` | Defines if the action is disabled.<br><br>**Note:** a disabled action can't be pressed or focused, and it is not in the tab chain. |
| `endIcon` | `string \| undefined` | `undefined` | Defines the icon, displayed as graphical element within the component after the button text.<br><br>**Note:** It is highly recommended to use `endIcon` property only together with `icon` and/or `text` properties.<br>Usage of `endIcon` only should be avoided.<br><br>The SAP-icons font provides numerous options.<br><br>Example:<br>See all the available icons within the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `icon` | `string \| undefined` | `undefined` | Defines the `icon` source URI.<br><br>**Note:** SAP-icons font provides numerous buil-in icons. To find all the available icons, see the<br>[Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). |
| `overflowGroup` | `string \| undefined` | `undefined` | Co-overflow tag. Items in the same `ui5-toolbar` whose `overflowGroup` is the same<br>non-empty string overflow as one atomic unit: either all visible in the bar, or all<br>in the overflow popover, never split. The empty string (the default) means "no group" —<br>the item participates in overflow independently.<br><br>The tag is a free-form, case-sensitive string label (e.g. `"filters"`, `"search"`). It is<br>layout-only and carries no ARIA, keyboard, or visual-cluster semantics. Items in a<br>non-empty group must have `overflowPriority = "Default"`; `AlwaysOverflow` and<br>`NeverOverflow` are forbidden inside a group — setting one of those on a grouped item<br>emits a one-shot `console.warn` and the item's priority is treated as `Default` for<br>the layout pass. Spacers (`ui5-toolbar-spacer`) do not participate in grouping; setting<br>a non-empty `overflowGroup` on a spacer emits a one-shot `console.warn` and the spacer's<br>existing overflow behavior is unchanged.<br><br>The visible bar always preserves slot order — ungrouped items between group members<br>keep their slot positions and the toolbar never reorders DOM children. In the popover<br>group members appear adjacent in slot order. |
| `overflowPriority` | `` `${ToolbarItemOverflowBehavior}` `` | `"Default"` | Property used to define the access of the item to the overflow Popover. If "NeverOverflow" option is set,<br>the item never goes in the Popover, if "AlwaysOverflow" - it never comes out of it. |
| `preventOverflowClosing` | `boolean` | `false` | Defines if the toolbar overflow popup should close upon interaction with the item.<br>It will close by default. |
| `showOverflowText` | `boolean` | `false` | Defines whether the button text should only be displayed in the overflow popover.<br><br>When set to `true`, the button appears as icon-only in the main toolbar,<br>but shows both icon and text when moved to the overflow popover.<br><br>**Note:** This property only takes effect when the `text` property is also set. |
| `text` | `string \| undefined` | `undefined` | Button text |
| `tooltip` | `string \| undefined` | `undefined` | Defines the tooltip of the component.<br><br>**Note:** A tooltip attribute should be provided for icon-only buttons, in order to represent their exact meaning/function. |
| `width` | `string \| undefined` | `undefined` | Defines the width of the button.<br><br>**Note:** all CSS sizes are supported - 'percentage', 'px', 'rem', 'auto', etc. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent` | true | true | Fired when the component is activated either with a<br>mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled`<br>property is set to `true`. |

#### CSS custom states

- `overflowed`: When the item is displayed in the overflow popover.<br>Use this state to apply different styles when the item is overflowed.<br>Available since 2.20.0.

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleDescription`, `accessibleName`.
- [ ] Verify `click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Slots
- Public methods
- CSS parts
- Samples

### [ToolbarItem](https://ui5.github.io/webcomponents/components/ToolbarItem/)

- Tag: `ui5-toolbar-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ToolbarItem.d.ts).
- Local implementation: covered by `CommandToolbar` `start` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-toolbar-item` is a wrapper component used to integrate UI5 Web Components into the `ui5-toolbar`.
It renders within the toolbar's shadow DOM and manages the lifecycle
and overflow behavior of its child component.

##### Structure
The toolbar item wraps a single UI5 Web Component (such as CheckBox, Title, etc.) and handles:
- Overflow management (determining if the item should be displayed in the main toolbar or overflow popover)
- Automatic popover closing on interaction
- CSS custom state exposure for styling based on overflow state

##### Usage
The `ui5-toolbar-item` is typically used implicitly when adding components to a toolbar,
but specialized wrappers like `ui5-toolbar-button` provide
component-specific functionality and should be preferred when available.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `overflowGroup` | `string \| undefined` | `undefined` | Co-overflow tag. Items in the same `ui5-toolbar` whose `overflowGroup` is the same<br>non-empty string overflow as one atomic unit: either all visible in the bar, or all<br>in the overflow popover, never split. The empty string (the default) means "no group" —<br>the item participates in overflow independently.<br><br>The tag is a free-form, case-sensitive string label (e.g. `"filters"`, `"search"`). It is<br>layout-only and carries no ARIA, keyboard, or visual-cluster semantics. Items in a<br>non-empty group must have `overflowPriority = "Default"`; `AlwaysOverflow` and<br>`NeverOverflow` are forbidden inside a group — setting one of those on a grouped item<br>emits a one-shot `console.warn` and the item's priority is treated as `Default` for<br>the layout pass. Spacers (`ui5-toolbar-spacer`) do not participate in grouping; setting<br>a non-empty `overflowGroup` on a spacer emits a one-shot `console.warn` and the spacer's<br>existing overflow behavior is unchanged.<br><br>The visible bar always preserves slot order — ungrouped items between group members<br>keep their slot positions and the toolbar never reorders DOM children. In the popover<br>group members appear adjacent in slot order. |
| `overflowPriority` | `` `${ToolbarItemOverflowBehavior}` `` | `"Default"` | Property used to define the access of the item to the overflow Popover. If "NeverOverflow" option is set,<br>the item never goes in the Popover, if "AlwaysOverflow" - it never comes out of it. |
| `preventOverflowClosing` | `boolean` | `false` | Defines if the toolbar overflow popup should close upon interaction with the item.<br>It will close by default. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<IToolbarItemContent>` | Wrapped component slot. |

#### CSS custom states

- `overflowed`: When the item is displayed in the overflow popover.<br>Use this state to apply different styles when the item is overflowed.<br>Available since 2.20.0.

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `overflowGroup`, `overflowPriority`, `preventOverflowClosing`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- Samples

### [ToolbarSelect](https://ui5.github.io/webcomponents/components/ToolbarSelect/)

- Tag: `ui5-toolbar-select`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ToolbarSelect.d.ts).
- Local implementation: covered by `CommandToolbar` `start` with `Select` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-toolbar-select` component is used to create a toolbar drop-down list.
The items inside the `ui5-toolbar-select` define the available options by using the `ui5-toolbar-select-option` component.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/ToolbarSelect.js";`

`import "@ui5/webcomponents/dist/ToolbarSelectOption.js";` (comes with `ui5-toolbar-select`)

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible ARIA name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Receives id(or many ids) of the elements that label the select. |
| `disabled` | `boolean` | `false` | Defines whether the component is in disabled state.<br><br>**Note:** A disabled component is noninteractive. |
| `overflowGroup` | `string \| undefined` | `undefined` | Co-overflow tag. Items in the same `ui5-toolbar` whose `overflowGroup` is the same<br>non-empty string overflow as one atomic unit: either all visible in the bar, or all<br>in the overflow popover, never split. The empty string (the default) means "no group" —<br>the item participates in overflow independently.<br><br>The tag is a free-form, case-sensitive string label (e.g. `"filters"`, `"search"`). It is<br>layout-only and carries no ARIA, keyboard, or visual-cluster semantics. Items in a<br>non-empty group must have `overflowPriority = "Default"`; `AlwaysOverflow` and<br>`NeverOverflow` are forbidden inside a group — setting one of those on a grouped item<br>emits a one-shot `console.warn` and the item's priority is treated as `Default` for<br>the layout pass. Spacers (`ui5-toolbar-spacer`) do not participate in grouping; setting<br>a non-empty `overflowGroup` on a spacer emits a one-shot `console.warn` and the spacer's<br>existing overflow behavior is unchanged.<br><br>The visible bar always preserves slot order — ungrouped items between group members<br>keep their slot positions and the toolbar never reorders DOM children. In the popover<br>group members appear adjacent in slot order. |
| `overflowPriority` | `` `${ToolbarItemOverflowBehavior}` `` | `"Default"` | Property used to define the access of the item to the overflow Popover. If "NeverOverflow" option is set,<br>the item never goes in the Popover, if "AlwaysOverflow" - it never comes out of it. |
| `preventOverflowClosing` | `boolean` | `false` | Defines if the toolbar overflow popup should close upon interaction with the item.<br>It will close by default. |
| `value` | `string` | `""` | Defines the value of the component: |
| `valueState` | `` `${ValueState}` `` | `"None"` | Defines the value state of the component. |
| `width` | `string \| undefined` | `undefined` | Defines the width of the select.<br><br>**Note:** all CSS sizes are supported - 'percentage', 'px', 'rem', 'auto', etc. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<ToolbarSelectOption>` | Defines the component options.<br><br>**Note:** Only one selected option is allowed.<br>If more than one option is defined as selected, the last one would be considered as the selected one.<br><br>**Note:** Use the `ui5-toolbar-select-option` component to define the desired options. |
| `label` | `Slot<HTMLElement>` | Defines the HTML element that will be displayed in the component input part,<br>representing the selected option. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `change` | `CustomEvent<ToolbarSelectChangeEventDetail>` | true | true | Fired when the selected option changes. |
| `close` | `CustomEvent` | false | false | Fired after the component's dropdown menu closes. |
| `open` | `CustomEvent` | true | false | Fired after the component's dropdown menu opens. |

#### CSS custom states

- `overflowed`: When the item is displayed in the overflow popover.<br>Use this state to apply different styles when the item is overflowed.<br>Available since 2.20.0.

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleName`, `accessibleNameRef`, `disabled`.
- [ ] Verify `change`, `close`, `open` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- Public methods
- CSS parts
- Samples

### [ToolbarSelectOption](https://ui5.github.io/webcomponents/components/ToolbarSelectOption/)

- Tag: `ui5-toolbar-select-option`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ToolbarSelectOption.d.ts).
- Local implementation: covered by `Select` `options` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview

The `ui5-toolbar-select-option` component defines the content of an option in the `ui5-toolbar-select`.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |
| `value` | `string \| undefined` | `undefined` | Defines the value of the component. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<Node>` | Defines the text of the component.<br><br>**Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design. |

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `selected`, `value`.

#### Empty documentation fields

- Events
- Public methods
- CSS parts
- CSS custom states
- Samples

### [ToolbarSeparator](https://ui5.github.io/webcomponents/components/ToolbarSeparator/)

- Tag: `ui5-toolbar-separator`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ToolbarSeparator.d.ts).
- Local implementation: covered by `CommandToolbar` action grouping (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-toolbar-separator` is an element, used for visual separation between two elements.
It takes no space in calculating toolbar items width.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `overflowGroup` | `string \| undefined` | `undefined` | Co-overflow tag. Items in the same `ui5-toolbar` whose `overflowGroup` is the same<br>non-empty string overflow as one atomic unit: either all visible in the bar, or all<br>in the overflow popover, never split. The empty string (the default) means "no group" —<br>the item participates in overflow independently.<br><br>The tag is a free-form, case-sensitive string label (e.g. `"filters"`, `"search"`). It is<br>layout-only and carries no ARIA, keyboard, or visual-cluster semantics. Items in a<br>non-empty group must have `overflowPriority = "Default"`; `AlwaysOverflow` and<br>`NeverOverflow` are forbidden inside a group — setting one of those on a grouped item<br>emits a one-shot `console.warn` and the item's priority is treated as `Default` for<br>the layout pass. Spacers (`ui5-toolbar-spacer`) do not participate in grouping; setting<br>a non-empty `overflowGroup` on a spacer emits a one-shot `console.warn` and the spacer's<br>existing overflow behavior is unchanged.<br><br>The visible bar always preserves slot order — ungrouped items between group members<br>keep their slot positions and the toolbar never reorders DOM children. In the popover<br>group members appear adjacent in slot order. |
| `overflowPriority` | `` `${ToolbarItemOverflowBehavior}` `` | `"Default"` | Property used to define the access of the item to the overflow Popover. If "NeverOverflow" option is set,<br>the item never goes in the Popover, if "AlwaysOverflow" - it never comes out of it. |
| `preventOverflowClosing` | `boolean` | `false` | Defines if the toolbar overflow popup should close upon interaction with the item.<br>It will close by default. |

#### CSS custom states

- `overflowed`: When the item is displayed in the overflow popover.<br>Use this state to apply different styles when the item is overflowed.<br>Available since 2.20.0.

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `overflowGroup`, `overflowPriority`, `preventOverflowClosing`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- Samples

### [ToolbarSpacer](https://ui5.github.io/webcomponents/components/ToolbarSpacer/)

- Tag: `ui5-toolbar-spacer`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/ToolbarSpacer.d.ts).
- Local implementation: covered by `CommandToolbar` layout (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-toolbar-spacer` is an element, used for taking needed space for toolbar items to take 100% width.
It takes no space in calculating toolbar items width.

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `overflowGroup` | `string \| undefined` | `undefined` | Co-overflow tag. Items in the same `ui5-toolbar` whose `overflowGroup` is the same<br>non-empty string overflow as one atomic unit: either all visible in the bar, or all<br>in the overflow popover, never split. The empty string (the default) means "no group" —<br>the item participates in overflow independently.<br><br>The tag is a free-form, case-sensitive string label (e.g. `"filters"`, `"search"`). It is<br>layout-only and carries no ARIA, keyboard, or visual-cluster semantics. Items in a<br>non-empty group must have `overflowPriority = "Default"`; `AlwaysOverflow` and<br>`NeverOverflow` are forbidden inside a group — setting one of those on a grouped item<br>emits a one-shot `console.warn` and the item's priority is treated as `Default` for<br>the layout pass. Spacers (`ui5-toolbar-spacer`) do not participate in grouping; setting<br>a non-empty `overflowGroup` on a spacer emits a one-shot `console.warn` and the spacer's<br>existing overflow behavior is unchanged.<br><br>The visible bar always preserves slot order — ungrouped items between group members<br>keep their slot positions and the toolbar never reorders DOM children. In the popover<br>group members appear adjacent in slot order. |
| `overflowPriority` | `` `${ToolbarItemOverflowBehavior}` `` | `"Default"` | Property used to define the access of the item to the overflow Popover. If "NeverOverflow" option is set,<br>the item never goes in the Popover, if "AlwaysOverflow" - it never comes out of it. |
| `preventOverflowClosing` | `boolean` | `false` | Defines if the toolbar overflow popup should close upon interaction with the item.<br>It will close by default. |
| `width` | `string \| undefined` | `undefined` | Defines the width of the spacer.<br><br>**Note:** all CSS sizes are supported - 'percentage', 'px', 'rem', 'auto', etc. |

#### CSS custom states

- `overflowed`: When the item is displayed in the overflow popover.<br>Use this state to apply different styles when the item is overflowed.<br>Available since 2.20.0.

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `overflowGroup`, `overflowPriority`, `preventOverflowClosing`.

#### Empty documentation fields

- Slots
- Events
- Public methods
- CSS parts
- Samples

### [Tree](https://ui5.github.io/webcomponents/components/Tree/)

- Tag: `ui5-tree`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/Tree.d.ts).
- Local implementation: `src/components/tree` (candidate only; parity unverified)
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-tree` component provides a tree structure for displaying data in a hierarchy.

##### Usage

##### When to use:

- To display hierarchically structured items.
- To select one or more items out of a set of hierarchically structured items.

##### When not to use:

- To display items not hierarchically structured. In this case, use the List component.
- To select one item from a very small number of non-hierarchical items. Select or ComboBox might be more appropriate.
- The hierarchy turns out to have only two levels. In this case, use List with group items.

##### Keyboard Handling

The `ui5-tree` provides advanced keyboard handling.
The user can use the following keyboard shortcuts in order to navigate trough the tree:

- [Up] or [Down] - Navigates up and down the tree items that are currently visible.
- [Right] - Drills down the tree by expanding the tree nodes.
- [Left] - Goes up the tree and collapses the tree nodes.

The user can use the following keyboard shortcuts to perform selection,
when the `selectionMode` property is in use:

- [Space] - Selects the currently focused item upon keyup.
- [Enter]  - Selects the currently focused item upon keydown.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/Tree.js";`

`import "@ui5/webcomponents/dist/TreeItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibleDescription` | `string \| undefined` | `undefined` | Defines the accessible description of the component. |
| `accessibleDescriptionRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that describe the component. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleNameRef` | `string \| undefined` | `undefined` | Defines the IDs of the elements that label the component. |
| `footerText` | `string \| undefined` | `undefined` | Defines the component footer text. |
| `headerText` | `string \| undefined` | `undefined` | Defines the component header text.<br><br>**Note:** If the `header` slot is set, this property is ignored. |
| `noDataText` | `string \| undefined` | `undefined` | Defines the text that is displayed when the component contains no items. |
| `selectionMode` | `` `${ListSelectionMode}` \| undefined `` | `"None"` | Defines the selection mode of the component. Since the tree uses a `ui5-list` to display its structure,<br>the tree modes are exactly the same as the list modes, and are all applicable. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<TreeItemBase>` | Defines the items of the component. Tree items may have other tree items as children.<br><br>**Note:** Use `ui5-tree-item` for the intended design. |
| `header` | `Slot<HTMLElement>` | Defines the component header.<br><br>**Note:** When the `header` slot is set, the<br>`headerText` property is ignored. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `item-click` | `CustomEvent<TreeItemClickEventDetail>` | true | true | Fired when a tree item is activated. |
| `item-delete` | `CustomEvent<TreeItemDeleteEventDetail>` | true | false | Fired when the Delete button of any tree item is pressed.<br><br>**Note:** A Delete button is displayed on each item,<br>when the component `selectionMode` property is set to `Delete`. |
| `item-mouseout` | `CustomEvent<TreeItemMouseoutEventDetail>` | true | false | Fired when the mouse cursor leaves the tree item borders. |
| `item-mouseover` | `CustomEvent<TreeItemMouseoverEventDetail>` | true | false | Fired when the mouse cursor enters the tree item borders. |
| `item-toggle` | `CustomEvent<TreeItemToggleEventDetail>` | true | true | Fired when a tree item is expanded or collapsed.<br><br>**Note:** You can call `preventDefault()` on the event object to suppress the event, if needed.<br>This may be handy for example if you want to dynamically load tree items upon the user expanding a node.<br>Even if you prevented the event's default behavior, you can always manually call `toggle()` on a tree item. |
| `move` | `CustomEvent<TreeMoveEventDetail>` | true | false | Fired when a movable tree item is moved over a potential drop target during a drag-and-drop operation.<br><br>If the new position is valid, prevent the default action of the event using `preventDefault()`. |
| `move-over` | `CustomEvent<TreeMoveEventDetail>` | true | true | Fired when a movable tree item is dropped onto a drop target.<br><br>**Note:** The `move` event is fired only if there was a preceding `move-over` event with prevented default action. |
| `selection-change` | `CustomEvent<TreeSelectionChangeEventDetail>` | true | false | Fired when selection is changed by user interaction<br>in `Single`, `SingleStart`, `SingleEnd` and `Multiple` modes. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `walk` | `walk(callback: WalkCallback): void;` | Perform Depth-First-Search walk on the tree and run a callback on each node |

#### Samples

- [Basic](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tree/Basic/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tree/Basic/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tree/Basic/main.js).
- [Custom Tree Items](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tree/CustomTreeItems/sample.tsx); [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tree/CustomTreeItems/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tree/CustomTreeItems/main.js).
- [Drag And Drop](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tree/DragAndDrop/sample.tsx) — The tree items are draggable through the use of the `movable` property on `TreeItem`.; [HTML](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tree/DragAndDrop/sample.html), [JavaScript](https://github.com/UI5/webcomponents/blob/v2.28.1/packages/website/docs/_samples/main/Tree/DragAndDrop/main.js).

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibleDescription`, `accessibleDescriptionRef`, `accessibleName`.
- [ ] Verify `item-click`, `item-delete`, `item-mouseout`, `item-mouseover`, `item-toggle`, `move`, `move-over`, `selection-change` semantics and payloads, including cancellation and propagation where applicable.
- [ ] Compare the existing `src/components/tree` against this entry and add regression tests for gaps before claiming parity.

#### Empty documentation fields

- CSS parts
- CSS custom states

### [TreeItem](https://ui5.github.io/webcomponents/components/TreeItem/)

- Tag: `ui5-tree-item`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TreeItem.d.ts).
- Local implementation: covered by `Tree` `nodes` (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

##### Overview
The `ui5-tree-item` represents a node in a tree structure, shown as a `ui5-list`.

This is the item to use inside a `ui5-tree`.
You can represent an arbitrary tree structure by recursively nesting tree items.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/TreeItem.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `ListItemAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **ariaSetsize**: Defines the number of items in the current set  when not all items in the set are present in the DOM.<br>**Note:** The value is an integer reflecting the number of items in the complete set. If the size of the entire set is unknown, set `-1`.<br><br>	- **ariaPosinset**: Defines an element's number or position in the current set when not all items are present in the DOM.<br>	**Note:** The value is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleRole` | `` `${ListItemAccessibleRole}` \| undefined `` | `undefined` | Used to define the role of the list item.<br><br>**Note:** If not set, the role is automatically inherited from the parent `ui5-list` based on its `accessible-role` property<br>(e.g. `Menu` -> `MenuItem`, `Tree` -> `TreeItem`, `ListBox` -> `Option`).<br>An explicitly set `accessible-role` on the list item takes precedence over the inherited role. |
| `additionalText` | `string \| undefined` | `undefined` | Defines the `additionalText`, displayed in the end of the tree item. |
| `additionalTextState` | `` `${ValueState}` `` | `"None"` | Defines the state of the `additionalText`.<br><br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `expanded` | `boolean` | `false` | Defines whether the tree list item will show a collapse or expand icon inside its toggle button. |
| `hasChildren` | `boolean` | `false` | Defines whether the tree node has children, even if currently no other tree nodes are slotted inside.<br><br>**Note:** This property is useful for showing big tree structures where not all nodes are initially loaded due to performance reasons.<br>Set this to `true` for nodes you intend to load lazily, when the user clicks the expand button.<br>It is not necessary to set this property otherwise. If a tree item has children, the expand button will be displayed anyway. |
| `highlight` | `` `${Highlight}` `` | `"None"` | Defines the highlight state of the list items.<br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `icon` | `string \| undefined` | `undefined` | If set, an icon will be displayed before the text of the tree list item. |
| `indeterminate` | `boolean` | `false` | Defines whether the selection of a tree node is displayed as partially selected.<br><br>**Note:** The indeterminate state can be set only programmatically and can’t be achieved by user<br>interaction, meaning that the resulting visual state depends on the values of the `indeterminate`<br>and `selected` properties:<br><br>-  If a tree node has both `selected` and `indeterminate` set to `true`, it is displayed as partially selected.<br>-  If a tree node has `selected` set to `true` and `indeterminate` set to `false`, it is displayed as selected.<br>-  If a tree node has `selected` set to `false`, it is displayed as not selected regardless of the value of the `indeterminate` property.<br><br>**Note:** This property takes effect only when the `ui5-tree` is in `Multiple` mode. |
| `movable` | `boolean` | `false` | Defines whether the item is movable. |
| `navigated` | `boolean` | `false` | The navigated state of the list item.<br>If set to `true`, a navigation indicator is displayed at the end of the list item. |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |
| `text` | `string \| undefined` | `undefined` | Defines the text of the tree item. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the text of the tooltip that would be displayed for the list item. |
| `type` | `` `${ListItemType}` `` | `"Active"` | Defines the visual indication and behavior of the list items.<br>Available options are `Active` (by default), `Inactive`, `InactiveSelectable`, `Detail` and `Navigation`.<br><br>**Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,<br>while with type `Inactive`, `InactiveSelectable` and `Detail` - will not.<br><br>**Note:** `InactiveSelectable` behaves like `Inactive` (no active press/hover feedback and the<br>`item-click` event is not fired), but the item can still be selected. Clicking the item body,<br>pressing Space/Enter, or interacting with the selection component (checkbox in Multi mode, radio<br>button in Single modes) toggles the selection when the list has a selection mode. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `default` | `DefaultSlot<TreeItemBase>` | Defines the items of the component.<br><br>**Note:** Use `ui5-tree-item` or `ui5-tree-item-custom` |
| `deleteButton` | `Slot<IButton>` | Defines the delete button, displayed in "Delete" mode.<br>**Note:** While the slot allows custom buttons, to match<br>design guidelines, please use the `ui5-button` component.<br>**Note:** When the slot is not present, a built-in delete button will be displayed. |
| `image` | `Slot<HTMLElement>` | **Note:** While the slot allows option for setting custom avatar, to match the<br>design guidelines, please use the `ui5-avatar` with size XS.<br><br>**Note:** If bigger `ui5-avatar` needs to be used, then the size of the<br>`ui5-tree-item` should be customized in order to fit. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |
| `detail-click` | `CustomEvent` | true | false | Fired when the user clicks on the detail button when type is `Detail`. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `toggle` | `toggle(): void;` | Call this method to manually switch the `expanded` state of a tree item. |

#### CSS parts

- `additionalText`: Used to style the additionalText of the tree list item
- `icon`: Used to style the icon of the tree list item
- `title`: Used to style the title of the tree list item

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `accessibleRole`.
- [ ] Verify `click`, `detail-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- CSS custom states
- Samples

### [TreeItemCustom](https://ui5.github.io/webcomponents/components/TreeItemCustom/)

- Tag: `ui5-tree-item-custom`
- Package: `@ui5/webcomponents@2.28.1`; [TypeScript declaration](https://unpkg.com/@ui5/webcomponents@2.28.1/dist/TreeItemCustom.d.ts).
- Local implementation: covered by `Tree` node `label` as ReactNode (React data-driven adaptation; UI5 parity unverified).
- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.

#### Description and keyboard interaction

The `ui5-tree-item-custom` represents a node in a tree structure, shown as a `ui5-list`.

This is the item to use inside a `ui5-tree`.
You can represent an arbitrary tree structure by recursively nesting tree items.

You can use this item to put any custom content inside the tree item.

##### ES6 Module Import
`import "@ui5/webcomponents/dist/TreeItemCustom.js";`

#### TypeScript properties

| Name | TypeScript type | Default | Description |
| --- | --- | --- | --- |
| `accessibilityAttributes` | `ListItemAccessibilityAttributes` | `{}` | Defines the additional accessibility attributes that will be applied to the component.<br>The following fields are supported:<br><br>- **ariaSetsize**: Defines the number of items in the current set  when not all items in the set are present in the DOM.<br>**Note:** The value is an integer reflecting the number of items in the complete set. If the size of the entire set is unknown, set `-1`.<br><br>	- **ariaPosinset**: Defines an element's number or position in the current set when not all items are present in the DOM.<br>	**Note:** The value is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known. |
| `accessibleName` | `string \| undefined` | `undefined` | Defines the accessible name of the component. |
| `accessibleRole` | `` `${ListItemAccessibleRole}` \| undefined `` | `undefined` | Used to define the role of the list item.<br><br>**Note:** If not set, the role is automatically inherited from the parent `ui5-list` based on its `accessible-role` property<br>(e.g. `Menu` -> `MenuItem`, `Tree` -> `TreeItem`, `ListBox` -> `Option`).<br>An explicitly set `accessible-role` on the list item takes precedence over the inherited role. |
| `additionalTextState` | `` `${ValueState}` `` | `"None"` | Defines the state of the `additionalText`.<br><br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `expanded` | `boolean` | `false` | Defines whether the tree list item will show a collapse or expand icon inside its toggle button. |
| `hasChildren` | `boolean` | `false` | Defines whether the tree node has children, even if currently no other tree nodes are slotted inside.<br><br>**Note:** This property is useful for showing big tree structures where not all nodes are initially loaded due to performance reasons.<br>Set this to `true` for nodes you intend to load lazily, when the user clicks the expand button.<br>It is not necessary to set this property otherwise. If a tree item has children, the expand button will be displayed anyway. |
| `hideSelectionElement` | `boolean` | `false` | Defines whether the tree list item should display the selection element. |
| `highlight` | `` `${Highlight}` `` | `"None"` | Defines the highlight state of the list items.<br>Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`. |
| `icon` | `string \| undefined` | `undefined` | If set, an icon will be displayed before the text of the tree list item. |
| `indeterminate` | `boolean` | `false` | Defines whether the selection of a tree node is displayed as partially selected.<br><br>**Note:** The indeterminate state can be set only programmatically and can’t be achieved by user<br>interaction, meaning that the resulting visual state depends on the values of the `indeterminate`<br>and `selected` properties:<br><br>-  If a tree node has both `selected` and `indeterminate` set to `true`, it is displayed as partially selected.<br>-  If a tree node has `selected` set to `true` and `indeterminate` set to `false`, it is displayed as selected.<br>-  If a tree node has `selected` set to `false`, it is displayed as not selected regardless of the value of the `indeterminate` property.<br><br>**Note:** This property takes effect only when the `ui5-tree` is in `Multiple` mode. |
| `movable` | `boolean` | `false` | Defines whether the item is movable. |
| `navigated` | `boolean` | `false` | The navigated state of the list item.<br>If set to `true`, a navigation indicator is displayed at the end of the list item. |
| `selected` | `boolean` | `false` | Defines the selected state of the component. |
| `tooltip` | `string \| undefined` | `undefined` | Defines the text of the tooltip that would be displayed for the list item. |
| `type` | `` `${ListItemType}` `` | `"Active"` | Defines the visual indication and behavior of the list items.<br>Available options are `Active` (by default), `Inactive`, `InactiveSelectable`, `Detail` and `Navigation`.<br><br>**Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,<br>while with type `Inactive`, `InactiveSelectable` and `Detail` - will not.<br><br>**Note:** `InactiveSelectable` behaves like `Inactive` (no active press/hover feedback and the<br>`item-click` event is not fired), but the item can still be selected. Clicking the item body,<br>pressing Space/Enter, or interacting with the selection component (checkbox in Multi mode, radio<br>button in Single modes) toggles the selection when the list has a selection mode. |

#### Slots

| Slot | TypeScript slot type | Description |
| --- | --- | --- |
| `content` | `Slot<HTMLElement>` | Defines the content of the `ui5-tree-item`. |
| `default` | `DefaultSlot<TreeItemBase>` | Defines the items of the component.<br><br>**Note:** Use `ui5-tree-item` or `ui5-tree-item-custom` |
| `deleteButton` | `Slot<IButton>` | Defines the delete button, displayed in "Delete" mode.<br>**Note:** While the slot allows custom buttons, to match<br>design guidelines, please use the `ui5-button` component.<br>**Note:** When the slot is not present, a built-in delete button will be displayed. |
| `image` | `Slot<HTMLElement>` | **Note:** While the slot allows option for setting custom avatar, to match the<br>design guidelines, please use the `ui5-avatar` with size XS.<br><br>**Note:** If bigger `ui5-avatar` needs to be used, then the size of the<br>`ui5-tree-item` should be customized in order to fit. |

#### Events

| Event | Type | Bubbles | Cancelable | Description |
| --- | --- | --- | --- | --- |
| `click` | `CustomEvent<ListItemBaseClickEventDetail>` | true | false | Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.<br><br>**Note:** The event will not be fired if the `disabled` property is set to `true`. |
| `detail-click` | `CustomEvent` | true | false | Fired when the user clicks on the detail button when type is `Detail`. |

#### Public methods

| Method | Signature / return | Description |
| --- | --- | --- |
| `toggle` | `toggle(): void;` | Call this method to manually switch the `expanded` state of a tree item. |

#### CSS parts

- `additionalText`: Used to style the additionalText of the tree list item
- `icon`: Used to style the icon of the tree list item
- `title`: Used to style the title of the tree list item

#### Acceptance and possible tests

- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.
- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.
- [ ] Test documented defaults and representative boundaries/controlled changes for `accessibilityAttributes`, `accessibleName`, `accessibleRole`.
- [ ] Verify `click`, `detail-click` semantics and payloads, including cancellation and propagation where applicable.

#### Empty documentation fields

- CSS custom states
- Samples

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
and a `scanError` event fires when the scan failed (for example, due to missing permisions).

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
| `avatar` | `Slot<HTMLElement>` | Defines the avatar, displayed in the `ui5-li-notification`.<br><br>**Note:** Consider using the `ui5-avatar` to display icons, initials or images.<br><br>**Note:** In order to be complaint with the UX guidlines and for best experience,<br>we recommend using avatars with 2rem X 2rem in size (32px X 32px). In case you are using the `ui5-avatar`<br>you can set its `size` property to `XS` to get the required size - `<ui5-avatar size="XS"></ui5-avatar>`. |
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
- Scope - displays a select in the beggining of the component, used for filtering results by their scope.
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
It is intented to represent a group of `<ui5-timeline-item>`s.

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
The items are addeed to the group's `items` slot.

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
| `hideNoData` | `boolean` | `false` | Defines if the value of `noDataText` will be diplayed when there is no rows present in the table. |
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

## Inventory summary

183 requested entries, with core and compat variants kept separate. Metadata and samples are a pinned starting point, not proof of current nightly parity.
