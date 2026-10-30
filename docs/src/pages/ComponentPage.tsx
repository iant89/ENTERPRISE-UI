import { Card, MessageStrip, Page, Stack, Badge } from '@enterprise-ui/react';
import { docsBySlug } from '../registry';
import { examplesFor } from '../examples';
import { playgrounds } from '../playgrounds';
import { CodeBlock } from '../components/CodeBlock';
import { ExampleBlock, renderInlineCode } from '../components/ExampleBlock';
import { KeyboardTable } from '../components/KeyboardTable';
import { Playground } from '../components/Playground';
import { PropsTable, componentApi } from '../components/PropsTable';
import { NotFound } from './NotFound';
import { href } from '../router';
import styles from './ComponentPage.module.css';

export function ComponentPage({ slug }: { slug: string }) {
  const doc = docsBySlug.get(slug);
  if (!doc) return <NotFound />;
  const examples = examplesFor(doc.examples ?? slug);
  const playground = playgrounds[slug];
  const imports = `import { ${doc.components.join(', ')} } from '@enterprise-ui/react';`;
  const source = componentApi[doc.components[0]]?.source;

  return (
    <Page
      title={doc.name}
      titleAddon={<Badge>{doc.category}</Badge>}
      subtitle={doc.summary}
      breadcrumbs={[{ label: 'Components', href: href('/components') }, { label: doc.category, href: href('/components') }, { label: doc.name }]}
    >
      <section className="docs-section" aria-labelledby="usage">
        <h2 id="usage">Import</h2>
        <CodeBlock code={imports} label="Import statement" />
        {source && (
          <p className="docs-muted" style={{ margin: 0 }}>
            Source: <code>{source}</code>
          </p>
        )}
      </section>

      {playground && (
        <section className="docs-section" aria-labelledby="playground">
          <h2 id="playground">Interactive preview</h2>
          <p className="docs-muted">Experiment with props below, or edit JSX in the full playground.</p>
          <a className={styles.playgroundButton} href={href(`/playground/${slug}`)}>Open component playground <span aria-hidden="true">↗</span></a>
          <Playground def={playground} name={doc.name} />
        </section>
      )}

      <section className="docs-section" aria-labelledby="examples">
        <h2 id="examples">Examples</h2>
        {examples.length === 0 && <MessageStrip>No examples yet.</MessageStrip>}
        {examples.map((example) => (
          <ExampleBlock key={example.id} example={example} headingLevel={slug === 'master-detail' && example.id.endsWith('02-customers') ? 2 : 3} />
        ))}
      </section>

      <section className="docs-section" aria-labelledby="props">
        <h2 id="props">Props</h2>
        {doc.components.map((name) => (
          <Stack key={name} gap={2}>
            {doc.components.length > 1 && <h3 style={{ margin: 0 }}>{name}</h3>}
            {componentApi[name]?.description && <p className="docs-muted" style={{ margin: 0 }}>{renderInlineCode(componentApi[name].description)}</p>}
            <PropsTable component={name} />
          </Stack>
        ))}
      </section>

      <section className="docs-section" aria-labelledby="keyboard">
        <h2 id="keyboard">Keyboard interaction</h2>
        {doc.keyboard?.length ? (
          <KeyboardTable rows={doc.keyboard} caption={`${doc.name} keyboard interaction`} />
        ) : (
          <p className="docs-muted" style={{ margin: 0 }}>
            {doc.name} has no keyboard interaction of its own; interactive children follow their own patterns and the normal Tab order.
          </p>
        )}
      </section>

      <section className="docs-section" aria-labelledby="a11y">
        <h2 id="a11y">Accessibility</h2>
        <Card flat>
          <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 1.7 }}>
            {doc.a11y.map((note) => (
              <li key={note}>{renderInlineCode(note)}</li>
            ))}
          </ul>
        </Card>
      </section>

      {doc.related && (
        <section className="docs-section" aria-labelledby="related">
          <h2 id="related">Related</h2>
          <p style={{ margin: 0 }}>
            {doc.related.map((r, i) => (
              <span key={r}>
                {i > 0 && ' · '}
                <a href={href(`/components/${r}`)}>{docsBySlug.get(r)?.name ?? r}</a>
              </span>
            ))}
          </p>
        </section>
      )}
    </Page>
  );
}
