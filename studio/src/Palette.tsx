import { useMemo, useState } from 'react';
import { Button, SearchField, Text } from '@enterprise-ui/react';
import { Plus } from 'lucide-react';
import { catalog, categories } from './model/catalog';
import { COMPONENT_MIME } from './Canvas';
import styles from './Studio.module.css';

export interface PaletteProps {
  /** Inserts the component at the current selection (keyboard alternative to dragging). */
  onInsert: (name: string) => void;
}

/** Components from the catalog. Drag onto the canvas, or press Enter to insert at the selection. */
export function Palette({ onInsert }: PaletteProps) {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = catalog.filter((c) => !q || c.name.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q));
    return categories.map((cat) => ({ ...cat, items: items.filter((i) => i.category === cat.id) })).filter((g) => g.items.length);
  }, [query]);

  return (
    <div className={styles.palette}>
      <SearchField label="Search components" hideLabel size="sm" value={query} onChange={setQuery} placeholder="Search components" />
      <div className={styles.paletteList}>
        {groups.length === 0 && <Text tone="secondary" size="sm">No components match “{query}”.</Text>}
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`palette-${group.id}`}>
            <h3 id={`palette-${group.id}`} className={styles.groupHeading}>{group.id}</h3>
            <ul className={styles.paletteItems}>
              {group.items.map((item) => (
                <li key={item.name}>
                  <Button
                    size="sm"
                    variant="tertiary"
                    icon={<Plus />}
                    className={styles.paletteItem}
                    draggable
                    title={item.summary}
                    aria-label={`Insert ${item.name}`}
                    data-palette={item.name}
                    onDragStart={(event) => { event.dataTransfer.setData(COMPONENT_MIME, item.name); event.dataTransfer.effectAllowed = 'copy'; }}
                    onClick={() => onInsert(item.name)}
                  >
                    {item.name}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
