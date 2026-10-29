import { Card, Grid, List, Page } from '@enterprise-ui/react';
import { docs } from '../registry';
import { href } from '../router';
import { examplesFor } from '../examples';
import { ExampleBlock } from '../components/ExampleBlock';

const floorplans = [
  { title: 'List report', text: 'FilterBar + DataGrid in a Page. Find, filter and act on many objects.', uses: 'FilterBar, DataGrid, CommandToolbar, EmptyState' },
  { title: 'Object page', text: 'One object with a rich header, key facts and sections.', uses: 'ObjectPage, MetricCard, Table, Timeline' },
  { title: 'Master–detail', text: 'Browse a list while viewing the selected item.', uses: 'MasterDetail, List, ObjectPage, DetailPanel' },
  { title: 'Guided task', text: 'Step-by-step creation or configuration.', uses: 'Wizard, FormGroup, MessageStrip' },
  { title: 'Overview', text: 'KPIs and cards to monitor and drill down.', uses: 'Dashboard, MetricCard, Card, List' },
];

export function Patterns() {
  const listReport = examplesFor('list-report').find((example) => example.id.endsWith('03-purchase-orders'));
  const objectPage = examplesFor('object-page')[0];
  const cookbookIds = ['dashboard/02-inventory', 'master-detail/02-customers', 'wizard/02-purchase-order', 'approval-workflow/02-inbox', 'data-grid/03-assets', 'object-editor/01-object-page'];
  const cookbook = cookbookIds.flatMap((id) => {
    const example = examplesFor(id.split('/')[0]).find((item) => item.id === id);
    return example ? [example] : [];
  });
  return (
    <Page
      title="Enterprise patterns"
      subtitle="Higher-level floorplans that combine existing components instead of re-implementing them."
      breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Guides' }, { label: 'Enterprise patterns' }]}
    >
      <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        {floorplans.map((f) => (
          <Card key={f.title} title={f.title} headingLevel={2} footer={<span className="docs-muted">{f.uses}</span>}>
            <p style={{ margin: 0 }}>{f.text}</p>
          </Card>
        ))}
        <Card title="All pattern components" headingLevel={2} noPadding>
          <List items={docs.filter((d) => d.category === 'Patterns').map((d) => ({ id: d.slug, title: d.name, href: href(`/components/${d.slug}`) }))} />
        </Card>
      </Grid>
      {listReport && <ExampleBlock example={listReport} headingLevel={2} />}
      {objectPage && <ExampleBlock example={objectPage} headingLevel={2} />}
      <h2>Enterprise cookbook</h2>
      <p>Runnable mock examples. Applications must supply persistence, authorization and real service integrations.</p>
      {cookbook.map((example) => <ExampleBlock key={example.id} example={example} headingLevel={3} />)}
    </Page>
  );
}
