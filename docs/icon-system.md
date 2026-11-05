# Icon system

Enterprise UI components consume icons through a stable, logical API: an **identifier**. How the icon is stored or drawn (SVG, an icon font, Font Awesome, Material, your own artwork) is decided by registrations, not by component code.

```tsx
<Icon name="edit" />
<Icon name="material://edit" />
<Button icon="enterprise://save">Save</Button>
```

The interactive guide, with an icon browser, is the docs site's **Foundations › Icons** page. This document explains the architecture.

## Architecture

```
src/icons/
├── core/
│   ├── types.ts          IconDefinition, IconRegistration, IconCollectionRegistration,
│   │                     IconRenderProvider, IconRenderContext, IconSize, IconMetadata, IconId…
│   ├── identifier.ts     parseIconId: "edit", "enterprise://edit", "&#xe08d;", 0xe08d
│   ├── IconRegistry.ts   collections, definitions, aliases, providers, fallback, search, subscribe
│   ├── IconResolver.ts   identifier → definition + provider (aliases, schemes, caching)
│   └── usage.ts          iconUsage(): code snippets generated from a definition
├── providers/
│   ├── providers.tsx     svg, font, fontawesome, material
│   └── sanitizeSvg.ts    allowlist-based SVG sanitizer
├── collections/
│   ├── enterprise/       the default collection (src/assets/icons) + aliases.json
│   └── fontCollections.ts  fontAwesomeCollection(), materialCollection()
├── registry.ts           the shared `icons` registry with built-in providers
├── IconSource.tsx        renderIconSource(): how components turn an `icon` prop into an icon
└── svgIcon.tsx           internal: library components' own built-in icons
src/components/icon/Icon.tsx   the <Icon> component
src/assets/icons/               the SAP SVGs (data-code, data-rtl) and SAP-icons.json
```

Dependency direction (arrows point at what is depended on):

```
Button, IconButton, Menu, NavigationItem, Tabs, toolbars …
        │  icon="…"  (renderIconSource)
        ▼
      <Icon> ───────────────► IconResolver ──► IconRegistry
        │                                           ▲
        ▼                                           │ holds instances of
   IconRenderProvider (svg · font · fontawesome · material · custom)
```

- **The registry is independent of components.** It stores collections, normalized read-only definitions, aliases and provider instances. It never touches the DOM or React, so it can be used by the docs, the Studio, tests or a server, and components can change without affecting it.
- **Providers are independent of the registry.** A provider receives a definition and a render context and returns an element. It doesn't look anything up, so the same provider works for any collection, and the registry doesn't care how icons are drawn. `<Icon>` never branches on the provider type.
- **Components consume icons only through identifiers.** Every `icon` property accepts an identifier or an element. Identifiers go through `renderIconSource` → `<Icon>` → resolver → provider. Changing the `enterprise` collection from SVG to a font changes registrations, not `Button`.

## Identifiers

| Identifier | Meaning |
|---|---|
| `edit` | `edit` in the default collection (`icons.setDefaultCollection`, default `enterprise`) |
| `enterprise://edit` | collection `enterprise`, icon `edit` |
| `sap-icon://edit` | extra scheme of the `enterprise` collection (UI5 compatibility) |
| `material://edit`, `fontawesome://pen`, `fa://pen` | icons from those collections, once registered |
| `&#xe08d;`, `0xe08d`, `U+E08D` | icon-font code point, looked up across collections |

Plain names are type-checked by `IconName` (generated from `src/assets/icons` and the aliases by `npm run icons:names`, extendable through the `CustomIconNames` interface). URIs are accepted as `collection://name` strings.

## Resolution

