import { useMemo, useState } from 'react';
import { EmptyState, IconProvider, Page, SearchField, Select, Stack, Text, useToast } from '@enterprise-ui/react';
import iconMeta from '../../../src/assets/icons/SAP-icons.json';
import { CodeBlock } from '../components/CodeBlock';
import styles from './Icons.module.css';

interface IconInfo { name: string; code?: number; aliases: string[]; groups: string[]; tags: string[] }

const usage = `import { Button, Icon, IconProvider } from '@enterprise-ui/react';

// A bare <svg>. The name is autocompleted and type-checked.
<Icon name="bell" />
<Icon name="bell" size={20} color="var(--eui-color-primary)" label="Notifications" />
<Button icon={<Icon name="add" />}>Create</Button>

// Names known only at runtime, sap-icon:// URIs and font code points
IconProvider.getIcon(row.iconName);
IconProvider.getIcon('sap-icon://bar-code');
IconProvider.getIcon('&#xe08d;');

// Every available name
IconProvider.getIconNames(); // ['accelerated', 'accept', …]`;

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
      subtitle={`${icons.length} SAP icons from src/assets/icons, rendered with <Icon name="…" />. Search by name, alias, tag or code point, or filter by group. Select an icon to copy its code.`}
      breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Foundations' }, { label: 'Icons' }]}
    >
      <CodeBlock code={usage} label="Usage" />
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
