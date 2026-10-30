# Component conventions

Every component in `src/components` follows these rules. New roadmap components were written to them, and existing components that deviated were aligned.

- **Layout:** `src/components/<kebab-name>/` with `<Pascal>.tsx`, `<Pascal>.module.css`, `<Pascal>.test.tsx` and an `index.ts` barrel (`export { X, type XProps } from './X'`). Re-export the folder from `src/index.ts` under its category comment.
- **API:** `export interface XProps extends <native HTMLAttributes of the root>` (with `Omit` for redefined properties). JSDoc on every property, with `@default` values. Prop names are React-idiomatic (`onValueChange`/`onChange(value)`, `disabled`, `size: 'sm' | 'md' | 'lg'`), not UI5 attribute names.
- **Refs and passthrough:** `forwardRef` with a named function, `className` merged with `cx(styles.root, …, className)`, and `...rest` spread onto the root DOM element. Components that render only into a portal (Popover, Dialog-based ones) do not take a ref.
- **State:** controlled/uncontrolled pairs (`value`/`defaultValue`/`onChange`, `open`/`defaultOpen`/`onOpenChange`) via `useControllableState`. Callbacks receive values, not DOM events.
- **Collections:** data-driven properties (`items`, `options`, `nodes`, `columns`) rather than child-element registration. UI5 child elements (`*Item`, `*Group`, `*Separator`) map to item fields.
- **Styling:** CSS Modules using only `--eui-*` design tokens; logical properties for RTL; `:focus-visible` outlines from focus tokens; reduced-motion aware animations; phone breakpoint at `599.98px`.
- **Accessibility:** native elements first; ARIA roles/states (`aria-pressed`, `aria-expanded`, `aria-current`, `aria-busy`) mirror visual state; roving arrow-key navigation for composite widgets; meaning never conveyed by color alone.
- **Localization:** every visible or accessible string has an English default overridable via a `labels`/`messages` property (functions for interpolated text).
- **Ownership:** transport, persistence, authorization and routing stay with the application.
- **Tests:** `renderWithTheme` + Testing Library for behavior, keyboard and ARIA, plus `axeViolations` for an axe pass.
- **Docs:** an entry in `docs/src/registry.ts` (summary, keyboard table, a11y notes, related pages) and at least one example in `examples/<slug>/` exporting `title` and `description`.
