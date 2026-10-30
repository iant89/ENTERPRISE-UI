import { ExternalLink } from 'lucide-react';
import { Card, Grid, List, MessageStrip, Page, Table, ThemeProvider } from '@enterprise-ui/react';
import { docs } from '../registry';
import { href } from '../router';
import InventoryApp from '../../../examples/apps/InventoryApp';
import styles from './Pages.module.css';

const breakpointRows = [
  { id: 'sm', size: 'Phone', range: '< 600px', shell: 'Navigation opens as a modal drawer from the menu button; header search collapses behind an icon.', content: 'Single column; dialogs are full screen; tables can stack rows into cards.' },
  { id: 'md', size: 'Tablet', range: '600 – 1023px', shell: 'Navigation starts collapsed to icons with tooltips and flyout menus.', content: 'Two-column grids; master–detail shows one pane at a time.' },
  { id: 'lg', size: 'Desktop', range: '1024 – 1439px', shell: 'Full navigation, collapsible by the user; search inline in the header.', content: 'Up to four columns; side-by-side master–detail.' },
  { id: 'xl', size: 'Wide', range: '≥ 1440px', shell: 'As desktop.', content: 'Wider containers and grids.' },
];

export function Layouts() {
  return (
    <Page
      title="Layouts"
      subtitle="The application shell and layout primitives every screen is built from."
      breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Guides' }, { label: 'Layouts' }]}
      actions={
        <a href={href('/demo')} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          Open demo full screen <ExternalLink size={14} aria-hidden="true" />
          <span className="eui-visually-hidden">(opens in a new tab)</span>
        </a>
      }
    >
      <section className="docs-section" aria-labelledby="shell">
        <h2 id="shell">Application shell</h2>
        <p className="docs-muted" style={{ margin: 0 }}>
          AppShell + ApplicationHeader + SideNavigation + Page. Configure branding, navigation and page content; the shell handles responsive
          behavior, landmarks and the skip link.
        </p>
        <ThemeProvider transparent className={styles.frame} style={{ height: 640 }} data-embedded-app="">
          <InventoryApp />
        </ThemeProvider>
      </section>
      <section className="docs-section" aria-labelledby="responsive">
        <h2 id="responsive">Responsive behavior</h2>
        <Table
          caption="Breakpoints"
          responsive="stack"
          data={breakpointRows}
          columns={[
            { id: 'size', header: 'Size class', accessor: 'size', rowHeader: true },
            { id: 'range', header: 'Viewport width', accessor: 'range' },
            { id: 'shell', header: 'Shell', accessor: 'shell' },
            { id: 'content', header: 'Content', accessor: 'content' },
          ]}
        />
        <MessageStrip tone="information">
          Use <code>useBreakpoint()</code> or <code>useMediaQuery()</code> for behavior that must change in JavaScript, and the exported
          <code>breakpoints</code> constants in media queries.
        </MessageStrip>
      </section>
      <section className="docs-section" aria-labelledby="primitives">
        <h2 id="primitives">Layout components</h2>
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          <Card title="Frame" noPadding headingLevel={3}>
            <List items={docs.filter((d) => ['app-shell', 'page', 'application-header', 'side-navigation'].includes(d.slug)).map((d) => ({ id: d.slug, title: d.name, description: d.summary, href: href(`/components/${d.slug}`) }))} />
          </Card>
          <Card title="Primitives" noPadding headingLevel={3}>
            <List items={docs.filter((d) => d.category === 'Layout' && !['app-shell', 'page'].includes(d.slug)).map((d) => ({ id: d.slug, title: d.name, description: d.summary, href: href(`/components/${d.slug}`) }))} />
          </Card>
        </Grid>
      </section>
    </Page>
  );
}
