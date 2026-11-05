import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Card, EmptyState, Icon, Page, SearchField, Select, Stack, Table, Text, Tag, iconUsage, icons, type IconDefinition, type TableColumn } from '@enterprise-ui/react';
import { CodeBlock } from '../components/CodeBlock';
import styles from './Icons.module.css';

const architecture = `IconRegistry ── collections · definitions · aliases · providers      (no DOM, no React)
     │
IconResolver ── "edit" / "enterprise://edit" / alias / code point → definition + provider
     │
Providers ───── svg · font · fontawesome · material · your own      (own the drawing)
     │
<Icon> ──────── asks the resolver, hands the definition to the provider
     ▲
Button, IconButton, Menu, NavigationItem, Tabs, toolbars… (icon="…")`;

const basics = `import { Button, Icon, IconButton } from '@enterprise-ui/react';

<Icon name="edit" />                          // default collection; the name is type-checked
<Icon name="enterprise://edit" />             // the same icon, as a URI
<Icon name="modify" />                        // an alias of edit
<Icon name="edit" size="sm" color="var(--eui-color-primary)" />

// Components take the same identifiers
<Button icon="enterprise://save">Save</Button>
<IconButton icon="delete" label="Delete order" />
<Button icon={<Icon name="add" />}>Create</Button>   // elements still work`;

const sizes = `<Icon name="bell" size="xs" />   // 12px  --eui-icon-size-xs
<Icon name="bell" size="sm" />   // 14px  --eui-icon-size-sm
<Icon name="bell" size="md" />   // 16px  --eui-icon-size
<Icon name="bell" size="lg" />   // 20px  --eui-icon-size-lg
<Icon name="bell" size="xl" />   // 24px  --eui-icon-size-xl (default on its own)
<Icon name="bell" size="2xl" />  // 32px  --eui-icon-size-2xl
<Icon name="bell" size={18} />   // or any number / CSS length ("1em", "1.5rem")`;

const a11y = `// Decorative (no label): hidden from screen readers. Use when nearby text says the same.
<span><Icon name="accept" /> Approved</span>

// Meaningful on its own: give it a label; it becomes role="img" with that name.
<Icon name="warning" label="Overdue" color="var(--eui-color-warning)" />

// A tooltip is not an accessible name: add a label too if the icon carries meaning.
<Icon name="information" title="More details" label="Information" />

// Actions: use IconButton (focusable, keyboard-operable, labelled) rather than a clickable icon.
<IconButton icon="edit" label="Edit supplier" />`;

const registry = `import { icons } from '@enterprise-ui/react';

// One icon (string sources: SVG URL, SVG markup or a path; or a typed source object)
icons.register({ collection: 'my-app', name: 'truck', provider: 'svg', source: '/icons/truck.svg',
  aliases: ['delivery'], metadata: { category: 'logistics', keywords: ['shipping'] } });

// A whole collection, under its own URI scheme
icons.registerCollection({ name: 'my-app', provider: 'svg', icons: [
  { name: 'forklift', source: 'M2 12h8v2H2z…' },
  { name: 'pallet', source: '<svg viewBox="0 0 24 24"><path d="…"/></svg>' },
] });

// Aliases (also across collections)
icons.registerAlias('enterprise://modify', 'enterprise://edit');
icons.registerAlias('delivery-truck', 'my-app://truck');

// Look-ups
icons.get('enterprise://edit');      // normalized, read-only definition
icons.has('my-app://truck');         // true
icons.resolve('modify');             // { status: 'resolved', definition, provider }
icons.list({ collection: 'my-app' });
icons.listCollections();
icons.search('filter');              // ranked by name, alias, category and keywords
icons.setFallback('enterprise://sys-help');   // icon for unknown identifiers (default: none)`;

const typedNames = `// Let <Icon name> and icon props type-check your plain names (in any .d.ts or .ts file)
declare module '@enterprise-ui/react' {
  interface CustomIconNames { truck: true; forklift: true }
}
icons.setDefaultCollection('my-app'); // or always use URIs: "my-app://truck"`;

