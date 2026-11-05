import { useMemo, useState } from 'react';
import { EmptyState, IconProvider, Page, SearchField, Select, Stack, Text, useToast } from '@enterprise-ui/react';
import iconMeta from '../../../src/assets/icons/SAP-icons.json';
import { CodeBlock } from '../components/CodeBlock';
import styles from './Icons.module.css';

interface IconInfo { name: string; code?: number; aliases: string[]; groups: string[]; tags: string[] }

const basics = `import { Icon } from '@enterprise-ui/react';

<Icon name="bell" />                                     // 24 px, current text colour
<Icon name="bell" size={16} color="var(--eui-color-primary)" />
<Icon name="bell" size="1em" />                          // scales with the surrounding text`;

const inComponents = `<Button icon={<Icon name="add" />}>Create</Button>
<IconButton icon={<Icon name="delete" />} label="Delete order" />
<Input label="Email" startAdornment={<Icon name="email" />} />
<NavigationItem id="home" label="Home" icon={<Icon name="home" />} href="/" />`;

const a11y = `// Decorative: the text next to it already says it all, so it is hidden from screen readers
<span><Icon name="accept" /> Approved</span>

// Informative: the icon is the only way the information is shown
<Icon name="warning2" label="Overdue" color="var(--eui-color-warning)" />

// An action: use IconButton, whose label is the button's name and tooltip
<IconButton icon={<Icon name="edit" />} label="Edit supplier" />`;

const runtime = `import { IconProvider } from '@enterprise-ui/react';

IconProvider.getIcon(row.statusIcon, { size: 16 });   // name from data
IconProvider.hasIcon(row.statusIcon);                 // false for unknown names
IconProvider.getIcon('sap-icon://bar-code');          // UI5-style URI
IconProvider.getIcon('&#xe08d;');                     // SAP icon font code point
IconProvider.getIconNames();                          // ['accelerated', 'accept', …]`;

const custom = `import { Icon, IconProvider } from '@enterprise-ui/react';

// The d attribute of one path in a 16×16 view box
IconProvider.registerIcon('company-logo', 'M8 1 15 5v6l-7 4-7-4V5z');

// Let <Icon name> accept the new name (in a .d.ts file or next to the call)
declare module '@enterprise-ui/react' {
  interface CustomIconNames { 'company-logo': true }
}

<Icon name="company-logo" label="Northwind" />`;

const addFile = `# 1. Add the file (one 16×16 path, fill="currentColor"):
#    src/assets/icons/my-icon.svg
#    Optional: data-code="e2f0" (font code point), data-rtl="flip" (mirror in right-to-left)
# 2. Update the IconName type:
npm run icons:names`;

/** One entry per icon (aliases folded in), with the groups and tags from SAP-icons.json. */
function buildIcons(): IconInfo[] {
  const meta = new Map<string, { groups: string[]; tags: string[]; names: string[] }>();
  for (const entry of Object.values(iconMeta as Record<string, { names: string[]; groups?: string[]; tags?: string[] }>)) {
    for (const n of entry.names) meta.set(n.toLowerCase(), { groups: entry.groups ?? [], tags: entry.tags ?? [], names: entry.names.map((x) => x.toLowerCase()) });
  }
  const all = IconProvider.getIconNames();
  const available = new Set(all);
  const seen = new Set<string>();
  const icons: IconInfo[] = [];
  for (const name of all) {
    if (seen.has(name)) continue;
    const m = meta.get(name);
    const primary = m?.names.find((n) => available.has(n)) ?? name;
    const aliases = (m?.names ?? [name]).filter((n) => n !== primary && available.has(n));
    [primary, ...aliases].forEach((n) => seen.add(n));
    icons.push({ name: primary, code: IconProvider.getCodePoint(primary), aliases, groups: m?.groups ?? [], tags: m?.tags ?? [] });
  }
  return icons.sort((a, b) => a.name.localeCompare(b.name));
}

const hex = (code?: number) => (code ? `&#x${code.toString(16)};` : '');

