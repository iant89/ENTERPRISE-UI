/**
 * Studio Icon Explorer: browses every registered icon collection through the public icon API
 * (listCollections, list, search, subscribe) and shows usage generated from each definition.
 * Loaded lazily, so the icon collection stays out of the Studio's initial download.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button, Icon, SearchField, Select, iconUsage, icons, type IconDefinition } from '@enterprise-ui/react';
import styles from './IconExplorer.module.css';

const LIMIT = 300;

export default function IconExplorer() {
  useSyncExternalStore(icons.subscribe.bind(icons), () => icons.getVersion());
  useEffect(() => { void icons.preload(undefined, { metadata: true }); }, []);
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState('');
  const [selected, setSelected] = useState<IconDefinition | null>(null);
  const [copied, setCopied] = useState('');
  const scope = collection || undefined;
  const results = query.trim() ? icons.search(query, { collection: scope, limit: LIMIT }) : icons.list({ collection: scope }).slice(0, LIMIT);
  const total = icons.list({ collection: scope }).length;
  const usage = selected ? iconUsage(selected, icons.getDefaultCollection()) : null;

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(''), 1500); } catch { /* clipboard unavailable */ }
  };

  return (
    <div className={styles.root} data-testid="icon-explorer">
      <h2 className={styles.title}>Icons</h2>
      <SearchField size="sm" aria-label="Search icons" placeholder="Search icons" value={query} onChange={setQuery} />
      <Select size="sm" label="Collection" hideLabel value={collection} onChange={(v) => setCollection(v ?? '')}
        options={[{ value: '', label: 'All collections' }, ...icons.listCollections().map((c) => ({ value: c.name, label: `${c.label} (${c.size})` }))]} />
      <p className={styles.count} role="status" aria-live="polite">{results.length < total && !query ? `First ${results.length} of ${total}` : `${results.length} icons`}</p>
      {selected && usage && (
        <section className={styles.detail} aria-label={`${selected.name} details`}>
          <div className={styles.detailHead}>
            <Icon name={selected.uri} size="2xl" />
            <div>
              <strong>{selected.name}</strong>
              <div className={styles.meta}>{selected.uri} · {selected.provider}{selected.aliases.length ? ` · aka ${selected.aliases.join(', ')}` : ''}</div>
            </div>
          </div>
          {[usage.icon, usage.button, usage.iconButton].map((snippet) => (
            <div key={snippet} className={styles.snippet}>
              <code>{snippet}</code>
              <Button size="sm" variant="tertiary" onClick={() => void copy(snippet)}>{copied === snippet ? 'Copied' : 'Copy'}</Button>
            </div>
          ))}
        </section>
      )}
      <ul className={styles.grid} aria-label="Icons">
        {results.map((d) => (
          <li key={d.uri}>
            <button type="button" className={styles.tile} aria-pressed={selected?.uri === d.uri} title={d.uri} onClick={() => setSelected(d)}>
              <Icon name={d.uri} size="lg" />
              <span>{d.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
