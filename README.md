# Enterprise UI Kit

`@enterprise-ui/react` is a React + TypeScript component library for dashboards, administration panels, ERP, inventory, fleet management and other data-heavy business applications. Its visual language and interaction patterns follow SAP Fiori, but it has its own implementation, design tokens and component APIs, and it does not depend on SAPUI5 or OpenUI5.

- **Design tokens.** Colour, spacing, typography, radii, shadows, sizes, focus, z-index, motion, breakpoints, disabled states and density are all CSS custom properties (`--eui-*`).
- **Themes.** Light, dark and high contrast, switchable at runtime and scoped to any subtree. There are two densities: cozy and compact.
- **Components.** 64 documented components: layout, navigation, buttons, forms, data display and feedback, plus enterprise patterns.
- **Accessibility.** Targets WCAG 2.2 AA: semantic HTML, WAI-ARIA patterns, keyboard support, focus management, live announcements and reduced motion. Axe tests run on every component and every documentation page.
- **Responsive.** Layouts work on desktop, tablet and phone, with touch-friendly targets and responsive tables.
- **Package.** Typed, tree-shakeable ESM (one module per component). React is a peer dependency, and the stylesheet is imported separately.

Runtime dependencies: `lucide-react` (icons) only.

## Installation

```bash
npm install @enterprise-ui/react lucide-react react react-dom
```

React 18.2 or newer is required. React 19 is supported.

## Usage

```tsx
// main.tsx
import { createRoot } from 'react-dom/client';
import { ThemeProvider, ToastProvider } from '@enterprise-ui/react';
import '@enterprise-ui/react/styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme="light" density="cozy" style={{ minHeight: '100vh' }}>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ThemeProvider>,
);
```

```tsx
import { Button, Card } from '@enterprise-ui/react';

export function Dashboard() {
  return (
    <Card title="Sales Overview">
      <p>Total revenue: $125,430</p>
      <Button variant="primary" onClick={() => console.log('Opening report')}>
        View Report
      </Button>
    </Card>
  );
}
```

`ThemeProvider` does three things:

- applies the theme (`light`, `dark`, `high-contrast` or `system`) and the density;
- hosts the overlay layer that menus, popovers and dialogs portal into, so they inherit the theme;
- provides the screen-reader live region used by `useAnnouncer()` and toasts.

### Application shell

```tsx
import { Home, Package } from 'lucide-react';
import { AppShell, ApplicationHeader, Button, NavigationItem, Page, SideNavigation } from '@enterprise-ui/react';

<AppShell
  header={<ApplicationHeader productName="Northwind" user={{ name: 'Ada Lovelace' }} notificationCount={3} />}
  navigation={
    <SideNavigation activeId="products" onNavigate={(id, event) => { event.preventDefault(); router.push(id); }}>
      <NavigationItem id="home" label="Home" icon={<Home />} href="/" />
      <NavigationItem id="catalog" label="Catalog" icon={<Package />}>
        <NavigationItem id="products" label="Products" href="/products" />
      </NavigationItem>
    </SideNavigation>
  }
>
  <Page title="Products" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]} actions={<Button variant="primary">Create</Button>}>
    …
  </Page>
</AppShell>
```

The navigation adapts to the screen size:

| Screen | Width | Navigation |
| --- | --- | --- |
| Phone | under 600px | Modal drawer |
| Tablet | 600–1023px | Collapsed to icons |
| Desktop | 1024px and up | Full; the user can collapse it |

### Tokens only

To use the tokens without the component styles:

```css
@import '@enterprise-ui/react/tokens.css';

.panel {
  padding: var(--eui-space-4);
  border: 1px solid var(--eui-color-border);
  border-radius: var(--eui-radius-md);
}
```

## Components

| Category | Components |
| --- | --- |
| Layout | AppShell, Page, Container, Grid, Flex, Stack, SplitView, ResizablePanel |
| Navigation | ApplicationHeader, SideNavigation, NavigationItem, NavigationGroup, Breadcrumbs, Tabs, Menu, DropdownMenu, Pagination |
| Buttons | Button, IconButton, SplitButton, ToggleButton, ButtonGroup |
| Forms | Input, TextArea, NumberInput, SearchField, Select, ComboBox, MultiSelect, Checkbox, RadioGroup, Switch, DatePicker, Calendar, TimePicker, FormField, FormGroup |
| Data display | Table, DataGrid, List, Tree, TreeTable, Card, Avatar, Badge, StatusIndicator, Timeline, ObjectIdentifier, MetricCard |
| Feedback | Dialog, AlertDialog, Toast (`ToastProvider` + `useToast`), MessageStrip, Tooltip, Popover, ProgressBar, Spinner, Skeleton |
| Enterprise patterns | FilterBar, MasterDetail, ObjectPage, DetailPanel, Wizard, Dashboard, CommandToolbar, EmptyState |

