import { Button, Card, MessageStrip, Page, Stack } from '@enterprise-ui/react';
import { CodeBlock } from '../components/CodeBlock';

const install = `npm install @enterprise-ui/react lucide-react
# peer dependencies
npm install react react-dom`;

const setup = `// main.tsx
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
);`;

const first = `import { Button, Card } from '@enterprise-ui/react';

export function Dashboard() {
  return (
    <Card title="Sales Overview">
      <p>Total revenue: $125,430</p>
      <Button variant="primary" onClick={() => {
        console.log('Opening report');
      }}>
        View Report
      </Button>
    </Card>
  );
}`;

const shell = `import { Home, Package } from 'lucide-react';
import {
  AppShell, ApplicationHeader, SideNavigation, NavigationItem, Page, Button,
} from '@enterprise-ui/react';

export function App() {
  return (
    <AppShell
      header={<ApplicationHeader productName="Northwind" user={{ name: 'Ada Lovelace' }} />}
      navigation={
        <SideNavigation activeId="products">
          <NavigationItem id="home" label="Home" icon={<Home />} href="/" />
          <NavigationItem id="products" label="Products" icon={<Package />} href="/products" />
        </SideNavigation>
      }
    >
      <Page
        title="Products"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
        actions={<Button variant="primary">Create</Button>}
      >
        …
      </Page>
    </AppShell>
  );
}`;

const tokensOnly = `/* Only the design tokens and themes, without component styles */
@import '@enterprise-ui/react/tokens.css';

.my-panel {
  padding: var(--eui-space-4);
  background: var(--eui-color-surface);
  border: 1px solid var(--eui-color-border);
  border-radius: var(--eui-radius-md);
}`;

const scripts = `npm run dev          # documentation site with live examples
npm run build:lib    # library build → dist/ (ESM, .d.ts, styles.css)
npm run build:docs   # static documentation → docs-dist/
npm test             # unit + accessibility tests (Vitest, Testing Library, axe-core)
npm run test:e2e     # browser, accessibility and visual tests (Playwright)
npm run typecheck && npm run lint`;

export function GettingStarted() {
  return (
    <Page title="Getting started" subtitle="Install the package, load the stylesheet, wrap your app and start composing." breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Getting started' }]} width="contained">
      <div className="prose">
        <h2>1. Install</h2>
        <p>The library ships as ES modules with TypeScript declarations. React and React DOM (18.2 or newer) are peer dependencies; icons come from Lucide.</p>
      </div>
      <CodeBlock code={install} language="shell" label="Installation commands" />

      <div className="prose">
        <h2>2. Load the styles and add the providers</h2>
        <p>
          Import <code>@enterprise-ui/react/styles.css</code> once. <code>ThemeProvider</code> applies the theme and density, hosts the
          overlay layer for menus and dialogs, and provides a screen-reader live region. <code>ToastProvider</code> is only needed if you use
          toasts.
        </p>
      </div>
      <CodeBlock code={setup} label="Application setup" />

      <div className="prose">
        <h2>3. Use components</h2>
        <p>Components are typed React components that compose through children and support controlled or uncontrolled state.</p>
      </div>
      <CodeBlock code={first} label="First component" />
      <Card title="Sales Overview" style={{ maxWidth: 360 }}>
        <Stack gap={3} align="flex-start">
          <p style={{ margin: 0 }}>Total revenue: $125,430</p>
          <Button variant="primary" onClick={() => console.log('Opening report')}>View Report</Button>
        </Stack>
      </Card>

      <div className="prose">
        <h2>4. Build the application shell</h2>
        <p>
          <code>AppShell</code> combines a header, side navigation and main region. Supply your own branding, navigation and routing — call
          <code>event.preventDefault()</code> in <code>onNavigate</code> to integrate a client-side router.
        </p>
      </div>
      <CodeBlock code={shell} label="Application shell" />

      <div className="prose">
        <h2>Tokens without components</h2>
        <p>Already have components? Use the design tokens alone to align custom UI with the design language.</p>
      </div>
      <CodeBlock code={tokensOnly} language="css" label="Using tokens" />

      <MessageStrip tone="information" title="Tree-shaking:">
        Each component is its own ES module and the package marks only CSS as having side effects, so bundlers include just what you import.
      </MessageStrip>

      <div className="prose">
        <h2>Working on the library</h2>
      </div>
      <CodeBlock code={scripts} language="shell" label="Development scripts" />
    </Page>
  );
}
