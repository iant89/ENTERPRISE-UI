import { ArrowRight, Accessibility, Boxes, Code2, MonitorSmartphone, Palette, Rows3, SwatchBook } from 'lucide-react';
import {
  Badge, Button, Card, Grid, Input, List, MetricCard, ObjectIdentifier, Select, Stack, StatusIndicator, Table, ThemeProvider,
} from '@enterprise-ui/react';
import { categories, docs } from '../registry';
import { href, navigate } from '../router';
import { products, statusTone, currency } from '../../../examples/data';
import styles from './Pages.module.css';

const features = [
  { icon: <SwatchBook />, title: 'Design tokens', text: 'One token system for color, spacing, typography, radii, shadows, motion and density — as CSS custom properties.', path: '/tokens' },
  { icon: <Palette />, title: 'Light, dark & high contrast', text: 'Three themes that meet WCAG AA contrast, switchable at runtime and scoped per subtree.', path: '/themes' },
  { icon: <Accessibility />, title: 'Accessible by default', text: 'Semantic HTML, WAI-ARIA patterns, keyboard support, focus management and live announcements.', path: '/accessibility' },
  { icon: <MonitorSmartphone />, title: 'Responsive', text: 'Shell, tables, forms and patterns adapt from desktop to tablet and phone with touch-friendly targets.', path: '/layouts' },
  { icon: <Rows3 />, title: 'Enterprise patterns', text: 'List reports, object pages, master–detail, wizards and dashboards composed from the same parts.', path: '/patterns' },
  { icon: <Code2 />, title: 'Typed & tree-shakeable', text: 'Strict TypeScript APIs, ESM per component, React as a peer dependency, one importable stylesheet.', path: '/getting-started' },
];

function HeroPreview() {
  return (
    <ThemeProvider theme="light" className={styles.heroPreview} aria-hidden="true" inert>
      <Stack gap={3} style={{ padding: 16 }}>
        <Grid columns={2} gap={3}>
          <MetricCard title="Revenue" value="1.24" unit="M USD" trend={{ direction: 'up', value: '+8.2%' }} sparkline={[3, 5, 4, 6, 7, 9]} />
          <MetricCard title="Open orders" value="342" tone="warning" trend={{ direction: 'up', value: '+12', upIsGood: false }} />
        </Grid>
        <Table
          caption="Products"
          density="compact"
          columns={[
            { id: 'name', header: 'Product', cell: (p) => <ObjectIdentifier title={p.name} text={p.sku} /> },
            { id: 'status', header: 'Status', cell: (p) => <StatusIndicator size="sm" tone={statusTone[p.status]}>{p.status}</StatusIndicator> },
            { id: 'price', header: 'Price', align: 'end', cell: (p) => currency(p.price) },
          ]}
          data={products.slice(0, 4)}
        />
      </Stack>
    </ThemeProvider>
  );
}

export function Overview() {
  return (
    <div>
      <section className={styles.hero} aria-labelledby="overview-title">
        <div className={styles.heroInner}>
          <div>
            <Badge solid tone="information" style={{ marginBottom: 16 }}>v0.1 · React 18 / 19</Badge>
            <h1 id="overview-title" className={styles.heroTitle}>
              Enterprise UI Kit
            </h1>
            <p className={styles.heroLead}>
              A Fiori-inspired React component library for dashboards, ERP, inventory, fleet and other data-heavy business applications —
              built with TypeScript, CSS Modules and design tokens, with no SAPUI5 dependency.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.heroButtonPrimary} href={href('/getting-started')}>
                Get started <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a className={styles.heroButtonSecondary} href={href('/demo')}>
                <Boxes size={16} aria-hidden="true" /> Open the demo app
              </a>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}><strong>{docs.length}</strong><span>documented components</span></div>
              <div className={styles.stat}><strong>3</strong><span>themes · 2 densities</span></div>
              <div className={styles.stat}><strong>WCAG 2.2 AA</strong><span>accessibility target</span></div>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      <div className={styles.content}>
        <section className="docs-section" aria-labelledby="features">
          <h2 id="features">Why Enterprise UI Kit</h2>
          <Grid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
            {features.map((f) => (
              <Card key={f.title} title={f.title} avatar={<span className={styles.featureIcon} aria-hidden="true">{f.icon}</span>} onClick={() => navigate(f.path)}>
                <p className={styles.featureText}>{f.text}</p>
              </Card>
            ))}
          </Grid>
        </section>

        <section className="docs-section" aria-labelledby="usage">
          <h2 id="usage">Looks and feels like professional enterprise software</h2>
          <Grid columns={{ base: 1, md: 2 }} gap={4}>
            <Card title="Create purchase requisition" subtitle="Forms with labels, help text and validation" footer={<><Button variant="tertiary">Cancel</Button><Button variant="primary">Submit</Button></>}>
              <Stack gap={3}>
                <Input label="Title" defaultValue="Laptops for new hires" required />
                <Select label="Cost center" options={[{ value: '1000', label: 'CC-1000 Operations' }, { value: '2000', label: 'CC-2000 Sales' }]} defaultValue="1000" />
                <Input label="Budget" defaultValue="12,000" endAdornment="USD" status="warning" statusMessage="Exceeds your approval limit; a manager will be asked." />
              </Stack>
            </Card>
            <Card title="Browse by category" subtitle="Every component has live examples, an API reference, and keyboard and accessibility notes" noPadding>
              <List
                items={categories.map((c) => ({
                  id: c.id,
                  title: c.id,
                  description: c.description,
                  trailing: <Badge>{docs.filter((d) => d.category === c.id).length}</Badge>,
                  href: href('/components'),
                }))}
              />
            </Card>
          </Grid>
        </section>
      </div>
    </div>
  );
}