`icons.resolve(id)` parses the identifier, finds the collection (or a scheme alias), follows aliases (cross-collection aliases registered with `registerAlias`, then aliases inside the collection, up to 8 hops), finds the definition (or asks an open collection's `resolveIcon` to create one), then picks the definition's provider (or any provider whose `canRender` accepts it). The result is:

- `resolved`, with the definition and provider;
- `pending`, while a lazy collection or an asynchronous asset (an SVG URL) loads. The registry notifies subscribers when it settles and `<Icon>` re-renders;
- `missing`, for unknown icons or collections. A development warning (`[ENTERPRISE-UI] Unknown icon: enterprise://…`) is logged once per identifier, and never in production builds. If `icons.setFallback(id)` is set, the fallback icon is returned instead.

Results are cached until the registry changes, so an icon rendered a thousand times is parsed and looked up once.

## Aliases

Aliases map a name to an icon and are resolved before any provider is involved:

- inside a collection: `aliases` in a registration or collection (`enterprise` ships `close → decline`, `user → person-placeholder`, `chevron-down → slim-arrow-down`…, see `collections/enterprise/aliases.json`);
- across collections: `icons.registerAlias('edit', 'material://edit')`.

They are useful to standardize vocabulary across icon libraries: components and apps say `close`, and the registry decides which artwork that is.

## Providers

| Provider | Sources | Renders |
|---|---|---|
| `svg` | `svg-path`, `svg-markup` (sanitized), `svg-url` (fetched once, sanitized, cached) | `<svg>` with `currentColor` |
| `font` | `glyph` (+ `fontFamily` / `className`) | `<span>` with the glyph |
| `fontawesome` | `fontawesome` (icon + style) | `<i class="fa-solid fa-pen">` |
| `material` | `material` (ligature + class) | `<span class="material-symbols-outlined">edit</span>` |

Font Awesome and Material add no dependency: they render those libraries' standard markup and rely on the font the app already loads (Free or Pro). Register their open collections with `icons.registerCollection(fontAwesomeCollection())` / `materialCollection()`.

**SVG security.** Markup is never assigned to `innerHTML`. It is parsed and rebuilt from an allowlist of shapes (`g`, `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon`) and drawing attributes; scripts, `foreignObject`, links, `style`, event handlers and `url(…)` values are dropped. Prefer registered, trusted assets.

A **custom provider** implements `IconRenderProvider`:

```ts
interface IconRenderProvider {
  canRender(definition: IconDefinition): boolean;
  render(definition: IconDefinition, context: IconRenderContext): ReactElement;
  isReady?(definition: IconDefinition): boolean;      // asynchronous assets
  load?(definition: IconDefinition): Promise<void>;
}
icons.addProvider('sprite', spriteProvider);
```

`context` carries the decisions `<Icon>` made: class names (size token, mirroring, disabled, caller's classes), custom size, style, accessibility attributes, tooltip, forwarded attributes and ref. Rendering lifecycle (`update`, `destroy`) is handled by React reconciliation, so providers are stateless render functions.

## The Icon component

`<Icon name collection size color label aria-label title decorative disabled …>` renders whatever the provider returns.

- **Size:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl` map to `--eui-icon-size-xs` … `--eui-icon-size-2xl` (12–32 px); numbers and CSS lengths are accepted. Without a size, an icon is 24 px on its own, and controls (buttons, inputs, menus) size it.
- **Colour:** `currentColor` by default; `color` overrides it.
- **Accessibility:** without a label the icon is decorative (`aria-hidden`); with `label` / `aria-label` it is `role="img"` with that name; `decorative` forces hiding; `title` is a tooltip, not an accessible name. Icons are not interactive: use `IconButton` or `Button` for actions. Direction-dependent icons mirror in right-to-left layouts.
- **Loading and unknown icons** render a placeholder of the same size (keeping any accessible name), so layouts don't shift.

## Collections and performance

`enterprise` is a **lazy** collection: its 704 SVGs (about 100 kB gzipped) are a separate chunk, loaded the first time an icon is used by name. Library components' built-in icons (chevrons, close buttons…) are imported individually through `svgIcon`, so an app that never uses an icon by name doesn't download the collection. `icons.preload('enterprise')` loads it ahead of time (for example to avoid the placeholder on first paint, or for server rendering); `{ metadata: true }` also loads SAP's categories and keywords for search.

## Design Studio

The Studio's **Icons** sidebar tab (loaded on demand) is built on the public API: `listCollections()`, `list()`, `search()`, `subscribe()` and `iconUsage()`, which generates `<Icon name="…" />`, `<Button icon="…">…</Button>` and `<IconButton icon="…" label="…" />` from each definition. Collections an app registers appear there without Studio changes.

## Adding icons and libraries

- **One icon or a product set:** `icons.register(...)` / `icons.registerCollection(...)` with SVG paths, markup or URLs.
- **An icon font, Font Awesome or Material:** register a collection with the matching provider (`fontAwesomeCollection()`, `materialCollection()`, or `provider: 'font'` with glyph sources).
- **A new rendering technology:** `icons.addProvider(name, provider)`, then register collections that name it.
- **An icon in the library's own set:** add `src/assets/icons/<name>.svg` and run `npm run icons:names`.

None of these change `<Icon>`, `Button` or any other component.