const fonts = `import { icons, fontAwesomeCollection, materialCollection } from '@enterprise-ui/react';

// Your app loads the font as usual (Font Awesome Free/Pro CSS, Material Symbols font).
icons.registerCollection(fontAwesomeCollection({ style: 'fa-solid', aliases: { edit: 'pen' } }));
icons.registerCollection(materialCollection({ className: 'material-symbols-outlined' }));

<Icon name="fontawesome://pen" />        // <i class="eui-icon fa-solid fa-pen">
<Icon name="fa://trash" />               // short scheme
<Icon name="material://arrow-back" />    // <span class="material-symbols-outlined">arrow_back</span>
<Button icon="material://edit">Edit</Button>

// An icon font glyph
icons.register({ collection: 'legacy', name: 'truck', provider: 'font',
  source: { type: 'glyph', glyph: '\\ue0a1', fontFamily: 'LegacyIcons' } });`;

const customProvider = `import { icons, type IconRenderProvider } from '@enterprise-ui/react';

// Draws icons from an image sprite. <Icon> and every component work unchanged.
const spriteProvider: IconRenderProvider = {
  canRender: (definition) => definition.provider === 'sprite',
  render: (definition, context) => (
    <span
      {...context.attributes}
      {...context.accessibility}
      className={\`\${context.className} sprite sprite-\${definition.name}\`}
      title={context.title}
      style={context.style}
    />
  ),
  // Optional, for assets that load asynchronously:
  // isReady: (definition) => …,  load: async (definition) => { … },
};

icons.addProvider('sprite', spriteProvider);
icons.registerCollection({ name: 'sprites', provider: 'sprite', icons: [{ name: 'truck', source: { type: 'custom', data: 1 } }] });

<Icon name="sprites://truck" />`;

const performance = `// The enterprise collection loads on first use. To avoid the first-paint placeholder
// (or for server rendering), preload it during start-up:
await icons.preload('enterprise');

// Search UIs: also load categories and keywords
await icons.preload('enterprise', { metadata: true });`;

const studio = `import { icons, iconUsage } from '@enterprise-ui/react';

await icons.preload(undefined, { metadata: true });
for (const definition of icons.search('filter')) {
  const usage = iconUsage(definition);
  usage.icon;        // <Icon name="filter" />
  usage.button;      // <Button icon="filter">Filter</Button>
  usage.iconButton;  // <IconButton icon="filter" label="Filter" />
}
icons.subscribe(() => { /* re-render when icons or collections change */ });`;

const addFile = `# 1. Add src/assets/icons/my-icon.svg (one 16×16 path, fill="currentColor").
#    Optional: data-code="e2f0" (font code point), data-rtl="flip" (mirror in right-to-left)
# 2. Update the IconName type (a unit test fails until you do):
npm run icons:names`;

const providerRows = [
  { id: 'svg', provider: 'svg', sources: 'SVG path, SVG markup (sanitized), SVG URL (fetched once, sanitized, cached)', output: '<svg> with currentColor' },
  { id: 'font', provider: 'font', sources: 'Icon-font glyph (+ font family or class)', output: '<span> with the glyph' },
  { id: 'fontawesome', provider: 'fontawesome', sources: 'Font Awesome icon name and style', output: '<i class="fa-solid fa-pen">' },
  { id: 'material', provider: 'material', sources: 'Material Symbols / Icons ligature', output: '<span class="material-symbols-outlined">edit</span>' },
];
const providerColumns: TableColumn<(typeof providerRows)[number]>[] = [
  { id: 'provider', header: 'Provider', cell: (r) => <code>{r.provider}</code> },
  { id: 'sources', header: 'Sources', cell: (r) => r.sources },
  { id: 'output', header: 'Renders', cell: (r) => <code>{r.output}</code> },
];

const hex = (code?: number) => (code ? `&#x${code.toString(16)};` : '');

function useIcons() {
  useSyncExternalStore(icons.subscribe.bind(icons), () => icons.getVersion());
  useEffect(() => { void icons.preload('enterprise', { metadata: true }); }, []);
}

