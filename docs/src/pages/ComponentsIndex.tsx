import { Card, Grid, Page } from '@enterprise-ui/react';
import { List } from '@enterprise-ui/react';
import { categories, docs } from '../registry';
import { href } from '../router';

export function ComponentsIndex() {
  return (
    <Page title="Components" subtitle={`${docs.length} documented components in seven categories.`} breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Components' }]}>
      <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {categories.map((c) => (
          <Card key={c.id} title={c.id} subtitle={c.description} headingLevel={2} noPadding headerDivider>
            <List
              aria-label={`${c.id} components`}
              items={docs
                .filter((d) => d.category === c.id)
                .map((d) => ({ id: d.slug, title: d.name, description: d.summary, href: href(`/components/${d.slug}`) }))}
            />
          </Card>
        ))}
      </Grid>
    </Page>
  );
}
