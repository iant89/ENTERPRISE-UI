import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Card, Grid, MessageStrip, Page, Stack, Table, getTokenValue, tokenGroups, useTheme, breakpoints, type TokenDefinition, type TokenGroup } from '@enterprise-ui/react';
import styles from './Pages.module.css';

function Visual({ group, token }: { group: TokenGroup; token: TokenDefinition }) {
  const v = `var(${token.name})`;
  switch (group.kind) {
    case 'color':
      return <span className={styles.swatch} style={{ background: v }} />;
    case 'space':
      return <span className={styles.spaceBar} style={{ width: v }} />;
    case 'radius':
      return <span className={styles.radiusBox} style={{ borderRadius: v }} />;
    case 'shadow':
      return <span className={styles.shadowBox} style={{ boxShadow: v }} />;
    case 'font-size':
      return <span style={{ fontSize: v, lineHeight: 1.2 }}>Aa</span>;
    case 'font-weight':
      return <span style={{ fontWeight: v as CSSProperties['fontWeight'] }}>Revenue</span>;
    default:
      return null;
  }
}

function TokenTable({ group }: { group: TokenGroup }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme, density } = useTheme();
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    setValues(Object.fromEntries(group.tokens.map((t) => [t.name, getTokenValue(t.name, ref.current)])));
  }, [group, resolvedTheme, density]);
  const hasVisual = ['color', 'space', 'radius', 'shadow', 'font-size', 'font-weight'].includes(group.kind);
  return (
    <div ref={ref}>
      <Table<TokenDefinition>
        caption={`${group.title} tokens`}
        getRowId={(t) => t.name}
        data={group.tokens}
        density="compact"
        responsive="stack"
        columns={[
          ...(hasVisual ? [{ id: 'visual', header: <span className="eui-visually-hidden">Preview</span>, headerText: 'Preview', width: '6rem', cell: (t: TokenDefinition) => <Visual group={group} token={t} /> }] : []),
          { id: 'name', header: 'Token', rowHeader: true, cell: (t) => <code className={styles.tokenName}>{t.name}</code> },
          { id: 'value', header: 'Current value', cell: (t) => <span className={styles.tokenValue}>{values[t.name] || '—'}</span> },
          { id: 'description', header: 'Usage', accessor: 'description' },
        ]}
      />
    </div>
  );
}

export function Tokens() {
  return (
    <Page
      title="Design tokens"
      subtitle="CSS custom properties that define the visual language. Values update live with the selected theme and density."
      breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Foundations' }, { label: 'Design tokens' }]}
    >
      <MessageStrip tone="information">
        All tokens are prefixed with <code>--eui-</code>. Colour tokens are redefined by each theme; size tokens by the density setting. Use them in your own CSS:
        <code>padding: var(--eui-space-4)</code>.
      </MessageStrip>
      <Grid columns={{ base: 1, md: 3 }} gap={4}>
        <Card title="Primary palette" flat headingLevel={2}>
          <Stack direction="horizontal" gap={2} wrap>
            {['primary', 'success', 'warning', 'error', 'background', 'surface', 'border', 'text', 'text-secondary'].map((c) => (
              <span key={c} title={`--eui-color-${c}`} className={styles.swatch} style={{ background: `var(--eui-color-${c})` }} />
            ))}
          </Stack>
        </Card>
        <Card title="Typography" flat headingLevel={2}>
          <span style={{ fontFamily: 'var(--eui-font-family)' }}>72 · Segoe UI · Arial · sans-serif</span>
        </Card>
        <Card title="Breakpoints" flat headingLevel={2}>
          <span>sm ≥ {breakpoints.sm}px · md ≥ {breakpoints.md}px · lg ≥ {breakpoints.lg}px</span>
        </Card>
      </Grid>
      {tokenGroups.map((group) => (
        <section key={group.id} className="docs-section" aria-labelledby={`tokens-${group.id}`}>
          <h2 id={`tokens-${group.id}`}>{group.title}</h2>
          <p className="docs-muted" style={{ margin: 0 }}>{group.description}</p>
          <TokenTable group={group} />
        </section>
      ))}
    </Page>
  );
}
