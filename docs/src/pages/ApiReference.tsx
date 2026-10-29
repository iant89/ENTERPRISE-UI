import { useMemo, useState } from 'react';
import { Badge, Page, SearchField, Stack, Table } from '@enterprise-ui/react';
import { componentApi, hookApi, PropsTable } from '../components/PropsTable';
import { docs } from '../registry';
import { href } from '../router';
import { renderInlineCode } from '../components/ExampleBlock';
import styles from './Pages.module.css';

const pageFor = (name: string) => docs.find((d) => d.components.includes(name))?.slug;

export function ApiReference() {
  const [query, setQuery] = useState('');
  const components = useMemo(
    () =>
      Object.values(componentApi)
        .filter((c) => c.props.length > 0 || pageFor(c.name))
        .filter((c) => !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.props.some((p) => p.name.toLowerCase().includes(query.toLowerCase())))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [query],
  );
  return (
    <Page
      title="API reference"
      subtitle="Props, types and defaults generated from the TypeScript source."
      breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Guides' }, { label: 'API reference' }]}
      toolbar={
        <div style={{ maxWidth: 360 }}>
          <SearchField aria-label="Filter components and props" placeholder="Filter by component or prop" value={query} onChange={setQuery} />
        </div>
      }
    >
      <section className="docs-section" aria-labelledby="api-components">
        <h2 id="api-components">
          Components <Badge>{components.length}</Badge>
        </h2>
        <Stack gap={2}>
          {components.map((c) => {
            const slug = pageFor(c.name);
            return (
              <details key={c.name} className={styles.apiItem}>
                <summary>
                  <span className={styles.apiName}>{c.name}</span>
                  <span className="docs-muted">{c.description.split('\n')[0]}</span>
                </summary>
                <div className={styles.apiBody}>
                  <span className="docs-muted">
                    <code>{c.source}</code>
                    {slug && (
                      <>
                        {' · '}
                        <a href={href(`/components/${slug}`)}>Documentation and examples</a>
                      </>
                    )}
                  </span>
                  <PropsTable component={c.name} />
                </div>
              </details>
            );
          })}
        </Stack>
      </section>
      <section className="docs-section" aria-labelledby="api-hooks">
        <h2 id="api-hooks">Hooks</h2>
        <Table
          caption="Hooks"
          responsive="stack"
          density="compact"
          getRowId={(h) => h.name}
          data={Object.values(hookApi).sort((a, b) => a.name.localeCompare(b.name))}
          columns={[
            { id: 'name', header: 'Hook', rowHeader: true, cell: (h) => <code>{h.name}</code> },
            { id: 'description', header: 'Description', cell: (h) => renderInlineCode(h.description) },
            { id: 'source', header: 'Source', cell: (h) => <code>{h.source}</code> },
          ]}
        />
      </section>
    </Page>
  );
}
