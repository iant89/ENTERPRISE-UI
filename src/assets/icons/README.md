# SAP icons

704 SAP icons, one SVG per icon.

```tsx
<Icon name="bar-code" />                       // the default "enterprise" collection
<Button icon="enterprise://bar-code">Scan</Button>
icons.list({ collection: 'enterprise' });      // every definition
```

They form the `enterprise` collection of the icon system (`src/icons`, see `docs/icon-system.md`), loaded lazily on first use. Library components import their own built-in icons directly (`import barCode from '../../assets/icons/bar-code.svg?raw'` with the internal `svgIcon` helper), so apps only bundle those unless they use icons by name.

Every file is a single 16×16 path with `fill="currentColor"`. Two optional attributes on the `<svg>` element carry the metadata the library needs:

- `data-code="e08d"`: the icon font code point (hex), so icons can be looked up as `&#xe08d;`.
- `data-rtl="flip"`: the icon points in a reading direction and is mirrored in right-to-left layouts.

`SAP-icons.json` is SAP's metadata (names, groups, search tags). Only the docs Icons page reads it; the library doesn't load it, to keep bundles small.

**Adding an icon:** drop a `<name>.svg` file in this folder in the same format (add `data-code` / `data-rtl` if they apply), then run `npm run icons:names` so `IconName` includes it (a unit test fails until you do).