/** The icon system guide and a browser for every registered icon. */
export function IconsPage() {
  useIcons();
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<IconDefinition | null>(null);
  const collections = icons.listCollections();
  const all = icons.list({ collection: collection || undefined });
  const categories = useMemo(() => [...new Set(all.map((d) => d.metadata.category).filter(Boolean) as string[])].sort(), [all]);
  const matches = (query.trim() ? icons.search(query, { collection: collection || undefined, limit: Infinity }) : all)
    .filter((d) => !category || d.metadata.category === category);
  const current = selected ?? icons.get('enterprise://edit') ?? null;
  const usage = current ? iconUsage(current) : null;

  return (
    <Page
      title="Icons"
      subtitle={`The icon system: a registry of icon collections, pluggable rendering providers and one Icon component. ${all.length || 704} icons ship in the enterprise collection.`}
      breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Foundations' }, { label: 'Icons' }]}
    >
      <div className="prose">
        <h2>How it works</h2>
        <p>
          Components never know how an icon is stored or drawn. They pass an <strong>identifier</strong> such as <code>edit</code>,{' '}
          <code>enterprise://edit</code> or <code>material://edit</code> to <code>Icon</code>. The <strong>resolver</strong> turns it into a
          definition from the <strong>registry</strong> (following aliases), and the definition’s <strong>provider</strong> draws it. Swapping
          SVGs for Font Awesome, Material or your own artwork changes registrations, not component code.
        </p>
      </div>
      <CodeBlock code={architecture} language="text" label="Architecture" />

      <div className="prose">
        <h2>Using icons</h2>
        <p>
          Plain names use the default collection, <code>enterprise</code> (the SAP icons in <code>src/assets/icons</code>, plus aliases such as{' '}
          <code>close</code>, <code>user</code> and <code>chevron-down</code>). <code>sap-icon://</code> URIs work too. Every component with an{' '}
          <code>icon</code> property (Button, IconButton, SplitButton, Menu items, NavigationItem, Tabs, List, Tree, CommandToolbar,
          FooterToolbar, the shell bar, Badge, Tag, EmptyState…) accepts an identifier or an element.
        </p>
      </div>
      <CodeBlock code={basics} label="Using icons" />

      <div className="prose">
        <h3>Size and colour</h3>
        <p>
          Semantic sizes map to design tokens. On its own an icon is 24&nbsp;px; inside buttons, inputs and menus the component sizes it
          (16&nbsp;px). Icons use the current text colour, so they follow themes and states; <code>color</code> overrides it.
        </p>
      </div>
      <CodeBlock code={sizes} label="Icon sizes" />

      <div className="prose">
        <h3>Accessibility</h3>
        <ul>
          <li>Without a <code>label</code> an icon is decorative and hidden from assistive technology; <code>decorative</code> forces this.</li>
          <li>With a <code>label</code> (or <code>aria-label</code>) it is announced as an image with that name.</li>
          <li><code>title</code> shows a tooltip but is not treated as an accessible name.</li>
          <li>Icons are not interactive. For actions use <code>IconButton</code> or a <code>Button</code>, which are focusable and keyboard-operable.</li>
          <li>Icons that point in a reading direction are mirrored in right-to-left layouts. Don’t convey meaning by colour alone.</li>
        </ul>
      </div>
      <CodeBlock code={a11y} label="Accessible icons" />

      <div className="prose">
        <h2>Registry, collections and aliases</h2>
        <p>
          <code>icons</code> is the shared registry. A <strong>collection</strong> groups icons under a URI scheme and a default provider;{' '}
          registering one adds a whole library without touching components. <strong>Aliases</strong> map another name (or another
          collection’s icon) to an icon and are resolved before rendering. Registering an existing name throws unless you pass{' '}
          <code>{'{ override: true }'}</code>. Definitions are normalized and read-only.
        </p>
      </div>
      <CodeBlock code={registry} label="Registry API" />
      <CodeBlock code={typedNames} label="Typed custom names" />

      <div className="prose">
        <h2>Providers</h2>
        <p>
          A provider owns how a kind of source is drawn. The built-in ones add no dependencies: the Font Awesome and Material providers render
          those libraries’ standard markup, using the fonts your app already loads (Free or Pro).
        </p>
      </div>
      <Table aria-label="Built-in providers" columns={providerColumns} data={providerRows} />
      <CodeBlock code={fonts} label="Icon fonts, Font Awesome and Material" />

      <div className="prose">
        <h3>Custom providers</h3>
        <p>
          A provider is an object with <code>canRender</code> and <code>render</code> (and optionally <code>isReady</code>/<code>load</code>
          for assets that load asynchronously). <code>render</code> receives the definition and a context with the class names, size,
          accessibility attributes, tooltip and ref decided by <code>Icon</code>.
        </p>
      </div>
      <CodeBlock code={customProvider} label="A custom provider" />

      <div className="prose">
        <h2>Performance and errors</h2>
        <ul>
          <li>Resolution results are cached until the registry changes; SVG markup and URLs are parsed or fetched once.</li>
          <li>The enterprise collection (about 100&nbsp;kB gzipped) is a separate chunk loaded the first time an icon is used by name; until then icons keep their space. Library components’ built-in icons (chevrons, close buttons…) are bundled individually and need no loading.</li>
          <li>Unknown icons never throw: they keep their space, log <code>[ENTERPRISE-UI] Unknown icon: enterprise://…</code> once in development, and use the fallback icon if you set one.</li>
        </ul>
      </div>
      <CodeBlock code={performance} label="Preloading" />

      <div className="prose">
        <h2>Design Studio integration</h2>
        <p>
          The Studio’s Icons panel is built on the same public API: <code>listCollections</code>, <code>list</code>, <code>search</code> and{' '}
          <code>subscribe</code>, with usage snippets generated from each definition by <code>iconUsage</code>. Collections you register appear there
          automatically.
        </p>
      </div>
      <CodeBlock code={studio} label="Building an icon explorer" />

      <div className="prose">
        <h3>Adding an icon to the library</h3>
      </div>
      <CodeBlock code={addFile} language="shell" label="Adding an icon file" />

      <div className="prose">
        <h2>Browse icons</h2>
        <p>Search by name, alias, keyword or code point, or filter by collection and category. Select an icon for its details and code.</p>
      </div>
      {current && usage && (
        <Card title={current.name} headingLevel={3} flat>
          <div className={styles.detail}>
            <div className={styles.preview}>
              {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => <Icon key={s} name={current.uri} size={s} />)}
            </div>
            <dl className={styles.facts}>
              <dt>URI</dt><dd><code>{current.uri}</code></dd>
              <dt>Collection</dt><dd>{current.collection}</dd>
              <dt>Provider</dt><dd>{current.provider}</dd>
              {current.aliases.length > 0 && <><dt>Aliases</dt><dd>{current.aliases.join(', ')}</dd></>}
              {current.metadata.codePoint !== undefined && <><dt>Code point</dt><dd><code>{hex(current.metadata.codePoint)}</code></dd></>}
              {current.metadata.category && <><dt>Category</dt><dd><Tag colorScheme={6} set={2}>{current.metadata.category}</Tag></dd></>}
            </dl>
          </div>
          <CodeBlock code={[usage.icon, usage.labelledIcon, usage.button, usage.iconButton].join('\n')} label="Usage" />
        </Card>
      )}
      <Stack direction="horizontal" gap={3} align="end" wrap>
        <div className={styles.search}>
          <SearchField aria-label="Filter icons" placeholder="Filter by name, alias, keyword or code point (e.g. barcode, arrow, e08d)" value={query} onChange={setQuery} />
        </div>
        <Select label="Collection" value={collection} onChange={(v) => setCollection(v ?? '')} options={[{ value: '', label: 'All collections' }, ...collections.map((c) => ({ value: c.name, label: c.label }))]} />
        <Select label="Category" value={category} onChange={(v) => setCategory(v ?? '')} options={[{ value: '', label: 'All categories' }, ...categories.map((g) => ({ value: g, label: g }))]} />
        <Text role="status" aria-live="polite" className={styles.count}>
          {matches.length === all.length ? `${all.length} icons` : `${matches.length} of ${all.length} icons`}
        </Text>
      </Stack>
      {matches.length === 0 ? (
        <EmptyState title="No icons match" description="Try another name, keyword or category." icon="search" />
      ) : (
        <ul className={styles.grid} aria-label="Icons">
          {matches.map((definition) => (
            <li key={definition.uri}>
              <button type="button" className={styles.tile} aria-pressed={current?.uri === definition.uri} title={[definition.uri, ...definition.aliases].join(', ')} onClick={() => setSelected(definition)}>
                <Icon name={definition.uri} size="xl" />
                <span className={styles.name}>{definition.name}</span>
                {definition.metadata.codePoint !== undefined && <span className={styles.code}>{hex(definition.metadata.codePoint)}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
