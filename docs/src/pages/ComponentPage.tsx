import { Badge, MessageStrip, Page } from '@enterprise-ui/react';
import { docsBySlug } from '../registry';
import { examplesFor } from '../examples';
import { playgrounds } from '../playgrounds';
import { CodeBlock } from '../components/CodeBlock';
import { ExampleBlock, renderInlineCode } from '../components/ExampleBlock';
import { KeyboardTable } from '../components/KeyboardTable';
import { Playground } from '../components/Playground';
import { ApiTables, ThemingTokens, componentApi, groupProps } from '../components/ApiTables';
import { NotFound } from './NotFound';
import { href } from '../router';
import styles from './ComponentPage.module.css';

interface TocEntry { id: string; label: string; children?: TocEntry[] }

/** "On this page" navigation, shown beside the content on wide screens. */
function OnThisPage({ entries }: { entries: TocEntry[] }) {
  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.tocTitle} aria-hidden="true">On this page</p>
      <ul>
        {entries.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} onClick={(event) => { event.preventDefault(); document.getElementById(e.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{e.label}</a>
            {e.children && (
              <ul>
                {e.children.map((c) => (
                  <li key={c.id}>
                    <a href={`#${c.id}`} onClick={(event) => { event.preventDefault(); document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{c.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ComponentPage({ slug }: { slug: string }) {
  const doc = docsBySlug.get(slug);
  if (!doc) return <NotFound />;
  const examples = examplesFor(doc.examples ?? slug);
  const playground = playgrounds[slug];
  const imports = `import { ${doc.components.join(', ')} } from '@enterprise-ui/react';`;
  const primary = componentApi[doc.components[0]];
  const counts = doc.components.reduce(
    (sum, name) => {
      const g = groupProps(componentApi[name]?.props ?? []);
      return { properties: sum.properties + g.properties.length + g.states.length + g.slots.length, events: sum.events + g.events.length };
    },
    { properties: 0, events: 0 },
  );
  const hasTokens = doc.components.some((c) => (componentApi[c]?.cssVariables?.length ?? 0) > 0);

  const toc: TocEntry[] = [
    { id: 'overview', label: 'Overview' },
    ...(playground ? [{ id: 'playground', label: 'Interactive preview' }] : []),
    { id: 'examples', label: 'Examples' },
    { id: 'api', label: 'API reference', children: doc.components.length > 1 ? doc.components.map((c) => ({ id: `api-${c}`, label: c })) : undefined },
    ...(hasTokens ? [{ id: 'theming', label: 'Theming' }] : []),
    { id: 'accessibility', label: 'Accessibility' },
    ...(doc.related ? [{ id: 'related', label: 'Related components' }] : []),
  ];

  return (
    <Page
      title={doc.name}
      titleAddon={<Badge>{doc.category}</Badge>}
      subtitle={doc.summary}
      breadcrumbs={[{ label: 'Components', href: href('/components') }, { label: doc.category, href: href('/components') }, { label: doc.name }]}
    >
      <div className={styles.layout}>
        <div className={styles.content}>
          <section className="docs-section" aria-labelledby="overview">
            <h2 id="overview">Overview</h2>
            {primary?.description && <p className={styles.lead}>{renderInlineCode(primary.description)}</p>}
            <dl className={styles.facts}>
              <div><dt>Category</dt><dd>{doc.category}</dd></div>
              <div><dt>Properties</dt><dd>{counts.properties}</dd></div>
              <div><dt>Events</dt><dd>{counts.events}</dd></div>
              {primary?.source && <div><dt>Source</dt><dd><code>{primary.source}</code></dd></div>}
            </dl>
            <h3 className={styles.subheading}>Import</h3>
            <CodeBlock code={imports} label="Import statement" />
          </section>

          {playground && (
            <section className="docs-section" aria-labelledby="playground">
              <h2 id="playground">Interactive preview</h2>
              <p className="docs-muted">Change the properties below to see their effect, or open the full playground to edit the JSX.</p>
              <a className={styles.playgroundButton} href={href(`/playground/${slug}`)}>Open component playground <span aria-hidden="true">↗</span></a>
              <Playground def={playground} name={doc.name} />
            </section>
          )}

          <section className="docs-section" aria-labelledby="examples">
            <h2 id="examples">Examples</h2>
            {examples.length === 0 && <MessageStrip>No examples are available yet.</MessageStrip>}
            {examples.map((example) => (
              <ExampleBlock key={example.id} example={example} headingLevel={slug === 'master-detail' && example.id.endsWith('02-customers') ? 2 : 3} />
            ))}
          </section>

          <section className="docs-section" aria-labelledby="api">
            <h2 id="api">API reference</h2>
            <p className="docs-muted" style={{ margin: 0 }}>Generated from the TypeScript source. Required properties are marked; every other property is optional.</p>
            {doc.components.map((name) =>
              doc.components.length > 1 ? (
                <div key={name} className={styles.apiComponent}>
                  <h3 id={`api-${name}`} className={styles.apiComponentTitle}><code>{name}</code></h3>
                  {componentApi[name]?.description && <p className="docs-muted" style={{ margin: 0 }}>{renderInlineCode(componentApi[name].description)}</p>}
                  <ApiTables component={name} headingLevel={4} />
                </div>
              ) : (
                <ApiTables key={name} component={name} />
              ),
            )}
          </section>

          {hasTokens && (
            <section className="docs-section" aria-labelledby="theming">
              <h2 id="theming">Theming</h2>
              <p className="docs-muted" style={{ margin: 0 }}>
                {doc.name} is styled with these design tokens. Every theme defines them; override a token on a <code>ThemeProvider</code> or any ancestor element to restyle the component. See <a href={href('/tokens')}>Design tokens</a>.
              </p>
              <ThemingTokens components={doc.components} />
            </section>
          )}

          <section className="docs-section" aria-labelledby="accessibility">
            <h2 id="accessibility">Accessibility</h2>
            <h3 className={styles.subheading}>Keyboard interaction</h3>
            {doc.keyboard?.length ? (
              <KeyboardTable rows={doc.keyboard} caption={`${doc.name} keyboard interaction`} />
            ) : (
              <p className="docs-muted" style={{ margin: 0 }}>
                {doc.name} has no keyboard interaction of its own. Interactive children follow their own patterns and the normal Tab order.
              </p>
            )}
            <h3 className={styles.subheading}>Screen readers and ARIA</h3>
            <ul className={styles.notes}>
              {doc.a11y.map((note) => (
                <li key={note}>{renderInlineCode(note)}</li>
              ))}
            </ul>
          </section>

          {doc.related && (
            <section className="docs-section" aria-labelledby="related">
              <h2 id="related">Related components</h2>
              <ul className={styles.related}>
                {doc.related.map((r) => (
                  <li key={r}><a href={href(`/components/${r}`)}>{docsBySlug.get(r)?.name ?? r}</a></li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <OnThisPage entries={toc} />
      </div>
    </Page>
  );
}