The library also exports these hooks: `useControllableState`, `useFocusTrap`, `usePosition`, `useMediaQuery`, `useBreakpoint`, `useTheme`, `useAnnouncer`, `useToast` and `useAppShell`. It also exports the token catalogue (`tokenGroups`, `getTokenValue`, `breakpoints`).

The patterns are built from the existing components; they do not re-implement them. For example, `DataGrid` is made from `Table`, `SearchField`, `Select`, `Pagination` and `DropdownMenu`.

## Documentation site

```bash
npm install
npm run dev        # http://localhost:5173
```

The site is built with the library itself and has these pages: Overview, Getting started, Design tokens, Themes, Components (64 pages), Component gallery, Layouts, Enterprise patterns, Accessibility and API reference. `#/demo` opens a full inventory application.

Each component page has:

- a live interactive preview, with preview controls where useful;
- runnable TypeScript examples, including variant, disabled and error states;
- a props table with defaults;
- keyboard interaction notes;
- accessibility notes.

The props tables are generated from the TypeScript source and JSDoc by `scripts/extract-api.mjs`.

## Project structure

```
├── src/
│   ├── components/   # one folder per component: Component.tsx, *.module.css, *.test.tsx, index.ts
│   ├── layouts/      # AppShell, Page, Container, Grid, Flex, Stack, SplitView, ResizablePanel
│   ├── patterns/     # FilterBar, MasterDetail, ObjectPage, DetailPanel, Wizard, Dashboard, …
│   ├── hooks/        # controllable state, focus trap, positioning, media queries, …
│   ├── themes/       # light.css, dark.css, high-contrast.css, ThemeProvider
│   ├── tokens/       # tokens.css and the token catalogue
│   ├── utilities/    # cx, refs, keyboard helpers, Portal, VisuallyHidden, dates
│   ├── styles/       # global entry (tokens + themes + scoped base styles)
│   └── index.ts      # public API
├── docs/             # documentation site (Vite app)
├── examples/         # example components rendered and shown as code by the docs
├── tests/            # shared test setup, example tests, Playwright suites
├── scripts/          # API extraction, contrast checker, build helpers
├── vite.config.ts    # library build + Vitest config
└── playwright.config.ts
```

Styling uses CSS Modules with readable class names: `eui-<File>-<class>`, for example `eui-Button-primary`. Every value comes from tokens. Base styles apply only inside `[data-eui-theme]`, so the library never resets a host application's global styles.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Documentation site with live examples |
| `npm run build:lib` | Library build to `dist/`: ESM, `.d.ts`, `styles.css`, `tokens.css` |
| `npm run build:docs` | Static documentation to `docs-dist/` |
| `npm run build` | Both builds |
| `npm test` | Unit, behaviour and accessibility tests (Vitest, Testing Library, axe-core) |
| `npm run test:e2e` | Browser tests (Playwright): axe on every docs page in all themes, keyboard flows, responsive behaviour, visual regression |
| `npm run test:e2e:update` | Refresh the visual-regression baselines |
| `npm run typecheck`, `npm run lint` | TypeScript and ESLint |
| `node scripts/contrast.mjs` | Checks the WCAG contrast of theme token pairs |

## Testing

- **Unit (Vitest + Testing Library).** Covers roles, names, states, keyboard behaviour, focus management, controlled and uncontrolled state, and pure helpers (positioning, pagination, sorting, dates).
- **Examples.** Every documentation example is rendered and checked with axe-core.
- **Browser (Playwright).**
  - Every docs page and component page is checked with axe, including colour contrast.
  - Contrast is re-checked in the dark and high-contrast themes.
  - The demo application is checked with all axe rules.
  - Real-browser keyboard and responsive tests run on desktop and phone viewports.
  - Visual regression baselines are stored in `tests/e2e/visual.spec.ts-snapshots`. They depend on the platform's font rendering, so CI skips them unless `VISUAL_BASELINES=1` is set and the baselines were generated in the CI image.

## Accessibility

- Each component's documentation page lists its keyboard model and its accessibility notes.
- Interactive borders and focus indicators meet 3:1 contrast in every theme, and text meets 4.5:1.
- Durations collapse to 0ms under `prefers-reduced-motion`, or when `reducedMotion` is passed to `ThemeProvider`.

## Browser support

The library targets evergreen browsers (Chrome, Edge, Firefox and Safari). It uses CSS custom properties, `:focus-visible`, `:has()` (for progressive enhancements only) and `ResizeObserver`. The automated browser suite runs in Chromium.