/** Browse and filter every icon IconProvider can return; select one to copy its usage. */
export function IconsPage() {
  const toast = useToast();
  const icons = useMemo(buildIcons, []);
  const groups = useMemo(() => [...new Set(icons.flatMap((i) => i.groups))].sort(), [icons]);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = icons.filter((icon) => {
    if (group && !icon.groups.includes(group)) return false;
    const haystack = [icon.name, ...icon.aliases, ...icon.tags, hex(icon.code)].join(' ').toLowerCase();
    // "barcode" also matches "bar-code" and the tag "bar code".
    const compact = haystack.replace(/[\s-]+/g, '');
    return terms.every((t) => haystack.includes(t) || compact.includes(t.replace(/-/g, '')));
  });

  const copy = async (icon: IconInfo) => {
    const snippet = `<Icon name="${icon.name}" />`;
    try {
      await navigator.clipboard.writeText(snippet);
      toast.show({ title: 'Copied', description: snippet, tone: 'success' });
    } catch {
      toast.show({ title: 'Could not copy', description: snippet, tone: 'warning' });
    }
  };

  return (
    <Page
      title="Icons"
      subtitle={`How to use the ${icons.length} SAP icons, and a searchable list of all of them.`}
      breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Foundations' }, { label: 'Icons' }]}
    >
      <div className="prose">
        <h2>Using icons</h2>
        <h3>Show an icon</h3>
        <p>
          <code>Icon</code> renders a bare <code>&lt;svg&gt;</code> from the SAP icon set. The <code>name</code> is autocompleted and
          type-checked, so a misspelled name fails to compile. Icons are 24&nbsp;px by default and use the current text colour; set{' '}
          <code>size</code> and <code>color</code> to change them.
        </p>
      </div>
      <CodeBlock code={basics} label="Showing an icon" />

      <div className="prose">
        <h3>Icons in components</h3>
        <p>
          Pass an <code>Icon</code> to any <code>icon</code>, <code>startAdornment</code> or similar property. Buttons, inputs, menus and
          navigation size the icon for you (16&nbsp;px from <code>--eui-icon-size</code>; side navigation uses 20&nbsp;px), so leave out <code>size</code> there.
        </p>
      </div>
      <CodeBlock code={inComponents} label="Icons in components" />

      <div className="prose">
        <h3>Accessibility</h3>
        <ul>
          <li>Without a <code>label</code>, an icon is decorative and hidden from screen readers. Use this when nearby text says the same thing.</li>
          <li>Give an icon a <code>label</code> when it carries information on its own. It is then announced as an image with that name.</li>
          <li>For actions, use <code>IconButton</code> with a <code>label</code> rather than a clickable icon. Don’t rely on an icon’s colour alone to convey meaning.</li>
          <li>Icons that point in a reading direction (back, next, indent…) are mirrored automatically in right-to-left layouts.</li>
        </ul>
      </div>
      <CodeBlock code={a11y} label="Accessible icons" />

      <div className="prose">
        <h3>Names known only at runtime</h3>
        <p>
          When the icon name comes from data, use the <code>IconProvider</code> class. It also accepts UI5-style{' '}
          <code>sap-icon://</code> URIs and SAP icon font code points. An unknown name returns the <code>fallback</code> icon; check with{' '}
          <code>hasIcon</code> first if that matters.
        </p>
      </div>
      <CodeBlock code={runtime} label="IconProvider" />

      <div className="prose">
        <h3>Bundle size</h3>
        <p>
          Library components bundle only the icons they use. The first <code>&lt;Icon&gt;</code> or <code>IconProvider</code> call in your
          app adds the whole set, about 100&nbsp;kB gzipped, because a name can be any of the {icons.length} icons. That is a one-off cost: further
          icons are free. If bundle size is critical and you only need a few icons, put SVGs in your own code instead.
        </p>
        <h3>Custom icons</h3>
        <p>
          Register product-specific icons at start-up with <code>IconProvider.registerIcon</code>, and extend the{' '}
          <code>CustomIconNames</code> interface so <code>&lt;Icon name&gt;</code> accepts them.
        </p>
      </div>
      <CodeBlock code={custom} label="Custom icons" />

      <div className="prose">
        <h3>Adding an icon to the library</h3>
        <p>
          Icons live as SVG files in <code>src/assets/icons</code>. To add one to the library itself, drop the file there and regenerate
          the <code>IconName</code> type; a unit test fails until you do.
        </p>
      </div>
      <CodeBlock code={addFile} language="shell" label="Adding an icon file" />

      <div className="prose">
        <h2>Browse icons</h2>
        <p>Search by name, alias, tag or code point, or filter by group. Select an icon to copy its code.</p>
      </div>
      <Stack direction="horizontal" gap={3} align="end" wrap>
        <div className={styles.search}>
          <SearchField aria-label="Filter icons" placeholder="Filter by name, tag or code point (e.g. barcode, arrow, e08d)" value={query} onChange={setQuery} />
        </div>
        <Select
          label="Group"
          value={group}
          onChange={(v) => setGroup(v ?? '')}
          options={[{ value: '', label: 'All groups' }, ...groups.map((g) => ({ value: g, label: g }))]}
        />
        <Text role="status" aria-live="polite" className={styles.count}>
          {shown.length === icons.length ? `${icons.length} icons` : `${shown.length} of ${icons.length} icons`}
        </Text>
      </Stack>
      {shown.length === 0 ? (
        <EmptyState title="No icons match" description="Try another name, tag or group." icon={IconProvider.getIcon('search')} />
      ) : (
        <ul className={styles.grid} aria-label="Icons">
          {shown.map((icon) => (
            <li key={icon.name}>
              <button
                type="button"
                className={styles.tile}
                title={[icon.name, ...icon.aliases].join(', ')}
                onClick={() => void copy(icon)}
              >
                {IconProvider.getIcon(icon.name, { size: 24 })}
                <span className={styles.name}>{icon.name}</span>
                {icon.code !== undefined && <span className={styles.code}>{hex(icon.code)}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
