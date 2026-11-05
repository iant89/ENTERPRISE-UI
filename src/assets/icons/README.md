# SAP icons

704 SAP icons, one SVG per icon, served by the `IconProvider` class (`src/icons/IconProvider.tsx`):

```tsx
IconProvider.getIcon('bar-code');     // an <svg> element
IconProvider.getIconNames();          // every available name
```

Every file is a single 16×16 path with `fill="currentColor"`. Two optional attributes on the `<svg>` element carry the metadata the library needs:

- `data-code="e08d"`: the icon font code point (hex), so icons can be looked up as `&#xe08d;`.
- `data-rtl="flip"`: the icon points in a reading direction and is mirrored in right-to-left layouts.

`SAP-icons.json` is SAP's metadata (names, groups, search tags). Only the docs Icons page reads it; the library doesn't load it, to keep bundles small.

**Adding an icon:** drop a `<name>.svg` file in this folder in the same format (add `data-code` / `data-rtl` if they apply). It is picked up automatically at build time; no code changes are needed.
